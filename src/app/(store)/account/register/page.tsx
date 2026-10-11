import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "@/components/store/auth-forms";

export const metadata = { title: "Create account" };

export default async function Register() {
  if (await getSession()) redirect("/account");
  return (
    <section className="container flex min-h-[70dvh] items-center justify-center py-12 md:py-20">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-semibold md:text-3xl">Create your account</h1>
        <p className="mb-6 mt-1.5 text-[15px] text-muted">Check out faster and track your orders in one place.</p>
        <RegisterForm />
      </div>
    </section>
  );
}
