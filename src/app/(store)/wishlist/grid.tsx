"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      <div className="mt-12 rounded-[2rem] border border-dashed border-ink/15 px-6 py-24 text-center">
        <p className="font-display text-2xl">Nothing saved yet</p>
        <p className="mt-2 text-sm text-ink/55">Tap the heart on any idol to keep it here.</p>
        <Link href="/shop" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm text-ivory">Browse idols</Link>
      </div>
    );
  return (
    <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
