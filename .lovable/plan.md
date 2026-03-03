

## Enrich Settings, Reviews, Verification & Seller Tools

This is a large feature set spanning 5 areas. Here's what we'll build:

### 1. Shop Logo/Banner Upload (Shop Settings)
- Add a **shop logo** upload field in the "My Shop" tab (uses existing `avatars` or a new `shop-logos` storage bucket)
- Add `shop_logo_url` column to `profiles` table
- Display the logo on the public shop page (`SellerShop.tsx`) alongside avatar

### 2. Buyer Reviews on Products
- **New table: `reviews`** — `id, product_id, order_id (optional), user_id (nullable for guests), reviewer_name, rating (1-5), comment, created_at`
- RLS: public INSERT (guests can review after purchase), public SELECT, owner can delete own
- **Checkout/Order Confirmation flow**: After successful order, prompt buyer to leave a review
- **Product page**: Show average rating + review list below product info
- **Public seller shop**: Show aggregate rating across their products

### 3. Profile Verification & Identity
- Add columns to `profiles`: `account_type` (enum: student/corporate/creator), `id_document_url`, `verification_status` (pending/verified/unverified), `social_links` (jsonb — tiktok, snapchat, instagram URLs)
- **Profile tab enrichment**:
  - "What best describes you?" selector (Student / Corporate / Creator)
  - ID upload field (student ID or corporate ID) — uploads to a `verification-docs` storage bucket (private)
  - Social links section: TikTok, Snapchat, Instagram, Twitter inputs
  - Verification badge shown on profile and public shop when verified
- Admin can update `verification_status` via admin panel

### 4. Media Kit (Downloadable Assets)
- New section on ProductPage (seller-only): **"Media Kit"** card
  - Download all product images as individual files (using anchor download)
  - Copy all captions at once
  - Pre-formatted bio + product description for social posts
- Accessible from both ProductPage and Profile's shop product list

### 5. Performance Analytics (Profile)
- New **"Performance"** card on Dashboard or a dedicated tab in Settings
- Queries existing `sales`, `referrals`, `transactions` tables — no new tables needed
- Shows: total sales count, total earnings, conversion rate, top products, monthly trend chart
- Already have `useSales`, `useReferrals`, `useTransactions` hooks — reuse them

### Database Migration (1 migration)

```sql
-- Shop logo
ALTER TABLE public.profiles ADD COLUMN shop_logo_url text DEFAULT '';

-- Verification & identity
ALTER TABLE public.profiles ADD COLUMN account_type text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN id_document_url text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN verification_status text DEFAULT 'unverified';
ALTER TABLE public.profiles ADD COLUMN social_links jsonb DEFAULT '{}';

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name text NOT NULL DEFAULT '',
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for verification docs (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);
-- Storage bucket for shop logos (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true);
```

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useReviews.ts` | Fetch/submit reviews for a product |
| `src/components/ReviewSection.tsx` | Review list + submit form (used on ProductPage & SellerShop) |
| `src/components/ReviewPrompt.tsx` | Post-checkout review prompt on OrderConfirmation |

### Files to Modify
| File | Changes |
|------|---------|
| `src/hooks/useProfile.ts` | Add new fields to Profile interface |
| `src/pages/Profile.tsx` | Add: shop logo upload, account type selector, ID upload, social links inputs, verification badge, media kit link |
| `src/pages/ProductPage.tsx` | Add: review section, media kit download section (seller-only) |
| `src/pages/SellerShop.tsx` | Add: shop logo display, aggregate reviews |
| `src/pages/OrderConfirmation.tsx` | Add: review prompt after purchase |
| `src/pages/Dashboard.tsx` | Add: performance analytics card (sales stats, top products) |

### Priority Order
1. Database migration (all columns + reviews table + buckets)
2. Reviews system (hooks, components, integration into ProductPage + OrderConfirmation)
3. Shop logo upload (Profile + SellerShop)
4. Verification & social links (Profile tab enrichment)
5. Media kit section (ProductPage seller tools)
6. Performance analytics (Dashboard)

