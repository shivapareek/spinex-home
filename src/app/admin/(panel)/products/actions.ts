"use server";

import { revalidatePath } from "next/cache";
import { eq, like } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { PLACEMENTS, slugify, toPaise } from "@/lib/utils";
import { safeJson } from "@/components/admin/commerce/helpers";

const opt = z.string().trim().optional();
const url = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Marketplace links must start with http:// or https://");
const optNum = (msg: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), msg);

const schema = z.object({
  name: z.string().trim().min(2, "Product name is required"),
  slug: opt,
  sku: opt,
  categoryId: opt,
  deity: opt,
  badge: opt,
  shortDescription: z.string().trim().max(300, "Short description should be under 300 characters").optional(),
  description: opt,
  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "Price must be greater than 0"),
  mrp: optNum("MRP must be a valid amount"),
  stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock can't be negative").default(0),
  weightGrams: optNum("Weight must be a valid number"),
  cutout: opt,
  modelGlb: opt,
  modelUsdz: opt,
  heightCm: optNum("Height must be a valid number"),
  material: opt,
  dimensions: opt,
  mp_amazon: url,
  mp_flipkart: url,
  mp_meesho: url,
  seoTitle: z.string().trim().max(120, "SEO title is too long").optional(),
  seoDescription: z.string().trim().max(320, "SEO description is too long").optional(),
  sortOrder: z.coerce.number().int().default(0),
});

const strArray = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim()) : []);

export async function saveProduct(id: number | null, fd: FormData) {
  await requireAdmin();
  const raw: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string" && !(k in raw)) raw[k] = v;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const price = toPaise(d.price);
  const mrp = d.mrp ? toPaise(d.mrp) : null;
  if (mrp != null && mrp > 0 && mrp < price) return { error: "MRP can't be lower than the selling price" };

  const allowed = PLACEMENTS.map((p) => p.key as string);
  const placements = fd.getAll("placements").map(String).filter((p) => allowed.includes(p));
  const marketplace: { amazon?: string; flipkart?: string; meesho?: string } = {};
  if (d.mp_amazon) marketplace.amazon = d.mp_amazon;
  if (d.mp_flipkart) marketplace.flipkart = d.mp_flipkart;
  if (d.mp_meesho) marketplace.meesho = d.mp_meesho;

  const slug = slugify(d.slug || d.name);
  if (!slug) return { error: "Please enter a valid URL slug" };
  const clash = db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).get();
  if (clash && clash.id !== id) return { error: `Another product already uses the slug “${slug}”` };

  const values = {
    name: d.name,
    slug,
    sku: d.sku || null,
    categoryId: d.categoryId ? Number(d.categoryId) || null : null,
    deity: d.deity || null,
    badge: d.badge || null,
    shortDescription: d.shortDescription || null,
    description: d.description || null,
    price,
    mrp: mrp || null,
    stock: d.stock,
    weightGrams: d.weightGrams ? Math.round(Number(d.weightGrams)) : null,
    images: strArray(safeJson(fd.get("images"), [])),
    cutout: d.cutout || null,
    spinFrames: strArray(safeJson(fd.get("spinFrames"), [])),
    modelGlb: d.modelGlb || null,
    modelUsdz: d.modelUsdz || null,
    placements,
    heightCm: d.heightCm ? Number(d.heightCm) : null,
    material: d.material || null,
    dimensions: d.dimensions || null,
    marketplace,
    tags: strArray(safeJson(fd.get("tags"), [])),
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    sortOrder: d.sortOrder,
    isActive: fd.get("isActive") === "on",
    isFeatured: fd.get("isFeatured") === "on",
    isBestseller: fd.get("isBestseller") === "on",
    updatedAt: new Date().toISOString(),
  };

  let newId = id;
  if (id) db.update(products).set(values).where(eq(products.id, id)).run();
  else newId = Number(db.insert(products).values(values).run().lastInsertRowid);

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: id ? "Product saved" : "Product created",
    redirect: id ? undefined : `/admin/products/${newId}`,
  };
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const p = db.select({ id: products.id }).from(products).where(eq(products.id, id)).get();
  if (!p) return { error: "Product not found" };
  db.transaction((tx) => {
    tx.delete(reviews).where(eq(reviews.productId, id)).run();
    tx.delete(products).where(eq(products.id, id)).run();
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Product deleted", redirect: "/admin/products" };
}

export async function duplicateProduct(id: number) {
  await requireAdmin();
  const p = db.select().from(products).where(eq(products.id, id)).get();
  if (!p) return { error: "Product not found" };
  const base = `${p.slug}-copy`;
  const taken = new Set(db.select({ slug: products.slug }).from(products).where(like(products.slug, `${base}%`)).all().map((r) => r.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  const { id: _omit, createdAt: _c, updatedAt: _u, ...rest } = p;
  const now = new Date().toISOString();
  const res = db
    .insert(products)
    .values({ ...rest, name: `${p.name} (copy)`, slug, sku: p.sku ? `${p.sku}-COPY` : null, isActive: false, createdAt: now, updatedAt: now })
    .run();
  revalidatePath("/admin/products");
  return { ok: true, message: "Duplicated as a hidden draft", redirect: `/admin/products/${res.lastInsertRowid}` };
}

export async function toggleProductActive(id: number) {
  await requireAdmin();
  const p = db.select({ isActive: products.isActive, name: products.name }).from(products).where(eq(products.id, id)).get();
  if (!p) return { error: "Product not found" };
  db.update(products).set({ isActive: !p.isActive, updatedAt: new Date().toISOString() }).where(eq(products.id, id)).run();
  revalidatePath("/", "layout");
  return { ok: true, message: `${p.name} is now ${p.isActive ? "hidden" : "live"}` };
}
