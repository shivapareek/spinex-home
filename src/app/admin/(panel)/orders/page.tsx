import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { ORDER_STATUSES, orders, type OrderStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate, inr } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, Table, buttonClass, orderStatusTone, td } from "@/components/admin/ui";
import { FilterTabs, Pager, SearchForm, qs } from "@/components/admin/commerce/bits";
import { orderFilters } from "./filters";

export const metadata = { title: "Orders" };

const PER_PAGE = 30;

type SP = Promise<{ status?: string; q?: string; page?: string }>;

export default async function OrdersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = ORDER_STATUSES.includes(sp.status as OrderStatus) ? sp.status : "";
  const q = sp.q?.trim() ?? "";
  const where = orderFilters({ status, q });

  const total = Number(db.select({ n: sql<number>`count(*)` }).from(orders).where(where).get()?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const rows = db
    .select({
      o: orders,
      items: sql<number>`(select coalesce(sum(quantity), 0) from order_items where order_items.order_id = ${orders.id})`,
    })
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE)
    .all();

  const counts = new Map(
    db
      .select({ status: orders.status, n: sql<number>`count(*)` })
      .from(orders)
      .groupBy(orders.status)
      .all()
      .map((r) => [r.status, Number(r.n)]),
  );
  const all = [...counts.values()].reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader
        title="Orders"
        description="Confirm, pack and ship orders. Cancelling or marking returned puts stock back automatically."
        actions={
          all > 0 ? (
            <a href={`/admin/orders/export${qs({ status, q })}`} className={buttonClass("secondary")}>
              <DownloadSimple weight="light" className="h-4 w-4" /> Export CSV
            </a>
          ) : undefined
        }
      />

      {all === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Orders placed on the storefront — prepaid or cash on delivery — will appear here, newest first."
        />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <FilterTabs
              tabs={[
                { label: "All", href: `/admin/orders${qs({ q })}`, active: !status, count: all },
                ...ORDER_STATUSES.map((s) => ({ label: s, href: `/admin/orders${qs({ status: s, q })}`, active: status === s, count: counts.get(s) ?? 0 })),
              ]}
            />
            <SearchForm q={q} placeholder="Order #, name, email or phone" keep={{ status }} />
          </div>

          <Table
            head={["Order", "Date", "Customer", "Items", "Total", "Payment", "Status"]}
            empty={
              <div>
                <p className="font-display text-lg text-ink">No orders match</p>
                <p className="mt-1">
                  {q ? <>Nothing found for “{q}”. </> : null}
                  <Link href="/admin/orders" className="text-maroon underline">Show all orders</Link>
                </p>
              </div>
            }
          >
            {rows.map(({ o, items }) => (
              <tr key={o.id} className="transition hover:bg-ivory/40">
                <td className={td}>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-maroon">#{o.orderNumber}</Link>
                  {o.couponCode && <p className="text-[11px] text-gold-deep">{o.couponCode}</p>}
                </td>
                <td className={`${td} whitespace-nowrap text-ink/60`}>{formatDate(o.createdAt, true)}</td>
                <td className={td}>
                  <p className="max-w-[200px] truncate">{o.shippingAddress?.name}</p>
                  <p className="max-w-[200px] truncate text-[11px] text-ink/45">{o.phone} · {o.shippingAddress?.city}</p>
                </td>
                <td className={`${td} tabular-nums`}>{Number(items)}</td>
                <td className={`${td} whitespace-nowrap font-medium tabular-nums`}>{inr(o.total)}</td>
                <td className={td}>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[11px] text-ink/50">{o.paymentMethod === "cod" ? "Cash on delivery" : "Razorpay"}</span>
                    <Badge tone={orderStatusTone[o.paymentStatus]}>{o.paymentStatus}</Badge>
                  </div>
                </td>
                <td className={td}><Badge tone={orderStatusTone[o.status]}>{o.status}</Badge></td>
              </tr>
            ))}
          </Table>
          <Pager page={page} pages={pages} href={(p) => `/admin/orders${qs({ status, q, page: p })}`} />
        </>
      )}
    </>
  );
}
