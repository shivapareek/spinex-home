import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { Card, Field, Input, PageHeader, Select, Textarea, Toggle } from "@/components/admin/ui";
import { ActionButton, ActionForm, MediaInput, SubmitButton } from "@/components/admin/client";
import { deleteTestimonial, saveTestimonial } from "../actions";
import { GenuineNote } from "@/components/admin/cms/testimonial-bits";

const SOURCES = ["Amazon review", "Flipkart review", "Meesho review", "Google review", "Instagram", "WhatsApp", "Website order", "In person"];

export default async function TestimonialEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const t = isNew ? null : db.select().from(testimonials).where(eq(testimonials.id, Number(id))).get();
  if (!isNew && !t) notFound();
  return (
    <>
      <PageHeader title={t ? `Testimonial · ${t.name}` : "New testimonial"} back={{ href: "/admin/cms/testimonials", label: "Testimonials" }} />
      <GenuineNote />
      <ActionForm action={saveTestimonial.bind(null, t?.id ?? null)} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card title="Feedback">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Quote" hint="Use the customer's own words." className="sm:col-span-2">
              <Textarea name="quote" defaultValue={t?.quote} required maxLength={800} />
            </Field>
            <Field label="Customer name"><Input name="name" defaultValue={t?.name} required placeholder="Priya S." /></Field>
            <Field label="Location"><Input name="location" defaultValue={t?.location ?? ""} placeholder="Jaipur" /></Field>
            <Field label="Rating">
              <Select name="rating" defaultValue={String(t?.rating ?? 5)}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)} ({n})</option>
                ))}
              </Select>
            </Field>
            <Field label="Source" hint="Where this feedback came from">
              <Input name="source" defaultValue={t?.source ?? ""} list="testimonial-sources" placeholder="Amazon review" />
              <datalist id="testimonial-sources">{SOURCES.map((s) => <option key={s} value={s} />)}</datalist>
            </Field>
          </div>
        </Card>
        <div className="space-y-6">
          <Card title="Avatar" description="Optional. Only with the customer's permission.">
            <MediaInput name="avatar" defaultValue={t?.avatar} folder="testimonials" label="Upload photo" />
          </Card>
          <Card title="Visibility">
            <div className="space-y-4">
              <Toggle name="isActive" defaultChecked={t?.isActive ?? true} label="Show on store" />
              <Field label="Sort order" hint="Lower numbers appear first"><Input name="sortOrder" type="number" defaultValue={t?.sortOrder ?? 0} /></Field>
            </div>
          </Card>
          <SubmitButton className="w-full">{isNew ? "Add testimonial" : "Save changes"}</SubmitButton>
          {t && (
            <ActionButton action={deleteTestimonial.bind(null, t.id)} variant="danger" size="md" className="w-full" confirm={`Delete the testimonial from ${t.name}?`}>
              Delete testimonial
            </ActionButton>
          )}
        </div>
      </ActionForm>
    </>
  );
}
