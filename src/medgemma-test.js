// Download + verify MedGemma 4B IT (the medical model for the Psy Models track)
// runs GPU-offloaded on the GTX 1660 Super.
import { completion, MEDGEMMA_4B_IT_Q4_1, loadModel, unloadModel } from "@qvac/sdk";
import { AuditLogger } from "./audit-logger.js";

const log = new AuditLogger("artifacts/audit-log.jsonl");

console.log("Loading MedGemma 4B (first run downloads ~2.8 GB)...");
const loadStart = performance.now();
const modelId = await loadModel({
  modelSrc: MEDGEMMA_4B_IT_Q4_1,
  modelType: "llm",
  modelConfig: {
    gpu_layers: 99,
    "main-gpu": "dedicated",
    ctx_size: 4096,
  },
});
log.modelLoad({
  modelSrc: "MEDGEMMA_4B_IT_Q4_1 (gpu_layers=99)",
  modelType: "llm",
  modelId,
  durationMs: Math.round(performance.now() - loadStart),
});
console.log(`MedGemma loaded: ${modelId}`);

const prompt =
  "A family member's lab report shows fasting glucose 118 mg/dL and HbA1c 6.1%. " +
  "Explain in plain language what these numbers mean and what general lifestyle " +
  "guidance is usually given. This is for personal education, not a diagnosis.";

const inferStart = performance.now();
let ttftMs = null;
let tokenCount = 0;

const result = completion({
  modelId,
  history: [{ role: "user", content: prompt }],
  stream: true,
});
for await (const token of result.tokenStream) {
  if (ttftMs === null) ttftMs = Math.round(performance.now() - inferStart);
  tokenCount++;
  process.stdout.write(token);
}
const durationMs = Math.round(performance.now() - inferStart);

log.inference({
  modelId,
  task: "completion-medgemma",
  prompt,
  completionTokens: tokenCount,
  ttftMs,
  durationMs,
});

console.log(
  `\n\n--- MedGemma test ---\nTTFT: ${ttftMs} ms | tokens: ${tokenCount} | ` +
    `tok/s: ${(tokenCount / (durationMs / 1000)).toFixed(2)}`
);

await unloadModel({ modelId });
process.exit(0);
