"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X, Truck, ArrowUpRight } from "@phosphor-icons/react";
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

  return (
    <AnimatePresence>
      {hydrated && open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-ivory p-2 sm:p-3"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-soft ring-1 ring-ink/[0.05]">
              <header className="flex items-center justify-between px-6 pb-4 pt-6">
                <div>
                  <p className="eyebrow bg-gold/15 text-gold-deep">Your cart</p>
                  <h2 className="mt-2 font-display text-2xl">{items.length ? `${items.reduce((n, i) => n + i.quantity, 0)} blessings packed` : "Your cart is empty"}</h2>
                </div>
                <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-ink/10 transition hover:rotate-90 hover:ring-ink/30" aria-label="Close cart" style={{ transitionTimingFunction: "var(--ease-silk)", transitionDuration: "500ms" }}>
                  <X className="h-4 w-4" />
                </button>
              </header>

              {items.length > 0 && (
                <div className="mx-6 mb-2 rounded-2xl bg-ivory px-4 py-3">
                  <p className="flex items-center gap-2 text-xs text-ink/70">
                    <Truck className="h-4 w-4 text-gold-deep" weight="light" />
                    {left > 0 ? <>Add <b className="text-ink">{inr(left)}</b> more for free shipping</> : <b className="text-tulsi">You’ve unlocked free shipping</b>}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }} />
                  </div>
                </div>
              )}

              <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-2">
                {items.map((it) => (
                  <motion.li layout key={it.productId} className="flex gap-4 rounded-2xl p-2 transition hover:bg-ivory/60">
                    <Link href={`/product/${it.slug}`} onClick={() => setOpen(false)} className="grid h-24 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-ivory to-ivory-2">
                      {it.image && <img src={it.image} alt="" className="h-[85%] w-[85%] object-contain" />}
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/product/${it.slug}`} onClick={() => setOpen(false)} className="text-sm font-medium leading-snug text-ink hover:text-maroon">{it.name}</Link>
                        <button onClick={() => remove(it.productId)} className="text-ink/30 transition hover:text-sindoor" aria-label={`Remove ${it.name}`}><X className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="mt-0.5 text-xs text-ink/50">{inr(it.price)} each</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-full ring-1 ring-ink/10">
                          <button onClick={() => setQty(it.productId, it.quantity - 1)} className="grid h-8 w-8 place-items-center text-ink/60 hover:text-ink" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                          <span className="w-6 text-center text-sm tabular-nums">{it.quantity}</span>
                          <button onClick={() => setQty(it.productId, it.quantity + 1)} className="grid h-8 w-8 place-items-center text-ink/60 hover:text-ink" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">{inr(it.price * it.quantity)}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
                {items.length === 0 && (
                  <li className="flex flex-col items-center px-6 py-16 text-center">
                    <img src="/uploads/products/m1-ganesh-ji-cutout.webp" alt="" className="h-28 animate-float object-contain opacity-90" />
                    <p className="mt-6 max-w-[16rem] text-sm text-ink/55">Shri Ganesh is waiting to begin your journey. Start with something auspicious.</p>
                    <Link href="/shop" onClick={() => setOpen(false)} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm text-ivory transition hover:bg-maroon">Browse idols</Link>
                  </li>
                )}
              </ul>

              {items.length > 0 && (
                <footer className="border-t border-ink/[0.06] px-6 pb-6 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink/60">Subtotal</span>
                    <span className="font-display text-2xl tabular-nums">{inr(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink/45">Inclusive of all taxes. Shipping & coupons at checkout.</p>
                  <Link href="/checkout" onClick={() => setOpen(false)} className="group mt-4 flex h-14 items-center justify-between rounded-full bg-ink pl-6 pr-2 text-sm font-medium text-ivory transition hover:bg-maroon active:scale-[0.98]">
                    Checkout securely
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gold text-ink transition-transform duration-500 ease-silk group-hover:-translate-y-px group-hover:translate-x-1 group-hover:scale-105">
                      <ArrowUpRight className="h-4 w-4" weight="bold" />
                    </span>
                  </Link>
                </footer>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
