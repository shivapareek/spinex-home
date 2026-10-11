import { NextResponse } from "next/server";
import { listProducts } from "@/lib/catalog";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 60) || "";
  const rows = listProducts({ q: q || undefined, limit: 8, sort: q ? "featured" : "rating" });
  return NextResponse.json({ hits: rows.map((p) => ({ slug: p.slug, name: p.name, price: p.price, cutout: p.cutout, deity: p.deity })) });
}
