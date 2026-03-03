

## Fix Seller Shop Issues

### Problems Identified

1. **Shop slug never saved**: All profiles have `shop_slug = null`. The slug is generated client-side from `shop_name` but only saved on "Save Changes" click. The user likely saved but the slug generation from shop_name may not have matched what was expected. Also, the user wants to **customize the slug directly**, not just auto-generate it.

2. **"Shop not available"**: Because `shop_slug` is null in DB, the public shop page query returns nothing.

3. **Products added from Marketplace don't reflect immediately in Profile shop list**: The `useMyShopItems` query key is `["my-shop-items", user?.id]` but invalidation in `useAddToShop`/`useRemoveFromShop` uses `["my-shop-items"]` — this actually works (prefix matching), but the Profile page isn't navigated to immediately after adding. The real issue is likely that the user expects instant feedback on the Marketplace page itself (which works) AND on the Profile page when they navigate back.

4. **Page title**: Should be "Settings" not "Profile & Settings".

5. **Profile and Shop settings should be separated**: Use tabs — "Profile" tab and "Shop" tab.

6. **Shop slug should be editable**: Let the user customize their shop URL slug with a text input, auto-prefilled from shop name but editable.

### Changes

**`src/pages/Profile.tsx`** — Major restructure:
- Rename page title to "Settings"
- Split into two tabs: **Profile** (avatar, personal info, payout details, save button) and **My Shop** (shop name, custom slug input, bio, shop URL preview, shop status, products list, quick actions, save button)
- Add editable `shop_slug` field: auto-generate from shop_name as default, but let user override. Show live preview of the URL.
- Each tab has its own Save button

**`src/hooks/useSellerShop.ts`** — Fix invalidation:
- Change `onSuccess` in `useAddToShop` and `useRemoveFromShop` to also invalidate `["my-shop-items", user?.id]` explicitly (belt-and-suspenders)

**`src/components/AppSidebar.tsx`** — Rename "Profile" to "Settings" in nav

**`src/components/MobileBottomNav.tsx`** — Rename "Profile" to "Settings" if present

### No database changes needed — schema already supports all fields.

