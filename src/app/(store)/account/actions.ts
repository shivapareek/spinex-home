"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { authenticate, endSession, hashPassword, requireCustomer, startSession } from "@/lib/auth";
import { INDIAN_STATES } from "@/lib/orders";

type R = { error?: string; ok?: boolean; message?: string } | null;

export async function login(_: R, fd: FormData): Promise<R> {
  const user = await authenticate(String(fd.get("email") || ""), String(fd.get("password") || ""));
  if (!user) return { error: "Incorrect email or password" };
  await startSession(user);
  redirect(user.role === "customer" ? "/account" : "/admin");
}

const reg = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export async function register(_: R, fd: FormData): Promise<R> {
  const p = reg.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  if (db.select({ id: users.id }).from(users).where(eq(users.email, p.data.email)).get()) return { error: "An account with this email already exists — please sign in" };
  const user = db
    .insert(users)
    .values({ name: p.data.name, email: p.data.email, phone: p.data.phone || null, passwordHash: await hashPassword(p.data.password), role: "customer" })
    .returning()
    .get();
  await startSession(user);
  redirect("/account");
}

export async function logout() {
  await endSession();
  redirect("/");
}

const addr = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number"),
  line1: z.string().trim().min(4, "Please enter your address").max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2, "Please enter your city").max(60),
  state: z.string().refine((s) => INDIAN_STATES.includes(s), "Please choose your state"),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid pincode"),
});

export async function saveProfile(_: R, fd: FormData): Promise<R> {
  const s = await requireCustomer();
  const p = addr.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  db.update(users).set({ name: p.data.name, phone: p.data.phone, address: p.data }).where(eq(users.id, s.uid)).run();
  return { ok: true, message: "Saved" };
}
