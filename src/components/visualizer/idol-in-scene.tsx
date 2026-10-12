"use client";

import { useEffect, useRef, useState } from "react";
import { SceneArt, SCENE_LOOK, type BuiltInScene } from "./scenes";
import { cn } from "@/lib/utils";

export type SceneData = {
  key: string;
  name: string;
  tagline?: string | null;
  kind: BuiltInScene | "photo";
  image?: string | null;
  anchorX: number;
  anchorY: number;
  baseScale: number;
};

export type IdolData = { name: string; cutout: string | null; image?: string | null; heightCm?: number | null };

/** Height of the idol as a fraction of scene height, scaled by its real-world size. */
export function idolHeightFrac(scene: Pick<SceneData, "baseScale">, idol: Pick<IdolData, "heightCm">, user = 1) {
  const cm = idol.heightCm ?? 10;
  // 10cm idol → baseScale. Use a soft curve so tiny/huge idols remain readable.
  return scene.baseScale * Math.pow(cm / 10, 0.85) * user;
}

/**
 * A static composition: scene background + idol standing at the scene anchor with a contact shadow.
 * The interactive Studio builds on the same maths.
 */
export function IdolInScene({
  scene,
  idol,
  className,
  animated = true,
  scale = 1,
  children,
}: {
  scene: SceneData;
  idol: IdolData;
  className?: string;
  animated?: boolean;
  scale?: number;
  children?: React.ReactNode;
}) {
  const look = SCENE_LOOK[scene.image ? "photo" : scene.kind];
  const h = idolHeightFrac(scene, idol, scale) * 100;
  const layer = <IdolLayer src={idol.cutout ?? idol.image ?? ""} alt={idol.name} x={scene.anchorX * 100} y={scene.anchorY * 100} heightPct={h} look={look} />;
  return (
    <div className={cn("relative overflow-hidden bg-ink", className)}>
      {scene.image ? (
        <PhotoFrame src={scene.image} focus={sceneFocus(scene)}>{layer}</PhotoFrame>
      ) : (
        <>
          <SceneBackground scene={scene} animated={animated} />
          {layer}
        </>
      )}
      {children}
    </div>
  );
}

export type Fit = "cover" | "contain";
type Pt = { x: number; y: number };

/** Where a photo should stay in view when cropped: just above the anchor, where the idol stands. */
export const sceneFocus = (s: Pick<SceneData, "anchorX" | "anchorY">): Pt => ({ x: s.anchorX, y: Math.max(0, s.anchorY - 0.15) });

/**
 * Box of a natW×natH photo inside a boxW×boxH container. "cover" fills the box and crops
 * around `focus` (fractions of the photo); "contain" shows the whole photo centred.
 */
export function photoRect(boxW: number, boxH: number, natW: number, natH: number, fit: Fit, focus: Pt = { x: 0.5, y: 0.5 }) {
  const s = fit === "cover" ? Math.max(boxW / natW, boxH / natH) : Math.min(boxW / natW, boxH / natH);
  const w = natW * s;
  const h = natH * s;
  if (fit === "contain") return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
  const clamp = (v: number, min: number) => Math.min(0, Math.max(min, v));
  return { x: clamp(boxW / 2 - focus.x * w, boxW - w), y: clamp(boxH / 2 - focus.y * h, boxH - h), w, h };
}

/**
 * Photo scenes: anchors are fractions of the photo itself, so children are positioned inside
 * the photo's own box. Scene photos fill the frame (cover, cropped around the idol); a visitor's
 * own photo is shown whole (contain) over a blurred fill.
 */
export function PhotoFrame({ src, children, fit = "cover", focus }: { src: string; children?: React.ReactNode; fit?: Fit; focus?: Pt }) {
  const box = useRef<HTMLDivElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  let frame: React.CSSProperties = { inset: 0 };
  if (nat && size) {
    const r = photoRect(size.w, size.h, nat.w, nat.h, fit, focus);
    frame = { width: r.w, height: r.h, left: r.x, top: r.y };
  }
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden" data-photo-frame>
      {fit === "contain" && <img src={src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" draggable={false} />}
      <div className="absolute" style={frame} data-frame>
        <img src={src} alt="" className="absolute inset-0 h-full w-full" draggable={false} onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
        {children}
      </div>
    </div>
  );
}

export function SceneBackground({ scene, animated = true }: { scene: SceneData; animated?: boolean }) {
  if (scene.image) {
    return <img src={scene.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />;
  }
  if (scene.kind === "photo") return <div className="absolute inset-0 bg-gradient-to-b from-ivory-2 to-ivory-3" />;
  return <SceneArt kind={scene.kind} animated={animated} />;
}

export function IdolLayer({
  src,
  alt,
  x,
  y,
  heightPct,
  look,
  rotate = 0,
  flip = false,
  className,
  style,
  imgRef,
  wrapperProps,
}: {
  imgRef?: React.Ref<HTMLImageElement>;
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  src: string;
  alt: string;
  /** percent of container */
  x: number;
  y: number;
  heightPct: number;
  look: { filter: string; shadow: string; glow?: string };
  rotate?: number;
  flip?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      {...wrapperProps}
      className={cn("pointer-events-none absolute", className)}
      style={{ left: `${x}%`, top: `${y}%`, height: `${heightPct}%`, transform: "translate(-50%, -100%)", ...style }}
    >
      {/* contact shadow */}
      <div
        className="absolute left-1/2 top-full h-[9%] w-[105%] -translate-x-1/2 -translate-y-[55%] rounded-[50%] blur-[6px]"
        style={{ background: `radial-gradient(closest-side, ${look.shadow}, transparent)` }}
      />
      {look.glow && (
        <div className="absolute inset-[-20%] rounded-full blur-2xl" style={{ background: `radial-gradient(closest-side, ${look.glow}, transparent 70%)` }} />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        className="relative h-full w-auto max-w-none select-none"
        style={{
          filter: `${look.filter} drop-shadow(0 6px 10px rgba(0,0,0,0.25))`,
          transform: `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})`,
          transformOrigin: "50% 100%",
        }}
      />
    </div>
  );
}
