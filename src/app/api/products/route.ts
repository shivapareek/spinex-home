import { NextResponse } from "next/server";
import { inArray, and, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

/** Lightweight product lookup by ids (wishlist, cart refresh). */
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").map(Number).filter(Boolean).slice(0, 100);
  if (!ids.length) return NextResponse.json({ products: [] });
  const rows = db
    .select({ id: products.id, slug: products.slug, name: products.name, price: products.price, mrp: products.mrp, stock: products.stock, images: products.images, cutout: products.cutout, deity: products.deity, placements: products.placements, badge: products.badge })
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.isActive, true)))
    .all();
  return NextResponse.json({ products: rows });
}
