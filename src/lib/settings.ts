import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { DEFAULT_THEME_KEY, type ThemeSettings } from "@/lib/themes";

export type SiteSettings = {
  name: string;
  legalName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  gstin: string;
  socials: { instagram?: string; facebook?: string; youtube?: string };
  announcement: { enabled: boolean; items: string[] };
  seo: { title: string; description: string };
};

export type CommerceSettings = {
  /** paise */
  freeShippingThreshold: number;
  shippingFee: number;
  codEnabled: boolean;
  codFee: number;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  lowStockThreshold: number;
  dispatchDays: string;
};

export type HomeSection = { key: HomeSectionKey; enabled: boolean };
/** Homepage blocks below the hero, in the order the gallery layout uses by default. */
export const HOME_SECTION_KEYS = ["spaces", "collection", "statement", "deities", "tryBanner", "testimonials", "marketplaces", "bulk", "faq"] as const;
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];
export type SpaceKind = "car" | "temple" | "desk" | "shelf";

export type HomeSettings = {
  hero: {
    title: string;
    titleAccent: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    /** Idols that rotate on the hero pedestal, in order */
    featured: string[];
  };
  sections: HomeSection[];
  /** "Where will your idol live?" — big words + live scene */
  spaces: { title: string; items: Record<SpaceKind, { line: string; productSlug: string }> };
  /** Sideways-scrolling collection; empty productSlugs = automatic (featured first) */
  collection: { title: string; productSlugs: string[] };
  /** Sentence with small idol images between the words */
  statement: { items: { word: string; productSlug: string; phrase: string }[]; tail: string };
  deities: { title: string };
  tryBanner: { title: string; body: string; productSlug: string };
  testimonials: { title: string };
  marketplaces: { title: string; items: { name: string; url: string }[] };
  bulk: { title: string; body: string };
  faq: { title: string };
};

export const DEFAULT_SITE: SiteSettings = {
  name: "Spinex Home",
  legalName: "Spinex Enterprises",
  tagline: "Premium car dashboard & home décor god idols",
  email: "hello@spinexhome.in",
  phone: "+91 90000 00000",
  whatsapp: "919000000000",
  address: "Rajasthan, India",
  gstin: "08FSAPB8822G1ZU",
  socials: { instagram: "", facebook: "", youtube: "" },
  announcement: {
    enabled: true,
    items: [
      "Free shipping on orders above ₹499",
      "Securely packed for safe delivery",
      "Cash on Delivery available across India",
    ],
  },
  seo: {
    title: "Spinex Home — Divine idols for your car, mandir & desk",
    description:
      "Hand-finished god idols for car dashboards, home temples and work desks. See every idol in 360° and preview it in your own space before you buy.",
  },
};

export const DEFAULT_COMMERCE: CommerceSettings = {
  freeShippingThreshold: 49900,
  shippingFee: 4900,
  codEnabled: true,
  codFee: 2900,
  razorpayEnabled: false,
  razorpayKeyId: "",
  razorpayKeySecret: "",
  lowStockThreshold: 10,
  dispatchDays: "1–2 days",
};

export const DEFAULT_HOME: HomeSettings = {
  hero: {
    title: "God idols for your",
    titleAccent: "car, mandir and desk.",
    primaryCta: { label: "Shop all idols", href: "/shop" },
    secondaryCta: { label: "Try in your space", href: "/experience" },
    featured: ["m1-ganesh-ji", "bhari-adiyogi", "krishna-ji-flute", "hanuman-ji-kitab", "trishul-damru"],
  },
  sections: HOME_SECTION_KEYS.map((key) => ({ key, enabled: true })),
  spaces: {
    title: "Where will your idol live?",
    items: {
      car: { line: "Small, steady idols that ride along on every drive.", productSlug: "krishna-ji-flute" },
      temple: { line: "Radiant forms for your pooja ghar and daily aarti.", productSlug: "hanuman-ji-kitab" },
      desk: { line: "Calm, meditative pieces for focus at work.", productSlug: "bhari-adiyogi" },
      shelf: { line: "Statement idols for the living room shelf.", productSlug: "radha-krishna-cow" },
    },
  },
  collection: { title: "The collection, chosen by our customers.", productSlugs: [] },
  statement: {
    items: [
      { word: "Ganesh", productSlug: "m1-ganesh-ji", phrase: "for new beginnings" },
      { word: "Hanuman", productSlug: "hanuman-ji-kitab", phrase: "for strength" },
      { word: "Krishna", productSlug: "krishna-ji-flute", phrase: "for joy" },
      { word: "Mahadev", productSlug: "bhari-adiyogi", phrase: "for calm" },
    ],
    tail: "Every idol finished with care and packed to arrive safely.",
  },
  deities: { title: "Find your deity." },
  tryBanner: {
    title: "Not sure how it looks? Try it on your dashboard.",
    body: "Open your phone camera, place any idol on your dash, and see the real size before you order.",
    productSlug: "krishna-ji-flute",
  },
  testimonials: { title: "What customers say." },
  marketplaces: {
    title: "Also available on",
    items: [
      { name: "Amazon", url: "" },
      { name: "Flipkart", url: "" },
      { name: "Meesho", url: "" },
    ],
  },
  bulk: {
    title: "Gifting & wholesale, made simple.",
    body: "Corporate Diwali gifts, temple shops, car accessory stores. Get catalogue pricing on bulk orders with a GST invoice.",
  },
  faq: { title: "Good to know." },
};

/** Keep each known section exactly once, in saved order; unknown keys dropped, new ones appended (on). */
export function normalizeSections(saved: { key: string; enabled: boolean }[] | undefined): HomeSection[] {
  const seen = new Set<string>();
  const out: HomeSection[] = [];
  for (const s of saved ?? []) {
    if ((HOME_SECTION_KEYS as readonly string[]).includes(s.key) && !seen.has(s.key)) {
      seen.add(s.key);
      out.push({ key: s.key as HomeSectionKey, enabled: !!s.enabled });
    }
  }
  for (const k of HOME_SECTION_KEYS) if (!seen.has(k)) out.push({ key: k, enabled: true });
  return out;
}

export const DEFAULT_THEME: ThemeSettings = { preset: DEFAULT_THEME_KEY, accent: "" };

const DEFAULTS = { site: DEFAULT_SITE, commerce: DEFAULT_COMMERCE, home: DEFAULT_HOME, theme: DEFAULT_THEME } as const;
type Keys = keyof typeof DEFAULTS;
type ValueOf<K extends Keys> = (typeof DEFAULTS)[K] extends infer T ? (T extends object ? T : never) : never;

function merge<T>(base: T, over: unknown): T {
  if (!over || typeof over !== "object" || Array.isArray(base)) return (over as T) ?? base;
  const out: any = { ...base };
  for (const [k, v] of Object.entries(over as object)) {
    const b = (base as any)[k];
    out[k] = b && typeof b === "object" && !Array.isArray(b) ? merge(b, v) : v;
  }
  return out;
}

export function getSetting<K extends Keys>(key: K): ValueOf<K> {
  const row = db.select().from(settings).where(eq(settings.key, key)).get();
  const value = merge(DEFAULTS[key] as ValueOf<K>, row?.value);
  if (key === "home") (value as HomeSettings).sections = normalizeSections((value as HomeSettings).sections);
  return value;
}

export function saveSetting<K extends Keys>(key: K, value: ValueOf<K>) {
  const now = new Date().toISOString();
  db.insert(settings)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: now } })
    .run();
}
