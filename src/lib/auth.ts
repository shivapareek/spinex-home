import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";

export const SESSION_COOKIE = "spx_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const s = process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me-spinex-home";
  return new TextEncoder().encode(s);
}

export type Session = { uid: number; role: User["role"]; name: string; email: string };

export async function signSession(s: Session) {
  return new SignJWT(s as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token?: string | null): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

export async function startSession(user: User) {
  const token = await signSession({ uid: user.id, role: user.role, name: user.name, email: user.email });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function authenticate(email: string, password: string) {
  const user = db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).get();
  if (!user || !user.isActive) return null;
  return (await checkPassword(password, user.passwordHash)) ? user : null;
}

/** Use at the top of every admin server action / page. */
export async function requireAdmin() {
  const s = await getSession();
  if (!s || (s.role !== "admin" && s.role !== "staff")) redirect("/admin/login");
  return s;
}

export async function requireCustomer() {
  const s = await getSession();
  if (!s) redirect("/account/login");
  return s;
}
