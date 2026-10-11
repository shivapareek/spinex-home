import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs, testimonials } from "@/db/schema";
import { getSetting } from "@/lib/settings";
import { listDeities, listProducts, type ProductCard } from "@/lib/catalog";
import { listScenes } from "@/lib/scenes";
import { Hero, type HeroIdol } from "@/components/store/home/hero";
import * as S from "@/components/store/home/sections";

const toIdol = (p: ProductCard): HeroIdol => ({ slug: p.slug, name: p.name, deity: p.deity, price: p.price, cutout: p.cutout, heightCm: p.heightCm });

export default function HomePage() {
  const home = getSetting("home");
  const scenes = listScenes();
  const builtIn = scenes.filter((s) => s.kind !== "photo");
  let featured = listProducts({ slugs: home.hero.featured }).filter((p) => p.cutout);
  if (!featured.length) featured = listProducts({ featured: true, limit: 5 }).filter((p) => p.cutout);
  const heroIdols = featured.map(toIdol);
  const heroScenes = builtIn.filter((s) => ["car", "temple", "desk"].includes(s.kind));
  const dashProduct = listProducts({ slugs: [home.dashboard.productSlug] })[0] ?? featured[0];

  const render: Record<string, () => React.ReactNode> = {
    marquee: () => <S.Marquee words={home.marquee} />,
    deities: () => <S.Deities deities={listDeities()} />,
    experience: () => heroIdols.length > 0 && builtIn.length > 0 && <S.Experience copy={home.experience} idols={heroIdols} scenes={builtIn} />,
    bestsellers: () => <S.Bestsellers products={listProducts({ sort: "featured", limit: 10 })} />,
    dashboard: () => <S.Dashboard copy={home.dashboard} idol={dashProduct ? toIdol(dashProduct) : null} scene={builtIn.find((s) => s.kind === "car")} />,
    craft: () => <S.Craft copy={home.craft} image="/uploads/products/adiyogi-trishul-damru.webp" />,
    testimonials: () => <S.Testimonials items={db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(asc(testimonials.sortOrder)).all()} />,
    marketplaces: () => <S.Marketplaces copy={home.marketplaces} />,
    bulk: () => <S.Bulk copy={home.bulk} />,
    faq: () => <S.Faqs faqs={db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(asc(faqs.sortOrder)).all()} />,
    newsletter: () => <S.Newsletter copy={home.newsletter} />,
  };

  return (
    <>
      {heroIdols.length > 0 && heroScenes.length > 0 && <Hero hero={home.hero} idols={heroIdols} scenes={heroScenes} />}
      {home.sections.filter((s) => s.enabled && render[s.key]).map((s) => (
        <div key={s.key}>{render[s.key]()}</div>
      ))}
    </>
  );
}
