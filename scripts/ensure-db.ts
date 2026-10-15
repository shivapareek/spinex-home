/**
 * Runs before `npm run dev` / `npm start`: fills a brand-new (empty) database with the catalogue,
 * pages, scenes and the admin account, so a fresh copy of the project works straight away.
 * An existing store is never touched, so products you delete in admin stay deleted.
 */
import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { products, users } from "../src/db/schema";

const count = (t: typeof products | typeof users) => db.select({ n: sql<number>`count(*)` }).from(t).get()?.n ?? 0;

if (count(products) === 0 && count(users) === 0) {
  console.log("Empty database found: adding the Spinex catalogue…");
  require("./seed");
}
