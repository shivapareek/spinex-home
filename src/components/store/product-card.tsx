"use client";

import Link from "next/link";
import { Heart, Plus, Star } from "@phosphor-icons/react";
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

const PLACE_LABEL: Record<string, string> = { car: "Car", temple: "Mandir", desk: "Desk", shelf: "Home" };

export function ProductCard({ p, className, priority }: { p: CardProduct; className?: string; priority?: boolean }) {
  const add = useCart((s) => s.add);
  const hydrated = useHydrated();
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);
  const off = discountPct(p.price, p.mrp);
  const main = p.cutout ?? p.images[0];
  const hover = p.cutout ? p.images[0] : p.images[1];
  const out = p.stock <= 0;

  return (
    <div className={cn("group relative", className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
        <Link href={`/product/${p.slug}`} aria-label={p.name} className="absolute inset-0">
          {main && (
            <img
              src={main}
              alt={p.name}
              loading={priority ? "eager" : "lazy"}
              className={cn("absolute inset-0 h-full w-full object-contain p-[12%] transition duration-500 ease-silk group-hover:scale-[1.04]", hover && "group-hover:opacity-0")}
            />
          )}
          {hover && <img src={hover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 ease-silk group-hover:opacity-100" />}
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
          {p.badge && <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-ink shadow-card">{p.badge}</span>}
          {off > 0 && <span className="rounded-md bg-accent px-2 py-1 text-[11px] font-semibold text-white">{off}% off</span>}
        </div>
        <button
          onClick={() => {
            toggle(p.id);
            toast(wished ? "Removed from wishlist" : "Saved to wishlist");
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white shadow-card transition hover:scale-105"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-[18px] w-[18px]", hydrated && wished && "text-sindoor")} weight={hydrated && wished ? "fill" : "regular"} />
        </button>
        <button
          disabled={out}
          onClick={() => add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: main ?? null, stock: p.stock })}
          className="absolute inset-x-3 bottom-3 flex h-10 translate-y-2 items-center justify-center gap-1.5 rounded-full bg-ink text-sm font-medium text-white opacity-0 transition-all duration-300 ease-silk hover:bg-ink-3 group-hover:translate-y-0 group-hover:opacity-100 disabled:bg-ink/40 max-md:hidden"
        >
          <Plus className="h-4 w-4" weight="bold" /> {out ? "Out of stock" : "Add to cart"}
        </button>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <Link href={`/product/${p.slug}`} className="min-w-0">
          <h3 className="truncate text-[15px] font-medium text-ink">{p.name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted">
            {[p.deity, p.placements.slice(0, 2).map((k) => PLACE_LABEL[k]).filter(Boolean).join(" · ")].filter(Boolean).join(" — ") || "Gift"}
          </p>
        </Link>
        <button
          disabled={out}
          onClick={() => add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: main ?? null, stock: p.stock })}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line md:hidden"
          aria-label={`Add ${p.name} to cart`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-[15px] font-semibold">{inr(p.price)}</span>
        {p.mrp && p.mrp > p.price && <span className="text-xs text-muted line-through">{inr(p.mrp)}</span>}
        {!!p.reviewCount && (
          <span className="ml-auto flex items-center gap-0.5 text-xs text-muted"><Star className="h-3.5 w-3.5 text-accent" weight="fill" /> {p.rating} ({p.reviewCount})</span>
        )}
      </div>
      {out && <p className="mt-1 text-xs text-sindoor">Out of stock</p>}
    </div>
  );
}
