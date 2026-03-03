

## Seller Shop Feature — Implementation Plan

### Overview
Sellers curate products from the marketplace into a personal "shop." Each seller gets a public storefront at `/s/:shopSlug` (e.g., `voltafrica.com/s/adas-picks`) that visitors can browse and buy from. The profile page gains shop management tools.

### Database Changes (1 migration)

**1. Add columns to `profiles`:**
```sql
ALTER TABLE public.profiles ADD COLUMN bio text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN shop_name text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN shop_slug text UNIQUE;
```

**2. New table: `seller_shop_items`**
```sql
CREATE TABLE public.seller_shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.seller_shop_items ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own items
CREATE POLICY "Users manage own shop items" ON public.seller_shop_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Anyone (including anon visitors) can read shop items for public storefront
CREATE POLICY "Anyone can read shop items" ON public.seller_shop_items
  FOR SELECT TO anon USING (true);
```

**3. Allow anon SELECT on profiles** (for public shop pages to load seller info):
```sql
CREATE POLICY "Anon can read profiles" ON public.profiles
  FOR SELECT TO anon USING (true);
```

Note: The existing "Authenticated can read profiles" policy uses `USING (true)` which already covers authenticated users. The new policy adds anon coverage. Sensitive fields (bank_name, account_number, whatsapp) will be excluded in the public shop page query — we'll only SELECT `name, bio, shop_name, shop_slug, avatar_url, referral_code` for public display.

### New Files

**`src/hooks/useSellerShop.ts`**
- `useMyShopItems()` — fetch current seller's curated product IDs
- `useAddToShop()` — mutation: insert into seller_shop_items
- `useRemoveFromShop()` — mutation: delete from seller_shop_items
- `usePublicSellerShop(shopSlug)` — fetch profile + shop products by shop_slug (for public page). Only selects non-sensitive profile columns.

**`src/pages/SellerShop.tsx`** — Public storefront at `/s/:shopSlug`
- Fetch seller profile by `shop_slug` (name, avatar, bio, shop_name only)
- Fetch their curated products via seller_shop_items joined with products
- Display: seller avatar, name, bio, "Shop [Name]'s Picks" heading
- Product grid with "Add to Cart" buttons (reuses existing cart system)
- Clean layout using `PublicProductLayout` (LandingNavbar + footer)
- No seller tools, no commission info, no dashboard

### Modified Files

**`src/pages/Profile.tsx`**
- Add new form fields: "Shop Name" and "Bio" (textarea)
- Auto-generate `shop_slug` from shop_name (lowercase, spaces → hyphens, strip special chars)
- New "My Shop" card showing curated products with remove buttons
- "Copy Shop Link" button: `${window.location.origin}/s/${shop_slug}`
- Update the `useUpdateProfile` call to include bio, shop_name, shop_slug

**`src/hooks/useProfile.ts`**
- Add `bio`, `shop_name`, `shop_slug` to the Profile interface

**`src/pages/Marketplace.tsx`**
- Add "Add to My Shop" / "In My Shop" toggle button on each product card (logged-in only)
- Uses `useMyShopItems` + `useAddToShop` / `useRemoveFromShop`

**`src/pages/ProductPage.tsx`**
- Add "Add to My Shop" button in the seller tools section (logged-in only)

**`src/App.tsx`**
- Add route: `/s/:shopSlug` → `SellerShop` inside `PublicProductLayout`

### Architecture

```text
Marketplace / ProductPage
  └─ "Add to My Shop" (1-click toggle) ──→ seller_shop_items table

Profile Page (logged-in seller)
  ├─ Edit shop name, bio
  ├─ View/remove curated products
  └─ Copy shop link: voltafrica.com/s/adas-picks

Public Storefront /s/:shopSlug
  ├─ Reads profiles (non-sensitive fields only) by shop_slug
  ├─ Reads seller_shop_items + products
  └─ Displays product grid with Add to Cart
```

### Security Notes
- Public shop page only queries: `name, bio, shop_name, shop_slug, avatar_url` from profiles — bank details, whatsapp, email are never exposed
- seller_shop_items: authenticated users have full CRUD on own rows; anon has read-only
- Products table already allows anon SELECT

