import Link from "next/link";
import { and, asc, desc, eq, gte, lte, notInArray, sql } from "drizzle-orm";
import {
  ArrowRight, ArrowSquareOut, Package, Plus, Receipt, Ticket, GearSix, WarningCircle, Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { formatDate, inr } from "@/lib/utils";
import { Badge, Card, LinkButton, PageHeader, StatCard, Table, Thumb, orderStatusTone, td } from "@/components/admin/ui";
import { istDay } from "@/components/admin/commerce/helpers";
import { RevenueChart, type RevenuePoint } from "./_dashboard/revenue-chart";

export const metadata = { title: "Dashboard" };

const NOT_COUNTED = ["cancelled", "returned"] as const;

export default async function Dashboard() {
  const session = await requireAdmin();
  const commerce = getSetting("commerce");

  // 30-day window, bucketed by IST calendar day
  const today = istDay(new Date());
  const startDay = istDay(new Date(Date.now() - 29 * 86_400_000));
  const since = new Date(startDay + "T00:00:00.000+05:30").toISOString();

  const counted = and(gte(orders.createdAt, since), notInArray(orders.status, [...NOT_COUNTED]));
  const rev = db
    .select({ sum: sql<number>`coalesce(sum(${orders.total}), 0)`, n: sql<number>`count(*)` })
    .from(orders)
    .where(counted)
    .get();
  const revenue = Number(rev?.sum ?? 0);
  const paidOrders = Number(rev?.n ?? 0);
  const orders30 = Number(db.select({ n: sql<number>`count(*)` }).from(orders).where(gte(orders.createdAt, since)).get()?.n ?? 0);
  const pending = Number(db.select({ n: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending")).get()?.n ?? 0);
  const aov = paidOrders ? Math.round(revenue / paidOrders / 100) * 100 : 0;

  const dayExpr = sql<string>`date(${orders.createdAt}, '+330 minutes')`;
  const byDay = db
    .select({ day: dayExpr, revenue: sql<number>`sum(${orders.total})`, n: sql<number>`count(*)` })
    .from(orders)
    .where(counted)
    .groupBy(dayExpr)
    .all();
  const map = new Map(byDay.map((r) => [r.day, r]));
  const series: RevenuePoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = istDay(new Date(new Date(today + "T12:00:00+05:30").getTime() - i * 86_400_000));
    const r = map.get(day);
    series.push({
      day,
      label: new Date(day + "T12:00:00+05:30").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }),
      revenue: Math.round(Number(r?.revenue ?? 0) / 100),
      orders: Number(r?.n ?? 0),
    });
  }

  const recent = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8).all();

  const lowStock = db
    .select({ id: products.id, name: products.name, sku: products.sku, stock: products.stock, images: products.images, cutout: products.cutout })
    .from(products)
    .where(and(lte(products.stock, commerce.lowStockThreshold), eq(products.isActive, true)))
    .orderBy(asc(products.stock), asc(products.name))
    .limit(8)
    .all();
  const lowStockCount = Number(
    db.select({ n: sql<number>`count(*)` }).from(products).where(and(lte(products.stock, commerce.lowStockThreshold), eq(products.isActive, true))).get()?.n ?? 0,
  );

  const qty = sql<number>`sum(${orderItems.quantity})`;
  const top = db
    .select({
      productId: orderItems.productId,
      name: orderItems.name,
      image: sql<string | null>`max(${orderItems.image})`,
      qty,
      revenue: sql<number>`sum(${orderItems.price} * ${orderItems.quantity})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(notInArray(orders.status, [...NOT_COUNTED]))
    .groupBy(orderItems.productId, orderItems.name)
    .orderBy(desc(qty))
    .limit(5)
    .all();
  const topMax = Math.max(1, ...top.map((t) => Number(t.qty)));

  const hour = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greet}, ${session.name.split(" ")[0]}`}
        description="Here's how Spinex Home is doing over the last 30 days."
        actions={
          <>
            <LinkButton href="/admin/orders" variant="secondary">View orders</LinkButton>
            <LinkButton href="/admin/products/new"><Plus weight="light" className="h-4 w-4" /> New product</LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue · 30 days" value={inr(revenue)} hint="Excludes cancelled & returned" />
        <StatCard label="Orders · 30 days" value={orders30.toLocaleString("en-IN")} hint={`${paidOrders} fulfilled or in progress`} />
        <StatCard label="Avg. order value" value={inr(aov)} hint={paidOrders ? `Across ${paidOrders} orders` : "No orders yet"} />
        <StatCard accent label="Pending orders" value={pending} hint={pending ? "Waiting to be confirmed" : "You're all caught up"} />
      </div>

      <Card className="mt-6" title="Revenue" description={`Daily revenue, ${series[0].label} – ${series[series.length - 1].label}`}>
        <RevenueChart data={series} />
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Recent orders</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-medium text-maroon hover:underline">
              All orders <ArrowRight weight="light" className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Table
            head={["Order", "Customer", "Total", "Payment", "Status"]}
            empty={
              <div>
                <Receipt weight="light" className="mx-auto h-8 w-8 text-gold" />
                <p className="mt-3 font-display text-lg text-ink">No orders yet</p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-ink/50">When a devotee checks out, their order will appear here instantly.</p>
              </div>
            }
          >
            {recent.map((o) => (
              <tr key={o.id} className="transition hover:bg-ivory/40">
                <td className={td}>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-maroon">#{o.orderNumber}</Link>
                  <p className="text-[11px] text-ink/45">{formatDate(o.createdAt, true)}</p>
                </td>
                <td className={td}>
                  <p className="max-w-[180px] truncate">{o.shippingAddress?.name}</p>
                  <p className="max-w-[180px] truncate text-[11px] text-ink/45">{o.shippingAddress?.city}</p>
                </td>
                <td className={`${td} font-medium tabular-nums`}>{inr(o.total)}</td>
                <td className={td}>
                  <Badge tone={orderStatusTone[o.paymentStatus]}>{o.paymentMethod === "cod" ? "COD" : "Online"} · {o.paymentStatus}</Badge>
                </td>
                <td className={td}><Badge tone={orderStatusTone[o.status]}>{o.status}</Badge></td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="space-y-6">
          <Card
            title="Low stock"
            description={`Active products at or below ${commerce.lowStockThreshold} units`}
            actions={lowStockCount > 0 ? <Badge tone="red">{lowStockCount}</Badge> : <Badge tone="green">Healthy</Badge>}
          >
            {lowStock.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-tulsi/[0.06] px-4 py-4 text-sm text-tulsi">
                <Package weight="light" className="h-5 w-5 shrink-0" /> Every product is well stocked.
              </div>
            ) : (
              <ul className="-my-2 divide-y divide-ink/[0.05]">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 py-2.5 transition hover:text-maroon">
                      <Thumb src={p.images[0] ?? p.cutout} className="h-10 w-10" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{p.name}</span>
                        {p.sku && <span className="block text-[11px] text-ink/40">{p.sku}</span>}
                      </span>
                      <Badge tone={p.stock <= 0 ? "red" : "gold"}>{p.stock <= 0 ? "Out" : `${p.stock} left`}</Badge>
                    </Link>
                  </li>
                ))}
                {lowStockCount > lowStock.length && (
                  <li className="pt-3">
                    <Link href="/admin/products?status=low" className="text-xs font-medium text-maroon hover:underline">
                      View all {lowStockCount} →
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </Card>

          <Card title="Top sellers" description="By units sold, all time">
            {top.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-ivory/60 px-4 py-4 text-sm text-ink/55">
                <Trophy weight="light" className="h-5 w-5 shrink-0 text-gold-deep" /> Bestsellers will rank here after your first orders.
              </div>
            ) : (
              <ol className="space-y-3">
                {top.map((t, i) => (
                  <li key={`${t.productId}-${t.name}`} className="flex items-center gap-3">
                    <span className="w-4 font-display text-sm text-gold-deep">{i + 1}</span>
                    <Thumb src={t.image} className="h-10 w-10" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        {t.productId ? (
                          <Link href={`/admin/products/${t.productId}`} className="truncate text-sm hover:text-maroon">{t.name}</Link>
                        ) : (
                          <span className="truncate text-sm">{t.name}</span>
                        )}
                        <span className="shrink-0 text-xs tabular-nums text-ink/50">{Number(t.qty)} sold</span>
                      </span>
                      <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-ink/[0.06]">
                        <span className="block h-full rounded-full bg-gradient-to-r from-maroon to-gold" style={{ width: `${(Number(t.qty) / topMax) * 100}%` }} />
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Quick links">
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/admin/products/new", label: "Add product", icon: Plus },
                { href: "/admin/orders?status=pending", label: "Pending orders", icon: WarningCircle },
                { href: "/admin/coupons/new", label: "New coupon", icon: Ticket },
                { href: "/admin/settings", label: "Settings", icon: GearSix },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="group flex items-center gap-2.5 rounded-2xl bg-ivory/60 px-3.5 py-3 text-[13px] text-ink/75 ring-1 ring-ink/[0.04] transition-all duration-300 ease-silk hover:bg-white hover:text-maroon hover:ring-gold/40">
                  <Icon weight="light" className="h-[18px] w-[18px] text-gold-deep" /> {label}
                </Link>
              ))}
              <Link href="/" target="_blank" className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-ink px-3.5 py-3 text-[13px] text-ivory transition-all duration-300 ease-silk hover:bg-maroon">
                <ArrowSquareOut weight="light" className="h-4 w-4 text-gold" /> View storefront
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
