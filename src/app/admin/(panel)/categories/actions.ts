"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveCategory(id: number | null, fd: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const values = {
    name: d.name,
    slug: slugify(d.slug || d.name),
    description: d.description || null,
    image: d.image || null,
    sortOrder: d.sortOrder,
    isActive: fd.get("isActive") === "on",
  };
  const clash = db.select().from(categories).where(eq(categories.slug, values.slug)).get();
  if (clash && clash.id !== id) return { error: "Another category already uses this slug" };
  if (id) db.update(categories).set(values).where(eq(categories.id, id)).run();
  else db.insert(categories).values(values).run();
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Category updated" : "Category created", redirect: "/admin/categories" };
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  const used = db.select({ c: sql<number>`count(*)` }).from(products).where(eq(products.categoryId, id)).get();
  if (Number(used?.c) > 0) return { error: `Move its ${used?.c} products to another category first` };
  db.delete(categories).where(eq(categories.id, id)).run();
  revalidatePath("/", "layout");
  return { ok: true, message: "Category deleted" };
}
