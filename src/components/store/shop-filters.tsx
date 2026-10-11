"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X, Car, HandsPraying, Desktop, Couch } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const PLACES = [
  { key: "car", label: "Car", Icon: Car },
  { key: "temple", label: "Mandir", Icon: HandsPraying },
  { key: "desk", label: "Desk", Icon: Desktop },
  { key: "shelf", label: "Home", Icon: Couch },
];
const PRICES = [
  { key: "0-75", label: "Under ₹75" },
  { key: "75-125", label: "₹75 – ₹125" },
  { key: "125-99999", label: "₹125+" },
];

export function ShopFilters({ categories, deities }: { categories: { slug: string; name: string; count: number }[]; deities: { deity: string; count: number }[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [pending, start] = useTransition();
  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(sp.toString());
    if (v === null || n.get(k) === v) n.delete(k);
    else n.set(k, v);
    start(() => router.push(`${path}?${n.toString()}`, { scroll: false }));
  };
  const active = ["q", "category", "deity", "placement", "price"].filter((k) => sp.get(k));
  const chip = (on: boolean) =>
    cn("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs ring-1 transition-all duration-300 ease-silk", on ? "bg-ink text-ivory ring-ink" : "bg-white text-ink/70 ring-ink/10 hover:ring-gold");

  return (
    <div className={cn("space-y-3 transition-opacity", pending && "opacity-60")}>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {PLACES.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => set("placement", key)} className={chip(sp.get("placement") === key)}>
            <Icon className="h-4 w-4" weight="light" /> {label}
          </button>
        ))}
        <span className="mx-1 w-px shrink-0 bg-ink/10" />
        {categories.map((c) => (
          <button key={c.slug} onClick={() => set("category", c.slug)} className={chip(sp.get("category") === c.slug)}>
            {c.name} <span className="opacity-50">{c.count}</span>
          </button>
        ))}
      </div>
      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4">
        {deities.map((d) => (
          <button key={d.deity} onClick={() => set("deity", d.deity)} className={chip(sp.get("deity") === d.deity)}>
            {d.deity}
          </button>
        ))}
        <span className="mx-1 h-6 w-px shrink-0 bg-ink/10" />
        {PRICES.map((p) => (
          <button key={p.key} onClick={() => set("price", p.key)} className={chip(sp.get("price") === p.key)}>
            {p.label}
          </button>
        ))}
        <select
          value={sp.get("sort") ?? "featured"}
          onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}
          className="ml-auto h-9 shrink-0 rounded-full bg-white px-4 text-xs ring-1 ring-ink/10 outline-none"
          aria-label="Sort"
        >
          <option value="featured">Featured</option>
          <option value="new">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {active.map((k) => (
            <button key={k} onClick={() => set(k, null)} className="flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs text-gold-deep">
              {k === "q" ? `“${sp.get(k)}”` : sp.get(k)} <X className="h-3 w-3" />
            </button>
          ))}
          <button onClick={() => start(() => router.push(path, { scroll: false }))} className="text-xs text-ink/50 underline underline-offset-4">Clear all</button>
        </div>
      )}
    </div>
  );
}
