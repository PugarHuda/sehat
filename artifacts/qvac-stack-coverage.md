# QVAC stack coverage — what Sehat actually uses

The judging criteria ask for "Strong use of all of the QVAC stack (models,
datasets, fine-tuning, integrations)". Here is every leg, mapped to where Sehat
uses it.

| QVAC stack leg | Used? | Where in Sehat |
|---|---|---|
| **SDK** (`@qvac/sdk`) | ✅ | Every inference path — completion, embeddings, RAG, OCR, STT, TTS, NMT, vision, tools, P2P |
| **Psy models** (MedPsy) | ✅ | Primary brain: `MEDPSY_4B_Q4_URL` (`qvac/MedPsy-4B-GGUF`), `src/engine.js` |
| **Other models** | ✅ | Qwen3-1.7B (agent), EmbeddingGemma, Parakeet, Supertonic, OCR, Bergamot, Gemma4-vision, Qwen3-0.6B (finetune base) |
| **Datasets** (Genesis) | ✅ | `src/genesis-prepare.js` pulls `qvac/GenesisI` college_medicine; `src/demo-finetune-genesis.js` trains on it |
| **Fine-tuning** (Fabric) | ✅ | Two LoRA runs: hand-written Sehat-style (`demo:finetune`) and **real Genesis medical data** (`demo:finetune:genesis`) |
| **P2P / delegated inference** (Holepunch) | ✅ | `src/provider.js` + `src/delegate-test.js` — client with no local model |
| **Distributed model registry** | ✅ | All registry-constant models fetched P2P; MedPsy via HTTP source |
| **Profiler** | ✅ | `src/profile-run.js` → `artifacts/profiler-export.json` |
| **Blind relays** | ◻️ documented | Capability described (needs real relay keys); not faked — see README |
| Image/video gen, VLA, classification | ✕ | Out of product scope (judges value meaningful use, not checklist) |

**Capability areas in meaningful use: 13.** The three legs the criteria name
explicitly — models, datasets, fine-tuning — are all present, with MedPsy (their
own model) as the brain and Genesis (their own dataset) feeding Fabric (their own
fine-tuning), all on a GTX 1660 Super.
