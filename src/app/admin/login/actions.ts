"use server";

import { redirect } from "next/navigation";
import { authenticate, endSession, startSession } from "@/lib/auth";

export async function adminLogin(_: unknown, fd: FormData) {
  const user = await authenticate(String(fd.get("email") || ""), String(fd.get("password") || ""));
  if (!user || (user.role !== "admin" && user.role !== "staff")) return { error: "Invalid email or password" };
  await startSession(user);
  const next = String(fd.get("next") || "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function adminLogout() {
  await endSession();
  redirect("/admin/login");
}
