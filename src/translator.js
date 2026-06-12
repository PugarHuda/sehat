// Local EN<->Indonesian translation via Bergamot NMT (CPU, tiny, fast).
// Lets the family ask in Bahasa Indonesia while MedGemma reasons in English.
import {
  loadModel,
  unloadModel,
  translate,
  BERGAMOT_EN_ID,
  BERGAMOT_ID_EN,
} from "@qvac/sdk";
import { AuditLogger } from "./audit-logger.js";

const BERGAMOT_DEFAULTS = { engine: "Bergamot", beamsize: 1, normalize: 1 };

export class Translator {
  constructor({ auditLogPath = "artifacts/audit-log.jsonl" } = {}) {
    this.log = new AuditLogger(auditLogPath);
    this.idEnId = null;
    this.enIdId = null;
  }

  async start() {
    let t = performance.now();
    this.idEnId = await loadModel({
      modelSrc: BERGAMOT_ID_EN,
      modelType: "nmt",
      modelConfig: { ...BERGAMOT_DEFAULTS, from: "id", to: "en" },
    });
    this.log.modelLoad({
      modelSrc: "BERGAMOT_ID_EN",
      modelType: "nmt",
      modelId: this.idEnId,
      durationMs: Math.round(performance.now() - t),
    });

    t = performance.now();
    this.enIdId = await loadModel({
      modelSrc: BERGAMOT_EN_ID,
      modelType: "nmt",
      modelConfig: { ...BERGAMOT_DEFAULTS, from: "en", to: "id" },
    });
    this.log.modelLoad({
      modelSrc: "BERGAMOT_EN_ID",
      modelType: "nmt",
      modelId: this.enIdId,
      durationMs: Math.round(performance.now() - t),
    });
  }

  async #run(modelId, text, task) {
    const t = performance.now();
    const result = translate({ modelId, text, modelType: "nmt", stream: false });
    const out = await result.text;
    this.log.inference({
      modelId,
      task,
      prompt: String(text).slice(0, 200),
      durationMs: Math.round(performance.now() - t),
    });
    return out;
  }

  toEnglish(text) {
    return this.#run(this.idEnId, text, "translate-id-en");
  }

  toIndonesian(text) {
    return this.#run(this.enIdId, text, "translate-en-id");
  }

  async stop() {
    if (this.idEnId) await unloadModel({ modelId: this.idEnId });
    if (this.enIdId) await unloadModel({ modelId: this.enIdId });
  }
}
