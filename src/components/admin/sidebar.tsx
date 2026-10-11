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
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-tight text-ink">Spinex <span className="font-normal text-muted">Admin</span></span>
        </Link>
        <button onClick={() => setOpen(!open)} className="-mr-2 grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface" aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </div>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-line bg-white text-ink transition-transform duration-500 ease-silk lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
          <LogoMark />
          <div>
            <p className="text-[15px] font-semibold leading-none tracking-tight">Spinex Home</p>
            <p className="mt-1 text-[11px] text-muted">Admin</p>
          </div>
        </div>
        <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 pb-6 pt-2">
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="px-3 pb-1.5 text-[11px] font-medium text-muted">{g.group}</p>
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
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors",
                          on ? "bg-surface font-medium text-ink" : "text-ink/70 hover:bg-surface hover:text-ink",
                        )}
                      >
                        <Icon className={cn("h-[18px] w-[18px]", on ? "text-accent" : "text-muted group-hover:text-ink")} weight={on ? "fill" : "regular"} />
                        <span className="flex-1">{it.label}</span>
                        {n > 0 && <span className="rounded-full bg-accent px-1.5 py-px text-[10px] font-semibold text-white">{n}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-ink/70 transition hover:bg-surface hover:text-ink">
            <ArrowSquareOut className="h-[18px] w-[18px] text-muted" /> View store
          </Link>
          <div className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-sm font-semibold text-ink">{user.name.slice(0, 1)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">{user.name}</p>
              <p className="truncate text-[11px] capitalize text-muted">{user.role}</p>
            </div>
            <form action={adminLogout}>
              <button className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink" aria-label="Sign out">
                <SignOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}

function LogoMark() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="currentColor" aria-hidden>
        <path d="M12 2.5c-.9 2.7-3.6 4-3.6 7.2a3.6 3.6 0 0 0 7.2 0c0-3.2-2.7-4.5-3.6-7.2Z" />
        <path d="M4.5 16.5h15M7 20h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
