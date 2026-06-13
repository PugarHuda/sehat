# #teamSehat — build-in-public posts (post whenever there's an update)

No day numbers — just post one when something ships. All under 280 chars.
Tag @QVAC, use #teamSehat. Repo: github.com/PugarHuda/sehat

---

**Join announcement** (post first)
> We're building Sehat for the @QVAC hackathon 🩺 — a private family health
> assistant that runs 100% on one home PC. No cloud, no accounts, health records
> never leave the house. Edge AI for the people who matter most. #teamSehat
_(media: your PC + phone)_

---

**On-device, on a budget GPU**
> Sehat runs entirely on a 4-year-old GTX 1660 Super via the @QVAC SDK —
> 127 tok/s, first token in ~120 ms, zero cloud. If a budget gaming GPU can do
> this, local AI really is for everyone. #teamSehat
_(media: terminal with tok/s)_

---

**MedPsy is the brain**
> Sehat's brain is @QVAC's own MedPsy-4B running locally. On our GTX 1660 Super
> it answers in ~340 ms first-token — ~16× faster than Google's MedGemma-4B on
> the same prompt & GPU. Small model, big reasoning. #teamSehat
_(media: the medpsy benchmark table)_

---

**RAG over family records**
> Ask Sehat: "How has Dad's blood sugar changed?" → it reads our lab reports and
> answers with citations across 4 visits, showing the trend. All on-device with
> MedPsy + @QVAC RAG. #teamSehat
_(media: a cited answer / dashboard sparkline)_

---

**Fine-tuned on QVAC Genesis**
> We LoRA-fine-tuned a model on @QVAC's own Genesis medical dataset with Fabric —
> on a gaming GPU, loss 4.4→1.5 in minutes. Their model, their data, their
> fine-tuning, 100% local. #teamSehat
_(media: LoRA loss curve)_

---

**Agents + safety**
> Sehat got smarter and safer 🛡️ An on-device agent plans steps (search →
> calculate → consult MedPsy), and it refuses prompt-injection from tampered
> documents. Tested 22/22. Built on @QVAC. #teamSehat
_(media: agent tool-trace + injection PASS)_

---

**Proactive alerts + dashboard**
> Sehat doesn't wait to be asked. It scans the family's records and warns you:
> "Budi's glucose is rising across his tests." Clean dashboard, trend charts,
> spoken briefings — all on-device. @QVAC #teamSehat
_(media: dashboard + alerts)_

---

**Just tell it — auto-save**
> Say "my glucose today is 95, BP 118/76" and Sehat saves a dated record. Ask a
> question instead? It won't save that. Invite the whole family on your Wi-Fi,
> any language, synced live to the home PC. @QVAC #teamSehat
_(media: phone with 📌 Saved chip)_

---

**Emergency QR + reminders + voice**
> New in Sehat: an offline Emergency QR (allergies, meds, conditions — scannable
> on the fridge), upcoming-care reminders, one-tap export, and a hands-free voice
> loop (talk → it answers out loud). On @QVAC. #teamSehat
_(media: Emergency QR on screen)_

---

**Demo / wrap**
> Sehat 🩺 9 AI models on one GTX 1660 Super, zero cloud: MedPsy + RAG + OCR +
> voice + vision + agents + Genesis fine-tuning + P2P. 5-min demo 👇
> Open source (Apache-2.0): github.com/PugarHuda/sehat — built with @QVAC #teamSehat
_(media: YouTube demo link)_
