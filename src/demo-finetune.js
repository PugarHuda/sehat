// QVAC Fabric fine-tuning demo: LoRA-adapt Qwen3 600M to the "Sehat style"
// (plain-language health education + mandatory consult-a-doctor disclaimer,
// EN + Indonesian) on the GTX 1660 Super. Then compare base vs adapted output.
import { finetune, completion, loadModel, unloadModel, QWEN3_600M_INST_Q4 } from "@qvac/sdk";
import { existsSync, readdirSync } from "node:fs";
import { AuditLogger } from "./audit-logger.js";

const log = new AuditLogger("artifacts/audit-log.jsonl");
const OUT_DIR = "artifacts/finetune";

console.log("Loading Qwen3 600M for fine-tuning...");
let t = performance.now();
const modelId = await loadModel({
  modelSrc: QWEN3_600M_INST_Q4,
  modelType: "llm",
  modelConfig: { device: "gpu", ctx_size: 1024, reasoning_budget: 0, predict: 220 },
});
log.modelLoad({
  modelSrc: "QWEN3_600M_INST_Q4 (finetune base)",
  modelType: "llm",
  modelId,
  durationMs: Math.round(performance.now() - t),
});

const PROBE = "What does high LDL mean?";

async function probe(label, cfg = {}) {
  const r = completion({
    modelId: cfg.modelId ?? modelId,
    history: [{ role: "user", content: PROBE }],
    stream: false,
  });
  const text = await r.text;
  console.log(`\n--- ${label} ---\n${text.trim().slice(0, 500)}\n`);
  return text;
}

await probe("BASE model answer (before fine-tuning)");

console.log("Starting LoRA fine-tune (2 epochs, 13 examples)...");
t = performance.now();
const handle = finetune({
  modelId,
  options: {
    trainDatasetDir: "data/finetune/train.jsonl",
    validation: { type: "dataset", path: "data/finetune/eval.jsonl" },
    numberOfEpochs: 2,
    learningRate: 1e-4,
    lrMin: 1e-8,
    loraModules: "attn_q,attn_k,attn_v,attn_o,ffn_gate,ffn_up,ffn_down",
    assistantLossOnly: true,
    checkpointSaveSteps: 10,
    checkpointSaveDir: `${OUT_DIR}/checkpoints`,
    outputParametersDir: OUT_DIR,
  },
});

for await (const tick of handle.progressStream) {
  const phase = tick.is_train ? "train" : "val";
  console.log(
    `epoch=${tick.current_epoch + 1} step=${tick.global_steps} ` +
      `batch=${tick.current_batch}/${tick.total_batches} ${phase} ` +
      `loss=${tick.loss?.toFixed(4)} eta=${Math.round((tick.eta_ms ?? 0) / 1000)}s`
  );
}
const result = await handle.result;
const trainMs = Math.round(performance.now() - t);
console.log("\nFine-tune result:", JSON.stringify(result));
log.inference({
  modelId,
  task: "finetune-lora",
  prompt: "data/finetune/train.jsonl (13 ex, 2 epochs)",
  durationMs: trainMs,
});

await unloadModel({ modelId });

// Find the produced LoRA adapter and reload the base model with it applied.
const adapter = existsSync(OUT_DIR)
  ? readdirSync(OUT_DIR).find((f) => f.endsWith(".gguf") || f.endsWith(".bin"))
  : null;

if (adapter) {
  console.log(`\nReloading base model with LoRA adapter: ${adapter}`);
  const tunedId = await loadModel({
    modelSrc: QWEN3_600M_INST_Q4,
    modelType: "llm",
    modelConfig: { device: "gpu", ctx_size: 1024, reasoning_budget: 0, predict: 220, lora: `${OUT_DIR}/${adapter}` },
  });
  log.modelLoad({
    modelSrc: `QWEN3_600M_INST_Q4 + LoRA(${adapter})`,
    modelType: "llm",
    modelId: tunedId,
    durationMs: 0,
  });
  await probe("TUNED model answer (after LoRA)", { modelId: tunedId });
  await unloadModel({ modelId: tunedId });
} else {
  console.log(`\n(no adapter file found in ${OUT_DIR} — check 'result' above for output paths)`);
}

console.log(`\nFine-tuning demo complete in ${(trainMs / 1000).toFixed(0)}s training time.`);
process.exit(0);
