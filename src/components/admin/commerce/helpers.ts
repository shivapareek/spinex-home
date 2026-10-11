/** Server/client-safe helpers shared by the commerce admin modules. */

const IST_OFFSET_MIN = 330;

/** YYYY-MM-DD of an ISO timestamp in India Standard Time. */
export function istDay(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Date(d.getTime() + IST_OFFSET_MIN * 60_000).toISOString().slice(0, 10);
}

/** Start (00:00 IST) or end (23:59:59 IST) of a YYYY-MM-DD date as a UTC ISO string. */
export function istBoundary(day: string, edge: "start" | "end") {
  const t = edge === "start" ? "T00:00:00.000+05:30" : "T23:59:59.999+05:30";
  const d = new Date(day + t);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Rupee number for a form input default value (paise → "123.5"). */
export function rupeeInput(paise: number | null | undefined) {
  if (paise == null) return "";
  const v = paise / 100;
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

export function csvCell(v: unknown) {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export function toCsv(rows: unknown[][]) {
  // BOM so Excel opens UTF-8 (₹, Devanagari) correctly
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export function safeJson<T>(raw: FormDataEntryValue | null, fallback: T): T {
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function waLink(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Indian-system amount in words, e.g. 1234.5 -> "One Thousand Two Hundred Thirty Four Rupees and Fifty Paise Only" */
export function rupeesInWords(paise: number) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (n: number) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? " " + ones[n % 10] : ""}`);
  const three = (n: number) => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return [h ? `${ones[h]} Hundred` : "", r ? two(r) : ""].filter(Boolean).join(" ");
  };
  const words = (n: number) => {
    if (n === 0) return "Zero";
    const parts: string[] = [];
    const crore = Math.floor(n / 1e7);
    const lakh = Math.floor((n % 1e7) / 1e5);
    const thousand = Math.floor((n % 1e5) / 1e3);
    const rest = n % 1e3;
    if (crore) parts.push(`${words(crore)} Crore`);
    if (lakh) parts.push(`${two(lakh)} Lakh`);
    if (thousand) parts.push(`${two(thousand)} Thousand`);
    if (rest) parts.push(three(rest));
    return parts.join(" ");
  };
  const r = Math.floor(Math.abs(paise) / 100);
  const p = Math.abs(paise) % 100;
  return `${words(r)} Rupees${p ? ` and ${two(p)} Paise` : ""} Only`;
}
