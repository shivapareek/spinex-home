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
      <section className="border-b border-line">
        <div className="container max-w-[720px] py-12 md:py-16">
          <h1 className="text-3xl font-semibold md:text-4xl">{p.title}</h1>
          <p className="mt-3 text-sm text-muted">Last updated {formatDate(p.updatedAt)}</p>
        </div>
      </section>
      <article className="container max-w-[720px] py-10 md:py-14">
        <div className="prose-spx break-words text-[16px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
      </article>
    </>
  );
}
