import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { formatDate, inr } from "@/lib/utils";
import { rupeesInWords } from "@/components/admin/commerce/helpers";
import { PrintButton } from "./print-button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = db.select({ n: orders.orderNumber }).from(orders).where(eq(orders.id, Number(id))).get();
  return { title: o ? `Invoice ${o.n}` : "Invoice" };
}

/** Default GST rate applied to idols (prices are GST-inclusive). */
const GST_RATE = 12;

const GST_STATES: Record<string, string> = {
  "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
  "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland",
  "14": "Manipur", "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat", "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra", "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
  "35": "Andaman and Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh",
};
const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");

type Line = { label: string; sub?: string; qty?: number; rate?: number; gross: number };

function split(gross: number) {
  const taxable = Math.round((gross * 100) / (100 + GST_RATE));
  return { taxable, tax: gross - taxable };
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const o = db.select().from(orders).where(eq(orders.id, Number(id))).get();
  if (!o) notFound();
  const items = db.select().from(orderItems).where(eq(orderItems.orderId, o.id)).orderBy(asc(orderItems.id)).all();
  const site = getSetting("site");
  const a = o.shippingAddress;

  const sellerState = GST_STATES[site.gstin?.slice(0, 2) ?? ""] ?? "";
  const intra = !!a?.state && (sellerState ? norm(sellerState) === norm(a.state) : norm(site.address).includes(norm(a.state)));

  const lines: Line[] = [
    ...items.map((it) => ({ label: it.name, sub: it.sku ?? undefined, qty: it.quantity, rate: it.price, gross: it.price * it.quantity })),
    ...(o.shippingFee ? [{ label: "Shipping & handling", gross: o.shippingFee }] : []),
    ...(o.codFee ? [{ label: "Cash on delivery charges", gross: o.codFee }] : []),
    ...(o.discount ? [{ label: `Discount${o.couponCode ? ` (${o.couponCode})` : ""}`, gross: -o.discount }] : []),
  ];
  const rows = lines.map((l) => ({ ...l, ...split(l.gross) }));
  const taxable = rows.reduce((s, r) => s + r.taxable, 0);
  const tax = rows.reduce((s, r) => s + r.tax, 0);
  const cgst = Math.floor(tax / 2);
  const sgst = tax - cgst;
  const grand = taxable + tax; // equals o.total by construction

  const th = "px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55";
  const tdc = "px-3 py-2.5 align-top tabular-nums";

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          #spx-invoice, #spx-invoice * { visibility: visible !important; }
          #spx-invoice { position: absolute; inset: 0 auto auto 0; width: 100%; margin: 0; padding: 0 !important; box-shadow: none !important; border: 0 !important; border-radius: 0 !important; }
          aside, .no-print { display: none !important; }
          #spx-invoice { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #spx-invoice tr { break-inside: avoid; }
        }
      `}</style>

      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/orders/${o.id}`} className="text-xs font-medium text-ink/50 transition hover:text-accent-deep">← Order #{o.orderNumber}</Link>
        <PrintButton />
      </div>

      <article id="spx-invoice" className="mx-auto max-w-[860px] rounded-2xl border border-line bg-white p-6 text-ink sm:p-10">
        <header className="flex flex-col gap-6 border-b-2 border-ink pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight text-ink">{site.name}</p>
            <p className="mt-2 text-sm font-semibold">{site.legalName}</p>
            <p className="max-w-xs whitespace-pre-line text-xs leading-relaxed text-ink/65">{site.address}</p>
            <p className="mt-1 text-xs text-ink/65">{site.email} · {site.phone}</p>
            {site.gstin && <p className="mt-1 text-xs"><span className="text-ink/55">GSTIN:</span> <span className="font-mono font-semibold">{site.gstin}</span></p>}
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/60">Tax Invoice</p>
            <dl className="mt-3 grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-xs sm:justify-end">
              <dt className="text-ink/55">Invoice no.</dt><dd className="font-semibold">INV-{o.orderNumber}</dd>
              <dt className="text-ink/55">Invoice date</dt><dd>{formatDate(o.createdAt)}</dd>
              <dt className="text-ink/55">Order no.</dt><dd>#{o.orderNumber}</dd>
              <dt className="text-ink/55">Payment</dt><dd>{o.paymentMethod === "cod" ? "Cash on delivery" : "Prepaid (Razorpay)"} · <span className="capitalize">{o.paymentStatus}</span></dd>
            </dl>
          </div>
        </header>

        <section className="grid gap-6 border-b border-ink/10 py-6 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">Billed & shipped to</p>
            {a ? (
              <address className="mt-2 text-sm not-italic leading-relaxed">
                <span className="font-semibold">{a.name}</span><br />
                {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                {a.city}, {a.state} – {a.pincode}<br />
                <span className="text-ink/65">{o.phone} · {o.email}</span>
              </address>
            ) : null}
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">Place of supply</p>
            <p className="mt-2 text-sm">{a?.state || "—"}</p>
            <p className="mt-1 text-xs text-ink/55">{intra ? "Intra-state supply · CGST + SGST" : "Inter-state supply · IGST"}</p>
          </div>
        </section>

        <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
          <table className="mt-6 w-full min-w-[600px] border-collapse text-xs">
            <thead>
              <tr className="border-y border-ink/15 bg-surface">
                <th className={th}>#</th>
                <th className={th}>Description</th>
                <th className={`${th} text-right`}>Qty</th>
                <th className={`${th} text-right`}>Rate</th>
                <th className={`${th} text-right`}>Taxable value</th>
                <th className={`${th} text-right`}>GST {GST_RATE}%</th>
                <th className={`${th} text-right`}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.08]">
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className={`${tdc} text-ink/45`}>{i + 1}</td>
                  <td className={`${tdc} font-sans`}>
                    <span className="font-medium">{r.label}</span>
                    {r.sub && <span className="block text-[10px] text-ink/45">SKU {r.sub}</span>}
                  </td>
                  <td className={`${tdc} text-right`}>{r.qty ?? "—"}</td>
                  <td className={`${tdc} text-right`}>{r.rate != null ? inr(r.rate, { decimals: true }) : "—"}</td>
                  <td className={`${tdc} text-right`}>{inr(r.taxable, { decimals: true })}</td>
                  <td className={`${tdc} text-right`}>{inr(r.tax, { decimals: true })}</td>
                  <td className={`${tdc} text-right font-medium`}>{inr(r.gross, { decimals: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-6 grid gap-6 border-t border-ink/15 pt-6 sm:grid-cols-[1fr_280px]">
          <div className="text-xs leading-relaxed text-ink/65">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">Amount in words</p>
            <p className="mt-1.5 text-sm text-ink">{rupeesInWords(grand)}</p>
            <p className="mt-5">
              All prices are inclusive of GST. Tax is back-calculated at {GST_RATE}% on each line (taxable value = amount ÷ {1 + GST_RATE / 100}).
              {o.couponCode ? " Discounts are applied before tax." : ""}
            </p>
            <p className="mt-2">Whether tax is payable on reverse charge: No.</p>
          </div>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Taxable value</dt><dd className="tabular-nums">{inr(taxable, { decimals: true })}</dd></div>
            {intra ? (
              <>
                <div className="flex justify-between"><dt className="text-ink/60">CGST @ {GST_RATE / 2}%</dt><dd className="tabular-nums">{inr(cgst, { decimals: true })}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/60">SGST @ {GST_RATE / 2}%</dt><dd className="tabular-nums">{inr(sgst, { decimals: true })}</dd></div>
              </>
            ) : (
              <div className="flex justify-between"><dt className="text-ink/60">IGST @ {GST_RATE}%</dt><dd className="tabular-nums">{inr(tax, { decimals: true })}</dd></div>
            )}
            <div className="mt-2 flex items-baseline justify-between border-t-2 border-ink pt-2.5">
              <dt className="font-semibold">Invoice total</dt>
              <dd className="text-xl font-bold tabular-nums text-ink">{inr(grand, { decimals: true })}</dd>
            </div>
            {grand !== o.total && <p className="text-[10px] text-sindoor">Note: differs from recorded order total {inr(o.total, { decimals: true })}.</p>}
          </dl>
        </section>

        <footer className="mt-10 flex flex-col gap-6 border-t border-ink/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-sm text-[11px] leading-relaxed text-ink/50">
            Thank you for shopping with {site.name}. For any help with this order, write to {site.email} or call {site.phone}.
            This is a computer-generated invoice.
          </p>
          <div className="text-right text-xs">
            <p className="text-ink/55">For {site.legalName}</p>
            <div className="ml-auto mt-10 h-px w-44 bg-ink/30" />
            <p className="mt-1.5 text-ink/55">Authorised signatory</p>
          </div>
        </footer>
      </article>
    </>
  );
}
