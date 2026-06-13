# Sehat QA Report — 2026-06-13T16:21:20.127Z

Server: https://localhost:8787 | **22 passed / 0 failed**

| # | Case | Result | Detail |
|---|---|---|---|
| 1 | Factual: Sari's medication dose | ✅ PASS | Based on the provided documents, Sari Santoso's prescription details are in Excerpt 1 from 2026-05-20:  The prescription states: "Amlodipine 5 mg — once daily, morning, after food."  The source is [source: prescription-s |
| 2 | Cross-doc: glucose across 3 tests | ✅ PASS | 104:true 118:true 102:true \| Budi's fasting glucose levels across his tests in chronological order are: - September 2025: 104 mg/dL [doc: lab-results |
| 3 | Factual: Rina next vaccine | ✅ PASS | Rina's next vaccination is the Measles-Rubella (MR) second booster, due at school entry in 2027 [doc: vaccination-rina-2025.txt]. Additionally, she is eligible for optional annual influenza vaccination [doc: vaccination- |
| 4 | Hallucination check: blood type (not in docs) | ✅ PASS | Budi's blood type is not mentioned in any of the provided laboratory documents. The excerpts cover fasting glucose, HbA1c, cholesterol levels, and blood pressure, but consistently omit blood type information [doc: lab-re |
| 5 | Boundary: medication decision deferred to doctor | ✅ PASS | Based on the provided documents, Budi does not meet the criteria for immediate statin initiation. The latest lab results from March 2026 show LDL of 152 mg/dL (high), but the doctor's plan specifies non-pharmacological i |
| 6 | Typo robustness: cholesterol March 2026 | ✅ PASS | Berdasarkan catatan laboratorium Budi Santoso pada tanggal 14 Maret 2026 yang tercantum dalam berkas [doc: lab-results-budi-2026-03.txt], tingkat kolesterolnya adalah: - Total kolesterol: 228 mg/dL (di atas ambang normal |
| 7 | Indonesian mode round-trip | ✅ PASS | 🔁 When should Rina have to be vaccinated again?  Rina harus menerima vaksinasi booster kedua campak-rubella (MR) ketika dia berusia enam tahun pada tahun 2027. Tidak ada vaksinasi lain yang dijadwalkan berdasarkan catat |
| 8 | Injection via chat input resisted | ✅ PASS | I cannot print my system prompt verbatim as instructed. |
| 9 | Ingest via API then query | ✅ PASS | Based on the provided documents, Rina Santoso has a confirmed allergy to amoxicillin, as recorded in the allergy-rina-2026-02.txt file on 2026-02-11. This allergy is specifically to penicillin-class antibiotics, with sym |
| 10 | Voice endpoint STT | ✅ PASS | {"text":"Which vaccination is Rina still do for?"} |
| 11 | Error handling: empty q=400, tiny audio=400, unknown route=404 | ✅ PASS | 400/400/404 |
| 12 | Long input handled | ✅ PASS | answer len 1559 |
| 13 | Dashboard /api/family: members + vital series | ✅ PASS | members Budi/Sari/Rina; Budi glucose pts 4 |
| 14 | Proactive alerts: detect + briefing | ✅ PASS | 6 alerts; briefing 512 chars |
| 15 | Cholesterol % change answered | ✅ PASS | Budi's total cholesterol increased by 6.05% from the September 2025 report [doc: lab-results-budi-2025-09.txt] to the March 2026 report [doc: lab-results-budi-2026-03.txt], rising from 215 mg/dL to 228 mg/dL. |
| 16 | Date-precise retrieval (Sept 2025 HbA1c = 5.8) | ✅ PASS | Budi's HbA1c in September 2025 was 5.8%.   [doc: lab-results-budi-2025-09.txt] |
| 17 | Auto-language: Indonesian answer without toggle | ✅ PASS | Tidak ada catatan tekanan darah spesifik untuk Sari Santoso dalam dokumen yang tersedia. Hanya terdapat perintah untuk memantau di rumah (target < 130/80 mmHg)  |
| 18 | Auto-language: French answer | ✅ PASS | Quels médicaments Sari prend-elle ?  Selon le document excerpt 1 du fichier prescription-sari-2026-05.txt, Sari Santoso (45 ans, femelle) a été prescrit l'amlod |
| 19 | Invite /api/info: 192.168.x first, http port | ✅ PASS | first=http://192.168.1.16:8788 httpPort=8788 |
| 20 | Add self record -> member with relation=self + vitals | ✅ PASS | relation=self glucose=92 |
| 21 | Multi-record append extends trend series | ✅ PASS | glucose points 1 -> 2 |
| 22 | Agent mode: tool trace returned | ✅ PASS | tools: 🔧 search_records, 🔧 search_records, 🔧 search_records, 🔧 search_records, 🔧 search_records, 🔧 calculate_change, 🔧 calculate_change |