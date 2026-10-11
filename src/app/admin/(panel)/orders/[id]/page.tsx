import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { EnvelopeSimple, Phone, Printer, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { ORDER_STATUSES, orderItems, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn, formatDate, inr } from "@/lib/utils";
import { Badge, Card, Field, Input, LinkButton, PageHeader, Select, Textarea, Thumb, orderStatusTone } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { InfoRow } from "@/components/admin/commerce/bits";
import { waLink } from "@/components/admin/commerce/helpers";
import { updateOrderDetails, updateOrderStatus } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = db.select({ n: orders.orderNumber }).from(orders).where(eq(orders.id, Number(id))).get();
  return { title: o ? `Order #${o.n}` : "Order" };
}

const iconLink = "inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink/70 ring-1 ring-line transition hover:bg-white hover:text-accent-deep hover:ring-ink/20";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const o = db.select().from(orders).where(eq(orders.id, Number(id))).get();
  if (!o) notFound();
  const items = db.select().from(orderItems).where(eq(orderItems.orderId, o.id)).orderBy(asc(orderItems.id)).all();
  const a = o.shippingAddress;
  const history = [...(o.history ?? [])].reverse();
  const units = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <PageHeader
        title={`Order #${o.orderNumber}`}
        description={`Placed ${formatDate(o.createdAt, true)} · ${units} item${units === 1 ? "" : "s"} · ${inr(o.total)}`}
        back={{ href: "/admin/orders", label: "Orders" }}
        actions={
          <>
            <Badge tone={orderStatusTone[o.status]} className="px-3 py-1 text-xs">{o.status}</Badge>
            <Badge tone={orderStatusTone[o.paymentStatus]} className="px-3 py-1 text-xs">
              {o.paymentMethod === "cod" ? "COD" : "Prepaid"} · {o.paymentStatus}
            </Badge>
            <LinkButton href={`/admin/orders/${o.id}/invoice`} variant="secondary">
              <Printer weight="light" className="h-4 w-4" /> Print invoice
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <Card title="Items">
            <ul className="-mt-2 divide-y divide-ink/[0.06]">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 py-3.5">
                  <Thumb src={it.image} alt={it.name} className="h-14 w-14" />
                  <div className="min-w-0 flex-1">
                    {it.productId ? (
                      <Link href={`/admin/products/${it.productId}`} className="block truncate text-sm font-medium hover:text-accent-deep">{it.name}</Link>
                    ) : (
                      <p className="truncate text-sm font-medium">{it.name}</p>
                    )}
                    <p className="text-[11px] text-ink/45">
                      {it.sku ? `${it.sku} · ` : ""}
                      {inr(it.price)} × {it.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">{inr(it.price * it.quantity)}</p>
                </li>
              ))}
              {items.length === 0 && <li className="py-6 text-center text-sm text-ink/45">This order has no line items.</li>}
            </ul>
            <dl className="mt-2 space-y-2 border-t border-ink/[0.06] pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink/55">Subtotal</dt><dd className="tabular-nums">{inr(o.subtotal)}</dd></div>
              {o.discount > 0 && (
                <div className="flex justify-between text-tulsi">
                  <dt>Discount{o.couponCode ? <span className="ml-1.5 rounded-full bg-tulsi/10 px-2 py-0.5 text-[11px] font-medium">{o.couponCode}</span> : null}</dt>
                  <dd className="tabular-nums">−{inr(o.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between"><dt className="text-ink/55">Shipping</dt><dd className="tabular-nums">{o.shippingFee ? inr(o.shippingFee) : "Free"}</dd></div>
              {o.codFee > 0 && <div className="flex justify-between"><dt className="text-ink/55">COD fee</dt><dd className="tabular-nums">{inr(o.codFee)}</dd></div>}
              <div className="flex items-baseline justify-between border-t border-ink/[0.06] pt-3">
                <dt className="font-medium">Total</dt>
                <dd className="font-semibold text-2xl tabular-nums">{inr(o.total)}</dd>
              </div>
            </dl>
          </Card>

          {o.customerNote && (
            <Card title="Customer note">
              <p className="whitespace-pre-line rounded-2xl bg-accent-soft px-4 py-3 text-sm leading-relaxed text-ink/80">{o.customerNote}</p>
            </Card>
          )}

          <Card title="Timeline" description="Every status change and note, newest first.">
            {history.length === 0 ? (
              <p className="text-sm text-ink/45">No activity recorded yet.</p>
            ) : (
              <ol className="relative ml-1.5 border-l border-ink/10">
                {history.map((h, i) => (
                  <li key={i} className="relative pb-5 pl-6 last:pb-0">
                    <span className={cn("absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full ring-4 ring-white", i === 0 ? "bg-ink" : "bg-ink/25")} />
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={orderStatusTone[h.status] ?? "neutral"}>{h.status}</Badge>
                      <span className="text-[11px] text-ink/45">{formatDate(h.at, true)}</span>
                    </div>
                    {h.note && <p className="mt-1.5 text-sm text-ink/70">{h.note}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Update status">
            <ActionForm action={updateOrderStatus.bind(null, o.id)} resetOnSuccess className="space-y-4">
              <Field label="Status">
                <Select name="status" defaultValue={o.status} className="capitalize">
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Note" hint="Optional — saved to the timeline">
                <Textarea name="note" className="min-h-[70px]" placeholder="e.g. Packed with extra bubble wrap" maxLength={500} />
              </Field>
              <SubmitButton className="w-full">Update order</SubmitButton>
              <p className="text-[11px] leading-relaxed text-ink/45">Cancelling or marking as returned restocks every item. Re-opening a cancelled order deducts stock again.</p>
            </ActionForm>
          </Card>

          <Card title="Customer">
            <p className="font-medium">{a?.name}</p>
            <p className="mt-0.5 break-all text-sm text-ink/60">{o.email}</p>
            <p className="text-sm text-ink/60">{o.phone}</p>
            <div className="mt-4 flex items-center gap-2">
              <a href={`tel:${o.phone}`} className={iconLink} aria-label="Call"><Phone weight="light" className="h-4 w-4" /></a>
              <a href={`mailto:${o.email}?subject=${encodeURIComponent(`Your Spinex Home order #${o.orderNumber}`)}`} className={iconLink} aria-label="Email"><EnvelopeSimple weight="light" className="h-4 w-4" /></a>
              <a href={waLink(o.phone, `Namaste ${a?.name ?? ""}, this is Spinex Home about your order #${o.orderNumber}.`)} target="_blank" rel="noreferrer" className={iconLink} aria-label="WhatsApp"><WhatsappLogo weight="light" className="h-4 w-4" /></a>
              <Link href={`/admin/customers/${encodeURIComponent(o.email.toLowerCase())}`} className="ml-auto text-xs font-medium text-accent-deep hover:underline">Customer history →</Link>
            </div>
          </Card>

          <Card title="Shipping address">
            {a ? (
              <address className="text-sm not-italic leading-relaxed text-ink/75">
                <span className="font-medium text-ink">{a.name}</span><br />
                {a.line1}<br />
                {a.line2 ? <>{a.line2}<br /></> : null}
                {a.city}, {a.state} {a.pincode}<br />
                {a.phone}
              </address>
            ) : (
              <p className="text-sm text-ink/45">No address on file.</p>
            )}
          </Card>

          <Card title="Payment">
            <div className="-my-2 divide-y divide-ink/[0.05]">
              <InfoRow label="Method">{o.paymentMethod === "cod" ? "Cash on delivery" : "Razorpay (online)"}</InfoRow>
              <InfoRow label="Status"><Badge tone={orderStatusTone[o.paymentStatus]}>{o.paymentStatus}</Badge></InfoRow>
              {o.razorpayOrderId && <InfoRow label="Razorpay order"><span className="font-mono text-xs">{o.razorpayOrderId}</span></InfoRow>}
              {o.razorpayPaymentId && <InfoRow label="Payment ID"><span className="font-mono text-xs">{o.razorpayPaymentId}</span></InfoRow>}
            </div>
          </Card>

          <Card title="Fulfilment & notes">
            <ActionForm action={updateOrderDetails.bind(null, o.id)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Courier"><Input name="courier" defaultValue={o.courier ?? ""} placeholder="Delhivery" /></Field>
                <Field label="Tracking no."><Input name="trackingNumber" defaultValue={o.trackingNumber ?? ""} /></Field>
              </div>
              <Field label="Payment status">
                <Select name="paymentStatus" defaultValue={o.paymentStatus}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Select>
              </Field>
              <Field label="Internal note" hint="Only visible to your team">
                <Textarea name="adminNote" defaultValue={o.adminNote ?? ""} className="min-h-[80px]" />
              </Field>
              <SubmitButton variant="secondary" className="w-full">Save details</SubmitButton>
            </ActionForm>
          </Card>
          <p className="text-center text-[11px] text-ink/40">Last updated {formatDate(o.updatedAt, true)}</p>
        </div>
      </div>
    </>
  );
}
