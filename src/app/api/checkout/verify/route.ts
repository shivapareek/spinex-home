import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { verifyRazorpaySignature } from "@/lib/razorpay";

const schema = z.object({
  orderNumber: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const o = db.select().from(orders).where(eq(orders.orderNumber, p.data.orderNumber)).get();
  if (!o || o.razorpayOrderId !== p.data.razorpay_order_id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!verifyRazorpaySignature(p.data.razorpay_order_id, p.data.razorpay_payment_id, p.data.razorpay_signature)) {
    db.update(orders).set({ paymentStatus: "failed", updatedAt: new Date().toISOString() }).where(eq(orders.id, o.id)).run();
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }
  if (o.paymentStatus !== "paid") {
    const now = new Date().toISOString();
    db.update(orders)
      .set({ paymentStatus: "paid", status: "confirmed", razorpayPaymentId: p.data.razorpay_payment_id, updatedAt: now, history: [...o.history, { status: "confirmed", note: "Payment received online", at: now }] })
      .where(eq(orders.id, o.id))
      .run();
  }
  return NextResponse.json({ ok: true });
}
