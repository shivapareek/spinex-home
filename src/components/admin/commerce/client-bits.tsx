"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ActionResult } from "../client";

/** Switch that calls a server action on click (optimistic). */
export function ToggleAction({ action, checked, label }: { action: () => Promise<ActionResult>; checked: boolean; label: string }) {
  const [on, setOn] = useState(checked);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={() => {
        const prev = on;
        setOn(!prev);
        start(async () => {
          const res = await action();
          if (res?.error) {
            setOn(prev);
            toast.error(res.error);
          } else {
            if (res?.message) toast.success(res.message);
            router.refresh();
          }
        });
      }}
      className={cn("relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ease-silk disabled:opacity-60", on ? "bg-ink" : "bg-ink/15")}
    >
      <span className={cn("absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-silk", on && "translate-x-4")} />
    </button>
  );
}

/** Select that auto-submits its parent GET form. */
export function AutoSubmitSelect({ children, className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...p} className={className} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {children}
    </select>
  );
}
