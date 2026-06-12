// Multi-agent + tool-calling demo: the Qwen orchestrator searches records,
// does exact math via a tool, and consults the MedGemma specialist.
import { SehatAgent } from "./agent.js";

const agent = new SehatAgent();
console.log("Starting Sehat agent (Qwen3 1.7B orchestrator + MedGemma specialist)...");
await agent.start();

const question =
  process.argv[2] ??
  "By what percentage did Budi's total cholesterol change between September 2025 and June 2026? Is that direction medically good?";

console.log(`\n=== Q: ${question}\n`);
const t = performance.now();
const { answer, toolTrace } = await agent.run(question, {
  onToken: (tok) => process.stdout.write(tok),
});
const secs = ((performance.now() - t) / 1000).toFixed(1);

console.log(`\n\n--- Agent run complete in ${secs}s ---`);
console.log(`Tool calls made: ${toolTrace.length}`);
for (const t of toolTrace) console.log(`  • ${t.tool}(${JSON.stringify(t.args)})`);

await agent.stop();
process.exit(0);
