"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { ORDER_STATUSES, orderItems, orders, products, type OrderStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

/** Statuses in which the order's stock has been released back to inventory. */
const RELEASED: OrderStatus[] = ["cancelled", "returned"];

const statusSchema = z.object({
  status: z.enum(ORDER_STATUSES as [OrderStatus, ...OrderStatus[]], { message: "Choose a valid status" }),
  note: z.string().trim().max(500, "Note is too long").optional(),
});

export async function updateOrderStatus(id: number, fd: FormData) {
  const s = await requireAdmin();
  const parsed = statusSchema.safeParse({ status: fd.get("status"), note: fd.get("note") ?? undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { status, note } = parsed.data;

  const order = db.select().from(orders).where(eq(orders.id, id)).get();
  if (!order) return { error: "Order not found" };
  if (order.status === status && !note) return { error: "Pick a different status or add a note" };

  const wasReleased = RELEASED.includes(order.status);
  const nowReleased = RELEASED.includes(status);
  const now = new Date().toISOString();
  let stockMsg = "";

  db.transaction((tx) => {
    if (wasReleased !== nowReleased) {
      // Moving into cancelled/returned → put stock back; reviving such an order → take it again.
      const items = tx.select().from(orderItems).where(eq(orderItems.orderId, id)).all();
      const sign = nowReleased ? 1 : -1;
      let units = 0;
      for (const it of items) {
        if (!it.productId) continue;
        tx.update(products)
          .set({ stock: sql`max(0, ${products.stock} + ${sign * it.quantity})`, updatedAt: now })
          .where(eq(products.id, it.productId))
          .run();
        units += it.quantity;
      }
      if (units) stockMsg = nowReleased ? ` · ${units} unit${units > 1 ? "s" : ""} restocked` : ` · ${units} unit${units > 1 ? "s" : ""} deducted from stock`;
    }
    const entry = { status, at: now, ...(note ? { note: `${note} — ${s.name}` } : { note: `Updated by ${s.name}` }) };
    tx.update(orders)
      .set({ status, history: [...(order.history ?? []), entry], updatedAt: now })
      .where(eq(orders.id, id))
      .run();
  });

  revalidatePath("/admin", "layout");
  return { ok: true, message: (order.status === status ? "Note added" : `Marked as ${status}`) + stockMsg };
}

const detailsSchema = z.object({
  courier: z.string().trim().max(80).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
  adminNote: z.string().trim().max(2000).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"], { message: "Choose a valid payment status" }),
});

export async function updateOrderDetails(id: number, fd: FormData) {
  const s = await requireAdmin();
  const parsed = detailsSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const order = db.select().from(orders).where(eq(orders.id, id)).get();
  if (!order) return { error: "Order not found" };
  const now = new Date().toISOString();
  const history = [...(order.history ?? [])];
  if (order.paymentStatus !== d.paymentStatus) history.push({ status: order.status, note: `Payment marked ${d.paymentStatus} — ${s.name}`, at: now });
  if ((d.trackingNumber || null) !== order.trackingNumber && d.trackingNumber)
    history.push({ status: order.status, note: `Tracking added: ${d.courier ? d.courier + " " : ""}${d.trackingNumber}`, at: now });
  db.update(orders)
    .set({
      courier: d.courier || null,
      trackingNumber: d.trackingNumber || null,
      adminNote: d.adminNote || null,
      paymentStatus: d.paymentStatus,
      history,
      updatedAt: now,
    })
    .where(eq(orders.id, id))
    .run();
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { ok: true, message: "Order details saved" };
}
