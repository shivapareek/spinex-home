import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { PLACEMENTS, formatDate } from "@/lib/utils";
import { Badge, Card, Field, Input, LinkButton, PageHeader, Select, Textarea, Toggle } from "@/components/admin/ui";
import { ActionButton, ActionForm, MarkdownField, MediaInput, SubmitButton, TagInput } from "@/components/admin/client";
import { rupeeInput } from "@/components/admin/commerce/helpers";
import { SpinFramesEditor } from "../_components/spin-editor";
import { deleteProduct, duplicateProduct, saveProduct } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return { title: "New product" };
  const p = db.select({ name: products.name }).from(products).where(eq(products.id, Number(id))).get();
  return { title: p?.name ?? "Product" };
}

export default async function ProductEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const p = isNew ? null : db.select().from(products).where(eq(products.id, Number(id))).get();
  if (!isNew && !p) notFound();
  const cats = db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)).all();
  const { lowStockThreshold } = getSetting("commerce");
  const placements = new Set(p?.placements ?? []);

  return (
    <>
      <PageHeader
        title={p?.name ?? "New product"}
        description={p ? `Last updated ${formatDate(p.updatedAt, true)}` : "Add a new idol to your catalogue."}
        back={{ href: "/admin/products", label: "Products" }}
        actions={
          p ? (
            <>
              {p.isActive ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>}
              {p.stock <= lowStockThreshold && <Badge tone="red">{p.stock <= 0 ? "Out of stock" : "Low stock"}</Badge>}
              {p.isActive && <LinkButton href={`/product/${p.slug}`} variant="secondary" size="sm">View on store ↗</LinkButton>}
            </>
          ) : undefined
        }
      />

      <ActionForm action={saveProduct.bind(null, p?.id ?? null)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" className="sm:col-span-2"><Input name="name" defaultValue={p?.name} required placeholder="e.g. Meditation Adiyogi" /></Field>
              <Field label="URL slug" hint="Leave blank to generate from the name"><Input name="slug" defaultValue={p?.slug} placeholder="meditation-adiyogi" /></Field>
              <Field label="SKU"><Input name="sku" defaultValue={p?.sku ?? ""} placeholder="SPX-024" /></Field>
              <Field label="Category">
                <Select name="categoryId" defaultValue={p?.categoryId ?? ""}>
                  <option value="">Uncategorised</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Deity" hint="Used for filtering, e.g. Ganesh, Shiva, Krishna"><Input name="deity" defaultValue={p?.deity ?? ""} /></Field>
              <Field label="Badge" hint="Short ribbon on the product card, e.g. “New”, “Festive pick”" className="sm:col-span-2">
                <Input name="badge" defaultValue={p?.badge ?? ""} maxLength={24} />
              </Field>
              <Field label="Short description" hint="One or two lines shown near the price" className="sm:col-span-2">
                <Textarea name="shortDescription" defaultValue={p?.shortDescription ?? ""} className="min-h-[80px]" maxLength={300} />
              </Field>
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-ink/70">Description</span>
                <MarkdownField name="description" defaultValue={p?.description ?? ""} rows={10} />
              </div>
            </div>
          </Card>

          <Card title="Pricing & stock" description="Enter amounts in rupees. Prices are GST-inclusive.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Selling price (₹)"><Input name="price" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={rupeeInput(p?.price)} required /></Field>
              <Field label="MRP (₹)" hint="Optional — shown struck through when higher than price"><Input name="mrp" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={rupeeInput(p?.mrp)} /></Field>
              <Field label="Stock" hint={`Flagged as low at ${lowStockThreshold} or fewer`}><Input name="stock" type="number" min="0" step="1" defaultValue={p?.stock ?? 0} required /></Field>
              <Field label="Weight (grams)" hint="Used for shipping"><Input name="weightGrams" type="number" min="0" step="1" defaultValue={p?.weightGrams ?? ""} /></Field>
            </div>
          </Card>

          <Card title="Photos" description="The first image is the cover. Drag-and-drop or click to upload; hover a photo to reorder.">
            <MediaInput name="images" multiple defaultValue={p?.images ?? []} folder="products" label="Add photos" />
            <div className="mt-6 grid gap-4 border-t border-ink/[0.06] pt-6 sm:grid-cols-[200px_1fr] sm:items-start">
              <MediaInput name="cutout" defaultValue={p?.cutout} folder="products" accept="image/png,image/webp" label="Upload cutout" />
              <div>
                <p className="text-sm font-medium text-ink">Cutout</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/50">Transparent PNG/WebP used by the Try-in-your-space visualizer. Crop tight to the idol, with its base at the bottom edge.</p>
              </div>
            </div>
          </Card>

          <Card title="360° spin" description="An ordered set of frames covering one full rotation. 36 frames is a good balance of smoothness and weight.">
            <SpinFramesEditor name="spinFrames" defaultValue={p?.spinFrames ?? []} />
          </Card>

          <Card title="3D & AR" description="Optional models for “View in your space” — GLB for Android/web, USDZ for iPhone Quick Look.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink/70">GLB model</span>
                <MediaInput name="modelGlb" defaultValue={p?.modelGlb} folder="models" accept=".glb,model/gltf-binary" label="Upload .glb" />
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink/70">USDZ model</span>
                <MediaInput name="modelUsdz" defaultValue={p?.modelUsdz} folder="models" accept=".usdz,model/vnd.usdz+zip" label="Upload .usdz" />
              </div>
            </div>
          </Card>

          <Card title="Visualizer" description="Where this idol can be previewed, and how big it really is.">
            <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
              <fieldset>
                <legend className="mb-2 text-xs font-medium text-ink/70">Placements</legend>
                <div className="grid grid-cols-2 gap-2">
                  {PLACEMENTS.map((pl) => (
                    <label key={pl.key} className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-ivory/60 px-3.5 py-2.5 text-sm ring-1 ring-ink/[0.06] transition has-[:checked]:bg-gold/10 has-[:checked]:ring-gold/50">
                      <input type="checkbox" name="placements" value={pl.key} defaultChecked={placements.has(pl.key)} className="h-4 w-4 accent-maroon" />
                      {pl.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label="Height (cm)" hint="Drives realistic scale in scenes">
                <Input name="heightCm" type="number" step="0.1" min="0" inputMode="decimal" defaultValue={p?.heightCm ?? ""} />
              </Field>
            </div>
          </Card>

          <Card title="Specifications">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Material"><Input name="material" defaultValue={p?.material ?? ""} placeholder="Polyresin with gold leaf finish" /></Field>
              <Field label="Dimensions"><Input name="dimensions" defaultValue={p?.dimensions ?? ""} placeholder="9 × 6 × 12 cm" /></Field>
            </div>
          </Card>

          <Card title="Marketplace links" description="Shown as “Also available on” buttons. Leave blank to hide.">
            <div className="grid gap-4">
              <Field label="Amazon"><Input name="mp_amazon" type="url" defaultValue={p?.marketplace?.amazon ?? ""} placeholder="https://www.amazon.in/dp/…" /></Field>
              <Field label="Flipkart"><Input name="mp_flipkart" type="url" defaultValue={p?.marketplace?.flipkart ?? ""} placeholder="https://www.flipkart.com/…" /></Field>
              <Field label="Meesho"><Input name="mp_meesho" type="url" defaultValue={p?.marketplace?.meesho ?? ""} placeholder="https://www.meesho.com/…" /></Field>
            </div>
          </Card>

          <Card title="Search engine listing" description="Optional — defaults to the product name and short description.">
            <div className="grid gap-4">
              <Field label="SEO title"><Input name="seoTitle" defaultValue={p?.seoTitle ?? ""} maxLength={120} /></Field>
              <Field label="SEO description"><Textarea name="seoDescription" defaultValue={p?.seoDescription ?? ""} className="min-h-[80px]" maxLength={320} /></Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card title="Visibility">
            <div className="space-y-4">
              <Toggle name="isActive" defaultChecked={p?.isActive ?? true} label="Live in store" hint="Hidden products can't be viewed or bought" />
              <Toggle name="isFeatured" defaultChecked={p?.isFeatured ?? false} label="Featured" hint="Highlighted on the homepage" />
              <Toggle name="isBestseller" defaultChecked={p?.isBestseller ?? false} label="Bestseller" hint="Shows a bestseller ribbon" />
              <Field label="Sort order" hint="Lower numbers appear first"><Input name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} /></Field>
            </div>
          </Card>
          <Card title="Tags" description="Search keywords, e.g. ganpati, vinayak">
            <TagInput name="tags" defaultValue={p?.tags ?? []} />
          </Card>
          <SubmitButton className="w-full">{isNew ? "Create product" : "Save changes"}</SubmitButton>
          {p && (
            <div className="flex items-center justify-center gap-1">
              <ActionButton action={duplicateProduct.bind(null, p.id)}>Duplicate</ActionButton>
              <ActionButton
                action={deleteProduct.bind(null, p.id)}
                confirm={`Delete “${p.name}” permanently? Its reviews will be removed too.`}
                className="text-sindoor hover:bg-sindoor/10 hover:text-sindoor"
              >
                Delete product
              </ActionButton>
            </div>
          )}
        </div>
      </ActionForm>
    </>
  );
}
