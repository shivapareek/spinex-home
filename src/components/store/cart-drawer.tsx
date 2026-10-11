"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X, Truck, ArrowRight, Bag } from "@phosphor-icons/react";
import { cartSubtotal, useCart, useHydrated } from "@/lib/client/cart";
import { inr } from "@/lib/utils";

export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const hydrated = useHydrated();
  const { items, open, setOpen, setQty, remove } = useCart();
  const subtotal = cartSubtotal(items);
  const left = Math.max(0, freeShippingThreshold - subtotal);
  const pct = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, setOpen]);

  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <AnimatePresence>
      {hydrated && open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-line bg-white shadow-lift"
          >
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              <h2 className="text-lg font-semibold">
                Your cart{items.length > 0 && <span className="ml-1.5 text-sm font-normal text-muted">({count} item{count > 1 ? "s" : ""})</span>}
              </h2>
              <button onClick={() => setOpen(false)} className="-mr-2 grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </header>

            {items.length > 0 && (
              <div className="border-b border-line px-5 py-4">
                <p className="flex items-center gap-2 text-[13px] text-muted">
                  <Truck className="h-4 w-4 shrink-0 text-accent" />
                  {left > 0 ? <span>Add <b className="font-semibold text-ink">{inr(left)}</b> more for free shipping</span> : <b className="font-medium text-tulsi">You get free shipping on this order</b>}
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface">
                  <motion.div className="h-full rounded-full bg-accent" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }} />
                </div>
              </div>
            )}

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((it) => (
                <motion.li layout key={it.productId} className="flex gap-4 py-4">
                  <Link href={`/product/${it.slug}`} onClick={() => setOpen(false)} className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-surface">
                    {it.image && <img src={it.image} alt="" className="h-[80%] w-[80%] object-contain" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${it.slug}`} onClick={() => setOpen(false)} className="text-sm font-medium leading-snug text-ink hover:underline">{it.name}</Link>
                      <button onClick={() => remove(it.productId)} className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink" aria-label={`Remove ${it.name}`}><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <p className="text-xs text-muted">{inr(it.price)} each</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-line">
                        <button onClick={() => setQty(it.productId, it.quantity - 1)} className="grid h-8 w-8 place-items-center text-muted hover:text-ink" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                        <span className="w-6 text-center text-sm tabular-nums">{it.quantity}</span>
                        <button onClick={() => setQty(it.productId, it.quantity + 1)} className="grid h-8 w-8 place-items-center text-muted hover:text-ink" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">{inr(it.price * it.quantity)}</p>
                    </div>
                  </div>
                </motion.li>
              ))}
              {items.length === 0 && (
                <li className="flex flex-col items-center px-6 py-16 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-surface"><Bag className="h-7 w-7 text-muted" /></span>
                  <p className="mt-5 text-base font-semibold">Your cart is empty</p>
                  <p className="mt-1 max-w-[16rem] text-sm text-muted">Add an idol you love and it will show up here.</p>
                  <Link href="/shop" onClick={() => setOpen(false)} className="btn-primary mt-6">Browse idols</Link>
                </li>
              )}
            </ul>

            {items.length > 0 && (
              <footer className="shrink-0 border-t border-line px-5 pb-5 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted">Subtotal</span>
                  <span className="text-lg font-semibold tabular-nums">{inr(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">Including all taxes. Shipping and coupons are added at checkout.</p>
                <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary mt-4 h-12 w-full">
                  Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <button onClick={() => setOpen(false)} className="mt-2 w-full py-2 text-center text-sm text-muted hover:text-ink">Continue shopping</button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
