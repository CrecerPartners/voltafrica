

## Marketplace Upgrade Plan

Since Volt is an **affiliate marketplace** (sellers get links, earn commissions — no cart/checkout on Volt itself), the upgrade focuses on: modern e-commerce-style UI, dedicated product pages with unique URLs, image carousels, and clean product presentation. Cart/checkout/payment gateway are not needed.

---

### What Changes

**1. Dedicated Product Page (`/product/:slug`)**
- New route `/product/:slug` accessible both publicly and for logged-in users
- Generate slug from product name + brand (e.g., `/product/samsung-galaxy-s24`)
- Add a `slug` column to the products table (or generate client-side from name)
- Full product page with:
  - Image carousel (using Embla/existing carousel component) with thumbnails
  - Product name, brand, price, description
  - Commission badge for sellers
  - Stock status badge (optional, from `assets` JSON)
  - "Get Referral Link" CTA button
  - Share buttons (WhatsApp, Instagram, Twitter)
  - Selling tips section
  - Related products grid at bottom

**2. Marketplace Grid Redesign**
- Modern e-commerce card layout with larger images, hover effects
- Quick-action overlay on hover (View, Get Link)
- Product cards link to `/product/:slug` instead of opening a sheet
- Improved search with debounce
- Category filter pills with counts

**3. Product URL with Referral Tracking**
- URL format: `voltafrica.com/product/brand-product-name`
- Optional `?ref=CODE` query param for referral tracking
- When a visitor lands on a product page via referral link, the referral code is captured

**4. Database Migration**
- Add `slug` column (unique, generated from name) to `products` table
- RLS: allow public read on products (already exists via `true` policy)

---

### Technical Details

**New files:**
- `src/pages/ProductPage.tsx` — full product detail page
- `src/hooks/useProduct.ts` — fetch single product by slug

**Modified files:**
- `src/App.tsx` — add `/product/:slug` route
- `src/pages/Marketplace.tsx` — restyle grid, link cards to product pages
- `src/hooks/useProducts.ts` — add slug to Product interface

**Database:**
- Migration: `ALTER TABLE products ADD COLUMN slug text UNIQUE;`
- Backfill existing products with generated slugs
- Update admin product creation to auto-generate slugs

**Carousel:** Reuse existing `embla-carousel-react` dependency for the product image carousel with thumbnail strip.

**Referral tracking:** Product page reads `?ref=` param from URL and pre-fills referral link generation accordingly.

