// Consumer-side delegation test: connects to the provider via its public key
// and runs a completion WITHOUT loading any model locally. Run on a second
// device (or second terminal) while src/provider.js is running.
//
//   node src/delegate-test.js <providerPublicKey>
import { completion, loadModel, unloadModel, MEDGEMMA_4B_IT_Q4_1 } from "@qvac/sdk";
import { AuditLogger } from "./audit-logger.js";

const providerPublicKey = process.argv[2];
if (!providerPublicKey) {
  console.error("Usage: node src/delegate-test.js <providerPublicKey>");
  process.exit(1);
}

const log = new AuditLogger("artifacts/audit-log.jsonl");

console.log("Connecting to provider via P2P delegation...");
const t = performance.now();
const modelId = await loadModel({
  modelSrc: MEDGEMMA_4B_IT_Q4_1,
  modelType: "llm",
  delegate: {
    providerPublicKey,
    fallbackToLocal: false,
  },
});
log.modelLoad({
  modelSrc: "MEDGEMMA_4B_IT_Q4_1 (DELEGATED via P2P)",
  modelType: "llm",
  modelId,
  durationMs: Math.round(performance.now() - t),
});
console.log(`Delegated model handle: ${modelId}`);

const prompt =
  "In one short paragraph: what is prediabetes and can lifestyle changes reverse it?";
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
  task: "completion-delegated-p2p",
  prompt,
  completionTokens: tokenCount,
  ttftMs,
  durationMs,
});

console.log(
  `\n\n--- P2P delegation test (streaming) ---\nTTFT: ${ttftMs} ms | tokens: ${tokenCount} | ` +
    `tok/s: ${(tokenCount / (durationMs / 1000)).toFixed(2)} (includes network hop)`
);

// Same prompt, non-streaming: one P2P round trip for the whole answer,
// to isolate per-token streaming overhead from raw delegated throughput.
const tBatch = performance.now();
const batch = completion({
  modelId,
  history: [{ role: "user", content: prompt }],
  stream: false,
});
const batchText = await batch.text;
const batchMs = Math.round(performance.now() - tBatch);
const batchTokens = Math.round(batchText.length / 4); // rough token estimate

log.inference({
  modelId,
  task: "completion-delegated-p2p-batch",
  prompt,
  completionTokens: batchTokens,
  ttftMs: null,
  durationMs: batchMs,
});

console.log(
  `--- P2P delegation test (non-streaming) ---\ntotal: ${batchMs} ms | ~${batchTokens} tokens | ` +
    `~${(batchTokens / (batchMs / 1000)).toFixed(2)} tok/s`
);

await unloadModel({ modelId });
process.exit(0);
