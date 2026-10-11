import Link from "next/link";
import { InstagramLogo, FacebookLogo, YoutubeLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
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
    <footer className="relative overflow-hidden bg-ink text-ivory">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(201,162,74,0.16),transparent)]" />
      <div className="container relative pb-10 pt-24">
        <div className="grid gap-16 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="font-deva text-xl text-gold/70">सर्वे भवन्तु सुखिनः</p>
            <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">Carry a little <em className="text-gold-gradient not-italic">grace</em> with you.</h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/55">{site.tagline}. Shipped across India by {site.legalName}.</p>
            <div className="mt-8"><NewsletterForm /></div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol title="Shop" links={[{ href: "/shop", label: "All idols" }, ...categories.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name }))]} />
            <FooterCol title="Experience" links={[{ href: "/experience", label: "Darshan Studio" }, { href: "/bulk-orders", label: "Bulk & gifting" }, { href: "/track", label: "Track order" }, { href: "/faq", label: "FAQs" }, { href: "/contact", label: "Contact" }]} />
            <FooterCol title="Company" links={pages.map((p) => ({ href: `/p/${p.slug}`, label: p.title }))} />
          </div>
        </div>
        <div className="mt-20 flex flex-col gap-6 border-t border-white/[0.08] pt-8 md:flex-row md:items-center md:justify-between">
          <Logo />
          <div className="text-[11px] leading-relaxed text-ivory/40 md:text-right">
            <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
            <p>GSTIN {site.gstin} · {site.address}</p>
          </div>
          {socials.length > 0 && (
            <div className="flex gap-2">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/10 transition hover:bg-white/10">
                  <Icon className="h-[18px] w-[18px]" weight="light" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/80">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-ivory/60 transition hover:text-ivory">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
