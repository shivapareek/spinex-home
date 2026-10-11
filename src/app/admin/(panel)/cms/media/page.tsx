import Link from "next/link";
import { desc } from "drizzle-orm";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { PageHeader, inputClass } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/cms/media-library";
import { deleteMedia, updateMediaAlt } from "./actions";

export const metadata = { title: "Media library" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "images", label: "Images" },
  { key: "models", label: "3D models" },
  { key: "other", label: "Other" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const kindOf = (m: { mime: string; filename: string; url: string }): Exclude<FilterKey, "all"> =>
  m.mime.startsWith("image/") ? "images" : m.mime.startsWith("model/") || /\.(glb|gltf|usdz)$/i.test(m.filename + " " + m.url) ? "models" : "other";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ type?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const type: FilterKey = FILTERS.some((f) => f.key === sp.type) ? (sp.type as FilterKey) : "all";
  const q = (sp.q ?? "").trim().toLowerCase();

  const all = db.select().from(media).orderBy(desc(media.id)).all();
  const counts = { all: all.length, images: 0, models: 0, other: 0 };
  for (const m of all) counts[kindOf(m)]++;
  const rows = all.filter((m) => (type === "all" || kindOf(m) === type) && (!q || m.filename.toLowerCase().includes(q) || (m.alt ?? "").toLowerCase().includes(q)));

  const href = (t: FilterKey) => {
    const p = new URLSearchParams();
    if (t !== "all") p.set("type", t);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/admin/cms/media${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Media library" description="Every image and file uploaded across the admin. Drop new files below, copy a URL to use it anywhere." />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={href(f.key)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition duration-300 ease-silk",
                type === f.key ? "bg-ink text-white" : "bg-white text-ink/60 ring-1 ring-ink/10 hover:text-ink",
              )}
            >
              {f.label} <span className="ml-1 opacity-60">{counts[f.key]}</span>
            </Link>
          ))}
        </nav>
        <form className="relative md:w-72" action="/admin/cms/media">
          {type !== "all" && <input type="hidden" name="type" value={type} />}
          <MagnifyingGlass weight="light" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search by filename…" className={cn(inputClass, "bg-white pl-9")} />
        </form>
      </div>

      <MediaLibrary
        items={rows.map((m) => ({ id: m.id, url: m.url, filename: m.filename, mime: m.mime, size: m.size, width: m.width, height: m.height, alt: m.alt, createdAt: m.createdAt, isImage: kindOf(m) === "images" }))}
        filtered={type !== "all" || !!q}
        updateAlt={updateMediaAlt}
        remove={deleteMedia}
      />
    </>
  );
}
