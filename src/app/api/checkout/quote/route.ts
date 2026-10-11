import { NextResponse } from "next/server";
import { z } from "zod";
import { quote } from "@/lib/pricing";

const schema = z.object({
  items: z.array(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(99) })).max(50),
  coupon: z.string().max(40).nullish(),
  paymentMethod: z.enum(["cod", "razorpay"]).optional(),
});

export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  return NextResponse.json(quote(p.data.items, { couponCode: p.data.coupon, paymentMethod: p.data.paymentMethod }));
}
