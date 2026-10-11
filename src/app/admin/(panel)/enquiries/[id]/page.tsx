import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { EnvelopeSimple, Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { Badge, Card, PageHeader, buttonClass, orderStatusTone } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/client";
import { InfoRow } from "@/components/admin/commerce/bits";
import { waLink } from "@/components/admin/commerce/helpers";
import { deleteEnquiry, setEnquiryStatus } from "../actions";

export const metadata = { title: "Enquiry" };

const STATUSES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "closed", label: "Closed" },
] as const;

export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const e = db.select().from(enquiries).where(eq(enquiries.id, Number(id))).get();
  if (!e) notFound();
  const greeting = `Namaste ${e.name.split(" ")[0]}, thank you for your ${e.type === "bulk" ? "bulk order enquiry" : "message"} to Spinex Home.`;

  return (
    <>
      <PageHeader
        title={e.name}
        description={`${e.type === "bulk" ? "Bulk / gifting enquiry" : "Contact message"} · received ${formatDate(e.createdAt, true)}`}
        back={{ href: "/admin/enquiries", label: "Enquiries" }}
        actions={<Badge tone={orderStatusTone[e.status]} className="px-3 py-1 text-xs">{e.status}</Badge>}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card title="Message">
            {e.message ? (
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/80">{e.message}</p>
            ) : (
              <p className="text-sm text-ink/45">No message was included.</p>
            )}
          </Card>
          <Card title="Details">
            <div className="-my-2 divide-y divide-ink/[0.05]">
              <InfoRow label="Type">{e.type === "bulk" ? "Bulk / gifting" : "Contact"}</InfoRow>
              <InfoRow label="Name">{e.name}</InfoRow>
              <InfoRow label="Phone">{e.phone}</InfoRow>
              <InfoRow label="Email">{e.email ? <span className="break-all">{e.email}</span> : "—"}</InfoRow>
              <InfoRow label="Company">{e.company || "—"}</InfoRow>
              <InfoRow label="City">{e.city || "—"}</InfoRow>
              {e.type === "bulk" && <InfoRow label="Quantity">{e.quantity || "—"}</InfoRow>}
              <InfoRow label="Received">{formatDate(e.createdAt, true)}</InfoRow>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Reply">
            <div className="grid gap-2">
              <a href={waLink(e.phone, greeting)} target="_blank" rel="noreferrer" className={cn(buttonClass("primary"), "w-full")}>
                <WhatsappLogo weight="light" className="h-4 w-4 text-gold-bright" /> WhatsApp
              </a>
              <a href={`tel:${e.phone}`} className={cn(buttonClass("secondary"), "w-full")}>
                <Phone weight="light" className="h-4 w-4" /> Call {e.phone}
              </a>
              {e.email && (
                <a href={`mailto:${e.email}?subject=${encodeURIComponent("Your enquiry with Spinex Home")}&body=${encodeURIComponent(greeting + "\n\n")}`} className={cn(buttonClass("secondary"), "w-full")}>
                  <EnvelopeSimple weight="light" className="h-4 w-4" /> Email
                </a>
              )}
            </div>
          </Card>
          <Card title="Status">
            <div className="grid grid-cols-3 gap-1.5 rounded-full bg-ivory/70 p-1 ring-1 ring-ink/[0.06]">
              {STATUSES.map((s) =>
                s.key === e.status ? (
                  <span key={s.key} className="rounded-full bg-ink py-1.5 text-center text-xs font-medium text-ivory">{s.label}</span>
                ) : (
                  <ActionButton key={s.key} action={setEnquiryStatus.bind(null, e.id, s.key)} className="h-auto rounded-full py-1.5">{s.label}</ActionButton>
                ),
              )}
            </div>
          </Card>
          <div className="text-center">
            <ActionButton action={deleteEnquiry.bind(null, e.id)} confirm={`Delete this enquiry from ${e.name}? This can't be undone.`} className="text-sindoor hover:bg-sindoor/10 hover:text-sindoor">
              Delete enquiry
            </ActionButton>
          </div>
        </div>
      </div>
    </>
  );
}
