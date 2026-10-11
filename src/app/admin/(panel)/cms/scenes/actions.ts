"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { scenes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  key: z.string().trim().optional(),
  tagline: z.string().trim().max(160).optional(),
  kind: z.enum(["car", "temple", "desk", "shelf", "photo"], { message: "Choose a scene type" }),
  image: z.string().trim().optional(),
  anchorX: z.coerce.number().min(0).max(1),
  anchorY: z.coerce.number().min(0).max(1),
  baseScale: z.coerce.number().min(0.05, "Idol size must be 5–80%").max(0.8, "Idol size must be 5–80%"),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveScene(id: number | null, fd: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.kind === "photo" && !d.image) return { error: "Photo scenes need a background photo" };
  const key = slugify(d.key || d.name);
  if (!key) return { error: "Please enter a valid key" };
  const values = {
    name: d.name,
    key,
    tagline: d.tagline || null,
    kind: d.kind,
    image: d.image || null,
    anchorX: d.anchorX,
    anchorY: d.anchorY,
    baseScale: d.baseScale,
    sortOrder: d.sortOrder,
    isActive: fd.get("isActive") === "on",
  };
  const clash = db.select({ id: scenes.id }).from(scenes).where(eq(scenes.key, key)).get();
  if (clash && clash.id !== id) return { error: "Another scene already uses this key" };
  if (id) db.update(scenes).set(values).where(eq(scenes.id, id)).run();
  else db.insert(scenes).values(values).run();
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Scene updated" : "Scene created", redirect: "/admin/cms/scenes" };
}

export async function toggleScene(id: number) {
  await requireAdmin();
  const s = db.select({ isActive: scenes.isActive }).from(scenes).where(eq(scenes.id, id)).get();
  if (!s) return { error: "Scene not found" };
  db.update(scenes).set({ isActive: !s.isActive }).where(eq(scenes.id, id)).run();
  revalidatePath("/", "layout");
  return { ok: true, message: s.isActive ? "Scene hidden" : "Scene active" };
}

export async function deleteScene(id: number) {
  await requireAdmin();
  db.delete(scenes).where(eq(scenes.id, id)).run();
  revalidatePath("/", "layout");
  return { ok: true, message: "Scene deleted", redirect: "/admin/cms/scenes" };
}
