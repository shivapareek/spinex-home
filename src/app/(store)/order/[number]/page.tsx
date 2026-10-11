import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { CheckCircle, Circle } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { checkOrderToken } from "@/lib/orders";
import { getSession } from "@/lib/auth";
import { cn, formatDate, inr } from "@/lib/utils";

export const metadata = { title: "Your order", robots: { index: false } };

const STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"];
const LABEL: Record<string, string> = { pending: "Placed", confirmed: "Confirmed", packed: "Packed", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", returned: "Returned" };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }) {
  const { number } = await params;
  const { t } = await searchParams;
  const o = db.select().from(orders).where(eq(orders.orderNumber, number)).get();
  if (!o) notFound();
  const s = await getSession();
  const allowed = checkOrderToken(o.orderNumber, t) || (s && (s.uid === o.userId || s.role === "admin" || s.role === "staff"));
  if (!allowed) notFound();
  const items = db.select().from(orderItems).where(eq(orderItems.orderId, o.id)).all();
  const step = STEPS.indexOf(o.status);
  const a = o.shippingAddress;
  const awaitingPayment = o.paymentMethod === "razorpay" && o.paymentStatus !== "paid";

  return (
    <section className="container max-w-4xl pb-28 pt-32">
      <div className="text-center">
        <p className="font-deva text-2xl text-maroon/70">शुभम् भवतु</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight md:text-6xl">{awaitingPayment ? "Payment pending" : o.status === "cancelled" ? "Order cancelled" : "Thank you — your blessings are on their way."}</h1>
        <p className="mt-4 text-ink/60">Order <b className="text-ink">{o.orderNumber}</b> · placed {formatDate(o.createdAt, true)}</p>
        {awaitingPayment && <p className="mx-auto mt-4 max-w-md rounded-2xl bg-gold/15 px-5 py-3 text-sm text-gold-deep">We haven't received your online payment yet. If money was deducted, it will reflect shortly — or contact us with your order number.</p>}
      </div>

      {o.status !== "cancelled" && o.status !== "returned" && (
        <ol className="mx-auto mt-14 grid max-w-2xl grid-cols-5">
          {STEPS.map((st, i) => (
            <li key={st} className="relative flex flex-col items-center text-center">
              {i > 0 && <span className={cn("absolute right-1/2 top-3 h-0.5 w-full", i <= step ? "bg-maroon" : "bg-ink/10")} />}
              <span className="relative z-[1] bg-ivory px-1">{i <= step ? <CheckCircle className="h-6 w-6 text-maroon" weight="fill" /> : <Circle className="h-6 w-6 text-ink/20" />}</span>
              <span className={cn("mt-2 text-[11px]", i <= step ? "text-ink" : "text-ink/40")}>{LABEL[st]}</span>
            </li>
          ))}
        </ol>
      )}
      {o.trackingNumber && (
        <p className="mt-8 text-center text-sm text-ink/70">Shipped via <b>{o.courier || "courier"}</b> · Tracking no. <b>{o.trackingNumber}</b></p>
      )}

      <div className="mt-14 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[2rem] bg-white p-6 ring-1 ring-ink/[0.06]">
          <h2 className="font-display text-xl">Items</h2>
          <ul className="mt-4 divide-y divide-ink/[0.06]">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 py-3">
                <span className="grid h-14 w-12 place-items-center rounded-xl bg-ivory">{it.image && <img src={it.image} alt="" className="h-11 w-11 object-contain" />}</span>
                <span className="flex-1 text-sm">{it.name} <span className="text-ink/45">× {it.quantity}</span></span>
                <span className="text-sm tabular-nums">{inr(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-ink/[0.06] pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink/55">Subtotal</dt><dd>{inr(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-tulsi"><dt>Discount {o.couponCode && `(${o.couponCode})`}</dt><dd>−{inr(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink/55">Shipping</dt><dd>{o.shippingFee ? inr(o.shippingFee) : "Free"}</dd></div>
            {o.codFee > 0 && <div className="flex justify-between"><dt className="text-ink/55">COD fee</dt><dd>{inr(o.codFee)}</dd></div>}
            <div className="flex justify-between pt-2 font-semibold"><dt>Total</dt><dd className="font-display text-2xl">{inr(o.total)}</dd></div>
          </dl>
        </div>
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 ring-1 ring-ink/[0.06]">
            <h2 className="font-display text-xl">Delivering to</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{a.name}<br />{a.line1}{a.line2 && <>, {a.line2}</>}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 ring-1 ring-ink/[0.06]">
            <h2 className="font-display text-xl">Payment</h2>
            <p className="mt-3 text-sm text-ink/70">{o.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)"} · <span className="capitalize">{o.paymentStatus}</span></p>
          </div>
          <Link href="/shop" className="flex h-12 items-center justify-center rounded-full bg-ink text-sm text-ivory transition hover:bg-maroon">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}
