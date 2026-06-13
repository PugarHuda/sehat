// Sehat desktop server: mobile web UI on the LAN + voice + Indonesian mode,
// optionally doubling as a QVAC P2P provider.
//
//   node src/server.js             -> HTTPS (if certs/sehat.pfx exists) else HTTP
//   SEHAT_P2P=1 node src/server.js -> also start the P2P provider
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { readFileSync, readdirSync, existsSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";
import { tmpdir, networkInterfaces } from "node:os";
import { startQVACProvider, loadModel, transcribe, PARAKEET_CTC_0_6B_Q8_0 } from "@qvac/sdk";
import { SehatEngine } from "./engine.js";
import { SehatAgent } from "./agent.js";
import { Translator } from "./translator.js";
import { loadFamily, computeAlerts, loadDocs, computeReminders, emergencyCard } from "./health-data.js";
import { textToSpeech, TTS_EN_SUPERTONIC_Q8_0 } from "@qvac/sdk";
import QRCode from "qrcode";
import { wavHeader, int16ToBuffer } from "./audio-utils.js";

const PORT = Number(process.env.PORT ?? 8787);
const engine = new SehatEngine();

console.log("Starting Sehat engine (QVAC MedPsy-4B GPU + EmbeddingGemma)...");
await engine.start();

// Seed the workspace from the sample docs if it's empty (first run).
const probe = await engine.ask("vaccination", { topK: 1, onToken: () => {} }).catch(() => null);
if (!probe || probe.hits.length === 0) {
  console.log("Workspace empty — ingesting sample documents...");
  for (const f of readdirSync("data/sample").filter((x) => x.endsWith(".txt"))) {
    await engine.ingestDocument({
      source: basename(f),
      text: readFileSync(join("data/sample", f), "utf8"),
    });
  }
}

// Lazy singletons for optional capabilities.
let translator = null;
async function getTranslator() {
  if (!translator) {
    console.log("Loading Bergamot ID<->EN translator...");
    translator = new Translator();
    await translator.start();
  }
  return translator;
}

let sttId = null;
async function getStt() {
  if (!sttId) {
    console.log("Loading Parakeet STT...");
    sttId = await loadModel({ modelSrc: PARAKEET_CTC_0_6B_Q8_0, modelType: "parakeet" });
  }
  return sttId;
}

let ttsId = null;
async function getTts() {
  if (!ttsId) {
    console.log("Loading Supertonic TTS...");
    ttsId = await loadModel({
      modelSrc: TTS_EN_SUPERTONIC_Q8_0.src ?? TTS_EN_SUPERTONIC_Q8_0,
      modelType: "tts",
      modelConfig: { ttsEngine: "supertonic", language: "en", voice: "F1", ttsSpeed: 1.0 },
    });
  }
  return ttsId;
}

let agent = null;
async function getAgent() {
  if (!agent) {
    console.log("Loading Qwen3 orchestrator for agent mode...");
    agent = new SehatAgent({ engine }); // shares the already-loaded MedGemma
    await agent.start();
  }
  return agent;
}

// One inference at a time; later requests queue up.
let queue = Promise.resolve();

const html = readFileSync("public/index.html");
const STATIC = {
  "/manifest.json": ["application/manifest+json", readFileSync("public/manifest.json")],
  "/sw.js": ["text/javascript", readFileSync("public/sw.js")],
  "/icon-192.png": ["image/png", readFileSync("public/icon-192.png")],
  "/icon-512.png": ["image/png", readFileSync("public/icon-512.png")],
};

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  if (req.method === "GET" && STATIC[url.pathname]) {
    const [type, body] = STATIC[url.pathname];
    res.writeHead(200, { "content-type": type });
    return res.end(body);
  }

  if (req.method === "GET" && url.pathname === "/api/ask") {
    const question = (url.searchParams.get("q") ?? "").slice(0, 2000).trim();
    const lang = url.searchParams.get("lang") === "id" ? "id" : "en";
    if (!question) {
      res.writeHead(400);
      return res.end("missing q");
    }
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });
    const send = (event, data) =>
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

    const mode = url.searchParams.get("mode") === "agent" ? "agent" : "chat";

    queue = queue
      .then(async () => {
        if (mode === "agent") {
          const ag = await getAgent();
          const t0 = performance.now();
          const { answer, toolTrace } = await ag.run(question, {
            onToken: (tok) => send("token", tok),
          });
          send("done", {
            stats: { ttftMs: null, durationMs: Math.round(performance.now() - t0), tokenCount: answer.length >> 2 },
            sources: toolTrace.map((t) => `🔧 ${t.tool}`),
          });
          return;
        }
        let asked = question;
        if (lang === "id") {
          const tr = await getTranslator();
          asked = (await tr.toEnglish(question)).trim();
          send("token", `🔁 ${asked}\n\n`);
        }
        const { answer, hits, stats } = await engine.ask(asked, {
          onToken: lang === "en" ? (tok) => send("token", tok) : undefined,
        });
        if (lang === "id") {
          const tr = await getTranslator();
          const indo = await tr.toIndonesian(answer.replace(/\[doc:[^\]]*\]/g, "").trim());
          send("token", indo.trim());
        }
        const sources = [
          ...new Set(
            hits.map((h) => /\[source: ([^\]]+)\]/.exec(h.content)?.[1]).filter(Boolean)
          ),
        ];
        send("done", { stats, sources });

        // Auto-capture: if the message REPORTED new measurements, save them as a
        // record (real-time) and tell the UI. Disable with &autosave=0.
        if (url.searchParams.get("autosave") !== "0") {
          try {
            const meName = (url.searchParams.get("me") || "You").slice(0, 40);
            const rec = await engine.extractRecord(question, new Date().toISOString().slice(0, 10), meName);
            if (rec) {
              const safe = `chat-${rec.member}-${Date.now()}`.replace(/[^a-z0-9._-]+/gi, "-");
              mkdirSync("data/records", { recursive: true });
              writeFileSync(join("data/records", `${safe}.txt`), rec.docText);
              await engine.ingestDocument({ source: safe, text: rec.docText });
              send("saved", { summary: rec.summary, member: rec.member });
            }
          } catch { /* extraction is best-effort */ }
        }
      })
      .catch((err) => send("error", String(err?.message ?? err)))
      .finally(() => res.end());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/voice") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", async () => {
      const wav = Buffer.concat(chunks);
      if (wav.length < 1000) {
        res.writeHead(400, { "content-type": "application/json" });
        return res.end(JSON.stringify({ error: "audio too short" }));
      }
      const tmp = join(tmpdir(), `sehat-voice-${Date.now()}.wav`);
      writeFileSync(tmp, wav);
      try {
        const modelId = await getStt();
        const heard = await transcribe({ modelId, audioChunk: tmp });
        const text = (typeof heard === "string" ? heard : heard.text ?? "").trim();
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ text }));
      } catch (err) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: String(err?.message ?? err) }));
      } finally {
        try { unlinkSync(tmp); } catch {}
      }
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/info") {
    // Prefer real home-LAN IPs (192.168.x / 10.x) over virtual adapters (172.x Hyper-V/WSL).
    const score = (ip) => (ip.startsWith("192.168.") ? 0 : ip.startsWith("10.") ? 1 : 2);
    const httpUrls = lanIps().sort((a, b) => score(a) - score(b)).map((ip) => `http://${ip}:${HTTP_PORT}`);
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ joinUrls: httpUrls, httpsPort: PORT, httpPort: HTTP_PORT }));
  }

  if (req.method === "GET" && url.pathname === "/api/family") {
    const members = loadFamily();
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify(members));
  }

  if (req.method === "GET" && url.pathname === "/api/reminders") {
    const today = new Date().toISOString().slice(0, 10);
    const reminders = computeReminders(loadDocs(), today);
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify(reminders));
  }

  if (req.method === "GET" && url.pathname === "/api/qr") {
    const name = url.searchParams.get("member") ?? "";
    const card = emergencyCard(loadFamily(), name);
    if (!card) { res.writeHead(404); return res.end("unknown member"); }
    const lines = [
      `SEHAT EMERGENCY CARD`,
      `Name: ${card.name}`,
      card.allergies.length ? `Allergies: ${card.allergies.join("; ")}` : `Allergies: none on record`,
      card.conditions.length ? `Conditions: ${card.conditions.join("; ")}` : null,
      card.medications.length ? `Medications: ${card.medications.join("; ")}` : null,
      card.latest.bp ? `Recent BP: ${card.latest.bp} mmHg` : null,
      card.latest.glucose ? `Recent glucose: ${card.latest.glucose} mg/dL` : null,
      `(Generated on-device by Sehat — educational, not a medical record)`,
    ].filter(Boolean);
    const svg = await QRCode.toString(lines.join("\n"), { type: "svg", margin: 1, width: 320 });
    res.writeHead(200, { "content-type": "image/svg+xml" });
    return res.end(svg);
  }

  if (req.method === "GET" && url.pathname === "/api/export") {
    const name = url.searchParams.get("member") ?? "";
    const members = loadFamily();
    const m = members[name];
    if (!m) { res.writeHead(404); return res.end("unknown member"); }
    const today = new Date().toISOString().slice(0, 10);
    const reminders = computeReminders(loadDocs(), today).filter((r) => r.member === name);
    const VL = { glucose: "Fasting glucose (mg/dL)", hba1c: "HbA1c (%)", ldl: "LDL (mg/dL)", chol: "Total cholesterol (mg/dL)", sys: "Systolic BP (mmHg)" };
    const md = [
      `# Sehat health summary — ${name}`,
      `_Generated on-device ${today}. Educational summary, not a medical record._`,
      ``,
      m.allergies.length ? `**Allergies:** ${m.allergies.join("; ")}` : `**Allergies:** none on record`,
      m.conditions.length ? `**Conditions:** ${m.conditions.join("; ")}` : null,
      m.meds.length ? `**Medications:** ${m.meds.join("; ")}` : null,
      ``,
      `## Vital trends`,
      ...Object.entries(m.series).map(([k, s]) =>
        `- **${VL[k] ?? k}:** ${s.map((p) => `${p.date}: ${p.value}`).join("  →  ")}`),
      ``,
      `## Upcoming`,
      reminders.length ? reminders.map((r) => `- ${r.due} — ${r.what}${r.overdue ? " (overdue)" : ""}`).join("\n") : "- none",
    ].filter((x) => x !== null).join("\n");
    res.writeHead(200, {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="sehat-${name}-${today}.md"`,
    });
    return res.end(md);
  }

  if (req.method === "GET" && url.pathname === "/api/speak") {
    const text = (url.searchParams.get("text") ?? "").slice(0, 800);
    if (!text) { res.writeHead(400); return res.end("missing text"); }
    queue = queue
      .then(async () => {
        const id = await getTts();
        const out = textToSpeech({ modelId: id, text, inputType: "text", stream: false });
        const samples = await out.buffer;
        const data = int16ToBuffer(samples);
        res.writeHead(200, { "content-type": "audio/wav" });
        res.end(Buffer.concat([wavHeader(data.length, 44100), data]));
      })
      .catch((err) => { res.writeHead(500); res.end(String(err?.message ?? err)); });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/import-csv") {
    const member = (url.searchParams.get("member") || "").slice(0, 40);
    const relation = url.searchParams.get("relation") === "self" ? "self" : "family";
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        if (!member) throw new Error("member query param required");
        // CSV rows: date,metric,value (header optional). metric in glucose|hba1c|ldl|chol|bp
        const map = { glucose: "Fasting glucose", hba1c: "HbA1c", ldl: "LDL", chol: "Total cholesterol", bp: "Blood pressure" };
        const unit = { glucose: "mg/dL", hba1c: "%", ldl: "mg/dL", chol: "mg/dL", bp: "mmHg" };
        const byDate = {};
        for (const line of body.split(/\r?\n/)) {
          const parts = line.split(",").map((s) => s.trim());
          if (parts.length < 3) continue;
          const [date, metricRaw, value] = parts;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue; // skips header
          const metric = metricRaw.toLowerCase();
          if (!map[metric]) continue;
          (byDate[date] ??= []).push(`${map[metric]}: ${value} ${unit[metric]}`);
        }
        const dates = Object.keys(byDate);
        if (!dates.length) throw new Error("no valid rows (expected: date,metric,value)");
        let count = 0;
        for (const date of dates) {
          const docText = [`Patient: ${member}`, `Date: ${date}`, relation === "self" ? "Relation: self" : null, ...byDate[date]].filter(Boolean).join("\n");
          const safe = `csv-${member}-${date}`.replace(/[^a-z0-9._-]+/gi, "-");
          mkdirSync("data/records", { recursive: true });
          writeFileSync(join("data/records", `${safe}.txt`), docText);
          await engine.ingestDocument({ source: safe, text: docText });
          count++;
        }
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, imported: count, dates }));
      } catch (err) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(err?.message ?? err) }));
      }
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/alerts") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
    const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    queue = queue
      .then(async () => {
        const members = loadFamily();
        const alerts = computeAlerts(members);
        send("alerts", alerts); // deterministic, instant — UI renders cards/sparklines now
        if (alerts.length === 0) { send("briefing", "No alerts — all tracked vitals are within range. 🎉"); return; }
        // Proactive agent step: MedPsy writes a short plain-language briefing.
        const summary = alerts
          .map((a) => `${a.member}: ${a.metric} ${a.value}${a.unit} (${a.severity}${a.rising ? ", rising" : ""})`)
          .join("; ");
        const prompt =
          `You are Sehat, proactively reviewing a family's health records (education only, not diagnosis). ` +
          `These flags were detected: ${summary}. Write a calm 2-3 sentence briefing for the family: ` +
          `what stands out, and one gentle, general next step. Do not diagnose; suggest seeing a doctor where appropriate.`;
        const answer = await engine.complete(prompt);
        send("briefing", answer.trim());
      })
      .catch((err) => send("error", String(err?.message ?? err)))
      .finally(() => res.end());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/ingest") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { source, text, member, relation } = JSON.parse(body);
        if (!source || !text) throw new Error("source and text required");
        // If a member name is given, ensure the doc is attributable on the
        // dashboard (it parses "Patient: <name>").
        let body2 = String(text).slice(0, 50_000);
        if (member && !/Patient:/i.test(body2)) body2 = `Patient: ${String(member).slice(0, 40)}\n${body2}`;
        if (relation === "self" && !/Relation:/i.test(body2)) body2 = `Relation: self\n${body2}`;
        const safe = String(source).slice(0, 80).replace(/[^a-z0-9._-]+/gi, "-");
        // Persist to data/records so the dashboard + chat both see it (real-time).
        mkdirSync("data/records", { recursive: true });
        writeFileSync(join("data/records", safe.endsWith(".txt") ? safe : `${safe}.txt`), body2);
        // Index into the RAG workspace for Q&A.
        await engine.ingestDocument({ source: safe, text: body2 });
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(err?.message ?? err) }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("not found");
}

const PFX = "certs/sehat.pfx";
const useTls = existsSync(PFX) && process.env.SEHAT_HTTP !== "1";
const HTTP_PORT = PORT + 1; // plain-HTTP fallback (8788): no cert prompt; mic disabled

const lanIps = () =>
  Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal)
    .map((i) => i.address);

if (useTls) {
  // Primary HTTPS (enables the phone mic) ...
  createHttpsServer({ pfx: readFileSync(PFX), passphrase: "sehat-lan" }, handler).listen(PORT, "0.0.0.0");
  // ... plus a plain-HTTP fallback on PORT+1 for phones that reject the
  // self-signed cert. Chat/dashboard/alerts work over it; only mic needs HTTPS.
  createHttpServer(handler).listen(HTTP_PORT, "0.0.0.0");
} else {
  createHttpServer(handler).listen(PORT, "0.0.0.0");
}

console.log("\n=== Sehat is up ===");
for (const ip of lanIps()) {
  if (useTls) {
    console.log(`Phone (full, mic):   https://${ip}:${PORT}   (accept the cert warning once)`);
    console.log(`Phone (easy, no mic): http://${ip}:${HTTP_PORT}`);
  } else {
    console.log(`Open on your phone:  http://${ip}:${PORT}`);
  }
}
console.log(`Local:               ${useTls ? "https" : "http"}://localhost:${PORT}`);

if (process.env.SEHAT_P2P === "1") {
  startQVACProvider({}).then((p) => { if (p.success) console.log(`\nP2P provider public key:\n${p.publicKey}`); });
}
