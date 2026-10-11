import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/store/auth-forms";

export const metadata = { title: "Sign in" };

export default async function Login() {
  if (await getSession()) redirect("/account");
  return (
    <section className="container flex min-h-[85dvh] max-w-md flex-col justify-center pb-24 pt-36">
      <p className="font-deva text-xl text-maroon/70">स्वागतम्</p>
      <h1 className="mt-2 font-display text-5xl tracking-tight">Welcome back</h1>
      <p className="mb-8 mt-2 text-ink/55">Sign in to see your orders and saved address.</p>
      <LoginForm />
    </section>
  );
}
