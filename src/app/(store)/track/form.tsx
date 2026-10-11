"use client";

import { useActionState } from "react";
import { trackOrder } from "./actions";

export function TrackForm() {
  const [state, action, pending] = useActionState(trackOrder, null);
  const field = "h-14 w-full rounded-2xl bg-white px-5 text-sm ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-gold";
  return (
    <form action={action} className="mt-8 space-y-3">
      <input name="order" required placeholder="Order number, e.g. SPX2610111234" className={`${field} uppercase`} />
      <input name="contact" required placeholder="Email or phone" className={field} />
      {state?.error && <p className="text-sm text-sindoor">{state.error}</p>}
      <button disabled={pending} className="h-14 w-full rounded-full bg-ink text-sm font-semibold text-ivory transition hover:bg-maroon disabled:opacity-60">{pending ? "Looking…" : "Track order"}</button>
    </form>
  );
}
