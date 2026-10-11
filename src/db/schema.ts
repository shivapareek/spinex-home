import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

const now = () => new Date().toISOString();
const ts = (name: string) => text(name).notNull().$defaultFn(now);
const json = <T>(name: string) => text(name, { mode: "json" }).$type<T>();

/* ---------- People ---------- */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "staff", "customer"] }).notNull().default("customer"),
  address: json<Address | null>("address"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: ts("created_at"),
});

/* ---------- Catalogue ---------- */
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sku: text("sku"),
  categoryId: integer("category_id"),
  deity: text("deity"),
  shortDescription: text("short_description"),
  description: text("description"),
  /** All money is stored in paise (integer) */
  price: integer("price").notNull(),
  mrp: integer("mrp"),
  stock: integer("stock").notNull().default(0),
  material: text("material"),
  dimensions: text("dimensions"),
  weightGrams: integer("weight_grams"),
  images: json<string[]>("images").notNull().$defaultFn(() => []),
  /** Transparent PNG/WebP used by the room/car/temple visualizer */
  cutout: text("cutout"),
  /** Ordered frames for the 360° spin viewer */
  spinFrames: json<string[]>("spin_frames").notNull().$defaultFn(() => []),
  /** 3D model for WebAR (GLB for Android/Web, USDZ for iOS Quick Look) */
  modelGlb: text("model_glb"),
  modelUsdz: text("model_usdz"),
  /** Where it is meant to be placed: car | temple | desk | shelf */
  placements: json<string[]>("placements").notNull().$defaultFn(() => []),
  /** Real-world height in cm — drives scale in visualizer scenes */
  heightCm: real("height_cm"),
  marketplace: json<{ amazon?: string; flipkart?: string; meesho?: string }>("marketplace").notNull().$defaultFn(() => ({})),
  tags: json<string[]>("tags").notNull().$defaultFn(() => []),
  badge: text("badge"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  isBestseller: integer("is_bestseller", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  userId: integer("user_id"),
  name: text("name").notNull(),
  city: text("city"),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body"),
  isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(false),
  createdAt: ts("created_at"),
});

/* ---------- Commerce ---------- */
export type Address = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderStatus = "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "returned";
export const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  shippingAddress: json<Address>("shipping_address").notNull(),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").notNull().default(0),
  shippingFee: integer("shipping_fee").notNull().default(0),
  codFee: integer("cod_fee").notNull().default(0),
  total: integer("total").notNull(),
  couponCode: text("coupon_code"),
  paymentMethod: text("payment_method", { enum: ["cod", "razorpay"] }).notNull(),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed", "refunded"] }).notNull().default("pending"),
  status: text("status").$type<OrderStatus>().notNull().default("pending"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  courier: text("courier"),
  trackingNumber: text("tracking_number"),
  customerNote: text("customer_note"),
  adminNote: text("admin_note"),
  history: json<{ status: string; note?: string; at: string }[]>("history").notNull().$defaultFn(() => []),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  name: text("name").notNull(),
  sku: text("sku"),
  image: text("image"),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  description: text("description"),
  type: text("type", { enum: ["percent", "flat"] }).notNull(),
  /** percent: 1-100; flat: paise */
  value: integer("value").notNull(),
  minOrder: integer("min_order").notNull().default(0),
  maxDiscount: integer("max_discount"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  startsAt: text("starts_at"),
  endsAt: text("ends_at"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: ts("created_at"),
});

/* ---------- CMS ---------- */
export const pages = sqliteTable("pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  /** Markdown */
  content: text("content").notNull().default(""),
  seoDescription: text("seo_description"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  showInFooter: integer("show_in_footer", { mode: "boolean" }).notNull().default(true),
  updatedAt: ts("updated_at"),
});

/** Key/value JSON store for site settings & homepage content */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: ts("updated_at"),
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location"),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  source: text("source"),
  avatar: text("avatar"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const faqs = sqliteTable("faqs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

/**
 * Visualizer scenes. `kind` = built-in illustrated scene (car/temple/desk/shelf)
 * or a photo uploaded by the admin with a placement anchor.
 */
export const scenes = sqliteTable("scenes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  kind: text("kind", { enum: ["car", "temple", "desk", "shelf", "photo"] }).notNull(),
  image: text("image"),
  /** Anchor point (0-1) where the idol's base sits, for photo scenes */
  anchorX: real("anchor_x").notNull().default(0.5),
  anchorY: real("anchor_y").notNull().default(0.75),
  /** Height of the idol relative to scene height for a 10cm idol */
  baseScale: real("base_scale").notNull().default(0.32),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  createdAt: ts("created_at"),
});

export const enquiries = sqliteTable("enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["bulk", "contact"] }).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  company: text("company"),
  city: text("city"),
  quantity: text("quantity"),
  message: text("message"),
  status: text("status", { enum: ["new", "contacted", "closed"] }).notNull().default("new"),
  createdAt: ts("created_at"),
});

export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: ts("created_at"),
});

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Scene = typeof scenes.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
