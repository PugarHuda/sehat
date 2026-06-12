// Desktop P2P provider node: loads MedGemma on the GPU and serves it to
// peers (e.g. the phone client) via QVAC delegated inference.
// Set QVAC_HYPERSWARM_SEED to get a stable public key across restarts.
import {
  loadModel,
  startQVACProvider,
  MEDGEMMA_4B_IT_Q4_1,
  EMBEDDINGGEMMA_300M_Q8_0,
} from "@qvac/sdk";
import { AuditLogger } from "./audit-logger.js";

const log = new AuditLogger("artifacts/audit-log.jsonl");

console.log("Loading models for provider...");
let t = performance.now();
const llmId = await loadModel({
  modelSrc: MEDGEMMA_4B_IT_Q4_1,
  modelType: "llm",
  modelConfig: { gpu_layers: 99, "main-gpu": "dedicated", ctx_size: 4096 },
});
log.modelLoad({
  modelSrc: "MEDGEMMA_4B_IT_Q4_1 (provider, gpu_layers=99)",
  modelType: "llm",
  modelId: llmId,
  durationMs: Math.round(performance.now() - t),
});

t = performance.now();
const embedId = await loadModel({
  modelSrc: EMBEDDINGGEMMA_300M_Q8_0,
  modelType: "embeddings",
});
log.modelLoad({
  modelSrc: "EMBEDDINGGEMMA_300M_Q8_0 (provider)",
  modelType: "embeddings",
  modelId: embedId,
  durationMs: Math.round(performance.now() - t),
});

const res = await startQVACProvider({});
if (!res.success) {
  console.error("Provider failed to start:", res.error);
  process.exit(1);
}

console.log("\n=== MedNest P2P provider is live ===");
console.log(`Provider public key:\n${res.publicKey}`);
console.log(`\nModels served: MedGemma 4B (id ${llmId}), EmbeddingGemma (id ${embedId})`);
console.log("Give this public key to the client device. Ctrl+C to stop.");
