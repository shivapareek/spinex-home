"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Handbag, MagnifyingGlass } from "@phosphor-icons/react";
import { THEMES, isHex, resolveTheme, themeVars, type ThemeColors, type ThemeSettings } from "@/lib/themes";
import { cn, inr } from "@/lib/utils";
import { ActionForm, SubmitButton } from "./client";
import { Card } from "./ui";
import { saveTheme } from "@/app/admin/(panel)/theme/actions";

type Idol = { name: string; image: string; price: number };

export function ThemeEditor({ saved, idols }: { saved: ThemeSettings; idols: Idol[] }) {
  const [preset, setPreset] = useState(saved.preset);
  const [custom, setCustom] = useState(isHex(saved.accent));
  const [accent, setAccent] = useState(isHex(saved.accent) ? saved.accent : resolveTheme({ preset: saved.preset }).accent);
  const colors = useMemo(() => resolveTheme({ preset, accent: custom ? accent : "" }), [preset, custom, accent]);
  const dirty = preset !== saved.preset || (custom ? accent.toUpperCase() : "") !== saved.accent;

  return (
    <ActionForm action={saveTheme} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <input type="hidden" name="preset" value={preset} />
      <input type="hidden" name="accent" value={custom ? accent : ""} />

      <div className="min-w-0 space-y-6">
        <Card title="Live preview" description="This is your storefront with the selected colours.">
          <StorePreview colors={colors} idols={idols} />
        </Card>
      </div>

      <aside className="min-w-0 space-y-6 xl:sticky xl:top-10 xl:self-start">
        <Card title="Themes" description="Choose a look. Every page of the store changes together.">
          <div className="grid gap-3" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => {
              const on = t.key === preset;
              const c = t.colors;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setPreset(t.key);
                    if (!custom) setAccent(c.accent);
                  }}
                  className={cn(
                    "group relative flex items-center gap-4 rounded-2xl p-3 text-left ring-1 transition duration-300 ease-silk",
                    on ? "bg-white ring-2 ring-ink" : "bg-white ring-line hover:ring-ink/30",
                  )}
                >
                  <Swatch c={c} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{t.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted">{t.description}</span>
                  </span>
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full transition", on ? "bg-ink text-white" : "ring-1 ring-line")}>
                    {on && <Check weight="bold" className="h-3.5 w-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Accent colour" description="Buttons, badges and highlights. Keep the theme's own, or pick your brand colour.">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="text-sm text-ink">Use my own accent colour</span>
            <input type="checkbox" checked={custom} onChange={(e) => setCustom(e.target.checked)} className="peer sr-only" />
            <span className="relative h-6 w-11 rounded-full bg-ink/15 transition peer-checked:bg-ink after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
          </label>
          {custom && (
            <div className="mt-4 flex items-center gap-3">
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value.toUpperCase())} className="h-11 w-14 cursor-pointer rounded-xl border border-line bg-white p-1" aria-label="Accent colour" />
              <input
                value={accent}
                onChange={(e) => setAccent(e.target.value.trim())}
                maxLength={7}
                className="h-11 w-28 rounded-xl border border-line bg-white px-3 font-mono text-sm uppercase text-ink outline-none focus:border-ink"
                aria-label="Accent hex code"
              />
              <div className="flex gap-1.5">
                {["#EA580C", "#C8941E", "#D63E6E", "#0E7C66", "#2563EB", "#7C3AED"].map((h) => (
                  <button key={h} type="button" onClick={() => setAccent(h)} className="h-7 w-7 rounded-full ring-1 ring-black/10 transition hover:scale-110" style={{ background: h }} aria-label={`Use ${h}`} />
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm text-muted">{dirty ? "You have unsaved changes." : "This theme is live on your store."}</p>
          <SubmitButton className="mt-4 w-full">Save theme</SubmitButton>
          <button
            type="button"
            onClick={() => {
              setPreset(saved.preset);
              setCustom(isHex(saved.accent));
              setAccent(isHex(saved.accent) ? saved.accent : resolveTheme({ preset: saved.preset }).accent);
            }}
            disabled={!dirty}
            className="mt-3 block w-full text-center text-xs font-medium text-ink/70 hover:text-ink disabled:opacity-40"
          >
            Discard changes
          </button>
        </div>
      </aside>
    </ActionForm>
  );
}

function Swatch({ c }: { c: ThemeColors }) {
  return (
    <span className="relative grid h-14 w-20 shrink-0 grid-cols-2 overflow-hidden rounded-xl ring-1 ring-black/5" style={{ background: c.page }}>
      <span style={{ background: c.ink }} />
      <span className="grid grid-rows-2">
        <span style={{ background: c.surface }} />
        <span style={{ background: c.accent }} />
      </span>
    </span>
  );
}

/** A miniature storefront that reads the same colour tokens as the real store. */
function StorePreview({ colors, idols }: { colors: ThemeColors; idols: Idol[] }) {
  return (
    <div style={themeVars(colors)} className="themed overflow-hidden rounded-2xl bg-page text-ink ring-1 ring-line transition-colors duration-500">
      <div className="bg-ink py-1.5 text-center text-[10px] text-white/90">Free shipping on orders above ₹499</div>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="hidden gap-4 text-[11px] text-ink/70 sm:flex">
          <span>Shop all</span>
          <span>Car idols</span>
          <span>Mandir idols</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-ink text-[10px] text-accent">◆</span>
          <span className="text-sm font-semibold">
            Spinex <span className="font-normal text-ink/60">Home</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MagnifyingGlass className="h-4 w-4 text-ink/60" />
          <span className="flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[10px] text-white">
            <Handbag className="h-3 w-3" /> 2
          </span>
        </div>
      </div>

      <div className="grid items-center gap-6 px-5 py-8 sm:grid-cols-[1.1fr_1fr] sm:px-8">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">Spinex Home</p>
          <h3 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
            God idols for your <span className="text-accent">car, mandir and desk.</span>
          </h3>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-xs font-medium text-white">
              Shop all idols <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-xs font-medium text-accent-on">Try in your space</span>
          </div>
        </div>
        <div className="relative grid aspect-[4/3] place-items-end overflow-hidden rounded-2xl bg-surface-2">
          <div className="absolute left-1/2 top-[-20%] h-[110%] w-[70%] -translate-x-1/2 rounded-full bg-accent/15 blur-2xl" />
          {idols[0] && <img src={idols[0].image} alt="" className="relative mx-auto h-[85%] w-auto object-contain drop-shadow-[0_14px_14px_rgba(0,0,0,0.2)]" />}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 sm:px-8">
        {idols.map((p, i) => (
          <div key={p.name}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface">
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-semibold text-accent-on">Bestseller</span>}
              <img src={p.image} alt="" className="absolute inset-[12%] h-[76%] w-[76%] object-contain" />
            </div>
            <p className="mt-2 truncate text-[11px] font-medium">{p.name}</p>
            <p className="text-[11px] text-muted">{inr(p.price)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 pt-6 sm:px-8">
        <div className="rounded-xl bg-tile-1 p-3 text-xs font-semibold">Ganesh</div>
        <div className="rounded-xl bg-tile-2 p-3 text-xs font-semibold">Krishna</div>
        <div className="rounded-xl bg-tile-3 p-3 text-xs font-semibold">Mahadev</div>
      </div>

      <div className="px-5 py-6 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-accent px-5 py-6 text-accent-on">
          <p className="font-display text-lg font-bold">Gifting & wholesale, made simple.</p>
          <p className="mt-1 text-xs text-accent-on/80">Bulk pricing with a GST invoice.</p>
          <span className="mt-4 inline-flex h-8 items-center rounded-full bg-white px-3 text-[11px] font-medium text-ink">Get bulk pricing</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line px-5 py-4 text-[10px] text-muted sm:px-8">
        <span>© Spinex Enterprises</span>
        <span className="text-ink/70">Shipping · Returns · Contact</span>
      </div>
    </div>
  );
}
