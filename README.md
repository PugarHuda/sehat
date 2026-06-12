# MedNest 🏠🩺

**Offline-first family health assistant — 100% on-device AI via the [QVAC SDK](https://qvac.tether.io).**

Built for **QVAC Hackathon I – Unleash Edge AI** (June 2026).
Tracks: **General Purpose** + **Psy Models** · Build in Public: `#teamMedNest`

## What it does

MedNest turns a regular family desktop into a private health hub:

1. **Ingest** — scan lab results, prescriptions, and medical letters (PDF/photo). Local OCR extracts the text; embeddings index it into a private vector store.
2. **Ask** — ask questions about your family's health records by voice or text ("What was Dad's cholesterol trend over the last 3 tests?"). MedPsy reasons over the retrieved documents, fully offline.
3. **Reach** — any budget phone in the house becomes a client via QVAC P2P delegated inference: the phone sends the question, the desktop computes, the answer comes back. No cloud, no account, no data ever leaving your home.

> ⚠️ MedNest is an educational/personal-organization tool. It is **not** a medical device and does not provide diagnosis or treatment advice. Always consult a healthcare professional.

## Why edge AI

Health records are the most sensitive data a family owns. With QVAC, nothing is uploaded anywhere: inference, embeddings, RAG, OCR, and speech all run on hardware we own. Zero API bills, works during internet outages, and a $200 phone gets flagship-grade AI by borrowing the desktop's GPU over P2P.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Desktop node (GTX 1660 Super, 16 GB RAM)   │
│                                             │
│   @qvac/sdk                                 │
│   ├─ MedPsy (LLM, GPU)     — reasoning      │
│   ├─ Embeddings model      — RAG index      │
│   ├─ OCR                   — lab results    │
│   ├─ STT / TTS             — voice Q&A      │
│   └─ P2P provider          — serves peers   │
└──────────────▲──────────────────────────────┘
               │ QVAC P2P delegated inference
┌──────────────┴──────────────────────────────┐
│  Phone client (Xiaomi Redmi Note 10 Pro)    │
│  ask by voice/photo → answer comes back     │
└─────────────────────────────────────────────┘
```

## Hardware (declared for verification)

| Device | Specs |
|---|---|
| Desktop (main, General Purpose track) | Intel Core i3-12100F (4C/8T) · 16 GB DDR4 · NVIDIA GTX 1660 Super 6 GB · Windows 11 |
| Phone (P2P client) | Xiaomi Redmi Note 10 Pro · Snapdragon 732G · Android |

System profiler screenshots: see [`artifacts/hardware/`](artifacts/hardware/).

## Reproducibility

```bash
# Requirements: Node.js >= 22, ~8 GB free disk for models
git clone <this-repo>
cd mednest
npm install
npm run smoke     # loads a model via @qvac/sdk and runs one completion + audit log
npm start         # full app (desktop node)
```

First run downloads model weights (one-time); everything afterwards is fully offline.

## Artifacts (hackathon evidence bundle)

- [`remote-apis.yaml`](remote-apis.yaml) — full disclosure of every remote call (spoiler: no cloud AI)
- [`artifacts/audit-log.json`](artifacts/) — structured log of the standard demo run: model loads/unloads, per-call prompt, tokens, TTFT, tokens/sec
- [`artifacts/hardware/`](artifacts/hardware/) — system profiler screenshots
- Demo video: _link to be added in submission_

## License

[Apache 2.0](LICENSE)
