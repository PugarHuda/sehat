// Captures real screenshots + a short demo video of the Sehat UI for social posts.
// Requires the server running (npm start) on http://localhost:8788.
//   node scripts/shots.cjs
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = process.env.SEHAT_SHOT_URL || "http://localhost:8788";
const OUT = path.join(__dirname, "..", "assets", "social", "shots");
const VID = path.join(OUT, "video");
fs.mkdirSync(OUT, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 880 },
    deviceScaleFactor: 2,
    recordVideo: { dir: VID, size: { width: 430, height: 880 } },
  });
  const page = await ctx.newPage();

  // Preset a profile name so the header + self-card show.
  await page.addInitScript(() => localStorage.setItem("sehat-me", "Huda"));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await wait(1200);

  // 1) Chat — ask a question and let it stream.
  await page.fill("#q", "How has Budi's blood sugar changed over the last year?");
  await page.click("#send");
  // Wait until the answer finished streaming (meta line with TTFT appears).
  await page.waitForSelector(".meta", { timeout: 60000 }).catch(() => {});
  await wait(2500);
  await page.screenshot({ path: path.join(OUT, "1-chat.png") });

  // 2) Family dashboard.
  await page.click('nav button[data-view="dashView"]');
  await page.waitForSelector(".mcard", { timeout: 20000 }).catch(() => {});
  await wait(1500);
  await page.screenshot({ path: path.join(OUT, "2-family.png") });

  // 3) Member detail drawer (first real member card).
  const card = await page.$('.mcard[data-m]');
  if (card) { await card.click(); await wait(1600); await page.screenshot({ path: path.join(OUT, "3-detail.png") });
    await page.click("#dClose").catch(() => {}); await wait(600); }

  // 4) Alerts — proactive briefing.
  await page.click('nav button[data-view="alertView"]');
  await page.waitForSelector(".alert, .briefing", { timeout: 40000 }).catch(() => {});
  await wait(3500);
  await page.screenshot({ path: path.join(OUT, "4-alerts.png") });

  // 5) Invite modal.
  await page.click('nav button[data-view="dashView"]'); await wait(800);
  await page.click("#inviteBtn").catch(() => {});
  await wait(1500);
  await page.screenshot({ path: path.join(OUT, "5-invite.png") });

  await ctx.close(); // flushes the video
  await browser.close();

  // Rename the (hashed) webm to a friendly name.
  const vids = fs.readdirSync(VID).filter((f) => f.endsWith(".webm"));
  if (vids.length) fs.renameSync(path.join(VID, vids[0]), path.join(VID, "sehat-demo.webm"));
  console.log("DONE shots:", fs.readdirSync(OUT).filter((f) => f.endsWith(".png")).join(", "));
  console.log("video:", fs.existsSync(path.join(VID, "sehat-demo.webm")) ? "sehat-demo.webm" : "(none)");
})();
