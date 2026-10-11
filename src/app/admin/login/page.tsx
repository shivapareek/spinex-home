import { LoginForm } from "./form";

export const metadata = { title: "Admin sign in" };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-ink px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,0.22),transparent_60%)]" />
      <div className="relative w-full max-w-sm rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
        <div className="rounded-[calc(2rem-0.375rem)] bg-ink-2 px-7 py-9 shadow-inset">
          <p className="eyebrow bg-gold/10 text-gold-bright ring-1 ring-gold/20">Spinex Home · Admin</p>
          <h1 className="mt-5 font-display text-3xl text-ivory">Welcome back.</h1>
          <p className="mt-1.5 text-sm text-ivory/50">Sign in to manage your store.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
