import Link from "next/link";
import { and, asc, desc, eq, gt, like, lte, or, sql, type SQL } from "drizzle-orm";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { inr } from "@/lib/utils";
import { Badge, EmptyState, LinkButton, PageHeader, Table, Thumb, inputClass, td } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/client";
import { SearchForm } from "@/components/admin/commerce/bits";
import { AutoSubmitSelect, ToggleAction } from "@/components/admin/commerce/client-bits";
import { deleteProduct, duplicateProduct, toggleProductActive } from "./actions";

export const metadata = { title: "Products" };

type SP = Promise<{ q?: string; category?: string; status?: string }>;

const STATUSES = [
  { key: "", label: "All statuses" },
  { key: "active", label: "Live" },
  { key: "hidden", label: "Hidden" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
  { key: "featured", label: "Featured" },
  { key: "bestseller", label: "Bestsellers" },
];

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const { q = "", category = "", status = "" } = await searchParams;
  const { lowStockThreshold } = getSetting("commerce");
  const cats = db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)).all();

  const where: SQL[] = [];
  if (q.trim()) {
    const term = `%${q.trim()}%`;
    where.push(or(like(products.name, term), like(products.sku, term), like(products.deity, term))!);
  }
  if (category === "none") where.push(sql`${products.categoryId} is null`);
  else if (category) where.push(eq(products.categoryId, Number(category)));
  if (status === "active") where.push(eq(products.isActive, true));
  if (status === "hidden") where.push(eq(products.isActive, false));
  if (status === "low") where.push(and(lte(products.stock, lowStockThreshold), gt(products.stock, 0))!);
  if (status === "out") where.push(lte(products.stock, 0));
  if (status === "featured") where.push(eq(products.isFeatured, true));
  if (status === "bestseller") where.push(eq(products.isBestseller, true));

  const rows = db
    .select({ p: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(products.sortOrder), desc(products.createdAt))
    .all();
  const total = Number(db.select({ n: sql<number>`count(*)` }).from(products).get()?.n ?? 0);
  const filtered = !!(q || category || status);

  return (
    <>
      <PageHeader
        title="Products"
        description={`${total} idols in your catalogue. Manage pricing, stock, media, 360° spins and visualizer settings.`}
        actions={<LinkButton href="/admin/products/new"><Plus weight="light" className="h-4 w-4" /> New product</LinkButton>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchForm q={q} placeholder="Search name, SKU or deity" keep={{ category, status }} />
        <form method="get" className="flex flex-1 flex-wrap gap-2">
          {q && <input type="hidden" name="q" value={q} />}
          <AutoSubmitSelect name="category" defaultValue={category} className={`${inputClass} w-auto min-w-[150px] rounded-full bg-white`} aria-label="Category">
            <option value="">All categories</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="none">Uncategorised</option>
          </AutoSubmitSelect>
          <AutoSubmitSelect name="status" defaultValue={status} className={`${inputClass} w-auto min-w-[140px] rounded-full bg-white`} aria-label="Status">
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </AutoSubmitSelect>
          <noscript><button className="text-xs underline">Apply</button></noscript>
          {filtered && (
            <Link href="/admin/products" className="self-center px-2 text-xs font-medium text-maroon hover:underline">Clear filters</Link>
          )}
        </form>
      </div>

      {total === 0 ? (
        <EmptyState
          title="Your catalogue is empty"
          body="Add your first idol — with photos, a 360° spin and a cutout for the try-in-your-space visualizer."
          action={<LinkButton href="/admin/products/new">Add first product</LinkButton>}
        />
      ) : (
        <Table
          head={["Product", "Category", "Price", "Stock", "Flags", "Live", ""]}
          empty={
            <div>
              <p className="font-display text-lg text-ink">No products match</p>
              <p className="mt-1">Try a different search or <Link href="/admin/products" className="text-maroon underline">clear filters</Link>.</p>
            </div>
          }
        >
          {rows.map(({ p, categoryName }) => {
            const low = p.stock <= lowStockThreshold;
            return (
              <tr key={p.id} className="transition hover:bg-ivory/40">
                <td className={td}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-maroon">
                    <Thumb src={p.images[0] ?? p.cutout} alt={p.name} />
                    <span className="min-w-0">
                      <span className="block max-w-[240px] truncate font-medium">{p.name}</span>
                      <span className="block text-[11px] text-ink/45">{p.sku || "No SKU"}{p.deity ? ` · ${p.deity}` : ""}</span>
                    </span>
                  </Link>
                </td>
                <td className={`${td} text-ink/60`}>{categoryName ?? <span className="text-ink/35">—</span>}</td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>
                  <span className="font-medium">{inr(p.price)}</span>
                  {p.mrp && p.mrp > p.price ? <span className="ml-1.5 text-[11px] text-ink/40 line-through">{inr(p.mrp)}</span> : null}
                </td>
                <td className={td}>
                  {low ? <Badge tone="red">{p.stock <= 0 ? "Out of stock" : `${p.stock} · low`}</Badge> : <span className="tabular-nums">{p.stock}</span>}
                </td>
                <td className={td}>
                  <div className="flex flex-wrap gap-1">
                    {p.isFeatured && <Badge tone="gold">Featured</Badge>}
                    {p.isBestseller && <Badge tone="maroon">Bestseller</Badge>}
                    {p.spinFrames.length > 0 && <Badge tone="blue">360°</Badge>}
                    {p.modelGlb && <Badge tone="blue">3D</Badge>}
                    {!p.isFeatured && !p.isBestseller && !p.spinFrames.length && !p.modelGlb && <span className="text-ink/30">—</span>}
                  </div>
                </td>
                <td className={td}>
                  <ToggleAction action={toggleProductActive.bind(null, p.id)} checked={p.isActive} label={p.isActive ? "Hide from store" : "Publish to store"} />
                </td>
                <td className={`${td} whitespace-nowrap text-right`}>
                  <Link href={`/admin/products/${p.id}`} className="mr-1 text-xs font-medium text-ink/70 hover:text-maroon">Edit</Link>
                  <ActionButton action={duplicateProduct.bind(null, p.id)}>Duplicate</ActionButton>
                  <ActionButton action={deleteProduct.bind(null, p.id)} confirm={`Delete “${p.name}”? Its reviews will be removed too. Past orders keep their line items.`} className="text-sindoor hover:bg-sindoor/10 hover:text-sindoor">
                    Delete
                  </ActionButton>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
      {filtered && rows.length > 0 && <p className="mt-3 text-xs text-ink/45">Showing {rows.length} of {total} products{q ? ` matching “${q}”` : ""}.</p>}
    </>
  );
}
