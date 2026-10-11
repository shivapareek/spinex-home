"use client";

import { createElement, useEffect, useState } from "react";

/**
 * Google <model-viewer> wrapper: orbit/zoom a GLB in 3D, and on phones launch
 * Scene Viewer (Android) / Quick Look (iOS, needs USDZ) to place the idol in the real world.
 */
export function ModelViewer({ glb, usdz, alt, ar = true, autoRotate = true }: { glb: string | null; usdz?: string | null; alt: string; ar?: boolean; autoRotate?: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    import("@google/model-viewer").then(() => setReady(true)).catch(() => setReady(false));
  }, []);
  if (!glb && !usdz) return null;
  if (!ready) return <div className="grid h-full w-full place-items-center text-sm text-ink/50">Loading 3D…</div>;
  return createElement(
    "model-viewer",
    {
      src: glb ?? undefined,
      "ios-src": usdz ?? undefined,
      alt,
      ar: ar ? "" : undefined,
      "ar-modes": "webxr scene-viewer quick-look",
      "ar-scale": "fixed",
      "camera-controls": "",
      "touch-action": "pan-y",
      "auto-rotate": autoRotate ? "" : undefined,
      "shadow-intensity": "1",
      exposure: "1.05",
      "environment-image": "neutral",
      style: { width: "100%", height: "100%", background: "transparent" },
    },
    createElement(
      "button",
      { slot: "ar-button", className: "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ivory shadow-lift" },
      "Place in your space (AR)",
    ),
  );
}
