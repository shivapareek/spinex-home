import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { Card, Field, Input, PageHeader, Select, Toggle } from "@/components/admin/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/client";
import { InfoRow } from "@/components/admin/commerce/bits";
import { istDay, rupeeInput } from "@/components/admin/commerce/helpers";
import { deleteCoupon, saveCoupon } from "../actions";

export const metadata = { title: "Coupon" };

export default async function CouponEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const c = isNew ? null : db.select().from(coupons).where(eq(coupons.id, Number(id))).get();
  if (!isNew && !c) notFound();

  return (
    <>
      <PageHeader title={c?.code ?? "New coupon"} description={c?.description ?? undefined} back={{ href: "/admin/coupons", label: "Coupons" }} />
      <ActionForm action={saveCoupon.bind(null, c?.id ?? null)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Card title="Code">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Coupon code" hint="Letters and numbers — saved in UPPERCASE">
                <Input name="code" defaultValue={c?.code} required maxLength={24} className="font-mono uppercase tracking-wide" placeholder="DIWALI15" autoComplete="off" />
              </Field>
              <Field label="Description" hint="Shown to the customer when applied">
                <Input name="description" defaultValue={c?.description ?? ""} placeholder="15% off festive idols" maxLength={200} />
              </Field>
            </div>
          </Card>

          <Card title="Discount" description="Amounts are in rupees.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <Select name="type" defaultValue={c?.type ?? "percent"}>
                  <option value="percent">Percentage off</option>
                  <option value="flat">Flat amount off (₹)</option>
                </Select>
              </Field>
              <Field label="Value" hint="Percentage (1–100) or rupee amount, depending on type">
                <Input name="value" type="number" step="0.01" min="0" inputMode="decimal" required defaultValue={c ? (c.type === "percent" ? c.value : rupeeInput(c.value)) : ""} />
              </Field>
              <Field label="Minimum order (₹)" hint="Cart subtotal needed to use the code">
                <Input name="minOrder" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={c ? rupeeInput(c.minOrder) : ""} placeholder="0" />
              </Field>
              <Field label="Maximum discount (₹)" hint="Caps percentage coupons. Ignored for flat.">
                <Input name="maxDiscount" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={rupeeInput(c?.maxDiscount)} placeholder="No cap" />
              </Field>
            </div>
          </Card>

          <Card title="Limits & schedule" description="Dates are in India time — a coupon runs from 00:00 on the start date until 23:59 on the end date.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Usage limit" hint="Total redemptions; blank = unlimited">
                <Input name="usageLimit" type="number" min="1" step="1" defaultValue={c?.usageLimit ?? ""} placeholder="Unlimited" />
              </Field>
              <Field label="Starts on"><Input name="startsAt" type="date" defaultValue={c?.startsAt ? istDay(c.startsAt) : ""} /></Field>
              <Field label="Ends on"><Input name="endsAt" type="date" defaultValue={c?.endsAt ? istDay(c.endsAt) : ""} /></Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Status">
            <Toggle name="isActive" defaultChecked={c?.isActive ?? true} label="Active" hint="Paused coupons are rejected at checkout" />
            {c && (
              <div className="mt-5 divide-y divide-ink/[0.05] border-t border-ink/[0.06] pt-2">
                <InfoRow label="Times used">{c.usedCount}{c.usageLimit != null ? ` of ${c.usageLimit}` : ""}</InfoRow>
              </div>
            )}
          </Card>
          <SubmitButton className="w-full">{isNew ? "Create coupon" : "Save changes"}</SubmitButton>
          {c && (
            <div className="text-center">
              <ActionButton action={deleteCoupon.bind(null, c.id)} confirm={`Delete coupon ${c.code}?`} className="text-sindoor hover:bg-sindoor/10 hover:text-sindoor">
                Delete coupon
              </ActionButton>
            </div>
          )}
        </div>
      </ActionForm>
    </>
  );
}
