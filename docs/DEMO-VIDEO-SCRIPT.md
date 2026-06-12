# Sehat — Demo Video Script v2 (target ≤ 5:00)

Record at 1080p, terminal font ≥ 18 pt. Speak English (international judges).
Pre-cache all models (run every demo once before recording). Start a FRESH
audit log for the on-camera run (delete artifacts/audit-log.jsonl first) and
commit it after — judges cross-check log vs footage.

## 0:00–0:25 — Hook
- Title card + voiceover: "This is Sehat: a family health assistant running
  9 AI models, 100% on this one PC — built on the QVAC SDK. No cloud. Watch."
- Show msinfo32 + Task Manager GPU tab (GTX 1660 Super, 16 GB).
- **Pull the network cable / toggle Wi-Fi off on camera.** Keep the offline
  icon visible from here on. Strongest single proof in the video.

## 0:25–1:10 — RAG + citations (desktop)
- `npm run demo:rag` — narrate over ingestion, then highlight the glucose-trend
  answer combining two lab reports + doctor's plan with [doc: ...] citations.
- Point at stats: "search 13 ms, first token 1.3 s, ~35 tok/s."

## 1:10–1:50 — Photo → OCR → updated answer
- Show the printed June lab report, then `npm run demo:ocr`.
- "Local OCR, 94% confidence, straight into the same private index — and now
  it compares June against March: everything improved."

## 1:50–2:30 — Phone: voice + Bahasa Indonesia (the daily-life shot)
- Split screen: Redmi Note 10 Pro + desktop.
- On the phone (https://<ip>:8787): tap 🎙️, ASK BY VOICE, show the question
  transcribe itself and the answer stream in.
- Toggle 🇮🇩, ask "Obat apa yang diminum Sari?" — answer comes back in
  Indonesian. "A $200 phone, talking to the family PC, in our own language."

## 2:30–3:15 — Multi-agent tool calling
- `npm run demo:agent` — narrate the live tool trace:
  "The orchestrator searches records... hands the math to a calculator tool —
  no LLM arithmetic — and can consult the MedGemma specialist. Six tool calls,
  exact answer: cholesterol down 6.5%."

## 3:15–3:50 — Security + fine-tuning (rapid fire)
- `npm run test:injection` — show the PASS table: "We poisoned a document with
  a jailbreak and a phishing payload. Sehat answers the real fact, refuses the
  attack, and warns the user."
- Cut to pre-recorded `npm run demo:finetune` loss curve: "And with QVAC
  Fabric we LoRA-tuned a model to our house style in four minutes — on this
  same GPU. Loss 3.0 to 1.77."

## 3:50–4:25 — P2P delegation + vision (pre-recorded cuts OK)
- Two terminals: `npm run provider` → public key → `npm run delegate <key>`:
  "This client has NO model. It connects by public key over a DHT — no server,
  no port forwarding — and streams MedGemma from the family PC."
- One vision shot: `npm run demo:vision` output over the lab photo: "and the
  same machine can simply look at a document and explain it."

## 4:25–5:00 — Evidence & close
- Open artifacts/audit-log.jsonl + artifacts/profiler-export.json: "every load
  and every call is logged — TTFT, tokens/sec — and matches what you just saw."
- Open remote-apis.yaml: "full disclosure: zero cloud AI."
- "Sehat. Apache 2.0, github.com/PugarHuda/sehat, #teamSehat. Local AI isn't
  the future — it's already running in our living room."

## Recording checklist
- [ ] All models pre-downloaded; every demo rehearsed once
- [ ] Fresh artifacts/audit-log.jsonl for the on-camera run; commit it after
- [ ] Network disconnect ON CAMERA (after models cached)
- [ ] Phone screen visible with URL bar + cert-warning already accepted
- [ ] Pre-record the slow parts (finetune, vision, provider/delegate) and cut in
- [ ] ≤ 5:00, YouTube unlisted, link into DoraHacks form
