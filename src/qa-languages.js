// Language robustness probe: ask the LIVE server in several languages.
// Indonesian goes through the Bergamot pipeline (lang=id); the others test
// MedGemma's native multilingual behavior directly.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const BASE = process.env.SEHAT_URL ?? "https://localhost:8787";

async function ask(q, lang) {
  const res = await fetch(`${BASE}/api/ask?q=${encodeURIComponent(q)}${lang ? `&lang=${lang}` : ""}`);
  const text = await res.text();
  let answer = "";
  for (const block of text.split("\n\n")) {
    const ev = /event: (\w+)/.exec(block)?.[1];
    const data = /data: (.*)/s.exec(block)?.[1];
    if (ev === "token" && data) answer += JSON.parse(data);
  }
  return answer.trim();
}

const cases = [
  ["🇮🇩 Indonesian (Bergamot pipeline)", "Kapan Rina perlu vaksinasi berikutnya?", "id"],
  ["🇮🇩 Indonesian (direct, no toggle)", "Obat apa yang diminum Sari setiap pagi?", null],
  ["🇪🇸 Spanish (direct)", "¿Qué medicamento toma Sari y cuáles son los efectos secundarios?", null],
  ["🇫🇷 French (direct)", "Quel est le dernier taux de glycémie de Budi ?", null],
  ["🇨🇳 Chinese (direct)", "Budi最近的血糖值是多少？", null],
  ["🇸🇦 Arabic (direct)", "ما هو الدواء الذي تتناوله ساري؟", null],
];

for (const [label, q, lang] of cases) {
  const a = await ask(q, lang);
  console.log(`\n=== ${label}\nQ: ${q}\nA: ${a.replace(/\n+/g, " ").slice(0, 400)}`);
}
process.exit(0);
