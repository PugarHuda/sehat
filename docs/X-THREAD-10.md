# #teamSehat — 10-post build-in-public series (post 1/day, tag @QVAC)

All under 280 chars. Attach the suggested media. Repo: github.com/PugarHuda/sehat

---

**1 — Join announcement**
> We're in! 🚀 Building Sehat for the @QVAC hackathon — a private family health
> assistant that runs 100% on one home PC. No cloud, no accounts, records never
> leave the house. Edge AI for the people who matter most. #teamSehat
_(media: photo of your PC + phone)_

---

**2 — First inference working**
> Day 1 win 🎉 Got @QVAC SDK running on a 4-year-old GTX 1660 Super.
> 127 tok/s, first token in 116 ms — fully on-device. If a budget gaming GPU can
> do this, local AI really is for everyone. #teamSehat
_(media: terminal with the tok/s numbers)_

---

**3 — RAG over family docs**
> Sehat can now read our family's lab reports and answer questions with citations:
> "How has Dad's blood sugar changed?" → pulls 4 visits, shows the trend. All
> local via @QVAC. #teamSehat
_(media: screen recording of a cited answer)_

---

**4 — Switched to MedPsy (the plot twist)**
> Plot twist 🤯 We were using Google's MedGemma. Switched to @QVAC's own MedPsy-4B
> and it's 16× faster first-token on the SAME GPU. Their model just wins on the
> edge. #teamSehat
_(media: the medpsy-vs-medgemma comparison table)_

---

**5 — Fine-tuning on QVAC Genesis**
> Today we fine-tuned a model on @QVAC's own Genesis medical dataset with Fabric —
> on a gaming GPU, loss 4.4→1.5 in minutes. Model + dataset + fine-tuning, the
> whole stack, 100% local. #teamSehat
_(media: the LoRA loss curve / terminal)_

---

**6 — Multi-agent + security**
> Sehat got smarter AND safer 🛡️ An agent now plans steps (search → calculate →
> consult MedPsy), and it refuses prompt-injection from poisoned documents.
> Tested 22/22. Built on @QVAC. #teamSehat
_(media: the agent tool-trace + injection PASS)_

---

**7 — Dashboard + proactive alerts**
> Sehat doesn't wait to be asked. It scans the family's records and warns you:
> "Budi's glucose is rising across 2 tests." Plus a clean dashboard with trend
> charts — all on-device. @QVAC #teamSehat
_(media: dashboard + alerts screenshot)_

---

**8 — Auto-save + multi-user**
> Just *tell* Sehat: "my glucose today is 95" and it saves a dated record. Invite
> the whole family on your Wi-Fi — everyone chats in any language, data syncs to
> the home PC live. Zero cloud. @QVAC #teamSehat
_(media: phone showing the 📌 Saved chip)_

---

**9 — Emergency QR + reminders**
> New in Sehat: an offline Emergency QR (allergies, meds, conditions — scannable
> on the fridge), upcoming-care reminders, one-tap export, and spoken health
> briefings. A real family health hub, on @QVAC. #teamSehat
_(media: the Emergency QR on screen)_

---

**10 — Demo / wrap**
> Sehat is done 🩺 9 AI models, fully on one GTX 1660 Super, zero cloud:
> MedPsy + RAG + OCR + voice + vision + agents + fine-tuning + P2P.
> Watch the 5-min demo 👇 Open source (Apache-2.0): github.com/PugarHuda/sehat
> Built with @QVAC #teamSehat
_(media: the YouTube demo video link)_
