"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type Section = { key: string; enabled: boolean };

export const SECTION_LABELS: Record<string, { label: string; hint: string }> = {
  marquee: { label: "Deity marquee", hint: "Scrolling strip of deity names" },
  deities: { label: "Shop by deity", hint: "Category / deity tiles" },
  experience: { label: "Darshan Studio", hint: "Interactive visualizer teaser" },
  bestsellers: { label: "Bestsellers", hint: "Products marked as bestseller" },
  dashboard: { label: "Made for the road", hint: "Dashboard idol spotlight" },
  craft: { label: "The craft", hint: "Story + stats" },
  testimonials: { label: "Testimonials", hint: "Active testimonials" },
  marketplaces: { label: "Marketplaces", hint: "Amazon / Flipkart / Meesho trust strip" },
  bulk: { label: "Bulk & gifting", hint: "Wholesale enquiry form" },
  faq: { label: "FAQs", hint: "Active FAQs" },
  newsletter: { label: "Newsletter", hint: "Email sign-up" },
};

/** Reorder + enable/disable homepage sections. Serialised as JSON array of {key, enabled}. */
export function SectionsManager({ name, defaultValue }: { name: string; defaultValue: Section[] }) {
  const [rows, setRows] = useState<Section[]>(defaultValue);
  const move = (i: number, d: number) =>
    setRows((rs) => {
      const j = i + d;
      if (j < 0 || j >= rs.length) return rs;
      const n = [...rs];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <p className="mb-3 text-xs text-ink/50">The hero always comes first. Order and toggle everything below it.</p>
      <ol className="divide-y divide-ink/[0.05] overflow-hidden rounded-2xl ring-1 ring-line">
        {rows.map((r, i) => {
          const meta = SECTION_LABELS[r.key] ?? { label: r.key, hint: "" };
          return (
            <li key={r.key} className={cn("flex items-center gap-3 px-3 py-2.5 transition duration-300 ease-silk", r.enabled ? "bg-white" : "bg-surface")}>
              <span className="w-5 text-center font-semibold text-sm text-ink/35">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium", r.enabled ? "text-ink" : "text-ink/40 line-through decoration-ink/20")}>{meta.label}</p>
                <p className="truncate text-[11px] text-ink/45">{meta.hint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={r.enabled}
                aria-label={`Show ${meta.label}`}
                onClick={() => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, enabled: !x.enabled } : x)))}
                className={cn("relative h-5 w-9 shrink-0 rounded-full transition duration-300 ease-silk", r.enabled ? "bg-ink" : "bg-ink/15")}
              >
                <span className={cn("absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-silk", r.enabled && "translate-x-4")} />
              </button>
              <span className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-full ring-1 ring-ink/10 transition hover:bg-surface disabled:opacity-30" aria-label="Move up"><ArrowUp weight="light" className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="grid h-7 w-7 place-items-center rounded-full ring-1 ring-ink/10 transition hover:bg-surface disabled:opacity-30" aria-label="Move down"><ArrowDown weight="light" className="h-3.5 w-3.5" /></button>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
