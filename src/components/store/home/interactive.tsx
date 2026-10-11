"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { IdolInScene, type SceneData } from "@/components/visualizer/idol-in-scene";
import { ProductCard, type CardProduct } from "@/components/store/product-card";
import type { HeroIdol } from "./hero";
import { cn } from "@/lib/utils";

const SPACE_WORD: Record<string, string> = { car: "Car", temple: "Mandir", desk: "Desk", shelf: "Home" };
const SPACE_LINE: Record<string, string> = {
  car: "Small, steady idols that ride along on every drive.",
  temple: "Radiant forms for your pooja ghar and daily aarti.",
  desk: "Calm, meditative pieces for focus at work.",
  shelf: "Statement idols for the living room shelf.",
};
const SPACE_PICK: Record<string, string> = { car: "krishna-ji-flute", temple: "hanuman-ji-kitab", desk: "meditation-adiyogi", shelf: "radha-krishna-cow" };

/** Big words on the left; the chosen space renders live on the right. */
export function ChooseSpace({ scenes, idols }: { scenes: SceneData[]; idols: HeroIdol[] }) {
  const list = scenes.filter((s) => s.kind !== "photo").slice(0, 4);
  const [k, setK] = useState(0);
  const scene = list[k];
  const idol = idols.find((d) => d.slug === SPACE_PICK[scene.kind]) ?? idols[k % idols.length];
  return (
    <section className="container py-20 md:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <h2 className="text-3xl font-bold md:text-[44px] md:leading-[1.05]">Where will your idol live?</h2>
          <ul className="mt-8 md:mt-10">
            {list.map((s, i) => (
              <li key={s.key}>
                <button
                  onMouseEnter={() => setK(i)}
                  onFocus={() => setK(i)}
                  onClick={() => setK(i)}
                  className="group flex w-full items-baseline gap-4 border-t border-line py-3 text-left md:py-4"
                  aria-pressed={i === k}
                >
                  <span className={cn("font-display text-[44px] font-extrabold uppercase leading-none tracking-[-0.05em] transition-colors duration-300 md:text-[76px]", i === k ? "text-ink" : "text-ink/15 group-hover:text-ink/40")} style={{ fontVariationSettings: '"wdth" 80' }}>
                    {SPACE_WORD[s.kind] ?? s.name}
                  </span>
                  <span className={cn("ml-auto hidden max-w-[200px] text-sm text-muted transition-opacity sm:block", i === k ? "opacity-100" : "opacity-0")}>{SPACE_LINE[s.kind]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="relative overflow-hidden rounded-[28px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={scene.key} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                <IdolInScene scene={scene} idol={idol} className="aspect-[5/4]" scale={1.25} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted">Shown: <Link href={`/product/${idol.slug}`} className="font-medium text-ink underline underline-offset-4">{idol.name}</Link></p>
            <Link href={`/shop?placement=${scene.kind}`} className="group inline-flex items-center gap-1.5 text-sm font-semibold">
              Shop {SPACE_WORD[scene.kind]?.toLowerCase()} idols <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pinned section: vertical scroll walks the collection sideways, like a gallery. */
export function GalleryWalk({ products }: { products: CardProduct[] }) {
  const wrap = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-62%"]);

  const head = (
    <div className="flex items-end justify-between gap-6">
      <h2 className="max-w-xl text-3xl font-bold md:text-[44px] md:leading-[1.05]">The collection, chosen by our customers.</h2>
      <Link href="/shop" className="btn-outline hidden shrink-0 md:inline-flex">View all idols <ArrowUpRight className="h-4 w-4" /></Link>
    </div>
  );

  if (reduce) {
    return (
      <section className="container py-20">
        {head}
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">{products.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>
    );
  }

  return (
    <>
      {/* Desktop: pinned horizontal walk */}
      <section ref={wrap} className="relative hidden h-[260vh] lg:block">
        <div className="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden">
          <div className="container">{head}</div>
          <motion.div style={{ x }} className="mt-10 flex gap-5 pl-[max(3rem,calc((100vw-1440px)/2+3rem))]">
            {products.map((p) => (
              <div key={p.id} className="w-[300px] shrink-0">
                <ProductCard p={p} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Mobile & tablet: swipeable row */}
      <section className="py-16 lg:hidden">
        <div className="container">{head}</div>
        <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:px-8">
          {products.map((p) => (
            <div key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[280px]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
