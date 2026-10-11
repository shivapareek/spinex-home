import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate, inr } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, Table, td } from "@/components/admin/ui";
import { FilterTabs, Pager, SearchForm, qs } from "@/components/admin/commerce/bits";

export const metadata = { title: "Customers" };

const PER_PAGE = 40;

type Row = {
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  registered: boolean;
  isActive: boolean;
  joined: string | null;
  orders: number;
  spent: number;
  lastOrder: string | null;
};

type SP = Promise<{ q?: string; type?: string; page?: string }>;

export default async function CustomersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = sp.q?.trim().toLowerCase() ?? "";
  const type = sp.type === "registered" || sp.type === "guest" ? sp.type : "";

  // Aggregate every order by email (spent excludes cancelled & returned)
  const agg = db
    .select({
      email: sql<string>`lower(${orders.email})`,
      orders: sql<number>`count(*)`,
      spent: sql<number>`coalesce(sum(case when ${orders.status} not in ('cancelled','returned') then ${orders.total} else 0 end), 0)`,
      lastOrder: sql<string>`max(${orders.createdAt})`,
      name: sql<string>`(select json_extract(o2.shipping_address, '$.name') from orders o2 where lower(o2.email) = lower(${orders.email}) order by o2.created_at desc limit 1)`,
      phone: sql<string>`(select o2.phone from orders o2 where lower(o2.email) = lower(${orders.email}) order by o2.created_at desc limit 1)`,
      city: sql<string>`(select json_extract(o2.shipping_address, '$.city') from orders o2 where lower(o2.email) = lower(${orders.email}) order by o2.created_at desc limit 1)`,
    })
    .from(orders)
    .groupBy(sql`lower(${orders.email})`)
    .all();
  const byEmail = new Map(agg.map((a) => [a.email, a]));

  const registered = db.select().from(users).where(eq(users.role, "customer")).all();
  const rows: Row[] = registered.map((u) => {
    const a = byEmail.get(u.email.toLowerCase());
    byEmail.delete(u.email.toLowerCase());
    return {
      email: u.email.toLowerCase(),
      name: u.name,
      phone: u.phone ?? a?.phone ?? null,
      city: u.address?.city ?? a?.city ?? null,
      registered: true,
      isActive: u.isActive,
      joined: u.createdAt,
      orders: Number(a?.orders ?? 0),
      spent: Number(a?.spent ?? 0),
      lastOrder: a?.lastOrder ?? null,
    };
  });
  for (const a of byEmail.values()) {
    rows.push({ email: a.email, name: a.name || a.email, phone: a.phone, city: a.city, registered: false, isActive: true, joined: null, orders: Number(a.orders), spent: Number(a.spent), lastOrder: a.lastOrder });
  }

  const all = rows.length;
  const counts = { registered: rows.filter((r) => r.registered).length, guest: rows.filter((r) => !r.registered).length };
  const filtered = rows
    .filter((r) => (type === "registered" ? r.registered : type === "guest" ? !r.registered : true))
    .filter((r) => !q || r.email.includes(q) || r.name.toLowerCase().includes(q) || (r.phone ?? "").includes(q))
    .sort((a, b) => (b.lastOrder ?? b.joined ?? "").localeCompare(a.lastOrder ?? a.joined ?? ""));
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const lifetime = rows.reduce((s, r) => s + r.spent, 0);

  return (
    <>
      <PageHeader
        title="Customers"
        description={all ? `${all} customers · ${inr(lifetime)} lifetime revenue. Guests are grouped by the email used at checkout.` : "Registered accounts and guest checkouts, in one place."}
      />
      {all === 0 ? (
        <EmptyState title="No customers yet" body="Shoppers appear here as soon as they create an account or place their first order as a guest." />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterTabs
              tabs={[
                { label: "All", href: `/admin/customers${qs({ q })}`, active: !type, count: all },
                { label: "Registered", href: `/admin/customers${qs({ q, type: "registered" })}`, active: type === "registered", count: counts.registered },
                { label: "Guests", href: `/admin/customers${qs({ q, type: "guest" })}`, active: type === "guest", count: counts.guest },
              ]}
            />
            <SearchForm q={q} placeholder="Name, email or phone" keep={{ type }} />
          </div>
          <Table head={["Customer", "Phone", "Type", "Orders", "Total spent", "Last order"]} empty={`No customers match “${q}”.`}>
            {shown.map((r) => (
              <tr key={r.email} className="transition hover:bg-surface">
                <td className={td}>
                  <Link href={`/admin/customers/${encodeURIComponent(r.email)}`} className="flex items-center gap-3 hover:text-accent-deep">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface font-semibold text-sm text-accent-deep">{(r.name || r.email).slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0">
                      <span className="block max-w-[220px] truncate font-medium">{r.name}</span>
                      <span className="block max-w-[220px] truncate text-[11px] text-ink/45">{r.email}</span>
                    </span>
                  </Link>
                </td>
                <td className={`${td} whitespace-nowrap text-ink/60`}>{r.phone ?? "—"}{r.city ? <span className="block text-[11px] text-ink/40">{r.city}</span> : null}</td>
                <td className={td}>
                  {r.registered ? <Badge tone={r.isActive ? "blue" : "neutral"}>{r.isActive ? "Registered" : "Disabled"}</Badge> : <Badge>Guest</Badge>}
                </td>
                <td className={`${td} tabular-nums`}>{r.orders}</td>
                <td className={`${td} whitespace-nowrap font-medium tabular-nums`}>{inr(r.spent)}</td>
                <td className={`${td} whitespace-nowrap text-ink/60`}>{r.lastOrder ? formatDate(r.lastOrder) : <span className="text-ink/35">Never</span>}</td>
              </tr>
            ))}
          </Table>
          <Pager page={page} pages={pages} href={(p) => `/admin/customers${qs({ q, type, page: p })}`} />
        </>
      )}
    </>
  );
}
