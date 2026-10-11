"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowsLeftRight, MagnifyingGlassPlus, MagnifyingGlassMinus, Play, Pause } from "@phosphor-icons/react";
import { ModelViewer } from "./model-viewer";
import { cn } from "@/lib/utils";

/**
 * 360° product viewer.
 *  - spinFrames (≥ 8): true photographic 360° — drag to scrub frames, with inertia & auto-spin
 *  - modelGlb: interactive 3D model (orbit, zoom, AR)
 *  - otherwise: "Darshan 3D" — depth-tilt of the cut-out on a rotating gilded turntable
 */
export function Viewer360({ frames, glb, usdz, cutout, name }: { frames: string[]; glb?: string | null; usdz?: string | null; cutout: string | null; name: string }) {
  if (frames.length >= 8) return <FrameSpinner frames={frames} name={name} />;
  if (glb || usdz) return <div className="relative h-full w-full"><ModelViewer glb={glb ?? null} usdz={usdz} alt={name} /></div>;
  return <TiltTurntable src={cutout} name={name} />;
}

function FrameSpinner({ frames, name }: { frames: string[]; name: string }) {
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [auto, setAuto] = useState(true);
  const [zoom, setZoom] = useState(1);
  const pos = useRef(0);
  const vel = useRef(0);
  const drag = useRef<{ x: number; t: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const n = frames.length;

  useEffect(() => {
    let c = 0;
    frames.forEach((f) => {
      const im = new Image();
      im.onload = im.onerror = () => setLoaded(++c);
      im.src = f;
    });
  }, [frames]);

  // inertia + auto-spin loop
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!drag.current) {
        if (Math.abs(vel.current) > 0.002) {
          pos.current += vel.current;
          vel.current *= 0.94;
        } else if (auto) pos.current += 0.12;
        const idx = ((Math.round(pos.current) % n) + n) % n;
        setI(idx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto, n]);

  const ready = loaded >= Math.min(n, 8);
  return (
    <div
      ref={box}
      className="relative h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, t: performance.now() };
        vel.current = 0;
        setAuto(false);
      }}
      onPointerMove={(e) => {
        if (!drag.current || !box.current) return;
        const w = box.current.clientWidth;
        const dx = e.clientX - drag.current.x;
        const df = (dx / w) * n; // full width = one revolution
        pos.current -= df;
        const dt = Math.max(1, performance.now() - drag.current.t);
        vel.current = (-df / dt) * 16;
        drag.current = { x: e.clientX, t: performance.now() };
        setI(((Math.round(pos.current) % n) + n) % n);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <img src={frames[i]} alt={`${name} — ${Math.round((i / n) * 360)}°`} draggable={false} className="h-full w-full object-contain transition-transform duration-500 ease-silk" style={{ transform: `scale(${zoom})` }} />
      {!ready && <div className="absolute inset-x-10 bottom-20 h-1 overflow-hidden rounded-full bg-ink/10"><div className="h-full bg-gold transition-all" style={{ width: `${(loaded / n) * 100}%` }} /></div>}
      <Dial deg={(i / n) * 360} />
      <div className="absolute bottom-4 right-4 flex gap-1 rounded-full bg-white/80 p-1 shadow-soft ring-1 ring-ink/5 backdrop-blur">
        <IconBtn label={auto ? "Pause" : "Auto-rotate"} onClick={() => setAuto((a) => !a)}>{auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</IconBtn>
        <IconBtn label="Zoom" onClick={() => setZoom((z) => (z >= 1.8 ? 1 : z + 0.4))}>{zoom >= 1.8 ? <MagnifyingGlassMinus className="h-4 w-4" /> : <MagnifyingGlassPlus className="h-4 w-4" />}</IconBtn>
      </div>
      <Hint text="Drag to rotate 360°" />
    </div>
  );
}

function TiltTurntable({ src, name }: { src: string | null; name: string }) {
  const ry = useMotionValue(0);
  const rx = useMotionValue(0);
  const ring = useMotionValue(0);
  const sRy = useSpring(ry, { stiffness: 80, damping: 14 });
  const sRx = useSpring(rx, { stiffness: 80, damping: 14 });
  const sRing = useSpring(ring, { stiffness: 60, damping: 20 });
  const sheenX = useTransform(sRy, [-35, 35], ["90%", "10%"]);
  const shadowX = useTransform(sRy, [-35, 35], [18, -18]);
  const [zoom, setZoom] = useState(1);
  const last = useRef<{ x: number; y: number } | null>(null);
  const idle = useRef(true);

  // gentle idle sway
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      if (idle.current) {
        const s = (t - t0) / 1000;
        ry.set(Math.sin(s * 0.8) * 18);
        rx.set(Math.sin(s * 0.5) * 3);
        ring.set(ring.get() + 0.25);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rx, ry, ring]);

  const sheenBg = useTransform(sheenX, (x) => `radial-gradient(circle at ${x} 35%, rgba(255,255,255,0.9), transparent 45%)`);

  if (!src) return null;
  return (
    <div
      className="relative h-full w-full cursor-grab touch-pan-y select-none overflow-hidden [perspective:1100px] active:cursor-grabbing"
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        last.current = { x: e.clientX, y: e.clientY };
        idle.current = false;
      }}
      onPointerMove={(e) => {
        if (!last.current) return;
        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;
        last.current = { x: e.clientX, y: e.clientY };
        ry.set(Math.max(-38, Math.min(38, ry.get() + dx * 0.35)));
        rx.set(Math.max(-12, Math.min(12, rx.get() - dy * 0.15)));
        ring.set(ring.get() + dx * 0.8);
      }}
      onPointerUp={() => {
        last.current = null;
        ry.set(0);
        rx.set(0);
        setTimeout(() => (idle.current = true), 1800);
      }}
      onPointerCancel={() => (last.current = null)}
    >
      {/* turntable */}
      <div className="absolute bottom-[9%] left-1/2 h-[16%] w-[70%] -translate-x-1/2 [transform-style:preserve-3d]" style={{ transform: "translateX(-50%) rotateX(72deg)" }}>
        <motion.div style={{ rotate: sRing }} className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#94701F,#E9CC7A,#C9A24A,#F3E6C2,#94701F,#E9CC7A,#94701F)] p-[3px] shadow-[0_0_60px_rgba(201,162,74,0.45)]">
          <div className="h-full w-full rounded-full bg-[repeating-conic-gradient(from_0deg,#F7F0E3_0deg_6deg,#EFE4CF_6deg_12deg)]" />
        </motion.div>
      </div>
      <motion.div style={{ x: shadowX }} className="absolute bottom-[14%] left-1/2 h-6 w-[38%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(40,20,10,0.35),transparent)] blur-[3px]" />
      <motion.div className="absolute inset-x-[14%] bottom-[16%] top-[6%] [transform-style:preserve-3d]" style={{ rotateY: sRy, rotateX: sRx, scale: zoom, transformOrigin: "50% 100%" }}>
        <img src={src} alt={name} draggable={false} className="h-full w-full object-contain object-bottom drop-shadow-[0_30px_30px_rgba(60,30,10,0.3)]" />
        {/* moving specular sheen, masked to the idol silhouette */}
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{
            background: sheenBg,
            WebkitMaskImage: `url(${src})`,
            maskImage: `url(${src})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center bottom",
            maskPosition: "center bottom",
          }}
        />
      </motion.div>
      <div className="absolute bottom-4 right-4 flex gap-1 rounded-full bg-white/80 p-1 shadow-soft ring-1 ring-ink/5 backdrop-blur">
        <IconBtn label="Zoom" onClick={() => setZoom((z) => (z >= 1.5 ? 1 : z + 0.25))}>{zoom >= 1.5 ? <MagnifyingGlassMinus className="h-4 w-4" /> : <MagnifyingGlassPlus className="h-4 w-4" />}</IconBtn>
      </div>
      <Hint text="Drag to turn · 3D preview" />
    </div>
  );
}

function Dial({ deg }: { deg: number }) {
  return (
    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/80 py-1 pl-1 pr-3 text-[11px] font-medium tabular-nums text-ink shadow-soft ring-1 ring-ink/5 backdrop-blur">
      <svg viewBox="0 0 24 24" className="h-7 w-7">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#14080A" strokeOpacity=".12" strokeWidth="2" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="#C9A24A" strokeWidth="2" strokeDasharray={`${(deg / 360) * 62.8} 62.8`} transform="rotate(-90 12 12)" />
      </svg>
      {Math.round(deg)}°
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1.5 text-[11px] text-ivory backdrop-blur">
      <ArrowsLeftRight className="h-3.5 w-3.5 text-gold" /> {text}
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={cn("grid h-8 w-8 place-items-center rounded-full text-ink/70 transition hover:bg-ink hover:text-ivory")}>
      {children}
    </button>
  );
}
