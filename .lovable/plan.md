

## Remove Public Product Catalog & Clean Up Buyer-Facing Product Page

### The Problems

1. **`/products` public catalog breaks the seller network model** — purchases from there can't be attributed to any seller since there's no ref code. This undermines the entire commission system.
2. **`/product/:slug` shows seller-internal info to buyers** — commission badges, social captions, selling tips, media kits, and "Sign In" CTAs are seller tools that shouldn't appear on buyer-facing views. Even though some are gated behind `isLoggedIn`, the page structure is still seller-oriented when accessed publicly (e.g., the breadcrumb says "Marketplace", the "Sign In" button invites buyers to become sellers).

### The Solution

**1. Remove `/products` public catalog entirely**
- Delete the route from `App.tsx` and the `PublicMarketplace.tsx` page
- Remove "Products" link from `LandingNavbar.tsx`
- Products are discovered through **seller shops** (`/s/:slug`) which naturally carry the seller's ref code for attribution

**2. Clean up `ProductPage.tsx` for buyer context**
- When accessed **without a ref code and not logged in** (direct link / search engine):
  - Show product info, images, price, reviews — but replace the purchase CTA with a message like "Find a seller to purchase this product" or simply hide it
  - Hide: commission badge, "Sign In" button, captions, tips, media kit (already mostly gated)
- When accessed **with a ref code** (`?ref=CODE`) — buyer via seller shop:
  - Show full buyer experience: images, price, "Add to Cart" / "Sign Up Now", reviews
  - Hide all seller tools (commission, captions, tips, media kit)
- When accessed **logged in** (seller):
  - Show seller tools: commission, share links, captions, tips, media kit, "Add to My Shop"
  - Keep "Add to Cart" available (sellers can also buy)

**3. Update `SellerShop.tsx`**
- Remove the "Browse All Products" link (since `/products` is gone)

**4. Breadcrumb fix on `ProductPage.tsx`**
- For buyers (ref link): breadcrumb links back to the seller's shop, not `/marketplace`
- For sellers (logged in): breadcrumb links to `/marketplace`

### Files to Delete
| File | Reason |
|------|--------|
| `src/pages/PublicMarketplace.tsx` | No longer needed — products discovered via seller shops |

### Files to Modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Remove `/products` route, remove `PublicMarketplace` import |
| `src/pages/ProductPage.tsx` | Context-aware rendering: buyer-with-ref sees clean purchase page, no-ref sees "find a seller", seller sees full tools. Fix breadcrumb. |
| `src/components/LandingNavbar.tsx` | Remove "Products" nav link |
| `src/pages/SellerShop.tsx` | Remove "Browse All Products" link |

