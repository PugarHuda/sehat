# Third-party data notice — QVAC Genesis-I

The fine-tuning demo `src/demo-finetune-genesis.js` trains a LoRA adapter on a
small sample of **QVAC Genesis-I** (`qvac/GenesisI`, the `college_medicine`
config), Tether's open synthetic medical dataset.

- **Dataset license:** CC-BY-NC 4.0 (Attribution, **Non-Commercial**).
- **How it's used here:** `src/genesis-prepare.js` HTTP-range-fetches only the
  first few MB of the dataset file from HuggingFace (no full download), extracts
  exam-style Q/A items, and writes `data/finetune/genesis-*.jsonl`.
- **Scope:** This adapter (`artifacts/finetune-genesis/`) is produced **for
  non-commercial demonstration only**, consistent with the dataset license. The
  separate hand-written-data adapter (`artifacts/finetune/`) carries no such
  restriction. Sehat's own source code remains Apache-2.0.
- **Inference:** No Genesis data or user data ever leaves the device at runtime;
  the only network touch is the one-time dataset sample fetch during the demo.

Attribution: QVAC Genesis-I by Tether Data — https://huggingface.co/datasets/qvac/GenesisI
