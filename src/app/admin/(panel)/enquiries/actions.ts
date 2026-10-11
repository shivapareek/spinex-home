"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const status = z.enum(["new", "contacted", "closed"], { message: "Choose a valid status" });

export async function setEnquiryStatus(id: number, next: string) {
  await requireAdmin();
  const parsed = status.safeParse(next);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const e = db.select({ id: enquiries.id }).from(enquiries).where(eq(enquiries.id, id)).get();
  if (!e) return { error: "Enquiry not found" };
  db.update(enquiries).set({ status: parsed.data }).where(eq(enquiries.id, id)).run();
  revalidatePath("/admin", "layout");
  return { ok: true, message: `Marked as ${parsed.data}` };
}

export async function deleteEnquiry(id: number) {
  await requireAdmin();
  db.delete(enquiries).where(eq(enquiries.id, id)).run();
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Enquiry deleted", redirect: "/admin/enquiries" };
}
