import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

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
export type HomeSectionKey =
  | "marquee"
  | "deities"
  | "experience"
  | "bestsellers"
  | "dashboard"
  | "craft"
  | "testimonials"
  | "marketplaces"
  | "bulk"
  | "faq"
  | "newsletter";

export type HomeSettings = {
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    shloka: string;
    shlokaMeaning: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    /** Product slugs shown in the hero darshan carousel */
    featured: string[];
    showDoorsIntro: boolean;
  };
  sections: HomeSection[];
  marquee: string[];
  experience: { eyebrow: string; title: string; subtitle: string };
  dashboard: { eyebrow: string; title: string; body: string; productSlug: string };
  craft: { eyebrow: string; title: string; body: string; stats: { value: string; label: string }[] };
  marketplaces: { title: string; items: { name: string; rating: string; note: string; url: string }[] };
  bulk: { title: string; body: string };
  newsletter: { title: string; body: string };
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
    eyebrow: "New: preview any idol in your own space",
    title: "God idols for your",
    titleAccent: "car, mandir and desk.",
    subtitle:
      "Beautifully finished god idols, made to sit on your car dashboard, in your home mandir or on your work desk. See exactly how they look before you buy.",
    shloka: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ",
    shlokaMeaning: "O Lord of the curved trunk, radiant as a million suns",
    primaryCta: { label: "Shop all idols", href: "/shop" },
    secondaryCta: { label: "Try in your space", href: "/experience" },
    featured: ["m1-ganesh-ji", "meditation-adiyogi", "krishna-ji-flute", "hanuman-ji-kitab", "golden-shivling"],
    showDoorsIntro: true,
  },
  sections: (
    ["experience", "bestsellers", "craft", "deities", "dashboard", "testimonials", "marketplaces", "bulk", "faq", "marquee", "newsletter"] as HomeSectionKey[]
  ).map((key) => ({ key, enabled: key !== "marquee" && key !== "newsletter" })),
  marquee: ["Ganesh Ji", "Mahadev", "Hanuman Ji", "Radha Krishna", "Khatu Shyam", "Lakshmi Ji", "Buddha", "Kamdhenu"],
  experience: {
    eyebrow: "Try before you buy",
    title: "See it in your space before it arrives.",
    subtitle: "Pick an idol, choose a car dashboard, home mandir or desk — or use your phone camera — and see the real size and look.",
  },
  dashboard: {
    eyebrow: "Car dashboard idols",
    title: "Compact. Stable. Made to ride with you.",
    body:
      "Our dashboard idols are sized to sit neatly on the dash without blocking your view, with flat, stable bases built for daily drives.",
    productSlug: "krishna-ji-flute",
  },
  craft: {
    eyebrow: "Why Spinex",
    title: "Made with care, packed with care.",
    body:
      "Every Spinex idol is finished with care — fine painted details, gilded accents and a sealed surface — then checked and packed by our team before it leaves for your home.",
    stats: [
      { value: "23", label: "Signature designs" },
      { value: "4", label: "Spaces to place them" },
      { value: "100%", label: "GST-invoiced orders" },
      { value: "COD", label: "Available pan-India" },
    ],
  },
  marketplaces: {
    title: "Also available on",
    items: [
      { name: "Amazon", rating: "", note: "Spinex Home store", url: "" },
      { name: "Flipkart", rating: "", note: "Spinex Home store", url: "" },
      { name: "Meesho", rating: "", note: "Spinex Home store", url: "" },
    ],
  },
  bulk: {
    title: "Gifting & wholesale, made simple.",
    body: "Corporate Diwali gifts, temple shops, car accessory stores — get catalogue pricing on bulk orders with GST invoice.",
  },
  newsletter: {
    title: "Get festive offers first",
    body: "New idols and festival offers — once a month, never spam.",
  },
};

const DEFAULTS = { site: DEFAULT_SITE, commerce: DEFAULT_COMMERCE, home: DEFAULT_HOME } as const;
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
  return merge(DEFAULTS[key] as ValueOf<K>, row?.value);
}

export function saveSetting<K extends Keys>(key: K, value: ValueOf<K>) {
  const now = new Date().toISOString();
  db.insert(settings)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: now } })
    .run();
}
