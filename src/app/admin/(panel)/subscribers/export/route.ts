import { desc } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { istDay, toCsv } from "@/components/admin/commerce/helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSession();
  if (!s || (s.role !== "admin" && s.role !== "staff")) return new Response("Unauthorized", { status: 401 });
  const rows = db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).all();
  const csv = toCsv([["Email", "Subscribed on"], ...rows.map((r) => [r.email, istDay(r.createdAt)])]);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="spinex-subscribers-${istDay(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
