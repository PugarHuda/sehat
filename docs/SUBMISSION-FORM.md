# DoraHacks BUIDL submission — ready-to-paste (maps to the exact form fields)

Deadline **2026-06-22 06:59** · Build period Jun 1–21 · Winners Jul 3 · Repo: github.com/PugarHuda/sehat

---

### BUIDL (project) name
```
Sehat — On-Device Family Health AI
```
(or just `Sehat` if you prefer a short name)

### BUIDL logo
Upload `assets/logo-480.png` (480×480 PNG, on-brand). ✅ ready

### Vision — "Describe the problem which this project solves"
```
Health records are the most private data a family owns, yet today's health apps
push lab results, prescriptions and notes into someone else's cloud — behind
accounts, subscriptions, and a network connection.

Sehat solves this by running an entire family health assistant on one ordinary
home PC, 100% on-device via the QVAC SDK — no cloud, no accounts, nothing ever
leaving the house. You add records by typing, photographing (OCR), voice, or CSV;
Sehat indexes them into a private RAG store and answers questions in any language,
by text or voice, with citations to the exact document — powered by QVAC's own
MedPsy-4B medical model. It is proactive: it scans the records and warns you when
a vital is trending the wrong way, with a plain-language briefing it can speak
aloud. It ships as a one-double-click desktop app.

It proves edge AI is production-ready: nine on-device models (medical reasoning,
RAG embeddings, speech-to-text, text-to-speech, OCR, vision, translation, agent
orchestration, plus a LoRA fine-tune on QVAC's Genesis medical dataset) all run on
a 4-year-old 6 GB GTX 1660 Super — with first token in ~120 ms, ~16× faster than
Google's MedGemma-4B on the same prompt.

Educational / personal-organization tool — not a medical device, not for diagnosis.
```

### Is this BUIDL an AI Agent?  →  **No**
(Sehat is an on-device health *assistant/app*. It does include an optional
multi-agent mode — a Qwen3 orchestrator with tool calling — but the product itself
is an application, not an autonomous agent. Choose "No"; mention agent mode in the video.)

### Category
General Purpose + "Our Psy models" (MedPsy is the brain). Tags: AI, Edge Computing, Privacy, Open Source.

### GitHub *
```
https://github.com/PugarHuda/sehat
```

### Project website (optional)
Leave blank, or use the repo URL.

### Demo video *  (REQUIRED, YouTube)
- Fast path: upload `assets/social/shots/sehat-demo.mp4` to YouTube (Unlisted) and paste the link.
- Better: record a ≤5-min walkthrough per `docs/DEMO-VIDEO-SCRIPT.md` (show offline: chat+citations,
  voice, dashboard/alerts, desktop app, Task Manager GPU), upload Unlisted, paste link.
```
(paste YouTube link here)
```

### Social links (at least one)
```
https://x.com/<your-handle>          ← your X account (where #teamSehat posts live)
https://github.com/PugarHuda/sehat   ← repo
```
Put **#teamSehat** somewhere in the submission text so the Build-in-Public prize counts.

---

### Evidence bundle (for the 3-stage verification) — already in the repo
- Apache-2.0 license + README with reproducibility (`npm install` → `npm start`).
- `artifacts/` audit log + SDK profiler export; `BENCHMARKS.md`; QA 22/22 + OCR 13/13.
- `remote-apis.yaml` (no AI cloud calls; only one-time model downloads + own-device P2P).
- Hardware: i3-12100F · 16 GB · GTX 1660 Super 6 GB · Win 11 (screenshots → artifacts/hardware/).

### Final pre-submit checklist
- [ ] Upload logo (assets/logo-480.png) + BUIDL name + Vision + GitHub
- [ ] Record/upload demo video (YouTube Unlisted) and paste link  ← only true blocker left
- [ ] Add X + GitHub social links; include #teamSehat
- [ ] Add hardware screenshots to artifacts/hardware/ and commit
- [ ] Post on X (#teamSehat, tag @QVAC) — see docs/X-BUILD-IN-PUBLIC.md (media ready)
- [ ] Submit before 2026-06-22 06:59
```
```
