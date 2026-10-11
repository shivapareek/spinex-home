"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowsClockwise, ArrowsLeftRight, FilmStrip, HandGrabbing, Pause, Play, Spinner, Trash, UploadSimple, VideoCamera, X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { buttonClass, inputClass } from "@/components/admin/ui";
import { uploadFiles } from "@/components/admin/client";

const FRAME_OPTIONS = [24, 36, 48, 72] as const;
const MAX_EDGE = 1200;
const UPLOAD_BATCH = 8;

type Phase = { kind: "idle" } | { kind: "extract" | "upload"; done: number; total: number };

/**
 * 360° spin frames field. Holds the ordered frame URLs in a hidden input (JSON),
 * supports uploading still frames, extracting frames from a turntable video in the
 * browser, and shows a live drag-to-rotate preview.
 */
export function SpinFramesEditor({ name, defaultValue }: { name: string; defaultValue: string[] }) {
  const [frames, setFrames] = useState<string[]>(defaultValue);
  const [count, setCount] = useState<number>(36);
  const [replace, setReplace] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [video, setVideo] = useState<File | null>(null);
  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);
  const busy = phase.kind !== "idle";

  async function uploadInBatches(files: File[], keep: boolean) {
    const urls: string[] = [];
    setPhase({ kind: "upload", done: 0, total: files.length });
    for (let i = 0; i < files.length; i += UPLOAD_BATCH) {
      const batch = files.slice(i, i + UPLOAD_BATCH);
      urls.push(...(await uploadFiles(batch, "spin", keep)));
      setPhase({ kind: "upload", done: Math.min(files.length, i + batch.length), total: files.length });
    }
    return urls;
  }

  async function onImages(list: FileList | null) {
    if (!list?.length) return;
    const files = Array.from(list).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    try {
      const urls = await uploadInBatches(files, false);
      setFrames((f) => [...f, ...urls]);
      toast.success(`${urls.length} frames added`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPhase({ kind: "idle" });
    }
  }

  async function onExtract() {
    if (!video) return;
    try {
      setPhase({ kind: "extract", done: 0, total: count });
      const files = await extractFrames(video, count, (done) => setPhase({ kind: "extract", done, total: count }));
      const keep = files[0]?.type === "image/webp";
      const urls = await uploadInBatches(files, keep);
      setFrames((f) => (replace ? urls : [...f, ...urls]));
      setVideo(null);
      toast.success(`Created a ${urls.length}-frame 360° spin`);
    } catch (e) {
      toast.error((e as Error).message || "Couldn't process this video");
    } finally {
      setPhase({ kind: "idle" });
    }
  }

  return (
    <div className="space-y-5">
      <input type="hidden" name={name} value={JSON.stringify(frames)} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <SpinPreview frames={frames} />

        {/* Video → frames */}
        <div className="rounded-2xl bg-surface p-5 ring-1 ring-line">
          <div className="flex items-center gap-2">
            <VideoCamera weight="light" className="h-5 w-5 text-accent-deep" />
            <p className="text-sm font-semibold text-ink">Create 360° from video</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink/55">
            Record one full, steady rotation on a turntable (MP4 or MOV). Frames are extracted in your browser, resized to {MAX_EDGE}px and uploaded as WebP.
          </p>

          <button
            type="button"
            disabled={busy}
            onClick={() => vidInput.current?.click()}
            className={cn(
              "mt-4 flex w-full items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-left text-sm transition-all duration-300 ease-silk",
              video ? "border-accent bg-white" : "border-ink/20 bg-white/60 hover:border-ink/40",
            )}
          >
            <FilmStrip weight="light" className="h-5 w-5 shrink-0 text-accent-deep" />
            <span className="min-w-0 flex-1 truncate">{video ? video.name : "Choose a turntable video…"}</span>
            {video && <span className="shrink-0 text-[11px] text-ink/45">{(video.size / 1048576).toFixed(1)} MB</span>}
          </button>
          <input
            ref={vidInput}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.m4v,.webm"
            className="hidden"
            onChange={(e) => {
              setVideo(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink/70">Frames</span>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={busy} className={cn(inputClass, "bg-white")}>
                {FRAME_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} frames{n === 36 ? " ★" : ""}</option>
                ))}
              </select>
            </label>
            <label className="flex cursor-pointer items-end gap-2 pb-2.5 text-xs text-ink/70">
              <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} disabled={busy || frames.length === 0} className="h-4 w-4 accent-ink" />
              Replace current frames
            </label>
          </div>

          {busy ? (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-ink/60">
                <span className="inline-flex items-center gap-2">
                  <Spinner className="h-3.5 w-3.5 animate-spin" />
                  {phase.kind === "extract" ? "Extracting frames" : "Uploading frames"}
                </span>
                <span className="tabular-nums">{phase.done}/{phase.total}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-300 ease-silk", phase.kind === "extract" ? "bg-accent" : "bg-ink")}
                  style={{ width: `${(phase.done / Math.max(1, phase.total)) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <button type="button" disabled={!video} onClick={onExtract} className={cn(buttonClass("primary"), "mt-4 w-full")}>
              <ArrowsClockwise weight="light" className="h-4 w-4" /> Extract {count} frames
            </button>
          )}
        </div>
      </div>

      {/* Frame strip */}
      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-ink/70">
            {frames.length ? `${frames.length} frames, in rotation order` : "No frames yet"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" disabled={busy} onClick={() => imgInput.current?.click()} className={buttonClass("secondary", "sm")}>
              <UploadSimple weight="light" className="h-3.5 w-3.5" /> Upload images
            </button>
            {frames.length > 1 && (
              <button type="button" disabled={busy} onClick={() => setFrames((f) => [...f].reverse())} className={buttonClass("ghost", "sm")} title="Use if the idol spins the wrong way">
                <ArrowsLeftRight weight="light" className="h-3.5 w-3.5" /> Reverse
              </button>
            )}
            {frames.length > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => window.confirm("Remove all spin frames from this product?") && setFrames([])}
                className={cn(buttonClass("ghost", "sm"), "text-sindoor hover:bg-sindoor/10 hover:text-sindoor")}
              >
                <Trash weight="light" className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
          <input
            ref={imgInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              onImages(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        {frames.length > 0 ? (
          <div className="grid max-h-[248px] grid-cols-6 gap-2 overflow-y-auto rounded-2xl bg-surface p-2 ring-1 ring-line sm:grid-cols-9 lg:grid-cols-12">
            {frames.map((u, i) => (
              <div key={u + i} className="group relative aspect-square overflow-hidden rounded-lg bg-white ring-1 ring-ink/10">
                <img src={u} alt={`Frame ${i + 1}`} loading="lazy" className="h-full w-full object-contain" />
                <span className="absolute bottom-0.5 left-0.5 rounded bg-ink/70 px-1 text-[9px] tabular-nums text-white">{i + 1}</span>
                <button
                  type="button"
                  onClick={() => setFrames((f) => f.filter((_, k) => k !== i))}
                  className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-1 text-sindoor opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Remove frame ${i + 1}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-ink/15 px-4 py-6 text-center text-xs text-ink/45">
            Upload ordered still frames (sorted by filename) or create them from a turntable video above.
          </p>
        )}
      </div>
    </div>
  );
}

/** Drag-to-rotate live preview of the frames. */
function SpinPreview({ frames }: { frames: string[] }) {
  const n = frames.length;
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [dragging, setDragging] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const cur = n ? ((idx % n) + n) % n : 0;

  useEffect(() => {
    if (!auto || n < 2) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % n), Math.max(40, 2400 / n));
    return () => window.clearInterval(t);
  }, [auto, n]);

  const onMove = useCallback(
    (clientX: number) => {
      if (!drag.current || !box.current || n < 2) return;
      const pxPerFrame = Math.max(3, box.current.clientWidth / n);
      setIdx(drag.current.start + Math.round((clientX - drag.current.x) / pxPerFrame));
    },
    [n],
  );

  return (
    <div className="flex flex-col">
      <div
        ref={box}
        onPointerDown={(e) => {
          if (n < 2) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, start: cur };
          setAuto(false);
          setDragging(true);
        }}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        className={cn(
          "relative aspect-square w-full touch-pan-y select-none overflow-hidden rounded-2xl bg-surface ring-1 ring-line",
          n > 1 && (dragging ? "cursor-grabbing" : "cursor-grab"),
        )}
      >
        {n === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-ink/45">
            <ArrowsClockwise weight="light" className="h-8 w-8 text-accent" />
            <p className="font-semibold text-lg text-ink/70">360° preview</p>
            <p className="text-xs">Add frames to spin the idol here.</p>
          </div>
        ) : (
          frames.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt=""
              draggable={false}
              className={cn("pointer-events-none absolute inset-0 h-full w-full object-contain p-4", i === cur ? "opacity-100" : "opacity-0")}
            />
          ))
        )}
        <div className="absolute inset-x-0 bottom-3 mx-auto h-3 w-1/2 rounded-full bg-ink/10 blur-md" />
        {n > 1 && !dragging && (
          <span className="pointer-events-none absolute left-1/2 top-3 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[11px] text-ink/60 ring-1 ring-line backdrop-blur">
            <HandGrabbing weight="light" className="h-3.5 w-3.5" /> Drag to rotate
          </span>
        )}
      </div>
      {n > 1 && (
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={() => setAuto((a) => !a)} className={buttonClass("secondary", "sm")} aria-label={auto ? "Pause" : "Auto-rotate"}>
            {auto ? <Pause weight="light" className="h-3.5 w-3.5" /> : <Play weight="light" className="h-3.5 w-3.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={n - 1}
            value={cur}
            onChange={(e) => {
              setAuto(false);
              setIdx(Number(e.target.value));
            }}
            className="h-1 flex-1 accent-ink"
            aria-label="Frame"
          />
          <span className="w-14 text-right text-[11px] tabular-nums text-ink/50">{cur + 1}/{n}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Video frame extraction (browser only) ---------- */

function once<T extends keyof HTMLVideoElementEventMap>(el: HTMLVideoElement, ev: T, timeoutMs = 8000) {
  return new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(() => {
      cleanup();
      reject(new Error("The video took too long to respond. Try a shorter or smaller MP4."));
    }, timeoutMs);
    const ok = () => {
      cleanup();
      resolve();
    };
    const err = () => {
      cleanup();
      reject(new Error("Your browser can't decode this video. Please export it as an MP4 (H.264) and try again."));
    };
    const cleanup = () => {
      window.clearTimeout(t);
      el.removeEventListener(ev, ok);
      el.removeEventListener("error", err);
    };
    el.addEventListener(ev, ok, { once: true });
    el.addEventListener("error", err, { once: true });
  });
}

async function extractFrames(file: File, count: number, onProgress: (done: number) => void): Promise<File[]> {
  const src = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  try {
    const loaded = once(video, "loadeddata", 20000);
    video.src = src;
    video.load();
    await loaded;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) throw new Error("Couldn't read the video's length.");
    if (!video.videoWidth || !video.videoHeight) throw new Error("This video has no picture track the browser can read.");

    const scale = Math.min(1, MAX_EDGE / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.round(video.videoWidth * scale);
    const h = Math.round(video.videoHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas isn't available in this browser.");
    ctx.imageSmoothingQuality = "high";

    const files: File[] = [];
    const pad = String(count).length;
    for (let i = 0; i < count; i++) {
      // Spread frames over one rotation; skip the very end so the last frame != the first.
      const t = Math.min(duration - 0.05, Math.max(0.001, (i / count) * duration));
      if (Math.abs(video.currentTime - t) > 0.0005) {
        const seeked = once(video, "seeked");
        video.currentTime = t;
        await seeked;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
      if (!blob) throw new Error("Couldn't encode a frame.");
      const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/jpeg" ? "jpg" : "png";
      files.push(new File([blob], `spin-${String(i + 1).padStart(pad, "0")}.${ext}`, { type: blob.type }));
      onProgress(i + 1);
    }
    return files;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(src);
  }
}
