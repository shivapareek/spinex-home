import Link from "next/link";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge, Card, EmptyState, Field, Input, PageHeader, Select, Textarea, Thumb } from "@/components/admin/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/client";
import { FilterTabs, Pager, Stars, qs } from "@/components/admin/commerce/bits";
import { addReview, deleteReview, setReviewApproved } from "./actions";

export const metadata = { title: "Reviews" };

const PER_PAGE = 30;
type SP = Promise<{ status?: string; page?: string }>;

export default async function ReviewsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.status === "approved" || sp.status === "all" ? sp.status : "pending";
  const where = status === "all" ? undefined : eq(reviews.isApproved, status === "approved");

  const counts = db.select({ approved: reviews.isApproved, n: sql<number>`count(*)` }).from(reviews).groupBy(reviews.isApproved).all();
  const pendingN = Number(counts.find((c) => !c.approved)?.n ?? 0);
  const approvedN = Number(counts.find((c) => c.approved)?.n ?? 0);
  const total = status === "all" ? pendingN + approvedN : status === "approved" ? approvedN : pendingN;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));

  const rows = db
    .select({ r: reviews, productName: products.name, images: products.images, cutout: products.cutout })
    .from(reviews)
    .leftJoin(products, eq(products.id, reviews.productId))
    .where(where)
    .orderBy(desc(reviews.createdAt))
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE)
    .all();
  const productOptions = db.select({ id: products.id, name: products.name }).from(products).orderBy(asc(products.name)).all();

  return (
    <>
      <PageHeader title="Reviews" description="Approve what customers say before it appears on product pages." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="mb-5">
            <FilterTabs
              tabs={[
                { label: "Pending", href: `/admin/reviews`, active: status === "pending", count: pendingN },
                { label: "Approved", href: `/admin/reviews${qs({ status: "approved" })}`, active: status === "approved", count: approvedN },
                { label: "All", href: `/admin/reviews${qs({ status: "all" })}`, active: status === "all", count: pendingN + approvedN },
              ]}
            />
          </div>
          {rows.length === 0 ? (
            <EmptyState
              title={status === "pending" ? "Nothing waiting for approval" : "No reviews yet"}
              body={status === "pending" ? "New reviews from customers land here first. You're all caught up." : "Reviews customers leave — and ones you add manually — will show up here."}
            />
          ) : (
            <ul className="space-y-3">
              {rows.map(({ r, productName, images, cutout }) => (
                <li key={r.id} className="rounded-[1.5rem] bg-white p-5 ring-1 ring-ink/[0.06]">
                  <div className="flex items-start gap-4">
                    <Thumb src={images?.[0] ?? cutout} alt={productName ?? ""} className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Stars value={r.rating} />
                        {r.isApproved ? <Badge tone="green">Published</Badge> : <Badge tone="gold">Pending</Badge>}
                        {r.userId ? <Badge tone="blue">Account</Badge> : null}
                      </div>
                      {r.title && <p className="mt-2 font-display text-lg leading-snug text-ink">{r.title}</p>}
                      {r.body && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink/70">{r.body}</p>}
                      <p className="mt-3 text-xs text-ink/45">
                        <span className="font-medium text-ink/70">{r.name}</span>
                        {r.city ? ` · ${r.city}` : ""} · {formatDate(r.createdAt)} · on{" "}
                        {productName ? <Link href={`/admin/products/${r.productId}`} className="text-maroon hover:underline">{productName}</Link> : <span className="italic">deleted product</span>}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-1.5 border-t border-ink/[0.05] pt-3">
                    {r.isApproved ? (
                      <ActionButton action={setReviewApproved.bind(null, r.id, false)} variant="secondary">Unpublish</ActionButton>
                    ) : (
                      <ActionButton action={setReviewApproved.bind(null, r.id, true)} variant="primary">Approve</ActionButton>
                    )}
                    <ActionButton action={deleteReview.bind(null, r.id)} confirm={`Delete this review by ${r.name}? This can't be undone.`} className="text-sindoor hover:bg-sindoor/10 hover:text-sindoor">
                      Delete
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Pager page={page} pages={pages} href={(p) => `/admin/reviews${qs({ status: status === "pending" ? undefined : status, page: p })}`} />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card title="Add a review" description="Record a verified review received elsewhere — WhatsApp, a marketplace, in person. Published immediately.">
            <ActionForm action={addReview} resetOnSuccess className="space-y-4">
              <Field label="Product">
                <Select name="productId" required defaultValue="">
                  <option value="" disabled>Choose a product…</option>
                  {productOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name"><Input name="name" required maxLength={80} /></Field>
                <Field label="City"><Input name="city" maxLength={60} /></Field>
              </div>
              <Field label="Rating">
                <Select name="rating" defaultValue="5">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)} · {n}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Title"><Input name="title" maxLength={120} placeholder="Beautiful finish" /></Field>
              <Field label="Review"><Textarea name="body" maxLength={2000} /></Field>
              <SubmitButton className="w-full">Add review</SubmitButton>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
