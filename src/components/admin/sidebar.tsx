"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SquaresFour, Package, Tag, Receipt, Users, Ticket, Star, EnvelopeSimple, At, House, FileText, Quotes,
  Question, Mountains, Images, GearSix, ArrowSquareOut, SignOut, List, X, UserGear,
} from "@phosphor-icons/react";
import { adminLogout } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";

type Badges = { orders: number; reviews: number; enquiries: number };

const NAV: { group: string; items: { href: string; label: string; icon: React.ElementType; badge?: keyof Badges }[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: SquaresFour }] },
  {
    group: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", icon: Receipt, badge: "orders" },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Tag },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
      { href: "/admin/reviews", label: "Reviews", icon: Star, badge: "reviews" },
    ],
  },
  {
    group: "Leads",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: EnvelopeSimple, badge: "enquiries" },
      { href: "/admin/subscribers", label: "Subscribers", icon: At },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/cms/home", label: "Homepage", icon: House },
      { href: "/admin/cms/pages", label: "Pages", icon: FileText },
      { href: "/admin/cms/testimonials", label: "Testimonials", icon: Quotes },
      { href: "/admin/cms/faqs", label: "FAQs", icon: Question },
      { href: "/admin/cms/scenes", label: "Visualizer scenes", icon: Mountains },
      { href: "/admin/cms/media", label: "Media library", icon: Images },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: GearSix },
      { href: "/admin/team", label: "Team", icon: UserGear },
    ],
  },
];

export function AdminSidebar({ user, badges }: { user: { name: string; email: string; role: string }; badges: Badges }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 lg:hidden">
        <Link href="/admin" className="font-display text-lg text-ivory">Spinex <span className="text-gold">Admin</span></Link>
        <button onClick={() => setOpen(!open)} className="rounded-full p-2 text-ivory" aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </div>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-ink text-ivory transition-transform duration-500 ease-silk lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-6 pb-6 pt-7">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-gold-bright to-gold-deep shadow-aura">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="currentColor"><path d="M12 3c-.8 2.4-3.2 3.6-3.2 6.4a3.2 3.2 0 0 0 6.4 0C15.2 6.6 12.8 5.4 12 3Z" /><path d="M5 16h14M7 19h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </span>
          <div>
            <p className="font-display text-lg leading-none">Spinex Home</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-gold/80">Control room</p>
          </div>
        </div>
        <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/30">{g.group}</p>
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const n = it.badge ? badges[it.badge] : 0;
                  const on = active(it.href);
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-all duration-300 ease-silk",
                          on ? "bg-white/[0.08] text-ivory shadow-inset" : "text-ivory/55 hover:bg-white/[0.04] hover:text-ivory",
                        )}
                      >
                        <Icon className={cn("h-[18px] w-[18px]", on ? "text-gold" : "text-ivory/40 group-hover:text-ivory/70")} weight={on ? "fill" : "light"} />
                        <span className="flex-1">{it.label}</span>
                        {n > 0 && <span className="rounded-full bg-gold px-1.5 py-px text-[10px] font-bold text-ink">{n}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-3">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-ivory/55 transition hover:bg-white/[0.04] hover:text-ivory">
            <ArrowSquareOut className="h-[18px] w-[18px]" weight="light" /> View store
          </Link>
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-maroon font-display text-sm text-gold-bright">{user.name.slice(0, 1)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] text-ivory">{user.name}</p>
              <p className="truncate text-[11px] capitalize text-ivory/40">{user.role}</p>
            </div>
            <form action={adminLogout}>
              <button className="rounded-full p-2 text-ivory/50 transition hover:bg-white/10 hover:text-ivory" aria-label="Sign out">
                <SignOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
