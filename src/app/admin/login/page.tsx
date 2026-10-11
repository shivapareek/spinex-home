import { LoginForm } from "./form";

export const metadata = { title: "Admin sign in" };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="currentColor" aria-hidden>
              <path d="M12 2.5c-.9 2.7-3.6 4-3.6 7.2a3.6 3.6 0 0 0 7.2 0c0-3.2-2.7-4.5-3.6-7.2Z" />
              <path d="M4.5 16.5h15M7 20h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">Spinex <span className="font-normal text-muted">Admin</span></span>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted">Sign in to manage your store.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
