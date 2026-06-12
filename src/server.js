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
import { Translator } from "./translator.js";

const PORT = Number(process.env.PORT ?? 8787);
const engine = new SehatEngine();

console.log("Starting Sehat engine (MedGemma 4B GPU + EmbeddingGemma)...");
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

// One inference at a time; later requests queue up.
let queue = Promise.resolve();

const html = readFileSync("public/index.html");

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
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

    queue = queue
      .then(async () => {
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

  if (req.method === "POST" && url.pathname === "/api/ingest") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { source, text } = JSON.parse(body);
        if (!source || !text) throw new Error("source and text required");
        await engine.ingestDocument({ source: String(source).slice(0, 100), text: String(text).slice(0, 50_000) });
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
const useTls = existsSync(PFX);
const server = useTls
  ? createHttpsServer({ pfx: readFileSync(PFX), passphrase: "sehat-lan" }, handler)
  : createHttpServer(handler);
const proto = useTls ? "https" : "http";

server.listen(PORT, "0.0.0.0", async () => {
  const ips = Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal)
    .map((i) => i.address);
  console.log("\n=== Sehat is up ===");
  for (const ip of ips) console.log(`Open on your phone:  ${proto}://${ip}:${PORT}`);
  console.log(`Local:               ${proto}://localhost:${PORT}`);
  if (useTls)
    console.log("(self-signed cert: the phone shows a warning once — Advanced > Proceed)");

  if (process.env.SEHAT_P2P === "1") {
    const p = await startQVACProvider({});
    if (p.success) console.log(`\nP2P provider public key:\n${p.publicKey}`);
  }
});
