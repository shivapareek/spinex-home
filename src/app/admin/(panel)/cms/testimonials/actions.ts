"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Customer name is required").max(80),
  location: z.string().trim().max(80).optional(),
  quote: z.string().trim().min(5, "Quote is required").max(800),
  rating: z.coerce.number().int().min(1, "Rating must be 1–5").max(5, "Rating must be 1–5"),
  source: z.string().trim().max(60).optional(),
  avatar: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveTestimonial(id: number | null, fd: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const values = {
    name: d.name,
    location: d.location || null,
    quote: d.quote,
    rating: d.rating,
    source: d.source || null,
    avatar: d.avatar || null,
    sortOrder: d.sortOrder,
    isActive: fd.get("isActive") === "on",
  };
  if (id) db.update(testimonials).set(values).where(eq(testimonials.id, id)).run();
  else db.insert(testimonials).values(values).run();
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Testimonial updated" : "Testimonial added", redirect: "/admin/cms/testimonials" };
}

export async function toggleTestimonial(id: number) {
  await requireAdmin();
  const t = db.select({ isActive: testimonials.isActive }).from(testimonials).where(eq(testimonials.id, id)).get();
  if (!t) return { error: "Testimonial not found" };
  db.update(testimonials).set({ isActive: !t.isActive }).where(eq(testimonials.id, id)).run();
  revalidatePath("/", "layout");
  return { ok: true, message: t.isActive ? "Hidden from store" : "Now showing on store" };
}

export async function deleteTestimonial(id: number) {
  await requireAdmin();
  db.delete(testimonials).where(eq(testimonials.id, id)).run();
  revalidatePath("/", "layout");
  return { ok: true, message: "Testimonial deleted", redirect: "/admin/cms/testimonials" };
}
