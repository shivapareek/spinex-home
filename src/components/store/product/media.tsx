"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Images, Cube, Car } from "@phosphor-icons/react";
import { Viewer360 } from "@/components/visualizer/viewer-360";
import { Studio, type StudioProduct } from "@/components/visualizer/studio";
import type { SceneData } from "@/components/visualizer/idol-in-scene";
import { cn } from "@/lib/utils";

type Tab = "photos" | "spin" | "space";

export function ProductMedia({
  product,
  images,
  spinFrames,
  scenes,
  defaultScene,
}: {
  product: StudioProduct;
  images: string[];
  spinFrames: string[];
  scenes: SceneData[];
  defaultScene?: string;
}) {
  const [tab, setTab] = useState<Tab>("photos");
  const [img, setImg] = useState(0);
  const gallery = [...images, ...(product.cutout ? [product.cutout] : [])];
  const has360 = spinFrames.length >= 8;
  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: "photos", label: "Photos", Icon: Images },
    { id: "spin", label: has360 ? "360° view" : product.modelGlb ? "3D view" : "3D preview", Icon: Cube },
    { id: "space", label: "In your space", Icon: Car },
  ];

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-full bg-surface p-1" role="tablist">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:text-sm", tab === id ? "text-ink" : "text-muted hover:text-ink")}
          >
            {tab === id && <motion.span layoutId="pm-tab" className="absolute inset-0 rounded-full bg-white shadow-card" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <Icon className="relative hidden h-4 w-4 sm:block" weight={tab === id ? "fill" : "light"} />
            <span className="relative">{label}</span>
            {id === "space" && tab !== id && <span className="relative hidden rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent sm:block">New</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}>
          {tab === "photos" && (
            <div className="grid gap-3 md:grid-cols-[76px_1fr]">
              <div className="no-scrollbar order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col">
                {gallery.map((g, i) => (
                  <button key={g + i} onClick={() => setImg(i)} className={cn("grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-xl border-2 bg-surface transition", i === img ? "border-ink" : "border-transparent hover:border-line")}>
                    <img src={g} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
              <div className="order-1 md:order-2">
                <ZoomImage src={gallery[img]} alt={product.name} />
              </div>
            </div>
          )}
          {tab === "spin" && (
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
              <Viewer360 frames={spinFrames} glb={product.modelGlb} usdz={product.modelUsdz} cutout={product.cutout} name={product.name} />
            </div>
          )}
          {tab === "space" && <Studio variant="embed" products={[product]} scenes={scenes} initialScene={defaultScene} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const [z, setZ] = useState<{ x: number; y: number } | null>(null);
  return (
    <div
      className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-surface"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        setZ({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onPointerLeave={() => setZ(null)}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain transition-transform duration-300 ease-silk"
        style={z ? { transform: "scale(1.8)", transformOrigin: `${z.x}% ${z.y}%` } : undefined}
      />
    </div>
  );
}
