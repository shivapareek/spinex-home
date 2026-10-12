import Link from "next/link";
import { asc } from "drizzle-orm";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSetting, type SpaceKind } from "@/lib/settings";
import { Card, Field, Input, PageHeader, Select, Textarea, Toggle, buttonClass } from "@/components/admin/ui";
import { ActionButton, ActionForm, SubmitButton, TagInput } from "@/components/admin/client";
import { Repeater } from "@/components/admin/cms/repeater";
import { ProductPicker } from "@/components/admin/cms/product-picker";
import { SectionsManager } from "@/components/admin/cms/sections-manager";
import { resetHome, saveHome } from "./actions";

export const metadata = { title: "Homepage" };

const SPACES: { kind: SpaceKind; word: string }[] = [
  { kind: "car", word: "Car" },
  { kind: "temple", word: "Mandir" },
  { kind: "desk", word: "Desk" },
  { kind: "shelf", word: "Home" },
];

export default async function HomeEditor() {
  await requireAdmin();
  const home = getSetting("home");
  const site = getSetting("site");
  const list = db
    .select({ slug: products.slug, name: products.name, cutout: products.cutout, images: products.images, isActive: products.isActive })
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.name))
    .all()
    .map((p) => ({ slug: p.slug, name: p.name, image: p.cutout || p.images?.[0] || null, isActive: p.isActive }));
  const options = list.map((p) => ({ value: p.slug, label: p.name + (p.isActive ? "" : " (hidden)") }));

  const ProductSelect = ({ name, value }: { name: string; value: string }) => (
    <Select name={name} defaultValue={value}>
      <option value="">Automatic</option>
      {value && !list.some((p) => p.slug === value) && <option value={value}>Missing: {value}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Every block on the storefront homepage, top to bottom. Change the text and idols here; turn sections on or off and reorder them on the right."
        actions={
          <>
            <a href="/" target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
              View homepage <ArrowSquareOut weight="light" className="h-4 w-4" />
            </a>
            <ActionButton action={resetHome} confirm="Reset all homepage content to the original defaults? This cannot be undone." variant="ghost" size="md">
              Reset to defaults
            </ActionButton>
          </>
        }
      />

      <ActionForm action={saveHome} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card title="Hero" description="Idol on the pedestal with the deity name behind it. The big word comes from each product's deity.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading"><Input name="hero.title" defaultValue={home.hero.title} required placeholder="God idols for your" /></Field>
              <Field label="Heading (orange part)" hint="Shown in the accent colour after the heading"><Input name="hero.titleAccent" defaultValue={home.hero.titleAccent} placeholder="car, mandir and desk." /></Field>
              <Field label="Main button text"><Input name="hero.primaryCta.label" defaultValue={home.hero.primaryCta.label} /></Field>
              <Field label="Main button link"><Input name="hero.primaryCta.href" defaultValue={home.hero.primaryCta.href} placeholder="/shop" /></Field>
              <Field label="Second button text"><Input name="hero.secondaryCta.label" defaultValue={home.hero.secondaryCta.label} /></Field>
              <Field label="Second button link"><Input name="hero.secondaryCta.href" defaultValue={home.hero.secondaryCta.href} placeholder="/experience" /></Field>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-1 text-xs font-medium text-ink/70">Idols on the pedestal</p>
              <p className="mb-4 text-[11px] text-ink/45">They rotate in this order. Only products with a transparent cut-out image are shown.</p>
              <ProductPicker name="hero.featured" products={list} defaultValue={home.hero.featured} emptyText="Add at least one idol for the pedestal." />
            </div>
          </Card>

          <Card title="Where will your idol live?" description="Big words Car, Mandir, Desk and Home. Hovering a word shows that space with the idol you pick here.">
            <div className="grid gap-4">
              <Field label="Heading"><Input name="spaces.title" defaultValue={home.spaces.title} /></Field>
              {SPACES.map(({ kind, word }) => (
                <div key={kind} className="grid gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line sm:grid-cols-[110px_1fr_220px] sm:items-end">
                  <p className="font-display text-2xl font-extrabold uppercase tracking-tight">{word}</p>
                  <Field label="Short line"><Input name={`spaces.${kind}.line`} defaultValue={home.spaces.items[kind]?.line} /></Field>
                  <Field label="Idol shown"><ProductSelect name={`spaces.${kind}.productSlug`} value={home.spaces.items[kind]?.productSlug ?? ""} /></Field>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Collection" description="Products that slide sideways as visitors scroll.">
            <div className="grid gap-4">
              <Field label="Heading"><Input name="collection.title" defaultValue={home.collection.title} /></Field>
              <div>
                <p className="mb-1 text-xs font-medium text-ink/70">Products</p>
                <p className="mb-3 text-[11px] text-ink/45">Leave empty to show your featured products automatically. Or pick products and order them yourself.</p>
                <ProductPicker name="collection.productSlugs" products={list} defaultValue={home.collection.productSlugs} max={16} emptyText="Automatic: your featured products are shown." />
              </div>
            </div>
          </Card>

          <Card title="Statement" description='The big sentence, e.g. "Ganesh (image) for new beginnings, Hanuman (image) for strength…"'>
            <div className="grid gap-4">
              <Repeater
                name="statement.items"
                defaultValue={home.statement.items}
                max={6}
                addLabel="Add part"
                fields={[
                  { key: "word", label: "Word", placeholder: "Ganesh", span: "sm:col-span-3" },
                  { key: "productSlug", label: "Small image of", type: "select", placeholder: "No image", options, span: "sm:col-span-4" },
                  { key: "phrase", label: "Then", placeholder: "for new beginnings", span: "sm:col-span-5" },
                ]}
              />
              <Field label="Ending (shown in grey)"><Input name="statement.tail" defaultValue={home.statement.tail} /></Field>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Find your deity" description="Deity tiles are built from your products automatically.">
              <Field label="Heading"><Input name="deities.title" defaultValue={home.deities.title} /></Field>
            </Card>
            <Card title="Testimonials" description="Shown only when Admin → Testimonials has active entries.">
              <Field label="Heading"><Input name="testimonials.title" defaultValue={home.testimonials.title} /></Field>
            </Card>
          </div>

          <Card title="Try in your space banner" description="Car dashboard scene with a white card and buttons to the visualizer.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading" className="sm:col-span-2"><Input name="tryBanner.title" defaultValue={home.tryBanner.title} /></Field>
              <Field label="Text" className="sm:col-span-2"><Textarea name="tryBanner.body" defaultValue={home.tryBanner.body} className="min-h-[80px]" /></Field>
              <Field label="Idol on the dashboard"><ProductSelect name="tryBanner.productSlug" value={home.tryBanner.productSlug} /></Field>
            </div>
          </Card>

          <Card title="Marketplaces" description="Store names in the strip. Add your store link to make a name clickable.">
            <div className="grid gap-4">
              <Field label="Label"><Input name="marketplaces.title" defaultValue={home.marketplaces.title} /></Field>
              <Repeater
                name="marketplaces.items"
                defaultValue={home.marketplaces.items}
                max={6}
                addLabel="Add marketplace"
                fields={[
                  { key: "name", label: "Name", placeholder: "Amazon", span: "sm:col-span-4" },
                  { key: "url", label: "Store link (optional)", placeholder: "https://…", span: "sm:col-span-8", type: "url" },
                ]}
              />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Bulk & gifting" description="The saffron block.">
              <div className="grid gap-4">
                <Field label="Heading"><Input name="bulk.title" defaultValue={home.bulk.title} /></Field>
                <Field label="Text"><Textarea name="bulk.body" defaultValue={home.bulk.body} className="min-h-[80px]" /></Field>
              </div>
            </Card>
            <Card title="FAQs" description="Questions themselves are in Admin → FAQs.">
              <Field label="Heading"><Input name="faq.title" defaultValue={home.faq.title} /></Field>
            </Card>
          </div>
        </div>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-10 xl:self-start">
          <Card title="Sections" description="Order and visibility of blocks below the hero.">
            <SectionsManager name="sections" defaultValue={home.sections} />
          </Card>
          <Card title="Announcement bar" description="Thin black strip at the very top of every page.">
            <div className="space-y-4">
              <Toggle name="announcement.enabled" defaultChecked={site.announcement.enabled} label="Show announcement bar" />
              <TagInput name="announcement.items" defaultValue={site.announcement.items} placeholder="Free shipping above ₹499" />
              <p className="text-[11px] text-ink/45">Messages rotate in order. Press Enter after each.</p>
            </div>
          </Card>
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-muted">Changes go live as soon as you save.</p>
            <SubmitButton className="mt-4 w-full">Save homepage</SubmitButton>
            <Link href="/" target="_blank" className="mt-3 block text-center text-xs font-medium text-ink/70 hover:text-ink">Open homepage ↗</Link>
          </div>
        </aside>
      </ActionForm>
    </>
  );
}
