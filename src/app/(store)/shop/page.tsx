import Link from "next/link";
import { Suspense } from "react";
import { listCategories, listDeities, listProducts, type ProductFilter } from "@/lib/catalog";
import { ProductCard } from "@/components/store/product-card";
import { ShopSidebar, ShopToolbar } from "@/components/store/shop-filters";
import { PLACEMENTS } from "@/lib/utils";

export const metadata = { title: "Shop all idols", description: "Car dashboard idols, home mandir idols and desk décor — Ganesh, Mahadev, Hanuman, Krishna and more." };

type SP = { q?: string; category?: string; deity?: string; placement?: string; price?: string; sort?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [min, max] = (sp.price ?? "").split("-").map((n) => (n ? Number(n) * 100 : undefined));
  const products = listProducts({
    q: sp.q,
    category: sp.category,
    deity: sp.deity,
    placement: sp.placement,
    min,
    max,
    sort: (sp.sort as ProductFilter["sort"]) ?? "featured",
  });
  const categories = listCategories();
  const deities = listDeities();
  const cat = categories.find((c) => c.slug === sp.category);
  const place = PLACEMENTS.find((p) => p.key === sp.placement);
  const title = cat?.name ?? (place ? `${place.label} idols` : sp.deity ? `${sp.deity} idols` : sp.q ? `Results for “${sp.q}”` : "All idols");
  const desc = cat?.description ?? (place ? `Idols chosen to look right on your ${place.label.toLowerCase()}.` : "Handpicked god idols for your car, home mandir and desk.");

  return (
    <div className="container pb-24 pt-8">
      <nav className="text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link> <span className="mx-1">/</span> <span className="text-ink">Shop</span>
      </nav>
      <header className="mb-8 mt-4 border-b border-line pb-8">
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-[15px] text-muted">{desc}</p>
      </header>
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <Suspense><ShopSidebar categories={categories} deities={deities} /></Suspense>
        <div>
          <Suspense><ShopToolbar count={products.length} categories={categories} deities={deities} /></Suspense>
          {products.length ? (
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5">
              {products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 6} />)}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-20 text-center">
              <p className="text-lg font-semibold">No idols match these filters</p>
              <p className="mt-1 text-sm text-muted">Try removing a filter or search for another deity.</p>
              <Link href="/shop" className="btn-outline mt-6">Clear filters</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
