# DoraHacks Submission Checklist (deadline June 21, 23:59 UTC — aim June 13–14 for Early Bird)

## Done by the repo (verify before submitting)
- [x] All inference via @qvac/sdk (LLM, embeddings/RAG, OCR, STT, TTS, P2P)
- [x] Apache 2.0 LICENSE
- [x] remote-apis.yaml disclosure file
- [x] artifacts/audit-log.jsonl (model loads + prompt/tokens/TTFT/tok-s per call)
- [x] artifacts/hardware/msinfo32-report.txt
- [x] README with reproducibility + hardware specs
- [ ] FINAL clean demo run: delete artifacts/audit-log.jsonl, run all demos once
      in order, commit the resulting log (this is the log judges cross-check
      against the video)

## User actions (cannot be done by the repo)
- [ ] Join Discord: https://discord.com/invite/tetherdev
- [ ] Create public GitHub repo, push (git remote add origin <url>; git push -u origin master)
- [ ] Screenshots: Task Manager GPU tab + msinfo32 window -> artifacts/hardware/
- [ ] Phone: screenshot Settings > About Phone (Redmi Note 10 Pro) -> artifacts/hardware/
- [ ] Phone: open http://<desktop-ip>:8787 on Wi-Fi, screenshot the chat
- [ ] Record video per docs/DEMO-VIDEO-SCRIPT.md (≤ 5 min, YouTube unlisted)
- [ ] X posts with #teamSehat tagging @QVAC (Build in Public — post early, post often)

## DoraHacks form fields
- Product name: Sehat
- Hashtag: #teamSehat
- Tracks: General Purpose + Psy Models (Our Psy models)
- Team: list every member on the project page
- Location: (fill in)
- Repo link: (GitHub URL)
- Video link: (YouTube unlisted)
- Prior work disclosure: project started June 11, 2026, entirely within the
  hackathon window; built on @qvac/sdk v0.12.2 public npm package; no
  pre-existing code reused
- Hardware: desktop i3-12100F / 16 GB / GTX 1660 Super 6 GB (main, ≤32 GB ✓);
  phone Redmi Note 10 Pro (client only)
