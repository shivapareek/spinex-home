"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "@phosphor-icons/react";
import { useHydrated, useWishlist } from "@/lib/client/cart";
import { ProductCard, type CardProduct } from "@/components/store/product-card";

export function WishlistGrid() {
  const ids = useWishlist((s) => s.ids);
  const hydrated = useHydrated();
  const [items, setItems] = useState<CardProduct[] | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (!ids.length) return setItems([]);
    fetch(`/api/products?ids=${ids.join(",")}`).then((r) => r.json()).then((d) => setItems(d.products));
  }, [ids, hydrated]);
  if (!items) return <div className="h-64" />;
  if (!items.length)
    return (
      <div className="mt-8 rounded-2xl border border-line px-6 py-20 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface"><Heart className="h-6 w-6 text-muted" /></span>
        <p className="mt-4 text-lg font-semibold">Nothing saved yet</p>
        <p className="mt-1 text-sm text-muted">Tap the heart on any idol to save it here.</p>
        <Link href="/shop" className="btn-primary mt-6">Browse idols</Link>
      </div>
    );
  return (
    <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
