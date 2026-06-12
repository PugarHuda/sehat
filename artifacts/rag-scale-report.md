# RAG scale benchmark — 201 documents

Corpus: 5 family members × 16 years (labs, notes, prescriptions) + 1 needle doc.

| Metric | Value |
|---|---|
| Documents ingested | 201 |
| Ingest total / per doc | 5.5 s / 27 ms |
| Search avg before reindex | 20 ms (8–47) |
| ragReindex (IVF rebalance) | true in 0.1 s |
| Search avg after reindex | 11 ms (7–14) |
| Needle retrieval (1 doc in 201) | before: ✅ after: ✅ |
