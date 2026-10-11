"use server";

import { z } from "zod";
import { db } from "@/db";
import { enquiries, reviews, subscribers, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

type R = { ok?: boolean; error?: string; message?: string };

export async function subscribe(_: R | null, fd: FormData): Promise<R> {
  const email = z.string().trim().toLowerCase().email().safeParse(fd.get("email"));
  if (!email.success) return { error: "Please enter a valid email" };
  db.insert(subscribers).values({ email: email.data }).onConflictDoNothing().run();
  return { ok: true, message: "You're on the list. Jai Shri Ganesh!" };
}

const enquirySchema = z.object({
  type: z.enum(["bulk", "contact"]),
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{8,15}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  company: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  quantity: z.string().trim().max(80).optional(),
  message: z.string().trim().max(2000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function sendEnquiry(_: R | null, fd: FormData): Promise<R> {
  const p = enquirySchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  const d = p.data;
  db.insert(enquiries)
    .values({ type: d.type, name: d.name, phone: d.phone, email: d.email || null, company: d.company || null, city: d.city || null, quantity: d.quantity || null, message: d.message || null })
    .run();
  return { ok: true, message: "Thank you! Our team will reach out within one business day." };
}

const reviewSchema = z.object({
  productId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2, "Please enter your name").max(60),
  city: z.string().trim().max(60).optional(),
  rating: z.coerce.number().int().min(1, "Please choose a rating").max(5),
  title: z.string().trim().max(100).optional(),
  body: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(1500),
});

export async function submitReview(_: R | null, fd: FormData): Promise<R> {
  const p = reviewSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  if (!db.select({ id: products.id }).from(products).where(eq(products.id, p.data.productId)).get()) return { error: "Product not found" };
  const s = await getSession();
  db.insert(reviews).values({ ...p.data, city: p.data.city || null, title: p.data.title || null, userId: s?.uid ?? null, isApproved: false }).run();
  return { ok: true, message: "Thank you! Your review will appear once it's approved." };
}
