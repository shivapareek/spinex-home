import Link from "next/link";
import { CreditCard, Info, Storefront, Truck } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { cn, inr, toRupees } from "@/lib/utils";
import { Badge, Card, Field, Input, PageHeader, Textarea, Toggle } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { saveCommerce, saveGeneral, savePayments } from "./actions";

export const metadata = { title: "Settings" };

const TABS = [
  { key: "general", label: "General", icon: Storefront },
  { key: "commerce", label: "Shipping & COD", icon: Truck },
  { key: "payments", label: "Payments", icon: CreditCard },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as Tab) : "general";

  return (
    <>
      <PageHeader title="Settings" description="Store details, shipping rules and payment gateway." />
      <nav className="-mx-1 mb-6 flex gap-1 overflow-x-auto px-1 pb-1" aria-label="Settings sections">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/settings?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition duration-300 ease-silk",
              tab === t.key ? "bg-ink text-white" : "bg-white text-ink/60 ring-1 ring-ink/10 hover:text-ink",
            )}
          >
            <t.icon weight="light" className="h-4 w-4" /> {t.label}
          </Link>
        ))}
      </nav>
      {tab === "general" && <General />}
      {tab === "commerce" && <Commerce />}
      {tab === "payments" && <Payments />}
    </>
  );
}

function General() {
  const s = getSetting("site");
  return (
    <ActionForm action={saveGeneral} className="grid gap-6 lg:grid-cols-2">
      <Card title="Store identity">
        <div className="grid gap-4">
          <Field label="Store name"><Input name="name" defaultValue={s.name} required /></Field>
          <Field label="Legal / registered name" hint="Printed on GST invoices"><Input name="legalName" defaultValue={s.legalName} /></Field>
          <Field label="Tagline"><Input name="tagline" defaultValue={s.tagline} /></Field>
          <Field label="GSTIN"><Input name="gstin" defaultValue={s.gstin} maxLength={15} className="font-mono uppercase" /></Field>
          <Field label="Business address"><Textarea name="address" defaultValue={s.address} className="min-h-[80px]" /></Field>
        </div>
      </Card>
      <div className="space-y-6">
        <Card title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" className="sm:col-span-2"><Input name="email" type="email" defaultValue={s.email} /></Field>
            <Field label="Phone" hint="As displayed, e.g. +91 98765 43210"><Input name="phone" type="tel" defaultValue={s.phone} /></Field>
            <Field label="WhatsApp number" hint="Digits with country code, no + — e.g. 919876543210">
              <Input name="whatsapp" inputMode="numeric" defaultValue={s.whatsapp} />
            </Field>
          </div>
        </Card>
        <Card title="Social profiles">
          <div className="grid gap-4">
            <Field label="Instagram"><Input name="instagram" type="url" defaultValue={s.socials.instagram ?? ""} placeholder="https://instagram.com/spinexhome" /></Field>
            <Field label="Facebook"><Input name="facebook" type="url" defaultValue={s.socials.facebook ?? ""} placeholder="https://facebook.com/…" /></Field>
            <Field label="YouTube"><Input name="youtube" type="url" defaultValue={s.socials.youtube ?? ""} placeholder="https://youtube.com/@…" /></Field>
          </div>
        </Card>
      </div>
      <Card title="Search engines" description="Default title and description for Google and link previews." className="lg:col-span-2">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="SEO title" hint="Around 60 characters"><Input name="seoTitle" defaultValue={s.seo.title} maxLength={120} /></Field>
          <Field label="SEO description" hint="Around 155 characters"><Textarea name="seoDescription" defaultValue={s.seo.description} className="min-h-[80px]" maxLength={320} /></Field>
        </div>
      </Card>
      <div className="lg:col-span-2 flex justify-end">
        <SubmitButton>Save general settings</SubmitButton>
      </div>
    </ActionForm>
  );
}

function Commerce() {
  const c = getSetting("commerce");
  return (
    <ActionForm action={saveCommerce} className="grid gap-6 lg:grid-cols-2">
      <Card title="Shipping" description="Amounts in rupees.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Free shipping above (₹)" hint={`Currently ${inr(c.freeShippingThreshold)} · 0 = always free`}>
            <Input name="freeShippingThreshold" type="number" min={0} step="1" defaultValue={toRupees(c.freeShippingThreshold)} />
          </Field>
          <Field label="Shipping fee (₹)" hint="Charged below the threshold">
            <Input name="shippingFee" type="number" min={0} step="1" defaultValue={toRupees(c.shippingFee)} />
          </Field>
          <Field label="Dispatch time" hint="Shown on product pages, e.g. “1–2 days”" className="sm:col-span-2">
            <Input name="dispatchDays" defaultValue={c.dispatchDays} required />
          </Field>
        </div>
      </Card>
      <div className="space-y-6">
        <Card title="Cash on Delivery">
          <div className="space-y-4">
            <Toggle name="codEnabled" defaultChecked={c.codEnabled} label="Offer Cash on Delivery" hint="Customers can pay when the parcel arrives" />
            <Field label="COD fee (₹)" hint="Extra charge for COD orders · 0 for none">
              <Input name="codFee" type="number" min={0} step="1" defaultValue={toRupees(c.codFee)} />
            </Field>
          </div>
        </Card>
        <Card title="Inventory">
          <Field label="Low-stock alert at" hint="Products at or below this stock are flagged in the admin">
            <Input name="lowStockThreshold" type="number" min={0} step="1" defaultValue={c.lowStockThreshold} />
          </Field>
        </Card>
      </div>
      <div className="lg:col-span-2 flex justify-end">
        <SubmitButton>Save shipping & COD</SubmitButton>
      </div>
    </ActionForm>
  );
}

function Payments() {
  const c = getSetting("commerce");
  const hasSecret = !!c.razorpayKeySecret;
  const mode = c.razorpayKeyId.startsWith("rzp_live_") ? "live" : c.razorpayKeyId.startsWith("rzp_test_") ? "test" : null;
  return (
    <ActionForm action={savePayments} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card
        title="Razorpay"
        description="Accept UPI, cards, net banking and wallets."
        actions={
          c.razorpayEnabled ? (
            <Badge tone={mode === "live" ? "green" : "gold"}>{mode === "live" ? "Live" : "Test mode"}</Badge>
          ) : (
            <Badge>Off</Badge>
          )
        }
      >
        <div className="grid gap-4">
          <Toggle name="razorpayEnabled" defaultChecked={c.razorpayEnabled} label="Enable Razorpay at checkout" hint="When off, only Cash on Delivery is offered" />
          <Field label="Key ID"><Input name="razorpayKeyId" defaultValue={c.razorpayKeyId} placeholder="rzp_test_XXXXXXXXXXXX" autoComplete="off" spellCheck={false} className="font-mono" /></Field>
          <Field label="Key Secret" hint={hasSecret ? "A secret is saved. Leave blank to keep it, or paste a new one to replace it." : "Paste the secret shown when you generated the key."}>
            <Input name="razorpayKeySecret" type="password" placeholder={hasSecret ? "•••••••••••••••• (saved)" : ""} autoComplete="new-password" spellCheck={false} className="font-mono" />
          </Field>
          {hasSecret && <Toggle name="clearSecret" label="Remove the saved secret" />}
        </div>
      </Card>
      <div className="space-y-6">
        <div className="rounded-2xl bg-surface p-5 text-sm text-ink/70 ring-1 ring-accent/20">
          <p className="mb-2 flex items-center gap-2 font-medium text-ink"><Info weight="light" className="h-4 w-4 text-accent-deep" /> Where to find your keys</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-[13px]">
            <li>Log in to the Razorpay Dashboard.</li>
            <li>Go to <span className="font-medium text-ink">Settings → API Keys</span>.</li>
            <li>Generate a key and copy the Key ID and Key Secret.</li>
          </ol>
          <p className="mt-3 text-[12px] text-ink/55">
            Test keys start with <code className="rounded bg-white px-1 font-mono">rzp_test_</code> — no real money moves. Switch to <code className="rounded bg-white px-1 font-mono">rzp_live_</code> keys once your account is activated.
          </p>
        </div>
        <SubmitButton className="w-full">Save payment settings</SubmitButton>
      </div>
    </ActionForm>
  );
}
