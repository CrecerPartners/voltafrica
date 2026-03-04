

## Fix Seller vs Buyer Experience & Public Marketplace

### The Problems

1. **Marketplace (`/marketplace`) is behind login** — requires seller auth to access. Buyers can't browse products.
2. **Logged-in sellers see "Add to Cart"** on the marketplace — but sellers should primarily see "Add to My Shop", not cart buttons.
3. **No public product catalog exists** — there's no `/products` route for public browsing.
4. **Product page "Similar Products" shows same-category** — should show products from the same seller (since shops exist now).
5. **Seller shops don't link to "See All Products"** — no way to browse the full catalog from a shop page.
6. **Cart shows in dashboard navbar** — it doesn't, but the CartDrawer shows on the public LandingNavbar which is correct for buyers.

### The Solution

**1. Create a public `/products` route** that renders a buyer-facing version of the marketplace (no login required, cart works, no "Add to Shop" buttons). This uses the `PublicProductLayout` wrapper.

**2. Redesign the seller `/marketplace`** to be seller-focused:
- Primary action: **"+ My Shop"** (add to shop)
- Secondary: "Copy Link" for sharing
- Remove "Add to Cart" from the seller marketplace entirely
- Keep commission info visible (seller context)

**3. Add `/products` link** to:
- Seller shops (`/s/:slug`) — "Browse All Products" link
- The public `LandingNavbar`

**4. Change "Similar Products" on `ProductPage.tsx`** to "More from this Seller" — query products that share the same seller (via `seller_shop_items`). Fall back to same-category if no seller context.

**5. Cart/checkout stays fully public** — no login needed to add to cart or check out (already works this way on `/product/:slug`).

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/PublicMarketplace.tsx` | Buyer-facing product catalog at `/products` — browse, search, filter, add to cart. No login required. No commission info, no "Add to Shop". |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/products` route under `PublicProductLayout` |
| `src/pages/Marketplace.tsx` | Redesign as seller tool: primary CTA is "Add to Shop" / "In Shop", show commission prominently, remove "Add to Cart" button, add link to public `/products` |
| `src/pages/ProductPage.tsx` | Change "Similar Products" → "More from this Seller" using `seller_shop_items` lookup. If accessed via shop ref, show that seller's other products. Fallback to same-category. |
| `src/pages/SellerShop.tsx` | Add "Browse All Products" link pointing to `/products` |
| `src/components/LandingNavbar.tsx` | Add "Products" nav link to `/products` |

### Key UX Decisions

- **Sellers** (logged in, `/marketplace`): See commission rates, "Add to My Shop", share links. No cart.
- **Buyers** (public, `/products`): See prices, "Add to Cart", no commission info, no shop management. Cart → Checkout → enter details at payment.
- **Product pages** (`/product/:slug`): Remain dual-purpose — show cart for everyone, show seller tools only when logged in (already works this way).

