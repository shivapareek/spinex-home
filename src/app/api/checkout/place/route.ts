import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { checkoutSchema, createOrder, orderToken } from "@/lib/orders";
import { createRazorpayOrder, razorpayKeys } from "@/lib/razorpay";
import { getSetting } from "@/lib/settings";

export async function POST(req: Request) {
  const p = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 400 });
  const session = await getSession();
  let order;
  try {
    order = createOrder(p.data, session?.uid ?? null);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
  const token = orderToken(order.orderNumber);
  if (order.paymentMethod === "cod") return NextResponse.json({ orderNumber: order.orderNumber, token });

  try {
    const rzp = await createRazorpayOrder(order.total, order.orderNumber);
    db.update(orders).set({ razorpayOrderId: rzp.id }).where(eq(orders.id, order.id)).run();
    const site = getSetting("site");
    return NextResponse.json({
      orderNumber: order.orderNumber,
      token,
      razorpay: { keyId: razorpayKeys().keyId, orderId: rzp.id, amount: rzp.amount, name: site.name, email: order.email, phone: order.phone, customer: order.shippingAddress.name },
    });
  } catch (e) {
    return NextResponse.json({ orderNumber: order.orderNumber, token, error: (e as Error).message }, { status: 502 });
  }
}
