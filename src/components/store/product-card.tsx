"use client";

import Link from "next/link";
import { useRef } from "react";
import { Heart, Plus, Car, HandsPraying, Desktop, Couch } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useCart, useHydrated, useWishlist } from "@/lib/client/cart";
import { cn, discountPct, inr } from "@/lib/utils";

export type CardProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  mrp: number | null;
  stock: number;
  images: string[];
  cutout: string | null;
  deity: string | null;
  placements: string[];
  badge: string | null;
  rating?: number;
  reviewCount?: number;
};

const PLACE_ICON: Record<string, React.ElementType> = { car: Car, temple: HandsPraying, desk: Desktop, shelf: Couch };
const PLACE_LABEL: Record<string, string> = { car: "Car", temple: "Mandir", desk: "Desk", shelf: "Home" };

export function ProductCard({ p, className, priority }: { p: CardProduct; className?: string; priority?: boolean }) {
  const add = useCart((s) => s.add);
  const hydrated = useHydrated();
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);
  const ref = useRef<HTMLDivElement>(null);
  const off = discountPct(p.price, p.mrp);
  const img = p.cutout ?? p.images[0];

  // Subtle 3D tilt that follows the pointer — transform-only, no layout thrash
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 10}deg`);
    el.style.setProperty("--ry", `${x * 14}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
  };
  const reset = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className={cn("group relative", className)}>
      <div className="rounded-[2rem] bg-ink/[0.03] p-1.5 ring-1 ring-ink/[0.06] transition-all duration-700 ease-silk group-hover:bg-gold/10 group-hover:ring-gold/30">
        <div
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={reset}
          className="relative aspect-[4/5] overflow-hidden rounded-[calc(2rem-0.375rem)] bg-gradient-to-b from-[#FBF6EC] to-ivory-2 shadow-inset [perspective:900px]"
        >
          {/* aura */}
          <div className="absolute left-1/2 top-[46%] h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(233,204,122,0.55),transparent)] opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
          <svg className="absolute left-1/2 top-[46%] h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 animate-spin-slower text-gold/25 opacity-0 transition-opacity duration-700 group-hover:opacity-100" viewBox="0 0 200 200" aria-hidden>
            <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeDasharray="1 5" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth=".6" />
          </svg>
          <Link href={`/product/${p.slug}`} className="absolute inset-0 z-[1]" aria-label={p.name}>
            <div
              className="absolute inset-x-[12%] bottom-[16%] top-[10%] transition-transform duration-700 ease-silk group-hover:-translate-y-2"
              style={{ transform: "rotateX(var(--rx,0)) rotateY(var(--ry,0))", transformStyle: "preserve-3d" }}
            >
              {img && (
                <img
                  src={img}
                  alt={p.name}
                  loading={priority ? "eager" : "lazy"}
                  className="h-full w-full object-contain drop-shadow-[0_24px_24px_rgba(60,30,10,0.28)] transition-transform duration-700 ease-silk group-hover:scale-[1.04]"
                />
              )}
            </div>
            <div className="absolute bottom-[13%] left-1/2 h-4 w-[55%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(60,30,10,0.28),transparent)] blur-[2px]" />
          </Link>

          <div className="pointer-events-none absolute inset-x-3 top-3 z-[2] flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {p.badge && <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-bright">{p.badge}</span>}
              {off > 0 && <span className="w-max rounded-full bg-sindoor px-2.5 py-1 text-[10px] font-bold text-white">−{off}%</span>}
            </div>
            <button
              onClick={() => {
                toggle(p.id);
                toast(wished ? "Removed from wishlist" : "Saved to wishlist");
              }}
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/80 text-ink ring-1 ring-ink/5 backdrop-blur transition hover:scale-110"
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("h-4 w-4", hydrated && wished && "text-sindoor")} weight={hydrated && wished ? "fill" : "light"} />
            </button>
          </div>

          {p.placements.length > 0 && (
            <div className="pointer-events-none absolute bottom-3 left-3 right-16 z-[2] hidden gap-1 overflow-hidden sm:flex">
              {p.placements.slice(0, 3).map((k) => {
                const Icon = PLACE_ICON[k];
                return Icon ? (
                  <span key={k} title={PLACE_LABEL[k]} className="flex items-center gap-1 rounded-full bg-white/75 px-2 py-1 text-[10px] text-ink/70 ring-1 ring-ink/5 backdrop-blur">
                    <Icon className="h-3 w-3" weight="light" /> {PLACE_LABEL[k]}
                  </span>
                ) : null;
              })}
            </div>
          )}

          <button
            disabled={p.stock <= 0}
            onClick={() => {
              add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: img ?? null, stock: p.stock });
            }}
            className="absolute bottom-3 right-3 z-[2] grid h-11 w-11 translate-y-1 place-items-center rounded-full bg-ink text-ivory opacity-90 shadow-lift transition-all duration-500 ease-silk hover:bg-maroon active:scale-95 group-hover:translate-y-0 group-hover:opacity-100 disabled:bg-ink/30"
            aria-label={`Add ${p.name} to cart`}
          >
            <Plus className="h-4 w-4" weight="bold" />
          </button>
        </div>
      </div>
      <Link href={`/product/${p.slug}`} className="mt-4 block px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">{p.deity ?? "Gift"}</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg leading-tight text-ink transition group-hover:text-maroon">{p.name}</h3>
          <p className="shrink-0 text-sm font-semibold tabular-nums">
            {inr(p.price)}
            {p.mrp && p.mrp > p.price && <span className="ml-1.5 text-xs font-normal text-ink/40 line-through">{inr(p.mrp)}</span>}
          </p>
        </div>
        {!!p.reviewCount && (
          <p className="mt-1 text-xs text-ink/50">★ {p.rating} · {p.reviewCount} review{p.reviewCount > 1 ? "s" : ""}</p>
        )}
        {p.stock <= 0 && <p className="mt-1 text-xs text-sindoor">Out of stock</p>}
      </Link>
    </div>
  );
}
