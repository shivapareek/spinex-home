"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { inputClass } from "../ui";

const SAMPLE_IDOL = "/uploads/products/m1-ganesh-ji-cutout.webp";
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number) => Math.round(v * 1000) / 1000;

const KIND_TINT: Record<string, string> = {
  car: "from-[#2a1d1f] via-[#3b2a2c] to-[#140A0C]",
  temple: "from-[#5E1224] via-[#7A2236] to-[#3A0A15]",
  desk: "from-[#efe5d2] via-[#e2d2b4] to-[#c8b08a]",
  shelf: "from-[#f3ead9] via-[#e7d9bf] to-[#d5bf98]",
  photo: "from-[#f3ede2] via-[#ebe2d1] to-[#ddd0b8]",
};

/**
 * Visual anchor picker for visualizer scenes.
 * Reads the scene image from the form's hidden input `imageName` (set by MediaInput) and the scene kind
 * from the `kindName` select, so it stays in sync as the admin uploads / switches kind.
 * Writes anchorX / anchorY / baseScale to hidden inputs.
 */
export function AnchorPicker({
  defaultX = 0.5,
  defaultY = 0.75,
  defaultScale = 0.32,
  defaultImage,
  defaultKind = "photo",
  imageName = "image",
  kindName = "kind",
}: {
  defaultX?: number;
  defaultY?: number;
  defaultScale?: number;
  defaultImage?: string | null;
  defaultKind?: string;
  imageName?: string;
  kindName?: string;
}) {
  const [x, setX] = useState(defaultX);
  const [y, setY] = useState(defaultY);
  const [scale, setScale] = useState(defaultScale);
  const [image, setImage] = useState<string | null>(defaultImage ?? null);
  const [kind, setKind] = useState(defaultKind);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Keep in sync with sibling form fields (MediaInput hidden input + kind select).
  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const read = () => {
      const img = form.elements.namedItem(imageName) as HTMLInputElement | null;
      const k = form.elements.namedItem(kindName) as HTMLSelectElement | null;
      setImage(img?.value || null);
      if (k?.value) setKind(k.value);
    };
    read();
    form.addEventListener("change", read);
    const t = window.setInterval(read, 500);
    return () => {
      form.removeEventListener("change", read);
      window.clearInterval(t);
    };
  }, [imageName, kindName]);

  const setFromPointer = (clientX: number, clientY: number) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    setX(round(clamp((clientX - r.left) / r.width, 0, 1)));
    setY(round(clamp((clientY - r.top) / r.height, 0, 1)));
  };

  return (
    <div ref={rootRef}>
      <input type="hidden" name="anchorX" value={x} />
      <input type="hidden" name="anchorY" value={y} />
      <input type="hidden" name="baseScale" value={scale} />

      <div
        ref={stageRef}
        role="application"
        aria-label="Click to set where the idol's base sits"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setDragging(true);
          setFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging && setFromPointer(e.clientX, e.clientY)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        className={cn("relative w-full touch-none select-none overflow-hidden rounded-2xl ring-1 ring-ink/10", dragging ? "cursor-grabbing" : "cursor-crosshair")}
      >
        {image ? (
          <img src={image} alt="" draggable={false} className="block h-auto w-full" />
        ) : (
          <div className={cn("relative aspect-[16/10] w-full bg-gradient-to-b", KIND_TINT[kind] ?? KIND_TINT.photo)}>
            <div className="absolute inset-x-0 bottom-0 h-[28%] bg-black/10" />
            <p className={cn("absolute left-4 top-4 text-[11px] font-semibold uppercase tracking-[0.16em]", kind === "car" || kind === "temple" ? "text-ivory/60" : "text-ink/45")}>
              {kind === "photo" ? "Upload a photo to place the idol" : `Illustrated ${kind} scene · preview`}
            </p>
          </div>
        )}

        {/* Sample idol: bottom-centre at anchor, height = baseScale × stage height */}
        <img
          src={SAMPLE_IDOL}
          alt=""
          draggable={false}
          className="pointer-events-none absolute w-auto max-w-none drop-shadow-[0_12px_14px_rgba(0,0,0,0.35)] transition-[height] duration-200 ease-silk"
          style={{ left: `${x * 100}%`, top: `${y * 100}%`, height: `${scale * 100}%`, transform: "translate(-50%, -100%)" }}
        />
        {/* Anchor marker */}
        <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
          <span className="block h-4 w-4 rounded-full border-2 border-white bg-gold shadow-[0_0_0_3px_rgba(201,162,74,0.35)]" />
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink/70">
            Idol size <span className="font-mono text-[11px] text-ink/50">{Math.round(scale * 100)}% of scene height</span>
          </span>
          <input type="range" min={0.05} max={0.8} step={0.01} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full accent-maroon" />
          <span className="mt-1 block text-[11px] text-ink/45">Height of a 10 cm idol. Taller idols scale up from this.</span>
        </label>
        <NumBox label="X" value={x} onChange={(v) => setX(round(clamp(v, 0, 1)))} />
        <NumBox label="Y" value={y} onChange={(v) => setY(round(clamp(v, 0, 1)))} />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink/45">
        <Crosshair weight="light" className="h-3.5 w-3.5" /> Click or drag on the scene to set where the idol&rsquo;s base rests.
      </p>
    </div>
  );
}

function NumBox({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink/70">Anchor {label}</span>
      <input type="number" min={0} max={1} step={0.01} value={value} onChange={(e) => onChange(Number(e.target.value))} className={cn(inputClass, "w-full sm:w-24")} />
    </label>
  );
}
