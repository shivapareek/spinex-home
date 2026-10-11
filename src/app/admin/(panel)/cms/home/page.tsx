import Link from "next/link";
import { asc } from "drizzle-orm";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { Card, Field, Input, PageHeader, Select, Textarea, Toggle, buttonClass } from "@/components/admin/ui";
import { ActionButton, ActionForm, SubmitButton, TagInput } from "@/components/admin/client";
import { Repeater } from "@/components/admin/cms/repeater";
import { ProductPicker } from "@/components/admin/cms/product-picker";
import { SectionsManager } from "@/components/admin/cms/sections-manager";
import { resetHome, saveHome } from "./actions";

export const metadata = { title: "Homepage" };

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

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Everything on the storefront homepage — hero, section order and the copy for each block."
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
          <Card title="Hero" description="The first thing every visitor sees.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Eyebrow" className="sm:col-span-2"><Input name="hero.eyebrow" defaultValue={home.hero.eyebrow} /></Field>
              <Field label="Title"><Input name="hero.title" defaultValue={home.hero.title} required /></Field>
              <Field label="Title accent" hint="Highlighted words shown after the title"><Input name="hero.titleAccent" defaultValue={home.hero.titleAccent} /></Field>
              <Field label="Subtitle" className="sm:col-span-2"><Textarea name="hero.subtitle" defaultValue={home.hero.subtitle} className="min-h-[80px]" /></Field>
              <Field label="Shloka (Devanagari)"><Input name="hero.shloka" defaultValue={home.hero.shloka} lang="hi" /></Field>
              <Field label="Shloka meaning"><Input name="hero.shlokaMeaning" defaultValue={home.hero.shlokaMeaning} /></Field>
              <Field label="Primary button label"><Input name="hero.primaryCta.label" defaultValue={home.hero.primaryCta.label} /></Field>
              <Field label="Primary button link"><Input name="hero.primaryCta.href" defaultValue={home.hero.primaryCta.href} placeholder="/shop" /></Field>
              <Field label="Secondary button label"><Input name="hero.secondaryCta.label" defaultValue={home.hero.secondaryCta.label} /></Field>
              <Field label="Secondary button link"><Input name="hero.secondaryCta.href" defaultValue={home.hero.secondaryCta.href} placeholder="/experience" /></Field>
            </div>
            <div className="mt-6 border-t border-ink/[0.06] pt-5">
              <p className="mb-1 text-xs font-medium text-ink/70">Darshan carousel</p>
              <p className="mb-4 text-[11px] text-ink/45">Idols that rotate in the hero, in this order. Products with a transparent cutout look best.</p>
              <ProductPicker name="hero.featured" products={list} defaultValue={home.hero.featured} />
            </div>
            <div className="mt-6 border-t border-ink/[0.06] pt-5">
              <Toggle name="hero.showDoorsIntro" defaultChecked={home.hero.showDoorsIntro} label="Temple doors intro" hint="Play the opening mandir-doors animation on first visit" />
            </div>
          </Card>

          <Card title="Deity marquee" description="Words in the scrolling strip below the hero. Press Enter after each.">
            <TagInput name="marquee" defaultValue={home.marquee} placeholder="e.g. Ganesh Ji" />
          </Card>

          <Card title="Darshan Studio" description="The interactive visualizer teaser.">
            <div className="grid gap-4">
              <Field label="Eyebrow"><Input name="experience.eyebrow" defaultValue={home.experience.eyebrow} /></Field>
              <Field label="Title"><Input name="experience.title" defaultValue={home.experience.title} /></Field>
              <Field label="Subtitle"><Textarea name="experience.subtitle" defaultValue={home.experience.subtitle} className="min-h-[80px]" /></Field>
            </div>
          </Card>

          <Card title="Made for the road" description="Dashboard idol spotlight.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Eyebrow"><Input name="dashboard.eyebrow" defaultValue={home.dashboard.eyebrow} /></Field>
              <Field label="Spotlight product">
                <Select name="dashboard.productSlug" defaultValue={home.dashboard.productSlug}>
                  <option value="">— None —</option>
                  {!list.some((p) => p.slug === home.dashboard.productSlug) && home.dashboard.productSlug && (
                    <option value={home.dashboard.productSlug}>Missing: {home.dashboard.productSlug}</option>
                  )}
                  {list.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.name}{p.isActive ? "" : " (hidden)"}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Title" className="sm:col-span-2"><Input name="dashboard.title" defaultValue={home.dashboard.title} /></Field>
              <Field label="Body" className="sm:col-span-2"><Textarea name="dashboard.body" defaultValue={home.dashboard.body} /></Field>
            </div>
          </Card>

          <Card title="The craft" description="Brand story with a row of stats.">
            <div className="grid gap-4">
              <Field label="Eyebrow"><Input name="craft.eyebrow" defaultValue={home.craft.eyebrow} /></Field>
              <Field label="Title"><Input name="craft.title" defaultValue={home.craft.title} /></Field>
              <Field label="Body"><Textarea name="craft.body" defaultValue={home.craft.body} /></Field>
              <div>
                <p className="mb-2 text-xs font-medium text-ink/70">Stats</p>
                <Repeater
                  name="craft.stats"
                  defaultValue={home.craft.stats}
                  max={8}
                  addLabel="Add stat"
                  fields={[
                    { key: "value", label: "Value", placeholder: "23", span: "sm:col-span-4" },
                    { key: "label", label: "Label", placeholder: "Signature designs", span: "sm:col-span-8" },
                  ]}
                />
              </div>
            </div>
          </Card>

          <Card title="Marketplaces" description="Show where else customers can find you. Leave rating blank unless it's your real store rating.">
            <div className="grid gap-4">
              <Field label="Title"><Input name="marketplaces.title" defaultValue={home.marketplaces.title} /></Field>
              <Repeater
                name="marketplaces.items"
                defaultValue={home.marketplaces.items}
                max={8}
                addLabel="Add marketplace"
                fields={[
                  { key: "name", label: "Name", placeholder: "Amazon", span: "sm:col-span-4" },
                  { key: "rating", label: "Rating", placeholder: "4.3★", span: "sm:col-span-3" },
                  { key: "note", label: "Note", placeholder: "Spinex Home store", span: "sm:col-span-5" },
                  { key: "url", label: "Store URL", placeholder: "https://…", span: "sm:col-span-12", type: "url" },
                ]}
              />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Bulk & gifting">
              <div className="grid gap-4">
                <Field label="Title"><Input name="bulk.title" defaultValue={home.bulk.title} /></Field>
                <Field label="Body"><Textarea name="bulk.body" defaultValue={home.bulk.body} /></Field>
              </div>
            </Card>
            <Card title="Newsletter">
              <div className="grid gap-4">
                <Field label="Title"><Input name="newsletter.title" defaultValue={home.newsletter.title} /></Field>
                <Field label="Body"><Textarea name="newsletter.body" defaultValue={home.newsletter.body} /></Field>
              </div>
            </Card>
          </div>
        </div>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-10 xl:self-start">
          <Card title="Sections" description="Order and visibility of homepage blocks.">
            <SectionsManager name="sections" defaultValue={home.sections} />
          </Card>
          <Card title="Announcement bar" description="Thin strip at the very top of every page.">
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
