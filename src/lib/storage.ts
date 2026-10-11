import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { media } from "@/db/schema";

/** Uploaded files live outside /public so they are served at runtime by /uploads/[...path]. */
export const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
const MODEL_TYPES = ["model/gltf-binary", "model/vnd.usdz+zip", "application/octet-stream"];
const MAX_BYTES = 40 * 1024 * 1024;

export type Saved = { url: string; width?: number; height?: number; size: number; mime: string; filename: string };

/**
 * Save an uploaded File. Raster images are normalised to WebP (max 2400px) with sharp
 * unless `keepOriginal` is set (e.g. transparent cutouts already optimised).
 */
export async function saveUpload(file: File, folder = "media", opts: { keepOriginal?: boolean; record?: boolean } = {}): Promise<Saved> {
  if (file.size > MAX_BYTES) throw new Error("File is larger than 40MB");
  const ext = path.extname(file.name).toLowerCase();
  const isModel = [".glb", ".usdz"].includes(ext);
  if (!IMAGE_TYPES.includes(file.type) && !isModel && !MODEL_TYPES.includes(file.type) && file.type !== "application/pdf") {
    throw new Error(`Unsupported file type: ${file.type || ext}`);
  }
  const dir = path.join(UPLOAD_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  const base = `${nanoid(10)}`;
  let buf: Buffer = Buffer.from(await file.arrayBuffer());
  let outName = base + ext;
  let width: number | undefined;
  let height: number | undefined;
  let mime = file.type || "application/octet-stream";

  const raster = ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type);
  if (raster) {
    const sharp = (await import("sharp")).default;
    let img = sharp(buf, { failOn: "none" }).rotate();
    if (!opts.keepOriginal) {
      img = img.resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 86 });
      outName = base + ".webp";
      mime = "image/webp";
    }
    const out = await img.toBuffer({ resolveWithObject: true });
    buf = out.data;
    width = out.info.width;
    height = out.info.height;
  }
  await fs.writeFile(path.join(dir, outName), buf);
  const url = `/uploads/${folder}/${outName}`;
  const saved = { url, width, height, size: buf.length, mime, filename: file.name };
  if (opts.record !== false) {
    db.insert(media).values({ url, filename: file.name, mime, size: buf.length, width, height }).run();
  }
  return saved;
}

export async function deleteUpload(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const p = path.join(UPLOAD_ROOT, url.replace(/^\/uploads\//, ""));
  if (!p.startsWith(UPLOAD_ROOT)) return;
  await fs.rm(p, { force: true });
}
