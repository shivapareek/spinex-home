import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { scenes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { Badge, EmptyState, LinkButton, PageHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/client";
import { deleteScene, toggleScene } from "./actions";

export const metadata = { title: "Visualizer scenes" };

const KIND_BG: Record<string, string> = {
  car: "from-[#2a1d1f] via-[#3b2a2c] to-[#140A0C]",
  temple: "from-[#5E1224] via-[#7A2236] to-[#3A0A15]",
  desk: "from-[#efe5d2] via-[#e2d2b4] to-[#c8b08a]",
  shelf: "from-[#f3ead9] via-[#e7d9bf] to-[#d5bf98]",
  photo: "from-[#f3ede2] via-[#ebe2d1] to-[#ddd0b8]",
};
const KIND_LABEL: Record<string, string> = { car: "Illustrated · Car", temple: "Illustrated · Mandir", desk: "Illustrated · Desk", shelf: "Illustrated · Shelf", photo: "Photo" };

export default async function ScenesPage() {
  await requireAdmin();
  const rows = db.select().from(scenes).orderBy(asc(scenes.sortOrder), asc(scenes.id)).all();
  return (
    <>
      <PageHeader
        title="Visualizer scenes"
        description="Spaces customers can preview an idol in — the car dashboard, mandir, desk, or your own styled photos."
        actions={<LinkButton href="/admin/cms/scenes/new">New scene</LinkButton>}
      />
      {rows.length === 0 ? (
        <EmptyState title="No scenes yet" body="Add a scene so customers can see idols in context before they buy." action={<LinkButton href="/admin/cms/scenes/new">Create a scene</LinkButton>} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((s) => (
            <article key={s.id} className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-ink/[0.06] transition duration-300 ease-silk hover:shadow-[0_20px_50px_-30px_rgba(20,10,12,0.35)]">
              <Link href={`/admin/cms/scenes/${s.id}`} className="relative flex aspect-[16/10] items-center overflow-hidden bg-ink">
                {/* Inner box keeps the photo's own aspect so the anchor preview matches the editor */}
                <div className={`relative w-full ${s.image ? "" : `aspect-[16/10] bg-gradient-to-b ${KIND_BG[s.kind]}`}`}>
                  {s.image && <img src={s.image} alt="" className="block h-auto w-full" />}
                  <img
                    src="/uploads/products/m1-ganesh-ji-cutout.webp"
                    alt=""
                    className="pointer-events-none absolute w-auto max-w-none drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)]"
                    style={{ left: `${s.anchorX * 100}%`, top: `${s.anchorY * 100}%`, height: `${s.baseScale * 100}%`, transform: "translate(-50%,-100%)" }}
                  />
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink/70 backdrop-blur">{KIND_LABEL[s.kind]}</span>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/cms/scenes/${s.id}`} className="block truncate font-display text-lg hover:text-maroon">{s.name}</Link>
                    <p className="truncate text-xs text-ink/50">{s.tagline || <span className="font-mono">{s.key}</span>}</p>
                  </div>
                  {s.isActive ? <Badge tone="green">Active</Badge> : <Badge>Hidden</Badge>}
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-ink/[0.06] pt-3">
                  <LinkButton href={`/admin/cms/scenes/${s.id}`} variant="ghost" size="sm">Edit</LinkButton>
                  <ActionButton action={toggleScene.bind(null, s.id)}>{s.isActive ? "Hide" : "Activate"}</ActionButton>
                  <ActionButton action={deleteScene.bind(null, s.id)} confirm={`Delete scene “${s.name}”?`} className="hover:text-sindoor">Delete</ActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
