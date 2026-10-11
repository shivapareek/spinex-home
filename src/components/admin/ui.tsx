import Link from "next/link";
import { cn } from "@/lib/utils";

/* Server-safe admin primitives. Client-only pieces live in ./client.tsx */

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, title, description, actions }: { className?: string; children: React.ReactNode; title?: string; description?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white p-5 md:p-6", className)}>
      {(title || actions) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-xs text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
const btn: Record<BtnVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink-3",
  gold: "bg-accent text-white hover:bg-accent-deep",
  secondary: "border border-line bg-white text-ink hover:border-ink/40",
  ghost: "text-ink/70 hover:bg-surface hover:text-ink",
  danger: "border border-sindoor/25 bg-white text-sindoor hover:bg-sindoor hover:text-white",
};
export const buttonClass = (v: BtnVariant = "primary", size: "sm" | "md" = "md") =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-silk active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "h-8 px-3.5 text-xs" : "h-10 px-5 text-sm",
    btn[v],
  );

export function Button({ variant = "primary", size = "md", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return <button className={cn(buttonClass(variant, size), className)} {...props} />;
}

export function LinkButton({ href, variant = "primary", size = "md", className, children }: { href: string; variant?: BtnVariant; size?: "sm" | "md"; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(buttonClass(variant, size), className)}>
      {children}
    </Link>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 transition focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/5";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...p} />;
}
export function Textarea({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "min-h-[110px] leading-relaxed", className)} {...p} />;
}
const SELECT_ARROW = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23111111' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>")`;

export function Select({ className, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...p}
      className={cn(inputClass, "appearance-none bg-[right_0.9rem_center] bg-no-repeat pr-9", className)}
      style={{ backgroundImage: SELECT_ARROW, ...p.style }}
    >
      {children}
    </select>
  );
}

/** Native checkbox styled as a switch. Unchecked boxes don't submit — read with formData.get(name) === "on". */
export function Toggle({ name, defaultChecked, label, hint }: { name: string; defaultChecked?: boolean; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-5 w-9 rounded-full bg-ink/15 transition peer-checked:bg-ink" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-silk peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint && <span className="block text-[11px] text-muted">{hint}</span>}
      </span>
    </label>
  );
}

const badgeTones = {
  neutral: "bg-surface text-ink/70 ring-1 ring-inset ring-line",
  green: "bg-tulsi/10 text-tulsi",
  gold: "bg-accent-soft text-accent-deep",
  red: "bg-sindoor/10 text-sindoor",
  maroon: "bg-violet-500/10 text-violet-700",
  blue: "bg-sky-500/10 text-sky-700",
} as const;
export type BadgeTone = keyof typeof badgeTones;
export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize", badgeTones[tone], className)}>{children}</span>;
}

export const orderStatusTone: Record<string, BadgeTone> = {
  pending: "gold",
  confirmed: "blue",
  packed: "blue",
  shipped: "maroon",
  delivered: "green",
  cancelled: "red",
  returned: "neutral",
  paid: "green",
  failed: "red",
  refunded: "neutral",
  new: "gold",
  contacted: "blue",
  closed: "neutral",
};

export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: React.ReactNode }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              {head.map((h, i) => (
                <th key={i} className="whitespace-nowrap px-5 py-3 text-xs font-medium text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
      {!hasRows && <div className="px-6 py-16 text-center text-sm text-muted">{empty ?? "Nothing here yet."}</div>}
    </div>
  );
}
export const td = "px-5 py-3.5 align-middle";

export function StatCard({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border px-5 py-5", accent ? "border-accent/20 bg-accent-soft" : "border-line bg-white")}>
      <p className={cn("text-xs font-medium", accent ? "text-accent-deep" : "text-muted")}>{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tracking-tight md:text-3xl", accent ? "text-accent-deep" : "text-ink")}>{value}</p>
      {hint && <p className={cn("mt-1 text-xs", accent ? "text-accent-deep/70" : "text-muted")}>{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <p className="text-lg font-semibold text-ink">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Thumb({ src, alt = "", className }: { src?: string | null; alt?: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface", className)}>
      {src ? <img src={src} alt={alt} className="h-full w-full object-contain" /> : null}
    </span>
  );
}
