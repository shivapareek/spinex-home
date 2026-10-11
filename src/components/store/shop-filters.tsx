"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const PLACES = [
  { key: "car", label: "Car dashboard" },
  { key: "temple", label: "Home mandir" },
  { key: "desk", label: "Work desk" },
  { key: "shelf", label: "Living room" },
];
const PRICES = [
  { key: "0-75", label: "Under ₹75" },
  { key: "75-125", label: "₹75 – ₹125" },
  { key: "125-99999", label: "Above ₹125" },
];
const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "new", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top rated" },
];

type Props = { categories: { slug: string; name: string; count: number }[]; deities: { deity: string; count: number }[] };

function useFilters() {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [pending, start] = useTransition();
  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(sp.toString());
    if (v === null || n.get(k) === v) n.delete(k);
    else n.set(k, v);
    start(() => router.push(`${path}${n.toString() ? `?${n}` : ""}`, { scroll: false }));
  };
  const clear = () => start(() => router.push(path, { scroll: false }));
  return { sp, set, clear, pending };
}

function Groups({ categories, deities }: Props) {
  const { sp, set } = useFilters();
  const groups = [
    { key: "placement", title: "Space", items: PLACES.map((p) => ({ v: p.key, label: p.label, n: null as number | null })) },
    { key: "category", title: "Category", items: categories.map((c) => ({ v: c.slug, label: c.name, n: c.count })) },
    { key: "deity", title: "Deity", items: deities.map((d) => ({ v: d.deity, label: d.deity, n: d.count })) },
    { key: "price", title: "Price", items: PRICES.map((p) => ({ v: p.key, label: p.label, n: null as number | null })) },
  ];
  return (
    <div className="space-y-7">
      {groups.map((g) => (
        <fieldset key={g.key}>
          <legend className="mb-3 text-sm font-semibold">{g.title}</legend>
          <ul className="space-y-1">
            {g.items.map((it) => {
              const on = sp.get(g.key) === it.v;
              return (
                <li key={it.v}>
                  <button onClick={() => set(g.key, it.v)} className="flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-sm text-ink/80 hover:text-ink" aria-pressed={on}>
                    <span className={cn("grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition", on ? "border-ink bg-ink text-white" : "border-ink/25 bg-white")}>
                      {on && <Check className="h-3 w-3" weight="bold" />}
                    </span>
                    <span className="flex-1">{it.label}</span>
                    {it.n != null && <span className="text-xs text-muted">{it.n}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}

/** Desktop: sticky left sidebar. */
export function ShopSidebar(props: Props) {
  const { sp, clear } = useFilters();
  const any = ["category", "deity", "placement", "price", "q"].some((k) => sp.get(k));
  return (
    <aside className="sticky top-24 hidden self-start lg:block">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-base font-semibold">Filters</p>
        {any && <button onClick={clear} className="text-xs font-medium text-accent">Clear all</button>}
      </div>
      <Groups {...props} />
    </aside>
  );
}

/** Toolbar above the grid: result count, active chips, mobile filter button, sort. */
export function ShopToolbar({ count, ...props }: Props & { count: number }) {
  const { sp, set, clear, pending } = useFilters();
  const [open, setOpen] = useState(false);
  const active = ["q", "category", "deity", "placement", "price"].filter((k) => sp.get(k));
  const labelOf = (k: string, v: string) =>
    k === "q" ? `“${v}”` : k === "placement" ? PLACES.find((p) => p.key === v)?.label ?? v : k === "price" ? PRICES.find((p) => p.key === v)?.label ?? v : k === "category" ? props.categories.find((c) => c.slug === v)?.name ?? v : v;

  return (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="btn-outline h-10 px-4 lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filters {active.length > 0 && <span className="rounded-full bg-ink px-1.5 text-[10px] text-white">{active.length}</span>}
        </button>
        <p className="hidden text-sm text-muted lg:block">{count} {count === 1 ? "product" : "products"}</p>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="hidden text-muted sm:inline">Sort by</span>
          <select
            value={sp.get("sort") ?? "featured"}
            onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}
            className="h-10 rounded-full border border-line bg-white px-4 text-sm outline-none focus:border-ink"
          >
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
      </div>
      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {active.map((k) => (
            <button key={k} onClick={() => set(k, null)} className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium hover:bg-ivory-2">
              {labelOf(k, sp.get(k)!)} <X className="h-3 w-3" />
            </button>
          ))}
          <button onClick={clear} className="text-xs text-muted underline underline-offset-4">Clear all</button>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <p className="text-base font-semibold">Filters</p>
                <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface" aria-label="Close filters"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5"><Groups {...props} /></div>
              <div className="flex gap-3 border-t border-line p-4">
                <button onClick={clear} className="btn-outline flex-1">Clear</button>
                <button onClick={() => setOpen(false)} className="btn-primary flex-1">Show {count} products</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
