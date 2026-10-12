import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { scenes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { Card, Field, Input, PageHeader, Select, Toggle } from "@/components/admin/ui";
import { ActionButton, ActionForm, MediaInput, SubmitButton } from "@/components/admin/client";
import { AnchorPicker } from "@/components/admin/cms/anchor-picker";
import { deleteScene, saveScene } from "../actions";

const KINDS = [
  { value: "photo", label: "Photo — uploaded background" },
  { value: "car", label: "Car dashboard (illustrated)" },
  { value: "temple", label: "Home mandir (illustrated)" },
  { value: "desk", label: "Work desk (illustrated)" },
  { value: "shelf", label: "Living room shelf (illustrated)" },
];

export default async function SceneEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const s = isNew ? null : db.select().from(scenes).where(eq(scenes.id, Number(id))).get();
  if (!isNew && !s) notFound();
  return (
    <>
      <PageHeader title={s?.name ?? "New scene"} back={{ href: "/admin/cms/scenes", label: "Visualizer scenes" }} />
      <ActionForm action={saveScene.bind(null, s?.id ?? null)} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card title="Placement" description="Where the idol stands in this scene and how large it appears.">
            <AnchorPicker defaultX={s?.anchorX ?? 0.5} defaultY={s?.anchorY ?? 0.75} defaultScale={s?.baseScale ?? 0.32} defaultImage={s?.image} defaultKind={s?.kind ?? "photo"} />
          </Card>
          <Card title="Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><Input name="name" defaultValue={s?.name} required placeholder="Puja Room" /></Field>
              <Field label="Key" hint="Lowercase id used in URLs. Blank = from name."><Input name="key" defaultValue={s?.key} placeholder="puja-room" /></Field>
              <Field label="Tagline" className="sm:col-span-2"><Input name="tagline" defaultValue={s?.tagline ?? ""} placeholder="Where every morning begins" /></Field>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Scene type">
            <Field label="Kind" hint="Car, mandir, desk and living room use a drawn scene until you add a photo below — a real photo replaces the drawing everywhere.">
              <Select name="kind" defaultValue={s?.kind ?? "photo"}>
                {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </Select>
            </Field>
          </Card>
          <Card title="Background photo" description="Landscape, at least 1600px wide, with an empty spot where the idol should stand. Then drag the anchor onto that spot.">
            <MediaInput name="image" defaultValue={s?.image} folder="scenes" aspect="wide" label="Upload scene photo" />
          </Card>
          <Card title="Visibility">
            <div className="space-y-4">
              <Toggle name="isActive" defaultChecked={s?.isActive ?? true} label="Active in visualizer" />
              <Field label="Sort order" hint="Lower numbers appear first"><Input name="sortOrder" type="number" defaultValue={s?.sortOrder ?? 0} /></Field>
            </div>
          </Card>
          <SubmitButton className="w-full">{isNew ? "Create scene" : "Save changes"}</SubmitButton>
          {s && (
            <ActionButton action={deleteScene.bind(null, s.id)} variant="danger" size="md" className="w-full" confirm={`Delete scene “${s.name}”? Customers will no longer see it in the visualizer.`}>
              Delete scene
            </ActionButton>
          )}
        </div>
      </ActionForm>
    </>
  );
}
