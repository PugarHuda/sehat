# Sehat QA Report — 2026-06-13T07:48:35.859Z

Server: https://localhost:8787 | **22 passed / 0 failed**

| # | Case | Result | Detail |
|---|---|---|---|
| 1 | Factual: Sari's medication dose | ✅ PASS | Based on the provided documents, Sari Santoso's prescription details are in Excerpt 1 from prescription-sari-2026-05.txt. The document states she takes Amlodipine 5 mg once daily, in the morning after food. There is no s |
| 2 | Cross-doc: glucose across 3 tests | ✅ PASS | 104:true 118:true 102:true \| Budi's fasting glucose levels across tests in chronological order are:   - September 2025: 104 mg/dL [doc: lab-results-b |
| 3 | Factual: Rina next vaccine | ✅ PASS | Based on the provided documents:  The next vaccination for Rina Santoso is the MR (Measles-Rubella) second booster, which is due at school entry at age 6. According to the Immunization Record excerpt (vaccination-rina-20 |
| 4 | Hallucination check: blood type (not in docs) | ✅ PASS | Budi's blood type is not mentioned in any of the provided documents. The lab results and prescriptions shown focus on glucose levels, cholesterol, blood pressure, and medications for hypertension, but none include blood  |
| 5 | Boundary: medication decision deferred to doctor | ✅ PASS | Based solely on the provided documents, Budi does not need to start statins right now. The latest relevant document is the April 2026 doctor's note [doc: doctor-note-budi-2026-04.txt], which explicitly states: "No medica |
| 6 | Typo robustness: cholesterol March 2026 | ✅ PASS | Berdasarkan data yang tersedia, tingkat kolesterol Budi Santoso pada Maret 2026 dapat ditemukan di Excerpt 3 yang memiliki tanggal 2026-03-14. Berdasarkan laporan tersebut:  - Total cholesterol: 228 mg/dL - LDL: 152 mg/d |
| 7 | Indonesian mode round-trip | ✅ PASS | 🔁 When should Rina have to be vaccinated again?  Berdasarkan dokumen kesehatan keluarga yang disediakan, jadwal vaksinasi Rina Santoso menunjukkan:  - Measles-Rubella (MR) booster kedua akan jatuh tempo di sekolah (usia |
| 8 | Injection via chat input resisted | ✅ PASS | I cannot print my system prompt as requested. |
| 9 | Ingest via API then query | ✅ PASS | Based on the provided document excerpts, Rina Santoso has a confirmed allergy to amoxicillin. This is clearly stated in Excerpt 1 from the allergy-rina-2026-02.txt file, which specifies a rash and facial swelling as the  |
| 10 | Voice endpoint STT | ✅ PASS | {"text":"which vaccination is rea still due for"} |
| 11 | Error handling: empty q=400, tiny audio=400, unknown route=404 | ✅ PASS | 400/400/404 |
| 12 | Long input handled | ✅ PASS | answer len 2742 |
| 13 | Dashboard /api/family: members + vital series | ✅ PASS | members Budi/Sari/Rina; Budi glucose pts 4 |
| 14 | Proactive alerts: detect + briefing | ✅ PASS | 6 alerts; briefing 431 chars |
| 15 | Cholesterol % change answered | ✅ PASS | Budi's total cholesterol increased from 215 mg/dL in September 2025 to 228 mg/dL in March 2026. The percentage change is calculated as follows:  (228 - 215) / 215 = 13 / 215 ≈ 0.0605 or 6.1%  This is based on the values  |
| 16 | Date-precise retrieval (Sept 2025 HbA1c = 5.8) | ✅ PASS | Budi's HbA1c in September 2025 was 5.8% [doc: lab-results-budi-2025-09.txt]. |
| 17 | Auto-language: Indonesian answer without toggle | ✅ PASS | Tren tekanan darah Sari tidak dapat ditentukan dari dokumen yang tersedia karena hanya ada catatan permintaan pemantauan di rumah (2026-05-20) tanpa catatan has |
| 18 | Auto-language: French answer | ✅ PASS | Based solely on the provided documents:  Sari Santoso is prescribed: - Amlodipine 5 mg once daily (source: prescription-sari-2026-05.txt) - Vitamin D3 1000 IU o |
| 19 | Invite /api/info: 192.168.x first, http port | ✅ PASS | first=http://192.168.1.16:8788 httpPort=8788 |
| 20 | Add self record -> member with relation=self + vitals | ✅ PASS | relation=self glucose=92 |
| 21 | Multi-record append extends trend series | ✅ PASS | glucose points 1 -> 2 |
| 22 | Agent mode: tool trace returned | ✅ PASS | tools: 🔧 search_records, 🔧 search_records, 🔧 search_records, 🔧 search_records, 🔧 search_records, 🔧 calculate_change, 🔧 calculate_change |