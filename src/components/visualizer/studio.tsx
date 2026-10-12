"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Car, HandsPraying, Desktop, Couch, Camera, ImageSquare, DownloadSimple, ShareNetwork, ArrowCounterClockwise,
  FlipHorizontal, MagnifyingGlassPlus, ArrowsClockwise, Cube, Hand, X, ShoppingBagOpen, Mountains,
} from "@phosphor-icons/react";
import { IdolLayer, PhotoFrame, SceneBackground, idolHeightFrac, photoRect, sceneFocus, type SceneData } from "./idol-in-scene";
import { SCENE_LOOK } from "./scenes";
import { ModelViewer } from "./model-viewer";
import { useCart } from "@/lib/client/cart";
import { cn, inr } from "@/lib/utils";

export type StudioProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  stock: number;
  cutout: string | null;
  heightCm: number | null;
  modelGlb: string | null;
  modelUsdz: string | null;
};

type Mode = { type: "scene"; key: string } | { type: "camera" } | { type: "upload"; url: string };

const SCENE_ICON: Record<string, React.ElementType> = { car: Car, temple: HandsPraying, desk: Desktop, shelf: Couch, photo: Mountains };
const FREE_SPACE: SceneData = { key: "free", name: "Your space", kind: "photo", anchorX: 0.5, anchorY: 0.78, baseScale: 0.32 };

export function Studio({
  products,
  scenes,
  initialSlug,
  initialScene,
  variant = "full",
}: {
  products: StudioProduct[];
  scenes: SceneData[];
  initialSlug?: string;
  initialScene?: string;
  variant?: "full" | "embed";
}) {
  const [idol, setIdol] = useState<StudioProduct>(() => products.find((p) => p.slug === initialSlug) ?? products[0]);
  const [mode, setMode] = useState<Mode>(() => ({ type: "scene", key: scenes.find((s) => s.key === initialScene)?.key ?? scenes[0]?.key }));
  const [pos, setPos] = useState({ dx: 0, dy: 0 });
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [flip, setFlip] = useState(false);
  const [active, setActive] = useState(false);
  const [hint, setHint] = useState(true);
  const [ar, setAr] = useState(false);
  const [busy, setBusy] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const add = useCart((s) => s.add);

  const scene: SceneData = useMemo(() => {
    if (mode.type === "scene") return scenes.find((s) => s.key === mode.key) ?? scenes[0];
    if (mode.type === "upload") return { ...FREE_SPACE, image: mode.url };
    return FREE_SPACE;
  }, [mode, scenes]);
  const look = SCENE_LOOK[mode.type === "camera" ? "camera" : scene.image ? "photo" : scene.kind];
  const heightPct = idolHeightFrac(scene, idol, scale) * 100;
  const photo = mode.type !== "camera" && scene.image ? scene.image : null;
  // A visitor's own photo is shown whole; scene photos fill the stage.
  const fit = mode.type === "upload" ? "contain" : "cover";

  const reset = useCallback(() => {
    setPos({ dx: 0, dy: 0 });
    setScale(1);
    setRotate(0);
    setFlip(false);
  }, []);

  // Camera lifecycle
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  useEffect(() => {
    if (mode.type !== "camera") {
      stopCamera();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } }, audio: false });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        streamRef.current = s;
        if (video.current) {
          video.current.srcObject = s;
          await video.current.play().catch(() => {});
        }
      } catch (e) {
        toast.error((e as Error).message === "unsupported" ? "Camera isn't available in this browser" : "Camera permission was blocked. You can upload a photo instead.");
        setMode({ type: "scene", key: scenes[0].key });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, scenes]);
  useEffect(() => () => stopCamera(), []);
  useEffect(() => () => { if (mode.type === "upload") URL.revokeObjectURL(mode.url); }, [mode]);

  // Gestures: drag (1 pointer) + pinch (2 pointers) on the idol, wheel on the stage
  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setActive(true);
    setHint(false);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: scale };
    }
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || !stage.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      setScale(clamp(pinch.current.s * (d / pinch.current.d), 0.4, 2.4));
      return;
    }
    const r = (stage.current.querySelector("[data-frame]") ?? stage.current).getBoundingClientRect();
    setPos((p) => ({
      dx: clamp(p.dx + (e.clientX - prev.x) / r.width, -scene.anchorX + 0.04, 1 - scene.anchorX - 0.04),
      dy: clamp(p.dy + (e.clientY - prev.y) / r.height, -scene.anchorY + 0.1, 1 - scene.anchorY),
    }));
  };
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setActive(false);
  };
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      setScale((s) => clamp(s * (e.deltaY > 0 ? 0.94 : 1.06), 0.4, 2.4));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  // Compose a high-res PNG of the current view
  const snapshot = async (share: boolean) => {
    const el = stage.current;
    if (!el) return;
    setBusy(true);
    try {
      const rect = el.getBoundingClientRect();
      const W = 1600;
      const H = Math.round((W * rect.height) / rect.width);
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#140A0C";
      ctx.fillRect(0, 0, W, H);
      let frame = { x: 0, y: 0, w: W, h: H };
      if (mode.type === "camera" && video.current) {
        drawCover(ctx, video.current, video.current.videoWidth, video.current.videoHeight, W, H);
      } else if (photo) {
        const img = await loadImg(photo);
        if (fit === "contain") {
          ctx.globalAlpha = 0.5;
          drawCover(ctx, img, img.naturalWidth, img.naturalHeight, W, H);
          ctx.globalAlpha = 1;
        }
        frame = photoRect(W, H, img.naturalWidth, img.naturalHeight, fit, sceneFocus(scene));
        ctx.drawImage(img, frame.x, frame.y, frame.w, frame.h);
      } else {
        const svg = el.querySelector("svg[data-scene]") as SVGSVGElement | null ?? (el.querySelector("svg") as SVGSVGElement | null);
        if (svg) {
          const clone = svg.cloneNode(true) as SVGSVGElement;
          clone.setAttribute("width", String(W));
          clone.setAttribute("height", String(H));
          const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
          const img = await loadImg(url);
          ctx.drawImage(img, 0, 0, W, H);
          URL.revokeObjectURL(url);
        }
      }
      const idolImg = await loadImg(idol.cutout!);
      const h = (heightPct / 100) * frame.h;
      const w = (h * idolImg.naturalWidth) / idolImg.naturalHeight;
      const x = frame.x + (scene.anchorX + pos.dx) * frame.w;
      const y = frame.y + (scene.anchorY + pos.dy) * frame.h;
      // contact shadow
      const g = ctx.createRadialGradient(x, y, 0, x, y, w * 0.55);
      g.addColorStop(0, look.shadow);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.09);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.scale(flip ? -1 : 1, 1);
      if ("filter" in ctx) ctx.filter = look.filter === "none" ? "none" : look.filter;
      ctx.drawImage(idolImg, -w / 2, -h, w, h);
      ctx.restore();
      // signature
      ctx.font = "500 22px system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.textAlign = "right";
      ctx.fillText(`${idol.name} · Spinex Home`, W - 28, H - 28);

      const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
      const file = new File([blob], `spinex-${idol.slug}.png`, { type: "image/png" });
      if (share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: idol.name, text: `How ${idol.name} looks in my space — Spinex Home` }).catch(() => {});
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        if (share) toast("Sharing isn't supported here — the image was downloaded instead.");
      }
    } catch {
      toast.error("Couldn't capture this view. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const tabs = [
    ...scenes.map((s) => ({ id: s.key, label: s.name, Icon: SCENE_ICON[s.kind] ?? Mountains, on: mode.type === "scene" && mode.key === s.key, act: () => setMode({ type: "scene", key: s.key }) })),
    { id: "camera", label: "Live camera", Icon: Camera, on: mode.type === "camera", act: () => setMode({ type: "camera" }) },
    { id: "upload", label: "Your photo", Icon: ImageSquare, on: mode.type === "upload", act: () => fileRef.current?.click() },
  ];

  const full = variant === "full";
  const idolNode = idol.cutout ? (
              <IdolLayer
                src={idol.cutout}
                alt={idol.name}
                x={(scene.anchorX + pos.dx) * 100}
                y={(scene.anchorY + pos.dy) * 100}
                heightPct={heightPct}
                look={look}
                rotate={rotate}
                flip={flip}
                className={cn("pointer-events-auto cursor-grab touch-none transition-[height] duration-200 active:cursor-grabbing", active && "outline-dashed outline-1 outline-offset-8 outline-accent")}
                wrapperProps={{
                  onPointerDown: (e) => { e.stopPropagation(); onDown(e); },
                  onPointerMove: onMove,
                  onPointerUp: onUp,
                  onPointerCancel: onUp,
                  role: "img",
                  "aria-label": `${idol.name} — drag to move`,
                }}
              />
  ) : null;

  return (
    <div className={cn("grid min-w-0 grid-cols-1 gap-5", full && "lg:grid-cols-[minmax(0,1fr)_340px]")}>
      <div className="min-w-0">
        {/* Space tabs */}
        <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {tabs.map(({ id, label, Icon, on, act }) => (
            <button
              key={id}
              onClick={() => { act(); setHint(true); }}
              className={cn("flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium ring-1 transition-all duration-500 ease-silk", on ? "bg-ink text-white ring-ink" : "bg-white text-ink/70 ring-line hover:ring-ink/40")}
            >
              <Icon className="h-4 w-4" weight={on ? "fill" : "light"} />
              {label}
            </button>
          ))}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setMode({ type: "upload", url: URL.createObjectURL(f) });
                reset();
              }
              e.target.value = "";
            }}
          />
        </div>

        {/* Stage */}
        <div>
          <div
            ref={stage}
            className="relative aspect-[4/5] touch-none select-none overflow-hidden rounded-2xl bg-surface sm:aspect-[16/10]"
            onPointerDown={() => setActive(false)}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={mode.type === "scene" ? mode.key : mode.type} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                {mode.type === "camera" ? (
                  <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
                ) : photo ? null : (
                  <SceneBackground scene={scene} />
                )}
              </motion.div>
            </AnimatePresence>

            {photo ? <PhotoFrame src={photo} fit={fit} focus={sceneFocus(scene)}>{idolNode}</PhotoFrame> : idolNode}

            <AnimatePresence>
              {hint && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-ink shadow-card backdrop-blur-md">
                  <Hand className="h-4 w-4 text-accent" />
                  Drag to place · pinch or scroll to resize
                </motion.div>
              )}
            </AnimatePresence>

            {mode.type === "upload" && (
              <button onClick={() => fileRef.current?.click()} className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-card">Change photo</button>
            )}

            {/* Floating toolbar */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-white/95 p-1 shadow-soft backdrop-blur-md">
              <ToolBtn label="Smaller" onClick={() => setScale((s) => clamp(s / 1.12, 0.4, 2.4))}><span className="text-base leading-none">−</span></ToolBtn>
              <span className="w-12 text-center text-xs font-medium tabular-nums text-ink">{Math.round(scale * 100)}%</span>
              <ToolBtn label="Larger" onClick={() => setScale((s) => clamp(s * 1.12, 0.4, 2.4))}><MagnifyingGlassPlus className="h-4 w-4" /></ToolBtn>
              <span className="mx-0.5 h-5 w-px bg-line" />
              <ToolBtn label="Tilt" onClick={() => setRotate((r) => (r >= 12 ? -12 : r + 4))}><ArrowsClockwise className="h-4 w-4" /></ToolBtn>
              <ToolBtn label="Mirror" onClick={() => setFlip((f) => !f)}><FlipHorizontal className="h-4 w-4" /></ToolBtn>
              <ToolBtn label="Reset" onClick={reset}><ArrowCounterClockwise className="h-4 w-4" /></ToolBtn>
              <span className="mx-0.5 h-5 w-px bg-line" />
              <ToolBtn label="Download image" onClick={() => snapshot(false)} disabled={busy}><DownloadSimple className="h-4 w-4" /></ToolBtn>
              <ToolBtn label="Share" onClick={() => snapshot(true)} disabled={busy}><ShareNetwork className="h-4 w-4" /></ToolBtn>
            </div>
          </div>
        </div>

        {!full && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
            <p>Shown true-to-size at ~{idol.heightCm ?? 10} cm tall. Lighting is simulated.</p>
            {(idol.modelGlb || idol.modelUsdz) && (
              <button onClick={() => setAr(true)} className="btn-primary h-9 px-4 text-xs"><Cube className="h-4 w-4" /> View in AR</button>
            )}
          </div>
        )}
      </div>

      {full && (
        <aside className="space-y-4">
          <div className="rounded-2xl border border-line p-5">
            <p className="text-xs font-medium text-muted">Now placing</p>
            <div className="mt-3 flex items-center gap-4">
              <span className="grid h-16 w-14 place-items-center rounded-xl bg-surface">{idol.cutout && <img src={idol.cutout} alt="" className="h-12 w-12 object-contain" />}</span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{idol.name}</p>
                <p className="text-sm text-muted">{inr(idol.price)} · ~{idol.heightCm ?? 10} cm</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                disabled={idol.stock <= 0}
                onClick={() => add({ productId: idol.id, slug: idol.slug, name: idol.name, price: idol.price, image: idol.cutout, stock: idol.stock })}
                className="btn-primary h-11 px-3"
              >
                <ShoppingBagOpen className="h-4 w-4" weight="bold" /> {idol.stock > 0 ? "Add to cart" : "Sold out"}
              </button>
              <Link href={`/product/${idol.slug}`} className="btn-outline h-11 px-3">Details</Link>
            </div>
            {(idol.modelGlb || idol.modelUsdz) && (
              <button onClick={() => setAr(true)} className="btn-outline mt-2 h-11 w-full"><Cube className="h-4 w-4" /> View in AR</button>
            )}
          </div>
          <div className="rounded-2xl border border-line p-3">
            <p className="px-2 pb-3 pt-2 text-xs font-medium text-muted">Choose an idol</p>
            <div className="no-scrollbar grid max-h-[420px] grid-cols-4 gap-2 overflow-y-auto lg:grid-cols-3">
              {products.filter((p) => p.cutout).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setIdol(p); setHint(false); }}
                  title={p.name}
                  className={cn("relative aspect-square rounded-xl ring-1 transition-all duration-300", p.id === idol.id ? "bg-surface ring-2 ring-ink" : "bg-surface ring-transparent hover:ring-line")}
                >
                  <img src={p.cutout!} alt={p.name} loading="lazy" className="absolute inset-[11%] h-[78%] w-[78%] object-contain" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}

      <AnimatePresence>
        {ar && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white">
              <button onClick={() => setAr(false)} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white shadow" aria-label="Close"><X className="h-4 w-4" /></button>
              <ModelViewer glb={idol.modelGlb} usdz={idol.modelUsdz} alt={idol.name} ar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolBtn({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label} aria-label={label} className="grid h-9 w-9 place-items-center rounded-full text-ink/80 transition hover:bg-surface hover:text-ink active:scale-90 disabled:opacity-40">
      {children}
    </button>
  );
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, src: CanvasImageSource, sw: number, sh: number, W: number, H: number) {
  const s = Math.max(W / sw, H / sh);
  const w = sw * s;
  const h = sh * s;
  ctx.drawImage(src, (W - w) / 2, (H - h) / 2, w, h);
}
