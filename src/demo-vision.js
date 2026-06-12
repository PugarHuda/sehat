// Vision multimodal demo: a local VLM (Gemma4 4B + projection) looks at a
// photographed lab report and explains it — no OCR step, pure vision+language.
// Complements the OCR pipeline: OCR for exact numbers, VLM for understanding.
//
//   node src/demo-vision.js [imagePath]
import {
  completion,
  loadModel,
  unloadModel,
  GEMMA4_4B_MULTIMODAL_Q4_K_M,
  MMPROJ_GEMMA4_4B_MULTIMODAL_F16,
} from "@qvac/sdk";
import { AuditLogger } from "./audit-logger.js";

const imagePath = process.argv[2] ?? "data/images/lab-results-budi-2026-06-photo.png";
const log = new AuditLogger("artifacts/audit-log.jsonl");

console.log("Loading Gemma4 4B multimodal + projection (first run downloads ~3 GB)...");
const t = performance.now();
const modelId = await loadModel({
  modelSrc: GEMMA4_4B_MULTIMODAL_Q4_K_M,
  modelType: "llm",
  modelConfig: {
    ctx_size: 4096,
    gpu_layers: 99,
    "main-gpu": "dedicated",
    projectionModelSrc: MMPROJ_GEMMA4_4B_MULTIMODAL_F16,
  },
});
log.modelLoad({
  modelSrc: "GEMMA4_4B_MULTIMODAL_Q4_K_M + MMPROJ (gpu_layers=99)",
  modelType: "llm",
  modelId,
  durationMs: Math.round(performance.now() - t),
});
console.log(`Vision model loaded: ${modelId}`);

const prompt =
  "You are looking at a photo of a family member's lab report. Describe what kind of " +
  "document it is, summarize the key findings in plain language, and note anything " +
  "that stands out. This is for personal education, not diagnosis.";

const tInfer = performance.now();
let ttftMs = null;
let tokenCount = 0;

const result = completion({
  modelId,
  history: [{ role: "user", content: prompt, attachments: [{ path: imagePath }] }],
  stream: true,
});
for await (const token of result.tokenStream) {
  if (ttftMs === null) ttftMs = Math.round(performance.now() - tInfer);
  tokenCount++;
  process.stdout.write(token);
}
const durationMs = Math.round(performance.now() - tInfer);
const stats = await result.stats.catch?.(() => null) ?? (await Promise.resolve(result.stats).catch(() => null));

log.inference({
  modelId,
  task: "vision-lab-photo",
  prompt: `${imagePath} | ${prompt.slice(0, 80)}...`,
  completionTokens: tokenCount,
  ttftMs,
  durationMs,
});

console.log(
  `\n\n--- Vision test ---\nTTFT: ${ttftMs} ms | tokens: ${tokenCount} | ` +
    `tok/s: ${(tokenCount / (durationMs / 1000)).toFixed(2)}`
);
if (stats) console.log("SDK stats:", JSON.stringify(stats));

await unloadModel({ modelId });
process.exit(0);
