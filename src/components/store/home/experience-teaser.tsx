"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IdolInScene, type SceneData } from "@/components/visualizer/idol-in-scene";
import type { HeroIdol } from "./hero";
import { cn } from "@/lib/utils";

/** The same idol shown in all four spaces at once — switch the idol with the chips. */
export function ExperienceTeaser({ idols, scenes }: { idols: HeroIdol[]; scenes: SceneData[] }) {
  const [i, setI] = useState(0);
  const idol = idols[i];
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {scenes.slice(0, 4).map((s) => (
          <div key={s.key} className="relative overflow-hidden rounded-2xl bg-white shadow-card">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={idol.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                <IdolInScene scene={s} idol={idol} className="aspect-[5/4]" scale={1.15} animated={false} />
              </motion.div>
            </AnimatePresence>
            <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink shadow-card">{s.name}</span>
          </div>
        ))}
      </div>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {idols.map((d, k) => (
          <button
            key={d.slug}
            onClick={() => setI(k)}
            className={cn("flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-xs font-medium transition", k === i ? "border-ink bg-white" : "border-line bg-white/60 text-muted hover:text-ink")}
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-surface">{d.cutout && <img src={d.cutout} alt="" className="h-5 w-5 object-contain" />}</span>
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}
