import { and, asc, eq } from "drizzle-orm";
import { Toaster } from "sonner";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { getSetting } from "@/lib/settings";
import { listCategories } from "@/lib/catalog";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { SearchPalette } from "@/components/store/search-palette";

export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const site = getSetting("site");
  const commerce = getSetting("commerce");
  const footerPages = db.select({ slug: pages.slug, title: pages.title }).from(pages).where(and(eq(pages.isPublished, true), eq(pages.showInFooter, true))).orderBy(asc(pages.id)).all();
  const cats = listCategories();
  return (
    <div className="grain">
      <Header announcement={site.announcement.enabled ? site.announcement.items : []} />
      <main>{children}</main>
      <Footer site={site} pages={footerPages} categories={cats} />
      <CartDrawer freeShippingThreshold={commerce.freeShippingThreshold} />
      <SearchPalette />
      <Toaster position="bottom-center" toastOptions={{ style: { borderRadius: 999, background: "#140A0C", color: "#F7F0E3", border: "1px solid rgba(201,162,74,.3)" } }} />
    </div>
  );
}
