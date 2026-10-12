/**
 * Seeds the database with the Spinex Enterprises 2026 catalogue.
 * Safe to re-run: it only inserts rows that don't exist yet.
 *   npm run db:seed        → seed (idempotent)
 *   npm run db:reset       → wipe DB and seed fresh
 */
import bcrypt from "bcryptjs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { categories, coupons, faqs, pages, products, scenes, users } from "../src/db/schema";

const P = (r: number) => r * 100;
const img = (slug: string) => `/uploads/products/${slug}.webp`;
const cut = (slug: string) => `/uploads/products/${slug}-cutout.webp`;

const CATEGORIES = [
  { slug: "car-dashboard", name: "Car Dashboard Idols", description: "Compact idols with stable bases, made to ride along on every drive.", sortOrder: 1 },
  { slug: "home-mandir", name: "Home Mandir", description: "Idols and décor for your pooja ghar and home temple.", sortOrder: 2 },
  { slug: "desk-office", name: "Desk & Office", description: "Calm, meditative statement pieces for your work desk and study.", sortOrder: 3 },
  { slug: "gifts", name: "Gifts & Combos", description: "Ready-to-gift sets for festivals, housewarmings and loved ones.", sortOrder: 4 },
];

type Seed = {
  slug: string; name: string; price: number; deity: string | null; category: string; placements: string[];
  heightCm: number; short: string; desc: string; tags: string[]; featured?: boolean; bestseller?: boolean; badge?: string;
};

const MATERIAL = "Polyresin, hand-painted finish";

const PRODUCTS: Seed[] = [
  { slug: "p0-ganesh-ji", name: "Crystal Frame Ganesh Ji", price: 95, deity: "Ganesh", category: "car-dashboard", placements: ["car"], heightCm: 7,
    short: "Ganesh Ji in a clear crystal-style frame with golden pillars — made for the dashboard.",
    desc: "Shri Ganesh encased in a clear **crystal-style frame** with golden side pillars. A slim, elegant profile that sits beautifully on the dashboard.", tags: ["ganesh", "crystal", "frame", "car"] },
  { slug: "bhari-adiyogi", name: "Adiyogi Bust", price: 110, deity: "Mahadev", category: "desk-office", placements: ["desk", "shelf", "car"], heightCm: 12, featured: true,
    short: "Bold matte-black Adiyogi bust with serpent, trishul and ‘ॐ नमः शिवाय’ base.",
    desc: "The iconic **Adiyogi** face in sculpted matte black, crowned with a serpent and flanked by a trishul with damru. Base engraved with *ॐ नमः शिवाय*.", tags: ["adiyogi", "shiva", "bust", "mahadev"] },
  { slug: "radha-krishna-cow", name: "Radha Krishna with Cow", price: 100, deity: "Radha Krishna", category: "home-mandir", placements: ["temple", "shelf", "desk"], heightCm: 14, featured: true,
    short: "Radha and Krishna standing together beside a white cow — divine love in vivid colour.",
    desc: "Radha Rani and Shri Krishna side by side with Kamdhenu, painted in rich festive colours. A symbol of love and devotion for your home mandir or living room.", tags: ["radha", "krishna", "cow", "love"] },
  { slug: "adiyogi-trishul", name: "Adiyogi with Trishul", price: 65, deity: "Mahadev", category: "car-dashboard", placements: ["car", "desk"], heightCm: 8,
    short: "Compact Adiyogi bust with golden trishul — minimal, powerful, dashboard-ready.",
    desc: "A compact **Adiyogi** bust with a golden trishul and necklace detail. Minimal and powerful — perfect for a clean dashboard or desk.", tags: ["adiyogi", "shiva", "trishul"] },
  { slug: "khatu-shyam-charan", name: "Khatu Shyam Darbar", price: 68, deity: "Khatu Shyam", category: "car-dashboard", placements: ["car", "temple"], heightCm: 10, bestseller: true,
    short: "Khatu Shyam Baba's darbar in gold with a red-and-gold canopy.",
    desc: "**Khatu Shyam Baba** in a radiant golden darbar with an ornate canopy. *Haare ka Sahara* — keep Baba with you on every journey.", tags: ["khatu shyam", "shyam baba", "darbar"] },
  { slug: "adiyogi-trishul-damru", name: "Adiyogi Trishul Damru", price: 120, deity: "Mahadev", category: "desk-office", placements: ["desk", "car"], heightCm: 12,
    short: "Adiyogi with a golden Om-trishul and damru on a black ‘Om Namah Shivay’ plinth.",
    desc: "Adiyogi crowned with a golden **Om-trishul and damru**, mounted on a black plinth engraved *Om Namah Shivay*. A statement piece for desks and study tables.", tags: ["adiyogi", "trishul", "damru", "om"] },
  { slug: "gada-dashboard", name: "Hanuman Gada Dashboard", price: 110, deity: "Hanuman", category: "car-dashboard", placements: ["car", "desk"], heightCm: 6,
    short: "Golden Hanuman gada on a black base with a Hanuman Chalisa chaupai.",
    desc: "Bajrangbali's golden **gada** resting on a black base inscribed with a chaupai from the *Hanuman Chalisa*. Low-profile and striking on the dashboard.", tags: ["hanuman", "gada", "chalisa"] },
  { slug: "solar-buddha", name: "Solar Buddha", price: 165, deity: "Buddha", category: "car-dashboard", placements: ["car", "desk"], heightCm: 12, badge: "Solar",
    short: "Cheerful little monk in saffron robes on a wooden base — powered by sunlight.",
    desc: "A cheerful little **monk** in saffron and red robes, seated on a wooden base. Place it in sunlight on your dashboard or windowsill.", tags: ["buddha", "monk", "solar", "peace"] },
  { slug: "kamdhenu-cow", name: "Kamdhenu Cow with Calf", price: 105, deity: "Kamdhenu", category: "home-mandir", placements: ["temple", "shelf", "desk"], heightCm: 10,
    short: "Kamdhenu cow and calf with a jewelled saddle — a symbol of abundance.",
    desc: "The wish-fulfilling **Kamdhenu** with her calf, adorned with a jewelled saddle cloth. Considered auspicious for prosperity — ideal for mandir, office or gifting.", tags: ["kamdhenu", "cow", "calf", "prosperity", "vastu"] },
  { slug: "trishul-damru", name: "Om Trishul Damru", price: 160, deity: "Mahadev", category: "car-dashboard", placements: ["car"], heightCm: 13, featured: true,
    short: "Golden Om, trishul and damru with rudraksha — a fierce Mahadev symbol for your dashboard.",
    desc: "A golden **Om-trishul** with damru and rudraksha detailing on a rock-style base. Bold, symbolic and made for the dashboard.", tags: ["trishul", "damru", "om", "rudraksha", "shiva"] },
  { slug: "kaan-ganesh-ji", name: "Kaan Ganesh Ji", price: 58, deity: "Ganesh", category: "car-dashboard", placements: ["car", "desk"], heightCm: 8,
    short: "Sandstone-finish Ganesh Ji with large graceful ears — calm and minimal.",
    desc: "A serene **Ganesh Ji** in a warm sandstone finish with large, graceful ears. Minimal, calm and perfect for any space.", tags: ["ganesh", "sandstone", "minimal"] },
  { slug: "m1-ganesh-ji", name: "M1 Ganesh Ji", price: 45, deity: "Ganesh", category: "car-dashboard", placements: ["car", "desk", "temple"], heightCm: 7, featured: true, bestseller: true, badge: "Most loved",
    short: "Bright white-and-saffron Ganesh Ji with gold mukut — our most popular dashboard idol.",
    desc: "Shri Ganesh in bright white and saffron with a golden mukut. Compact and joyful — a lovely first idol for any dashboard.", tags: ["ganesh", "ganpati", "car", "dashboard"] },
  { slug: "krishna-ji-flute", name: "Bal Krishna with Flute", price: 160, deity: "Krishna", category: "car-dashboard", placements: ["car", "desk"], heightCm: 10, featured: true, bestseller: true, badge: "New",
    short: "Adorable Bal Gopal playing the flute on a marble-finish base.",
    desc: "**Bal Krishna** with his flute and peacock feather, seated on a marble-finish base. Playful and full of joy — on the dashboard he'll make every drive a little brighter.", tags: ["krishna", "bal gopal", "flute", "kanha", "laddu gopal"] },
  { slug: "hanuman-ji-kitab", name: "Hanuman Ji Reading Ramayan", price: 135, deity: "Hanuman", category: "home-mandir", placements: ["temple", "desk", "car"], heightCm: 12, featured: true,
    short: "Hanuman Ji seated with his gada, reading the Ramayan — devotion and wisdom.",
    desc: "**Hanuman Ji** absorbed in the Ramayan, gada at his side, on a wood-finish base. A beautiful reminder of devotion and learning — for your mandir or study.", tags: ["hanuman", "ramayan", "kitab", "bajrangbali"] },
  { slug: "decorative-ganesh-ji", name: "Floral Ring Ganesh Ji", price: 115, deity: "Ganesh", category: "home-mandir", placements: ["temple", "shelf"], heightCm: 13,
    short: "Ganesh Ji framed by a ring of roses and marigolds on a pearl-lined base.",
    desc: "Shri Ganesh seated within a ring of **roses and marigolds** on a pearl-lined golden base. Festive, bright and perfect for Diwali and housewarming gifts.", tags: ["ganesh", "floral", "diwali", "gift"] },
  { slug: "ganesh-laxmi-combo", name: "Ganesh Lakshmi Combo", price: 160, deity: "Ganesh & Lakshmi", category: "gifts", placements: ["temple", "shelf"], heightCm: 10, featured: true, badge: "Diwali pick",
    short: "Ganesh Ji and Lakshmi Ji pair on marble-finish bases — for Diwali pooja and gifting.",
    desc: "The auspicious pair of **Ganesh Ji and Lakshmi Ji**, seated on marble-finish bases. The essential Diwali pooja set — and a thoughtful gift for any new beginning.", tags: ["ganesh", "lakshmi", "laxmi", "diwali", "combo"] },
];

const PAGES = [
  { slug: "about", title: "Our Story", showInFooter: true, content: `Spinex Home is the direct-to-devotee home of **Spinex Enterprises** — makers of car dashboard and home décor god idols trusted by customers on Amazon, Flipkart and Meesho.\n\n## Why we started\nWe believe the divine should travel with you — to work, on long drives, and back home to your mandir. So we design idols that are compact, beautifully finished and made to be looked at every day.\n\n## What makes a Spinex idol\n- Fine hand-painted details and gilded accents\n- Stable bases designed for dashboards and desks\n- Careful packing for safe delivery across India\n\n> “Wherever you go, go with all your heart.”\n\n## Wholesale & gifting\nWe supply shops and businesses across India. [Send us a bulk enquiry](/bulk-orders) for catalogue pricing.` },
  { slug: "shipping-policy", title: "Shipping Policy", showInFooter: true, content: `## Dispatch\nOrders are dispatched within 1–2 business days.\n\n## Delivery\nWe deliver across India through trusted courier partners. Delivery usually takes 3–7 business days depending on your pincode.\n\n## Shipping charges\nShipping is free on orders above the free-shipping threshold shown at checkout. A small shipping fee applies to smaller orders.\n\n## Tracking\nYou'll receive tracking details once your order ships. You can also [track your order here](/track).\n\n*Please review and update this policy to match your actual operations.*` },
  { slug: "returns-refunds", title: "Returns & Refunds", showInFooter: true, content: `## Damaged in transit?\nIf your idol arrives damaged, please share an unboxing video and photos within 48 hours of delivery and we'll arrange a replacement or refund.\n\n## Returns\nDue to the devotional nature of our products, we accept returns only for damaged, defective or incorrect items.\n\n## Refunds\nApproved refunds are processed to the original payment method within 5–7 business days. For COD orders, we'll refund to your bank account or UPI.\n\n*Please review and update this policy to match your actual operations.*` },
  { slug: "privacy-policy", title: "Privacy Policy", showInFooter: true, content: `We collect only the information we need to process your order — your name, contact details and delivery address.\n\n## How we use it\n- To deliver your order and send updates\n- To provide customer support\n- To send offers, only if you subscribe\n\n## Payments\nOnline payments are processed securely by our payment partner. We never store your card details.\n\n## Camera access\nThe “Try in your space” feature uses your camera only inside your browser. Images are never uploaded to our servers.\n\n*Please review this policy with a legal professional.*` },
  { slug: "terms", title: "Terms & Conditions", showInFooter: true, content: `By using this website you agree to these terms.\n\n## Products\nProduct colours may vary slightly due to lighting and screen settings. Every idol is hand-finished, so small variations make each one unique.\n\n## Pricing\nPrices are in Indian Rupees and inclusive of applicable taxes. We reserve the right to change prices without prior notice.\n\n## Orders\nWe may cancel an order in case of stock unavailability or pricing errors, with a full refund.\n\n*Please review these terms with a legal professional.*` },
];

const FAQS = [
  { q: "Will the idol stay in place on my car dashboard?", a: "Our dashboard idols have flat, stable bases. For extra grip on curved dashboards we recommend a double-sided adhesive or anti-slip pad." },
  { q: "How does “Try in your space” work?", a: "On any product page tap “See it in your space”. Pick a car dashboard, home mandir or desk scene — or use your phone camera or a photo of your own space — and drag, resize and rotate the idol to see how it will look." },
  { q: "Is Cash on Delivery available?", a: "Yes, Cash on Delivery is available across India. A small COD handling fee may apply and is shown at checkout." },
  { q: "What if my idol arrives damaged?", a: "Share an unboxing video and photos within 48 hours of delivery and we'll send a replacement or refund — no questions asked." },
  { q: "Do you take bulk or corporate gifting orders?", a: "Yes! We supply retailers, temple shops and corporates. Visit our Bulk Orders page and we'll share catalogue pricing with a GST invoice." },
  { q: "How should I clean my idol?", a: "Wipe gently with a soft, dry cloth. Avoid water, chemicals and abrasive cleaners to protect the painted and gilded finish." },
];

const SCENES = [
  { key: "car", name: "Car Dashboard", tagline: "Ride with blessings", kind: "car" as const, sortOrder: 1, anchorX: 0.5, anchorY: 0.69, baseScale: 0.3 },
  { key: "temple", name: "Home Mandir", tagline: "A sacred corner at home", kind: "temple" as const, sortOrder: 2, anchorX: 0.5, anchorY: 0.74, baseScale: 0.34 },
  { key: "desk", name: "Work Desk", tagline: "Focus, with grace", kind: "desk" as const, sortOrder: 3, anchorX: 0.5, anchorY: 0.72, baseScale: 0.3 },
  { key: "shelf", name: "Living Room", tagline: "The heart of the home", kind: "shelf" as const, sortOrder: 4, anchorX: 0.5, anchorY: 0.6, baseScale: 0.26 },
];

/**
 * Realistic photo backdrops in public/scenes. When a photo exists it replaces the drawn
 * scene, with the anchor already on the empty spot in that photo (no manual adjusting). Re-running the
 * seed re-applies these spots; a scene the admin gave a different photo is left alone.
 */
const SCENE_PHOTOS: Record<string, { anchorX: number; anchorY: number; baseScale: number }> = {
  car: { anchorX: 0.5, anchorY: 0.56, baseScale: 0.3 },
  temple: { anchorX: 0.5, anchorY: 0.785, baseScale: 0.3 },
  desk: { anchorX: 0.5, anchorY: 0.62, baseScale: 0.32 },
  shelf: { anchorX: 0.47, anchorY: 0.68, baseScale: 0.24 },
};
/** public/scenes/<key>.jpg, .jpeg, .png or .webp — whichever exists. */
const scenePhoto = (key: string) => {
  const ph = SCENE_PHOTOS[key];
  const ext = ph && ["jpg", "jpeg", "png", "webp"].find((e) => existsSync(join(process.cwd(), "public", "scenes", `${key}.${e}`)));
  return ext ? { ...ph, image: `/scenes/${key}.${ext}` } : null;
};

async function main() {
  const now = new Date().toISOString();

  const email = (process.env.ADMIN_EMAIL || "admin@spinexhome.in").toLowerCase();
  if (!db.select().from(users).where(eq(users.email, email)).get()) {
    const pw = process.env.ADMIN_PASSWORD || "Spinex@2026";
    db.insert(users).values({ name: "Spinex Admin", email, role: "admin", passwordHash: await bcrypt.hash(pw, 10), createdAt: now }).run();
    console.log(`✔ Admin created → ${email} / ${pw}  (change this after first login)`);
  }

  for (const c of CATEGORIES) {
    if (!db.select().from(categories).where(eq(categories.slug, c.slug)).get()) db.insert(categories).values(c).run();
  }
  const catId = (slug: string) => db.select().from(categories).where(eq(categories.slug, slug)).get()!.id;
  for (const c of CATEGORIES) {
    const first = PRODUCTS.find((p) => p.category === c.slug);
    if (first) db.update(categories).set({ image: cut(first.slug) }).where(eq(categories.slug, c.slug)).run();
  }

  PRODUCTS.forEach((p, i) => {
    if (db.select().from(products).where(eq(products.slug, p.slug)).get()) return;
    db.insert(products).values({
      name: p.name, slug: p.slug, sku: `SPX-${String(i + 1).padStart(3, "0")}`, categoryId: catId(p.category), deity: p.deity,
      shortDescription: p.short, description: p.desc, price: P(p.price), mrp: null, stock: 50,
      material: p.category === "gifts" && !p.deity ? null : MATERIAL, dimensions: `Approx. ${p.heightCm} cm tall`,
      images: [img(p.slug)], cutout: cut(p.slug), spinFrames: [], placements: p.placements, heightCm: p.heightCm,
      marketplace: {}, tags: p.tags, badge: p.badge ?? null, isFeatured: !!p.featured, isBestseller: !!p.bestseller,
      seoTitle: `${p.name} — ${p.deity ? p.deity + " idol" : "Gift"} | Spinex Home`, seoDescription: p.short,
      sortOrder: i, createdAt: new Date(Date.now() - i * 3600_000).toISOString(), updatedAt: now,
    }).run();
  });

  for (const pg of PAGES) {
    if (!db.select().from(pages).where(eq(pages.slug, pg.slug)).get()) db.insert(pages).values({ ...pg, updatedAt: now }).run();
  }
  if (!db.select().from(faqs).get()) FAQS.forEach((f, i) => db.insert(faqs).values({ question: f.q, answer: f.a, sortOrder: i }).run());
  for (const s of SCENES) {
    const row = db.select().from(scenes).where(eq(scenes.key, s.key)).get();
    const photo = scenePhoto(s.key);
    if (!row) db.insert(scenes).values({ ...s, ...photo }).run();
    else if (photo && (!row.image || row.image.startsWith("/scenes/"))) db.update(scenes).set(photo).where(eq(scenes.key, s.key)).run();
  }
  if (!db.select().from(coupons).where(eq(coupons.code, "WELCOME10")).get()) {
    db.insert(coupons).values({ code: "WELCOME10", description: "10% off your first order (up to ₹100)", type: "percent", value: 10, minOrder: P(199), maxDiscount: P(100), createdAt: now }).run();
  }
  console.log(`✔ Seeded ${PRODUCTS.length} products, ${CATEGORIES.length} categories, ${PAGES.length} pages, ${FAQS.length} FAQs, ${SCENES.length} scenes`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
