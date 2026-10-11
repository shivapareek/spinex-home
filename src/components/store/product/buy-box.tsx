"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, MapPin, Star } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useCart, useHydrated, useWishlist } from "@/lib/client/cart";
import { submitReview } from "@/app/(store)/actions";
import { cn, inr } from "@/lib/utils";

type P = { id: number; slug: string; name: string; price: number; stock: number; image: string | null };

export function BuyBox({ p, dispatchDays }: { p: P; dispatchDays: string }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const router = useRouter();
  const hydrated = useHydrated();
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);
  const out = p.stock <= 0;
  const item = { productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, stock: p.stock };

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Quantity</p>
      <div className="flex items-center gap-3">
        <div className="flex h-12 items-center rounded-full border border-line">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-11 place-items-center text-muted hover:text-ink" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(p.stock || 1, q + 1))} className="grid h-12 w-11 place-items-center text-muted hover:text-ink" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
        </div>
        {!out && p.stock <= 10 && <p className="text-xs font-medium text-sindoor">Only {p.stock} left</p>}
      </div>
      <div className="mt-4 flex gap-3">
        <button disabled={out} onClick={() => add(item, qty)} className="btn-primary h-12 flex-1">
          {out ? "Out of stock" : "Add to cart"}
        </button>
        <button
          onClick={() => { toggle(p.id); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line transition hover:border-ink"
          aria-label="Wishlist"
        >
          <Heart className={cn("h-5 w-5", hydrated && wished && "text-sindoor")} weight={hydrated && wished ? "fill" : "regular"} />
        </button>
      </div>
      {!out && (
        <button onClick={() => { add(item, qty); setOpen(false); router.push("/checkout"); }} className="btn-accent mt-3 h-12 w-full">
          Buy now
        </button>
      )}
      <Pincode dispatchDays={dispatchDays} />

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">{p.name}</p>
          <p className="text-lg font-semibold leading-none">{inr(p.price)}</p>
        </div>
        <button disabled={out} onClick={() => add(item, qty)} className="btn-primary h-11">
          {out ? "Sold out" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

function Pincode({ dispatchDays }: { dispatchDays: string }) {
  const [pin, setPin] = useState("");
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="mt-6 rounded-2xl border border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^[1-9]\d{5}$/.test(pin)) return setRes({ ok: false, text: "Please enter a valid 6-digit pincode" });
        const d = new Date();
        const fmt = (n: number) => new Date(d.getTime() + n * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        setRes({ ok: true, text: `Usually delivered by ${fmt(4)} – ${fmt(7)} · Ships in ${dispatchDays} · COD available` });
      }}
    >
      <label className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4" /> Check delivery</label>
      <div className="mt-3 flex gap-2">
        <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Enter pincode" className="field h-10" />
        <button className="btn-outline h-10 px-4">Check</button>
      </div>
      {res && <p className={cn("mt-2 text-xs", res.ok ? "text-tulsi" : "text-sindoor")}>{res.text}</p>}
    </form>
  );
}

export function ReviewForm({ productId }: { productId: number }) {
  const [state, action, pending] = useActionState(submitReview, null);
  const [rating, setRating] = useState(0);
  const [open, setOpen] = useState(false);
  if (state?.ok) return <p className="rounded-xl bg-tulsi/10 px-4 py-3 text-sm text-tulsi">{state.message}</p>;
  if (!open) return <button onClick={() => setOpen(true)} className="btn-outline">Write a review</button>;
  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-line p-5 sm:grid-cols-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="sm:col-span-2">
        <p className="mb-1 text-sm font-medium">Your rating</p>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className="p-0.5">
              <Star className={cn("h-6 w-6 transition", n <= rating ? "text-accent" : "text-ink/15")} weight="fill" />
            </button>
          ))}
        </div>
      </div>
      <input name="name" required placeholder="Your name" className="field" />
      <input name="city" placeholder="City (optional)" className="field" />
      <input name="title" placeholder="Title (optional)" className="field sm:col-span-2" />
      <textarea name="body" required rows={4} placeholder="How does it look in your car or mandir?" className="field h-auto py-3 sm:col-span-2" />
      {state?.error && <p className="text-sm text-sindoor sm:col-span-2">{state.error}</p>}
      <button disabled={pending} className="btn-primary sm:col-span-2">{pending ? "Submitting…" : "Submit review"}</button>
    </form>
  );
}
