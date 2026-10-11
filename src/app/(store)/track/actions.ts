"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { orderToken } from "@/lib/orders";

export async function trackOrder(_: unknown, fd: FormData) {
  const n = String(fd.get("order") || "").trim().toUpperCase();
  const contact = String(fd.get("contact") || "").trim().toLowerCase();
  const o = n ? db.select().from(orders).where(eq(orders.orderNumber, n)).get() : null;
  const digits = (s: string) => s.replace(/\D/g, "").slice(-10);
  if (!o || !contact || (o.email.toLowerCase() !== contact && digits(o.phone) !== digits(contact))) {
    return { error: "We couldn't find an order with those details." };
  }
  redirect(`/order/${o.orderNumber}?t=${orderToken(o.orderNumber)}`);
}
