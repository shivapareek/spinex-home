"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { saveSetting } from "@/lib/settings";
import { THEMES } from "@/lib/themes";

const schema = z.object({
  preset: z.string().refine((k) => THEMES.some((t) => t.key === k), "Choose a theme"),
  accent: z.string().trim().regex(/^(#[0-9a-fA-F]{6})?$/, "Accent colour must look like #EA580C"),
});

export async function saveTheme(fd: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  saveSetting("theme", { preset: parsed.data.preset, accent: parsed.data.accent.toUpperCase() });
  revalidatePath("/", "layout");
  return { ok: true, message: "Theme saved. Your store now uses it." };
}
