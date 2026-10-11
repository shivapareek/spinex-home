import { DownloadSimple, Receipt, Truck, Gift, Storefront } from "@phosphor-icons/react/dist/ssr";
import { listProducts } from "@/lib/catalog";
import { getSetting } from "@/lib/settings";
import { EnquiryForm } from "@/components/store/enquiry-form";

export const metadata = { title: "Bulk orders, wholesale & corporate gifting", description: "Catalogue pricing on bulk orders of car dashboard and home décor idols, with GST invoice." };

export default function BulkOrders() {
  const site = getSetting("site");
  const strip = listProducts({ featured: true, limit: 8 }).filter((p) => p.cutout);
  return (
    <>
      <section className="border-b border-line">
        <div className="container py-12 md:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Wholesale · Retailers · Corporate gifting</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">Bulk orders at wholesale prices</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">Car accessory stores, temple shops, gift retailers and companies across India buy idols directly from {site.legalName}. Get catalogue pricing, GST invoices and reliable delivery.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/spinex-catalogue-2026.pdf" target="_blank" className="btn-primary h-12 px-7"><DownloadSimple className="h-4 w-4" weight="bold" /> Download 2026 price list</a>
              <a href="#enquiry" className="btn-outline h-12 px-7">Send an enquiry</a>
            </div>
          </div>
          {strip.length > 0 && (
            <div className="no-scrollbar -mx-4 mt-10 flex gap-3 overflow-x-auto px-4 md:mx-0 md:mt-14 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0">
              {strip.slice(0, 5).map((p) => (
                <div key={p.id} className="w-32 shrink-0 md:w-auto">
                  <div className="relative aspect-square rounded-2xl bg-surface">
                    <img src={p.cutout!} alt={p.name} loading="lazy" className="absolute inset-[14%] h-[72%] w-[72%] object-contain" />
                  </div>
                  <p className="mt-2 truncate text-xs text-muted">{p.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="container grid gap-10 py-12 md:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">Why buy in bulk from us</h2>
          <ul className="mt-6 space-y-5">
            {[
              { Icon: Storefront, t: "For retailers", d: "Stock the designs that already sell well on Amazon, Flipkart and Meesho." },
              { Icon: Gift, t: "Corporate and festival gifts", d: "Diwali, new car and housewarming gifts for your team and clients." },
              { Icon: Receipt, t: `GST invoice · ${site.gstin}`, d: "Every bulk order comes with a GST invoice for input tax credit." },
              { Icon: Truck, t: "Delivery across India", d: "Safely packed cartons, shipped by trusted courier partners." },
            ].map(({ Icon, t, d }) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft"><Icon className="h-5 w-5 text-accent" /></span>
                <span className="min-w-0"><span className="block break-words font-semibold">{t}</span><span className="mt-0.5 block text-sm text-muted">{d}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div id="enquiry" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 md:p-8">
          <h2 className="text-xl font-semibold md:text-2xl">Tell us what you need</h2>
          <p className="mb-6 mt-1 text-sm text-muted">We usually reply within one working day.</p>
          <EnquiryForm type="bulk" />
        </div>
      </section>
    </>
  );
}
