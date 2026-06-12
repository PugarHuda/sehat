# MedNest — Build Plan (target: submit June 13–14 for Early Bird)

Today: June 11. Hard deadline: June 21 23:59 UTC. Early bird: June 14 (per Official Rules; Prizes page says June 17 — assume the stricter one).

## Milestones

### M1 — Core inference works (June 11)
- [x] Repo scaffold: license, README, remote-apis.yaml, .gitignore
- [ ] `npm install @qvac/sdk` succeeds on Windows
- [ ] Smoke test: load small LLM, run completion, measure TTFT/TPS
- [ ] Audit logger module (JSON lines: model load/unload, prompt, tokens, TTFT, tok/s)
- [ ] Find MedPsy model id in QVAC model registry; verify it loads on GTX 1660S

### M2 — RAG over health documents (June 12)
- [ ] Embeddings model + ragSaveEmbeddings/ragSearch
- [ ] Sample (synthetic!) family health documents for the demo
- [ ] OCR pipeline: photo/PDF of lab result → text → indexed
- [ ] Q&A loop: question → RAG retrieve → MedPsy answer with citations

### M3 — Voice + P2P (June 13)
- [ ] STT (ask by voice) + TTS (spoken answer)
- [ ] startQVACProvider on desktop; phone client via P2P delegation
- [ ] Phone UX: simplest thing that works (web page served on LAN or minimal client)

### M4 — Submission artifacts (June 13–14)
- [ ] Standard demo run → artifacts/audit-log.json
- [ ] Hardware screenshots (msinfo32 desktop + phone About screen)
- [ ] Demo video ≤ 5 min, YouTube unlisted
- [ ] README reproducibility tested from clean clone
- [ ] DoraHacks submission form (tracks: General Purpose + Psy Models, hashtag #teamMedNest)

### Ongoing — Build in Public
- [ ] Day 1 post on X: tag @QVAC + #teamMedNest (setup photo + what we're building)
- [ ] Progress posts every 1–2 days (working TTFT numbers, P2P demo clip, bugs/aha moments)
- [ ] Archive any livestreams

## Safety rails (disqualification risks)
- ALL inference through @qvac/sdk only — no other inference libs
- Demo data must be synthetic, never real medical records
- Disclose any new remote call in remote-apis.yaml immediately
- Video ≤ 5 min, unlisted; log must match video
