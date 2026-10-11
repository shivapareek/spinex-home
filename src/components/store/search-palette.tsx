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
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/60 px-4 pt-[12vh] backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-xl rounded-[1.75rem] bg-white/10 p-1.5 ring-1 ring-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-ivory shadow-lift">
              <div className="flex items-center gap-3 border-b border-ink/[0.07] px-5">
                <MagnifyingGlass className="h-5 w-5 text-ink/40" weight="light" />
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
                  className="h-16 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink/35"
                />
                <kbd className="rounded-md bg-ink/[0.06] px-1.5 py-0.5 text-[10px] text-ink/50">ESC</kbd>
              </div>
              {!q && (
                <div className="flex flex-wrap gap-2 px-5 py-4">
                  {SUGGEST.map((s) => (
                    <button key={s} onClick={() => setQ(s)} className="rounded-full bg-white px-3 py-1.5 text-xs text-ink/70 ring-1 ring-ink/10 transition hover:ring-gold">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <ul className="max-h-[50vh] overflow-y-auto p-2">
                {hits.map((h, i) => (
                  <li key={h.slug}>
                    <button onMouseEnter={() => setActive(i)} onClick={() => go(h.slug)} className={`flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left transition ${i === active ? "bg-white shadow-soft" : ""}`}>
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-b from-ivory-2 to-ivory-3">
                        {h.cutout && <img src={h.cutout} alt="" className="h-10 w-10 object-contain" />}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-ink">{h.name}</span>
                        <span className="block text-xs text-ink/50">{h.deity ?? "Gift"}</span>
                      </span>
                      <span className="text-sm text-ink/70">{inr(h.price)}</span>
                    </button>
                  </li>
                ))}
                {q && hits.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink/50">No idols match “{q}”.</li>}
              </ul>
              {q && (
                <Link href={`/shop?q=${encodeURIComponent(q)}`} onClick={() => setOpen(false)} className="flex items-center justify-between border-t border-ink/[0.07] px-5 py-3 text-xs text-ink/60 hover:text-maroon">
                  See all results <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
