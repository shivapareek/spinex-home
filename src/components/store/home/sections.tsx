import Link from "next/link";
import { Car, ShieldCheck, Sun, ArrowsOutCardinal, DownloadSimple, Plus, Star } from "@phosphor-icons/react/dist/ssr";
import type { HomeSettings } from "@/lib/settings";
import type { ProductCard as PC } from "@/lib/catalog";
import type { Faq, Testimonial } from "@/db/schema";
import { ProductCard } from "@/components/store/product-card";
import { IdolInScene, type SceneData } from "@/components/visualizer/idol-in-scene";
import { ArrowLink, Eyebrow, Reveal } from "@/components/store/reveal";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { ExperienceFeatures, ExperienceTeaser, StudioCta } from "./experience-teaser";
import type { HeroIdol } from "./hero";
import { cn } from "@/lib/utils";

const DEVA: Record<string, string> = {
  Ganesh: "श्री गणेश",
  Mahadev: "महादेव",
  Hanuman: "हनुमान",
  "Radha Krishna": "राधा कृष्ण",
  Krishna: "श्री कृष्ण",
  "Khatu Shyam": "खाटू श्याम",
  Buddha: "बुद्ध",
  Kamdhenu: "कामधेनु",
  "Ganesh & Lakshmi": "गणेश लक्ष्मी",
};

export function Marquee({ words }: { words: string[] }) {
  const row = [...words, ...words];
  return (
    <section aria-label="Deities" className="relative overflow-hidden border-y border-gold/20 bg-maroon-deep py-6 text-ivory">
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-3xl font-light italic tracking-tight md:text-5xl">
            {w}
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold" fill="currentColor" aria-hidden><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" /></svg>
          </span>
        ))}
      </div>
    </section>
  );
}

export function Deities({ deities }: { deities: { deity: string; count: number; image: string }[] }) {
  const list = deities.slice(0, 6);
  const spans = ["md:col-span-7 md:row-span-2", "md:col-span-5", "md:col-span-5", "md:col-span-4", "md:col-span-4", "md:col-span-4"];
  return (
    <section className="py-24 md:py-36">
      <div className="container">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Shop by deity</Eyebrow>
            <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.02] tracking-tight md:text-6xl">Whom do you <em className="text-maroon">pray</em> to?</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink/55">Each idol is chosen for the space it will live in — calm forms for the desk, compact forms for the dashboard, radiant forms for the mandir.</p>
        </Reveal>
        <div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-3 md:auto-rows-[250px] md:grid-cols-12 md:gap-4">
          {list.map((d, i) => (
            <Reveal key={d.deity} delay={i * 0.06} className={cn("col-span-1", i === 0 && "col-span-2 row-span-2", spans[i])}>
              <Link href={`/shop?deity=${encodeURIComponent(d.deity)}`} className="group block h-full rounded-[2rem] bg-ink/[0.03] p-1.5 ring-1 ring-ink/[0.06] transition duration-700 ease-silk hover:ring-gold/40">
                <div className={cn("relative h-full overflow-hidden rounded-[calc(2rem-0.375rem)] shadow-inset", i === 0 ? "bg-ink" : i % 3 === 1 ? "bg-maroon" : "bg-gradient-to-b from-[#FBF6EC] to-ivory-2")}>
                  <div className={cn("absolute inset-0", i === 0 || i % 3 === 1 ? "bg-[radial-gradient(circle_at_70%_60%,rgba(201,162,74,0.35),transparent_55%)]" : "bg-[radial-gradient(circle_at_70%_60%,rgba(233,204,122,0.5),transparent_60%)]")} />
                  <img src={d.image} alt="" loading="lazy" className={cn("absolute bottom-0 right-[4%] object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.35)] transition-transform duration-1000 ease-silk group-hover:-translate-y-2 group-hover:scale-105", i === 0 ? "h-[82%] max-w-[62%]" : "h-[78%] max-w-[55%]")} />
                  <div className="relative flex h-full flex-col justify-between p-5 md:p-7">
                    <p className={cn("font-deva text-lg md:text-xl", i === 0 || i % 3 === 1 ? "text-gold/80" : "text-maroon/70")}>{DEVA[d.deity] ?? ""}</p>
                    <div>
                      <h3 className={cn("font-display tracking-tight", i === 0 ? "text-4xl text-ivory md:text-6xl" : "text-2xl md:text-3xl", i !== 0 && (i % 3 === 1 ? "text-ivory" : "text-ink"))}>{d.deity}</h3>
                      <p className={cn("mt-1 text-xs", i === 0 || i % 3 === 1 ? "text-ivory/55" : "text-ink/50")}>{d.count} idol{d.count > 1 ? "s" : ""} →</p>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Experience({ copy, idols, scenes }: { copy: HomeSettings["experience"]; idols: HeroIdol[]; scenes: SceneData[] }) {
  return (
    <section className="relative overflow-hidden bg-ivory-2/60 py-24 md:py-36">
      <div className="container grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl leading-[1.02] tracking-tight md:text-6xl">{copy.title}</h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink/60">{copy.subtitle}</p>
          <ExperienceFeatures />
          <StudioCta />
        </Reveal>
        <Reveal delay={0.1}>
          <ExperienceTeaser idols={idols} scenes={scenes} />
        </Reveal>
      </div>
    </section>
  );
}

export function Bestsellers({ products }: { products: PC[] }) {
  return (
    <section className="py-24 md:py-36">
      <div className="container">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Most loved</Eyebrow>
            <h2 className="mt-5 font-display text-4xl leading-[1.02] tracking-tight md:text-6xl">Chosen by devotees, <br className="hidden md:block" />again and again.</h2>
          </div>
          <ArrowLink href="/shop">View all idols</ArrowLink>
        </Reveal>
      </div>
      <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:px-[max(2rem,calc((100vw-1440px)/2+2rem))]">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i, 5) * 0.06} className="w-[72vw] shrink-0 snap-start sm:w-[300px]">
            <ProductCard p={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Dashboard({ copy, idol, scene }: { copy: HomeSettings["dashboard"]; idol: HeroIdol | null; scene: SceneData | undefined }) {
  const feats = [
    { Icon: ArrowsOutCardinal, t: "Dashboard-sized", d: "Compact footprints that never block your view." },
    { Icon: ShieldCheck, t: "Stable base", d: "Flat, steady bases made for daily drives." },
    { Icon: Sun, t: "Rich finish", d: "Painted and gilded details that look good in daylight." },
    { Icon: Car, t: "Gift for the road", d: "The perfect blessing for a new car." },
  ];
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-ivory md:py-36">
      <div className="container grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="order-2 lg:order-1">
          <div className="rounded-[2.2rem] bg-white/[0.04] p-2 ring-1 ring-white/10">
            {idol && scene && <IdolInScene scene={scene} idol={idol} className="aspect-[16/11] rounded-[calc(2.2rem-0.5rem)]" scale={1.35} />}
          </div>
        </Reveal>
        <Reveal className="order-1 lg:order-2" delay={0.1}>
          <Eyebrow dark>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl leading-[1.02] tracking-tight md:text-6xl">{copy.title}</h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/60">{copy.body}</p>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7">
            {feats.map(({ Icon, t, d }) => (
              <li key={t}>
                <Icon className="h-6 w-6 text-gold" weight="light" />
                <p className="mt-3 text-sm font-semibold">{t}</p>
                <p className="mt-1 text-xs leading-relaxed text-ivory/50">{d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <ArrowLink href="/shop?placement=car" dark>Shop dashboard idols</ArrowLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Craft({ copy, image }: { copy: HomeSettings["craft"]; image: string | null }) {
  return (
    <section className="py-24 md:py-36">
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <div className="rotate-[-2deg] rounded-[2.2rem] bg-ink/[0.04] p-2 ring-1 ring-ink/[0.06] max-md:rotate-0">
              <div className="aspect-[4/5] overflow-hidden rounded-[calc(2.2rem-0.5rem)] bg-white">
                {image && <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </div>
            </div>
            <div className="absolute -bottom-8 -right-2 rotate-[3deg] rounded-[1.6rem] bg-maroon p-6 text-ivory shadow-lift max-md:hidden md:-right-8">
              <p className="font-deva text-2xl text-gold">श्रद्धा</p>
              <p className="mt-1 text-xs text-ivory/60">Made with devotion</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl leading-[1.04] tracking-tight md:text-[3.4rem]">{copy.title}</h2>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink/60">{copy.body}</p>
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[1.6rem] bg-ink/10 ring-1 ring-ink/10">
            {copy.stats.map((s) => (
              <div key={s.label} className="bg-ivory p-6">
                <dt className="text-xs text-ink/50">{s.label}</dt>
                <dd className="mt-1 font-display text-4xl tracking-tight text-maroon">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="overflow-hidden bg-ivory-2/60 py-24 md:py-36">
      <div className="container">
        <Reveal className="text-center">
          <Eyebrow>Words of devotees</Eyebrow>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-[1.04] tracking-tight md:text-6xl">Blessings, delivered.</h2>
        </Reveal>
        <div className="mt-16 columns-1 gap-4 md:columns-2 lg:columns-3">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.08} className="mb-4 break-inside-avoid">
              <figure className="rounded-[1.8rem] bg-white p-7 shadow-soft ring-1 ring-ink/[0.05]">
                <div className="flex gap-0.5 text-gold">{Array.from({ length: t.rating }, (_, k) => <Star key={k} className="h-4 w-4" weight="fill" />)}</div>
                <blockquote className="mt-4 font-display text-xl leading-snug text-ink">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-maroon font-display text-gold-bright">
                    {t.avatar ? <img src={t.avatar} alt="" className="h-full w-full object-cover" /> : t.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-ink/50">{[t.location, t.source].filter(Boolean).join(" · ")}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Marketplaces({ copy }: { copy: HomeSettings["marketplaces"] }) {
  return (
    <section className="border-y border-ink/[0.07] py-16">
      <div className="container flex flex-col items-center gap-10 lg:flex-row lg:justify-between">
        <p className="max-w-sm text-center font-display text-2xl leading-snug lg:text-left">{copy.title}</p>
        <ul className="flex flex-wrap justify-center gap-3">
          {copy.items.map((m) => {
            const inner = (
              <>
                <span className="font-display text-2xl tracking-tight">{m.name}</span>
                <span className="text-[11px] text-ink/50">{[m.rating, m.note].filter(Boolean).join(" · ")}</span>
              </>
            );
            const cls = "flex min-w-[170px] flex-col items-center gap-1 rounded-[1.4rem] bg-white px-8 py-5 ring-1 ring-ink/[0.07] transition duration-500 ease-silk hover:-translate-y-1 hover:shadow-soft";
            return (
              <li key={m.name}>
                {m.url ? <a href={m.url} target="_blank" rel="noreferrer" className={cls}>{inner}</a> : <div className={cls}>{inner}</div>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Bulk({ copy }: { copy: HomeSettings["bulk"] }) {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-maroon via-maroon-deep to-ink p-10 text-ivory md:p-16">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(233,204,122,0.35),transparent)]" />
            <div className="relative grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
              <div>
                <Eyebrow dark>Wholesale · Corporate · Retail partners</Eyebrow>
                <h2 className="mt-5 font-display text-4xl leading-[1.04] tracking-tight md:text-6xl">{copy.title}</h2>
                <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ivory/65">{copy.body}</p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <ArrowLink href="/bulk-orders" dark>Request bulk pricing</ArrowLink>
                <a href="/spinex-catalogue-2026.pdf" target="_blank" className="inline-flex items-center gap-2 px-2 text-sm text-ivory/70 underline-offset-4 hover:text-ivory hover:underline">
                  <DownloadSimple className="h-4 w-4" /> Download 2026 catalogue (PDF)
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Faqs({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section className="py-24 md:py-32">
      <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-5 font-display text-4xl leading-[1.04] tracking-tight md:text-6xl">Before you bring them home.</h2>
          <p className="mt-6 text-sm text-ink/55">Still curious? <Link href="/contact" className="text-maroon underline decoration-gold underline-offset-4">Talk to us</Link>.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((f) => (
              <details key={f.id} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-xl text-ink transition hover:text-maroon">
                  {f.question}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-ink/10 transition-transform duration-500 ease-silk group-open:rotate-45 group-open:bg-ink group-open:text-ivory">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-ink/60">{f.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Newsletter({ copy }: { copy: HomeSettings["newsletter"] }) {
  return (
    <section className="pb-24 md:pb-32">
      <div className="container">
        <Reveal>
          <div className="flex flex-col items-center rounded-[2.4rem] bg-ivory-2 px-6 py-16 text-center ring-1 ring-ink/[0.06] md:py-20">
            <p className="font-deva text-xl text-maroon/70">शुभ समाचार</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">{copy.title}</h2>
            <p className="mt-3 max-w-md text-sm text-ink/55">{copy.body}</p>
            <div className="mt-8 flex w-full justify-center"><NewsletterForm dark={false} /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
