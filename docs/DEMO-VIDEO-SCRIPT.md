# MedNest — Demo Video Script (target ≤ 5:00)

Record at 1080p. OBS scene: screen capture + phone camera (or scrcpy mirror) side by side
where relevant. Speak English (judges are international). Keep terminal font large.

## 0:00–0:30 — Hook & claim
- On camera/voiceover over title slide:
  "This is MedNest — a family health assistant that runs 100% on this PC.
  No cloud, no API keys, no data leaving the house. Built on the QVAC SDK
  with MedGemma. Let me prove it."
- Show: `msinfo32` summary + Task Manager GPU tab (GTX 1660 Super, 16 GB RAM).
- **Disconnect Wi-Fi/Ethernet on camera** (after models are cached) — the whole
  demo runs offline. This is the strongest single visual proof; keep the
  network icon visible for the rest of the video.

## 0:30–1:30 — RAG over family documents (desktop)
- Terminal: `npm run demo:rag` (models already cached so it starts fast).
- Narrate while it ingests 5 synthetic documents.
- Highlight Q1 answer on screen: glucose trend Sept'25 → Mar'26 combined from
  TWO lab reports + the doctor's plan, with [doc: ...] citations.
- Point at the stats line: "vector search in ~100 ms, first token in ~1.3 s,
  ~30 tokens/sec — on a 4-year-old mid-range GPU."

## 1:30–2:20 — Photo → OCR → updated answers
- Show the printed/displayed lab report photo (data/images/...june photo).
- Terminal: `npm run demo:ocr`.
- Narrate: "I photograph Dad's newest lab result. Local OCR reads it —
  94% confidence — it goes into the same private index, and MedGemma now
  compares June against March: everything improved."
- Zoom on the answer showing matching numbers (102 vs 118, 201 vs 228).

## 2:20–3:10 — Voice loop
- Terminal: `npm run demo:voice`.
- Play artifacts/voice/question-44k.wav out loud ("Which vaccination is Rina
  still due for?"), show STT transcription appearing (564 ms), answer streams,
  then play artifacts/voice/answer.wav.
- Narrate: "Speech-to-text, reasoning, and text-to-speech — three more models,
  still zero cloud."

## 3:10–4:10 — Phone + P2P delegation (the wow)
- Split screen: phone (Redmi Note 10 Pro) + desktop terminal.
- Phone browser → http://<desktop-ip>:8787 → ask "What medication does Sari
  take?" → tokens stream onto the phone; stats line shows TTFT + tok/s.
  Narrate: "A 4-year-old budget phone gets GPU-class private AI from the
  family PC over the local network."
- Then the deeper cut: terminal 2 runs `npm run provider`, terminal 3 runs
  `npm run delegate <publicKey>` — point out the client loads NO local model;
  inference is delegated over QVAC's P2P stack (Holepunch DHT), addressed by
  public key, no server in between.

## 4:10–4:45 — Evidence & honesty
- Open artifacts/audit-log.jsonl: point at model_load and inference entries
  (prompt, tokens, TTFT, tok/s) matching what we just saw on screen.
- Open remote-apis.yaml: "full disclosure — the only network the app ever
  touches is the one-time model download and the P2P link between my own
  devices."

## 4:45–5:00 — Close
- "Everything is Apache 2.0 on GitHub, reproducible with npm install + one
  command per demo. MedNest, team #teamMedNest — local AI is ready today."

## Recording checklist
- [ ] Models pre-downloaded (run every demo once before recording)
- [ ] Fresh audit log for the on-camera run (this is the one you commit)
- [ ] Wi-Fi disconnect shown on camera
- [ ] Phone screen visible with URL bar (proves LAN, not internet)
- [ ] Terminal font ≥ 18 pt, dark theme
- [ ] Upload as YouTube **unlisted**, ≤ 5 min
