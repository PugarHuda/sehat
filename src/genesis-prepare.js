// Build a fine-tuning set from Tether's OWN QVAC Genesis-I medical dataset.
// We range-fetch only the first ~2 MB of the (multi-GB) college_medicine JSONL
// from HuggingFace — no full download — parse complete lines, and convert each
// exam-style item into a chat example (question+options -> correct answer +
// concise explanation in Sehat's plain, consult-a-doctor style).
//
// Dataset: qvac/GenesisI (CC-BY-NC 4.0) — disclosed in NOTICE-genesis.md.
import { writeFileSync } from "node:fs";

const URL =
  "https://huggingface.co/datasets/qvac/GenesisI/resolve/main/college_medicine/college_medicine_770K_rows.jsonl";

console.log("Range-fetching first ~8 MB of Genesis-I college_medicine...");
const res = await fetch(URL, { headers: { Range: "bytes=0-8400000" } });
const blob = await res.text();

// Keep only complete JSONL lines (drop the last, truncated one).
const lines = blob.split("\n").slice(0, -1).filter(Boolean);
console.log(`Got ${lines.length} complete rows.`);

function extract(text) {
  const q = /\*\*Question:\*\*\s*(.+)/.exec(text)?.[1]?.trim();
  const optsBlock = /\*\*Options:\*\*\s*([\s\S]*?)(?:\*\*Proposed|\*\*Correct)/.exec(text)?.[1] ?? "";
  const options = optsBlock.match(/[A-D]\.\s*[^\n]+/g)?.map((s) => s.trim()) ?? [];
  const correct = /\*\*Correct Answer:\*\*\s*(.+)/.exec(text)?.[1]?.trim();
  // Pull the first substantive explanatory sentence as a one-line rationale.
  const concepts = /## Key Concepts[^\n]*\n([\s\S]{0,1200})/.exec(text)?.[1] ?? "";
  const cleaned = concepts
    .replace(/[#*`]/g, " ")
    .replace(/^[\s\d.):-]+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  const rationale =
    cleaned.split(/(?<=\.)\s/).find((s) => s.length > 30 && /[a-z]{4}/.test(s))?.slice(0, 170) ?? "";
  if (!q || !correct || options.length < 2) return null;
  // Fabric caps conversations at 128 tokens, so keep each example compact:
  // short question + the correct letter + a one-line rationale.
  if (q.length > 160) return null;
  const user = `${q}\n${options.join("\n")}`;
  const assistant = `The correct answer is ${correct}. ${rationale}`.trim();
  // Approx token budget guard (~3.3 chars/token): keep whole pair well under 128.
  if ((user.length + assistant.length) / 3.3 > 110) return null;
  return { messages: [{ role: "user", content: user }, { role: "assistant", content: assistant }] };
}

const items = lines.map((l) => { try { return extract(JSON.parse(l).text); } catch { return null; } }).filter(Boolean);
console.log(`Extracted ${items.length} usable Q/A pairs.`);

const train = items.slice(0, Math.min(80, items.length - 12));
const evalSet = items.slice(train.length, train.length + 12);
const toJsonl = (rows) => rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
writeFileSync("data/finetune/genesis-train.jsonl", toJsonl(train));
writeFileSync("data/finetune/genesis-eval.jsonl", toJsonl(evalSet));
console.log(`Wrote ${train.length} train / ${evalSet.length} eval rows from real Genesis-I medical data.`);
console.log("Sample:\n", JSON.stringify(train[0], null, 2).slice(0, 600));
process.exit(0);
