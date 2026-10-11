"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bag, Heart, MagnifyingGlass, User } from "@phosphor-icons/react";
import { cartCount, useCart, useHydrated, useWishlist } from "@/lib/client/cart";
import { cn } from "@/lib/utils";
import { openSearch } from "./search-palette";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/experience", label: "Darshan Studio" },
  { href: "/shop?placement=car", label: "For your car" },
  { href: "/bulk-orders", label: "Bulk & gifting" },
  { href: "/p/about", label: "Our story" },
];

export function Logo({ className, light = true }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Spinex Home">
      <span className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep shadow-[0_0_24px_rgba(233,204,122,0.45)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink transition-transform duration-700 ease-silk group-hover:scale-110" fill="currentColor">
          <path d="M12 2.5c-.9 2.7-3.6 4-3.6 7.2a3.6 3.6 0 0 0 7.2 0c0-3.2-2.7-4.5-3.6-7.2Z" />
          <path d="M4.5 16.5h15M7 20h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className={cn("font-display text-[1.35rem] leading-none tracking-tight", light ? "text-ivory" : "text-ink")}>
        Spinex<span className="ml-1 align-top font-sans text-[9px] font-semibold uppercase tracking-[0.3em] text-gold">Home</span>
      </span>
    </Link>
  );
}

export function Header({ announcement }: { announcement: string[] }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ann, setAnn] = useState(0);
  const sentinel = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const wish = useWishlist((s) => s.ids.length);
  const count = hydrated ? cartCount(items) : 0;

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { rootMargin: "40px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (announcement.length < 2) return;
    const t = setInterval(() => setAnn((a) => (a + 1) % announcement.length), 4200);
    return () => clearInterval(t);
  }, [announcement.length]);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  return (
    <>
      <div ref={sentinel} className="absolute left-0 top-0 h-px w-px" aria-hidden />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        {announcement.length > 0 && (
          <div className={cn("pointer-events-auto flex h-8 items-center justify-center overflow-hidden bg-ink text-[11px] tracking-[0.08em] text-gold-pale/80 transition-all duration-500 ease-silk", scrolled && "-translate-y-full opacity-0")}>
            <AnimatePresence mode="wait">
              <motion.p key={ann} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
                {announcement[ann]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
        <div className={cn("px-3 transition-transform duration-500 ease-silk md:px-6", scrolled ? "-translate-y-5" : "translate-y-3")}>
          <nav
            className={cn(
              "pointer-events-auto relative z-50 mx-auto flex h-14 max-w-[1240px] items-center justify-between rounded-full pl-5 pr-2 ring-1 transition-all duration-500 ease-silk",
              menu ? "bg-transparent ring-transparent" : "bg-ink/75 ring-white/10 backdrop-blur-xl shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]",
            )}
          >
            <Logo />
            <ul className="hidden items-center gap-1 lg:flex">
              {LINKS.map((l) => {
                const on = l.href === path || (l.href !== "/" && path.startsWith(l.href.split("?")[0]) && !l.href.includes("?"));
                return (
                  <li key={l.href}>
                    <Link href={l.href} className={cn("rounded-full px-4 py-2 text-[13px] transition-colors duration-300", on ? "bg-white/10 text-ivory" : "text-ivory/65 hover:text-ivory")}>
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-0.5">
              <IconBtn label="Search" onClick={openSearch}><MagnifyingGlass weight="light" className="h-[19px] w-[19px]" /></IconBtn>
              <Link href="/wishlist" aria-label="Wishlist" className="relative hidden h-10 w-10 place-items-center rounded-full text-ivory/80 transition hover:bg-white/10 hover:text-ivory sm:grid">
                <Heart weight="light" className="h-[19px] w-[19px]" />
                {hydrated && wish > 0 && <Dot n={wish} />}
              </Link>
              <Link href="/account" aria-label="Account" className="hidden h-10 w-10 place-items-center rounded-full text-ivory/80 transition hover:bg-white/10 hover:text-ivory sm:grid">
                <User weight="light" className="h-[19px] w-[19px]" />
              </Link>
              <button onClick={() => setOpen(true)} className="group relative ml-1 flex h-10 items-center gap-2 rounded-full bg-gold pl-3.5 pr-1.5 text-[13px] font-semibold text-ink transition hover:bg-gold-bright active:scale-[0.97]">
                <Bag weight="bold" className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                <span className="grid h-7 min-w-7 place-items-center rounded-full bg-ink px-1.5 text-[11px] text-gold-bright transition-transform duration-500 ease-spring group-hover:scale-110">{count}</span>
              </button>
              <button onClick={() => setMenu(!menu)} className="relative ml-1 grid h-10 w-10 place-items-center rounded-full text-ivory lg:hidden" aria-label="Menu" aria-expanded={menu}>
                <span className={cn("absolute h-px w-5 bg-current transition-all duration-500 ease-silk", menu ? "rotate-45" : "-translate-y-[4px]")} />
                <span className={cn("absolute h-px w-5 bg-current transition-all duration-500 ease-silk", menu ? "-rotate-45" : "translate-y-[4px]")} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-30 bg-ink/95 backdrop-blur-3xl lg:hidden"
          >
            <div className="flex h-full flex-col justify-between px-6 pb-10 pt-32">
              <ul className="space-y-1">
                {[...LINKS, { href: "/wishlist", label: "Wishlist" }, { href: "/account", label: "My account" }, { href: "/track", label: "Track order" }].map((l, i) => (
                  <li key={l.href} className="overflow-hidden">
                    <motion.div initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 + i * 0.05, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}>
                      <Link href={l.href} className="block py-2 font-display text-[2.1rem] leading-tight text-ivory">
                        {l.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
              <p className="font-deva text-lg text-gold/70">शुभ यात्रा · Shubh Yatra</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="grid h-10 w-10 place-items-center rounded-full text-ivory/80 transition hover:bg-white/10 hover:text-ivory">
      {children}
    </button>
  );
}
const Dot = ({ n }: { n: number }) => <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-bold text-ink">{n}</span>;
