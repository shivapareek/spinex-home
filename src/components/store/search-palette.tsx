"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";
import { inr } from "@/lib/utils";

type Hit = { slug: string; name: string; price: number; cutout: string | null; deity: string | null };

export const openSearch = () => window.dispatchEvent(new Event("spx:search"));

const SUGGEST = ["Ganesh", "Hanuman", "Adiyogi", "Krishna", "Shivling", "Khatu Shyam"];

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("spx:search", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("spx:search", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 50);
    else setQ("");
  }, [open]);
  useEffect(() => {
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctl.signal });
        setHits((await r.json()).hits);
        setActive(0);
      } catch {}
    }, 120);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  const go = (slug: string) => {
    setOpen(false);
    router.push(`/product/${slug}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[10vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <MagnifyingGlass className="h-5 w-5 shrink-0 text-muted" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                  if (e.key === "Enter") {
                    if (hits[active]) go(hits[active].slug);
                    else if (q) { setOpen(false); router.push(`/shop?q=${encodeURIComponent(q)}`); }
                  }
                }}
                placeholder="Search Ganesh, Hanuman, Adiyogi…"
                className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
              />
              <button onClick={() => setOpen(false)} className="rounded-md border border-line px-1.5 py-0.5 text-[10px] font-medium text-muted hover:text-ink">ESC</button>
            </div>
            {!q && (
              <div className="px-5 pb-1 pt-4">
                <p className="text-xs font-medium text-muted">Popular searches</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {SUGGEST.map((s) => (
                    <button key={s} onClick={() => setQ(s)} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink transition hover:border-ink">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {hits.map((h, i) => (
                <li key={h.slug}>
                  <button onMouseEnter={() => setActive(i)} onClick={() => go(h.slug)} className={`flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left transition ${i === active ? "bg-surface" : ""}`}>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface">
                      {h.cutout && <img src={h.cutout} alt="" className="h-10 w-10 object-contain" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{h.name}</span>
                      <span className="block text-xs text-muted">{h.deity ?? "Gift"}</span>
                    </span>
                    <span className="text-sm font-medium text-ink">{inr(h.price)}</span>
                  </button>
                </li>
              ))}
              {q && hits.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">No idols found for “{q}”.</li>}
            </ul>
            {q && (
              <Link href={`/shop?q=${encodeURIComponent(q)}`} onClick={() => setOpen(false)} className="flex items-center justify-between border-t border-line px-5 py-3 text-sm font-medium text-ink hover:bg-surface">
                See all results <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
