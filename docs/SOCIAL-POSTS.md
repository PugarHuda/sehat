# #teamSehat — Build in Public post bank

## ⚡ SHORT daily posts (use these — under 280 chars, punchy)

**Auto-save from chat (newest):**
> Sehat update 🩺 — now you just *tell* it: "my glucose today is 95, BP 118/76" and it saves a dated record to your private dashboard. Ask a question instead? It won't save that. All on-device on a GTX 1660 Super via @QVAC. #teamSehat

**Family multi-user:**
> Your family's health on one private PC 🏠 Invite anyone on your Wi-Fi — they chat in any language and Sehat auto-records their vitals into a shared dashboard with trend charts. Zero cloud, built on @QVAC MedPsy. #teamSehat


**MedPsy swap:**
> Swapped Sehat's brain to @QVAC's own MedPsy-4B: 16× faster first-token vs Google's MedGemma on my GTX 1660 Super. Same GPU, same prompt. 100% local. 🩺 #teamSehat

**Genesis fine-tune:**
> Fine-tuned a model on @QVAC's own Genesis medical dataset with Fabric — on a gaming GPU, loss 4.4→1.5 in minutes. Their model, their data, zero cloud. #teamSehat

**Proactive alerts:**
> Sehat now reads the family's records and warns you *before* you ask: "Budi's glucose is rising across 2 tests." Proactive on-device health AI. @QVAC #teamSehat

**Dashboard/UX:**
> New Sehat dashboard 📊 — every family member's vitals + trend sparklines, all rendered from records that never leave the house. Built on @QVAC. #teamSehat

**Offline flex:**
> Pulled the ethernet cable and Sehat keeps answering health questions, by voice, in 2 languages. That's the whole point of @QVAC edge AI. #teamSehat

## ✨ DAILY UPDATE — post TODAY (attach: the medpsy-vs-medgemma table or a terminal shot)

> #teamSehat day 3 @QVAC hackathon — we swapped our brain to Tether's own
> QVAC MedPsy-4B and benchmarked it on a 4-year-old GTX 1660 Super:
>
> ⚡ TTFT 5,626ms → 343ms (16× faster than Google MedGemma-4B)
> ⚡ 44 → 60 tok/s, same prompt, same GPU
>
> Then we LoRA-fine-tuned on Tether's own QVAC Genesis medical dataset with
> Fabric — loss 4.4→1.5 in minutes, locally. Their model, their data, their
> fine-tuning, our gaming GPU. Zero cloud. 🩺

## ✨ DAILY UPDATE — alt version (shorter, punchier)

> Plot twist for #teamSehat 🩺 — we were running Google's MedGemma. Switched to
> @QVAC's own MedPsy-4B and it's **16× faster TTFT** on the same GTX 1660 Super.
> Then fine-tuned it on QVAC Genesis medical data with Fabric, all on-device.
> Model + dataset + fine-tuning, 100% local. github.com/PugarHuda/sehat

## ✨ DAILY UPDATE — ready to post today (attach: phone screenshot / terminal QA output)

> Day 2 of #teamSehat at the @QVAC hackathon — QA day.
>
> ✅ 12/12 server test cases (hallucination, injection, voice, typos)
> ✅ OCR reads docs even ROTATED 90° + 11pt print
> ✅ Asked in 6 languages — facts correct in all of them
> ✅ ragReindex: search on 200+ docs went 125ms → 11ms
>
> Found 1 real date-attribution bug, fixed, re-tested. All local, zero cloud.

## ✨ DAILY UPDATE — for tomorrow (attach: screen recording of agent trace on phone)

> Our budget phone now runs AGENT MODE 🤖 — #teamSehat day 3 @QVAC hackathon.
>
> Toggle it on and a Qwen3 orchestrator plans the work: searches our records,
> hands math to a calculator tool, consults MedGemma for medical meaning.
> You watch every tool call stream onto the phone, live, from the family PC.
>
> Also: Sehat is now an installable PWA. Looks like a real app because it is one.

Rules recap: tag @QVAC, use #teamSehat, post often (more posts + more engagement
= more points). Attach photos/screenshots/video whenever possible. Archive any
livestream.

## Post 1 — Announcement (use TODAY, attach phone-chat screenshot + PC photo)

> Joining the @QVAC Hackathon with Sehat 🏠🩺 — a family health assistant that
> runs 100% on our home PC. No cloud, no subscriptions, health records never
> leave the house.
>
> MedGemma + RAG + voice + OCR on a GTX 1660 Super, served to a $200 phone.
>
> Open source: github.com/PugarHuda/sehat
> #teamSehat

(259 chars — fits with the link auto-shortened)

## Post 2 — The numbers (day 2, attach terminal screenshot of QA run)

> Day 2 of building Sehat for the @QVAC hackathon. Today's numbers, all
> on-device on a GTX 1660 Super:
>
> ⚡ 138 tok/s, TTFT 119 ms (1B model)
> 🧠 MedGemma 4B: 40 tok/s with RAG citations
> 📄 OCR a lab report photo: 94% confidence
> 🎙️ Speech-to-text: 451 ms
>
> Zero API bills. #teamSehat

## Post 3 — P2P magic (attach split-screen video/photo of two terminals)

> The coolest part of the @QVAC SDK: P2P delegated inference.
>
> This client loads NO model. It connects to our family PC by public key over
> a DHT — no server, no port forwarding — and MedGemma streams back at
> TTFT ~900 ms.
>
> A budget phone borrowing a GPU. That's edge AI. #teamSehat

## Post 4 — Honest struggles (relatability scores points)

> Things that bit us building Sehat for @QVAC hackathon:
> 1. Forgot gpu_layers: 99 → silently ran on CPU at 31 tok/s (GPU: 138!)
> 2. Flaky network broke npm install with a misleading RPC timeout
> 3. TTS pronounced "Rina" so STT heard "rea" — RAG still found the right doc 😅
>
> #teamSehat

## Post 5 — Demo video teaser (when video is ready)

> Sehat demo is live 🎬 — watch a family PC answer health questions from lab
> reports it OCR'd, by voice, fully offline (we pull the ethernet cable on
> camera).
>
> Built on @QVAC SDK for the hackathon. Repo + video: github.com/PugarHuda/sehat
>
> #teamSehat

## Tips
- Post 1 today, then ~1 post/day until submission; reply to your own thread to
  build a running build-log (threads get more engagement).
- Photos of the actual hardware (PC + Redmi side by side) outperform plain
  screenshots.
- If you livestream a coding session, save the VOD link — judges validate it.
