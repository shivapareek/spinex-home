"use client";

import { useActionState } from "react";
import { sendEnquiry } from "@/app/(store)/actions";
import { cn } from "@/lib/utils";

export function EnquiryForm({ type }: { type: "bulk" | "contact" }) {
  const [state, action, pending] = useActionState(sendEnquiry, null);
  const field = "h-12 w-full rounded-2xl bg-white px-4 text-sm ring-1 ring-ink/10 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-gold";
  if (state?.ok) return <div className="rounded-[2rem] bg-tulsi/10 px-6 py-10 text-center text-tulsi"><p className="font-display text-2xl">Dhanyavaad!</p><p className="mt-2 text-sm">{state.message}</p></div>;
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
      <button disabled={pending} className="h-14 rounded-full bg-ink text-sm font-semibold text-ivory transition hover:bg-maroon disabled:opacity-60 sm:col-span-2">{pending ? "Sending…" : type === "bulk" ? "Request catalogue pricing" : "Send message"}</button>
    </form>
  );
}
