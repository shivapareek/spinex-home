"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_HOME, getSetting, saveSetting, type HomeSectionKey, type HomeSettings } from "@/lib/settings";

const SECTION_KEYS = DEFAULT_HOME.sections.map((s) => s.key) as [HomeSectionKey, ...HomeSectionKey[]];

const str = z.string().trim();
const cta = z.object({ label: str, href: str });
const homeSchema = z.object({
  hero: z.object({
    eyebrow: str,
    title: str.min(1, "Hero title is required"),
    titleAccent: str,
    subtitle: str,
    shloka: str,
    shlokaMeaning: str,
    primaryCta: cta,
    secondaryCta: cta,
    featured: z.array(str.min(1)).max(24),
    showDoorsIntro: z.boolean(),
  }),
  sections: z.array(z.object({ key: z.enum(SECTION_KEYS), enabled: z.boolean() })),
  marquee: z.array(str.min(1)).max(60),
  experience: z.object({ eyebrow: str, title: str, subtitle: str }),
  dashboard: z.object({ eyebrow: str, title: str, body: str, productSlug: str }),
  craft: z.object({ eyebrow: str, title: str, body: str, stats: z.array(z.object({ value: str, label: str })).max(8) }),
  marketplaces: z.object({
    title: str,
    items: z.array(z.object({ name: str.min(1, "Each marketplace needs a name"), rating: str, note: str, url: str })).max(8),
  }),
  bulk: z.object({ title: str, body: str }),
  newsletter: z.object({ title: str, body: str }),
});

function json<T>(fd: FormData, name: string, fallback: T): T {
  try {
    const v = fd.get(name);
    return typeof v === "string" && v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveHome(fd: FormData) {
  await requireAdmin();
  const s = (name: string) => String(fd.get(name) ?? "");

  // Keep every known section exactly once, in the submitted order; append any missing ones (disabled).
  const submitted = json<{ key: string; enabled: boolean }[]>(fd, "sections", []);
  const seen = new Set<string>();
  const sections = submitted.filter((x) => SECTION_KEYS.includes(x.key as HomeSectionKey) && !seen.has(x.key) && seen.add(x.key));
  for (const k of SECTION_KEYS) if (!seen.has(k)) sections.push({ key: k, enabled: false });

  const raw = {
    hero: {
      eyebrow: s("hero.eyebrow"),
      title: s("hero.title"),
      titleAccent: s("hero.titleAccent"),
      subtitle: s("hero.subtitle"),
      shloka: s("hero.shloka"),
      shlokaMeaning: s("hero.shlokaMeaning"),
      primaryCta: { label: s("hero.primaryCta.label"), href: s("hero.primaryCta.href") },
      secondaryCta: { label: s("hero.secondaryCta.label"), href: s("hero.secondaryCta.href") },
      featured: json<string[]>(fd, "hero.featured", []),
      showDoorsIntro: fd.get("hero.showDoorsIntro") === "on",
    },
    sections,
    marquee: json<string[]>(fd, "marquee", []),
    experience: { eyebrow: s("experience.eyebrow"), title: s("experience.title"), subtitle: s("experience.subtitle") },
    dashboard: { eyebrow: s("dashboard.eyebrow"), title: s("dashboard.title"), body: s("dashboard.body"), productSlug: s("dashboard.productSlug") },
    craft: {
      eyebrow: s("craft.eyebrow"),
      title: s("craft.title"),
      body: s("craft.body"),
      stats: json<{ value: string; label: string }[]>(fd, "craft.stats", []).filter((x) => x.value?.trim() || x.label?.trim()),
    },
    marketplaces: {
      title: s("marketplaces.title"),
      items: json<{ name: string; rating: string; note: string; url: string }[]>(fd, "marketplaces.items", []).filter(
        (x) => x.name?.trim() || x.url?.trim() || x.note?.trim(),
      ),
    },
    bulk: { title: s("bulk.title"), body: s("bulk.body") },
    newsletter: { title: s("newsletter.title"), body: s("newsletter.body") },
  };

  const parsed = homeSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const home: HomeSettings = parsed.data;
  saveSetting("home", home);

  // Announcement bar lives in site settings — merge into the existing value.
  const site = getSetting("site");
  const items = z.array(str.min(1)).max(10).safeParse(json<string[]>(fd, "announcement.items", []));
  if (!items.success) return { error: "Announcement items are invalid" };
  saveSetting("site", { ...site, announcement: { enabled: fd.get("announcement.enabled") === "on", items: items.data } });

  revalidatePath("/", "layout");
  return { ok: true, message: "Homepage saved" };
}

export async function resetHome() {
  await requireAdmin();
  db.delete(settings).where(eq(settings.key, "home")).run();
  revalidatePath("/", "layout");
  return { ok: true, message: "Homepage content reset to defaults" };
}
