import { desc, gte, like, sql } from "drizzle-orm";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { EmptyState, PageHeader, StatCard, Table, buttonClass, td } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/client";
import { Pager, SearchForm, qs } from "@/components/admin/commerce/bits";
import { deleteSubscriber } from "./actions";

export const metadata = { title: "Subscribers" };

const PER_PAGE = 50;
type SP = Promise<{ q?: string; page?: string }>;

export default async function SubscribersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const where = q ? like(subscribers.email, `%${q}%`) : undefined;
  const all = Number(db.select({ n: sql<number>`count(*)` }).from(subscribers).get()?.n ?? 0);
  const recent = Number(db.select({ n: sql<number>`count(*)` }).from(subscribers).where(gte(subscribers.createdAt, new Date(Date.now() - 30 * 86_400_000).toISOString())).get()?.n ?? 0);
  const total = q ? Number(db.select({ n: sql<number>`count(*)` }).from(subscribers).where(where).get()?.n ?? 0) : all;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const rows = db.select().from(subscribers).where(where).orderBy(desc(subscribers.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE).all();

  return (
    <>
      <PageHeader
        title="Subscribers"
        description="People who joined the newsletter for festive drops and new idols."
        actions={
          all > 0 ? (
            <a href="/admin/subscribers/export" className={buttonClass("secondary")}>
              <DownloadSimple weight="light" className="h-4 w-4" /> Export CSV
            </a>
          ) : undefined
        }
      />
      {all === 0 ? (
        <EmptyState title="No subscribers yet" body="When visitors sign up through the newsletter form on the storefront, their emails collect here — ready to export to your mailing tool." />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:max-w-md">
            <StatCard label="Total" value={all.toLocaleString("en-IN")} />
            <StatCard label="Last 30 days" value={`+${recent}`} />
          </div>
          <div className="mb-5"><SearchForm q={q} placeholder="Search email" /></div>
          <Table head={["Email", "Subscribed", ""]} empty={`No subscribers match “${q}”.`}>
            {rows.map((s) => (
              <tr key={s.id} className="transition hover:bg-ivory/40">
                <td className={`${td} font-medium`}><a href={`mailto:${s.email}`} className="break-all hover:text-maroon">{s.email}</a></td>
                <td className={`${td} whitespace-nowrap text-ink/55`}>{formatDate(s.createdAt, true)}</td>
                <td className={`${td} text-right`}>
                  <ActionButton action={deleteSubscriber.bind(null, s.id)} confirm={`Remove ${s.email} from the list?`} className="text-sindoor hover:bg-sindoor/10 hover:text-sindoor">
                    Remove
                  </ActionButton>
                </td>
              </tr>
            ))}
          </Table>
          <Pager page={page} pages={pages} href={(p) => `/admin/subscribers${qs({ q, page: p })}`} />
        </>
      )}
    </>
  );
}
