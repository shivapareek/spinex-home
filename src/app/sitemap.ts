import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pages, products } from "@/db/schema";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const ps = db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.isActive, true)).all();
  const cms = db.select({ slug: pages.slug, updatedAt: pages.updatedAt }).from(pages).where(eq(pages.isPublished, true)).all();
  return [
    ...["", "/shop", "/experience", "/bulk-orders", "/contact", "/faq"].map((p) => ({ url: absoluteUrl(p), changeFrequency: "weekly" as const, priority: p ? 0.7 : 1 })),
    ...ps.map((p) => ({ url: absoluteUrl(`/product/${p.slug}`), lastModified: p.updatedAt, priority: 0.8 })),
    ...cms.map((p) => ({ url: absoluteUrl(`/p/${p.slug}`), lastModified: p.updatedAt, priority: 0.4 })),
  ];
}
