"use client";

import { useActionState } from "react";
import { sendEnquiry } from "@/app/(store)/actions";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function EnquiryForm({ type }: { type: "bulk" | "contact" }) {
  const [state, action, pending] = useActionState(sendEnquiry, null);
  const field = "field";
  if (state?.ok) return <div className="rounded-2xl border border-tulsi/20 bg-tulsi/5 px-6 py-10 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-tulsi/10"><Check className="h-6 w-6 text-tulsi" weight="bold" /></span><p className="mt-4 text-lg font-semibold">Thank you!</p><p className="mt-1 text-sm text-muted">{state.message}</p></div>;
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="type" value={type} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input name="name" required placeholder="Your name" className={field} />
      <input name="phone" required placeholder="Phone / WhatsApp" inputMode="tel" className={field} />
      <input name="email" type="email" placeholder="Email (optional)" className={field} />
      {type === "bulk" ? (
        <>
          <input name="company" placeholder="Business name" className={field} />
          <input name="city" placeholder="City" className={field} />
          <input name="quantity" placeholder="Approx. quantity (e.g. 200 pcs)" className={field} />
        </>
      ) : (
        <input name="city" placeholder="City (optional)" className={field} />
      )}
      <textarea name="message" rows={4} placeholder={type === "bulk" ? "Which idols are you interested in?" : "How can we help?"} className={cn(field, "h-auto py-3 sm:col-span-2")} />
      {state?.error && <p className="text-sm text-sindoor sm:col-span-2">{state.error}</p>}
      <button disabled={pending} className="btn-primary h-12 sm:col-span-2">{pending ? "Sending…" : type === "bulk" ? "Request catalogue pricing" : "Send message"}</button>
    </form>
  );
}
