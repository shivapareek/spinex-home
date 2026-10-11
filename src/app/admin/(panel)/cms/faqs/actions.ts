"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  question: z.string().trim().min(5, "Question is required").max(240),
  answer: z.string().trim().min(2, "Answer is required").max(3000),
  sortOrder: z.coerce.number().int().optional(),
});

export async function saveFaq(id: number | null, fd: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const isActive = id ? fd.get("isActive") === "on" : true;
  if (id) {
    db.update(faqs)
      .set({ question: d.question, answer: d.answer, isActive, ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}) })
      .where(eq(faqs.id, id))
      .run();
  } else {
    const last = db.select({ s: faqs.sortOrder }).from(faqs).orderBy(asc(faqs.sortOrder)).all().at(-1);
    db.insert(faqs).values({ question: d.question, answer: d.answer, isActive, sortOrder: d.sortOrder ?? (last ? last.s + 1 : 0) }).run();
  }
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "FAQ saved" : "FAQ added" };
}

/** Swap with the neighbour above/below, then renumber 0..n so order stays stable. */
export async function moveFaq(id: number, dir: -1 | 1) {
  await requireAdmin();
  const rows = db.select({ id: faqs.id }).from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id)).all();
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return { ok: true };
  [rows[i], rows[j]] = [rows[j], rows[i]];
  db.transaction((tx) => {
    rows.forEach((r, k) => tx.update(faqs).set({ sortOrder: k }).where(eq(faqs.id, r.id)).run());
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleFaq(id: number) {
  await requireAdmin();
  const f = db.select({ isActive: faqs.isActive }).from(faqs).where(eq(faqs.id, id)).get();
  if (!f) return { error: "FAQ not found" };
  db.update(faqs).set({ isActive: !f.isActive }).where(eq(faqs.id, id)).run();
  revalidatePath("/", "layout");
  return { ok: true, message: f.isActive ? "FAQ hidden" : "FAQ visible" };
}

export async function deleteFaq(id: number) {
  await requireAdmin();
  db.delete(faqs).where(eq(faqs.id, id)).run();
  revalidatePath("/", "layout");
  return { ok: true, message: "FAQ deleted" };
}
