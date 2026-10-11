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
    <section className="container py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Hello, {s.name.split(" ")[0]}</h1>
        </div>
        <form action={logout}><button className="btn-outline">Sign out</button></form>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
        <div>
          <h2 className="text-lg font-semibold">Your orders</h2>
          <ul className="mt-4 space-y-3">
            {list.map((o) => (
              <li key={o.id}>
                <Link href={`/order/${o.orderNumber}?t=${orderToken(o.orderNumber)}`} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-5 py-4 transition hover:border-ink/40">
                  <span>
                    <span className="block text-sm font-semibold">{o.orderNumber}</span>
                    <span className="block text-xs text-muted">{formatDate(o.createdAt)}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-medium tabular-nums">{inr(o.total)}</span>
                    <span className="mt-1 inline-block rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium capitalize text-ink">{o.status}</span>
                  </span>
                </Link>
              </li>
            ))}
            {list.length === 0 && <li className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">You have no orders yet. <Link href="/shop" className="font-medium text-ink underline underline-offset-4">Start shopping</Link></li>}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Saved address</h2>
          <div className="mt-4 rounded-2xl border border-line bg-white p-5 md:p-6">
            <ProfileForm initial={{ name: u?.name, phone: u?.phone ?? undefined, ...(u?.address ?? {}) }} states={INDIAN_STATES} />
          </div>
        </div>
      </div>
    </section>
  );
}
