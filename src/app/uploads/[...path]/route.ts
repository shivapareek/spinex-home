import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_ROOT } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".avif": "image/avif", ".glb": "model/gltf-binary",
  ".usdz": "model/vnd.usdz+zip", ".pdf": "application/pdf", ".mp4": "video/mp4",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const file = path.join(UPLOAD_ROOT, ...parts.map((p) => p.replace(/\.\./g, "")));
  if (!file.startsWith(UPLOAD_ROOT)) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(file.endsWith(".svg") ? { "Content-Security-Policy": "script-src 'none'" } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
