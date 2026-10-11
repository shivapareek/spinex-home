import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";

const get = (slug: string) => db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.isPublished, true))).get();

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = get((await params).slug);
  return p ? { title: p.title, description: p.seoDescription ?? undefined } : {};
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = get((await params).slug);
  if (!p) notFound();
  return (
    <>
      <section className="bg-ink pb-16 pt-40 text-ivory">
        <div className="container max-w-3xl">
          <h1 className="font-display text-5xl tracking-tight md:text-7xl">{p.title}</h1>
          <p className="mt-4 text-xs text-ivory/40">Last updated {formatDate(p.updatedAt)}</p>
        </div>
      </section>
      <article className="container max-w-3xl py-20">
        <div className="prose-spx text-[16px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
      </article>
    </>
  );
}
