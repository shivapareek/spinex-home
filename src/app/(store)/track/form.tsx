"use client";

import { useActionState } from "react";
import { trackOrder } from "./actions";

export function TrackForm() {
  const [state, action, pending] = useActionState(trackOrder, null);
  const field = "field";
  return (
    <form action={action} className="mt-6 space-y-3">
      <input name="order" required placeholder="Order number, e.g. SPX2610111234" className={`${field} uppercase placeholder:normal-case`} />
      <input name="contact" required placeholder="Email or phone number" className={field} />
      {state?.error && <p className="text-sm text-sindoor">{state.error}</p>}
      <button disabled={pending} className="btn-primary h-12 w-full">{pending ? "Searching…" : "Track order"}</button>
    </form>
  );
}
