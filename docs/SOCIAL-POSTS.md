# #teamSehat — Build in Public post bank

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
