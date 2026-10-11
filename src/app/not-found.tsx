import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-white px-6 text-center">
      <div>
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">The page you are looking for does not exist or has moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Go to home</Link>
          <Link href="/shop" className="btn-outline">Shop idols</Link>
        </div>
      </div>
    </main>
  );
}
