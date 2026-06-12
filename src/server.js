// MedNest desktop server: hosts the mobile web UI on the LAN and (optionally)
// doubles as a QVAC P2P provider. The Redmi phone opens http://<desktop-ip>:8787.
//
//   node src/server.js            -> UI server only
//   MEDNEST_P2P=1 node src/server.js -> UI server + P2P provider
import { createServer } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { networkInterfaces } from "node:os";
import { startQVACProvider } from "@qvac/sdk";
import { MedNestEngine } from "./engine.js";

const PORT = Number(process.env.PORT ?? 8787);
const engine = new MedNestEngine();

console.log("Starting MedNest engine (MedGemma 4B GPU + EmbeddingGemma)...");
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

// One inference at a time; later requests queue up.
let queue = Promise.resolve();

const html = readFileSync("public/index.html");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  if (req.method === "GET" && url.pathname === "/api/ask") {
    const question = (url.searchParams.get("q") ?? "").slice(0, 2000).trim();
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
        const { hits, stats } = await engine.ask(question, {
          onToken: (tok) => send("token", tok),
        });
        const sources = [
          ...new Set(
            hits
              .map((h) => /\[source: ([^\]]+)\]/.exec(h.content)?.[1])
              .filter(Boolean)
          ),
        ];
        send("done", { stats, sources });
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
});

server.listen(PORT, "0.0.0.0", async () => {
  const ips = Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal)
    .map((i) => i.address);
  console.log("\n=== MedNest is up ===");
  for (const ip of ips) console.log(`Open on your phone:  http://${ip}:${PORT}`);
  console.log(`Local:               http://localhost:${PORT}`);

  if (process.env.MEDNEST_P2P === "1") {
    const p = await startQVACProvider({});
    if (p.success) console.log(`\nP2P provider public key:\n${p.publicKey}`);
  }
});
