// Sehat desktop app — a thin Electron shell that boots the local Sehat server
// (all QVAC inference on-device) and opens it in a native window. No cloud.
//
//   npm run desktop
const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");
const http = require("node:http");

const ROOT = path.join(__dirname, "..");
const PORT = process.env.PORT || 8787;
let serverProc = null;
let win = null;

// Sehat serves HTTPS (self-signed) on 8787 and plain HTTP on 8788. The desktop
// window uses HTTP to avoid cert prompts; mic still works (Electron grants it).
const APP_URL = `http://localhost:${Number(PORT) + 1}`;

function startServer() {
  serverProc = spawn(process.execPath, [path.join(ROOT, "src", "server.js")], {
    cwd: ROOT,
    env: { ...process.env, SEHAT_DESKTOP: "1" },
    stdio: "inherit",
  });
  serverProc.on("exit", (code) => console.log(`[sehat server exited ${code}]`));
}

function waitForServer(url, tries = 120) {
  return new Promise((resolve) => {
    const tick = () => {
      http.get(url, (r) => { r.destroy(); resolve(true); })
        .on("error", () => (--tries <= 0 ? resolve(false) : setTimeout(tick, 1000)));
    };
    tick();
  });
}

async function createWindow() {
  win = new BrowserWindow({
    width: 430, height: 880, // phone-like; the UI is responsive
    title: "Sehat — Family Health (on-device)",
    backgroundColor: "#eef1ee",
    webPreferences: { contextIsolation: true },
  });
  // Auto-grant mic permission to the local app (voice loop).
  win.webContents.session.setPermissionRequestHandler((wc, perm, cb) => cb(perm === "media"));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  await win.loadURL(APP_URL);
}

app.whenReady().then(async () => {
  startServer();
  const ok = await waitForServer(APP_URL);
  if (!ok) console.error("Server did not start in time");
  await createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => {
  try { serverProc?.kill(); } catch {}
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", () => { try { serverProc?.kill(); } catch {} });
