"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Car, HandsPraying, Desktop, Couch, CursorClick } from "@phosphor-icons/react";
import type { HomeSettings } from "@/lib/settings";
import { SceneBackground, IdolLayer, idolHeightFrac, type SceneData } from "@/components/visualizer/idol-in-scene";
import { SCENE_LOOK } from "@/components/visualizer/scenes";
import { cn, inr } from "@/lib/utils";

export type HeroIdol = { slug: string; name: string; deity: string | null; price: number; cutout: string | null; heightCm: number | null };

const SCENE_ICON: Record<string, React.ElementType> = { car: Car, temple: HandsPraying, desk: Desktop, shelf: Couch };
const EASE = [0.32, 0.72, 0, 1] as const;

// Deterministic pseudo-random so SSR & client markup match
const rand = (i: number) => {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(rand(i) * 100).toFixed(2)}%`,
  size: 2 + Math.round(rand(i + 7) * 3),
  delay: `${(rand(i + 3) * 12).toFixed(2)}s`,
  dur: `${(10 + rand(i + 11) * 10).toFixed(2)}s`,
  dx: `${Math.round((rand(i + 5) - 0.5) * 160)}px`,
}));

export function Hero({ hero, idols, scenes }: { hero: HomeSettings["hero"]; idols: HeroIdol[]; scenes: SceneData[] }) {
  const [idx, setIdx] = useState(0);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [touched, setTouched] = useState(false);
  const idol = idols[idx];
  const scene = scenes[sceneIdx];

  // Auto-advance: cycle idols, and every full idol loop change the scene — until the visitor interacts
  useEffect(() => {
    if (touched || idols.length < 2) return;
    const t = setInterval(() => {
      setIdx((i) => {
        const n = (i + 1) % idols.length;
        if (n % 2 === 0) setSceneIdx((s) => (s + 1) % scenes.length);
        return n;
      });
    }, 4200);
    return () => clearInterval(t);
  }, [touched, idols.length, scenes.length]);

  // Pointer parallax for the portal
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-7, 7]);
  const rotX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const mandalaX = useTransform(sx, [-0.5, 0.5], [-30, 30]);
  const mandalaY = useTransform(sy, [-0.5, 0.5], [-20, 20]);
  const section = useRef<HTMLElement>(null);

  return (
    <section
      ref={section}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = section.current!.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      className="relative isolate min-h-[100dvh] overflow-hidden bg-ink text-ivory"
    >
      {hero.showDoorsIntro && <TempleDoors />}

      {/* Background: maroon bloom + rotating mandala + shloka watermark + embers */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_45%,rgba(94,18,36,0.85),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_72%_48%,rgba(201,162,74,0.22),transparent_70%)]" />
        <motion.div style={{ x: mandalaX, y: mandalaY }} className="absolute right-[-30%] top-1/2 h-[150vmin] w-[150vmin] -translate-y-1/2 md:right-[-22%] lg:right-[-12%]">
          <Mandala className="h-full w-full animate-spin-slower text-gold/[0.13]" />
        </motion.div>
        <p className="pointer-events-none absolute -left-4 bottom-6 select-none whitespace-nowrap font-deva text-[18vw] leading-none text-white/[0.025] md:text-[11vw]">{hero.shloka.split(" ")[0]}</p>
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="absolute bottom-[-10px] rounded-full bg-gold-bright shadow-[0_0_10px_2px_rgba(233,204,122,0.6)]"
            style={{ left: e.left, width: e.size, height: e.size, animation: `ember ${e.dur} ${e.delay} linear infinite`, ["--dx" as string]: e.dx, opacity: 0 }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="container grid min-h-[100dvh] items-center gap-10 pb-16 pt-32 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-12 lg:pt-28">
        {/* Copy */}
        <div className="relative z-10 max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.9, ease: EASE }} className="eyebrow bg-white/[0.06] text-gold-bright ring-1 ring-gold/25">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_8px_#E9CC7A]" /> {hero.eyebrow}
          </motion.p>
          <h1 className="mt-7 font-display text-[clamp(2.9rem,7.4vw,6.6rem)] font-light leading-[0.95] tracking-[-0.035em]">
            <SplitLine text={hero.title} delay={1.6} />
            <span className="block text-gold-gradient animate-shimmer italic" style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144' }}>
              <SplitLine text={hero.titleAccent} delay={1.85} />
            </span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 2.2, duration: 1, ease: EASE }} className="mt-7 max-w-lg text-[15px] leading-relaxed text-ivory/60 md:text-base">
            {hero.subtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4, duration: 1, ease: EASE }} className="mt-10 flex flex-wrap items-center gap-3">
            <Link href={hero.primaryCta.href} className="group flex h-14 items-center gap-4 rounded-full bg-gold pl-7 pr-2 text-sm font-semibold text-ink shadow-aura transition hover:bg-gold-bright active:scale-[0.98]">
              {hero.primaryCta.label}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-gold-bright transition-transform duration-500 ease-silk group-hover:-translate-y-px group-hover:translate-x-1 group-hover:scale-105">
                <ArrowUpRight className="h-4 w-4" weight="bold" />
              </span>
            </Link>
            <Link href={hero.secondaryCta.href} className="group flex h-14 items-center gap-3 rounded-full px-6 text-sm text-ivory ring-1 ring-white/15 transition hover:bg-white/[0.06]">
              <Car className="h-[18px] w-[18px] text-gold" weight="light" /> {hero.secondaryCta.label}
            </Link>
          </motion.div>
          <motion.figure initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8, duration: 1.2 }} className="mt-14 hidden border-l border-gold/30 pl-5 md:block">
            <blockquote className="font-deva text-xl text-gold/85">{hero.shloka}</blockquote>
            <figcaption className="mt-1 text-xs italic text-ivory/40">{hero.shlokaMeaning}</figcaption>
          </motion.figure>
        </div>

        {/* Darshan portal */}
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.4, duration: 1.4, ease: EASE }} className="relative mx-auto w-full max-w-[520px] [perspective:1400px]">
          <motion.div style={{ rotateX: rotX, rotateY: rotY }} className="relative">
            {/* outer gilded frame */}
            <div className="absolute -inset-3 rounded-t-[50%_38%] rounded-b-[2.5rem] bg-gradient-to-b from-gold-bright/40 via-gold/10 to-transparent opacity-80 blur-xl" />
            <div className="relative rounded-t-[50%_38%] rounded-b-[2.5rem] bg-gradient-to-b from-gold-bright via-gold-deep to-gold p-[3px] shadow-[0_60px_120px_-40px_rgba(201,162,74,0.55)]">
              <div className="rounded-t-[50%_38%] rounded-b-[calc(2.5rem-3px)] bg-ink p-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[50%_38%] rounded-b-[2rem]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={scene.key} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: EASE }}>
                      <SceneBackground scene={scene} />
                    </motion.div>
                  </AnimatePresence>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={idol.slug + scene.key}
                      className="absolute inset-0"
                      initial={{ opacity: 0, y: 30, filter: "blur(10px) brightness(2)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px) brightness(1)" }}
                      exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                      transition={{ duration: 0.9, ease: EASE }}
                    >
                      <IdolLayer
                        src={idol.cutout ?? ""}
                        alt={idol.name}
                        x={scene.anchorX * 100}
                        y={scene.anchorY * 100}
                        heightPct={Math.min(48, idolHeightFrac(scene, idol, 1.25) * 100)}
                        look={SCENE_LOOK[scene.kind]}
                      />
                    </motion.div>
                  </AnimatePresence>
                  {/* glass sheen */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.08)_45%,transparent_55%)]" />
                  {/* floating info chip */}
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl bg-ink/55 px-4 py-3 ring-1 ring-white/10 backdrop-blur-md">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold/80">{scene.name}</p>
                      <p className="truncate font-display text-lg leading-tight">{idol.name}</p>
                    </div>
                    <Link href={`/product/${idol.slug}`} className="shrink-0 rounded-full bg-ivory px-4 py-2 text-xs font-semibold text-ink transition hover:bg-gold-bright">
                      {inr(idol.price)} · View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls: scene switcher + idol picker */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10" role="tablist" aria-label="Choose a space">
              {scenes.map((s, i) => {
                const Icon = SCENE_ICON[s.kind] ?? Couch;
                return (
                  <button
                    key={s.key}
                    role="tab"
                    aria-selected={i === sceneIdx}
                    onClick={() => { setTouched(true); setSceneIdx(i); }}
                    className={cn("relative flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors duration-300", i === sceneIdx ? "text-ink" : "text-ivory/60 hover:text-ivory")}
                  >
                    {i === sceneIdx && <motion.span layoutId="hero-scene-pill" className="absolute inset-0 rounded-full bg-gold" transition={{ type: "spring", stiffness: 320, damping: 30 }} />}
                    <Icon className="relative h-4 w-4" weight={i === sceneIdx ? "fill" : "light"} />
                    <span className="relative hidden sm:inline">{s.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              {idols.map((d, i) => (
                <button
                  key={d.slug}
                  onClick={() => { setTouched(true); setIdx(i); }}
                  aria-label={`Show ${d.name}`}
                  className={cn("relative grid h-14 w-12 place-items-center rounded-2xl ring-1 transition-all duration-500 ease-silk", i === idx ? "-translate-y-1 bg-white/10 ring-gold" : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.07]")}
                >
                  {d.cutout && <img src={d.cutout} alt="" className="h-10 w-10 object-contain" />}
                  {i === idx && !touched && <motion.span key={idx} className="absolute -bottom-2 left-2 right-2 h-0.5 origin-left rounded bg-gold" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 4.2, ease: "linear" }} />}
                </button>
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-ivory/40">
              <CursorClick className="h-3.5 w-3.5" weight="light" /> Live preview — switch the space, switch the idol
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SplitLine({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: delay + i * 0.08, duration: 1.1, ease: EASE }}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Temple doors that swing open once per session — CSS-driven so they never block if JS is slow. */
function TempleDoors() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    try {
      sessionStorage.setItem("spx-doors", "1");
    } catch {}
    const t = setTimeout(() => setGone(true), 2600);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  const door = (side: "l" | "r") => (
    <div className={cn("spx-door absolute inset-y-0 w-1/2 overflow-hidden", side === "l" ? "left-0 origin-left" : "right-0 origin-right")} style={{ animation: `door-${side} 1.5s 0.55s cubic-bezier(0.65,0,0.35,1) forwards` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#4A2511] via-[#3A1B0B] to-[#2A1207]" />
      <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
        <defs>
          <pattern id={`dp-${side}`} width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M28 4 L52 28 L28 52 L4 28Z" fill="none" stroke="#C9A24A" strokeWidth="1" />
            <circle cx="28" cy="28" r="4" fill="#C9A24A" opacity=".6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dp-${side})`} />
      </svg>
      <div className="absolute inset-6 rounded-[1.5rem] border border-gold/40 md:inset-10" />
      <div className="absolute inset-10 rounded-t-[50%_20%] rounded-b-[1rem] border border-gold/25 md:inset-16" />
      <div className={cn("absolute top-1/2 h-16 w-16 -translate-y-1/2 rounded-full border-[5px] border-gold shadow-[0_0_20px_rgba(233,204,122,0.5)]", side === "l" ? "right-6" : "left-6")} />
    </div>
  );
  return (
    <div className="spx-doors fixed inset-0 z-[70] [perspective:1800px]" aria-hidden style={{ animation: "doors-out 0.4s 2.1s forwards" }}>
      <script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem('spx-doors'))document.documentElement.dataset.doors='seen'}catch(e){}` }} />
      <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,214,140,0.9),rgba(201,162,74,0.3)_40%,transparent)]" />
      {door("l")}
      {door("r")}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-deva text-7xl text-gold-bright drop-shadow-[0_0_24px_rgba(233,204,122,0.8)]" style={{ animation: "om-fade 0.6s 0.35s forwards" }}>ॐ</div>
      <style>{`
        @keyframes door-l { to { transform: rotateY(-100deg); } }
        @keyframes door-r { to { transform: rotateY(100deg); } }
        @keyframes doors-out { to { opacity: 0; visibility: hidden; } }
        @keyframes om-fade { to { opacity: 0; transform: translate(-50%,-50%) scale(1.6); } }
        @media (prefers-reduced-motion: reduce) { .spx-doors { display: none } }
        html[data-doors=seen] .spx-doors { display: none }
      `}</style>
    </div>
  );
}

export function Mandala({ className }: { className?: string }) {
  const petals = (n: number, r: number, w: number, h: number) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse key={i} cx="500" cy={500 - r} rx={w} ry={h} transform={`rotate(${(360 / n) * i} 500 500)`} fill="none" stroke="currentColor" strokeWidth="1.2" />
    ));
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden>
      <circle cx="500" cy="500" r="490" fill="none" stroke="currentColor" strokeDasharray="2 10" />
      <circle cx="500" cy="500" r="460" fill="none" stroke="currentColor" strokeWidth=".8" />
      {petals(48, 410, 18, 50)}
      <circle cx="500" cy="500" r="350" fill="none" stroke="currentColor" />
      {petals(32, 300, 30, 60)}
      <circle cx="500" cy="500" r="230" fill="none" stroke="currentColor" strokeDasharray="1 6" />
      {petals(16, 180, 40, 64)}
      <circle cx="500" cy="500" r="110" fill="none" stroke="currentColor" />
      {petals(8, 70, 26, 40)}
    </svg>
  );
}
