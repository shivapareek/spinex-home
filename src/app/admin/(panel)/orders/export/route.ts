import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { istDay, toCsv } from "@/components/admin/commerce/helpers";
import { orderFilters } from "../filters";

export const dynamic = "force-dynamic";

const r = (paise: number | null | undefined) => ((paise ?? 0) / 100).toFixed(2);

export async function GET(req: Request) {
  const s = await getSession();
  if (!s || (s.role !== "admin" && s.role !== "staff")) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const where = orderFilters({ status: url.searchParams.get("status") ?? undefined, q: url.searchParams.get("q") ?? undefined });
  const list = db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).all();
  const items = list.length ? db.select().from(orderItems).where(inArray(orderItems.orderId, list.map((o) => o.id))).all() : [];
  const byOrder = new Map<number, typeof items>();
  for (const it of items) byOrder.set(it.orderId, [...(byOrder.get(it.orderId) ?? []), it]);

  const rows: unknown[][] = [
    [
      "Order number", "Date", "Status", "Payment method", "Payment status", "Customer", "Email", "Phone",
      "Address", "City", "State", "Pincode", "Items", "Units", "Subtotal (INR)", "Discount (INR)", "Coupon",
      "Shipping (INR)", "COD fee (INR)", "Total (INR)", "Courier", "Tracking number", "Razorpay payment ID", "Customer note", "Admin note",
    ],
  ];
  for (const o of list) {
    const its = byOrder.get(o.id) ?? [];
    const a = o.shippingAddress;
    rows.push([
      o.orderNumber, istDay(o.createdAt), o.status, o.paymentMethod, o.paymentStatus, a?.name, o.email, o.phone,
      [a?.line1, a?.line2].filter(Boolean).join(", "), a?.city, a?.state, a?.pincode,
      its.map((i) => `${i.name}${i.sku ? ` [${i.sku}]` : ""} x${i.quantity}`).join("; "),
      its.reduce((n, i) => n + i.quantity, 0),
      r(o.subtotal), r(o.discount), o.couponCode, r(o.shippingFee), r(o.codFee), r(o.total),
      o.courier, o.trackingNumber, o.razorpayPaymentId, o.customerNote, o.adminNote,
    ]);
  }
  const name = `spinex-orders-${istDay(new Date())}${url.searchParams.get("status") ? "-" + url.searchParams.get("status") : ""}.csv`;
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name.replace(/[^\w.-]/g, "")}"`,
      "Cache-Control": "no-store",
    },
  });
}
