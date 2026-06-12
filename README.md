# MedNest 🏠🩺

**Offline-first family health assistant — 100% on-device AI via the [QVAC SDK](https://qvac.tether.io).**

Built for **QVAC Hackathon I – Unleash Edge AI** (June 2026).
Tracks: **General Purpose** + **Psy Models** · Build in Public: `#teamMedNest`

## What it does

MedNest turns a regular family desktop into a private health hub:

1. **Ingest** — lab results, prescriptions, and doctor notes go into a private, on-disk
   vector index. Paper documents enter by photo: local OCR reads them (0.94 avg
   confidence in our demo) straight into the index.
2. **Ask** — by text or voice. MedGemma reasons over the retrieved documents and answers
   with `[doc: ...]` citations — including cross-document trend analysis
   ("compare Dad's June labs against March").
3. **Reach** — any phone in the house gets access two ways:
   - **Web UI** on the LAN: open `http://<desktop-ip>:8787`, tokens stream live to the phone.
   - **QVAC P2P delegated inference**: a client device loads *no model at all* and runs
     completions on the desktop via Holepunch DHT, addressed by public key — no server,
     no port-forwarding, works across NATs.

> ⚠️ MedNest is an educational/personal-organization tool. It is **not** a medical device
> and does not provide diagnosis or treatment. Always consult a healthcare professional.

## Measured performance (GTX 1660 Super, all local)

| Workload | Result |
|---|---|
| Llama 3.2 1B Q4, GPU (`gpu_layers: 99`) | **127.6 tok/s · TTFT 116 ms** (CPU-only baseline: 31.6 tok/s) |
| MedGemma 4B Q4_1, GPU | 44.4 tok/s standalone · 22–35 tok/s with RAG context |
| RAG vector search (EmbeddingGemma 300M) | 13–171 ms |
| OCR of a photographed lab report | 54 blocks · 0.94 avg confidence · 11.3 s |
| STT (Parakeet CTC 0.6B) on spoken question | 564 ms |
| P2P delegated completion (no local model) | TTFT 934 ms over the DHT hop |

All numbers come from the committed [`artifacts/audit-log.jsonl`](artifacts/audit-log.jsonl) —
every model load and inference call is logged with prompt, token counts, TTFT, and tok/s.

## Models used (all via @qvac/sdk, all on-device)

| Role | Model |
|---|---|
| Medical reasoning | `MEDGEMMA_4B_IT_Q4_1` (Psy Models track) |
| Embeddings / RAG | `EMBEDDINGGEMMA_300M_Q8_0` |
| Speech-to-text | `PARAKEET_CTC_0_6B_Q8_0` |
| Text-to-speech | `TTS_EN_SUPERTONIC_Q8_0` |
| OCR | `OCR_LATIN_RECOGNIZER_1` |

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
git clone <this-repo> && cd mednest
npm install                # flaky network? add --fetch-retries 5

npm run smoke              # 1. load 1B model, one completion + audit log
npm run test:gpu           # 2. same, GPU-offloaded (expect ~4x speedup)
npm run demo:rag           # 3. ingest 5 sample docs, 3 cited Q&As
npm run demo:ocr           # 4. photo of lab report -> OCR -> RAG -> answer
npm run demo:voice         # 5. TTS question -> STT -> RAG answer -> TTS wav
npm start                  # 6. phone UI at http://<your-ip>:8787

npm run provider           # 7a. P2P provider (prints public key)
npm run delegate <pubkey>  # 7b. in a 2nd terminal: delegated inference
```

First run of each demo downloads its models from the QVAC registry (one-time);
afterwards everything works fully offline. All demo documents are **synthetic**
(no real medical data anywhere in this repo).

## Artifacts (hackathon evidence bundle)

- [`remote-apis.yaml`](remote-apis.yaml) — every remote call disclosed (no cloud AI, period)
- [`artifacts/audit-log.jsonl`](artifacts/audit-log.jsonl) — structured log: model loads/unloads, prompt, tokens, TTFT, tok/s
- [`artifacts/hardware/`](artifacts/hardware/) — msinfo32 report + system screenshots
- [`artifacts/voice/`](artifacts/voice/) — WAVs from the voice loop demo
- [`docs/DEMO-VIDEO-SCRIPT.md`](docs/DEMO-VIDEO-SCRIPT.md) — 5-minute demo storyboard
- Demo video: _YouTube unlisted link in the submission form_

## License

[Apache 2.0](LICENSE)
