import "server-only";
import { and, eq, like, or, sql, type SQL } from "drizzle-orm";
import { ORDER_STATUSES, orders, type OrderStatus } from "@/db/schema";

/** Shared with the CSV export so both apply identical filters. */
export function orderFilters(params: { status?: string; q?: string }) {
  const where: SQL[] = [];
  const status = ORDER_STATUSES.includes(params.status as OrderStatus) ? (params.status as OrderStatus) : undefined;
  if (status) where.push(eq(orders.status, status));
  const q = params.q?.trim();
  if (q) {
    const term = `%${q.replace(/^#/, "")}%`;
    where.push(
      or(
        like(orders.orderNumber, term),
        like(orders.email, term),
        like(orders.phone, term),
        like(sql`json_extract(${orders.shippingAddress}, '$.name')`, term),
      )!,
    );
  }
  return where.length ? and(...where) : undefined;
}

