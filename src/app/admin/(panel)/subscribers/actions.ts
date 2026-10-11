"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function deleteSubscriber(id: number) {
  await requireAdmin();
  const s = db.select().from(subscribers).where(eq(subscribers.id, id)).get();
  if (!s) return { error: "Subscriber not found" };
  db.delete(subscribers).where(eq(subscribers.id, id)).run();
  revalidatePath("/admin/subscribers");
  return { ok: true, message: `${s.email} removed` };
}
