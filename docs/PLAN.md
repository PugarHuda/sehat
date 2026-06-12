# Sehat — Build Plan (target: submit June 13–14 for Early Bird)

Today: June 11. Hard deadline: June 21 23:59 UTC. Early bird: June 14 (per Official Rules; Prizes page says June 17 — assume the stricter one).

## Milestones

### M1 — Core inference works (June 11) ✅
- [x] Repo scaffold: license, README, remote-apis.yaml, .gitignore
- [x] `npm install @qvac/sdk` succeeds on Windows (v0.12.2; retry needed on flaky network)
- [x] Smoke test: Llama 3.2 1B — CPU 31.6 tok/s, TTFT 1548 ms
- [x] GPU offload (`gpu_layers: 99, "main-gpu": "dedicated"`) — 127.6 tok/s, TTFT 116 ms
- [x] Audit logger module (JSON lines: model load/unload, prompt, tokens, TTFT, tok/s)
- [x] Medical model = MEDGEMMA_4B_IT_Q4_1 (SDK constant; registry blob unsloth/medgemma-4b-it-GGUF)

### M2 — RAG over health documents (June 12) ✅ (OCR pending)
- [x] EmbeddingGemma 300M + ragIngest/ragSearch (workspace "sehat-family")
- [x] 5 synthetic family health documents (Santoso family)
- [x] Q&A loop: RAG retrieve (13-140ms) → MedGemma answer with [doc: ...] citations
- [x] Cross-document trend reasoning verified (glucose Sept'25 vs Mar'26 + doctor plan)
- [ ] OCR pipeline: photo/PDF of lab result → text → indexed

### M3 — Voice + P2P (June 13)
- [x] startQVACProvider on desktop → public key via DHT (Holepunch)
- [x] Delegated inference verified: client with NO local model, TTFT 934ms over P2P
      (streaming throughput 5.6 tok/s — per-token P2P overhead; investigate or document)
- [x] Voice loop: Supertonic TTS → Parakeet STT (564 ms) → RAG+MedGemma → TTS answer.wav
- [x] OCR: photo of June lab report → 54 blocks @ 0.94 conf → ingested → cross-month
      comparison answer verified (102 vs 118 glucose etc.)
- [x] Phone UX: zero-dep HTTP server + mobile chat UI, SSE token streaming,
      tested OK on localhost (phone test on LAN pending — user action)

### M4 — Submission artifacts (June 13–14)
- [ ] Standard demo run → artifacts/audit-log.json
- [ ] Hardware screenshots (msinfo32 desktop + phone About screen)
- [ ] Demo video ≤ 5 min, YouTube unlisted
- [ ] README reproducibility tested from clean clone
- [ ] DoraHacks submission form (tracks: General Purpose + Psy Models, hashtag #teamSehat)

### Ongoing — Build in Public
- [ ] Day 1 post on X: tag @QVAC + #teamSehat (setup photo + what we're building)
- [ ] Progress posts every 1–2 days (working TTFT numbers, P2P demo clip, bugs/aha moments)
- [ ] Archive any livestreams

## Safety rails (disqualification risks)
- ALL inference through @qvac/sdk only — no other inference libs
- Demo data must be synthetic, never real medical records
- Disclose any new remote call in remote-apis.yaml immediately
- Video ≤ 5 min, unlisted; log must match video
