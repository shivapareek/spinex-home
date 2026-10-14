import Link from "next/link";
import { InstagramLogo, FacebookLogo, YoutubeLogo, WhatsappLogo, Truck, ShieldCheck, Money, Package } from "@phosphor-icons/react/dist/ssr";
import type { SiteSettings } from "@/lib/settings";
import { Logo } from "./header";
import { NewsletterForm } from "./newsletter-form";

export function Footer({ site, pages, categories }: { site: SiteSettings; pages: { slug: string; title: string }[]; categories: { slug: string; name: string }[] }) {
  const socials = [
    { href: site.socials.instagram, Icon: InstagramLogo, label: "Instagram" },
    { href: site.socials.facebook, Icon: FacebookLogo, label: "Facebook" },
    { href: site.socials.youtube, Icon: YoutubeLogo, label: "YouTube" },
    { href: site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, "")}` : "", Icon: WhatsappLogo, label: "WhatsApp" },
  ].filter((s) => s.href);
  return (
    <footer className="border-t border-line bg-page">
      <div className="container">
        <ul className="grid grid-cols-2 gap-6 border-b border-line py-10 md:grid-cols-4">
          {[
            { Icon: Truck, t: "Free shipping", d: "On orders above ₹499" },
            { Icon: Money, t: "Cash on Delivery", d: "Available across India" },
            { Icon: Package, t: "Safe packaging", d: "Packed to arrive intact" },
            { Icon: ShieldCheck, t: "Easy replacement", d: "If it arrives damaged" },
          ].map(({ Icon, t, d }) => (
            <li key={t} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
              <span><span className="block text-sm font-semibold">{t}</span><span className="block text-xs text-muted">{d}</span></span>
            </li>
          ))}
        </ul>
        <div className="grid gap-10 py-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted">{site.tagline}. By {site.legalName}.</p>
            <p className="mt-6 text-sm font-semibold">Get festive offers first</p>
            <NewsletterForm className="mt-3" />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <Col title="Shop" links={[{ href: "/shop", label: "All idols" }, ...categories.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name }))]} />
            <Col title="Help" links={[{ href: "/track", label: "Track order" }, { href: "/faq", label: "FAQs" }, { href: "/contact", label: "Contact us" }, { href: "/bulk-orders", label: "Bulk orders" }, { href: "/experience", label: "Try in your space" }]} />
            <Col title="Company" links={pages.map((p) => ({ href: `/p/${p.slug}`, label: p.title }))} />
          </div>
        </div>
        <p className="select-none overflow-hidden whitespace-nowrap text-center font-display text-[clamp(84px,26vw,390px)] font-extrabold uppercase leading-[0.8] tracking-[-0.03em] text-ink" style={{ fontVariationSettings: '"wdth" 75' }} aria-hidden>
          Spinex
        </p>
        <div className="flex flex-col gap-4 border-t border-line py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.legalName} · GSTIN {site.gstin}</p>
          {socials.length > 0 && (
            <div className="flex gap-1">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full text-ink/70 transition hover:bg-white hover:text-ink">
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className="text-sm text-muted transition hover:text-ink">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
