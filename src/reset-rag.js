// Reset the RAG workspace so it contains ONLY the canonical sample docs.
// The HyperDB vector store persists on disk across restarts, so test-time
// ingests (uploads, CSV, chat auto-save) accumulate. Run with the server
// stopped, then restart the server (it re-seeds from data/sample).
import { ragDeleteWorkspace, ragCloseWorkspace } from "@qvac/sdk";

const WS = "sehat-family";
try {
  await ragCloseWorkspace({ workspace: WS, deleteOnClose: true });
  console.log("Workspace closed + deleted.");
} catch (e) {
  try { await ragDeleteWorkspace({ workspace: WS }); console.log("Workspace deleted."); }
  catch (e2) { console.log("Delete note:", e2?.message ?? e2); }
}
process.exit(0);
