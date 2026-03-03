

## Current Problem

Right now, the `/product/:slug` route is **inside the `ProtectedRoute` wrapper** (line 63 of App.tsx). This means when a buyer clicks a shared referral link like `voltafrica.lovable.app/product/samsung-galaxy-s24?ref=VOLT-ABC123`, they get **redirected to the login page** instead of seeing the product. That's a broken experience for buyers.

## What Needs to Change

**1. Make the product page publicly accessible**
- Move the `/product/:slug` route **outside** the `ProtectedRoute` wrapper so anyone can view it
- The page already handles the case where `profile` is null (falls back to the `ref` param or "VOLT")

**2. Create a public-facing product page layout**
- When a non-logged-in buyer visits, they should see:
  - Product images (carousel), name, brand, price, description
  - A clean "Buy Now" or purchase CTA (links to the brand's actual purchase page, if available)
  - No seller-specific tools (no referral link generator, no captions, no selling tips)
- When a logged-in seller visits, they see everything as it is today

**3. Wrap the page in a lightweight public layout**
- A simple navbar with the Volt logo and a "Join as Seller" / "Login" CTA (not the full dashboard sidebar)
- Clean footer

**4. Referral tracking**
- The `?ref=CODE` parameter is already read from the URL
- Optionally store it in `localStorage` so if the buyer later signs up, the referral can be attributed

## Technical Plan

| File | Change |
|------|--------|
| `src/App.tsx` | Move `/product/:slug` route outside `ProtectedRoute`, wrap in a new `PublicLayout` |
| `src/pages/ProductPage.tsx` | Conditionally show seller tools (captions, referral link, tips) only when user is logged in. Show a buyer-friendly view (product info + external buy link) for public visitors |
| `src/components/PublicProductLayout.tsx` | New lightweight layout with Volt navbar + footer for public product pages |

This is a small routing + conditional rendering change — no database changes needed.

