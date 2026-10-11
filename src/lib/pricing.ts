import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { coupons, products, type Coupon } from "@/db/schema";
import { getSetting } from "./settings";

export type CartLine = { productId: number; quantity: number };

export type Quote = {
  lines: { productId: number; name: string; slug: string; sku: string | null; image: string | null; price: number; quantity: number; lineTotal: number; stock: number }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  codFee: number;
  total: number;
  coupon: { code: string; description: string | null } | null;
  couponError: string | null;
  freeShippingThreshold: number;
  errors: string[];
};

export function validateCoupon(code: string, subtotal: number): { coupon?: Coupon; error?: string; discount: number } {
  const c = db.select().from(coupons).where(and(eq(coupons.code, code.trim().toUpperCase()), eq(coupons.isActive, true))).get();
  if (!c) return { error: "This coupon code isn't valid", discount: 0 };
  const now = new Date().toISOString();
  if (c.startsAt && c.startsAt > now) return { error: "This coupon isn't active yet", discount: 0 };
  if (c.endsAt && c.endsAt < now) return { error: "This coupon has expired", discount: 0 };
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return { error: "This coupon has been fully redeemed", discount: 0 };
  if (subtotal < c.minOrder) return { error: `Add items worth ₹${Math.ceil((c.minOrder - subtotal) / 100)} more to use this coupon`, discount: 0 };
  let d = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
  if (c.maxDiscount != null) d = Math.min(d, c.maxDiscount);
  return { coupon: c, discount: Math.min(d, subtotal) };
}

/** Authoritative server-side price calculation — never trust client totals. */
export function quote(lines: CartLine[], opts: { couponCode?: string | null; paymentMethod?: "cod" | "razorpay" } = {}): Quote {
  const commerce = getSetting("commerce");
  const ids = [...new Set(lines.map((l) => l.productId))];
  const rows = ids.length ? db.select().from(products).where(inArray(products.id, ids)).all() : [];
  const errors: string[] = [];
  const out: Quote["lines"] = [];
  for (const l of lines) {
    const p = rows.find((r) => r.id === l.productId);
    if (!p || !p.isActive) {
      errors.push("An item in your cart is no longer available");
      continue;
    }
    const qty = Math.max(1, Math.min(99, Math.floor(l.quantity)));
    if (p.stock < qty) errors.push(p.stock > 0 ? `Only ${p.stock} left of ${p.name}` : `${p.name} is out of stock`);
    out.push({ productId: p.id, name: p.name, slug: p.slug, sku: p.sku, image: p.images[0] ?? p.cutout, price: p.price, quantity: qty, lineTotal: p.price * qty, stock: p.stock });
  }
  const subtotal = out.reduce((s, l) => s + l.lineTotal, 0);
  let discount = 0;
  let coupon: Quote["coupon"] = null;
  let couponError: string | null = null;
  if (opts.couponCode) {
    const v = validateCoupon(opts.couponCode, subtotal);
    if (v.coupon) {
      discount = v.discount;
      coupon = { code: v.coupon.code, description: v.coupon.description };
    } else couponError = v.error ?? null;
  }
  const afterDiscount = subtotal - discount;
  const shippingFee = subtotal === 0 || afterDiscount >= commerce.freeShippingThreshold ? 0 : commerce.shippingFee;
  const codFee = opts.paymentMethod === "cod" && subtotal > 0 ? commerce.codFee : 0;
  return {
    lines: out,
    subtotal,
    discount,
    shippingFee,
    codFee,
    total: afterDiscount + shippingFee + codFee,
    coupon,
    couponError,
    freeShippingThreshold: commerce.freeShippingThreshold,
    errors,
  };
}
