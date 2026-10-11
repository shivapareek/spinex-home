"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/(store)/actions";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { dark?: boolean; className?: string }) {
  const [state, action, pending] = useActionState(subscribe, null);
  return (
    <form action={action} className={cn("w-full max-w-md", className)}>
      <div className="flex gap-2">
        <input name="email" type="email" required placeholder="Enter your email" aria-label="Email address" className="field h-11 flex-1" />
        <button disabled={pending || state?.ok} className="btn-primary h-11 shrink-0">{state?.ok ? "Subscribed ✓" : "Subscribe"}</button>
      </div>
      {(state?.error || state?.message) && <p className={cn("mt-2 text-xs", state.error ? "text-sindoor" : "text-tulsi")}>{state.error || state.message}</p>}
    </form>
  );
}
