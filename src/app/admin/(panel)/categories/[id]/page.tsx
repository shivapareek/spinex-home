import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { Card, Field, Input, PageHeader, Textarea, Toggle } from "@/components/admin/ui";
import { ActionForm, MediaInput, SubmitButton } from "@/components/admin/client";
import { saveCategory } from "../actions";

export default async function CategoryEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const c = isNew ? null : db.select().from(categories).where(eq(categories.id, Number(id))).get();
  if (!isNew && !c) notFound();
  return (
    <>
      <PageHeader title={c?.name ?? "New category"} back={{ href: "/admin/categories", label: "Categories" }} />
      <ActionForm action={saveCategory.bind(null, c?.id ?? null)} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card title="Details">
          <div className="grid gap-4">
            <Field label="Name"><Input name="name" defaultValue={c?.name} required /></Field>
            <Field label="URL slug" hint="Leave blank to generate from the name"><Input name="slug" defaultValue={c?.slug} /></Field>
            <Field label="Description"><Textarea name="description" defaultValue={c?.description ?? ""} /></Field>
            <Field label="Sort order"><Input name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} /></Field>
          </div>
        </Card>
        <div className="space-y-6">
          <Card title="Image"><MediaInput name="image" defaultValue={c?.image} folder="categories" /></Card>
          <Card title="Visibility">
            <Toggle name="isActive" defaultChecked={c?.isActive ?? true} label="Show in store" />
          </Card>
          <SubmitButton className="w-full">{isNew ? "Create category" : "Save changes"}</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
