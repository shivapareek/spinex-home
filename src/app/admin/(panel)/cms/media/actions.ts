"use server";

import { revalidatePath } from "next/cache";
import { eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, media, pages, products, scenes, settings, testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { deleteUpload } from "@/lib/storage";

export async function updateMediaAlt(id: number, fd: FormData) {
  await requireAdmin();
  const parsed = z.string().trim().max(200, "Alt text should be under 200 characters").safeParse(String(fd.get("alt") ?? ""));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  db.update(media).set({ alt: parsed.data || null }).where(eq(media.id, id)).run();
  revalidatePath("/admin/cms/media");
  return { ok: true, message: "Alt text saved" };
}

/** Where (if anywhere) a file URL is still referenced. */
function findUsage(url: string): string | null {
  const pat = `%${url}%`;
  const p = db
    .select({ name: products.name })
    .from(products)
    .where(or(like(products.images, pat), like(products.cutout, pat), like(products.spinFrames, pat), like(products.modelGlb, pat), like(products.modelUsdz, pat)))
    .get();
  if (p) return `product “${p.name}”`;
  const c = db.select({ name: categories.name }).from(categories).where(like(categories.image, pat)).get();
  if (c) return `category “${c.name}”`;
  const s = db.select({ name: scenes.name }).from(scenes).where(like(scenes.image, pat)).get();
  if (s) return `scene “${s.name}”`;
  const t = db.select({ name: testimonials.name }).from(testimonials).where(like(testimonials.avatar, pat)).get();
  if (t) return `testimonial from ${t.name}`;
  const pg = db.select({ title: pages.title }).from(pages).where(like(pages.content, pat)).get();
  if (pg) return `page “${pg.title}”`;
  const st = db.select({ key: settings.key }).from(settings).where(sql`${settings.value} like ${pat}`).get();
  if (st) return `${st.key} settings`;
  return null;
}

export async function deleteMedia(id: number) {
  await requireAdmin();
  const m = db.select().from(media).where(eq(media.id, id)).get();
  if (!m) return { error: "File not found" };
  const used = findUsage(m.url);
  if (used) return { error: `Still used by ${used} — remove it there first.` };
  db.delete(media).where(eq(media.id, id)).run();
  // Only remove the file if no other media row points at it.
  const other = db.select({ id: media.id }).from(media).where(eq(media.url, m.url)).get();
  if (!other) await deleteUpload(m.url);
  revalidatePath("/admin/cms/media");
  return { ok: true, message: "File deleted" };
}
