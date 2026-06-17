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

### Vision — "Describe the problem which this project solves"  (MAX 256 chars)
Paste (248 chars):
```
Sehat runs a family health assistant 100% on one home PC via the QVAC SDK — no cloud, no accounts. Add labs by text, photo or voice; MedPsy-4B answers with citations in any language and flags bad trends. 9 on-device models on a 6 GB GPU. #teamSehat
```
Shorter alt (230 chars):
```
Sehat puts a whole family health assistant on one home PC — 100% on-device via the QVAC SDK. No cloud, no accounts. Ask in any language by text or voice; MedPsy-4B answers from your own labs with citations. 9 models, 6 GB GPU. #teamSehat
```
(The longer narrative — for the video description / README — is in the repo README.)

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
