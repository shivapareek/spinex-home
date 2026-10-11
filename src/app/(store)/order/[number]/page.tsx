import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Check, Clock, XCircle } from "@phosphor-icons/react/dist/ssr";
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

  const cancelled = o.status === "cancelled" || o.status === "returned";

  return (
    <section className="container max-w-4xl py-10 md:py-16">
      <div className="text-center">
        <span className={cn("mx-auto grid h-14 w-14 place-items-center rounded-full", awaitingPayment ? "bg-accent-soft" : cancelled ? "bg-surface" : "bg-tulsi/10")}>
          {awaitingPayment ? <Clock className="h-7 w-7 text-accent" weight="bold" /> : cancelled ? <XCircle className="h-7 w-7 text-muted" weight="bold" /> : <Check className="h-7 w-7 text-tulsi" weight="bold" />}
        </span>
        <h1 className="mt-5 text-3xl font-semibold md:text-4xl">{awaitingPayment ? "Payment pending" : o.status === "cancelled" ? "Order cancelled" : o.status === "returned" ? "Order returned" : "Thank you! Your order is placed."}</h1>
        <p className="mt-3 text-[15px] text-muted">Order <b className="font-semibold text-ink">{o.orderNumber}</b> · placed {formatDate(o.createdAt, true)}</p>
        {awaitingPayment && <p className="mx-auto mt-5 max-w-md rounded-xl border border-accent/20 bg-accent-soft px-5 py-3 text-sm text-accent-deep">We have not received your online payment yet. If money was deducted, it will show up soon. You can also contact us with your order number.</p>}
      </div>

      {!cancelled && (
        <ol className="mx-auto mt-12 grid max-w-2xl grid-cols-5">
          {STEPS.map((st, i) => (
            <li key={st} className="relative flex flex-col items-center text-center">
              {i > 0 && <span className={cn("absolute right-1/2 top-3.5 h-0.5 w-full", i <= step ? "bg-ink" : "bg-line")} />}
              <span className={cn("relative z-[1] grid h-7 w-7 place-items-center rounded-full text-xs font-semibold", i <= step ? "bg-ink text-white" : "border border-line bg-white text-muted")}>
                {i <= step ? <Check className="h-3.5 w-3.5" weight="bold" /> : i + 1}
              </span>
              <span className={cn("mt-2 text-[11px] sm:text-xs", i <= step ? "font-medium text-ink" : "text-muted")}>{LABEL[st]}</span>
            </li>
          ))}
        </ol>
      )}
      {o.trackingNumber && (
        <p className="mt-8 text-center text-sm text-muted">Shipped by <b className="font-medium text-ink">{o.courier || "courier"}</b> · Tracking no. <b className="font-medium text-ink">{o.trackingNumber}</b></p>
      )}

      <div className="mt-12 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5 md:p-6">
          <h2 className="text-lg font-semibold">Items</h2>
          <ul className="mt-3 divide-y divide-line">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 py-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-surface">{it.image && <img src={it.image} alt="" className="h-11 w-11 object-contain" />}</span>
                <span className="min-w-0 flex-1 text-sm">{it.name} <span className="text-muted">× {it.quantity}</span></span>
                <span className="text-sm font-medium tabular-nums">{inr(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{inr(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-tulsi"><dt>Discount {o.couponCode && `(${o.couponCode})`}</dt><dd>−{inr(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{o.shippingFee ? inr(o.shippingFee) : "Free"}</dd></div>
            {o.codFee > 0 && <div className="flex justify-between"><dt className="text-muted">COD fee</dt><dd>{inr(o.codFee)}</dd></div>}
            <div className="flex items-baseline justify-between border-t border-line pt-3 font-semibold"><dt className="text-base">Total</dt><dd className="text-xl">{inr(o.total)}</dd></div>
          </dl>
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-white p-5 md:p-6">
            <h2 className="text-lg font-semibold">Delivery address</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{a.name}<br />{a.line1}{a.line2 && <>, {a.line2}</>}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 md:p-6">
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="mt-2 text-sm text-muted">{o.paymentMethod === "cod" ? "Cash on delivery" : "Online (Razorpay)"} · <span className="capitalize">{o.paymentStatus}</span></p>
          </div>
          <Link href="/shop" className="btn-primary h-12 w-full">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}
