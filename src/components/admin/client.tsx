"use client";

import { createContext, useContext, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { UploadSimple, X, ArrowLeft, ArrowRight, Spinner } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import { buttonClass, inputClass } from "./ui";

export type ActionResult = { ok?: boolean; error?: string; message?: string; redirect?: string } | void;

/**
 * Form wrapper for server actions: shows a toast with the result and optionally redirects.
 * Server actions should return { ok: true, message } or { error } (or call redirect()).
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  confirm,
}: {
  action: (fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  confirm?: string;
}) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  // onSubmit (not the `action` prop) so React doesn't reset typed values when a save fails
  return (
    <PendingContext.Provider value={pending}>
      <form
        ref={ref}
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          if (pending) return;
          if (confirm && !window.confirm(confirm)) return;
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const res = await action(fd);
            if (res?.error) toast.error(res.error);
            else if (res) {
              if (res.message) toast.success(res.message);
              if (resetOnSuccess) ref.current?.reset();
              if (res.redirect) router.push(res.redirect);
              else router.refresh();
            }
          });
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  );
}

const PendingContext = createContext(false);

export function SubmitButton({ children, variant = "primary", size = "md", className }: { children: React.ReactNode; variant?: Parameters<typeof buttonClass>[0]; size?: "sm" | "md"; className?: string }) {
  const { pending: formPending } = useFormStatus();
  const ctxPending = useContext(PendingContext);
  const pending = formPending || ctxPending;
  return (
    <button type="submit" disabled={pending} className={cn(buttonClass(variant, size), className)}>
      {pending && <Spinner className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/** One-click server action button (e.g. delete, toggle) with optional confirm. */
export function ActionButton({
  action,
  children,
  confirm,
  variant = "ghost",
  size = "sm",
  className,
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  confirm?: string;
  variant?: Parameters<typeof buttonClass>[0];
  size?: "sm" | "md";
  className?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      className={cn(buttonClass(variant, size), className)}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const res = await action();
          if (res?.error) toast.error(res.error);
          else {
            if (res?.message) toast.success(res.message);
            if (res?.redirect) router.push(res.redirect);
            else router.refresh();
          }
        });
      }}
    >
      {pending && <Spinner className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export async function uploadFiles(files: File[] | FileList, folder = "media", keep = false): Promise<string[]> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("files", f));
  fd.append("folder", folder);
  if (keep) fd.append("keep", "1");
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.files.map((f: { url: string }) => f.url);
}

/**
 * Image/file picker that uploads immediately and stores URL(s) in a hidden input.
 * `multiple` → hidden input holds a JSON array; otherwise a single URL string.
 */
export function MediaInput({
  name,
  defaultValue,
  multiple,
  folder = "media",
  accept = "image/*",
  label = "Upload image",
  className,
  aspect = "square",
}: {
  name: string;
  defaultValue?: string | string[] | null;
  multiple?: boolean;
  folder?: string;
  accept?: string;
  label?: string;
  className?: string;
  aspect?: "square" | "wide";
}) {
  const init = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
  const [urls, setUrls] = useState<string[]>(init);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const up = await uploadFiles(multiple ? files : [files[0]], folder);
      setUrls((u) => (multiple ? [...u, ...up] : up));
      toast.success(up.length > 1 ? `${up.length} files uploaded` : "Uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const move = (i: number, d: number) =>
    setUrls((u) => {
      const n = [...u];
      const j = i + d;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const isImg = (u: string) => /\.(webp|png|jpe?g|gif|avif|svg)$/i.test(u);

  return (
    <div className={className}>
      <input type="hidden" name={name} value={multiple ? JSON.stringify(urls) : urls[0] ?? ""} />
      <div className={cn("grid gap-3", multiple ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5" : aspect === "wide" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3")}>
        {urls.map((u, i) => (
          <div key={u + i} className={cn("group relative overflow-hidden rounded-2xl bg-[conic-gradient(#f3ede2_25%,#fff_0_50%,#f3ede2_0_75%,#fff_0)] bg-[length:16px_16px] ring-1 ring-ink/10", aspect === "wide" && !multiple ? "aspect-[16/9]" : "aspect-square")}>
            {isImg(u) ? <img src={u} alt="" className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center p-2 text-center text-[11px] text-ink/60 break-all">{u.split("/").pop()}</div>}
            {multiple && i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[10px] text-ivory">Cover</span>}
            <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-0 transition group-hover:opacity-100">
              {multiple ? (
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="rounded-full bg-white/90 p-1.5 shadow" aria-label="Move left"><ArrowLeft className="h-3 w-3" /></button>
                  <button type="button" onClick={() => move(i, 1)} className="rounded-full bg-white/90 p-1.5 shadow" aria-label="Move right"><ArrowRight className="h-3 w-3" /></button>
                </span>
              ) : <span />}
              <button type="button" onClick={() => setUrls((x) => x.filter((_, k) => k !== i))} className="rounded-full bg-white/90 p-1.5 text-sindoor shadow" aria-label="Remove"><X className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
        {(multiple || urls.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-xs text-ink/55 transition",
              aspect === "wide" && !multiple ? "aspect-[16/9]" : "aspect-square",
              drag ? "border-gold bg-gold/10" : "border-ink/20 bg-ivory/50 hover:border-gold hover:bg-gold/5",
            )}
          >
            {busy ? <Spinner className="h-5 w-5 animate-spin" /> : <UploadSimple className="h-5 w-5" weight="light" />}
            <span className="px-2 text-center">{busy ? "Uploading…" : label}</span>
          </button>
        )}
      </div>
      {!multiple && urls[0] && (
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 text-xs font-medium text-maroon hover:underline">
          Replace
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
    </div>
  );
}

/** Editable list of strings stored as JSON in a hidden input. */
export function TagInput({ name, defaultValue = [], placeholder = "Type and press Enter" }: { name: string; defaultValue?: string[]; placeholder?: string }) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [v, setV] = useState("");
  const add = () => {
    const t = v.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setV("");
  };
  return (
    <div className={cn(inputClass, "flex min-h-[44px] flex-wrap items-center gap-1.5 py-2")}>
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs ring-1 ring-ink/10">
          {t}
          <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X className="h-3 w-3" /></button>
        </span>
      ))}
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !v && tags.length) setTags(tags.slice(0, -1));
        }}
        onBlur={add}
        placeholder={tags.length ? "" : placeholder}
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  );
}

/** Markdown textarea with live preview toggle. */
export function MarkdownField({ name, defaultValue = "", rows = 14 }: { name: string; defaultValue?: string; rows?: number }) {
  const [v, setV] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-ink/10">
      <div className="flex items-center gap-1 border-b border-ink/[0.06] bg-ivory/60 px-2 py-1.5">
        {(["write", "preview"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn("rounded-full px-3 py-1 text-xs capitalize transition", tab === t ? "bg-white text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50 hover:text-ink")}>
            {t}
          </button>
        ))}
        <span className="ml-auto pr-2 text-[11px] text-ink/40">Markdown: **bold**, ## heading, - list, [link](/url)</span>
      </div>
      <textarea name={name} value={v} onChange={(e) => setV(e.target.value)} rows={rows} className={cn("block w-full resize-y bg-white px-4 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none", tab === "preview" && "hidden")} />
      {tab === "preview" && (
        <div className="prose-spx max-h-[520px] overflow-auto bg-white px-6 py-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(v) }} />
      )}
    </div>
  );
}
