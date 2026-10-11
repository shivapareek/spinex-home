import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, Field, Input, PageHeader, Textarea, Toggle, buttonClass } from "@/components/admin/ui";
import { ActionButton, ActionForm, MarkdownField, SubmitButton } from "@/components/admin/client";
import { deletePage, savePage } from "../actions";

export default async function PageEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const p = isNew ? null : db.select().from(pages).where(eq(pages.id, Number(id))).get();
  if (!isNew && !p) notFound();
  return (
    <>
      <PageHeader
        title={p?.title ?? "New page"}
        back={{ href: "/admin/cms/pages", label: "Pages" }}
        actions={
          p && (
            <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
              View page ↗
            </a>
          )
        }
      />
      <ActionForm action={savePage.bind(null, p?.id ?? null)} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Card title="Content">
            <div className="grid gap-4">
              <Field label="Title"><Input name="title" defaultValue={p?.title} required /></Field>
              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink/70">Body</span>
                <MarkdownField name="content" defaultValue={p?.content ?? ""} rows={20} />
              </div>
            </div>
          </Card>
          <Card title="Search engines" description="How this page appears on Google.">
            <Field label="Meta description" hint="About 150 characters. Leave blank to use the start of the page.">
              <Textarea name="seoDescription" defaultValue={p?.seoDescription ?? ""} className="min-h-[80px]" maxLength={320} />
            </Field>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="URL">
            <Field label="Slug" hint="Leave blank to generate from the title">
              <div className="flex items-center rounded-xl bg-ivory/60 ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-gold">
                <span className="pl-3.5 text-sm text-ink/40">/p/</span>
                <input name="slug" defaultValue={p?.slug} className="w-full bg-transparent px-1 py-2.5 text-sm text-ink outline-none" placeholder="about" />
              </div>
            </Field>
            {p && (
              <p className="mt-3 break-all text-xs text-ink/50">
                Public URL: <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="text-maroon hover:underline">/p/{p.slug}</a>
              </p>
            )}
          </Card>
          <Card title="Visibility">
            <div className="space-y-4">
              <Toggle name="isPublished" defaultChecked={p?.isPublished ?? true} label="Published" hint="Drafts return 404 on the storefront" />
              <Toggle name="showInFooter" defaultChecked={p?.showInFooter ?? true} label="Show in footer" />
            </div>
            {p && <p className="mt-4 text-[11px] text-ink/40">Last updated {formatDate(p.updatedAt, true)}</p>}
          </Card>
          <SubmitButton className="w-full">{isNew ? "Create page" : "Save changes"}</SubmitButton>
          {p && (
            <ActionButton
              action={deletePage.bind(null, p.id)}
              variant="danger"
              size="md"
              className="w-full"
              confirm={`Delete “${p.title}”? Any links to /p/${p.slug} (footer, checkout, emails) will stop working.`}
            >
              Delete page
            </ActionButton>
          )}
        </div>
      </ActionForm>
    </>
  );
}
