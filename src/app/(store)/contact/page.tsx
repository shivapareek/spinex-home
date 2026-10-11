import { Phone, EnvelopeSimple, WhatsappLogo, MapPin } from "@phosphor-icons/react/dist/ssr";
import { getSetting } from "@/lib/settings";
import { EnquiryForm } from "@/components/store/enquiry-form";

export const metadata = { title: "Contact us" };

export default function Contact() {
  const s = getSetting("site");
  const wa = s.whatsapp.replace(/\D/g, "");
  const items = [
    { Icon: WhatsappLogo, t: "WhatsApp", v: s.phone, href: wa ? `https://wa.me/${wa}` : undefined },
    { Icon: Phone, t: "Call", v: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { Icon: EnvelopeSimple, t: "Email", v: s.email, href: `mailto:${s.email}` },
    { Icon: MapPin, t: "Address", v: s.address },
  ];
  return (
    <section className="container grid gap-10 py-12 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">We are here to help</h1>
        <p className="mt-3 max-w-md text-[15px] leading-7 text-muted">Have a question about an idol, your order or a bulk order? Reach us whichever way is easiest for you.</p>
        <ul className="mt-8 space-y-3">
          {items.map(({ Icon, t, v, href }) => {
            const inner = <><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface"><Icon className="h-5 w-5 text-ink" /></span><span className="min-w-0"><span className="block text-xs text-muted">{t}</span><span className="block break-words text-sm font-medium">{v}</span></span></>;
            return <li key={t}>{href ? <a href={href} className="flex items-center gap-4 rounded-2xl border border-line bg-white px-4 py-3.5 transition hover:border-ink/40">{inner}</a> : <div className="flex items-center gap-4 rounded-2xl border border-line bg-white px-4 py-3.5">{inner}</div>}</li>;
          })}
        </ul>
      </div>
      <div className="rounded-2xl border border-line bg-white p-5 md:p-8">
        <h2 className="text-xl font-semibold md:text-2xl">Send us a message</h2>
        <p className="mb-6 mt-1 text-sm text-muted">We usually reply within one working day.</p>
        <EnquiryForm type="contact" />
      </div>
    </section>
  );
}
