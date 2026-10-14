"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus } from "@phosphor-icons/react";
import type { HomeSettings } from "@/lib/settings";
import { useCart } from "@/lib/client/cart";
import { cn, inr } from "@/lib/utils";

export type HeroIdol = { slug: string; name: string; deity: string | null; price: number; cutout: string | null; heightCm: number | null; id?: number; stock?: number };

const EASE = [0.16, 1, 0.3, 1] as const;

/** Short, bold word shown huge behind the idol. */
const BIG: Record<string, string> = {
  Ganesh: "Ganesh",
  Mahadev: "Mahadev",
  Hanuman: "Hanuman",
  Krishna: "Krishna",
  "Radha Krishna": "Radhe",
  "Khatu Shyam": "Shyam",
  Buddha: "Buddha",
  Kamdhenu: "Kamdhenu",
  "Ganesh & Lakshmi": "Shubh",
};

export function Hero({ hero, idols }: { hero: HomeSettings["hero"]; idols: HeroIdol[]; scenes?: unknown }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const add = useCart((s) => s.add);
  const idol = idols[i];
  const word = (idol.deity && BIG[idol.deity]) || idol.deity || "Divine";

  const go = useCallback((d: number) => {
    setDir(d);
    setI((x) => (x + d + idols.length) % idols.length);
  }, [idols.length]);

  useEffect(() => {
    if (paused || reduce || idols.length < 2) return;
    const t = setInterval(() => go(1), 4500);
    return () => clearInterval(t);
  }, [paused, reduce, go, idols.length]);

  return (
    <section className="container pt-4 md:pt-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative overflow-hidden rounded-[28px] bg-surface-2">
        {/* soft spotlight from above */}
        <div className="pointer-events-none absolute left-1/2 top-[-30%] h-[120%] w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),rgba(255,255,255,0))]" />

        <div className="relative h-[min(78dvh,760px)] min-h-[560px]">
          {/* giant word */}
          <div className="pointer-events-none absolute inset-x-0 top-[9%] flex justify-center overflow-hidden md:top-[6%]" aria-hidden>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p key={word} className="flex whitespace-nowrap font-display text-[clamp(72px,19vw,290px)] font-extrabold uppercase leading-[0.85] tracking-[-0.035em] text-ink" style={{ fontVariationSettings: '"wdth" 75' }}>
                {word.split("").map((ch, k) => (
                  <motion.span
                    key={k}
                    className="inline-block"
                    initial={reduce ? false : { y: "105%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduce ? undefined : { y: "-60%", opacity: 0, transition: { duration: 0.3, delay: k * 0.015 } }}
                    transition={{ duration: 0.7, delay: k * 0.035, ease: EASE }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* pedestal */}
          <div className="absolute bottom-[23%] left-1/2 w-[min(64vw,340px)] -translate-x-1/2 md:bottom-[9%]" aria-hidden>
            <div className="relative h-[86px] md:h-[110px]">
              <div className="absolute inset-x-0 bottom-0 top-[22px] rounded-b-[50%_30px] bg-gradient-to-r from-[#DAD8D2] via-[#F7F6F3] to-[#D3D1CA]" />
              <div className="absolute inset-x-0 top-0 h-[44px] rounded-[50%] bg-gradient-to-b from-white to-[#ECEAE5] shadow-[inset_0_-2px_6px_rgba(0,0,0,0.06)]" />
            </div>
            <div className="mx-auto mt-1 h-6 w-[115%] -translate-x-[6.5%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.18),transparent)] blur-[2px]" />
          </div>

          {/* idol */}
          <div className="absolute inset-x-0 bottom-[calc(23%+66px)] flex h-[44%] justify-center md:bottom-[calc(9%+86px)] md:h-[56%]">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.img
                key={idol.slug}
                src={idol.cutout ?? ""}
                alt={idol.name}
                className="h-full w-auto max-w-[80vw] object-contain object-bottom drop-shadow-[0_24px_24px_rgba(0,0,0,0.22)]"
                initial={reduce ? false : { opacity: 0, x: dir * 80, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, x: dir * -80, scale: 0.92, transition: { duration: 0.35 } }}
                transition={{ duration: 0.8, ease: EASE }}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {/* copy, bottom-left */}
          <div className="absolute bottom-6 left-6 hidden max-w-sm md:block lg:bottom-10 lg:left-10">
            <h1 className="text-[34px] font-bold leading-[1.02] text-ink lg:text-[42px]">
              {hero.title} <span className="text-accent">{hero.titleAccent}</span>
            </h1>
            <div className="mt-5 flex gap-2">
              <Link href={hero.primaryCta.href} className="btn-primary">{hero.primaryCta.label} <ArrowRight className="h-4 w-4" /></Link>
              <Link href={hero.secondaryCta.href} className="btn border border-ink/15 bg-white/70 text-ink hover:bg-white">{hero.secondaryCta.label}</Link>
            </div>
          </div>

          {/* product chip, bottom-right */}
          <div className="absolute bottom-4 right-4 left-4 md:bottom-10 md:left-auto md:right-10 md:w-[300px]">
            <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.25)] backdrop-blur">
              <div className="min-w-0 flex-1">
                <Link href={`/product/${idol.slug}`} className="block truncate text-[15px] font-semibold hover:underline">{idol.name}</Link>
                <p className="text-sm text-muted">{inr(idol.price)}</p>
              </div>
              {idol.id != null && (
                <button
                  onClick={() => add({ productId: idol.id!, slug: idol.slug, name: idol.name, price: idol.price, image: idol.cutout, stock: idol.stock ?? 99 })}
                  className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition hover:bg-accent hover:text-accent-on"
                  aria-label={`Add ${idol.name} to cart`}
                >
                  <Plus className="h-4 w-4" weight="bold" />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {idols.map((d, k) => (
                  <button key={d.slug} onClick={() => { setDir(k > i ? 1 : -1); setI(k); }} aria-label={`Show ${d.name}`} className="grid h-8 w-6 place-items-center">
                    <span className={cn("h-1 rounded-full transition-all duration-500", k === i ? "w-6 bg-ink" : "w-2.5 bg-ink/20")} />
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <button onClick={() => go(-1)} className="grid h-9 w-9 place-items-center rounded-full bg-white/80 transition hover:bg-white" aria-label="Previous idol"><ArrowLeft className="h-4 w-4" /></button>
                <button onClick={() => go(1)} className="grid h-9 w-9 place-items-center rounded-full bg-white/80 transition hover:bg-white" aria-label="Next idol"><ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile copy under the stage */}
      <div className="pt-6 md:hidden">
        <h1 className="text-[34px] font-bold leading-[1.02]">{hero.title} <span className="text-accent">{hero.titleAccent}</span></h1>
        <div className="mt-5 flex gap-2">
          <Link href={hero.primaryCta.href} className="btn-primary flex-1">{hero.primaryCta.label}</Link>
          <Link href={hero.secondaryCta.href} className="btn-outline flex-1">{hero.secondaryCta.label}</Link>
        </div>
      </div>
    </section>
  );
}
