"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Car, HandsPraying, Desktop, Couch, Truck, Money, Sparkle } from "@phosphor-icons/react";
import type { HomeSettings } from "@/lib/settings";
import { SceneBackground, IdolLayer, idolHeightFrac, type SceneData } from "@/components/visualizer/idol-in-scene";
import { SCENE_LOOK } from "@/components/visualizer/scenes";
import { cn, inr } from "@/lib/utils";

export type HeroIdol = { slug: string; name: string; deity: string | null; price: number; cutout: string | null; heightCm: number | null };

const SCENE_ICON: Record<string, React.ElementType> = { car: Car, temple: HandsPraying, desk: Desktop, shelf: Couch };
const SHORT: Record<string, string> = { car: "Car", temple: "Mandir", desk: "Desk", shelf: "Home" };
const EASE = [0.32, 0.72, 0, 1] as const;

export function Hero({ hero, idols, scenes }: { hero: HomeSettings["hero"]; idols: HeroIdol[]; scenes: SceneData[] }) {
  const [idx, setIdx] = useState(0);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [touched, setTouched] = useState(false);
  const idol = idols[idx];
  const scene = scenes[sceneIdx];

  useEffect(() => {
    if (touched || idols.length < 2) return;
    const t = setInterval(() => {
      setIdx((i) => {
        const n = (i + 1) % idols.length;
        if (n % 2 === 0) setSceneIdx((s) => (s + 1) % scenes.length);
        return n;
      });
    }, 3800);
    return () => clearInterval(t);
  }, [touched, idols.length, scenes.length]);

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-20">
        {/* Copy */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-card">
            <Sparkle className="h-3.5 w-3.5 text-accent" weight="fill" /> {hero.eyebrow}
          </span>
          <h1 className="mt-6 text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl lg:text-[64px]">
            {hero.title} <span className="text-accent">{hero.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted md:text-lg">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={hero.primaryCta.href} className="btn-primary h-12 px-7">
              {hero.primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={hero.secondaryCta.href} className="btn-outline h-12 px-7">
              {hero.secondaryCta.label}
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
            <li className="flex items-center gap-2"><Truck className="h-5 w-5 text-ink" /> Free shipping over ₹499</li>
            <li className="flex items-center gap-2"><Money className="h-5 w-5 text-ink" /> Cash on Delivery</li>
            <li className="flex items-center gap-2"><Sparkle className="h-5 w-5 text-ink" /> Preview in your space</li>
          </ul>
        </motion.div>

        {/* Live preview card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: EASE }} className="rounded-[28px] border border-line bg-white p-3 shadow-soft">
          <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-1">
            <p className="text-sm font-medium">See how it looks in your…</p>
            <div className="flex rounded-full bg-surface p-1" role="tablist" aria-label="Choose a space">
              {scenes.map((s, i) => {
                const Icon = SCENE_ICON[s.kind] ?? Couch;
                const on = i === sceneIdx;
                return (
                  <button
                    key={s.key}
                    role="tab"
                    aria-selected={on}
                    aria-label={s.name}
                    onClick={() => { setTouched(true); setSceneIdx(i); }}
                    className={cn("relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors", on ? "text-ink" : "text-muted hover:text-ink")}
                  >
                    {on && <motion.span layoutId="hero-tab" className="absolute inset-0 rounded-full bg-white shadow-card" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    <Icon className="relative h-4 w-4" weight={on ? "fill" : "regular"} />
                    <span className="relative">{SHORT[s.kind] ?? s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-surface">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={scene.key} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                <SceneBackground scene={scene} />
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={idol.slug + scene.key} className="absolute inset-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <IdolLayer src={idol.cutout ?? ""} alt={idol.name} x={scene.anchorX * 100} y={scene.anchorY * 100} heightPct={Math.min(46, idolHeightFrac(scene, idol, 1.2) * 100)} look={SCENE_LOOK[scene.kind]} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3 px-2 pb-1 pt-3">
            <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
              {idols.map((d, i) => (
                <button
                  key={d.slug}
                  onClick={() => { setTouched(true); setIdx(i); }}
                  aria-label={`Show ${d.name}`}
                  className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-surface transition", i === idx ? "border-ink" : "border-transparent hover:border-line")}
                >
                  {d.cutout && <img src={d.cutout} alt="" className="h-9 w-9 object-contain" />}
                </button>
              ))}
            </div>
            <Link href={`/product/${idol.slug}`} className="hidden shrink-0 text-right sm:block">
              <span className="block max-w-[160px] truncate text-sm font-medium">{idol.name}</span>
              <span className="block text-sm text-muted">{inr(idol.price)} · View →</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
