// OCR a photo of a lab report and ingest the extracted text into the
// family RAG workspace, then verify with a follow-up question.
//
//   node src/ocr-ingest.js [imagePath]
import { loadModel, unloadModel, ocr, OCR_LATIN_RECOGNIZER_1 } from "@qvac/sdk";
import { basename } from "node:path";
import { SehatEngine } from "./engine.js";
import { AuditLogger } from "./audit-logger.js";

const imagePath = process.argv[2] ?? "data/images/lab-results-budi-2026-06-photo.png";
const log = new AuditLogger("artifacts/audit-log.jsonl");

console.log("Loading OCR model...");
let t = performance.now();
const ocrId = await loadModel({
  modelSrc: OCR_LATIN_RECOGNIZER_1,
  modelType: "ocr",
  modelConfig: { langList: ["en"], useGPU: true, recognizerBatchSize: 1 },
});
log.modelLoad({
  modelSrc: "OCR_LATIN_RECOGNIZER_1",
  modelType: "ocr",
  modelId: ocrId,
  durationMs: Math.round(performance.now() - t),
});

console.log(`Running OCR on ${imagePath}...`);
t = performance.now();
const { blocks } = ocr({ modelId: ocrId, image: imagePath, options: { paragraph: false } });
const result = await blocks;
const ocrMs = Math.round(performance.now() - t);

const extracted = result.map((b) => b.text).join("\n");
const avgConf =
  result.reduce((s, b) => s + (b.confidence ?? 0), 0) / Math.max(result.length, 1);
log.inference({
  modelId: ocrId,
  task: "ocr-lab-photo",
  prompt: imagePath,
  durationMs: ocrMs,
});
console.log(`\nOCR done in ${ocrMs} ms — ${result.length} blocks, avg confidence ${avgConf.toFixed(2)}:`);
console.log("--------------------------------");
console.log(extracted);
console.log("--------------------------------");

await unloadModel({ modelId: ocrId });

console.log("\nIngesting OCR text into family workspace...");
const engine = new SehatEngine();
await engine.start();
await engine.ingestDocument({
  source: `photo:${basename(imagePath)}`,
  text: `Scanned lab report (OCR). Patient Budi Santoso, date 2026-06-08.\n${extracted}`,
});

const question =
  "Budi had a follow-up lab test in June 2026. Did his glucose and cholesterol improve compared to March 2026?";
console.log(`\nQ: ${question}\n`);
const { stats } = await engine.ask(question, {
  onToken: (tok) => process.stdout.write(tok),
});
console.log(
  `\n\n[search ${stats.searchMs} ms | TTFT ${stats.ttftMs} ms | ${stats.tokenCount} tokens]`
);

await engine.stop();
console.log("\nOCR -> RAG -> answer pipeline complete.");
process.exit(0);
