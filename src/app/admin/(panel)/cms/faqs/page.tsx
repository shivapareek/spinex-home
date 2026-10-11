import { asc } from "drizzle-orm";
import { ArrowDown, ArrowUp, CaretDown, Plus } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { Badge, Card, EmptyState, Field, Input, PageHeader, Textarea, Toggle } from "@/components/admin/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/client";
import { deleteFaq, moveFaq, saveFaq, toggleFaq } from "./actions";

export const metadata = { title: "FAQs" };

export default async function FaqsPage() {
  await requireAdmin();
  const rows = db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id)).all();
  const live = rows.filter((r) => r.isActive).length;
  return (
    <>
      <PageHeader title="FAQs" description={`Questions shown on the homepage and help pages · ${live} of ${rows.length} visible. Click a question to edit it inline.`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {rows.length === 0 ? (
            <EmptyState title="No FAQs yet" body="Answer the questions customers ask most — delivery time, COD, packaging, returns." />
          ) : (
            <ol className="space-y-2">
              {rows.map((f, i) => (
                <li key={f.id} className="rounded-2xl bg-white ring-1 ring-ink/[0.06]">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                      <span className="w-5 shrink-0 text-center font-display text-sm text-ink/35">{i + 1}</span>
                      <span className={`min-w-0 flex-1 text-sm font-medium ${f.isActive ? "text-ink" : "text-ink/40"}`}>{f.question}</span>
                      {!f.isActive && <Badge>Hidden</Badge>}
                      <CaretDown weight="light" className="h-4 w-4 shrink-0 text-ink/40 transition-transform duration-300 ease-silk group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-ink/[0.06] px-4 pb-4 pt-4">
                      <ActionForm action={saveFaq.bind(null, f.id)} className="grid gap-3">
                        <Field label="Question"><Input name="question" defaultValue={f.question} required /></Field>
                        <Field label="Answer"><Textarea name="answer" defaultValue={f.answer} required className="min-h-[90px]" /></Field>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Toggle name="isActive" defaultChecked={f.isActive} label="Visible" />
                          <SubmitButton size="sm">Save</SubmitButton>
                        </div>
                      </ActionForm>
                    </div>
                  </details>
                  <div className="flex items-center justify-end gap-1 border-t border-ink/[0.04] px-3 py-1.5">
                    <ActionButton action={moveFaq.bind(null, f.id, -1)} className={i === 0 ? "invisible" : ""}>
                      <ArrowUp weight="light" className="h-3.5 w-3.5" /> <span className="sr-only">Move up</span>
                    </ActionButton>
                    <ActionButton action={moveFaq.bind(null, f.id, 1)} className={i === rows.length - 1 ? "invisible" : ""}>
                      <ArrowDown weight="light" className="h-3.5 w-3.5" /> <span className="sr-only">Move down</span>
                    </ActionButton>
                    <ActionButton action={toggleFaq.bind(null, f.id)}>{f.isActive ? "Hide" : "Show"}</ActionButton>
                    <ActionButton action={deleteFaq.bind(null, f.id)} confirm={`Delete “${f.question}”?`} className="hover:text-sindoor">Delete</ActionButton>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <Card title="Add a question" className="lg:sticky lg:top-10 lg:self-start">
          <ActionForm action={saveFaq.bind(null, null)} resetOnSuccess className="grid gap-3">
            <Field label="Question"><Input name="question" required placeholder="How long does delivery take?" /></Field>
            <Field label="Answer"><Textarea name="answer" required placeholder="Orders are dispatched in 1–2 days…" /></Field>
            <SubmitButton className="w-full"><Plus weight="light" className="h-4 w-4" /> Add FAQ</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
