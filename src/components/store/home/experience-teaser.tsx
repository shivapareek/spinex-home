"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Cube, ImageSquare } from "@phosphor-icons/react";
import { IdolInScene, type SceneData } from "@/components/visualizer/idol-in-scene";
import type { HeroIdol } from "./hero";
import { cn } from "@/lib/utils";

export function ExperienceTeaser({ idols, scenes }: { idols: HeroIdol[]; scenes: SceneData[] }) {
  const [i, setI] = useState(0);
  const idol = idols[i];
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {scenes.slice(0, 4).map((s, k) => (
          <div key={s.key} className={cn("rounded-[1.6rem] bg-ink/[0.04] p-1 ring-1 ring-ink/[0.06] md:p-1.5", k === 0 && "md:translate-y-6", k === 3 && "md:-translate-y-6")}>
            <div className="relative overflow-hidden rounded-[calc(1.6rem-0.375rem)]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={idol.slug} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}>
                  <IdolInScene scene={s} idol={idol} className="aspect-[4/5]" scale={1.15} />
                </motion.div>
              </AnimatePresence>
              <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ivory backdrop-blur">{s.name}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {idols.map((d, k) => (
          <button
            key={d.slug}
            onClick={() => setI(k)}
            className={cn(
              "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-xs ring-1 transition-all duration-500 ease-silk",
              k === i ? "bg-ink text-ivory ring-ink" : "bg-white text-ink/70 ring-ink/10 hover:ring-gold",
            )}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ivory">{d.cutout && <img src={d.cutout} alt="" className="h-6 w-6 object-contain" />}</span>
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExperienceFeatures() {
  const f = [
    { Icon: ImageSquare, t: "4 ready-made spaces", d: "Car dashboard, home mandir, work desk and living room — lit to match." },
    { Icon: Camera, t: "Your camera, live", d: "Point your phone at your dashboard and drag the idol into place." },
    { Icon: Cube, t: "True-to-size", d: "Every idol is scaled from its real height, so what you see is what arrives." },
  ];
  return (
    <ul className="mt-10 space-y-5">
      {f.map(({ Icon, t, d }) => (
        <li key={t} className="flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-ink/[0.07]">
            <Icon className="h-5 w-5 text-maroon" weight="light" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">{t}</span>
            <span className="block text-sm text-ink/55">{d}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StudioCta() {
  return (
    <Link href="/experience" className="group mt-10 inline-flex h-14 items-center gap-4 rounded-full bg-maroon pl-7 pr-2 text-sm font-semibold text-ivory shadow-aura transition hover:bg-maroon-deep active:scale-[0.98]">
      Open Darshan Studio
      <span className="grid h-10 w-10 place-items-center rounded-full bg-gold text-ink transition-transform duration-500 ease-silk group-hover:translate-x-1 group-hover:scale-105">
        <Camera className="h-4 w-4" weight="bold" />
      </span>
    </Link>
  );
}
