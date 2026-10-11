"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, MagnifyingGlass, Plus, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { inputClass } from "../ui";

export type PickerProduct = { slug: string; name: string; image: string | null; isActive: boolean };

/** Ordered multi-select of products, stored as a JSON array of slugs in a hidden input. */
export function ProductPicker({ name, products, defaultValue = [], max = 12 }: { name: string; products: PickerProduct[]; defaultValue?: string[]; max?: number }) {
  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const available = products.filter((p) => !selected.includes(p.slug) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.slug.includes(q.toLowerCase())));
  const move = (i: number, d: number) =>
    setSelected((s) => {
      const j = i + d;
      if (j < 0 || j >= s.length) return s;
      const n = [...s];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
      {selected.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 px-4 py-6 text-center text-xs text-ink/45">No products selected — add a few idols for the hero carousel.</p>
      ) : (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {selected.map((slug, i) => {
            const p = bySlug.get(slug);
            return (
              <li key={slug} className="group relative overflow-hidden rounded-2xl bg-surface p-2 ring-1 ring-line">
                <span className="absolute left-2 top-2 z-10 rounded-full bg-ink px-2 py-0.5 text-[10px] text-white">{i + 1}</span>
                <div className="aspect-square">
                  {p?.image ? <img src={p.image} alt="" className="h-full w-full object-contain drop-shadow-[0_10px_14px_rgba(20,10,12,0.25)]" /> : <div className="grid h-full place-items-center text-[11px] text-ink/40">No cutout</div>}
                </div>
                <p className={cn("mt-1 truncate text-xs font-medium", p ? "text-ink" : "text-sindoor")} title={p?.name ?? slug}>
                  {p?.name ?? `Missing: ${slug}`}
                </p>
                {p && !p.isActive && <p className="text-[10px] text-sindoor">Hidden product</p>}
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-full bg-white p-1.5 ring-1 ring-ink/10 disabled:opacity-30" aria-label="Move earlier"><ArrowLeft weight="light" className="h-3 w-3" /></button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} className="rounded-full bg-white p-1.5 ring-1 ring-ink/10 disabled:opacity-30" aria-label="Move later"><ArrowRight weight="light" className="h-3 w-3" /></button>
                  </span>
                  <button type="button" onClick={() => setSelected((s) => s.filter((x) => x !== slug))} className="rounded-full bg-white p-1.5 text-sindoor ring-1 ring-ink/10 transition hover:bg-sindoor hover:text-white" aria-label="Remove"><X weight="light" className="h-3 w-3" /></button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {selected.length < max && (
        <div className="mt-4">
          {!open ? (
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink ring-1 ring-line transition duration-300 ease-silk hover:bg-ink-3 hover:text-white">
              <Plus weight="light" className="h-3.5 w-3.5" /> Add product
            </button>
          ) : (
            <div className="rounded-2xl bg-surface p-3 ring-1 ring-line">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlass weight="light" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className={cn(inputClass, "bg-white pl-9")} autoFocus />
                </div>
                <button type="button" onClick={() => { setOpen(false); setQ(""); }} className="rounded-full p-2 text-ink/50 hover:text-ink" aria-label="Close"><X weight="light" className="h-4 w-4" /></button>
              </div>
              <ul className="mt-3 grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2">
                {available.length === 0 && <li className="px-2 py-4 text-xs text-ink/45">No matching products.</li>}
                {available.map((p) => (
                  <li key={p.slug}>
                    <button type="button" onClick={() => setSelected((s) => [...s, p.slug])} className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left text-sm transition hover:bg-white">
                      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white ring-1 ring-line">
                        {p.image && <img src={p.image} alt="" className="h-full w-full object-contain" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{p.name}{!p.isActive && <span className="ml-1 text-[10px] text-sindoor">(hidden)</span>}</span>
                      <Plus weight="light" className="h-4 w-4 text-ink/40" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
