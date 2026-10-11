"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBagOpen, Lightning, MapPin, Star } from "@phosphor-icons/react";
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
      <div className="flex items-center gap-3">
        <div className="flex h-14 items-center rounded-full bg-white ring-1 ring-ink/10">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-14 w-12 place-items-center text-ink/60 hover:text-ink" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
          <span className="w-8 text-center font-medium tabular-nums">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(p.stock || 1, q + 1))} className="grid h-14 w-12 place-items-center text-ink/60 hover:text-ink" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
        </div>
        <button
          disabled={out}
          onClick={() => add(item, qty)}
          className="group flex h-14 flex-1 items-center justify-between rounded-full bg-ink pl-6 pr-2 text-sm font-semibold text-ivory transition hover:bg-maroon active:scale-[0.98] disabled:opacity-40"
        >
          {out ? "Out of stock" : "Add to cart"}
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold text-ink transition-transform duration-500 ease-silk group-hover:translate-x-0.5 group-hover:scale-105">
            <ShoppingBagOpen className="h-4 w-4" weight="bold" />
          </span>
        </button>
        <button
          onClick={() => { toggle(p.id); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white ring-1 ring-ink/10 transition hover:ring-sindoor/40"
          aria-label="Wishlist"
        >
          <Heart className={cn("h-5 w-5", hydrated && wished && "text-sindoor")} weight={hydrated && wished ? "fill" : "light"} />
        </button>
      </div>
      {!out && (
        <button
          onClick={() => { add(item, qty); setOpen(false); router.push("/checkout"); }}
          className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gold text-sm font-semibold text-ink shadow-aura transition hover:bg-gold-bright active:scale-[0.98]"
        >
          <Lightning className="h-4 w-4" weight="fill" /> Buy it now
        </button>
      )}
      {!out && p.stock <= 10 && <p className="mt-3 text-xs font-medium text-sindoor">Only {p.stock} left in stock</p>}
      <Pincode dispatchDays={dispatchDays} />

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-ink/60">{p.name}</p>
          <p className="font-display text-lg leading-none">{inr(p.price)}</p>
        </div>
        <button disabled={out} onClick={() => add(item, qty)} className="h-12 rounded-full bg-ink px-6 text-sm font-semibold text-ivory disabled:opacity-40">
          {out ? "Sold out" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

function Pincode({ dispatchDays }: { dispatchDays: string }) {
  const [pin, setPin] = useState("");
  const [res, setRes] = useState<string | null>(null);
  return (
    <form
      className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-ink/[0.07]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^[1-9]\d{5}$/.test(pin)) return setRes("Please enter a valid 6-digit pincode");
        const d = new Date();
        const add = (n: number) => new Date(d.getTime() + n * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        setRes(`Delivers to ${pin} in about ${add(4)} – ${add(7)} · Dispatch in ${dispatchDays} · COD available`);
      }}
    >
      <label className="flex items-center gap-2 text-xs font-medium text-ink/70"><MapPin className="h-4 w-4 text-maroon" weight="light" /> Check delivery</label>
      <div className="mt-2 flex gap-2">
        <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Enter pincode" className="h-10 flex-1 rounded-full bg-ivory px-4 text-sm outline-none ring-1 ring-ink/10 focus:ring-gold" />
        <button className="h-10 rounded-full px-4 text-xs font-semibold text-maroon ring-1 ring-maroon/20 hover:bg-maroon hover:text-ivory">Check</button>
      </div>
      {res && <p className="mt-2 text-xs text-ink/60">{res}</p>}
    </form>
  );
}

export function ReviewForm({ productId }: { productId: number }) {
  const [state, action, pending] = useActionState(submitReview, null);
  const [rating, setRating] = useState(0);
  const [open, setOpen] = useState(false);
  const field = "w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-gold";
  if (state?.ok) return <p className="rounded-2xl bg-tulsi/10 px-5 py-4 text-sm text-tulsi">{state.message}</p>;
  if (!open) return <button onClick={() => setOpen(true)} className="h-12 rounded-full px-6 text-sm font-medium ring-1 ring-ink/15 transition hover:bg-ink hover:text-ivory">Write a review</button>;
  return (
    <form action={action} className="grid gap-3 rounded-[1.6rem] bg-ivory-2/60 p-5 ring-1 ring-ink/[0.06] sm:grid-cols-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1 sm:col-span-2" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className="p-0.5">
            <Star className={cn("h-7 w-7 transition", n <= rating ? "text-gold" : "text-ink/20")} weight="fill" />
          </button>
        ))}
      </div>
      <input name="name" required placeholder="Your name" className={field} />
      <input name="city" placeholder="City (optional)" className={field} />
      <input name="title" placeholder="Headline (optional)" className={cn(field, "sm:col-span-2")} />
      <textarea name="body" required rows={4} placeholder="How does it look in your car or mandir?" className={cn(field, "sm:col-span-2")} />
      {state?.error && <p className="text-sm text-sindoor sm:col-span-2">{state.error}</p>}
      <button disabled={pending} className="h-12 rounded-full bg-ink text-sm font-semibold text-ivory transition hover:bg-maroon disabled:opacity-60 sm:col-span-2">{pending ? "Submitting…" : "Submit review"}</button>
    </form>
  );
}
