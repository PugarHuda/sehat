// Sehat multi-agent orchestration with QVAC tool calling.
//
// Architecture (all on-device):
//   Qwen3 1.7B  = orchestrator agent (tools: true, dynamic mode)
//     ├─ tool: search_records     -> RAG over the family workspace
//     ├─ tool: calculate_change   -> deterministic math (no LLM arithmetic!)
//     └─ tool: consult_medgemma   -> hands medical interpretation to the
//                                    MedGemma 4B specialist agent
import { z } from "zod";
import {
  completion,
  loadModel,
  unloadModel,
  ragSearch,
  QWEN3_1_7B_INST_Q4,
} from "@qvac/sdk";
import { SehatEngine } from "./engine.js";
import { AuditLogger } from "./audit-logger.js";

const WORKSPACE = "sehat-family";

const TOOLS = [
  {
    name: "search_records",
    description:
      "Search the family's health documents (lab results, prescriptions, vaccination records, doctor notes). Returns the most relevant excerpts.",
    parameters: z.object({
      query: z.string().describe("What to look for, e.g. 'Budi cholesterol 2025'"),
    }),
  },
  {
    name: "calculate_change",
    description:
      "Exactly compute the absolute and percentage change between two numeric values. Use this instead of doing arithmetic yourself.",
    parameters: z.object({
      metric: z.string().describe("Name of the metric, e.g. 'total cholesterol'"),
      old_value: z.number().describe("Earlier value"),
      new_value: z.number().describe("Later value"),
    }),
  },
  {
    name: "consult_medgemma",
    description:
      "Ask the on-device MedGemma medical specialist to interpret findings. Use for medical meaning, risk, or guidance questions. Pass full context in the question.",
    parameters: z.object({
      question: z.string().describe("Complete, self-contained medical question including the relevant numbers"),
    }),
  },
];

export class SehatAgent {
  // Pass an already-started `engine` to share the server's loaded models
  // (saves ~3 GB VRAM vs loading a second MedGemma instance).
  constructor({ auditLogPath = "artifacts/audit-log.jsonl", engine = null } = {}) {
    this.log = new AuditLogger(auditLogPath);
    this.ownsEngine = !engine;
    this.engine = engine ?? new SehatEngine({ auditLogPath });
    this.orchestratorId = null;
  }

  async start() {
    if (this.ownsEngine) await this.engine.start(); // MedGemma specialist + embeddings
    const t = performance.now();
    this.orchestratorId = await loadModel({
      modelSrc: QWEN3_1_7B_INST_Q4,
      modelType: "llm",
      modelConfig: {
        ctx_size: 4096,
        tools: true,
        toolsMode: "dynamic",
        gpu_layers: 99,
        reasoning_budget: 0,
      },
    });
    this.log.modelLoad({
      modelSrc: "QWEN3_1_7B_INST_Q4 (orchestrator, tools)",
      modelType: "llm",
      modelId: this.orchestratorId,
      durationMs: Math.round(performance.now() - t),
    });
  }

  async #execTool(call) {
    const t = performance.now();
    let result;
    if (call.name === "search_records") {
      const hits = await ragSearch({
        modelId: this.engine.embedId,
        query: String(call.arguments.query ?? ""),
        topK: 3,
        workspace: WORKSPACE,
      });
      result = hits.length
        ? hits.map((h) => h.content.slice(0, 600)).join("\n---\n")
        : "No matching documents.";
    } else if (call.name === "calculate_change") {
      const { metric, old_value, new_value } = call.arguments;
      const abs = new_value - old_value;
      const pct = old_value !== 0 ? (abs / old_value) * 100 : NaN;
      result =
        `${metric}: ${old_value} -> ${new_value}. ` +
        `Absolute change: ${abs.toFixed(2)}. Percentage change: ${pct.toFixed(1)}%. ` +
        `Direction: ${abs < 0 ? "decrease" : abs > 0 ? "increase" : "no change"}.`;
    } else if (call.name === "consult_medgemma") {
      const { answer } = await this.engine.ask(String(call.arguments.question ?? ""), {});
      result = answer;
    } else {
      result = `Unknown tool: ${call.name}`;
    }
    this.log.inference({
      modelId: this.orchestratorId,
      task: `tool:${call.name}`,
      prompt: JSON.stringify(call.arguments).slice(0, 300),
      durationMs: Math.round(performance.now() - t),
    });
    return result;
  }

  async run(question, { onToken, maxTurns = 6 } = {}) {
    const history = [
      {
        role: "system",
        content:
          "You are the Sehat orchestrator, coordinating on-device health tools for a family. " +
          "Plan step by step: search records first, use calculate_change for any arithmetic, " +
          "and consult_medgemma for medical interpretation. Then give a short final answer. " +
          "Never invent numbers — only use values returned by tools.",
      },
      { role: "user", content: question },
    ];
    const toolTrace = [];
    const tStart = performance.now();

    for (let turn = 0; turn < maxTurns; turn++) {
      const result = completion({
        modelId: this.orchestratorId,
        history,
        tools: TOOLS,
        stream: true,
      });
      let text = "";
      for await (const token of result.tokenStream) {
        text += token;
        onToken?.(token);
      }
      const toolCalls = await result.toolCalls;

      if (!toolCalls || toolCalls.length === 0) {
        this.log.inference({
          modelId: this.orchestratorId,
          task: "agent-final-answer",
          prompt: question,
          durationMs: Math.round(performance.now() - tStart),
        });
        return { answer: text, toolTrace };
      }

      history.push({ role: "assistant", content: text });
      for (const call of toolCalls) {
        onToken?.(`\n→ [${call.name}] ${JSON.stringify(call.arguments)}\n`);
        const output = await this.#execTool(call);
        toolTrace.push({ tool: call.name, args: call.arguments, output: output.slice(0, 200) });
        history.push({ role: "tool", content: output });
      }
    }
    return { answer: "(agent reached max turns)", toolTrace };
  }

  async stop() {
    if (this.orchestratorId) await unloadModel({ modelId: this.orchestratorId });
    if (this.ownsEngine) await this.engine.stop();
  }
}
