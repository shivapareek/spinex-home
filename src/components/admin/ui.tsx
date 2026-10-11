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
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink/50 transition hover:text-maroon">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-3xl tracking-tight text-ink md:text-[2.5rem] md:leading-[1.1]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink/55">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, title, description, actions }: { className?: string; children: React.ReactNode; title?: string; description?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("rounded-[1.5rem] bg-white p-6 shadow-[0_1px_0_rgba(20,10,12,0.04),0_20px_50px_-30px_rgba(20,10,12,0.25)] ring-1 ring-ink/[0.06]", className)}>
      {(title || actions) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-xs text-ink/50">{description}</p>}
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
  primary: "bg-ink text-ivory hover:bg-maroon",
  gold: "bg-gold text-ink hover:bg-gold-bright",
  secondary: "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/25",
  ghost: "text-ink/70 hover:bg-ink/[0.05] hover:text-ink",
  danger: "bg-white text-sindoor ring-1 ring-sindoor/25 hover:bg-sindoor hover:text-white",
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
  "w-full rounded-xl bg-ivory/60 px-3.5 py-2.5 text-sm text-ink ring-1 ring-ink/10 placeholder:text-ink/35 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-ink/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink/45">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...p} />;
}
export function Textarea({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "min-h-[110px] leading-relaxed", className)} {...p} />;
}
const SELECT_ARROW = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23140A0C' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>")`;

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
        <span className="h-5 w-9 rounded-full bg-ink/15 transition peer-checked:bg-maroon" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-silk peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint && <span className="block text-[11px] text-ink/45">{hint}</span>}
      </span>
    </label>
  );
}

const badgeTones = {
  neutral: "bg-ink/[0.06] text-ink/70",
  green: "bg-tulsi/10 text-tulsi",
  gold: "bg-gold/15 text-gold-deep",
  red: "bg-sindoor/10 text-sindoor",
  maroon: "bg-maroon/10 text-maroon",
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
    <div className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-ink/[0.06]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/[0.06] bg-ivory/50">
              {head.map((h, i) => (
                <th key={i} className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.05]">{children}</tbody>
        </table>
      </div>
      {!hasRows && <div className="px-6 py-16 text-center text-sm text-ink/45">{empty ?? "Nothing here yet."}</div>}
    </div>
  );
}
export const td = "px-5 py-3.5 align-middle";

export function StatCard({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={cn("rounded-[1.5rem] p-1.5 ring-1", accent ? "bg-maroon-deep ring-maroon" : "bg-white ring-ink/[0.06]")}>
      <div className={cn("rounded-[calc(1.5rem-0.375rem)] px-5 py-5", accent ? "bg-gradient-to-br from-maroon to-maroon-deep text-ivory shadow-inset" : "bg-ivory/40")}>
        <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", accent ? "text-gold-bright/80" : "text-ink/45")}>{label}</p>
        <p className="mt-2 font-display text-3xl tracking-tight">{value}</p>
        {hint && <p className={cn("mt-1 text-xs", accent ? "text-ivory/60" : "text-ink/50")}>{hint}</p>}
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white/50 px-6 py-16 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-ink/50">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Thumb({ src, alt = "", className }: { src?: string | null; alt?: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ivory ring-1 ring-ink/[0.06]", className)}>
      {src ? <img src={src} alt={alt} className="h-full w-full object-contain" /> : null}
    </span>
  );
}
