"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(adminLogin, null);
  const field = "field";
  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <input name="email" type="email" required autoComplete="email" placeholder="Email" className={field} />
      <input name="password" type="password" required autoComplete="current-password" placeholder="Password" className={field} />
      {state?.error && <p className="text-sm text-sindoor">{state.error}</p>}
      <button disabled={pending} className="btn-primary mt-2 h-12 w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
