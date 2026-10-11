// Records a guided demo video of the storefront + admin panel.
import { chromium } from "playwright";
const BASE = process.env.BASE || "http://localhost:3200";
const OUT = process.env.OUT || ".";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
import fs from "node:fs";
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
// Capture frames via the DevTools screencast; assembled into a video afterwards with ffmpeg
const FR = `${OUT}/frames`;
fs.mkdirSync(FR, { recursive: true });
const frames = [];
const cdp = await ctx.newCDPSession(p);
cdp.on("Page.screencastFrame", async (f) => {
  const file = `${FR}/f${String(frames.length).padStart(5, "0")}.jpg`;
  fs.writeFileSync(file, Buffer.from(f.data, "base64"));
  frames.push({ file, t: f.metadata.timestamp });
  await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 82, maxWidth: 1280, maxHeight: 800, everyNthFrame: 1 });
const wait = (ms) => p.waitForTimeout(ms);

async function caption(text) {
  await p.evaluate((t) => {
    let el = document.getElementById("demo-cap");
    if (!el) {
      el = document.createElement("div");
      el.id = "demo-cap";
      el.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;background:#111;color:#fff;font:600 16px system-ui;padding:12px 22px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.25);pointer-events:none;white-space:nowrap";
      document.body.appendChild(el);
    }
    el.textContent = t;
  }, text);
}
async function glide(x1, y1, x2, y2, steps = 25) {
  await p.mouse.move(x1, y1);
  for (let i = 1; i <= steps; i++) {
    await p.mouse.move(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps);
    await wait(16);
  }
}
async function drag(x1, y1, x2, y2, steps = 30) {
  await p.mouse.move(x1, y1);
  await p.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await p.mouse.move(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps);
    await wait(20);
  }
  await p.mouse.up();
}
async function slowScroll(total, step = 12) {
  for (let y = 0; y < total; y += step) {
    await p.mouse.wheel(0, step);
    await wait(14);
  }
}

// 1. Hero
await p.goto(BASE + "/", { waitUntil: "networkidle" });
await wait(1200);
await caption("Hero: clean white design + live preview card");
await glide(300, 300, 900, 450, 40);
await wait(1500);
await caption("Space badlo: Car → Mandir → Desk");
await p.getByRole("tab", { name: "Home Mandir" }).click();
await wait(2200);
await p.getByRole("tab", { name: "Work Desk" }).click();
await wait(2000);
await p.getByRole("tab", { name: "Car Dashboard" }).click();
await wait(1200);
await caption("Idol badlo — har idol us space mein live dikhta hai");
for (const n of ["Show Bal Krishna with Flute", "Show Hanuman Ji Reading Ramayan", "Show Golden Shivling", "Show M1 Ganesh Ji"]) {
  const btn = p.getByRole("button", { name: n });
  if (await btn.count()) { await btn.click(); await wait(1700); }
}

// 2. Scroll the homepage
await caption("Homepage sections — sab kuch admin CMS se editable");
await slowScroll(2600);
await wait(800);
await caption("Try before you buy — same idol, 4 spaces");
for (const n of ["Meditation Adiyogi", "Khatu Shyam Darbar", "Bal Krishna with Flute"]) {
  const btn = p.getByRole("button", { name: n, exact: true });
  if (await btn.count()) { await btn.first().click(); await wait(1500); }
}
await slowScroll(2400);
await caption("Bestsellers, car-dashboard story, craft, FAQ…");
await slowScroll(3600, 16);
await wait(600);

// 3. Product page
await p.goto(BASE + "/product/hanuman-ji-kitab", { waitUntil: "networkidle" });
await caption("Product page — photos, hover zoom");
await wait(800);
await glide(250, 350, 550, 600, 40);
await wait(800);
await caption("3D preview — drag karke ghumao");
await p.getByRole("tab", { name: /3D preview|360/ }).click();
await wait(1500);
await drag(300, 450, 650, 450, 40);
await wait(600);
await drag(650, 450, 250, 430, 40);
await wait(1600);
await caption("In your space — idol ko drag, resize, scene switch");
await p.getByRole("tab", { name: "In your space" }).click();
await wait(1500);
const idol = p.getByRole("img", { name: /drag to move/ });
const bb = await idol.boundingBox();
if (bb) await drag(bb.x + bb.width / 2, bb.y + bb.height / 2, bb.x + bb.width / 2 - 140, bb.y + bb.height / 2 + 20, 40);
await wait(800);
await p.getByRole("button", { name: "Larger" }).click(); await wait(400);
await p.getByRole("button", { name: "Larger" }).click(); await wait(800);
for (const n of ["Home Mandir", "Work Desk", "Living Room", "Car Dashboard"]) {
  const btn = p.getByRole("button", { name: n, exact: true });
  if (await btn.count()) { await btn.first().click(); await wait(1500); }
}
await caption("Add to cart → cart drawer, free-shipping meter");
await p.mouse.wheel(0, -2000);
await wait(500);
await p.getByRole("button", { name: "Add to cart", exact: true }).first().click();
await wait(2500);
await p.getByRole("button", { name: "Close cart" }).click();
await wait(600);

// 4. Darshan Studio
await p.goto(BASE + "/experience?scene=temple", { waitUntil: "networkidle" });
await caption("Try in your space — koi bhi idol, koi bhi space, camera ya photo");
await wait(1500);
for (const n of ["Meditation Adiyogi", "Radha Krishna with Cow", "Ganesh Lakshmi Combo", "Floral Ring Ganesh Ji"]) {
  const btn = p.locator(`button[title="${n}"]`);
  if (await btn.count()) { await btn.first().click(); await wait(1500); }
}
await p.getByRole("button", { name: "Car Dashboard", exact: true }).first().click();
await wait(1800);

// 5. Shop
await p.goto(BASE + "/shop", { waitUntil: "networkidle" });
await caption("Shop — simple filters: Space, Category, Deity, Price");
await wait(1200);
await p.getByRole("button", { name: "Car dashboard", exact: true }).first().click();
await wait(1800);
await slowScroll(900);
await wait(800);

// 6. Admin
await p.goto(BASE + "/admin/login", { waitUntil: "networkidle" });
await caption("Admin panel login");
await p.fill('input[name="email"]', "admin@spinexhome.in");
await p.fill('input[name="password"]', "Spinex@2026");
await wait(500);
await p.getByRole("button", { name: "Sign in" }).click();
await p.waitForURL(BASE + "/admin");
await caption("Dashboard — revenue, orders, low stock, top sellers");
await wait(2500);
await p.goto(BASE + "/admin/products", { waitUntil: "networkidle" });
await caption("Products — list, search, stock");
await wait(1800);
await p.goto(BASE + "/admin/products/" + (await p.evaluate(() => {
  const a = [...document.querySelectorAll('a[href^="/admin/products/"]')].find((x) => /\/\d+$/.test(x.getAttribute("href")));
  return a ? a.getAttribute("href").split("/").pop() : "1";
})), { waitUntil: "networkidle" });
await caption("Product editor — photos, 360° video se frames, 3D/AR, marketplace links");
await slowScroll(2600, 14);
await wait(800);
await p.goto(BASE + "/admin/cms/home", { waitUntil: "networkidle" });
await caption("CMS — homepage ka har text, featured idols, sections on/off");
await slowScroll(2200, 14);
await wait(600);
await p.goto(BASE + "/admin/cms/scenes", { waitUntil: "networkidle" });
await caption("Visualizer scenes — apni photo scene bhi add kar sakte ho");
await wait(2200);
await p.goto(BASE + "/admin/settings?tab=commerce", { waitUntil: "networkidle" });
await caption("Settings — shipping, COD, Razorpay payments");
await wait(2200);

await cdp.send("Page.stopScreencast").catch(() => {});
// ffmpeg concat list with real frame durations
const lines = [];
frames.forEach((f, i) => {
  const next = frames[i + 1]?.t ?? f.t + 0.5;
  lines.push(`file '${f.file}'`, `duration ${Math.max(0.01, Math.min(2, next - f.t)).toFixed(3)}`);
});
lines.push(`file '${frames[frames.length - 1].file}'`);
fs.writeFileSync(`${OUT}/frames.txt`, lines.join("\n"));
await ctx.close();
await b.close();
console.log("frames", frames.length);
