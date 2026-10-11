import { TrackForm } from "./form";

export const metadata = { title: "Track your order" };

export default function TrackPage() {
  return (
    <section className="container flex min-h-[70dvh] items-center justify-center py-12 md:py-20">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-semibold md:text-3xl">Track your order</h1>
        <p className="mt-1.5 text-[15px] text-muted">Enter your order number and the email or phone number you used at checkout.</p>
        <TrackForm />
      </div>
    </section>
  );
}
