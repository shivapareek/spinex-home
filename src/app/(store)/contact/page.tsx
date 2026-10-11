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
    <section className="container grid gap-14 pb-28 pt-36 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <h1 className="font-display text-5xl tracking-tight md:text-6xl">We're here to help.</h1>
        <p className="mt-4 max-w-md text-ink/60">Questions about an idol, your order or a bulk requirement — reach us the way you like.</p>
        <ul className="mt-10 space-y-3">
          {items.map(({ Icon, t, v, href }) => {
            const inner = <><Icon className="h-5 w-5 text-maroon" weight="light" /><span><span className="block text-xs text-ink/50">{t}</span><span className="block text-sm">{v}</span></span></>;
            return <li key={t}>{href ? <a href={href} className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 ring-1 ring-ink/[0.06] transition hover:ring-gold">{inner}</a> : <div className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 ring-1 ring-ink/[0.06]">{inner}</div>}</li>;
          })}
        </ul>
      </div>
      <div className="rounded-[2rem] bg-ivory-2/60 p-6 ring-1 ring-ink/[0.06] md:p-8">
        <h2 className="mb-6 font-display text-3xl">Send a message</h2>
        <EnquiryForm type="contact" />
      </div>
    </section>
  );
}
