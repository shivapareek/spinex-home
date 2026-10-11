// Captures every page of the site (storefront + admin) for review.
import { chromium } from "playwright";
import fs from "node:fs";
const BASE = process.env.BASE || "http://localhost:3100";
const OUT = process.env.OUT || "./tour";
const COOKIE = process.env.COOKIE; // admin session "spx_session=..."
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const errors = [];
let n = 0;
const shot = async (p, name) => {
  n++;
  const f = `${OUT}/${String(n).padStart(2, "0")}-${name}.png`;
  await p.screenshot({ path: f });
  console.log("✓", f.split("/").pop());
};
const watch = (p) => {
  p.on("pageerror", (e) => errors.push(`${p.url()} :: ${e.message}`));
};
const go = async (p, path, wait = 1500) => {
  await p.goto(BASE + path, { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForTimeout(wait);
};
const scrollTo = async (p, sel, offset = 0) => {
  await p.evaluate(([s, o]) => {
    const el = document.querySelector(s);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 64 + o);
  }, [sel, offset]);
  await p.waitForTimeout(1200);
};

// ---------- Desktop storefront ----------
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
watch(p);
await go(p, "/", 2500);
await shot(p, "home-hero");
const secs = await p.evaluate(() => [...document.querySelectorAll("main section")].map((s, i) => ({ i, top: s.getBoundingClientRect().top + window.scrollY, h: s.offsetHeight })));
const names = ["home-choose-space", "home-collection", "home-statement", "home-deities", "home-try-banner", "home-marketplaces", "home-bulk", "home-faq"];
let k = 0;
for (const s of secs.slice(1)) {
  if (s.h < 120 || k >= names.length) continue;
  // the pinned collection section is tall: jump into its middle so the gallery is mid-walk
  const y = s.h > 1500 ? s.top + s.h * 0.35 : s.top - 64;
  await p.evaluate((v) => window.scrollTo(0, v), y);
  await p.waitForTimeout(1300);
  await shot(p, names[k++]);
}
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(1200);
await shot(p, "home-footer");

await go(p, "/shop");
await shot(p, "shop");
await go(p, "/shop?placement=car");
await shot(p, "shop-filter-car");

await go(p, "/product/hanuman-ji-kitab", 2000);
await shot(p, "product-photos");
await p.getByRole("tab", { name: /3D|360/ }).click();
await p.waitForTimeout(1800);
await shot(p, "product-3d-preview");
await p.getByRole("tab", { name: /In your space/ }).click();
await p.waitForTimeout(1800);
await shot(p, "product-in-your-space");
await scrollTo(p, "section.bg-surface");
await shot(p, "product-every-space");
await scrollTo(p, "#reviews");
await shot(p, "product-reviews-related");

await go(p, "/experience?scene=car&idol=krishna-ji-flute", 2000);
await shot(p, "try-in-space-car");
await go(p, "/experience?scene=temple&idol=hanuman-ji-kitab", 2000);
await shot(p, "try-in-space-mandir");
await go(p, "/experience?scene=desk&idol=bhari-adiyogi", 2000);
await shot(p, "try-in-space-desk");

// search palette
await go(p, "/");
await p.keyboard.press("Control+k");
await p.waitForTimeout(500);
await p.keyboard.type("ganesh");
await p.waitForTimeout(1200);
await shot(p, "search");
await p.keyboard.press("Escape");

// cart → checkout → order
await go(p, "/product/m1-ganesh-ji");
await p.getByRole("button", { name: "Add to cart", exact: true }).first().click();
await p.waitForTimeout(1200);
await shot(p, "cart-drawer");
await go(p, "/checkout", 2500);
await shot(p, "checkout");
await p.fill('input[name="email"]', "demo.customer@example.com");
await p.fill('input[name="phone"]', "9876543210");
await p.fill('input[name="name"]', "Demo Customer");
await p.fill('input[name="line1"]', "12 MI Road");
await p.fill('input[name="city"]', "Jaipur");
await p.fill('input[name="pincode"]', "302001");
await p.selectOption('select[name="state"]', "Rajasthan");
await p.getByRole("button", { name: /Place order/ }).click();
await p.waitForURL("**/order/**", { timeout: 30000 });
await p.waitForTimeout(1500);
await shot(p, "order-confirmation");

for (const [path, name] of [
  ["/track", "track-order"],
  ["/wishlist", "wishlist"],
  ["/account/login", "account-login"],
  ["/account/register", "account-register"],
  ["/bulk-orders", "bulk-orders"],
  ["/contact", "contact"],
  ["/faq", "faq"],
  ["/p/about", "about-page"],
  ["/p/shipping-policy", "policy-page"],
  ["/this-page-does-not-exist", "not-found"],
]) {
  await go(p, path);
  await shot(p, name);
}

// ---------- Admin ----------
if (COOKIE) {
  const [cn, cv] = COOKIE.split(/=(.*)/s);
  const actx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const ap = await actx.newPage();
  watch(ap);
  await go(ap, "/admin/login");
  await shot(ap, "admin-login");
  await actx.addCookies([{ name: cn, value: cv, url: BASE }]);
  const firstId = async (prefix) => ap.evaluate((pre) => {
    const a = [...document.querySelectorAll(`a[href^="${pre}"]`)].find((x) => /\/\d+$/.test(x.getAttribute("href")));
    return a ? a.getAttribute("href") : null;
  }, prefix);
  await go(ap, "/admin", 2500);
  await shot(ap, "admin-dashboard");
  await go(ap, "/admin/orders");
  await shot(ap, "admin-orders");
  const oid = await firstId("/admin/orders/");
  if (oid) {
    await go(ap, oid);
    await shot(ap, "admin-order-detail");
    await go(ap, oid + "/invoice");
    await shot(ap, "admin-invoice");
  }
  await go(ap, "/admin/products");
  await shot(ap, "admin-products");
  const pid = await firstId("/admin/products/");
  if (pid) {
    await go(ap, pid);
    await shot(ap, "admin-product-editor");
    await ap.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
    await ap.waitForTimeout(800);
    await shot(ap, "admin-product-media-360");
  }
  for (const [path, name] of [
    ["/admin/categories", "admin-categories"],
    ["/admin/customers", "admin-customers"],
    ["/admin/coupons", "admin-coupons"],
    ["/admin/reviews", "admin-reviews"],
    ["/admin/enquiries", "admin-enquiries"],
    ["/admin/subscribers", "admin-subscribers"],
    ["/admin/cms/home", "admin-cms-homepage"],
    ["/admin/cms/pages", "admin-cms-pages"],
    ["/admin/cms/testimonials", "admin-cms-testimonials"],
    ["/admin/cms/faqs", "admin-cms-faqs"],
    ["/admin/cms/scenes", "admin-cms-scenes"],
    ["/admin/cms/media", "admin-cms-media"],
    ["/admin/settings", "admin-settings-general"],
    ["/admin/settings?tab=commerce", "admin-settings-shipping"],
    ["/admin/settings?tab=payments", "admin-settings-payments"],
    ["/admin/team", "admin-team"],
  ]) {
    await go(ap, path);
    await shot(ap, name);
  }
  await actx.close();
}

// ---------- Mobile ----------
const mctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const mp = await mctx.newPage();
watch(mp);
for (const [path, name] of [
  ["/", "mobile-home"],
  ["/shop", "mobile-shop"],
  ["/product/krishna-ji-flute", "mobile-product"],
  ["/experience?scene=car", "mobile-try-in-space"],
]) {
  await go(mp, path, 2000);
  await shot(mp, name);
}
await go(mp, "/product/m1-ganesh-ji");
await mp.getByRole("button", { name: "Add to cart", exact: true }).last().click();
await mp.waitForTimeout(1200);
await shot(mp, "mobile-cart");
await go(mp, "/checkout", 2000);
await shot(mp, "mobile-checkout");
await go(mp, "/");
await mp.evaluate(() => window.scrollTo(0, 900));
await mp.waitForTimeout(1200);
await shot(mp, "mobile-home-spaces");
await mp.getByRole("button", { name: "Open menu" }).click();
await mp.waitForTimeout(800);
await shot(mp, "mobile-menu");

await b.close();
console.log(JSON.stringify({ shots: n, errors: errors.slice(0, 10) }));
