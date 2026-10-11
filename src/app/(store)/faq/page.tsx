import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { Faqs } from "@/components/store/home/sections";

export const metadata = { title: "Frequently asked questions" };

export default function FaqPage() {
  const list = db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(asc(faqs.sortOrder)).all();
  return <div className="pt-20"><Faqs faqs={list} /></div>;
}
