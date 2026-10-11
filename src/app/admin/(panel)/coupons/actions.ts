"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { toPaise } from "@/lib/utils";
import { istBoundary } from "@/components/admin/commerce/helpers";

const money = (msg: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), msg);
const day = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Dates must be YYYY-MM-DD");

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .max(24, "Code must be 24 characters or fewer")
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z0-9_-]+$/.test(v), "Use only letters, numbers, - and _ in the code"),
  description: z.string().trim().max(200).optional(),
  type: z.enum(["percent", "flat"], { message: "Choose a discount type" }),
  value: z
    .string()
    .trim()
    .min(1, "Discount value is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "Discount value must be greater than 0"),
  minOrder: money("Minimum order must be a valid amount"),
  maxDiscount: money("Maximum discount must be a valid amount"),
  usageLimit: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (/^\d+$/.test(v) && Number(v) > 0), "Usage limit must be a whole number above 0"),
  startsAt: day,
  endsAt: day,
});

export async function saveCoupon(id: number | null, fd: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  let value: number;
  if (d.type === "percent") {
    value = Math.round(Number(d.value));
    if (value < 1 || value > 100) return { error: "Percentage must be between 1 and 100" };
  } else value = toPaise(d.value);

  const startsAt = d.startsAt ? istBoundary(d.startsAt, "start") : null;
  const endsAt = d.endsAt ? istBoundary(d.endsAt, "end") : null;
  if (startsAt && endsAt && endsAt < startsAt) return { error: "End date must be on or after the start date" };

  const clash = db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, d.code)).get();
  if (clash && clash.id !== id) return { error: `A coupon with code ${d.code} already exists` };

  const values = {
    code: d.code,
    description: d.description || null,
    type: d.type,
    value,
    minOrder: d.minOrder ? toPaise(d.minOrder) : 0,
    maxDiscount: d.type === "percent" && d.maxDiscount ? toPaise(d.maxDiscount) : null,
    usageLimit: d.usageLimit ? Number(d.usageLimit) : null,
    startsAt,
    endsAt,
    isActive: fd.get("isActive") === "on",
  };
  if (id) db.update(coupons).set(values).where(eq(coupons.id, id)).run();
  else db.insert(coupons).values(values).run();
  revalidatePath("/admin/coupons");
  return { ok: true, message: id ? "Coupon updated" : `Coupon ${d.code} created`, redirect: "/admin/coupons" };
}

export async function toggleCoupon(id: number) {
  await requireAdmin();
  const c = db.select().from(coupons).where(eq(coupons.id, id)).get();
  if (!c) return { error: "Coupon not found" };
  db.update(coupons).set({ isActive: !c.isActive }).where(eq(coupons.id, id)).run();
  revalidatePath("/admin/coupons");
  return { ok: true, message: `${c.code} ${c.isActive ? "paused" : "activated"}` };
}

export async function deleteCoupon(id: number) {
  await requireAdmin();
  db.delete(coupons).where(eq(coupons.id, id)).run();
  revalidatePath("/admin/coupons");
  return { ok: true, message: "Coupon deleted", redirect: "/admin/coupons" };
}
