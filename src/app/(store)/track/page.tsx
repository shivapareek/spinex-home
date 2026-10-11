import { TrackForm } from "./form";

export const metadata = { title: "Track your order" };

export default function TrackPage() {
  return (
    <section className="container flex min-h-[80dvh] max-w-xl flex-col justify-center pb-24 pt-36">
      <h1 className="font-display text-5xl tracking-tight">Track your order</h1>
      <p className="mt-3 text-ink/60">Enter your order number and the email or phone you used at checkout.</p>
      <TrackForm />
    </section>
  );
}
