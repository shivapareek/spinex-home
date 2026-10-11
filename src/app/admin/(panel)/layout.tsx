import { Toaster } from "sonner";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, orders, reviews } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Admin", template: "%s · Spinex Admin" }, robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const count = (q: { c: number } | undefined) => Number(q?.c ?? 0);
  const badges = {
    orders: count(db.select({ c: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending")).get()),
    reviews: count(db.select({ c: sql<number>`count(*)` }).from(reviews).where(eq(reviews.isApproved, false)).get()),
    enquiries: count(db.select({ c: sql<number>`count(*)` }).from(enquiries).where(eq(enquiries.status, "new")).get()),
  };
  return (
    <div className="min-h-[100dvh] bg-[#F6F1E7] text-ink">
      <AdminSidebar user={{ name: session.name, email: session.email, role: session.role }} badges={badges} />
      <main className="lg:pl-[272px]">
        <div className="mx-auto max-w-[1280px] px-4 pb-24 pt-20 md:px-8 lg:pt-10">{children}</div>
      </main>
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: 16, fontFamily: "var(--font-sans)" } }} />
    </div>
  );
}
