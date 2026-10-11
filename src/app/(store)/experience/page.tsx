import { listProducts } from "@/lib/catalog";
import { listScenes } from "@/lib/scenes";
import { Studio } from "@/components/visualizer/studio";
import { Eyebrow } from "@/components/store/reveal";

export const metadata = {
  title: "Darshan Studio — see idols in your car, mandir & desk",
  description: "Place any Spinex idol on a car dashboard, in a home mandir or on your desk — or use your own camera — before you buy.",
};

export default async function ExperiencePage({ searchParams }: { searchParams: Promise<{ idol?: string; scene?: string }> }) {
  const sp = await searchParams;
  const products = listProducts({ sort: "featured" }).filter((p) => p.cutout);
  const scenes = listScenes();
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-ink pb-24 pt-32 text-ivory">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(94,18,36,0.7),transparent)]" />
      <div className="container relative">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow dark>Darshan Studio</Eyebrow>
            <h1 className="mt-5 font-display text-4xl leading-[1.02] tracking-tight md:text-6xl">
              See it in your space, <em className="text-gold-gradient">before</em> it arrives.
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ivory/55">Pick a space or use your camera, choose an idol, then drag, pinch and tilt. Download or share the view with family.</p>
        </div>
        <Studio products={products.map((p) => ({ id: p.id, slug: p.slug, name: p.name, price: p.price, stock: p.stock, cutout: p.cutout, heightCm: p.heightCm, modelGlb: p.modelGlb, modelUsdz: p.modelUsdz }))} scenes={scenes} initialSlug={sp.idol} initialScene={sp.scene} />
      </div>
    </section>
  );
}
