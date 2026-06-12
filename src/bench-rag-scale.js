// Large-collection RAG benchmark ("advanced RAG pipelines with large document
// collections"). Generates ~200 synthetic family health documents spanning
// 5 members x 8 years, ingests them into a dedicated workspace, runs
// ragReindex() (IVF centroid rebalancing), and measures search latency and
// answer quality before/after reindex.
import {
  loadModel,
  unloadModel,
  ragIngest,
  ragSearch,
  ragReindex,
  ragCloseWorkspace,
  EMBEDDINGGEMMA_300M_Q8_0,
} from "@qvac/sdk";
import { writeFileSync } from "node:fs";
import { AuditLogger } from "./audit-logger.js";

const WS = "sehat-family-large";
const log = new AuditLogger("artifacts/audit-log.jsonl");

// --- Deterministic synthetic corpus -----------------------------------------
const MEMBERS = [
  ["Budi Santoso", "M", 48],
  ["Sari Santoso", "F", 45],
  ["Rina Santoso", "F", 4],
  ["Agus Santoso", "M", 72],
  ["Dewi Santoso", "F", 70],
];
const YEARS = Array.from({ length: 16 }, (_, i) => 2011 + i); // 2011–2026
// Simple seeded PRNG so the corpus is reproducible (no Math.random in demos).
let seed = 42;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
const pick = (a) => a[Math.floor(rnd() * a.length)];

function makeDocs() {
  const docs = [];
  for (const [name, sex, age] of MEMBERS) {
    for (const year of YEARS) {
      // 1) annual lab panel
      const glucose = Math.round(85 + rnd() * 50);
      const chol = Math.round(170 + rnd() * 80);
      const ldl = Math.round(90 + rnd() * 70);
      const sys = Math.round(110 + rnd() * 35);
      const dia = Math.round(70 + rnd() * 20);
      docs.push({
        source: `lab-${name.split(" ")[0].toLowerCase()}-${year}.txt`,
        text:
          `SYNTHETIC. Klinik Sehat Sentosa annual panel. Patient: ${name} (${sex}, ${age - (2026 - year)}). ` +
          `Date: ${year}-03-15. Fasting glucose: ${glucose} mg/dL. Total cholesterol: ${chol} mg/dL. ` +
          `LDL: ${ldl} mg/dL. Blood pressure: ${sys}/${dia} mmHg.`,
      });
      // 2) consultation note
      const topic = pick(["seasonal flu", "back pain", "routine check-up", "headache", "skin rash", "knee pain"]);
      docs.push({
        source: `note-${name.split(" ")[0].toLowerCase()}-${year}.txt`,
        text:
          `SYNTHETIC. Consultation note. Patient: ${name}. Date: ${year}-08-22. ` +
          `Visit reason: ${topic}. Advice: rest, hydration, follow-up if symptoms persist beyond a week.`,
      });
      // 3) prescription every other year
      if (year % 2 === 0) {
        const med = pick(["Paracetamol 500 mg", "Cetirizine 10 mg", "Omeprazole 20 mg", "Ibuprofen 400 mg"]);
        docs.push({
          source: `rx-${name.split(" ")[0].toLowerCase()}-${year}.txt`,
          text:
            `SYNTHETIC. Prescription. Patient: ${name}. Date: ${year}-08-22. ` +
            `Medication: ${med}, as directed. Pharmacist counseled on usage.`,
        });
      }
    }
  }
  // Needle document the benchmark must retrieve from the haystack:
  docs.push({
    source: "vaccine-agus-2024-special.txt",
    text:
      "SYNTHETIC. Immunization record. Patient: Agus Santoso (M, 70). Date: 2024-11-05. " +
      "Received herpes zoster (shingles) vaccine, dose 1 of 2. Second dose due 2025-01-05.",
  });
  return docs;
}

const docs = makeDocs();
console.log(`Corpus: ${docs.length} documents for ${MEMBERS.length} family members over ${YEARS.length} years`);

const embedId = await loadModel({ modelSrc: EMBEDDINGGEMMA_300M_Q8_0, modelType: "embeddings" });

// --- Ingest ------------------------------------------------------------------
const tIngest = performance.now();
for (let i = 0; i < docs.length; i++) {
  await ragIngest({
    modelId: embedId,
    documents: [`[source: ${docs[i].source}]\n${docs[i].text}`],
    workspace: WS,
    chunk: false,
  });
  if ((i + 1) % 50 === 0) console.log(`  ingested ${i + 1}/${docs.length}`);
}
const ingestMs = Math.round(performance.now() - tIngest);
console.log(`Ingest: ${docs.length} docs in ${(ingestMs / 1000).toFixed(1)}s (${(ingestMs / docs.length).toFixed(0)} ms/doc)`);
log.inference({ modelId: embedId, task: "rag-scale-ingest", prompt: `${docs.length} docs`, durationMs: ingestMs });

// --- Search latency before reindex -------------------------------------------
const QUERIES = [
  "When did Agus get his shingles vaccine and when is the second dose due?",
  "Dewi blood pressure 2023",
  "What medication was prescribed to Rina in 2022?",
  "Budi cholesterol trend",
  "Sari consultation about headache",
];
async function bench(label) {
  const times = [];
  let needleFound = false;
  for (const q of QUERIES) {
    const t = performance.now();
    const hits = await ragSearch({ modelId: embedId, query: q, topK: 5, workspace: WS });
    times.push(Math.round(performance.now() - t));
    if (q.includes("shingles") && hits.some((h) => h.content.includes("herpes zoster"))) needleFound = true;
  }
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  console.log(`${label}: avg ${avg} ms (min ${Math.min(...times)}, max ${Math.max(...times)}) | needle doc found: ${needleFound ? "YES" : "NO"}`);
  return { avg, min: Math.min(...times), max: Math.max(...times), needleFound };
}

const before = await bench("Search BEFORE reindex");

// --- Reindex (IVF centroid rebalancing) ---------------------------------------
const tRe = performance.now();
const re = await ragReindex({ workspace: WS });
const reMs = Math.round(performance.now() - tRe);
console.log(`ragReindex: reindexed=${re.reindexed} in ${(reMs / 1000).toFixed(1)}s ${re.details ? JSON.stringify(re.details) : ""}`);
log.inference({ modelId: embedId, task: "rag-scale-reindex", prompt: WS, durationMs: reMs });

const after = await bench("Search AFTER reindex ");

// --- Report --------------------------------------------------------------------
writeFileSync(
  "artifacts/rag-scale-report.md",
  `# RAG scale benchmark — ${docs.length} documents\n\n` +
    `Corpus: ${MEMBERS.length} family members × ${YEARS.length} years (labs, notes, prescriptions) + 1 needle doc.\n\n` +
    `| Metric | Value |\n|---|---|\n` +
    `| Documents ingested | ${docs.length} |\n` +
    `| Ingest total / per doc | ${(ingestMs / 1000).toFixed(1)} s / ${(ingestMs / docs.length).toFixed(0)} ms |\n` +
    `| Search avg before reindex | ${before.avg} ms (${before.min}–${before.max}) |\n` +
    `| ragReindex (IVF rebalance) | ${re.reindexed} in ${(reMs / 1000).toFixed(1)} s |\n` +
    `| Search avg after reindex | ${after.avg} ms (${after.min}–${after.max}) |\n` +
    `| Needle retrieval (1 doc in ${docs.length}) | before: ${before.needleFound ? "✅" : "❌"} after: ${after.needleFound ? "✅" : "❌"} |\n`
);
console.log("Report -> artifacts/rag-scale-report.md");

await ragCloseWorkspace({ workspace: WS });
await unloadModel({ modelId: embedId });
process.exit(0);
