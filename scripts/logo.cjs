const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 480, height: 480 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const url = "file:///" + path.resolve(__dirname, "..", "assets", "logo.html").replace(/\\/g, "/");
  await p.goto(url);
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.resolve(__dirname, "..", "assets", "logo-480.png"), clip: { x: 0, y: 0, width: 480, height: 480 } });
  await b.close();
  console.log("logo written");
})();
