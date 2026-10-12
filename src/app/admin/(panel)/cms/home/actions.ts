"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { HOME_SECTION_KEYS, getSetting, normalizeSections, saveSetting, type HomeSettings } from "@/lib/settings";

const str = z.string().trim();
const cta = z.object({ label: str, href: str });
const slug = str.max(120);
const space = z.object({ line: str.max(140), productSlug: slug });
const homeSchema = z.object({
  hero: z.object({
    title: str.min(1, "Hero heading is required").max(80),
    titleAccent: str.max(80),
    primaryCta: cta,
    secondaryCta: cta,
    featured: z.array(slug.min(1)).min(1, "Pick at least one idol for the hero").max(12),
  }),
  sections: z.array(z.object({ key: z.enum(HOME_SECTION_KEYS), enabled: z.boolean() })),
  spaces: z.object({ title: str.max(80), items: z.object({ car: space, temple: space, desk: space, shelf: space }) }),
  collection: z.object({ title: str.max(80), productSlugs: z.array(slug.min(1)).max(16) }),
  statement: z.object({
    items: z.array(z.object({ word: str.min(1, "Each statement part needs a word").max(30), productSlug: slug, phrase: str.max(60) })).max(6),
    tail: str.max(160),
  }),
  deities: z.object({ title: str.max(80) }),
  tryBanner: z.object({ title: str.max(100), body: str.max(240), productSlug: slug }),
  testimonials: z.object({ title: str.max(80) }),
  marketplaces: z.object({ title: str.max(60), items: z.array(z.object({ name: str.min(1, "Each marketplace needs a name").max(30), url: str.max(300) })).max(6) }),
  bulk: z.object({ title: str.max(100), body: str.max(300) }),
  faq: z.object({ title: str.max(80) }),
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
  const space = (k: string) => ({ line: s(`spaces.${k}.line`), productSlug: s(`spaces.${k}.productSlug`) });

  const raw = {
    hero: {
      title: s("hero.title"),
      titleAccent: s("hero.titleAccent"),
      primaryCta: { label: s("hero.primaryCta.label"), href: s("hero.primaryCta.href") },
      secondaryCta: { label: s("hero.secondaryCta.label"), href: s("hero.secondaryCta.href") },
      featured: json<string[]>(fd, "hero.featured", []),
    },
    sections: normalizeSections(json<{ key: string; enabled: boolean }[]>(fd, "sections", [])),
    spaces: { title: s("spaces.title"), items: { car: space("car"), temple: space("temple"), desk: space("desk"), shelf: space("shelf") } },
    collection: { title: s("collection.title"), productSlugs: json<string[]>(fd, "collection.productSlugs", []) },
    statement: {
      items: json<{ word: string; productSlug: string; phrase: string }[]>(fd, "statement.items", []).filter((x) => x.word?.trim() || x.phrase?.trim()),
      tail: s("statement.tail"),
    },
    deities: { title: s("deities.title") },
    tryBanner: { title: s("tryBanner.title"), body: s("tryBanner.body"), productSlug: s("tryBanner.productSlug") },
    testimonials: { title: s("testimonials.title") },
    marketplaces: {
      title: s("marketplaces.title"),
      items: json<{ name: string; url: string }[]>(fd, "marketplaces.items", []).filter((x) => x.name?.trim() || x.url?.trim()),
    },
    bulk: { title: s("bulk.title"), body: s("bulk.body") },
    faq: { title: s("faq.title") },
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
