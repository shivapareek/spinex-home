import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "spinex.db");

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, phone TEXT,
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer', address TEXT,
  is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT,
  image TEXT, sort_order INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, sku TEXT,
  category_id INTEGER, deity TEXT, short_description TEXT, description TEXT, price INTEGER NOT NULL,
  mrp INTEGER, stock INTEGER NOT NULL DEFAULT 0, material TEXT, dimensions TEXT, weight_grams INTEGER,
  images TEXT NOT NULL DEFAULT '[]', cutout TEXT, spin_frames TEXT NOT NULL DEFAULT '[]', model_glb TEXT,
  model_usdz TEXT, placements TEXT NOT NULL DEFAULT '[]', height_cm REAL, marketplace TEXT NOT NULL DEFAULT '{}',
  tags TEXT NOT NULL DEFAULT '[]', badge TEXT, is_featured INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1, seo_title TEXT,
  seo_description TEXT, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, user_id INTEGER, name TEXT NOT NULL,
  city TEXT, rating INTEGER NOT NULL, title TEXT, body TEXT, is_approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT, order_number TEXT NOT NULL UNIQUE, user_id INTEGER, email TEXT NOT NULL,
  phone TEXT NOT NULL, shipping_address TEXT NOT NULL, subtotal INTEGER NOT NULL, discount INTEGER NOT NULL DEFAULT 0,
  shipping_fee INTEGER NOT NULL DEFAULT 0, cod_fee INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL,
  coupon_code TEXT, payment_method TEXT NOT NULL, payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending', razorpay_order_id TEXT, razorpay_payment_id TEXT, courier TEXT,
  tracking_number TEXT, customer_note TEXT, admin_note TEXT, history TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id INTEGER, name TEXT NOT NULL,
  sku TEXT, image TEXT, price INTEGER NOT NULL, quantity INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, description TEXT, type TEXT NOT NULL,
  value INTEGER NOT NULL, min_order INTEGER NOT NULL DEFAULT 0, max_discount INTEGER, usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0, starts_at TEXT, ends_at TEXT, is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '',
  seo_description TEXT, is_published INTEGER NOT NULL DEFAULT 1, show_in_footer INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, location TEXT, quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5, source TEXT, avatar TEXT, is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL, answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS scenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE, name TEXT NOT NULL, tagline TEXT,
  kind TEXT NOT NULL, image TEXT, anchor_x REAL NOT NULL DEFAULT 0.5, anchor_y REAL NOT NULL DEFAULT 0.75,
  base_scale REAL NOT NULL DEFAULT 0.32, is_active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL, filename TEXT NOT NULL, mime TEXT NOT NULL,
  size INTEGER NOT NULL, width INTEGER, height INTEGER, alt TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, name TEXT NOT NULL, email TEXT, phone TEXT NOT NULL,
  company TEXT, city TEXT, quantity TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
`;

function open() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(DDL);
  return drizzle(sqlite, { schema });
}

type DB = ReturnType<typeof open>;
const g = globalThis as unknown as { __spxdb?: DB };

/** Singleton — survives Next.js dev hot reloads */
export const db: DB = g.__spxdb ?? (g.__spxdb = open());
export { schema };
