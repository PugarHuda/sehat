// OCR robustness sweep: runs the local OCR model over every image in
// data/images (clean print, prescription, ROTATED, small font) and reports
// block counts + confidence + whether key strings were recovered.
// CPU mode so it can run alongside the server.
import { loadModel, unloadModel, ocr, OCR_LATIN_RECOGNIZER_1 } from "@qvac/sdk";
import { readdirSync, appendFileSync } from "node:fs";

const EXPECT = {
  "lab-results-budi-2026-06-photo.png": ["102", "5.9", "201"],
  "prescription-rina-2026-06.png": ["Cefixime", "Paracetamol", "Penicillin"],
  "test-rotated.png": ["102", "201"],
  "test-smallfont.png": ["Amlodipine", "135/86", "grapefruit"],
};

const modelId = await loadModel({
  modelSrc: OCR_LATIN_RECOGNIZER_1,
  modelType: "ocr",
  modelConfig: { langList: ["en"], useGPU: false, defaultRotationAngles: [90, 180, 270] },
});

const rows = [];
for (const file of readdirSync("data/images").filter((f) => f.endsWith(".png"))) {
  const t = performance.now();
  const { blocks } = ocr({ modelId, image: `data/images/${file}`, options: { paragraph: false } });
  const result = await blocks;
  const ms = Math.round(performance.now() - t);
  const text = result.map((b) => b.text).join(" ");
  const avgConf = result.reduce((s, b) => s + (b.confidence ?? 0), 0) / Math.max(result.length, 1);
  const expected = EXPECT[file] ?? [];
  const found = expected.filter((e) => text.toLowerCase().includes(e.toLowerCase()));
  const ok = found.length === expected.length;
  rows.push({ file, blocks: result.length, conf: avgConf.toFixed(2), ms, found: `${found.length}/${expected.length}`, ok });
  console.log(
    `${ok ? "✅" : "⚠️"} ${file}: ${result.length} blocks, conf ${avgConf.toFixed(2)}, ${ms} ms, ` +
      `key strings ${found.length}/${expected.length}${ok ? "" : ` (missing: ${expected.filter((e) => !found.includes(e)).join(", ")})`}`
  );
}

await unloadModel({ modelId });

appendFileSync(
  "artifacts/qa-report.md",
  "\n\n## OCR robustness sweep\n\n| Image | Blocks | Avg conf | Time | Key strings | OK |\n|---|---|---|---|---|---|\n" +
    rows.map((r) => `| ${r.file} | ${r.blocks} | ${r.conf} | ${r.ms} ms | ${r.found} | ${r.ok ? "✅" : "⚠️"} |`).join("\n") +
    "\n"
);
console.log("\nAppended to artifacts/qa-report.md");
process.exit(0);
