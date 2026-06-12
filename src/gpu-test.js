// Compare inference speed with GPU offload enabled (model already cached from smoke test).
import { completion, LLAMA_3_2_1B_INST_Q4_0, loadModel, unloadModel } from "@qvac/sdk";
import { AuditLogger } from "./audit-logger.js";

const log = new AuditLogger("artifacts/audit-log.jsonl");

const loadStart = performance.now();
const modelId = await loadModel({
  modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  modelType: "llm",
  modelConfig: {
    gpu_layers: 99,
    "main-gpu": "dedicated",
    verbosity: 1,
  },
});
log.modelLoad({
  modelSrc: "LLAMA_3_2_1B_INST_Q4_0 (gpu_layers=99)",
  modelType: "llm",
  modelId,
  durationMs: Math.round(performance.now() - loadStart),
});

const prompt =
  "In two sentences, why does on-device AI matter for family health data privacy?";
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
  task: "completion-gpu",
  prompt,
  completionTokens: tokenCount,
  ttftMs,
  durationMs,
});

console.log(
  `\n\n--- GPU test ---\nTTFT: ${ttftMs} ms | tokens: ${tokenCount} | ` +
    `tok/s: ${(tokenCount / (durationMs / 1000)).toFixed(2)} (CPU baseline was 31.64)`
);

await unloadModel({ modelId });
process.exit(0);
