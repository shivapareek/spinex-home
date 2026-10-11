"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, saveProfile } from "@/app/(store)/account/actions";

const field = "field";
const btn = "btn-primary h-12 w-full";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-3">
      <input name="email" type="email" required placeholder="Email" autoComplete="email" className={field} />
      <input name="password" type="password" required placeholder="Password" autoComplete="current-password" className={field} />
      {state?.error && <p className="text-sm text-sindoor">{state.error}</p>}
      <button disabled={pending} className={btn}>{pending ? "Signing in…" : "Sign in"}</button>
      <p className="pt-2 text-center text-sm text-muted">New here? <Link href="/account/register" className="font-medium text-ink underline underline-offset-4">Create an account</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, null);
  return (
    <form action={action} className="space-y-3">
      <input name="name" required placeholder="Full name" autoComplete="name" className={field} />
      <input name="email" type="email" required placeholder="Email" autoComplete="email" className={field} />
      <input name="phone" inputMode="numeric" placeholder="Mobile (optional)" autoComplete="tel" className={field} />
      <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" autoComplete="new-password" className={field} />
      {state?.error && <p className="text-sm text-sindoor">{state.error}</p>}
      <button disabled={pending} className={btn}>{pending ? "Creating account…" : "Create account"}</button>
      <p className="pt-2 text-center text-sm text-muted">Already have an account? <Link href="/account/login" className="font-medium text-ink underline underline-offset-4">Sign in</Link></p>
    </form>
  );
}

type Addr = { name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
export function ProfileForm({ initial, states }: { initial: Addr; states: string[] }) {
  const [state, action, pending] = useActionState(saveProfile, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input name="name" required defaultValue={initial.name} placeholder="Full name" className={field} />
      <input name="phone" required defaultValue={initial.phone} placeholder="Mobile" className={field} />
      <input name="line1" required defaultValue={initial.line1} placeholder="Address line 1" className={`${field} sm:col-span-2`} />
      <input name="line2" defaultValue={initial.line2} placeholder="Address line 2" className={`${field} sm:col-span-2`} />
      <input name="city" required defaultValue={initial.city} placeholder="City" className={field} />
      <input name="pincode" required defaultValue={initial.pincode} placeholder="Pincode" className={field} />
      <select name="state" required defaultValue={initial.state ?? ""} className={`${field} sm:col-span-2`}>
        <option value="" disabled>State</option>
        {states.map((s) => <option key={s}>{s}</option>)}
      </select>
      {state?.error && <p className="text-sm text-sindoor sm:col-span-2">{state.error}</p>}
      {state?.ok && <p className="text-sm text-tulsi sm:col-span-2">{state.message}</p>}
      <button disabled={pending} className={`${btn} sm:col-span-2 sm:w-auto sm:justify-self-start`}>{pending ? "Saving…" : "Save address"}</button>
    </form>
  );
}
