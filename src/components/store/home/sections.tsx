import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera, DownloadSimple, Plus, Star } from "@phosphor-icons/react/dist/ssr";
import type { HomeSettings } from "@/lib/settings";
import type { Faq, Testimonial } from "@/db/schema";
import { IdolInScene, type SceneData } from "@/components/visualizer/idol-in-scene";
import { Reveal } from "@/components/store/reveal";
import type { HeroIdol } from "./hero";
import { cn } from "@/lib/utils";

type Deity = { deity: string; count: number; image: string };

/** Asymmetric bento: one large tile + four smaller, each with its own tint. */
export function DeityBento({ deities, title }: { deities: Deity[]; title: string }) {
  const list = deities.slice(0, 5);
  const layout = [
    "col-span-2 row-span-2 bg-[#F3EDE4] md:col-span-2 md:row-span-2",
    "col-span-1 bg-[#E9EEF0]",
    "col-span-1 bg-accent-soft",
    "col-span-1 bg-[#EDEBF3]",
    "col-span-1 bg-ink text-white",
  ];
  return (
    <section className="container py-20 md:py-28">
      <div className="mb-10 flex items-end justify-between gap-6">
        <h2 className="max-w-lg text-3xl font-bold md:text-[44px] md:leading-[1.05]">{title}</h2>
        <Link href="/shop" className="group hidden items-center gap-1.5 text-sm font-semibold md:inline-flex">All idols <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
      </div>
      <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[230px] md:grid-cols-4 md:gap-4">
        {list.map((d, i) => (
          <Reveal key={d.deity} delay={i * 0.05} className={layout[i].split(" ").filter((c) => !c.startsWith("bg-") && !c.startsWith("text-")).join(" ")}>
            <Link href={`/shop?deity=${encodeURIComponent(d.deity)}`} className={cn("group relative block h-full overflow-hidden rounded-2xl", layout[i].split(" ").filter((c) => c.startsWith("bg-") || c.startsWith("text-")).join(" "))}>
              <img
                src={d.image}
                alt=""
                loading="lazy"
                className={cn("absolute bottom-0 right-2 object-contain object-bottom transition-transform duration-700 ease-silk group-hover:-translate-y-2 group-hover:scale-105", i === 0 ? "h-[72%] max-w-[64%]" : "h-[62%] max-w-[52%]")}
              />
              <div className="relative flex h-full flex-col justify-between p-5 md:p-6">
                <div>
                  <h3 className={cn("font-bold leading-none", i === 0 ? "text-4xl md:text-6xl" : "text-xl md:text-2xl")}>{d.deity}</h3>
                  <p className={cn("mt-2 text-sm", i === 4 ? "text-white/60" : "text-muted")}>{d.count} idol{d.count > 1 ? "s" : ""}</p>
                </div>
                <span className={cn("grid h-9 w-9 place-items-center rounded-full transition", i === 4 ? "bg-white/10 group-hover:bg-white group-hover:text-ink" : "bg-white group-hover:bg-ink group-hover:text-white")}>
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** A sentence with small idol images set inline between the words. */
export function Statement({ idols, copy }: { idols: HeroIdol[]; copy: HomeSettings["statement"] }) {
  const items = copy.items.filter((it) => it.word.trim());
  if (!items.length && !copy.tail.trim()) return null;
  const Pic = ({ slug }: { slug: string }) => {
    const d = idols.find((x) => x.slug === slug);
    if (!d?.cutout) return null;
    return (
      <span className="mx-1 inline-grid h-[0.95em] w-[1.25em] translate-y-[0.08em] place-items-center overflow-hidden rounded-full bg-surface align-baseline md:mx-2">
        <img src={d.cutout} alt={d.name} className="h-[85%] w-[85%] object-contain" />
      </span>
    );
  };
  return (
    <section className="container py-20 md:py-32">
      <Reveal>
        <p className="font-display text-[34px] font-bold leading-[1.12] tracking-[-0.035em] text-ink/90 md:text-[64px] md:leading-[1.08]" style={{ fontVariationSettings: '"wdth" 90' }}>
          {items.map((it, i) => (
            <span key={i}>
              {i > 0 && (i === items.length - 1 ? ", and " : ", ")}
              {it.word} <Pic slug={it.productSlug} /> {it.phrase}
            </span>
          ))}
          {items.length > 0 && ". "}
          {copy.tail && <span className="text-ink/30">{copy.tail}</span>}
        </p>
      </Reveal>
    </section>
  );
}

/** Full-bleed scene with a floating card: invites people to try the visualizer. */
export function TryBanner({ copy, idol, scene }: { copy: HomeSettings["tryBanner"]; idol: HeroIdol | null; scene: SceneData | undefined }) {
  if (!idol || !scene) return null;
  return (
    <section className="container py-10 md:py-16">
      <div className="relative">
        <IdolInScene scene={scene} idol={idol} className="aspect-[4/3] rounded-[28px] sm:aspect-[16/9] lg:aspect-[21/9]" scale={1.15} />
        {/* Below the photo on phones so it never hides the idol; floating card from sm up */}
        <div className="mt-3 rounded-2xl bg-surface p-6 sm:absolute sm:mt-0 sm:bg-white sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm md:bottom-10 md:left-10 md:p-8">
          <h2 className="text-2xl font-bold leading-tight md:text-[32px]">{copy.title}</h2>
          {copy.body && <p className="mt-3 text-[15px] leading-6 text-muted">{copy.body}</p>}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/experience?scene=car" className="btn-accent"><Camera className="h-4 w-4" /> Try in your space</Link>
            <Link href="/shop?placement=car" className="btn-outline">Car idols</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ items, title }: { items: Testimonial[]; title: string }) {
  if (!items.length) return null;
  return (
    <section className="container py-20 md:py-28">
      <h2 className="mb-10 text-3xl font-bold md:text-[44px]">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <figure key={t.id} className="rounded-2xl bg-surface p-6">
            <div className="flex gap-0.5 text-accent">{Array.from({ length: t.rating }, (_, k) => <Star key={k} className="h-4 w-4" weight="fill" />)}</div>
            <blockquote className="mt-3 line-clamp-3 text-[15px] leading-7">“{t.quote}”</blockquote>
            <figcaption className="mt-4 text-sm font-semibold">{t.name}<span className="font-normal text-muted">{t.location ? `, ${t.location}` : ""}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Marketplaces({ copy }: { copy: HomeSettings["marketplaces"] }) {
  return (
    <section className="container py-10">
      <div className="flex flex-col items-center justify-between gap-6 border-y border-line py-8 md:flex-row">
        <p className="text-sm text-muted">{copy.title}</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {copy.items.map((m) => (
            <li key={m.name}>
              {m.url ? (
                <a href={m.url} target="_blank" rel="noreferrer" className="font-display text-2xl font-bold tracking-tight text-ink/70 transition hover:text-ink">{m.name}</a>
              ) : (
                <span className="font-display text-2xl font-bold tracking-tight text-ink/70">{m.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Single saffron colour block for bulk / corporate buyers. */
export function Bulk({ copy }: { copy: HomeSettings["bulk"] }) {
  return (
    <section className="container py-10 md:py-16">
      <div className="relative overflow-hidden rounded-[28px] bg-accent px-6 py-12 text-white md:px-14 md:py-16">
        <div className="pointer-events-none absolute -right-10 bottom-0 select-none font-display text-[180px] font-extrabold uppercase leading-[0.8] tracking-[-0.06em] text-white/10 md:text-[300px]" aria-hidden>Bulk</div>
        <div className="relative max-w-xl">
          <h2 className="text-3xl font-bold leading-tight md:text-5xl">{copy.title}</h2>
          <p className="mt-4 text-[15px] leading-7 text-white/85">{copy.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bulk-orders" className="btn bg-white text-ink hover:bg-white/90">Get bulk pricing <ArrowRight className="h-4 w-4" /></Link>
            <a href="/spinex-catalogue-2026.pdf" target="_blank" className="btn border border-white/40 text-white hover:bg-white/10"><DownloadSimple className="h-4 w-4" /> Catalogue PDF</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faqs({ faqs, title = "Good to know." }: { faqs: Faq[]; title?: string }) {
  if (!faqs.length) return null;
  return (
    <section className="container py-20 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-3xl font-bold md:text-[44px] md:leading-[1.05]">{title}</h2>
          <p className="mt-3 text-[15px] text-muted">More questions? <Link href="/contact" className="font-semibold text-ink underline underline-offset-4">Contact us</Link></p>
        </div>
        <div className="space-y-2">
          {faqs.map((f) => (
            <details key={f.id} className="group rounded-2xl bg-surface px-5 transition-colors open:bg-[#F1EEE8] [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold">
                {f.question}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white transition-transform duration-300 group-open:rotate-45"><Plus className="h-4 w-4" /></span>
              </summary>
              <p className="max-w-2xl pb-5 text-[15px] leading-7 text-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
