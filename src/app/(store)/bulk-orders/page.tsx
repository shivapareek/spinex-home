import { DownloadSimple, Receipt, Truck, Gift, Storefront } from "@phosphor-icons/react/dist/ssr";
import { listProducts } from "@/lib/catalog";
import { getSetting } from "@/lib/settings";
import { EnquiryForm } from "@/components/store/enquiry-form";
import { Eyebrow } from "@/components/store/reveal";

export const metadata = { title: "Bulk orders, wholesale & corporate gifting", description: "Catalogue pricing on bulk orders of car dashboard and home décor idols, with GST invoice." };

export default function BulkOrders() {
  const site = getSetting("site");
  const strip = listProducts({ featured: true, limit: 8 }).filter((p) => p.cutout);
  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-24 pt-40 text-ivory">
        <div className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgba(94,18,36,0.9),transparent)]" />
        <div className="container relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <Eyebrow dark>Wholesale · Retail partners · Corporate gifting</Eyebrow>
            <h1 className="mt-6 font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">Blessings, <em className="text-gold-gradient">by the box.</em></h1>
            <p className="mt-6 max-w-lg text-ivory/60">Car accessory stores, temple shops, gift retailers and companies across India source idols directly from {site.legalName}. Get catalogue pricing, GST invoices and dependable dispatch.</p>
            <a href="/spinex-catalogue-2026.pdf" target="_blank" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-sm font-semibold text-ink transition hover:bg-gold-bright"><DownloadSimple className="h-4 w-4" weight="bold" /> Download 2026 price list</a>
          </div>
          <div className="flex -space-x-6">
            {strip.slice(0, 5).map((p, i) => (
              <div key={p.id} className="grid h-36 w-28 place-items-center rounded-[1.4rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur" style={{ transform: `rotate(${(i - 2) * 4}deg) translateY(${Math.abs(i - 2) * 8}px)` }}>
                <img src={p.cutout!} alt={p.name} className="h-24 w-24 object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container grid gap-14 py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <ul className="space-y-6">
          {[
            { Icon: Storefront, t: "For retailers", d: "Stock the designs that already sell on Amazon, Flipkart & Meesho." },
            { Icon: Gift, t: "Corporate & festive gifting", d: "Diwali, new-car and housewarming gifts for teams and clients." },
            { Icon: Receipt, t: `GST invoice · ${site.gstin}`, d: "Every bulk order is invoiced for input tax credit." },
            { Icon: Truck, t: "Pan-India dispatch", d: "Carefully packed cartons shipped by trusted courier partners." },
          ].map(({ Icon, t, d }) => (
            <li key={t} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-ink/[0.07]"><Icon className="h-5 w-5 text-maroon" weight="light" /></span>
              <span><span className="block font-semibold">{t}</span><span className="mt-1 block text-sm text-ink/55">{d}</span></span>
            </li>
          ))}
        </ul>
        <div className="rounded-[2rem] bg-ink/[0.03] p-1.5 ring-1 ring-ink/[0.06]">
          <div className="rounded-[calc(2rem-0.375rem)] bg-ivory-2/60 p-6 md:p-8">
            <h2 className="mb-6 font-display text-3xl">Tell us what you need</h2>
            <EnquiryForm type="bulk" />
          </div>
        </div>
      </section>
    </>
  );
}
