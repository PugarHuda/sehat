// Desktop P2P provider node: loads MedGemma on the GPU and serves it to
// peers (e.g. the phone client) via QVAC delegated inference.
// Set QVAC_HYPERSWARM_SEED to get a stable public key across restarts.
import { loadModel, startQVACProvider, EMBEDDINGGEMMA_300M_Q8_0 } from "@qvac/sdk";
import { MEDPSY_4B_Q4_URL } from "./engine.js";
import { AuditLogger } from "./audit-logger.js";

const log = new AuditLogger("artifacts/audit-log.jsonl");

console.log("Loading models for provider...");
let t = performance.now();
const llmId = await loadModel({
  modelSrc: MEDPSY_4B_Q4_URL,
  modelType: "llm",
  modelConfig: { gpu_layers: 99, "main-gpu": "dedicated", ctx_size: 4096, reasoning_budget: 0 },
});
log.modelLoad({
  modelSrc: "MedPsy-4B Q4_K_M (provider, gpu_layers=99)",
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

console.log("\n=== Sehat P2P provider is live ===");
console.log(`Provider public key:\n${res.publicKey}`);
console.log(`\nModels served: MedGemma 4B (id ${llmId}), EmbeddingGemma (id ${embedId})`);
console.log("Give this public key to the client device. Ctrl+C to stop.");
