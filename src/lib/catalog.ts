import "server-only";
import { and, asc, desc, eq, inArray, sql, like, or, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, reviews, type Product } from "@/db/schema";

export type ProductCard = Product & { rating: number; reviewCount: number; categoryName: string | null; categorySlug: string | null };

const ratingSub = db
  .select({
    productId: reviews.productId,
    rating: sql<number>`avg(${reviews.rating})`.as("rating"),
    count: sql<number>`count(*)`.as("count"),
  })
  .from(reviews)
  .where(eq(reviews.isApproved, true))
  .groupBy(reviews.productId)
  .as("r");

function baseQuery() {
  return db
    .select({
      p: products,
      rating: sql<number>`coalesce(${ratingSub.rating}, 0)`,
      reviewCount: sql<number>`coalesce(${ratingSub.count}, 0)`,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(ratingSub, eq(ratingSub.productId, products.id))
    .leftJoin(categories, eq(categories.id, products.categoryId));
}

const flatten = (r: { p: Product; rating: number; reviewCount: number; categoryName: string | null; categorySlug: string | null }): ProductCard => ({
  ...r.p,
  rating: Math.round(Number(r.rating) * 10) / 10,
  reviewCount: Number(r.reviewCount),
  categoryName: r.categoryName,
  categorySlug: r.categorySlug,
});

export type ProductFilter = {
  q?: string;
  category?: string;
  deity?: string;
  placement?: string;
  min?: number;
  max?: number;
  sort?: "featured" | "new" | "price-asc" | "price-desc" | "rating";
  slugs?: string[];
  featured?: boolean;
  bestseller?: boolean;
  limit?: number;
};

export function listProducts(f: ProductFilter = {}): ProductCard[] {
  const conds = [eq(products.isActive, true)];
  if (f.q) {
    const q = `%${f.q.trim()}%`;
    conds.push(or(like(products.name, q), like(products.deity, q), like(products.tags, q), like(products.shortDescription, q))!);
  }
  if (f.category) conds.push(eq(categories.slug, f.category));
  if (f.deity) conds.push(eq(products.deity, f.deity));
  if (f.placement) conds.push(like(products.placements, `%"${f.placement}"%`));
  if (f.min != null) conds.push(gte(products.price, f.min));
  if (f.max != null) conds.push(lte(products.price, f.max));
  if (f.slugs?.length) conds.push(inArray(products.slug, f.slugs));
  if (f.featured) conds.push(eq(products.isFeatured, true));
  if (f.bestseller) conds.push(eq(products.isBestseller, true));

  const order = {
    featured: [desc(products.isFeatured), desc(products.isBestseller), asc(products.sortOrder)],
    new: [desc(products.createdAt)],
    "price-asc": [asc(products.price)],
    "price-desc": [desc(products.price)],
    rating: [desc(sql`coalesce(${ratingSub.rating}, 0)`)],
  }[f.sort ?? "featured"];

  let q = baseQuery().where(and(...conds)).orderBy(...order).$dynamic();
  if (f.limit) q = q.limit(f.limit);
  const rows = q.all().map(flatten);
  if (f.slugs?.length) rows.sort((a, b) => f.slugs!.indexOf(a.slug) - f.slugs!.indexOf(b.slug));
  return rows;
}

export function getProduct(slug: string): ProductCard | null {
  const r = baseQuery().where(and(eq(products.slug, slug), eq(products.isActive, true))).get();
  return r ? flatten(r) : null;
}

export function getProductReviews(productId: number) {
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt))
    .all();
}

export function listCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      image: categories.image,
      count: sql<number>`(select count(*) from products where products.category_id = ${categories.id} and products.is_active = 1)`,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder))
    .all();
}

export function listDeities() {
  return db
    .select({ deity: products.deity, count: sql<number>`count(*)`, image: sql<string>`min(${products.cutout})` })
    .from(products)
    .where(and(eq(products.isActive, true), sql`${products.deity} is not null`))
    .groupBy(products.deity)
    .orderBy(desc(sql`count(*)`))
    .all() as { deity: string; count: number; image: string }[];
}

export function relatedProducts(p: Product, limit = 4) {
  return listProducts({ deity: p.deity ?? undefined, limit: limit + 1 })
    .concat(listProducts({ limit: 12 }))
    .filter((x, i, arr) => x.id !== p.id && arr.findIndex((y) => y.id === x.id) === i)
    .slice(0, limit);
}
