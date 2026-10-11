import { Suspense } from "react";
import { listCategories, listDeities, listProducts, type ProductFilter } from "@/lib/catalog";
import { ProductCard } from "@/components/store/product-card";
import { ShopFilters } from "@/components/store/shop-filters";
import { Eyebrow } from "@/components/store/reveal";
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
  const cat = categories.find((c) => c.slug === sp.category);
  const place = PLACEMENTS.find((p) => p.key === sp.placement);
  const title = cat?.name ?? (place ? `Idols for your ${place.label.toLowerCase()}` : sp.deity ? `${sp.deity} idols` : sp.q ? `Results for “${sp.q}”` : "All idols");

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-16 pt-36 text-ivory">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(201,162,74,0.25),transparent)]" />
        <div className="container relative">
          <Eyebrow dark>The collection · {products.length} idols</Eyebrow>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1] tracking-tight md:text-7xl">{title}</h1>
          {cat?.description && <p className="mt-5 max-w-lg text-ivory/60">{cat.description}</p>}
        </div>
      </section>
      <section className="container pb-28 pt-8">
        <div className="sticky top-20 z-20 -mx-4 bg-ivory/90 px-4 py-4 backdrop-blur-xl md:static md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
          <Suspense>
            <ShopFilters categories={categories} deities={listDeities()} />
          </Suspense>
        </div>
        {products.length ? (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
            {products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}
          </div>
        ) : (
          <div className="mt-16 rounded-[2rem] border border-dashed border-ink/15 px-6 py-24 text-center">
            <p className="font-display text-3xl">No idols match these filters.</p>
            <p className="mt-2 text-sm text-ink/55">Try removing a filter or searching for another deity.</p>
          </div>
        )}
      </section>
    </>
  );
}
