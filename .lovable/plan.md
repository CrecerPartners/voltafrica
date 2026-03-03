

## Enrich Profile Page & Seller Shop Experience

### Current State
The Profile page has basic shop settings (name, bio, slug, copy link, product list with remove). The public SellerShop page shows seller info + product grid. The Marketplace and ProductPage have "Add to My Shop" buttons. **The foundation is built.**

### What's Missing / Needs Strengthening

**1. Profile Page — "My Shop" section needs enrichment:**
- Show shop URL prominently with a "Preview My Shop" button (opens `/s/:slug` in new tab)
- Show an empty state when no products are in the shop with a CTA to "Browse Marketplace"
- Show product count, commission rate, and price on each shop product row
- Add a "Copy Product Link" button per product (copies the seller's referral link for that product)
- Show the shop status: whether the shop is "live" (has slug + at least 1 product) or "not set up yet"

**2. Profile Page — Add "Quick Actions" toolbar in the shop card:**
- "View My Public Shop" — link to `/s/:shopSlug`
- "Share Shop Link" — copy/native share
- "Add Products" — link to `/marketplace`

**3. Public SellerShop page — Polish:**
- Add a "Shop {Name}'s Picks" heading above the product grid
- Show a friendly empty state with the seller's name
- Add the seller's referral code to all product links (already done ✓)

**4. Marketplace — Make "Add to My Shop" more visible:**
- Add tooltip or label so it's not just an icon button
- Show a small counter badge in the sidebar nav for "My Shop" items (nice-to-have)

### Files to Modify

**`src/pages/Profile.tsx`** — Major enrichment:
- Add "Preview My Shop" button that opens public shop URL
- Add "Browse Marketplace" CTA when shop is empty  
- Show commission rate + price on each product row
- Add per-product "Copy Link" button (copies `origin/product/:slug?ref=CODE`)
- Add shop status indicator (live vs incomplete)
- Add "Share Shop" quick action alongside "Copy Shop Link"

**`src/pages/SellerShop.tsx`** — Minor polish:
- Add "Shop {Name}'s Picks" section heading above product grid
- Personalize empty state message with seller name

**`src/pages/Marketplace.tsx`** — Minor:
- Add text label to the shop toggle button so it reads "Add to Shop" / "In Shop" instead of just an icon

No database changes needed — all schema is already in place.

