import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireCustomer } from "@/lib/auth";
import { INDIAN_STATES, orderToken } from "@/lib/orders";
import { formatDate, inr } from "@/lib/utils";
import { ProfileForm } from "@/components/store/auth-forms";
import { logout } from "./actions";

export const metadata = { title: "My account", robots: { index: false } };

export default async function Account() {
  const s = await requireCustomer();
  const u = db.select().from(users).where(eq(users.id, s.uid)).get();
  const list = db.select().from(orders).where(eq(orders.userId, s.uid)).orderBy(desc(orders.createdAt)).all();
  return (
    <section className="container pb-28 pt-36">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-deep">My account</p>
          <h1 className="mt-2 font-display text-5xl tracking-tight">Namaste, {s.name.split(" ")[0]}</h1>
        </div>
        <form action={logout}><button className="h-11 rounded-full px-5 text-sm ring-1 ring-ink/15 hover:bg-ink hover:text-ivory">Sign out</button></form>
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-display text-2xl">Orders</h2>
          <ul className="mt-5 space-y-3">
            {list.map((o) => (
              <li key={o.id}>
                <Link href={`/order/${o.orderNumber}?t=${orderToken(o.orderNumber)}`} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 ring-1 ring-ink/[0.06] transition hover:ring-gold">
                  <span>
                    <span className="block text-sm font-semibold">{o.orderNumber}</span>
                    <span className="block text-xs text-ink/50">{formatDate(o.createdAt)}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm tabular-nums">{inr(o.total)}</span>
                    <span className="block text-xs capitalize text-maroon">{o.status}</span>
                  </span>
                </Link>
              </li>
            ))}
            {list.length === 0 && <li className="rounded-2xl border border-dashed border-ink/15 px-6 py-12 text-center text-sm text-ink/50">No orders yet. <Link href="/shop" className="text-maroon underline">Start shopping</Link></li>}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl">Saved address</h2>
          <div className="mt-5 rounded-[2rem] bg-ivory-2/60 p-5 ring-1 ring-ink/[0.06]">
            <ProfileForm initial={{ name: u?.name, phone: u?.phone ?? undefined, ...(u?.address ?? {}) }} states={INDIAN_STATES} />
          </div>
        </div>
      </div>
    </section>
  );
}
