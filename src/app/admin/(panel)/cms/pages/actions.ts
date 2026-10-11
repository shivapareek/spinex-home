"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(2, "Title is required").max(140),
  slug: z.string().trim().optional(),
  content: z.string().default(""),
  seoDescription: z.string().trim().max(320, "SEO description should be under 320 characters").optional(),
});

export async function savePage(id: number | null, fd: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const slug = slugify(d.slug || d.title);
  if (!slug) return { error: "Please enter a valid URL slug" };
  const values = {
    title: d.title,
    slug,
    content: d.content,
    seoDescription: d.seoDescription || null,
    isPublished: fd.get("isPublished") === "on",
    showInFooter: fd.get("showInFooter") === "on",
    updatedAt: new Date().toISOString(),
  };
  const clash = db.select({ id: pages.id }).from(pages).where(eq(pages.slug, slug)).get();
  if (clash && clash.id !== id) return { error: "Another page already uses this slug" };
  if (id) db.update(pages).set(values).where(eq(pages.id, id)).run();
  else db.insert(pages).values(values).run();
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Page updated" : "Page created", redirect: "/admin/cms/pages" };
}

export async function deletePage(id: number) {
  await requireAdmin();
  db.delete(pages).where(eq(pages.id, id)).run();
  revalidatePath("/", "layout");
  return { ok: true, message: "Page deleted", redirect: "/admin/cms/pages" };
}
