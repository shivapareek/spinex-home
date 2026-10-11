import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { INDIAN_STATES } from "@/lib/orders";
import { razorpayKeys } from "@/lib/razorpay";
import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const s = await getSession();
  const u = s ? db.select().from(users).where(eq(users.id, s.uid)).get() : null;
  const c = getSetting("commerce");
  return (
    <section className="container py-10 md:py-14">
      <h1 className="mb-8 text-3xl font-semibold md:text-4xl">Checkout</h1>
      <CheckoutForm
        states={INDIAN_STATES}
        codEnabled={c.codEnabled}
        codFee={c.codFee}
        razorpayEnabled={razorpayKeys().enabled}
        prefill={{ name: u?.address?.name ?? u?.name, email: u?.email, phone: u?.phone ?? u?.address?.phone, address: u?.address }}
      />
    </section>
  );
}
