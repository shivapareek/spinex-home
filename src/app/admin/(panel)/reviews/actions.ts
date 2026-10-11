"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

function refresh(productId?: number) {
  revalidatePath("/admin", "layout");
  if (productId) revalidatePath("/", "layout");
}

export async function setReviewApproved(id: number, approved: boolean) {
  await requireAdmin();
  const r = db.select().from(reviews).where(eq(reviews.id, id)).get();
  if (!r) return { error: "Review not found" };
  db.update(reviews).set({ isApproved: approved }).where(eq(reviews.id, id)).run();
  refresh(r.productId);
  return { ok: true, message: approved ? "Review published" : "Review hidden" };
}

export async function deleteReview(id: number) {
  await requireAdmin();
  const r = db.select().from(reviews).where(eq(reviews.id, id)).get();
  if (!r) return { error: "Review not found" };
  db.delete(reviews).where(eq(reviews.id, id)).run();
  refresh(r.productId);
  return { ok: true, message: "Review deleted" };
}

const schema = z.object({
  productId: z.coerce.number({ message: "Choose a product" }).int().positive("Choose a product"),
  name: z.string().trim().min(2, "Reviewer name is required").max(80),
  city: z.string().trim().max(60).optional(),
  rating: z.coerce.number().int().min(1, "Rating must be 1–5").max(5, "Rating must be 1–5"),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().max(2000, "Review is too long").optional(),
});

export async function addReview(fd: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const p = db.select({ id: products.id }).from(products).where(eq(products.id, d.productId)).get();
  if (!p) return { error: "That product no longer exists" };
  db.insert(reviews)
    .values({
      productId: d.productId,
      name: d.name,
      city: d.city || null,
      rating: d.rating,
      title: d.title || null,
      body: d.body || null,
      isApproved: fd.has("isApproved") ? fd.get("isApproved") === "on" : true,
    })
    .run();
  refresh(d.productId);
  return { ok: true, message: "Review added" };
}
