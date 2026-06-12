// Full voice loop, 100% on-device:
//   TTS speaks a question -> Parakeet STT transcribes it -> RAG + MedGemma
//   answer -> TTS speaks the answer. Audio artifacts land in artifacts/voice/.
import { mkdirSync } from "node:fs";
import {
  loadModel,
  unloadModel,
  transcribe,
  textToSpeech,
  TTS_EN_SUPERTONIC_Q8_0,
  PARAKEET_CTC_0_6B_Q8_0,
} from "@qvac/sdk";
import { MedNestEngine } from "./engine.js";
import { writeWav, resample } from "./audio-utils.js";
import { AuditLogger } from "./audit-logger.js";

const TTS_RATE = 44100;
const STT_RATE = 16000;
const OUT = "artifacts/voice";
mkdirSync(OUT, { recursive: true });

const log = new AuditLogger("artifacts/audit-log.jsonl");

// --- 1. TTS: speak the question ----------------------------------------
console.log("Loading Supertonic TTS...");
let t = performance.now();
const ttsId = await loadModel({
  modelSrc: TTS_EN_SUPERTONIC_Q8_0.src ?? TTS_EN_SUPERTONIC_Q8_0,
  modelType: "tts",
  modelConfig: { ttsEngine: "supertonic", language: "en", voice: "F1", ttsSpeed: 1.0 },
});
log.modelLoad({
  modelSrc: "TTS_EN_SUPERTONIC_Q8_0",
  modelType: "tts",
  modelId: ttsId,
  durationMs: Math.round(performance.now() - t),
});

const questionText = "Which vaccination is Rina still due for?";
t = performance.now();
const qTts = textToSpeech({ modelId: ttsId, text: questionText, inputType: "text", stream: false });
const qSamples = await qTts.buffer;
log.inference({
  modelId: ttsId,
  task: "tts-question",
  prompt: questionText,
  durationMs: Math.round(performance.now() - t),
});
writeWav(qSamples, TTS_RATE, `${OUT}/question-44k.wav`);
writeWav(resample(qSamples, TTS_RATE, STT_RATE), STT_RATE, `${OUT}/question-16k.wav`);
console.log(`Question spoken (${qSamples.length} samples) -> ${OUT}/question-16k.wav`);

// --- 2. STT: transcribe the spoken question ----------------------------
console.log("Loading Parakeet STT...");
t = performance.now();
const sttId = await loadModel({
  modelSrc: PARAKEET_CTC_0_6B_Q8_0,
  modelType: "parakeet",
});
log.modelLoad({
  modelSrc: "PARAKEET_CTC_0_6B_Q8_0",
  modelType: "parakeet",
  modelId: sttId,
  durationMs: Math.round(performance.now() - t),
});

t = performance.now();
const heard = await transcribe({ modelId: sttId, audioChunk: `${OUT}/question-16k.wav` });
const sttMs = Math.round(performance.now() - t);
const heardText = typeof heard === "string" ? heard : (heard.text ?? JSON.stringify(heard));
log.inference({ modelId: sttId, task: "stt-question", prompt: `${OUT}/question-16k.wav`, durationMs: sttMs });
console.log(`STT heard (${sttMs} ms): "${heardText.trim()}"`);

// --- 3. RAG + MedGemma answer -------------------------------------------
console.log("Starting MedNest engine...");
const engine = new MedNestEngine();
await engine.start();

// Workspace persists on disk from demo-rag; re-ingest only if empty.
let { answer, hits, stats } = await engine.ask(heardText.trim(), {
  onToken: (tok) => process.stdout.write(tok),
});
if (hits.length === 0) {
  console.log("Workspace empty — run `npm run demo:rag` first to ingest documents.");
  process.exit(1);
}
console.log(`\n[TTFT ${stats.ttftMs} ms | ${stats.tokenCount} tokens]`);

// --- 4. TTS: speak the answer -------------------------------------------
const spokenAnswer = answer.replace(/\[doc:[^\]]*\]/g, "").replace(/\*+/g, "").trim();
t = performance.now();
const aTts = textToSpeech({ modelId: ttsId, text: spokenAnswer, inputType: "text", stream: false });
const aSamples = await aTts.buffer;
log.inference({
  modelId: ttsId,
  task: "tts-answer",
  prompt: spokenAnswer.slice(0, 120),
  durationMs: Math.round(performance.now() - t),
});
writeWav(aSamples, TTS_RATE, `${OUT}/answer.wav`);
console.log(`\nAnswer spoken -> ${OUT}/answer.wav`);

await engine.stop();
await unloadModel({ modelId: sttId });
await unloadModel({ modelId: ttsId });
console.log("\nVoice loop complete: TTS -> STT -> RAG+MedGemma -> TTS, all on-device.");
process.exit(0);
