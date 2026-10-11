"use client";

import { useActionState } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { subscribe } from "@/app/(store)/actions";
import { cn } from "@/lib/utils";

export function NewsletterForm({ dark = true }: { dark?: boolean }) {
  const [state, action, pending] = useActionState(subscribe, null);
  return (
    <form action={action} className="w-full max-w-md">
      <div className={cn("flex items-center rounded-full p-1.5 ring-1", dark ? "bg-white/[0.06] ring-white/15" : "bg-white ring-ink/10")}>
        <input
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          aria-label="Email address"
          className={cn("h-11 flex-1 bg-transparent px-4 text-sm outline-none", dark ? "text-ivory placeholder:text-ivory/35" : "text-ink placeholder:text-ink/35")}
        />
        <button disabled={pending || state?.ok} className="group flex h-11 items-center gap-2 rounded-full bg-gold pl-5 pr-1.5 text-sm font-semibold text-ink transition hover:bg-gold-bright active:scale-[0.97] disabled:opacity-70">
          {state?.ok ? "Subscribed" : "Subscribe"}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink/10 transition-transform duration-500 ease-silk group-hover:translate-x-0.5">
            {state?.ok ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </span>
        </button>
      </div>
      {(state?.error || state?.message) && <p className={cn("mt-3 px-4 text-xs", state.error ? "text-sindoor" : dark ? "text-gold-bright" : "text-tulsi")}>{state.error || state.message}</p>}
    </form>
  );
}
