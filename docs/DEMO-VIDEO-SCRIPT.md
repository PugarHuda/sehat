# Sehat — Demo Video Script v3 (final timestamps, target 5:00)

Record 1080p. Terminal font ≥ 18 pt. Speak English. Pre-cache every model and
rehearse once. Start a FRESH audit log for the on-camera run
(`del artifacts\audit-log.jsonl`), run the demos, then commit that log — judges
cross-check log vs footage. Phone = Redmi Note 10 Pro on the same Wi-Fi.
Mic/voice needs HTTPS → use `https://192.168.1.16:8787` (accept the cert once);
everything else can use `http://192.168.1.16:8788`.

Pre-record the slow bits (Genesis fine-tune, vision, provider/delegate) and cut
them in so the 5:00 stays tight.

---

**0:00–0:20 — Hook**
- Title card → voiceover: "This is Sehat — a family health assistant running nine
  AI models on this one PC. No cloud. Built on the QVAC SDK with MedPsy. Watch."
- Show msinfo32 + Task Manager → Performance (GTX 1660 Super, 16 GB).

**0:20–0:35 — Prove it's local**
- On camera, toggle Wi-Fi/Ethernet OFF (models already cached). Keep the offline
  icon visible the rest of the video. Strongest single proof.

**0:35–1:15 — Ask (RAG + citations + trend)**
- Phone, Chat tab: "How has Budi's blood sugar changed?"
- Answer streams with `[doc: ...]` citations across 4 visits; point at the
  stats line (TTFT ~0.3–1.3 s, tok/s). Say "MedPsy, on-device, ~16× faster
  first-token than Google's MedGemma on this GPU."

**1:15–1:45 — Any language + voice**
- Tap 🎙️, SPEAK in Bahasa Indonesia: "Bagaimana tren tekanan darah Sari?"
- Show it transcribe (Whisper), answer in Indonesian, and speak the answer back.
  "Auto-detected language, full voice loop, all local."

**1:45–2:15 — Photo → OCR → updated answer**
- Show a printed lab photo (data/images/lab-indonesia-budi-2026-06.png or the
  English one). Add it via 📄, or run `npm run demo:ocr`.
- "Local OCR reads it — even Indonesian, rotated, or small print — into the same
  private index." Ask a follow-up that uses the new numbers.

**2:15–2:45 — Dashboard + proactive alerts**
- Family tab: tap Budi → detail drawer (trend sparklines, reference ranges,
  change vs previous). Then Alerts tab: "Sehat flags Budi's rising glucose
  before you ask," tap 🔊 Listen to hear the spoken briefing.

**2:45–3:10 — Just say it (auto-capture) + family**
- Chat: "My blood pressure today is 128 over 84." → 📌 Saved chip; open Family →
  the record appears under your profile. "Tell it; it records. Invite the whole
  family on the Wi-Fi (🔗), any language, synced live."

**3:10–3:40 — Multi-agent + security (rapid)**
- `npm run demo:agent`: narrate the tool trace (search → calculate → consult
  MedPsy) → exact % change. Then `npm run test:injection`: show the PASS — "fed a
  booby-trapped document; it answered the real fact and refused the attack."

**3:40–4:15 — Whole QVAC stack: Genesis fine-tune + P2P + vision (pre-recorded)**
- Cut to `npm run demo:finetune:genesis`: loss 4.4→1.5 on Tether's own Genesis
  medical data with Fabric, on this GPU. "Model + dataset + fine-tuning — all theirs, all local."
- Two terminals: `npm run provider` → key → `npm run delegate <key>` — "this
  client has no model; it borrows the home PC over P2P by public key."
- One vision shot: `npm run demo:vision` reading the lab photo with no OCR.

**4:15–4:45 — Evidence & honesty**
- Open artifacts/audit-log.jsonl + artifacts/qa-report.md (22/22) +
  artifacts/profiler-export.json. "Every load and call logged; 22/22 automated
  tests." Open remote-apis.yaml: "full disclosure — zero cloud AI."

**4:45–5:00 — Close**
- "Sehat. Apache-2.0, github.com/PugarHuda/sehat, #teamSehat. Local health AI is
  ready today." End card with repo URL + QVAC logo.

## Recording checklist
- [ ] All models pre-downloaded; each demo rehearsed once
- [ ] Fresh artifacts/audit-log.jsonl for the on-camera run; commit it after
- [ ] Network OFF on camera (after caching)
- [ ] Phone URL bar visible (proves LAN); cert warning already accepted
- [ ] Pre-record finetune/vision/provider-delegate; cut in
- [ ] ≤ 5:00, export 1080p, upload YouTube **unlisted**, link in the form
