import Link from "next/link";
import { MagnifyingGlass, Star } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { buttonClass, inputClass } from "../ui";

/* Server-safe list helpers shared by the commerce admin modules. */

/** GET search form that keeps other filters as hidden fields. */
export function SearchForm({
  q,
  placeholder = "Search…",
  keep = {},
  className,
}: {
  q?: string;
  placeholder?: string;
  keep?: Record<string, string | undefined>;
  className?: string;
}) {
  return (
    <form method="get" className={cn("relative w-full sm:max-w-xs", className)} role="search">
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <MagnifyingGlass weight="light" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
      <input name="q" defaultValue={q} placeholder={placeholder} className={cn(inputClass, "rounded-full bg-white pl-10")} aria-label="Search" />
    </form>
  );
}

/** Horizontal pill tabs (links). Scrolls sideways on small screens. */
export function FilterTabs({ tabs }: { tabs: { label: string; href: string; active: boolean; count?: number }[] }) {
  return (
    <nav className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0" aria-label="Filters">
      {tabs.map((t) => (
        <Link
          key={t.href + t.label}
          href={t.href}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-all duration-300 ease-silk",
            t.active ? "bg-ink text-white" : "bg-white text-ink/60 ring-1 ring-ink/10 hover:text-ink hover:ring-ink/25",
          )}
        >
          {t.label}
          {t.count != null && (
            <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", t.active ? "bg-white/20 text-white" : "bg-ink/[0.06] text-ink/50")}>{t.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-accent", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} weight={i <= value ? "fill" : "light"} className={cn("h-3.5 w-3.5", i > value && "text-ink/20")} />
      ))}
    </span>
  );
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-between gap-3 text-xs text-ink/50">
      <span>
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? <Link className={buttonClass("secondary", "sm")} href={href(page - 1)}>Previous</Link> : null}
        {page < pages ? <Link className={buttonClass("secondary", "sm")} href={href(page + 1)}>Next</Link> : null}
      </div>
    </div>
  );
}

/** Label / value row used in detail side cards. */
export function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="shrink-0 text-ink/45">{label}</span>
      <span className="min-w-0 break-words text-right text-ink">{children}</span>
    </div>
  );
}

/** Build a query string, dropping empty values. */
export function qs(params: Record<string, string | number | undefined | null>) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") s.set(k, String(v));
  const str = s.toString();
  return str ? `?${str}` : "";
}
