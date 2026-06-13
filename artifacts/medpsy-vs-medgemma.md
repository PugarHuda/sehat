# QVAC MedPsy-4B vs MedGemma-4B on consumer hardware (GTX 1660 Super 6 GB)

Same prompt, same machine, same quantization class (Q4), both fully GPU-offloaded
via @qvac/sdk `gpu_layers: 99`. Prompt: the prediabetes lab-explanation question
from `src/medgemma-test.js` / `src/medpsy-test.js`.

| Metric | MedGemma-4B Q4_1 | **QVAC MedPsy-4B Q4_K_M** | Delta |
|---|---|---|---|
| TTFT (first token) | 5,626 ms | **343 ms** | **16.4x faster** |
| Throughput | 44.4 tok/s | **59.7 tok/s** | **+34%** |
| Tokens (thinking ON) | n/a | 1,309 (incl. ~520 `<think>`) | — |
| Tokens (thinking OFF, `reasoning_budget: 0`) | 1,046 | 1,403 | +34% more verbose |
| Model file | 2.47 GB | 2.72 GB | similar |
| Source | QVAC P2P registry | HuggingFace `qvac/MedPsy-4B-GGUF` via SDK HTTP source | — |

## Honest notes

- The **TTFT and throughput gains are dramatic and reproducible** — MedPsy is the
  clearly better engine for interactive chat on this GPU.
- We could **not reproduce the "3.2x fewer tokens" claim on this open-ended
  education prompt**: MedPsy answers more thoroughly (structured sections, risk
  factors, follow-up offer). That claim was measured on benchmark-style QA, where
  concise answers are scored; on open prompts MedPsy simply gives richer answers.
  In Sehat's RAG flow we run `reasoning_budget: 0` and instruct conciseness via
  the system prompt.
- Answer quality (subjective): MedPsy's answer was the more clinically structured
  of the two — staging thresholds, risk factors, monitoring advice — while keeping
  the educational-only framing.

Raw runs: `src/medgemma-test.js` output (June 12 AM) and `src/medpsy-test.js`
output (June 12 PM); both logged in `artifacts/audit-log.jsonl`.
