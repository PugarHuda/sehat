# Sehat 🏠🩺

**Offline-first family health assistant — 100% on-device AI via the [QVAC SDK](https://qvac.tether.io).**

Built for **QVAC Hackathon I – Unleash Edge AI** (June 2026).
Tracks: **General Purpose** + **Psy Models** · Build in Public: `#teamSehat`

> **Powered by QVAC MedPsy-4B** — Tether's own edge medical model. We independently
> reproduced its efficiency on a GTX 1660 Super: **16x faster TTFT and +34% throughput
> vs Google's MedGemma-4B** on the same prompt (see
> [`artifacts/medpsy-vs-medgemma.md`](artifacts/medpsy-vs-medgemma.md)). Run
> `SEHAT_MODEL=medgemma npm start` to A/B it yourself.

## What it does

Sehat turns a regular family desktop into a private health hub:

1. **Ingest** — lab results, prescriptions, and doctor notes go into a private, on-disk
   vector index. Paper documents enter by photo: local OCR reads them (0.94 avg
   confidence in our demo) straight into the index.
2. **Ask** — by text or voice. MedGemma reasons over the retrieved documents and answers
   with `[doc: ...]` citations — including cross-document trend analysis
   ("compare Dad's June labs against March").
3. **Reach** — any phone in the house gets access two ways:
   - **Web UI** on the LAN: open `https://<desktop-ip>:8787`, tokens stream live to the
     phone, with a 🎙️ mic button (in-browser 16 kHz WAV → local Parakeet STT) and a
     🇮🇩 toggle to ask and be answered in Bahasa Indonesia (local Bergamot NMT).
   - **QVAC P2P delegated inference**: a client device loads *no model at all* and runs
     completions on the desktop via Holepunch DHT, addressed by public key — no server,
     no port-forwarding, works across NATs.
4. **Orchestrate** — a multi-agent mode (`npm run demo:agent`): a Qwen3 1.7B orchestrator
   with QVAC tool calling plans the work — `search_records` (RAG), `calculate_change`
   (deterministic math, no LLM arithmetic), and `consult_medgemma` (hands medical
   interpretation to the MedGemma specialist agent).
5. **Resist attacks** — documents are treated as untrusted data. `npm run test:injection`
   ingests a poisoned document (role-play hijack + canary exfiltration + phishing) and
   verifies the assistant answers the legitimate fact, refuses the injection, and warns
   the user the document looks tampered with. PASS on record.

> ⚠️ Sehat is an educational/personal-organization tool. It is **not** a medical device
> and does not provide diagnosis or treatment. Always consult a healthcare professional.

## Measured performance (GTX 1660 Super, all local)

| Workload | Result |
|---|---|
| Llama 3.2 1B Q4, GPU (`gpu_layers: 99`) | **127.6 tok/s · TTFT 116 ms** (CPU-only baseline: 31.6 tok/s) |
| MedGemma 4B Q4_1, GPU | 44.4 tok/s standalone · 22–35 tok/s with RAG context |
| RAG vector search (EmbeddingGemma 300M) | 13–171 ms |
| OCR of a photographed lab report | 54 blocks · 0.94 avg confidence · 11.3 s |
| STT (Parakeet CTC 0.6B) on spoken question | 451–564 ms |
| Multi-agent run (6 tool calls incl. MedGemma consult) | 33.7 s end-to-end |
| Vision: photo of lab report → full structured analysis (no OCR) | every value read correctly; 43.7 tok/s generation (SDK stats), 33.6 s wall-clock TTFT — 5.4 GB model partially CPU-offloaded on 6 GB VRAM |
| **LoRA fine-tune (QVAC Fabric)**: Qwen3 600M → "Sehat style" | **238 s for 2 epochs on the GTX 1660 Super**; train loss 3.00 → 1.77; visible style shift (verbose jargon → plain-language lifestyle framing) |
| ID↔EN translation (Bergamot, CPU) | sub-second per message |
| P2P delegated completion (no local model) | TTFT 0.9–1.3 s; throughput 4.8 tok/s streamed / ~7.7 tok/s batched — transport-bound in SDK v0.12.2, documented honestly |

All numbers come from the committed [`artifacts/audit-log.jsonl`](artifacts/audit-log.jsonl) —
every model load and inference call is logged with prompt, token counts, TTFT, and tok/s.

## Models used (all via @qvac/sdk, all on-device)

| Role | Model |
|---|---|
| Medical reasoning (primary brain) | **QVAC MedPsy-4B Q4_K_M** (Tether's Psy model, from HF) |
| Medical reasoning (A/B fallback) | `MEDGEMMA_4B_IT_Q4_1` (Google, for comparison only) |
| Orchestrator agent (tool calling) | `QWEN3_1_7B_INST_Q4` |
| Embeddings / RAG | `EMBEDDINGGEMMA_300M_Q8_0` |
| Speech-to-text | `PARAKEET_CTC_0_6B_Q8_0` |
| Text-to-speech | `TTS_EN_SUPERTONIC_Q8_0` |
| OCR | `OCR_LATIN_RECOGNIZER_1` |
| Translation ID↔EN | `BERGAMOT_ID_EN` + `BERGAMOT_EN_ID` |
| Vision (photo understanding) | `GEMMA4_4B_MULTIMODAL_Q4_K_M` + `MMPROJ_GEMMA4_4B_MULTIMODAL_F16` |
| Fine-tune base (QVAC Fabric LoRA) | `QWEN3_600M_INST_Q4` + `data/finetune/*.jsonl` (16 bilingual examples) |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Desktop node — i3-12100F · 16 GB · GTX 1660 Super 6 GB   │
│                                                          │
│   @qvac/sdk (single API for everything below)            │
│   ├─ MedGemma 4B (GPU)        — reasoning & answers       │
│   ├─ EmbeddingGemma 300M      — private RAG workspace     │
│   ├─ OCR (ONNX)               — paper → index             │
│   ├─ Parakeet STT + Supertonic TTS — voice loop           │
│   ├─ HTTP server :8787        — phone web UI (SSE)        │
│   └─ startQVACProvider()      — P2P provider (DHT)        │
└───────────▲──────────────────────────────▲───────────────┘
            │ LAN (web UI, streaming)       │ QVAC P2P delegation
┌───────────┴───────────────┐  ┌───────────┴───────────────┐
│ Phone (Redmi Note 10 Pro) │  │ Any QVAC client device     │
│ browser chat UI           │  │ loadModel({ delegate })    │
└───────────────────────────┘  └───────────────────────────┘
```

## Hardware (declared for verification)

| Device | Specs |
|---|---|
| Desktop (main, General Purpose track) | Intel Core i3-12100F (4C/8T) · 16 GB DDR4 · NVIDIA GTX 1660 Super 6 GB · Windows 11 |
| Phone (web-UI client) | Xiaomi Redmi Note 10 Pro · Snapdragon 732G · Android |

Evidence: [`artifacts/hardware/msinfo32-report.txt`](artifacts/hardware/) + screenshots.

## Reproducibility

Requirements: Node.js ≥ 22, ~6 GB free disk for models, NVIDIA GPU optional but recommended.

```bash
git clone <this-repo> && cd sehat
npm install                # flaky network? add --fetch-retries 5

npm run smoke              # 1. load 1B model, one completion + audit log
npm run test:gpu           # 2. same, GPU-offloaded (expect ~4x speedup)
npm run demo:rag           # 3. ingest 5 sample docs, 3 cited Q&As
npm run demo:ocr           # 4. photo of lab report -> OCR -> RAG -> answer
npm run demo:voice         # 5. TTS question -> STT -> RAG answer -> TTS wav
npm run demo:agent         # 6. multi-agent: Qwen orchestrator + tools + MedGemma
npm run demo:translate     # 7. Bahasa Indonesia round-trip via Bergamot
npm run test:injection     # 8. prompt-injection resistance test (expects PASS)
npm run demo:vision        # 9. photo -> local VLM analysis (5.4 GB download)
npm run demo:finetune      # 10. QVAC Fabric LoRA fine-tune + before/after compare
npm run profile            # 11. evidence run with the SDK's own profiler
npm start                  # 12. phone UI at https://<your-ip>:8787 (mic + ID mode)

npm run provider           # 13a. P2P provider (prints public key)
npm run delegate <pubkey>  # 13b. in a 2nd terminal: delegated inference
```

HTTPS note: `npm start` serves TLS if `certs/sehat.pfx` exists (required for the phone
mic — browsers only allow getUserMedia in secure contexts). Generate one with PowerShell:
`New-SelfSignedCertificate` + `Export-PfxCertificate` (passphrase `sehat-lan`), or delete
`certs/` to fall back to plain HTTP (mic disabled, chat still works).

First run of each demo downloads its models from the QVAC registry (one-time);
afterwards everything works fully offline. All demo documents are **synthetic**
(no real medical data anywhere in this repo).

### Blind relays (NAT traversal)

QVAC supports blind relays — Hyperswarm relay nodes that bridge P2P connections
across NATs/firewalls — via a `QVAC_CONFIG_PATH` config file listing `swarmRelays`
public keys. Sehat's P2P delegation works with this unchanged (the DHT connection
is established by the SDK). We did **not** stand up our own relay infrastructure
for this hackathon, so we document the capability rather than fake a demo; on a
home LAN or with direct DHT connectivity (our demo setup), relays are not needed.

## Artifacts (hackathon evidence bundle)

- [`remote-apis.yaml`](remote-apis.yaml) — every remote call disclosed (no cloud AI, period)
- [`artifacts/audit-log.jsonl`](artifacts/audit-log.jsonl) — structured log: model loads/unloads, prompt, tokens, TTFT, tok/s
- [`artifacts/hardware/`](artifacts/hardware/) — msinfo32 report + system screenshots
- [`artifacts/voice/`](artifacts/voice/) — WAVs from the voice loop demo
- [`docs/DEMO-VIDEO-SCRIPT.md`](docs/DEMO-VIDEO-SCRIPT.md) — 5-minute demo storyboard
- Demo video: _YouTube unlisted link in the submission form_

## License

[Apache 2.0](LICENSE)
