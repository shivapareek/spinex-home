import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { Badge, EmptyState, LinkButton, PageHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/client";
import { GenuineNote, Stars } from "@/components/admin/cms/testimonial-bits";
import { deleteTestimonial, toggleTestimonial } from "./actions";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  await requireAdmin();
  const rows = db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), asc(testimonials.id)).all();
  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Customer words shown in the homepage testimonials section."
        actions={<LinkButton href="/admin/cms/testimonials/new">Add testimonial</LinkButton>}
      />
      <GenuineNote />
      {rows.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          body="Paste in a real review from Amazon, Flipkart or Instagram to build trust on the homepage."
          action={<LinkButton href="/admin/cms/testimonials/new">Add the first one</LinkButton>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((t) => (
            <article key={t.id} className="flex flex-col rounded-[1.5rem] bg-white p-5 ring-1 ring-ink/[0.06] transition duration-300 ease-silk hover:shadow-[0_20px_50px_-30px_rgba(20,10,12,0.3)]">
              <div className="flex items-center justify-between gap-2">
                <Stars n={t.rating} />
                {t.isActive ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>}
              </div>
              <Link href={`/admin/cms/testimonials/${t.id}`} className="mt-3 line-clamp-4 flex-1 font-display text-lg leading-snug text-ink hover:text-maroon">
                “{t.quote}”
              </Link>
              <div className="mt-4 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-maroon text-xs font-medium text-ivory">
                  {t.avatar ? <img src={t.avatar} alt="" className="h-full w-full object-cover" /> : t.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="truncate text-[11px] text-ink/50">{[t.location, t.source].filter(Boolean).join(" · ") || "—"}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-1 border-t border-ink/[0.06] pt-3">
                <LinkButton href={`/admin/cms/testimonials/${t.id}`} variant="ghost" size="sm">Edit</LinkButton>
                <ActionButton action={toggleTestimonial.bind(null, t.id)}>{t.isActive ? "Hide" : "Show"}</ActionButton>
                <ActionButton action={deleteTestimonial.bind(null, t.id)} confirm={`Delete the testimonial from ${t.name}?`} className="hover:text-sindoor">Delete</ActionButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
