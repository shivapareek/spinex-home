import Link from "next/link";
import { ArrowRight, DownloadSimple, Plus, Star, Check } from "@phosphor-icons/react/dist/ssr";
import type { HomeSettings } from "@/lib/settings";
import type { ProductCard as PC } from "@/lib/catalog";
import type { Faq, Testimonial } from "@/db/schema";
import { ProductCard } from "@/components/store/product-card";
import { IdolInScene, type SceneData } from "@/components/visualizer/idol-in-scene";
import { Reveal, SectionHead } from "@/components/store/reveal";
import { ExperienceTeaser } from "./experience-teaser";
import type { HeroIdol } from "./hero";

/** Slim strip of deity names under the hero. */
export function Marquee({ words }: { words: string[] }) {
  const row = [...words, ...words, ...words];
  return (
    <section aria-label="Deities" className="overflow-hidden border-y border-line bg-white py-4">
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap text-sm text-muted">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-8">{w}<span className="h-1 w-1 rounded-full bg-accent" /></span>
        ))}
      </div>
    </section>
  );
}

/** Four big tiles — each shows a real idol inside that space. */
export function ShopBySpace({ scenes, idols }: { scenes: SceneData[]; idols: HeroIdol[] }) {
  const pick: Record<string, string> = { car: "krishna-ji-flute", temple: "hanuman-ji-kitab", desk: "meditation-adiyogi", shelf: "radha-krishna-cow" };
  const label: Record<string, string> = { car: "Car dashboard", temple: "Home mandir", desk: "Work desk", shelf: "Living room" };
  return (
    <section className="container py-14 md:py-20">
      <SectionHead eyebrow="Shop by space" title="Where will your idol live?" sub="Every idol is chosen for the place it sits — tap a space to see what fits." />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {scenes.slice(0, 4).map((s, i) => {
          const idol = idols.find((d) => d.slug === pick[s.kind]) ?? idols[i % idols.length];
          return (
            <Reveal key={s.key} delay={i * 0.05}>
              <Link href={`/shop?placement=${s.kind === "photo" ? "" : s.kind}`} className="group block">
                <div className="overflow-hidden rounded-2xl">
                  <IdolInScene scene={s} idol={idol} className="aspect-[4/5] transition-transform duration-700 ease-silk group-hover:scale-[1.03]" scale={1.15} animated={false} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[15px] font-medium">{label[s.kind] ?? s.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export function Deities({ deities }: { deities: { deity: string; count: number; image: string }[] }) {
  return (
    <section className="container py-14 md:py-20">
      <SectionHead eyebrow="Shop by deity" title="Find your deity" href="/shop" cta="All idols" />
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:px-0 lg:grid-cols-8">
        {deities.slice(0, 8).map((d) => (
          <Link key={d.deity} href={`/shop?deity=${encodeURIComponent(d.deity)}`} className="group flex w-24 shrink-0 flex-col items-center text-center md:w-auto">
            <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-surface transition group-hover:bg-accent-soft">
              <img src={d.image} alt="" loading="lazy" className="absolute inset-[14%] h-[72%] w-[72%] object-contain transition-transform duration-500 ease-silk group-hover:scale-110" />
            </span>
            <span className="mt-3 text-sm font-medium">{d.deity}</span>
            <span className="text-xs text-muted">{d.count} idol{d.count > 1 ? "s" : ""}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Experience({ copy, idols, scenes }: { copy: HomeSettings["experience"]; idols: HeroIdol[]; scenes: SceneData[] }) {
  const steps = ["Pick any idol", "Choose car, mandir or desk — or use your camera", "Drag, resize, then download or share"];
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <p className="eyebrow mb-2">{copy.eyebrow}</p>
          <h2 className="text-[28px] font-semibold leading-tight md:text-4xl">{copy.title}</h2>
          <p className="mt-3 max-w-md text-[15px] leading-7 text-muted">{copy.subtitle}</p>
          <ol className="mt-8 space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold shadow-card">{i + 1}</span>
                <span className="text-[15px]">{s}</span>
              </li>
            ))}
          </ol>
          <Link href="/experience" className="btn-accent mt-8 h-12 px-7">Try it now <ArrowRight className="h-4 w-4" /></Link>
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
    <section className="container py-14 md:py-20">
      <SectionHead eyebrow="Bestsellers" title="Most loved idols" href="/shop" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 lg:grid-cols-4">
        {products.slice(0, 8).map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}
      </div>
    </section>
  );
}

export function Dashboard({ copy, idol, scene }: { copy: HomeSettings["dashboard"]; idol: HeroIdol | null; scene: SceneData | undefined }) {
  const points = ["Compact — never blocks your view", "Flat, stable base for daily drives", "A thoughtful gift for a new car"];
  return (
    <section className="container py-14 md:py-20">
      <div className="grid overflow-hidden rounded-[28px] border border-line lg:grid-cols-2">
        <div className="relative min-h-[320px]">
          {idol && scene && <IdolInScene scene={scene} idol={idol} className="absolute inset-0" scale={1.3} />}
        </div>
        <div className="flex flex-col justify-center p-8 md:p-14">
          <p className="eyebrow mb-2">{copy.eyebrow}</p>
          <h2 className="text-[28px] font-semibold leading-tight md:text-4xl">{copy.title}</h2>
          <p className="mt-3 text-[15px] leading-7 text-muted">{copy.body}</p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px]"><span className="grid h-6 w-6 place-items-center rounded-full bg-accent-soft"><Check className="h-3.5 w-3.5 text-accent" weight="bold" /></span>{p}</li>
            ))}
          </ul>
          <Link href="/shop?placement=car" className="btn-primary mt-8 w-max">Shop car idols <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}

export function Craft({ copy, image }: { copy: HomeSettings["craft"]; image: string | null }) {
  return (
    <section className="container py-14 md:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="aspect-[4/3] overflow-hidden rounded-[28px] bg-surface">
            {image && <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="eyebrow mb-2">{copy.eyebrow}</p>
          <h2 className="text-[28px] font-semibold leading-tight md:text-4xl">{copy.title}</h2>
          <p className="mt-3 max-w-lg text-[15px] leading-7 text-muted">{copy.body}</p>
          <dl className="mt-8 grid grid-cols-2 gap-3">
            {copy.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line p-5">
                <dd className="text-3xl font-semibold tracking-tight">{s.value}</dd>
                <dt className="mt-1 text-sm text-muted">{s.label}</dt>
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
    <section className="bg-surface py-16 md:py-24">
      <div className="container">
        <SectionHead eyebrow="Reviews" title="What customers say" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure key={t.id} className="rounded-2xl bg-white p-6 shadow-card">
              <div className="flex gap-0.5 text-accent">{Array.from({ length: t.rating }, (_, k) => <Star key={k} className="h-4 w-4" weight="fill" />)}</div>
              <blockquote className="mt-3 text-[15px] leading-7">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-surface text-sm font-semibold">
                  {t.avatar ? <img src={t.avatar} alt="" className="h-full w-full object-cover" /> : t.name.slice(0, 1)}
                </span>
                <span>
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block text-xs text-muted">{[t.location, t.source].filter(Boolean).join(" · ")}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Marketplaces({ copy }: { copy: HomeSettings["marketplaces"] }) {
  return (
    <section className="border-y border-line py-10">
      <div className="container flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <p className="text-sm font-medium text-muted">{copy.title}</p>
        <ul className="flex flex-wrap justify-center gap-3">
          {copy.items.map((m) => {
            const inner = (
              <>
                <span className="text-lg font-semibold tracking-tight">{m.name}</span>
                {m.rating && <span className="text-xs text-muted">{m.rating}</span>}
              </>
            );
            const cls = "flex min-w-[140px] items-center justify-center gap-2 rounded-full border border-line px-6 py-3 transition hover:border-ink";
            return <li key={m.name}>{m.url ? <a href={m.url} target="_blank" rel="noreferrer" className={cls}>{inner}</a> : <div className={cls}>{inner}</div>}</li>;
          })}
        </ul>
      </div>
    </section>
  );
}

export function Bulk({ copy }: { copy: HomeSettings["bulk"] }) {
  return (
    <section className="container py-14 md:py-20">
      <div className="flex flex-col items-start justify-between gap-8 rounded-[28px] bg-ink p-8 text-white md:flex-row md:items-center md:p-14">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-white/60">Bulk & corporate orders</p>
          <h2 className="text-[28px] font-semibold leading-tight md:text-4xl">{copy.title}</h2>
          <p className="mt-3 text-[15px] leading-7 text-white/70">{copy.body}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/bulk-orders" className="btn h-12 bg-white px-7 text-ink hover:bg-white/90">Get bulk pricing <ArrowRight className="h-4 w-4" /></Link>
          <a href="/spinex-catalogue-2026.pdf" target="_blank" className="inline-flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white"><DownloadSimple className="h-4 w-4" /> Download catalogue (PDF)</a>
        </div>
      </div>
    </section>
  );
}

export function Faqs({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section className="container py-14 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow mb-2">FAQ</p>
          <h2 className="text-[28px] font-semibold leading-tight md:text-4xl">Questions? Answered.</h2>
          <p className="mt-3 text-[15px] text-muted">Can't find what you need? <Link href="/contact" className="font-medium text-ink underline underline-offset-4">Contact us</Link></p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.id} className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-medium">
                {f.question}
                <Plus className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="max-w-2xl pb-5 text-[15px] leading-7 text-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Newsletter lives in the footer in the white design; kept for CMS compatibility. */
export function Newsletter(_: { copy: HomeSettings["newsletter"] }) {
  return null;
}
