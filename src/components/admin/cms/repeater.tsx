"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { inputClass } from "../ui";

export type RepeaterField = {
  key: string;
  label: string;
  placeholder?: string;
  /** Tailwind col-span class on the sm+ grid (grid is 12 columns). */
  span?: string;
  type?: "text" | "url" | "number" | "select";
  /** Options for type "select" */
  options?: { value: string; label: string }[];
};

type Row = Record<string, string>;

/**
 * Editable list of objects (all string fields), serialised as a JSON array in a hidden input.
 * Supports add / remove / reorder. Server action reads it with JSON.parse(fd.get(name)).
 */
export function Repeater({
  name,
  fields,
  defaultValue = [],
  addLabel = "Add item",
  max,
  emptyText = "Nothing added yet.",
}: {
  name: string;
  fields: RepeaterField[];
  defaultValue?: Row[];
  addLabel?: string;
  max?: number;
  emptyText?: string;
}) {
  const blank = (): Row => Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [rows, setRows] = useState<(Row & { _k: string })[]>(() =>
    defaultValue.map((r, i) => ({ ...blank(), ...Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? "")])), _k: `r${i}` })),
  );
  const [seq, setSeq] = useState(defaultValue.length);

  const update = (i: number, key: string, v: string) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  const move = (i: number, d: number) =>
    setRows((rs) => {
      const j = i + d;
      if (j < 0 || j >= rs.length) return rs;
      const n = [...rs];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const add = () => {
    setRows((rs) => [...rs, { ...blank(), _k: `r${seq}` }]);
    setSeq((s) => s + 1);
  };
  const serialised = JSON.stringify(rows.map(({ _k, ...r }) => r));

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={serialised} />
      {rows.length === 0 && <p className="rounded-2xl border border-dashed border-ink/15 px-4 py-6 text-center text-xs text-ink/45">{emptyText}</p>}
      {rows.map((r, i) => (
        <div key={r._k} className="rounded-2xl bg-surface p-3 ring-1 ring-line">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">#{i + 1}</span>
            <span className="flex items-center gap-1">
              <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp weight="light" className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === rows.length - 1}><ArrowDown weight="light" className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn label="Remove" danger onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><Trash weight="light" className="h-3.5 w-3.5" /></IconBtn>
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-12">
            {fields.map((f) => (
              <label key={f.key} className={cn("block", f.span ?? "sm:col-span-12")}>
                <span className="mb-1 block text-[11px] font-medium text-ink/55">{f.label}</span>
                {f.type === "select" ? (
                  <select value={r[f.key] ?? ""} onChange={(e) => update(i, f.key, e.target.value)} className={cn(inputClass, "bg-white py-2")}>
                    <option value="">{f.placeholder ?? "None"}</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type ?? "text"}
                    value={r[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={cn(inputClass, "bg-white py-2")}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
      {(!max || rows.length < max) && (
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink ring-1 ring-line transition duration-300 ease-silk hover:bg-ink-3 hover:text-white"
        >
          <Plus weight="light" className="h-3.5 w-3.5" /> {addLabel}
        </button>
      )}
    </div>
  );
}

export function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full bg-white text-ink/60 ring-1 ring-ink/10 transition duration-300 ease-silk hover:text-ink disabled:opacity-30",
        danger && "hover:bg-sindoor hover:text-white hover:ring-sindoor",
      )}
    >
      {children}
    </button>
  );
}
