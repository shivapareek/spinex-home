import Link from "next/link";
import { and, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, Table, orderStatusTone, td } from "@/components/admin/ui";
import { FilterTabs, Pager, SearchForm, qs } from "@/components/admin/commerce/bits";

export const metadata = { title: "Enquiries" };

const PER_PAGE = 30;
const STATUSES = ["new", "contacted", "closed"] as const;
type SP = Promise<{ type?: string; status?: string; q?: string; page?: string }>;

export default async function EnquiriesPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const type = sp.type === "bulk" || sp.type === "contact" ? sp.type : "";
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "") ? (sp.status as (typeof STATUSES)[number]) : "";
  const q = sp.q?.trim() ?? "";

  const where: SQL[] = [];
  if (type) where.push(eq(enquiries.type, type));
  if (status) where.push(eq(enquiries.status, status));
  if (q) {
    const t = `%${q}%`;
    where.push(or(like(enquiries.name, t), like(enquiries.email, t), like(enquiries.phone, t), like(enquiries.company, t), like(enquiries.city, t))!);
  }
  const w = where.length ? and(...where) : undefined;
  const total = Number(db.select({ n: sql<number>`count(*)` }).from(enquiries).where(w).get()?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const rows = db.select().from(enquiries).where(w).orderBy(desc(enquiries.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE).all();

  const counts = db.select({ type: enquiries.type, status: enquiries.status, n: sql<number>`count(*)` }).from(enquiries).groupBy(enquiries.type, enquiries.status).all();
  const all = counts.reduce((s, c) => s + Number(c.n), 0);
  const count = (f: (c: (typeof counts)[number]) => boolean) => counts.filter(f).reduce((s, c) => s + Number(c.n), 0);

  return (
    <>
      <PageHeader title="Enquiries" description="Bulk & gifting requests and contact-form messages. Reply fast — WhatsApp works best." />
      {all === 0 ? (
        <EmptyState title="No enquiries yet" body="Bulk order requests and contact form messages from the storefront will appear here." />
      ) : (
        <>
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <FilterTabs
              tabs={[
                { label: "All types", href: `/admin/enquiries${qs({ status, q })}`, active: !type, count: all },
                { label: "Bulk orders", href: `/admin/enquiries${qs({ type: "bulk", status, q })}`, active: type === "bulk", count: count((c) => c.type === "bulk") },
                { label: "Contact", href: `/admin/enquiries${qs({ type: "contact", status, q })}`, active: type === "contact", count: count((c) => c.type === "contact") },
              ]}
            />
            <SearchForm q={q} placeholder="Name, phone, company or city" keep={{ type, status }} />
          </div>
          <div className="mb-5">
            <FilterTabs
              tabs={[
                { label: "Any status", href: `/admin/enquiries${qs({ type, q })}`, active: !status },
                ...STATUSES.map((s) => ({ label: s, href: `/admin/enquiries${qs({ type, status: s, q })}`, active: status === s, count: count((c) => c.status === s && (!type || c.type === type)) })),
              ]}
            />
          </div>
          <Table head={["From", "Type", "Details", "Received", "Status"]} empty={<span>No enquiries match. <Link href="/admin/enquiries" className="text-maroon underline">Clear filters</Link></span>}>
            {rows.map((e) => (
              <tr key={e.id} className="transition hover:bg-ivory/40">
                <td className={td}>
                  <Link href={`/admin/enquiries/${e.id}`} className="block hover:text-maroon">
                    <span className="flex items-center gap-2 font-medium">
                      {e.status === "new" && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-label="New" />}
                      {e.name}
                    </span>
                    <span className="block text-[11px] text-ink/45">{e.phone}{e.company ? ` · ${e.company}` : ""}</span>
                  </Link>
                </td>
                <td className={td}><Badge tone={e.type === "bulk" ? "maroon" : "neutral"}>{e.type === "bulk" ? "Bulk" : "Contact"}</Badge></td>
                <td className={td}>
                  <p className="max-w-[320px] truncate text-ink/65">
                    {e.quantity ? <span className="mr-1.5 font-medium text-ink">Qty {e.quantity}</span> : null}
                    {e.message ?? "—"}
                  </p>
                </td>
                <td className={`${td} whitespace-nowrap text-ink/55`}>{formatDate(e.createdAt, true)}</td>
                <td className={td}><Badge tone={orderStatusTone[e.status]}>{e.status}</Badge></td>
              </tr>
            ))}
          </Table>
          <Pager page={page} pages={pages} href={(p) => `/admin/enquiries${qs({ type, status, q, page: p })}`} />
        </>
      )}
    </>
  );
}
