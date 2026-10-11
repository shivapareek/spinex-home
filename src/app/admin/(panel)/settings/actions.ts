"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getSetting, saveSetting } from "@/lib/settings";
import { toPaise } from "@/lib/utils";

const str = z.string().trim();
const optUrl = str.max(300).refine((v) => !v || /^https?:\/\//i.test(v), "Social links must start with https://");

const generalSchema = z.object({
  name: str.min(2, "Store name is required").max(80),
  legalName: str.max(120),
  tagline: str.max(160),
  email: str.email("Enter a valid email").or(z.literal("")),
  phone: str.max(30),
  whatsapp: str.regex(/^(\d{10,15})?$/, "WhatsApp must be digits only with country code, e.g. 919876543210"),
  address: str.max(400),
  gstin: str
    .toUpperCase()
    .regex(/^([0-9]{2}[A-Z0-9]{13})?$/, "GSTIN should be 15 characters, e.g. 08ABCDE1234F1Z5"),
  instagram: optUrl,
  facebook: optUrl,
  youtube: optUrl,
  seoTitle: str.max(120),
  seoDescription: str.max(320),
});

export async function saveGeneral(fd: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(fd);
  raw.whatsapp = String(raw.whatsapp ?? "").replace(/[\s+()-]/g, "");
  const parsed = generalSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const current = getSetting("site");
  saveSetting("site", {
    ...current,
    name: d.name,
    legalName: d.legalName,
    tagline: d.tagline,
    email: d.email,
    phone: d.phone,
    whatsapp: d.whatsapp,
    address: d.address,
    gstin: d.gstin,
    socials: { ...current.socials, instagram: d.instagram, facebook: d.facebook, youtube: d.youtube },
    seo: { title: d.seoTitle, description: d.seoDescription },
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "General settings saved" };
}

const rupees = (label: string) => z.coerce.number({ message: `${label} must be a number` }).min(0, `${label} can't be negative`).max(1_000_000);
const commerceSchema = z.object({
  freeShippingThreshold: rupees("Free shipping threshold"),
  shippingFee: rupees("Shipping fee"),
  codFee: rupees("COD fee"),
  lowStockThreshold: z.coerce.number().int("Low-stock threshold must be a whole number").min(0).max(10_000),
  dispatchDays: str.min(1, "Dispatch time is required").max(40),
});

export async function saveCommerce(fd: FormData) {
  await requireAdmin();
  const parsed = commerceSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const current = getSetting("commerce");
  saveSetting("commerce", {
    ...current,
    freeShippingThreshold: toPaise(d.freeShippingThreshold),
    shippingFee: toPaise(d.shippingFee),
    codFee: toPaise(d.codFee),
    codEnabled: fd.get("codEnabled") === "on",
    lowStockThreshold: d.lowStockThreshold,
    dispatchDays: d.dispatchDays,
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Commerce settings saved" };
}

const paymentsSchema = z.object({
  razorpayKeyId: str.regex(/^(rzp_(test|live)_[A-Za-z0-9]+)?$/, "Key ID should look like rzp_test_… or rzp_live_…"),
  razorpayKeySecret: str.max(200),
});

export async function savePayments(fd: FormData) {
  await requireAdmin();
  const parsed = paymentsSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const current = getSetting("commerce");
  const clearSecret = fd.get("clearSecret") === "on";
  const secret = clearSecret ? "" : d.razorpayKeySecret || current.razorpayKeySecret;
  const enabled = fd.get("razorpayEnabled") === "on";
  if (enabled && (!d.razorpayKeyId || !secret)) return { error: "Add both the Key ID and Key Secret before enabling Razorpay" };
  saveSetting("commerce", { ...current, razorpayEnabled: enabled, razorpayKeyId: d.razorpayKeyId, razorpayKeySecret: secret });
  revalidatePath("/", "layout");
  return { ok: true, message: "Payment settings saved" };
}
