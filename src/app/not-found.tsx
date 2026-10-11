import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-ink px-6 text-center text-ivory">
      <div>
        <p className="font-deva text-7xl text-gold">४०४</p>
        <h1 className="mt-6 font-display text-4xl tracking-tight md:text-6xl">This path leads nowhere.</h1>
        <p className="mx-auto mt-4 max-w-md text-ivory/55">Even the wisest pilgrims take a wrong turn. Let us guide you back.</p>
        <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-gold px-6 text-sm font-semibold text-ink">Return home</Link>
      </div>
    </main>
  );
}
