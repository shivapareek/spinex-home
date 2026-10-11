import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "@/components/store/auth-forms";

export const metadata = { title: "Create account" };

export default async function Register() {
  if (await getSession()) redirect("/account");
  return (
    <section className="container flex min-h-[85dvh] max-w-md flex-col justify-center pb-24 pt-36">
      <h1 className="font-display text-5xl tracking-tight">Create your account</h1>
      <p className="mb-8 mt-2 text-ink/55">Faster checkout and order tracking, all in one place.</p>
      <RegisterForm />
    </section>
  );
}
