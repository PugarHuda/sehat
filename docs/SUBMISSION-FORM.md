# DoraHacks submission — ready-to-paste answers

Deadline: June 21, 2026 23:59 UTC · Early-bird: before June 17 · Repo: github.com/PugarHuda/sehat

---

## Product name
Sehat

## One-line / tagline
An offline-first family health assistant — RAG, OCR, voice, vision, agents, and
fine-tuning, 9 AI models on one home PC, 100% on-device via the QVAC SDK.

## Team hashtag
#teamSehat

## Tracks
General Purpose (main device: desktop ≤ 32 GB RAM) + Our Psy models (MedPsy is the brain)

## Description (paste)
Sehat turns one ordinary family PC into a private health hub. Lab results,
prescriptions and doctor notes (typed, photographed, or imported as CSV) are read
locally and indexed into a private RAG store. The family asks questions in any
language — by text or voice — and QVAC MedPsy-4B answers with citations and
cross-document trend analysis. It is proactive: it scans the records and flags
rising or abnormal vitals, then writes (and can speak) a plain-language briefing.

Everything runs on-device through the QVAC SDK — no cloud, no accounts, no data
leaving the home network. Sehat uses the full QVAC stack: the MedPsy Psy model
(verified ~16× faster first-token than Google's MedGemma-4B on our GTX 1660
Super), EmbeddingGemma RAG, Whisper STT + Supertonic TTS for a hands-free voice
loop, Gemma-4B vision, OCR, Bergamot translation, a Qwen3 multi-agent
orchestrator with tool calling, P2P delegated inference over Holepunch, and LoRA
fine-tuning with QVAC Fabric on the real QVAC Genesis-I medical dataset.

Extra touches that make it a real product: a family dashboard with trend
sparklines and per-member detail, "just say it" auto-capture from chat, an
offline Emergency QR, reminders, one-click export, multi-user invite over the
LAN, prompt-injection resistance, and an installable PWA.

Educational/personal-organization tool — not a medical device; not for diagnosis.

## What makes it stand out (paste)
- Whole QVAC stack in one app: model (MedPsy) + dataset (Genesis) + fine-tuning
  (Fabric) + RAG + multimodal + voice + multi-agent tool calling + P2P.
- Independently reproduced MedPsy's efficiency on a 4-year-old consumer GPU.
- Honest, verifiable evidence: audit log, SDK profiler export, 22/22 automated
  QA + OCR sweep, full remote-API disclosure, hardware reports.
- Real on-device security: resists document prompt-injection (tested).

## Team
- (your name / role / background) — fill in
- Location: (fill in)

## Repo
https://github.com/PugarHuda/sehat  (Apache-2.0, public)

## Demo video
(YouTube unlisted link — record per docs/DEMO-VIDEO-SCRIPT.md, ≤ 5 min)

## Prior work disclosure
Project started June 11, 2026, entirely within the hackathon window. Built on the
public @qvac/sdk (npm, v0.12.2) and QVAC models/datasets. No pre-existing code
reused. Demo data is synthetic; no real medical records.

## Hardware (declared)
- Desktop (main): Intel Core i3-12100F (4C/8T) · 16 GB DDR4 · NVIDIA GTX 1660
  Super 6 GB · Windows 11. Evidence in artifacts/hardware/.
- Phone (client): Xiaomi Redmi Note 10 Pro · Snapdragon 732G · Android.

## Remote APIs
None for AI. Only one-time model/dataset downloads (QVAC registry / HuggingFace)
and P2P transport between the user's own devices — see remote-apis.yaml.

## Reproducibility
Node.js ≥ 22; `npm install`; then `npm start` (app) or the per-feature `npm run`
demos in the README. First run downloads models once, then fully offline.

---

## Final pre-submit checklist (do these)
- [ ] Record demo video (≤ 5 min, YouTube unlisted) — docs/DEMO-VIDEO-SCRIPT.md
- [ ] Screenshots: Task Manager Performance tab + phone About screen → artifacts/hardware/
- [ ] Fresh audit-log: delete artifacts/audit-log.jsonl, run the demos once, commit
- [ ] Post the "Join" + a few update posts (docs/X-POSTS-SINGLE.md), tag @QVAC
- [ ] Confirm repo is public + Apache-2.0 (it is)
- [ ] Submit on DoraHacks before June 17 (early bird)
