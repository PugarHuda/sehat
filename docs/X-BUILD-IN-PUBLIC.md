# Build in Public — #teamSehat (ready-to-post)

QVAC Hackathon I rewards the most social team (**USDT 1500**). Rules:
- Hashtag: **#teamSehat** · always tag **@QVAC** · put the hashtag in the submission form.
- Level 1 = join/intro post · Level 2 = progress updates · Level 3 = video updates.
- More posts + more engagement = more points. Be authentic (wins, bugs, "aha" moments).

**Media is ready** in `assets/social/shots/`:
`1-chat.png` `2-family.png` `3-detail.png` `4-alerts.png` `5-invite.png` · video `sehat-demo.mp4`
(all are real captures of the running app, not mockups)

---

## ▸ LEVEL 1 — intro / "what we're building"  [media: 1-chat.png + 2-family.png]
> We're building **Sehat** for the @QVAC hackathon 🩺 — a family health assistant
> that runs **100% on one home PC**. No cloud, no accounts, your records never leave
> the house.
>
> Ask "how has Dad's blood sugar changed?" → it reads your real lab reports and
> answers with citations, by text or voice, in any language.
>
> Why on-device? Health data is the most private data you own. It shouldn't need a
> server. Edge AI makes that possible. #teamSehat

---

## ▸ LEVEL 2 — progress updates (post 1–2 per day)

**P1 — the brain**  [media: 1-chat.png]
> Progress on Sehat 🧠 the brain is @QVAC's own **MedPsy-4B**, running fully
> on-device. On our 4-year-old GTX 1660 Super (6 GB) it hits first token in ~120 ms
> — ~16× faster than Google's MedGemma-4B on the same prompt.
> Small medical model, real reasoning, zero cloud. #teamSehat

**P2 — RAG with citations**  [media: 1-chat.png]
> Sehat doesn't guess — it retrieves. Every answer is grounded in your own
> documents with inline [doc: …] citations (GTE-large embeddings + @QVAC RAG, all
> local). Ask in plain language, even with typos, and it finds the right lab.
> #teamSehat

**P3 — proactive alerts**  [media: 4-alerts.png]
> Sehat doesn't wait to be asked. It scans the family's records and warns you:
> "Budi's glucose is trending up", "Agus's BP is high" — with sparklines and trends,
> generated on-device by MedPsy. Proactive, private health AI. @QVAC #teamSehat

**P4 — the dashboard**  [media: 2-family.png + 3-detail.png]
> Every family member, every vital, on one private dashboard 📊 tap a card for
> trends vs reference ranges, meds, allergies, an offline Emergency QR, and export.
> Built-in sample family included so you can try it instantly. @QVAC #teamSehat

**P5 — voice, any language**  [media: sehat-demo.mp4]
> Talk to Sehat hands-free 🎙️ it transcribes (Whisper), answers from your records
> (MedPsy + RAG), and speaks back (Supertonic) — auto-detecting your language. EN,
> ID, ES, FR… all on the home PC. @QVAC #teamSehat

**P6 — packaged desktop app (milestone)**  [media: sehat-demo.mp4]
> Milestone 🖥️ Sehat is now a real **desktop app**. One double-click → a native
> window, and 9 on-device AI models are running. We packaged the @QVAC worker +
> every model straight into the app with QVAC's Electron tooling. 100% offline.
> #teamSehat

**P7 — an honest bug (aha moment)**  [media: optional 2-family.png]
> Build-in-public honesty 🐞 our "Set name" button did nothing in the desktop
> build. Turns out **Electron silently ignores `window.prompt()`**. Swapped it for
> an in-app modal and it works everywhere now. Little platform gotchas like this are
> the real story of edge AI. @QVAC #teamSehat

**P8 — tested, not demo-ware**  [media: 2-family.png]
> Sehat ships with a real test suite: **22/22 end-to-end cases + 13/13 OCR docs**
> (print, handwriting, rotated, Indonesian) — all green, all on-device on a 6 GB
> GPU. We don't merge unless it's 22/22. @QVAC #teamSehat

---

## ▸ LEVEL 3 — VIDEO  [media: sehat-demo.mp4]
> 60 seconds of Sehat, 100% on-device 🎥 ask about a family member's blood sugar →
> cited answer streams from MedPsy-4B → open the dashboard → trends, alerts &
> Emergency QR. No cloud, no account, runs on a GTX 1660 Super.
> Open source (Apache-2.0): github.com/PugarHuda/sehat — @QVAC #teamSehat

---

### Posting tips
- Pin **Level 1** or **P6 (desktop milestone)**.
- One post every day or two until June 22; reply to your own thread with the next.
- Always tag @QVAC + #teamSehat; attach the matching media (X allows 4 images or 1 video per post).
- The longer pinned narrative versions (L1–L4) live in `docs/X-POSTS-SINGLE.md`.
