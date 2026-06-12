// M2 demo: ingest the synthetic family health documents, then answer
// questions over them with MedGemma — fully local, with audit logging.
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { MedNestEngine } from "./engine.js";

const engine = new MedNestEngine();
console.log("Starting MedNest engine (MedGemma 4B + EmbeddingGemma 300M)...");
await engine.start();

const sampleDir = "data/sample";
for (const file of readdirSync(sampleDir).filter((f) => f.endsWith(".txt"))) {
  process.stdout.write(`Ingesting ${file}... `);
  await engine.ingestDocument({
    source: basename(file),
    text: readFileSync(join(sampleDir, file), "utf8"),
  });
  console.log("ok");
}

const questions = [
  "How has Budi's blood sugar changed between September 2025 and March 2026, and what did the doctor plan about it?",
  "What medication does Sari take, and what should she watch out for?",
  "Which vaccination is Rina still due for?",
];

for (const q of questions) {
  console.log(`\n\n=== Q: ${q}\n`);
  const { stats } = await engine.ask(q, {
    onToken: (t) => process.stdout.write(t),
  });
  console.log(
    `\n[search ${stats.searchMs} ms | TTFT ${stats.ttftMs} ms | ` +
      `${stats.tokenCount} tokens | ${(stats.tokenCount / (stats.durationMs / 1000)).toFixed(1)} tok/s]`
  );
}

await engine.stop();
console.log("\nDone. Audit log: artifacts/audit-log.jsonl");
process.exit(0);
