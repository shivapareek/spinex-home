import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus, Ticket } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { coupons, type Coupon } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate, inr } from "@/lib/utils";
import { Badge, EmptyState, LinkButton, PageHeader, Table, td, type BadgeTone } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/client";
import { ToggleAction } from "@/components/admin/commerce/client-bits";
import { deleteCoupon, toggleCoupon } from "./actions";

export const metadata = { title: "Coupons" };

function state(c: Coupon, now: string): { label: string; tone: BadgeTone } {
  if (!c.isActive) return { label: "Paused", tone: "neutral" };
  if (c.endsAt && c.endsAt < now) return { label: "Expired", tone: "red" };
  if (c.startsAt && c.startsAt > now) return { label: "Scheduled", tone: "blue" };
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return { label: "Used up", tone: "gold" };
  return { label: "Live", tone: "green" };
}

function describeCoupon(c: Pick<Coupon, "type" | "value" | "maxDiscount">) {
  return c.type === "percent" ? `${c.value}% off${c.maxDiscount ? ` · up to ${inr(c.maxDiscount)}` : ""}` : `${inr(c.value)} off`;
}

export default async function CouponsPage() {
  await requireAdmin();
  const rows = db.select().from(coupons).orderBy(desc(coupons.createdAt)).all();
  const now = new Date().toISOString();
  return (
    <>
      <PageHeader
        title="Coupons"
        description="Discount codes customers can apply at checkout."
        actions={<LinkButton href="/admin/coupons/new"><Plus weight="light" className="h-4 w-4" /> New coupon</LinkButton>}
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No coupons yet"
          body="Create a welcome code or a festive offer — percentage or flat, with limits and dates."
          action={<LinkButton href="/admin/coupons/new">Create a coupon</LinkButton>}
        />
      ) : (
        <Table head={["Code", "Discount", "Min. order", "Redeemed", "Valid", "Status", "Active", ""]}>
          {rows.map((c) => {
            const s = state(c, now);
            const pct = c.usageLimit ? Math.min(100, (c.usedCount / c.usageLimit) * 100) : 0;
            return (
              <tr key={c.id} className="transition hover:bg-surface">
                <td className={td}>
                  <Link href={`/admin/coupons/${c.id}`} className="group flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-deep"><Ticket weight="light" className="h-[18px] w-[18px]" /></span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[13px] font-semibold tracking-wide group-hover:text-accent-deep">{c.code}</span>
                      {c.description && <span className="block max-w-[220px] truncate text-[11px] text-ink/45">{c.description}</span>}
                    </span>
                  </Link>
                </td>
                <td className={`${td} whitespace-nowrap`}>{describeCoupon(c)}</td>
                <td className={`${td} whitespace-nowrap tabular-nums text-ink/60`}>{c.minOrder ? inr(c.minOrder) : "—"}</td>
                <td className={td}>
                  <span className="tabular-nums">{c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ""}</span>
                  {c.usageLimit != null && (
                    <span className="mt-1 block h-1 w-20 overflow-hidden rounded-full bg-ink/[0.07]">
                      <span className="block h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
                    </span>
                  )}
                </td>
                <td className={`${td} whitespace-nowrap text-xs text-ink/60`}>
                  {c.startsAt || c.endsAt ? (
                    <>
                      {c.startsAt ? formatDate(c.startsAt) : "Now"} → {c.endsAt ? formatDate(c.endsAt) : "No end"}
                    </>
                  ) : (
                    "Always"
                  )}
                </td>
                <td className={td}><Badge tone={s.tone}>{s.label}</Badge></td>
                <td className={td}><ToggleAction action={toggleCoupon.bind(null, c.id)} checked={c.isActive} label={c.isActive ? "Pause coupon" : "Activate coupon"} /></td>
                <td className={`${td} whitespace-nowrap text-right`}>
                  <Link href={`/admin/coupons/${c.id}`} className="mr-1 text-xs font-medium text-ink/70 hover:text-accent-deep">Edit</Link>
                  <ActionButton action={deleteCoupon.bind(null, c.id)} confirm={`Delete coupon ${c.code}? Customers will no longer be able to use it.`} className="text-sindoor hover:bg-sindoor/10 hover:text-sindoor">
                    Delete
                  </ActionButton>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </>
  );
}
