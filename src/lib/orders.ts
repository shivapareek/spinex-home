import "server-only";
import crypto from "node:crypto";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { coupons, orderItems, orders, products, type Address } from "@/db/schema";
import { quote } from "./pricing";
import { getSetting } from "./settings";
import { razorpayKeys } from "./razorpay";

const secret = () => process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me-spinex-home";

/** Unguessable token so only the buyer can open their order page. */
export const orderToken = (orderNumber: string) => crypto.createHmac("sha256", secret()).update(`order:${orderNumber}`).digest("hex").slice(0, 24);
export const checkOrderToken = (n: string, t?: string | null) => {
  if (!t) return false;
  const a = Buffer.from(orderToken(n));
  const b = Buffer.from(t);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).min(1, "Your cart is empty").max(50),
  coupon: z.string().trim().max(40).nullish(),
  paymentMethod: z.enum(["cod", "razorpay"]),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  address: z.object({
    name: z.string().trim().min(2, "Please enter the recipient's name").max(80),
    phone: z.string().trim().optional(),
    line1: z.string().trim().min(4, "Please enter your address").max(160),
    line2: z.string().trim().max(160).optional(),
    city: z.string().trim().min(2, "Please enter your city").max(60),
    state: z.string().refine((s) => INDIAN_STATES.includes(s), "Please choose your state"),
    pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Please enter a valid 6-digit pincode"),
  }),
  note: z.string().trim().max(500).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

function newOrderNumber() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `SPX${ymd}${crypto.randomInt(1000, 9999)}`;
}

/** Creates the order atomically: re-prices on the server, reserves stock, consumes the coupon. */
export function createOrder(input: CheckoutInput, userId: number | null) {
  const commerce = getSetting("commerce");
  if (input.paymentMethod === "cod" && !commerce.codEnabled) throw new Error("Cash on Delivery isn't available right now");
  if (input.paymentMethod === "razorpay" && !razorpayKeys().enabled) throw new Error("Online payment isn't available right now");
  const q = quote(input.items, { couponCode: input.coupon, paymentMethod: input.paymentMethod });
  if (q.errors.length) throw new Error(q.errors[0]);
  if (input.coupon && q.couponError) throw new Error(q.couponError);

  const address: Address = { ...input.address, phone: input.address.phone || input.phone };
  const now = new Date().toISOString();
  return db.transaction((tx) => {
    for (const l of q.lines) {
      const r = tx.update(products).set({ stock: sql`${products.stock} - ${l.quantity}` }).where(and(eq(products.id, l.productId), gte(products.stock, l.quantity))).run();
      if (r.changes === 0) throw new Error(`Sorry, ${l.name} just went out of stock`);
    }
    if (q.coupon) tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.code, q.coupon.code)).run();
    let orderNumber = newOrderNumber();
    while (tx.select({ id: orders.id }).from(orders).where(eq(orders.orderNumber, orderNumber)).get()) orderNumber = newOrderNumber();
    const order = tx
      .insert(orders)
      .values({
        orderNumber, userId, email: input.email, phone: input.phone, shippingAddress: address,
        subtotal: q.subtotal, discount: q.discount, shippingFee: q.shippingFee, codFee: q.codFee, total: q.total,
        couponCode: q.coupon?.code ?? null, paymentMethod: input.paymentMethod, paymentStatus: "pending", status: "pending",
        customerNote: input.note || null, history: [{ status: "pending", note: input.paymentMethod === "cod" ? "Order placed (Cash on Delivery)" : "Awaiting online payment", at: now }],
        createdAt: now, updatedAt: now,
      })
      .returning()
      .get();
    for (const l of q.lines) {
      tx.insert(orderItems).values({ orderId: order.id, productId: l.productId, name: l.name, sku: l.sku, image: l.image, price: l.price, quantity: l.quantity }).run();
    }
    return order;
  });
}
