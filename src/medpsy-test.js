// QVAC MedPsy-4B (Tether's own Psy model) — loaded straight from HuggingFace
// via the SDK's HTTP model source. Uses the EXACT same prompt as the earlier
// MedGemma test so we can independently verify Tether's token-efficiency claim
// (MedPsy answers in ~3.2x fewer tokens) on consumer hardware.
import { completion, loadModel, unloadModel } from "@qvac/sdk";
import { AuditLogger } from "./audit-logger.js";

export const MEDPSY_4B_Q4_URL =
  "https://huggingface.co/qvac/MedPsy-4B-GGUF/resolve/main/medpsy-4b-q4_k_m-imat.gguf";

const log = new AuditLogger("artifacts/audit-log.jsonl");

console.log("Loading QVAC MedPsy-4B Q4_K_M from HuggingFace (first run downloads 2.72 GB)...");
const t = performance.now();
const modelId = await loadModel({
  modelSrc: MEDPSY_4B_Q4_URL,
  modelType: "llm",
  modelConfig: {
    gpu_layers: 99,
    "main-gpu": "dedicated",
    ctx_size: 4096,
    // Set NOTHINK=0 to allow the <think> phase; default off for concise output.
    reasoning_budget: process.env.NOTHINK === "0" ? -1 : 0,
  },
});
log.modelLoad({
  modelSrc: "MedPsy-4B Q4_K_M (HF, gpu_layers=99)",
  modelType: "llm",
  modelId,
  durationMs: Math.round(performance.now() - t),
});
console.log(`MedPsy loaded: ${modelId}`);

// Same prompt as src/medgemma-test.js (MedGemma answered with 1046 tokens).
const prompt =
  "A family member's lab report shows fasting glucose 118 mg/dL and HbA1c 6.1%. " +
  "Explain in plain language what these numbers mean and what general lifestyle " +
  "guidance is usually given. This is for personal education, not a diagnosis.";

const tInfer = performance.now();
let ttftMs = null;
let tokenCount = 0;

const result = completion({
  modelId,
  history: [{ role: "user", content: prompt }],
  stream: true,
});
for await (const token of result.tokenStream) {
  if (ttftMs === null) ttftMs = Math.round(performance.now() - tInfer);
  tokenCount++;
  process.stdout.write(token);
}
const durationMs = Math.round(performance.now() - tInfer);

log.inference({
  modelId,
  task: "completion-medpsy",
  prompt,
  completionTokens: tokenCount,
  ttftMs,
  durationMs,
});

console.log(
  `\n\n--- MedPsy-4B test ---\nTTFT: ${ttftMs} ms | tokens: ${tokenCount} | ` +
    `tok/s: ${(tokenCount / (durationMs / 1000)).toFixed(2)}\n` +
    `(MedGemma-4B on the same prompt: 1046 tokens, 44.4 tok/s, TTFT 5626 ms)`
);

await unloadModel({ modelId });
process.exit(0);
