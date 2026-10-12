// Edits the homepage through Admin → Homepage, checks the storefront, then resets.
import { chromium } from "playwright";
const BASE = process.env.BASE || "http://localhost:3100";
const OUT = process.env.OUT || ".";
const [cn, cv] = process.env.COOKIE.split(/=(.*)/s);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: cn, value: cv, url: BASE }]);
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(BASE + "/admin/cms/home", { waitUntil: "networkidle" });
await p.screenshot({ path: `${OUT}/cms-home-top.png` });
await p.screenshot({ path: `${OUT}/cms-home-full.png`, fullPage: true });

await p.fill('input[name="spaces.title"]', "Aapka idol kahan rahega?");
await p.fill('input[name="deities.title"]', "Apne bhagwan chuniye.");
await p.fill('input[name="statement.tail"]', "Har idol pyaar se pack kiya jaata hai.");
await p.getByRole("button", { name: "Save homepage" }).click();
await p.getByText("Homepage saved").waitFor({ timeout: 15000 });
console.log("✓ saved");

const h = await ctx.newPage();
await h.goto(BASE + "/", { waitUntil: "networkidle" });
const html = await h.content();
for (const t of ["Aapka idol kahan rahega?", "Apne bhagwan chuniye.", "Har idol pyaar se pack kiya jaata hai."]) console.log(html.includes(t) ? "✓ homepage shows:" : "✗ missing:", t);

await p.goto(BASE + "/admin/cms/home", { waitUntil: "networkidle" });
p.once("dialog", (d) => d.accept());
await p.getByRole("button", { name: "Reset to defaults" }).click();
await p.getByText("reset to defaults").waitFor({ timeout: 15000 });
await h.goto(BASE + "/", { waitUntil: "networkidle" });
console.log((await h.content()).includes("Where will your idol live?") ? "✓ reset restored defaults" : "✗ reset failed");
console.log(JSON.stringify({ errors: errs }));
await b.close();
