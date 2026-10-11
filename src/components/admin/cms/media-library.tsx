"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, CloudArrowUp, Copy, Cube, File, Spinner, Trash, X } from "@phosphor-icons/react";
import { cn, formatDate } from "@/lib/utils";
import { inputClass } from "../ui";
import { ActionForm, SubmitButton, uploadFiles, type ActionResult } from "../client";

export type MediaItem = {
  id: number;
  url: string;
  filename: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  createdAt: string;
  isImage: boolean;
};

const fmtSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function MediaLibrary({
  items,
  filtered,
  updateAlt,
  remove,
}: {
  items: MediaItem[];
  filtered: boolean;
  updateAlt: (id: number, fd: FormData) => Promise<ActionResult>;
  remove: (id: number) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const up = await uploadFiles(files, "media");
      toast.success(up.length > 1 ? `${up.length} files uploaded` : "File uploaded");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files);
      }}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={cn(
          "mb-6 flex w-full flex-col items-center justify-center gap-2 rounded-[1.5rem] border border-dashed px-6 py-10 text-center transition duration-300 ease-silk",
          drag ? "border-gold bg-gold/10" : "border-ink/20 bg-white/60 hover:border-gold hover:bg-gold/5",
        )}
      >
        {busy ? <Spinner className="h-7 w-7 animate-spin text-gold-deep" /> : <CloudArrowUp weight="light" className="h-8 w-8 text-gold-deep" />}
        <span className="font-display text-lg text-ink">{busy ? "Uploading…" : "Drop files here or click to upload"}</span>
        <span className="text-xs text-ink/45">JPG, PNG, WebP, AVIF, SVG, GLB, USDZ or PDF · up to 40 MB each · images are optimised to WebP</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.glb,.usdz,application/pdf"
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />

      {items.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white/50 px-6 py-16 text-center">
          <p className="font-display text-xl text-ink">{filtered ? "No files match" : "Your library is empty"}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/50">
            {filtered ? "Try a different filter or search term." : "Uploads from products, categories and scenes appear here automatically."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {items.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setSelectedId(m.id)}
                className={cn(
                  "group block w-full overflow-hidden rounded-2xl bg-white text-left ring-1 transition duration-300 ease-silk hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(20,10,12,0.35)]",
                  selected?.id === m.id ? "ring-2 ring-gold" : "ring-ink/[0.06]",
                )}
              >
                <span className="flex aspect-square items-center justify-center bg-[conic-gradient(#f3ede2_25%,#fff_0_50%,#f3ede2_0_75%,#fff_0)] bg-[length:16px_16px]">
                  {m.isImage ? (
                    <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="h-full w-full object-contain" />
                  ) : (
                    <span className="flex flex-col items-center gap-2 px-3 text-center">
                      {m.mime.startsWith("model/") || /\.(glb|usdz)$/i.test(m.url) ? <Cube weight="light" className="h-8 w-8 text-maroon" /> : <File weight="light" className="h-8 w-8 text-maroon" />}
                      <span className="break-all text-[11px] text-ink/60">{m.filename}</span>
                    </span>
                  )}
                </span>
                <span className="block truncate px-3 py-2 text-[11px] text-ink/60">{m.filename}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && <Details key={selected.id} item={selected} onClose={() => setSelectedId(null)} updateAlt={updateAlt} remove={remove} />}
    </div>
  );
}

function Details({
  item,
  onClose,
  updateAlt,
  remove,
}: {
  item: MediaItem;
  onClose: () => void;
  updateAlt: (id: number, fd: FormData) => Promise<ActionResult>;
  remove: (id: number) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const copy = async () => {
    const full = window.location.origin + item.url;
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      toast.success("URL copied", { description: full });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this URL", item.url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-label={item.filename}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[1.5rem] bg-white p-5 shadow-2xl sm:max-w-3xl sm:rounded-[1.5rem] sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-xl">{item.filename}</p>
            <p className="text-xs text-ink/50">
              {[item.mime, fmtSize(item.size), item.width && item.height ? `${item.width}×${item.height}` : null, formatDate(item.createdAt)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink/50 transition hover:bg-ivory hover:text-ink" aria-label="Close">
            <X weight="light" className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-5 md:grid-cols-[1fr_280px]">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[conic-gradient(#f3ede2_25%,#fff_0_50%,#f3ede2_0_75%,#fff_0)] bg-[length:16px_16px] ring-1 ring-ink/[0.06]">
            {item.isImage ? <img src={item.url} alt={item.alt ?? ""} className="h-full w-full object-contain" /> : <File weight="light" className="h-14 w-14 text-maroon" />}
          </div>
          <div className="space-y-4">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink/70">File URL</span>
              <div className="flex gap-2">
                <input readOnly value={item.url} onFocus={(e) => e.currentTarget.select()} className={cn(inputClass, "font-mono text-xs")} />
                <button type="button" onClick={copy} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-ivory transition hover:bg-maroon" aria-label="Copy URL">
                  {copied ? <Check weight="light" className="h-4 w-4" /> : <Copy weight="light" className="h-4 w-4" />}
                </button>
              </div>
              <a href={item.url} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-xs text-maroon hover:underline">Open in new tab ↗</a>
            </div>
            {item.isImage && (
              <ActionForm action={updateAlt.bind(null, item.id)} className="space-y-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-ink/70">Alt text</span>
                  <textarea name="alt" defaultValue={item.alt ?? ""} rows={3} maxLength={200} placeholder="Brass Ganesh idol on a car dashboard" className={cn(inputClass, "leading-relaxed")} />
                  <span className="mt-1 block text-[11px] text-ink/45">Describes the image for screen readers and Google.</span>
                </label>
                <SubmitButton size="sm">Save alt text</SubmitButton>
              </ActionForm>
            )}
            <div className="border-t border-ink/[0.06] pt-4">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm(`Delete “${item.filename}” permanently? Anything still linking to it will show a broken image.`)) return;
                  start(async () => {
                    const res = await remove(item.id);
                    if (res?.error) toast.error(res.error);
                    else {
                      toast.success(res?.message ?? "Deleted");
                      onClose();
                      router.refresh();
                    }
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-sindoor ring-1 ring-sindoor/25 transition duration-300 ease-silk hover:bg-sindoor hover:text-white disabled:opacity-50"
              >
                {pending ? <Spinner className="h-3.5 w-3.5 animate-spin" /> : <Trash weight="light" className="h-3.5 w-3.5" />} Delete file
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
