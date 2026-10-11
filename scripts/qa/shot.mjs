import { chromium } from "playwright";
const [url, out, w = "1440", h = "900", full = "0"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errs = [];
p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
p.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text()));
if (process.env.COOKIE) { const [n, v] = process.env.COOKIE.split(/=(.*)/s); await p.context().addCookies([{ name: n, value: v, url }]); }
await p.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await p.waitForTimeout(+(process.env.WAIT || 1500));
if (full === "1") {
  // scroll through so viewport-triggered reveals run
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(120); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(800);
}
await p.screenshot({ path: out, fullPage: full === "1" });
console.log(errs.slice(0, 10).join("\n") || "no errors");
await b.close();
