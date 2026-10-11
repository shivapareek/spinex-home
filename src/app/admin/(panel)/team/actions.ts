"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { checkPassword, hashPassword, requireAdmin } from "@/lib/auth";

const password = z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long");

/** Team management is admin-only; staff may only change their own password. */
async function requireOwner() {
  const s = await requireAdmin();
  return s.role === "admin" ? { s } : { error: "Only admins can manage the team" as const };
}

function activeAdminsExcept(id: number) {
  return Number(
    db
      .select({ n: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.role, "admin"), eq(users.isActive, true), ne(users.id, id)))
      .get()?.n ?? 0,
  );
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().max(20).optional(),
  role: z.enum(["admin", "staff"], { message: "Choose a role" }),
  password,
});

export async function createTeamMember(fd: FormData) {
  const g = await requireOwner();
  if ("error" in g) return { error: g.error };
  const parsed = createSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const existing = db.select({ id: users.id, role: users.role }).from(users).where(sql`lower(${users.email}) = ${d.email}`).get();
  if (existing) return { error: existing.role === "customer" ? "This email belongs to a customer account" : "A team member with this email already exists" };
  db.insert(users)
    .values({ name: d.name, email: d.email, phone: d.phone || null, role: d.role, passwordHash: await hashPassword(d.password), isActive: true })
    .run();
  revalidatePath("/admin/team");
  return { ok: true, message: `${d.name} can now sign in as ${d.role}` };
}

export async function setTeamMemberActive(id: number, active: boolean) {
  const g = await requireOwner();
  if ("error" in g) return { error: g.error };
  const u = db.select().from(users).where(eq(users.id, id)).get();
  if (!u || u.role === "customer") return { error: "Team member not found" };
  if (!active) {
    if (u.id === g.s.uid) return { error: "You can't deactivate your own account" };
    if (u.role === "admin" && activeAdminsExcept(u.id) === 0) return { error: "At least one active admin is required" };
  }
  db.update(users).set({ isActive: active }).where(eq(users.id, id)).run();
  revalidatePath("/admin/team");
  return { ok: true, message: `${u.name} ${active ? "reactivated" : "deactivated"}` };
}

export async function setTeamMemberRole(id: number, role: "admin" | "staff") {
  const g = await requireOwner();
  if ("error" in g) return { error: g.error };
  if (role !== "admin" && role !== "staff") return { error: "Invalid role" };
  const u = db.select().from(users).where(eq(users.id, id)).get();
  if (!u || u.role === "customer") return { error: "Team member not found" };
  if (u.id === g.s.uid) return { error: "You can't change your own role" };
  if (u.role === "admin" && role === "staff" && u.isActive && activeAdminsExcept(u.id) === 0) return { error: "At least one active admin is required" };
  db.update(users).set({ role }).where(eq(users.id, id)).run();
  revalidatePath("/admin/team");
  return { ok: true, message: `${u.name} is now ${role === "admin" ? "an admin" : "staff"}` };
}

export async function resetTeamPassword(id: number, fd: FormData) {
  const g = await requireOwner();
  if ("error" in g) return { error: g.error };
  const parsed = password.safeParse(fd.get("password"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const u = db.select().from(users).where(eq(users.id, id)).get();
  if (!u || u.role === "customer") return { error: "Team member not found" };
  db.update(users).set({ passwordHash: await hashPassword(parsed.data) }).where(eq(users.id, id)).run();
  return { ok: true, message: `Password reset for ${u.name}` };
}

const ownSchema = z
  .object({ current: z.string().min(1, "Enter your current password"), next: password, confirm: z.string() })
  .refine((d) => d.next === d.confirm, { message: "New passwords don't match" })
  .refine((d) => d.next !== d.current, { message: "Choose a password different from the current one" });

export async function changeOwnPassword(fd: FormData) {
  const s = await requireAdmin();
  const parsed = ownSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const u = db.select().from(users).where(eq(users.id, s.uid)).get();
  if (!u) return { error: "Account not found" };
  if (!(await checkPassword(parsed.data.current, u.passwordHash))) return { error: "Current password is incorrect" };
  db.update(users).set({ passwordHash: await hashPassword(parsed.data.next) }).where(eq(users.id, u.id)).run();
  return { ok: true, message: "Your password has been changed" };
}
