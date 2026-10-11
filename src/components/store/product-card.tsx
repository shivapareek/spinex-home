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
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface transition-colors duration-500 group-hover:bg-[#F1EEE8]">
        <Link href={`/product/${p.slug}`} aria-label={p.name} className="absolute inset-0">
          {/* plinth */}
          <span className="absolute bottom-[9%] left-1/2 h-[9%] w-[62%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-white to-[#E6E4DF] shadow-[0_18px_30px_-18px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-silk group-hover:scale-105" />
          {main && (
            <img
              src={main}
              alt={p.name}
              loading={priority ? "eager" : "lazy"}
              className={cn(
                "absolute bottom-[13%] left-1/2 h-[70%] w-[78%] -translate-x-1/2 object-contain object-bottom drop-shadow-[0_14px_16px_rgba(0,0,0,0.18)] transition-all duration-500 ease-silk group-hover:-translate-y-3",
                hover && "md:group-hover:opacity-0",
              )}
            />
          )}
          {hover && <img src={hover} alt="" loading="lazy" className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-500 md:block md:group-hover:opacity-100" />}
        </Link>
        {(p.badge || off > 0) && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink">
            {off > 0 ? `${off}% off` : p.badge}
          </span>
        )}
        <button
          onClick={() => {
            toggle(p.id);
            toast(wished ? "Removed from wishlist" : "Saved to wishlist");
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 transition hover:scale-105"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-[18px] w-[18px]", hydrated && wished && "text-sindoor")} weight={hydrated && wished ? "fill" : "regular"} />
        </button>
        <button
          disabled={out}
          onClick={() => add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: main ?? null, stock: p.stock })}
          className="absolute bottom-3 right-3 flex h-10 items-center gap-1.5 rounded-full bg-ink pl-3 pr-4 text-[13px] font-medium text-white transition-all duration-300 ease-silk hover:bg-accent disabled:bg-ink/40 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          aria-label={`Add ${p.name} to cart`}
        >
          <Plus className="h-4 w-4" weight="bold" /> <span className="hidden sm:inline">{out ? "Sold out" : "Add"}</span>
        </button>
      </div>
      <Link href={`/product/${p.slug}`} className="mt-3 block">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-base font-semibold text-ink md:text-[17px]">{p.name}</h3>
          <span className="shrink-0 text-[15px] font-semibold tabular-nums">{inr(p.price)}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted">
          <span className="truncate">{[p.deity, p.placements.slice(0, 2).map((k) => PLACE_LABEL[k]).filter(Boolean).join(", ")].filter(Boolean).join(" · ") || "Gift"}</span>
          {p.mrp && p.mrp > p.price ? <span className="line-through">{inr(p.mrp)}</span> : !!p.reviewCount && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-accent" weight="fill" /> {p.rating}</span>}
        </div>
        {out && <p className="mt-1 text-xs text-sindoor">Out of stock</p>}
      </Link>
    </div>
  );
}
