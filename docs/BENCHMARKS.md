# Sehat — Benchmarks & Evidence (one glance)

All measured **on-device** on a single mid-range PC, no cloud. Numbers come from
the committed [`artifacts/audit-log.jsonl`](../artifacts/audit-log.jsonl),
[`artifacts/qa-report.md`](../artifacts/qa-report.md), and
[`artifacts/profiler-export.json`](../artifacts/profiler-export.json).

**Hardware:** Intel Core i3-12100F · 16 GB DDR4 · NVIDIA GTX 1660 Super 6 GB · Windows 11.

## Headline

| Metric | Result |
|---|---|
| **QVAC MedPsy-4B (our brain), GPU** | **TTFT 343 ms · 59.7 tok/s** |
| MedGemma-4B (Google) — same prompt/GPU | TTFT 5,626 ms · 44.4 tok/s |
| **→ MedPsy advantage** | **~16× faster first token, +34% throughput** |
| Automated QA (live server) | **22 / 22 pass** |
| OCR robustness sweep (13 documents) | **13 / 13 pass** |
| QVAC capability areas used meaningfully | **13** |

## Inference (GPU, `gpu_layers: 99`)

| Model | Role | Speed |
|---|---|---|
| MedPsy-4B Q4_K_M | medical reasoning (brain) | 343 ms TTFT · 59.7 tok/s |
| Llama 3.2 1B Q4 | baseline | 116 ms TTFT · 127.6 tok/s (CPU: 31.6) |
| Qwen3-1.7B | agent orchestrator | multi-tool runs within 8k ctx |
| Gemma4-4B multimodal | vision (photo→analysis) | 43.7 tok/s (SDK stats) |

## RAG (embeddings: GTE-large FP16)

> Current embedder is GTE-large FP16 (higher-accuracy retrieval). The latency
> figures below were measured on the earlier EmbeddingGemma-300M embedder; the
> `ragReindex` (IVF) speedup is embedder-independent.

| Metric | Result |
|---|---|
| Vector search latency | 13–171 ms |
| `ragReindex` on 201 docs | search 125 ms → **11 ms** |
| Ingest | ~27 ms/doc |
| Needle retrieval (1 doc in 289) | found ✅ |

## Voice / OCR / Translation

| Capability | Result |
|---|---|
| STT — Whisper small (multilingual, auto-detect) | clean transcription, any language |
| TTS — Supertonic | real-time spoken answers |
| OCR — 13 docs (print, Rx, tables, ID-language, handwriting 0.82, rotated 0.66, 11pt) | 13/13 key-strings recovered |
| Translation — Bergamot ID↔EN | sub-second/message |

## Fine-tuning (QVAC Fabric, LoRA, on the GTX 1660 Super)

| Run | Result |
|---|---|
| Qwen3-600M on hand-written "Sehat style" | loss 3.00 → 1.77, 238 s / 2 epochs |
| Qwen3-600M on **real QVAC Genesis-I medical data** | loss 4.39 → 1.51, val acc 68.8% |

## P2P delegated inference (Holepunch)

| Metric | Result |
|---|---|
| Client with **no local model** → home node by public key | works across NAT, no port-forwarding |
| Throughput | TTFT 0.9–1.3 s; 4.8 tok/s streamed / ~7.7 batched (transport-bound, documented) |

## Security / quality

| Check | Result |
|---|---|
| Prompt-injection (poisoned doc: jailbreak + canary + phishing) | resisted; real fact still answered |
| System-prompt extraction | refused |
| Medication start/stop questions | always deferred to a doctor (no yes/no) |
| Remote AI APIs | **none** — full disclosure in [remote-apis.yaml](../remote-apis.yaml) |
