# Spinex Home — premium god-idol store + admin panel

Direct-to-customer store for **Spinex Enterprises** (car dashboard & home décor god idols), with a full admin panel and CMS.

## Highlights

**Storefront**
- Cinematic hero: temple-doors intro, rotating mandala, and a live "Darshan portal" that previews the idol on a car dashboard, in a home mandir or on a desk.
- **Darshan Studio** (`/experience`, also on every product page): place any idol in 4 illustrated scenes, in admin-uploaded photo scenes, on the **live phone camera**, or on **your own photo**. Drag, pinch or scroll to resize, tilt, mirror, then download or share a high-res image. Idols are scaled from their real height (`heightCm`).
- **360° viewer**: real photographic 360° when spin frames are uploaded, a GLB 3D model with **AR** ("place in your space" on Android and iOS) when a model is uploaded, and a 3D tilt turntable preview otherwise.
- Shop with deity, placement, category and price filters; ⌘K search; wishlist; cart drawer with a free-shipping meter.
- Checkout with server-side pricing, stock reservation, coupons, **Cash on Delivery** and **Razorpay** (UPI, cards, netbanking) with signature verification.
- Order page with a status timeline, order tracking, and customer accounts with order history and a saved address.
- Bulk/wholesale enquiry page with the PDF catalogue download, contact form, FAQ, CMS pages, SEO (sitemap, robots, product JSON-LD).

**Admin panel** (`/admin`)
- Dashboard: revenue chart, KPIs, recent orders, low stock, top sellers.
- **Products**: gallery, transparent cut-out for the visualizer, **360° from a turntable video** (frames are extracted in the browser), GLB/USDZ for AR, placements, real height, marketplace links (Amazon/Flipkart/Meesho), SEO.
- **Orders**: filters, CSV export, status workflow with history (stock is restored automatically on cancel or return), courier and tracking, printable **GST tax invoice**.
- Customers, coupons, review moderation, enquiries (with WhatsApp quick reply), subscribers (CSV), team members (admin/staff).
- **CMS**:
  - Homepage editor: every text, featured idols, section order and on/off.
  - Pages (markdown), testimonials, FAQs, media library.
  - **Visualizer scenes** with a visual anchor picker for your own photo scenes.
- **Settings**: store details, shipping and COD fees, Razorpay keys.

## Run locally

Requirements: **Node.js 20.9 or newer** (22 LTS recommended), npm. Works on Windows, macOS and Linux.

```bash
npm install
npm run db:seed           # creates data/spinex.db with the 16 catalogue products
npm run dev               # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

Default admin: `admin@spinexhome.in` / `Spinex@2026`. **Change the password after your first login** (Admin → Team).

Optional: copy `.env.example` to `.env` to set your own `AUTH_SECRET`, admin email/password and Razorpay keys. Without it, safe development defaults are used.

Useful commands:
- `npm run db:reset` deletes the local database and seeds it fresh.
- `npm run build && npm start` runs the production build on http://localhost:3000.

## Production

```bash
npm run build && npm start
```

- Data lives in SQLite at `data/spinex.db`. Uploads live in `storage/uploads/`. Deploy to a server with a **persistent disk** (a VPS, Railway, Render with a disk, or Fly volume) and back up both folders. Serverless hosts like Vercel don't keep files between requests. To use one, move the DB to Postgres/Turso and uploads to S3/R2.
- Set `AUTH_SECRET` (a long random string) and `NEXT_PUBLIC_SITE_URL`.
- Razorpay: add the keys in Admin → Settings → Payments, then turn online payment on. Test keys start with `rzp_test_`.

## Content notes

- Product images and cut-outs come from the 2026 catalogue PDF. They are low-resolution (~400px), so replace them with original photos from Admin → Products for a sharper store.
- Prices are the catalogue prices. MRP is left empty, so set retail prices and MRPs in admin as needed. Product descriptions, materials and heights are drafted from the photos: please review them.
- No reviews, testimonials or ratings are pre-filled. Add only genuine ones from the admin panel.
- Policy pages are templates. Review them before going live.

## Stack

Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS · Framer Motion · Drizzle ORM + better-sqlite3 · Recharts · `<model-viewer>` · Razorpay.
