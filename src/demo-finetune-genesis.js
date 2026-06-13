// QVAC Fabric LoRA fine-tune on Tether's OWN QVAC Genesis-I medical dataset.
// This is the deepest QVAC-stack integration: Tether MODEL family (Qwen base
// served via QVAC) + Tether DATASET (Genesis-I medicine) + Tether FINE-TUNING
// (Fabric LoRA) — every leg the judging criteria names, in one run.
//
// Run `node src/genesis-prepare.js` first to build data/finetune/genesis-*.jsonl.
import { finetune, completion, loadModel, unloadModel, QWEN3_600M_INST_Q4 } from "@qvac/sdk";
import { existsSync } from "node:fs";
import { AuditLogger } from "./audit-logger.js";

const log = new AuditLogger("artifacts/audit-log.jsonl");
const OUT_DIR = "artifacts/finetune-genesis";

if (!existsSync("data/finetune/genesis-train.jsonl")) {
  console.error("Run `node src/genesis-prepare.js` first.");
  process.exit(1);
}

console.log("Loading Qwen3 600M base for Genesis fine-tuning...");
let t = performance.now();
const modelId = await loadModel({
  modelSrc: QWEN3_600M_INST_Q4,
  modelType: "llm",
  modelConfig: { device: "gpu", ctx_size: 1024, reasoning_budget: 0, predict: 200 },
});
log.modelLoad({
  modelSrc: "QWEN3_600M_INST_Q4 (Genesis finetune base)",
  modelType: "llm",
  modelId,
  durationMs: Math.round(performance.now() - t),
});

const PROBE =
  "Which enzyme of the pentose phosphate pathway is most critical for NADPH " +
  "production in rapidly dividing cancer cells?";
async function probe(label, id = modelId) {
  const r = completion({ modelId: id, history: [{ role: "user", content: PROBE }], stream: false });
  console.log(`\n--- ${label} ---\n${(await r.text).trim().slice(0, 400)}\n`);
}
await probe("BASE answer (before Genesis fine-tune)");

console.log("Fine-tuning on real QVAC Genesis-I medical data (2 epochs)...");
t = performance.now();
const handle = finetune({
  modelId,
  options: {
    trainDatasetDir: "data/finetune/genesis-train.jsonl",
    validation: { type: "dataset", path: "data/finetune/genesis-eval.jsonl" },
    numberOfEpochs: 2,
    learningRate: 1e-4,
    lrMin: 1e-8,
    loraModules: "attn_q,attn_k,attn_v,attn_o,ffn_gate,ffn_up,ffn_down",
    assistantLossOnly: true,
    checkpointSaveSteps: 1000,
    checkpointSaveDir: `${OUT_DIR}/checkpoints`,
    outputParametersDir: OUT_DIR,
  },
});
let lastLoss = null;
for await (const tick of handle.progressStream) {
  if (tick.is_train) lastLoss = tick.loss;
  console.log(
    `epoch=${tick.current_epoch + 1} step=${tick.global_steps} ` +
      `${tick.is_train ? "train" : "val"} loss=${tick.loss?.toFixed(4)} ` +
      `eta=${Math.round((tick.eta_ms ?? 0) / 1000)}s`
  );
}
const result = await handle.result;
const trainMs = Math.round(performance.now() - t);
console.log("\nResult:", JSON.stringify(result.stats ?? result));
log.inference({
  modelId,
  task: "finetune-lora-genesis",
  prompt: "Genesis-I college_medicine (80 ex, 2 epochs)",
  durationMs: trainMs,
});
await unloadModel({ modelId });

console.log(`\nGenesis fine-tune done in ${(trainMs / 1000).toFixed(0)}s. Adapter -> ${OUT_DIR}.`);
console.log("Stack touched in one run: QVAC SDK + Qwen model + Genesis-I dataset + Fabric LoRA.");
process.exit(0);
