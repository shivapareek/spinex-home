import { listProducts } from "@/lib/catalog";
import { listScenes } from "@/lib/scenes";
import { Studio } from "@/components/visualizer/studio";

export const metadata = {
  title: "Darshan Studio — see idols in your car, mandir & desk",
  description: "Place any Spinex idol on a car dashboard, in a home mandir or on your desk — or use your own camera — before you buy.",
};

export default async function ExperiencePage({ searchParams }: { searchParams: Promise<{ idol?: string; scene?: string }> }) {
  const sp = await searchParams;
  const products = listProducts({ sort: "featured" }).filter((p) => p.cutout);
  const scenes = listScenes();
  return (
    <section className="container pb-24 pt-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-2">Try before you buy</p>
          <h1 className="text-3xl font-semibold md:text-4xl">See any idol in your space</h1>
        </div>
        <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li><b className="font-semibold text-ink">1.</b> Choose a space or camera</li>
          <li><b className="font-semibold text-ink">2.</b> Pick an idol</li>
          <li><b className="font-semibold text-ink">3.</b> Drag, resize, download</li>
        </ol>
      </div>
      <Studio products={products.map((p) => ({ id: p.id, slug: p.slug, name: p.name, price: p.price, stock: p.stock, cutout: p.cutout, heightCm: p.heightCm, modelGlb: p.modelGlb, modelUsdz: p.modelUsdz }))} scenes={scenes} initialSlug={sp.idol} initialScene={sp.scene} />
    </section>
  );
}
