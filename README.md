# BroHood Admin & Operations Command Center

A standalone, production-grade Next.js (App Router) Admin Dashboard for **BroHood**—specializing in 1:1 first-copy luxury watches, hype sneakers, designer goggles, and streetwear apparel.

## Tech Stack
* **Framework:** Next.js 16 (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS v4 (Dark Luxury Command Center aesthetic: Obsidian `#0a0b0e`, Surface `#121318`, Borders `#1f2128`, Metallic Gold `#e5c158`)
* **Icons:** `lucide-react`
* **Charts/Analytics:** `recharts`
* **Database Client:** `@supabase/supabase-js` using `SUPABASE_SERVICE_ROLE_KEY` (RLS bypass)
* **Media Storage:** Cloudinary Upload Widget & REST Upload API with fallback

---

## Credentials & Access Gate

* **Access URL:** `http://localhost:3000/login`
* **Admin Master Key / PIN:** `brohood_admin_secret_2026`
* **Session Storage:** Secure HttpOnly cookie `brohood_admin_session` verified by edge middleware.

---

## Core Modules & Features

### 1. Analytics & Executive KPI Dashboard (`/` & `/analytics`)
* **KPI Metrics Cards:**
  * **Total Gross Revenue (₹ INR):** Prepaid Online + Delivered COD.
  * **Orders Placed:** Total order count with status breakdown pills (`Placed`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`).
  * **Active Inventory Value:** Total wholesale/retail valuation in stock + Low stock alerts count.
  * **Customer Directory:** VIP and registered customer count.
* **Visual Charts (`recharts`):**
  * **30-Day Revenue Trend:** Gradient area curve of sales volume.
  * **Payment Method Breakdown:** Donut chart comparing Razorpay Online vs Cash on Delivery.
  * **Category Breakdown:** Performance distribution among Luxury Watches, Sneakers, Designer Goggles, and Streetwear T-Shirts.
* **Recent Orders Stream:** Real-time stream with 1-click status progression and quick view modal.
* **Low Stock Radar:** Highlights items with `<= 3` units remaining with immediate adjustment links.

### 2. Product Management (`/products`, `/products/new`, `/products/[id]`)
* **Catalog List:**
  * Search by title, brand, or SKU.
  * Category and Status (Active / Draft) filters.
  * Badges for `HOT Drop`, `Bestseller`, and `New Arrival`.
  * Inline status toggle and deletion modal with cascade warning.
* **Create / Edit Product Drop Form:**
  * Title, auto-generating slug, category, brand selector (with modal to create brands on the fly).
  * Selling Price and MRP with auto-calculated discount percentage badge.
  * **Dynamic JSONB Specifications Editor:**
    * Built-in presets for Watches (Movement, Case Diameter, Glass, Water Resistance), Sneakers (Upper Material, Sole Type, Inclusions), T-Shirts (GSM, Fabric, Fit Type), and Goggles (Lens Type, Frame Material, UV400).
  * **Cloudinary & Media Gallery:**
    * Drag-and-drop or file upload to Cloudinary.
    * Direct CDN URL attachment.
    * Image thumbnail selector and primary image toggle.
  * **Variant Generator:**
    * Footwear presets (UK 7, UK 8, UK 9, UK 10, UK 11).
    * Apparel presets (Size S, M, L, XL, XXL).
    * Watches / Eyewear colorway and edition presets with custom price deltas.

### 3. Inventory & Variant Manager (`/inventory`)
* **Category Variant Tabs:** All Variants, Low Stock (`<= 3` units), and Out of Stock (`0` units).
* **Live Stock Adjuster:**
  * Instant inline `+` / `-` stock increment/decrement directly synced with Supabase.
  * Direct numeric input for rapid adjustments.
  * SKU code and price delta editor.
* **1-Click Bulk Restock Hub:** Instant `+10` or `+5` units bulk restock for all low stock items.
* **Add Variant Modal:** Quickly add new SKUs and sizes to any product.

### 4. Order Operations & Courier Dispatch (`/orders`)
* **Order Tracking Board:** Filter by status (`Placed`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`) and payment (`COD` vs `Razorpay`).
* **Order Detail Drawer:**
  * Complete customer information and delivery address.
  * 1-Click **WhatsApp Concierge Chat** (`https://wa.me/91...`) pre-filled with order details.
  * Purchased items checklist with product photos and totals.
* **Courier Dispatch Controls:**
  * Courier Partner selector (`Delhivery`, `BlueDart`, `Xpressbees`, `DTDC`, `Shadowfax`).
  * AWB / Tracking number assignment (immediately updates customer tracking).
* **Printable Thermal Packing Slip:**
  * Clean printable warehouse dispatch checklist and address label ready for barcode packaging.

### 5. Customer & VIP Directory (`/users`)
* Customer list with VIP tags for high spenders (`>= ₹10,000`).
* Total orders placed and Lifetime Spend (INR ₹).
* Customer address book and past purchase history drawer.
* 1-Click WhatsApp CRM link.

### 6. Coupon Code Manager (`/coupons`)
* Manage promotional vouchers (e.g. `FIRST10`, `BROHOOD500`, `EXTRA50`).
* Percentage (%) and Flat (₹) discounts.
* Minimum order value rules and maximum discount caps.
* 1-Click Active / Deactivated toggle.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
