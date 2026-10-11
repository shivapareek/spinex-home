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
import { Eyebrow, Reveal } from "@/components/store/reveal";

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
  const spaceScenes = builtIn.filter((s) => p.placements.length === 0 || p.placements.includes(s.kind));

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
      <div className="pt-24" />
      <section className="container pb-24 pt-10 md:pt-14">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-ink/50" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-maroon">Home</Link>/<Link href="/shop" className="hover:text-maroon">Shop</Link>
          {p.categorySlug && <>/<Link href={`/shop?category=${p.categorySlug}`} className="hover:text-maroon">{p.categoryName}</Link></>}
          /<span className="text-ink/80">{p.name}</span>
        </nav>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <ProductMedia product={studioProduct} images={p.images} spinFrames={p.spinFrames} scenes={scenes} defaultScene={defaultScene} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-deep">{p.deity ?? p.categoryName}</p>
            <h1 className="mt-3 font-display text-4xl leading-[1.04] tracking-tight md:text-5xl">{p.name}</h1>
            {p.reviewCount > 0 && (
              <a href="#reviews" className="mt-3 flex items-center gap-2 text-sm text-ink/60">
                <span className="flex text-gold">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4" weight={i < Math.round(p.rating) ? "fill" : "light"} />)}</span>
                {p.rating} · {p.reviewCount} review{p.reviewCount > 1 ? "s" : ""}
              </a>
            )}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl tracking-tight">{inr(p.price)}</span>
              {off > 0 && (
                <>
                  <span className="text-lg text-ink/40 line-through">{inr(p.mrp)}</span>
                  <span className="rounded-full bg-sindoor/10 px-2.5 py-1 text-xs font-bold text-sindoor">Save {off}%</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-ink/45">Inclusive of all taxes</p>
            {p.shortDescription && <p className="mt-6 text-[15px] leading-relaxed text-ink/65">{p.shortDescription}</p>}

            {placementLabels.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium text-ink/55">Perfect for</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {placementLabels.map((x) => (
                    <Link key={x.key} href={`/shop?placement=${x.key}`} className="rounded-full bg-white px-3.5 py-1.5 text-xs ring-1 ring-ink/10 transition hover:ring-gold">{x.label}</Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <BuyBox p={{ id: p.id, slug: p.slug, name: p.name, price: p.price, stock: p.stock, image: p.cutout ?? p.images[0] ?? null }} dispatchDays={commerce.dispatchDays} />
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-2 text-xs text-ink/65">
              {[
                { Icon: Truck, t: `Free shipping over ${inr(commerce.freeShippingThreshold)}` },
                { Icon: Money, t: commerce.codEnabled ? "Cash on Delivery" : "Secure online payment" },
                { Icon: Package, t: "Securely packed" },
                { Icon: ShieldCheck, t: "Damage? Free replacement" },
              ].map(({ Icon, t }) => (
                <li key={t} className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-3 ring-1 ring-ink/[0.05]"><Icon className="h-4 w-4 shrink-0 text-maroon" weight="light" /> {t}</li>
              ))}
            </ul>

            {market.length > 0 && (
              <div className="mt-6 rounded-2xl bg-ivory-2/70 p-4 text-xs text-ink/60">
                Also available on{" "}
                {market.map(([k, v], i) => (
                  <span key={k}>
                    <a href={v} target="_blank" rel="noreferrer" className="font-semibold capitalize text-maroon underline decoration-gold underline-offset-4">{k}</a>
                    {i < market.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              <Acc title="Description" open>
                <div className="prose-spx text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.description || p.shortDescription || "") }} />
              </Acc>
              <Acc title="Specifications">
                <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                  {[["SKU", p.sku], ["Material", p.material], ["Size", p.dimensions], ["Weight", p.weightGrams ? `${p.weightGrams} g` : null], ["Deity", p.deity]].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-ink/50">{k}</dt><dd className="text-ink/80">{v}</dd></div>
                  ))}
                </dl>
              </Acc>
              <Acc title="Shipping & returns">
                <p className="text-sm leading-relaxed text-ink/65">Dispatched in {commerce.dispatchDays}. Free shipping on orders above {inr(commerce.freeShippingThreshold)}. If your idol arrives damaged, share an unboxing video within 48 hours for a free replacement. <Link href="/p/returns-refunds" className="text-maroon underline decoration-gold underline-offset-4">Read policy</Link></p>
              </Acc>
            </div>
          </div>
        </div>
      </section>

      {p.cutout && spaceScenes.length > 0 && (
        <section className="bg-ink py-24 text-ivory md:py-32">
          <div className="container">
            <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <Eyebrow dark>Same idol, every space</Eyebrow>
                <h2 className="mt-5 font-display text-4xl leading-[1.04] tracking-tight md:text-5xl">Where will {p.name} live?</h2>
              </div>
              <Link href={`/experience?idol=${p.slug}`} className="text-sm text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-bright">Open in Darshan Studio →</Link>
            </Reveal>
            <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {spaceScenes.map((s, i) => (
                <Reveal key={s.key} delay={i * 0.06}>
                  <Link href={`/experience?idol=${p.slug}&scene=${s.key}`} className="group block rounded-[1.6rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10 transition hover:ring-gold/50">
                    <IdolInScene scene={s} idol={{ name: p.name, cutout: p.cutout, heightCm: p.heightCm }} className="aspect-[4/5] rounded-[calc(1.6rem-0.375rem)]" scale={1.2} />
                    <p className="flex items-center justify-between px-3 py-3 text-sm">{s.name}<span className="text-xs text-ivory/40 transition group-hover:text-gold">Try →</span></p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="reviews" className="container py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <Eyebrow>Reviews</Eyebrow>
            <h2 className="mt-5 font-display text-4xl tracking-tight">{p.reviewCount ? `${p.rating} out of 5` : "Be the first to share"}</h2>
            <p className="mt-2 text-sm text-ink/55">{p.reviewCount ? `Based on ${p.reviewCount} verified review${p.reviewCount > 1 ? "s" : ""}.` : "Bought this idol? Tell other devotees how it looks in your space."}</p>
            <div className="mt-6"><ReviewForm productId={p.id} /></div>
          </div>
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-[1.6rem] bg-white p-6 ring-1 ring-ink/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="flex text-gold">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4" weight={i < r.rating ? "fill" : "light"} />)}</span>
                  <span className="text-xs text-ink/40">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="mt-3 font-display text-lg">{r.title}</p>}
                {r.body && <p className="mt-2 text-sm leading-relaxed text-ink/65">{r.body}</p>}
                <p className="mt-4 text-xs text-ink/50">— {r.name}{r.city ? `, ${r.city}` : ""}</p>
              </li>
            ))}
            {reviews.length === 0 && <li className="rounded-[1.6rem] border border-dashed border-ink/15 px-6 py-14 text-center text-sm text-ink/45">No reviews yet.</li>}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container pb-28">
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">You may also love</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
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
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold">
        {title}
        <span className="text-lg text-ink/40 transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}
