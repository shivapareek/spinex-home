"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bag, Heart, MagnifyingGlass, User, List, X } from "@phosphor-icons/react";
import { cartCount, useCart, useHydrated, useWishlist } from "@/lib/client/cart";
import { cn } from "@/lib/utils";
import { openSearch } from "./search-palette";

const LINKS = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?placement=car", label: "Car idols" },
  { href: "/shop?placement=temple", label: "Mandir idols" },
  { href: "/experience", label: "Try in your space", badge: "New" },
  { href: "/bulk-orders", label: "Bulk orders" },
];

export function Logo({ className }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="Spinex Home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="currentColor" aria-hidden>
          <path d="M12 2.5c-.9 2.7-3.6 4-3.6 7.2a3.6 3.6 0 0 0 7.2 0c0-3.2-2.7-4.5-3.6-7.2Z" />
          <path d="M4.5 16.5h15M7 20h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-ink">
        Spinex<span className="text-muted font-normal"> Home</span>
      </span>
    </Link>
  );
}

export function Header({ announcement }: { announcement: string[] }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [ann, setAnn] = useState(0);
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const wish = useWishlist((s) => s.ids.length);
  const count = hydrated ? cartCount(items) : 0;

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    if (announcement.length < 2) return;
    const t = setInterval(() => setAnn((a) => (a + 1) % announcement.length), 4000);
    return () => clearInterval(t);
  }, [announcement.length]);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  return (
    <>
      {announcement.length > 0 && (
        <div className="flex h-9 items-center justify-center overflow-hidden bg-ink px-4 text-center text-xs text-white/85">
          <AnimatePresence mode="wait">
            <motion.p key={ann} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.35 }}>
              {announcement[ann]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-6">
          <button onClick={() => setMenu(true)} className="-ml-2 grid h-10 w-10 place-items-center rounded-full lg:hidden" aria-label="Open menu">
            <List className="h-5 w-5" />
          </button>
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {LINKS.map((l) => {
              const on = l.href.includes("?") ? false : path.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href} className={cn("flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors", on ? "text-ink font-medium" : "text-muted hover:text-ink")}>
                  {l.label}
                  {l.badge && <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">{l.badge}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={openSearch} className="hidden h-10 w-64 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-muted transition hover:border-ink/30 md:flex" aria-label="Search">
              <MagnifyingGlass className="h-4 w-4" />
              <span className="flex-1 text-left">Search idols…</span>
              <kbd className="rounded border border-line bg-white px-1.5 text-[10px]">⌘K</kbd>
            </button>
            <button onClick={openSearch} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface md:hidden" aria-label="Search">
              <MagnifyingGlass className="h-5 w-5" />
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="relative hidden h-10 w-10 place-items-center rounded-full hover:bg-surface sm:grid">
              <Heart className="h-5 w-5" />
              {hydrated && wish > 0 && <Dot n={wish} />}
            </Link>
            <Link href="/account" aria-label="Account" className="hidden h-10 w-10 place-items-center rounded-full hover:bg-surface sm:grid">
              <User className="h-5 w-5" />
            </Link>
            <button onClick={() => setOpen(true)} aria-label={`Cart, ${count} items`} className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
              <Bag className="h-5 w-5" />
              {count > 0 && <Dot n={count} accent />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-white"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <Logo />
                <button onClick={() => setMenu(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface" aria-label="Close menu"><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                {[...LINKS, { href: "/wishlist", label: "Wishlist" }, { href: "/account", label: "My account" }, { href: "/track", label: "Track order" }, { href: "/contact", label: "Contact us" }].map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-medium hover:bg-surface">
                    {l.label}
                    <span className="text-muted">›</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const Dot = ({ n, accent }: { n: number; accent?: boolean }) => (
  <span className={cn("absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-semibold text-white", accent ? "bg-accent" : "bg-ink")}>{n}</span>
);
