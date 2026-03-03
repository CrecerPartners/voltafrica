

## Fix: Hide seller tools from public product page visitors

### The Problem
The `LandingNavbar` (used on public product pages) never checks authentication state — it always shows "Sign In" and "Get Started". Meanwhile, the `ProductPage` component does check `isLoggedIn` and shows seller tools (captions, share links, selling tips) when the user has an active session.

So a logged-in seller browsing via `PublicProductLayout` sees seller-only tools alongside a "Sign In" navbar — a confusing mix. More importantly, any logged-in user sees seller tools on public product pages, even if they arrived there as a buyer.

### The Fix (2 changes)

**1. Update `LandingNavbar` to be auth-aware**
- Import `useAuth` and check if the user is logged in
- If logged in: show a "Dashboard" button (linking to `/dashboard`) instead of "Sign In" / "Get Started"
- If not logged in: keep current "Sign In" and "Get Started" buttons
- Cart icon stays visible for everyone

**2. Keep seller tools gated behind `isLoggedIn` in `ProductPage`**
- The existing `isLoggedIn` check on line 212 is correct — "Copy My Share Link", captions, and selling tips only show for logged-in sellers
- Also hide the commission badge (line 150-152) from non-logged-in users since buyers don't need to see commission rates
- The "Start Earning X% — Join Volt" CTA for non-logged-in visitors stays as-is

### Files to modify
- `src/components/LandingNavbar.tsx` — add auth check, show "Dashboard" when logged in
- `src/pages/ProductPage.tsx` — hide commission badge for non-logged-in users

