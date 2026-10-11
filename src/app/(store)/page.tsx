import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs, testimonials } from "@/db/schema";
import { getSetting } from "@/lib/settings";
import { listDeities, listProducts, type ProductCard } from "@/lib/catalog";
import { listScenes } from "@/lib/scenes";
import { Hero, type HeroIdol } from "@/components/store/home/hero";
import { ChooseSpace, GalleryWalk } from "@/components/store/home/interactive";
import * as S from "@/components/store/home/sections";

const toIdol = (p: ProductCard): HeroIdol => ({ id: p.id, stock: p.stock, slug: p.slug, name: p.name, deity: p.deity, price: p.price, cutout: p.cutout, heightCm: p.heightCm });

export default function HomePage() {
  const home = getSetting("home");
  const scenes = listScenes();
  const builtIn = scenes.filter((s) => s.kind !== "photo");
  let featured = listProducts({ slugs: home.hero.featured }).filter((p) => p.cutout);
  if (!featured.length) featured = listProducts({ featured: true, limit: 5 }).filter((p) => p.cutout);
  const all = listProducts({ sort: "featured" });
  const idols = all.filter((p) => p.cutout).map(toIdol);
  const dash = all.find((p) => p.slug === home.dashboard.productSlug) ?? featured[0];

  // CMS section keys map onto the gallery layout
  const render: Record<string, () => React.ReactNode> = {
    experience: () => builtIn.length > 0 && idols.length > 0 && <ChooseSpace scenes={builtIn} idols={idols} />,
    bestsellers: () => <GalleryWalk products={all.slice(0, 10)} />,
    deities: () => <S.DeityBento deities={listDeities()} />,
    craft: () => idols.length > 0 && <S.Statement idols={idols} />,
    dashboard: () => <S.TryBanner copy={home.dashboard} idol={dash ? toIdol(dash) : null} scene={builtIn.find((s) => s.kind === "car")} />,
    testimonials: () => <S.Testimonials items={db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(asc(testimonials.sortOrder)).all()} />,
    marketplaces: () => <S.Marketplaces copy={home.marketplaces} />,
    bulk: () => <S.Bulk copy={home.bulk} />,
    faq: () => <S.Faqs faqs={db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(asc(faqs.sortOrder)).all()} />,
    marquee: () => null,
    newsletter: () => null,
  };

  return (
    <>
      {featured.length > 0 && <Hero hero={home.hero} idols={featured.map(toIdol)} />}
      {home.sections.filter((s) => s.enabled && render[s.key]).map((s) => (
        <div key={s.key}>{render[s.key]()}</div>
      ))}
    </>
  );
}
