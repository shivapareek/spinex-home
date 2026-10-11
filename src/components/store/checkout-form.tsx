"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Money, Lock, Tag, X, Spinner } from "@phosphor-icons/react";
import { useCart, useHydrated } from "@/lib/client/cart";
import { cn, inr } from "@/lib/utils";

type Quote = {
  lines: { productId: number; name: string; slug: string; image: string | null; price: number; quantity: number; lineTotal: number; stock: number }[];
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

type Prefill = { name?: string; email?: string; phone?: string; address?: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string } | null };

declare global {
  interface Window {
    Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

export function CheckoutForm({ states, codEnabled, codFee, razorpayEnabled, prefill }: { states: string[]; codEnabled: boolean; codFee: number; razorpayEnabled: boolean; prefill: Prefill }) {
  const hydrated = useHydrated();
  const { items, coupon, setCoupon, clear } = useCart();
  const router = useRouter();
  const [method, setMethod] = useState<"cod" | "razorpay">(razorpayEnabled ? "razorpay" : "cod");
  const [q, setQ] = useState<Quote | null>(null);
  const [code, setCode] = useState("");
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  const lines = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
  const key = JSON.stringify([lines, coupon, method]);
  useEffect(() => {
    if (!hydrated) return;
    const ctl = new AbortController();
    fetch("/api/checkout/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: lines, coupon, paymentMethod: method }), signal: ctl.signal })
      .then((r) => r.json())
      .then((d: Quote) => {
        setQ(d);
        if (coupon && d.couponError) {
          toast.error(d.couponError);
          setCoupon(null);
        }
      })
      .catch(() => {});
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hydrated]);

  if (!hydrated) return <div className="h-96" />;
  if (!items.length)
    return (
      <div className="rounded-2xl border border-line px-6 py-20 text-center">
        <p className="text-xl font-semibold">Your cart is empty</p>
        <p className="mt-1 text-[15px] text-muted">Add an idol to your cart to check out.</p>
        <Link href="/shop" className="btn-primary mt-6">Browse idols</Link>
      </div>
    );

  async function place(fd: FormData) {
    setErrors(null);
    setPlacing(true);
    const body = {
      items: lines,
      coupon,
      paymentMethod: method,
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      address: {
        name: String(fd.get("name") || ""),
        line1: String(fd.get("line1") || ""),
        line2: String(fd.get("line2") || ""),
        city: String(fd.get("city") || ""),
        state: String(fd.get("state") || ""),
        pincode: String(fd.get("pincode") || ""),
      },
      note: String(fd.get("note") || ""),
    };
    try {
      const res = await fetch("/api/checkout/place", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok && !d.orderNumber) throw new Error(d.error || "Couldn't place your order");
      const done = () => {
        clear();
        router.push(`/order/${d.orderNumber}?t=${d.token}`);
      };
      if (!d.razorpay) {
        if (d.error) throw new Error(d.error);
        return done();
      }
      await loadRazorpay();
      const rzp = new window.Razorpay!({
        key: d.razorpay.keyId,
        order_id: d.razorpay.orderId,
        amount: d.razorpay.amount,
        currency: "INR",
        name: d.razorpay.name,
        description: `Order ${d.orderNumber}`,
        prefill: { name: d.razorpay.customer, email: d.razorpay.email, contact: d.razorpay.phone },
        theme: { color: "#111111" },
        handler: async (r: Record<string, string>) => {
          const v = await fetch("/api/checkout/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber: d.orderNumber, ...r }) });
          if (!v.ok) toast.error("We couldn't verify the payment. If money was deducted, contact us with your order number.");
          done();
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast("Payment cancelled. Your order is saved — you can retry from the order page.");
            done();
          },
        },
      });
      rzp.open();
    } catch (e) {
      setErrors((e as Error).message);
      setPlacing(false);
    }
  }

  const field = "field";
  const a = prefill.address ?? {};

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!placing) place(new FormData(e.currentTarget));
      }}
      className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12"
    >
      <div className="space-y-6">
        <Step n={1} title="Contact details">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="email" type="email" required defaultValue={prefill.email} placeholder="Email" autoComplete="email" className={field} />
            <input name="phone" type="tel" required defaultValue={prefill.phone} placeholder="Mobile number" autoComplete="tel" inputMode="tel" className={field} />
          </div>
        </Step>
        <Step n={2} title="Delivery address">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required defaultValue={prefill.name} placeholder="Full name" autoComplete="name" className={cn(field, "sm:col-span-2")} />
            <input name="line1" required defaultValue={a.line1} placeholder="House no., building, street" autoComplete="address-line1" className={cn(field, "sm:col-span-2")} />
            <input name="line2" defaultValue={a.line2} placeholder="Area, landmark (optional)" autoComplete="address-line2" className={cn(field, "sm:col-span-2")} />
            <input name="city" required defaultValue={a.city} placeholder="City" autoComplete="address-level2" className={field} />
            <input name="pincode" required defaultValue={a.pincode} placeholder="Pincode" inputMode="numeric" maxLength={6} autoComplete="postal-code" className={field} />
            <select name="state" required defaultValue={a.state ?? ""} className={cn(field, "sm:col-span-2")}>
              <option value="" disabled>State</option>
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
            <textarea name="note" rows={2} placeholder="Order note (optional)" className={cn(field, "h-auto py-3 sm:col-span-2")} />
          </div>
        </Step>
        <Step n={3} title="Payment method">
          <div className="grid gap-3">
            {razorpayEnabled && (
              <PayOption on={method === "razorpay"} onClick={() => setMethod("razorpay")} Icon={CreditCard} title="Pay online" body="UPI, cards, net banking and wallets. Secured by Razorpay." />
            )}
            {codEnabled && (
              <PayOption on={method === "cod"} onClick={() => setMethod("cod")} Icon={Money} title="Cash on delivery" body={codFee ? `${inr(codFee)} extra COD fee applies` : "Pay when your order arrives"} />
            )}
            {!razorpayEnabled && !codEnabled && <p className="text-sm text-sindoor">Checkout is not available right now. Please contact us to order.</p>}
          </div>
        </Step>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-white p-5 md:p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {(q?.lines ?? []).map((l) => (
              <li key={l.productId} className="flex items-center gap-3">
                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-line bg-surface">
                  {l.image && <img src={l.image} alt="" className="h-11 w-11 object-contain" />}
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white">{l.quantity}</span>
                </span>
                <span className="min-w-0 flex-1 text-sm">{l.name}</span>
                <span className="text-sm font-medium tabular-nums">{inr(l.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {coupon && q?.coupon ? (
              <div className="flex items-center justify-between rounded-xl border border-tulsi/30 bg-tulsi/5 px-4 py-3 text-sm text-tulsi">
                <span className="flex items-center gap-2"><Tag className="h-4 w-4" /> <b className="font-semibold">{q.coupon.code}</b> applied</span>
                <button type="button" onClick={() => setCoupon(null)} aria-label="Remove coupon"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="field h-11 min-w-0 flex-1 uppercase placeholder:normal-case" />
                <button type="button" onClick={() => code && setCoupon(code)} className="btn-outline h-11 rounded-xl px-5">Apply</button>
              </div>
            )}
          </div>

          <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
            <Row k="Subtotal" v={inr(q?.subtotal ?? 0)} />
            {!!q?.discount && <Row k="Discount" v={`−${inr(q.discount)}`} green />}
            <Row k="Shipping" v={q ? (q.shippingFee ? inr(q.shippingFee) : "Free") : "—"} />
            {!!q?.codFee && <Row k="COD fee" v={inr(q.codFee)} />}
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <dt className="text-base font-semibold">Total</dt>
              <dd className="text-xl font-semibold tabular-nums">{inr(q?.total ?? 0)}</dd>
            </div>
          </dl>
          {q?.errors?.length ? <p className="mt-4 rounded-xl bg-sindoor/10 px-4 py-3 text-sm text-sindoor">{q.errors[0]}</p> : null}
          {errors && <p className="mt-4 rounded-xl bg-sindoor/10 px-4 py-3 text-sm text-sindoor">{errors}</p>}
          <button
            disabled={placing || !q || q.errors.length > 0 || (!razorpayEnabled && !codEnabled)}
            className="btn-primary mt-6 h-12 w-full"
          >
            {placing ? <Spinner className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" weight="bold" />}
            {method === "razorpay" ? `Pay ${inr(q?.total ?? 0)}` : "Place order"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">By placing this order you agree to our <Link href="/p/terms" className="underline underline-offset-2">terms</Link>.</p>
        </div>
      </aside>
    </form>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-semibold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function PayOption({ on, onClick, Icon, title, body }: { on: boolean; onClick: () => void; Icon: React.ElementType; title: string; body: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex items-center gap-4 rounded-xl border bg-white p-4 text-left transition", on ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink/40")}>
      <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border", on ? "border-ink" : "border-ink/25")}>{on && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted">{body}</span>
      </span>
      <Icon className={cn("h-6 w-6 shrink-0", on ? "text-accent" : "text-muted")} />
    </button>
  );
}

const Row = ({ k, v, green }: { k: string; v: string; green?: boolean }) => (
  <div className="flex justify-between">
    <dt className="text-muted">{k}</dt>
    <dd className={cn("tabular-nums", green && "text-tulsi")}>{v}</dd>
  </div>
);

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res();
    s.onerror = () => rej(new Error("Couldn't load the payment window. Check your connection."));
    document.body.appendChild(s);
  });
}
