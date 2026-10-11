"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(adminLogin, null);
  const field = "w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-ivory ring-1 ring-white/10 placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-gold";
  return (
    <form action={action} className="mt-8 space-y-3">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <input name="email" type="email" required autoComplete="email" placeholder="Email" className={field} />
      <input name="password" type="password" required autoComplete="current-password" placeholder="Password" className={field} />
      {state?.error && <p className="text-sm text-sindoor">{state.error}</p>}
      <button disabled={pending} className="mt-2 h-12 w-full rounded-full bg-gold text-sm font-semibold text-ink transition hover:bg-gold-bright active:scale-[0.98] disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
