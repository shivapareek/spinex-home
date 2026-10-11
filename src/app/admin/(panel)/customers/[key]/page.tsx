import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, sql } from "drizzle-orm";
import { EnvelopeSimple, Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate, inr } from "@/lib/utils";
import { Badge, Card, PageHeader, StatCard, Table, orderStatusTone, td } from "@/components/admin/ui";
import { InfoRow } from "@/components/admin/commerce/bits";
import { waLink } from "@/components/admin/commerce/helpers";

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return { title: decodeURIComponent(key) };
}

const iconLink = "inline-flex h-9 w-9 items-center justify-center rounded-full bg-ivory text-ink/70 ring-1 ring-ink/[0.06] transition hover:bg-white hover:text-maroon hover:ring-gold/50";

export default async function CustomerDetail({ params }: { params: Promise<{ key: string }> }) {
  await requireAdmin();
  const email = decodeURIComponent((await params).key).trim().toLowerCase();
  const user = db.select().from(users).where(and(sql`lower(${users.email}) = ${email}`, eq(users.role, "customer"))).get();
  const list = db.select().from(orders).where(sql`lower(${orders.email}) = ${email}`).orderBy(desc(orders.createdAt)).all();
  if (!user && list.length === 0) notFound();

  const counted = list.filter((o) => o.status !== "cancelled" && o.status !== "returned");
  const spent = counted.reduce((s, o) => s + o.total, 0);
  const latest = list[0];
  const name = user?.name ?? latest?.shippingAddress?.name ?? email;
  const phone = user?.phone ?? latest?.phone ?? null;
  const address = user?.address ?? latest?.shippingAddress ?? null;

  return (
    <>
      <PageHeader
        title={name}
        description={email}
        back={{ href: "/admin/customers", label: "Customers" }}
        actions={user ? <Badge tone={user.isActive ? "blue" : "neutral"}>{user.isActive ? "Registered account" : "Disabled account"}</Badge> : <Badge>Guest checkout</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard accent label="Lifetime spend" value={inr(spent)} hint="Excludes cancelled & returned" />
        <StatCard label="Orders" value={list.length} hint={list.length !== counted.length ? `${list.length - counted.length} cancelled or returned` : undefined} />
        <StatCard label="Avg. order" value={inr(counted.length ? Math.round(spent / counted.length / 100) * 100 : 0)} hint={latest ? `Last ordered ${formatDate(latest.createdAt)}` : "No orders yet"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <h2 className="mb-3 font-display text-xl">Order history</h2>
          <Table head={["Order", "Date", "Total", "Payment", "Status"]} empty="This customer hasn't placed an order yet.">
            {list.map((o) => (
              <tr key={o.id} className="transition hover:bg-ivory/40">
                <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-maroon">#{o.orderNumber}</Link></td>
                <td className={`${td} whitespace-nowrap text-ink/60`}>{formatDate(o.createdAt, true)}</td>
                <td className={`${td} font-medium tabular-nums`}>{inr(o.total)}</td>
                <td className={td}><Badge tone={orderStatusTone[o.paymentStatus]}>{o.paymentMethod === "cod" ? "COD" : "Online"} · {o.paymentStatus}</Badge></td>
                <td className={td}><Badge tone={orderStatusTone[o.status]}>{o.status}</Badge></td>
              </tr>
            ))}
          </Table>
        </div>
        <div className="space-y-6">
          <Card title="Contact">
            <div className="-my-2 divide-y divide-ink/[0.05]">
              <InfoRow label="Email"><span className="break-all">{email}</span></InfoRow>
              <InfoRow label="Phone">{phone ?? "—"}</InfoRow>
              {user && <InfoRow label="Joined">{formatDate(user.createdAt)}</InfoRow>}
            </div>
            <div className="mt-4 flex gap-2">
              <a href={`mailto:${email}`} className={iconLink} aria-label="Email"><EnvelopeSimple weight="light" className="h-4 w-4" /></a>
              {phone && <a href={`tel:${phone}`} className={iconLink} aria-label="Call"><Phone weight="light" className="h-4 w-4" /></a>}
              {phone && <a href={waLink(phone)} target="_blank" rel="noreferrer" className={iconLink} aria-label="WhatsApp"><WhatsappLogo weight="light" className="h-4 w-4" /></a>}
            </div>
          </Card>
          <Card title={user?.address ? "Saved address" : "Latest shipping address"}>
            {address ? (
              <address className="text-sm not-italic leading-relaxed text-ink/75">
                <span className="font-medium text-ink">{address.name}</span><br />
                {address.line1}<br />
                {address.line2 ? <>{address.line2}<br /></> : null}
                {address.city}, {address.state} {address.pincode}<br />
                {address.phone}
              </address>
            ) : (
              <p className="text-sm text-ink/45">No address on file.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
