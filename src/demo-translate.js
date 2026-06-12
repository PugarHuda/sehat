// Indonesian Q&A demo: Bahasa Indonesia question -> Bergamot ID->EN ->
// RAG + MedGemma -> Bergamot EN->ID -> Bahasa Indonesia answer. All local.
import { SehatEngine } from "./engine.js";
import { Translator } from "./translator.js";

const question = process.argv[2] ?? "Obat apa yang diminum Sari dan apa efek sampingnya?";

console.log("Loading translator (Bergamot ID<->EN) and engine...");
const translator = new Translator();
await translator.start();
const engine = new SehatEngine();
await engine.start();

console.log(`\n🇮🇩 Pertanyaan: ${question}`);
const english = await translator.toEnglish(question);
console.log(`🔁 English:    ${english.trim()}`);

const { answer, stats } = await engine.ask(english.trim(), {});
console.log(`\n🤖 MedGemma (EN): ${answer.trim().slice(0, 400)}...`);

const indonesian = await translator.toIndonesian(answer.replace(/\[doc:[^\]]*\]/g, "").trim());
console.log(`\n🇮🇩 Jawaban: ${indonesian.trim()}`);
console.log(`\n[TTFT ${stats.ttftMs} ms | ${stats.tokenCount} tokens]`);

await engine.stop();
await translator.stop();
console.log("\nIndonesian round-trip complete — 7 QVAC models in this app now.");
process.exit(0);
