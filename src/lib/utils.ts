import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format paise as Indian Rupees, e.g. 12500 -> ₹125 */
export function inr(paise: number | null | undefined, opts: { decimals?: boolean } = {}) {
  const v = (paise ?? 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : v % 1 === 0 ? 0 : 2,
  }).format(v);
}

export const toPaise = (rupees: number | string) => Math.round(Number(rupees || 0) * 100);
export const toRupees = (paise: number | null | undefined) => (paise ?? 0) / 100;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function discountPct(price: number, mrp?: number | null) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function formatDate(iso: string | Date, withTime = false) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return base.replace(/\/$/, "") + path;
}

export const PLACEMENTS = [
  { key: "car", label: "Car Dashboard" },
  { key: "temple", label: "Home Mandir" },
  { key: "desk", label: "Office Desk" },
  { key: "shelf", label: "Living Room" },
] as const;
export type PlacementKey = (typeof PLACEMENTS)[number]["key"];
