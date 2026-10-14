import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { PageHeader, buttonClass } from "@/components/admin/ui";
import { ThemeEditor } from "@/components/admin/theme-editor";

export const metadata = { title: "Theme" };

export default async function ThemePage() {
  await requireAdmin();
  const theme = getSetting("theme");
  // A few real idols so the preview looks like the store
  const idols = db
    .select({ name: products.name, cutout: products.cutout, price: products.price })
    .from(products)
    .where(and(eq(products.isActive, true), isNotNull(products.cutout)))
    .orderBy(asc(products.sortOrder))
    .limit(3)
    .all()
    .map((p) => ({ name: p.name, image: p.cutout!, price: p.price }));

  return (
    <>
      <PageHeader
        title="Theme"
        description="Pick the colours of your storefront. The preview shows exactly how the store will look; save to make it live."
        actions={
          <a href="/" target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
            View store <ArrowSquareOut weight="light" className="h-4 w-4" />
          </a>
        }
      />
      <ThemeEditor saved={theme} idols={idols} />
    </>
  );
}
