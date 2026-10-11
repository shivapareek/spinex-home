import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Truck, ShieldCheck, Package, Money, Star } from "@phosphor-icons/react/dist/ssr";
import { getProduct, getProductReviews, relatedProducts } from "@/lib/catalog";
import { listScenes } from "@/lib/scenes";
import { getSetting } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, discountPct, formatDate, inr, PLACEMENTS } from "@/lib/utils";
import { ProductMedia } from "@/components/store/product/media";
import { BuyBox, ReviewForm } from "@/components/store/product/buy-box";
import { ProductCard } from "@/components/store/product-card";
import { IdolInScene } from "@/components/visualizer/idol-in-scene";
import { Reveal, SectionHead } from "@/components/store/reveal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  return {
    title: p.seoTitle || p.name,
    description: p.seoDescription || p.shortDescription || undefined,
    openGraph: { images: p.images[0] ? [absoluteUrl(p.images[0])] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const reviews = getProductReviews(p.id);
  const commerce = getSetting("commerce");
  const scenes = listScenes();
  const builtIn = scenes.filter((s) => s.kind !== "photo");
  const related = relatedProducts(p, 4);
  const off = discountPct(p.price, p.mrp);
  const placementLabels = PLACEMENTS.filter((x) => p.placements.includes(x.key));
  const defaultScene = scenes.find((s) => p.placements.includes(s.kind))?.key;
  const studioProduct = { id: p.id, slug: p.slug, name: p.name, price: p.price, stock: p.stock, cutout: p.cutout, heightCm: p.heightCm, modelGlb: p.modelGlb, modelUsdz: p.modelUsdz };
  const market = Object.entries(p.marketplace).filter(([, v]) => v) as [string, string][];
  const spaceScenes = builtIn;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images.map((i) => absoluteUrl(i)),
    description: p.shortDescription,
    sku: p.sku,
    brand: { "@type": "Brand", name: "Spinex Home" },
    offers: { "@type": "Offer", priceCurrency: "INR", price: (p.price / 100).toFixed(2), availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: absoluteUrl(`/product/${p.slug}`) },
    ...(p.reviewCount ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="container pb-16 pt-6">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Home</Link><span>/</span><Link href="/shop" className="hover:text-ink">Shop</Link>
          {p.categorySlug && <><span>/</span><Link href={`/shop?category=${p.categorySlug}`} className="hover:text-ink">{p.categoryName}</Link></>}
          <span>/</span><span className="text-ink">{p.name}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <ProductMedia product={studioProduct} images={p.images} spinFrames={p.spinFrames} scenes={scenes} defaultScene={defaultScene} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            {p.badge && <span className="mb-3 inline-block rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold text-accent">{p.badge}</span>}
            <p className="text-sm text-muted">{p.deity ?? p.categoryName}</p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight md:text-[34px]">{p.name}</h1>
            {p.reviewCount > 0 && (
              <a href="#reviews" className="mt-2 flex items-center gap-2 text-sm text-muted">
                <span className="flex text-accent">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4" weight={i < Math.round(p.rating) ? "fill" : "regular"} />)}</span>
                {p.rating} ({p.reviewCount} review{p.reviewCount > 1 ? "s" : ""})
              </a>
            )}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-semibold">{inr(p.price)}</span>
              {off > 0 && (
                <>
                  <span className="text-base text-muted line-through">{inr(p.mrp)}</span>
                  <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-white">{off}% off</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
            {p.shortDescription && <p className="mt-5 text-[15px] leading-7 text-ink/75">{p.shortDescription}</p>}

            {placementLabels.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium">Perfect for</p>
                <div className="flex flex-wrap gap-2">
                  {placementLabels.map((x) => (
                    <Link key={x.key} href={`/shop?placement=${x.key}`} className="rounded-full border border-line px-3.5 py-1.5 text-sm transition hover:border-ink">{x.label}</Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-line pt-6">
              <BuyBox p={{ id: p.id, slug: p.slug, name: p.name, price: p.price, stock: p.stock, image: p.cutout ?? p.images[0] ?? null }} dispatchDays={commerce.dispatchDays} />
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                { Icon: Truck, t: `Free shipping over ${inr(commerce.freeShippingThreshold)}` },
                { Icon: Money, t: commerce.codEnabled ? "Cash on Delivery" : "Secure online payment" },
                { Icon: Package, t: "Safe packaging" },
                { Icon: ShieldCheck, t: "Free replacement if damaged" },
              ].map(({ Icon, t }) => (
                <li key={t} className="flex items-center gap-2.5 text-ink/80"><Icon className="h-5 w-5 shrink-0 text-accent" /> {t}</li>
              ))}
            </ul>

            {market.length > 0 && (
              <p className="mt-6 text-sm text-muted">
                Also on{" "}
                {market.map(([k, v], i) => (
                  <span key={k}>
                    <a href={v} target="_blank" rel="noreferrer" className="font-medium capitalize text-ink underline underline-offset-4">{k}</a>
                    {i < market.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            )}

            <div className="mt-8 divide-y divide-line border-y border-line">
              <Acc title="Description" open>
                <div className="prose-spx text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.description || p.shortDescription || "") }} />
              </Acc>
              <Acc title="Specifications">
                <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
                  {[["SKU", p.sku], ["Material", p.material], ["Size", p.dimensions], ["Weight", p.weightGrams ? `${p.weightGrams} g` : null], ["Deity", p.deity]].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              </Acc>
              <Acc title="Shipping & returns">
                <p className="text-sm leading-6 text-muted">Ships in {commerce.dispatchDays}. Free shipping on orders above {inr(commerce.freeShippingThreshold)}. If your idol arrives damaged, share an unboxing video within 48 hours for a free replacement. <Link href="/p/returns-refunds" className="font-medium text-ink underline underline-offset-4">Read policy</Link></p>
              </Acc>
            </div>
          </div>
        </div>
      </section>

      {p.cutout && spaceScenes.length > 0 && (
        <section className="bg-surface py-14 md:py-20">
          <div className="container">
            <SectionHead eyebrow="Try before you buy" title={`How ${p.name} looks in each space`} href={`/experience?idol=${p.slug}`} cta="Open full preview" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {spaceScenes.map((s, i) => (
                <Reveal key={s.key} delay={i * 0.05}>
                  <Link href={`/experience?idol=${p.slug}&scene=${s.key}`} className="group block">
                    <div className="overflow-hidden rounded-2xl">
                      <IdolInScene scene={s} idol={{ name: p.name, cutout: p.cutout, heightCm: p.heightCm }} className="aspect-[4/5] transition-transform duration-700 ease-silk group-hover:scale-[1.03]" scale={1.2} animated={false} />
                    </div>
                    <p className="mt-3 flex items-center justify-between text-sm font-medium">{s.name}<span className="text-muted transition group-hover:text-ink">Try →</span></p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="reviews" className="container py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow mb-2">Reviews</p>
            <h2 className="text-[28px] font-semibold">{p.reviewCount ? `${p.rating} out of 5` : "No reviews yet"}</h2>
            <p className="mt-2 text-sm text-muted">{p.reviewCount ? `Based on ${p.reviewCount} review${p.reviewCount > 1 ? "s" : ""}.` : "Bought this idol? Share how it looks in your space."}</p>
            <div className="mt-6"><ReviewForm productId={p.id} /></div>
          </div>
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-line p-5">
                <div className="flex items-center justify-between">
                  <span className="flex text-accent">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4" weight={i < r.rating ? "fill" : "regular"} />)}</span>
                  <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
                {r.body && <p className="mt-1 text-sm leading-6 text-ink/75">{r.body}</p>}
                <p className="mt-3 text-xs text-muted">{r.name}{r.city ? `, ${r.city}` : ""}</p>
              </li>
            ))}
            {reviews.length === 0 && <li className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">Reviews from customers will appear here.</li>}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container pb-24">
          <SectionHead title="You may also like" href="/shop" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </>
  );
}

function Acc({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[15px] font-medium">
        {title}
        <span className="text-xl font-light text-muted transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}
