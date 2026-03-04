

## Restructure Product Types & Commission Models

### What We're Building

Adding `product_type` and `commission_model` to products so Volt can handle physical goods, digital products, and lead/sign-up offers with distinct flows. For lead products, sellers share an **external link with their tracking ref code appended** — no cart, no checkout. The system tracks clicks and admin manually verifies conversions.

### Database Migration

Add 2 columns to `products`, 1 to `sales`:

```sql
ALTER TABLE public.products ADD COLUMN product_type text NOT NULL DEFAULT 'physical';
-- values: 'physical', 'digital', 'lead'

ALTER TABLE public.products ADD COLUMN commission_model text NOT NULL DEFAULT 'percentage';
-- values: 'percentage', 'fixed', 'per_signup', 'per_install'

ALTER TABLE public.sales ADD COLUMN conversion_status text DEFAULT NULL;
-- values: 'clicked', 'signed_up', 'verified', 'paid_out' (only for lead products)
```

The `fulfillment_url` (external brand link for digital/lead products) will be stored in the existing `assets` JSONB field as `assets.fulfillment_url`.

### How Lead/Sign-Up Tracking Works

1. Admin creates a lead product with `product_type = 'lead'` and sets `assets.fulfillment_url` to the brand's external sign-up page (e.g. `https://brand.com/signup`)
2. On ProductPage, instead of "Add to Cart", buyer sees **"Sign Up Now"** button
3. Clicking it:
   - Records a `sales` row with `conversion_status: 'clicked'`, `amount: 0`, and the seller's ref code
   - Redirects buyer to `fulfillment_url?ref={sellerRefCode}` — the external link with tracking code appended
4. Admin later updates `conversion_status` through AdminSales as the lead progresses (clicked → signed_up → verified → paid_out)
5. Commission is only credited when admin sets status to `verified`

### How Digital Products Differ

- Same checkout flow but **Checkout.tsx hides delivery address fields** (only name, email, phone)
- After payment, **redirect to `fulfillment_url`** instead of generic confirmation
- Paystack webhook auto-confirms digital orders

### Files to Modify

| File | What Changes |
|------|-------------|
| `src/hooks/useProducts.ts` | Add `productType`, `commissionModel` to interfaces, map from DB |
| `src/hooks/useProduct.ts` | Same interface update |
| `src/pages/admin/AdminProducts.tsx` | Add Product Type selector (Physical/Digital/Lead), Commission Model selector, Fulfillment URL field (shown for digital/lead) |
| `src/pages/ProductPage.tsx` | Conditional CTA: "Add to Cart" for physical/digital, "Sign Up Now" for lead (creates sale record + redirects to external URL with ref code). Show product type badge. |
| `src/pages/Marketplace.tsx` | Show type badge. For leads: "Sign Up" instead of "Add" button, link goes external with ref |
| `src/pages/Checkout.tsx` | Hide address/city/state for digital products. After payment for digital, redirect to fulfillment URL |
| `src/pages/Sales.tsx` | Add "Type" filter tab (All/Sales/Leads). Show `conversion_status` for lead-type entries |
| `src/pages/admin/AdminSales.tsx` | Add conversion status dropdown for lead sales (clicked → signed_up → verified → paid_out). Confirming a lead at "verified" credits commission |
| `src/components/ManualSaleDialog.tsx` | For lead products: hide price/quantity/proof fields, show conversion status selector instead |
| `supabase/functions/paystack-webhook/index.ts` | Look up product type; auto-confirm digital orders on payment |
| `src/pages/admin/AdminProducts.tsx` | Show product type column in table |

### Commission Display (Seller-facing)

- **Physical**: "Earn 20% per sale" + Add to Cart
- **Digital**: "Earn ₦500 per sale" + Add to Cart (no shipping)
- **Lead**: "Earn ₦1,000 per verified sign-up" + Share Link (external redirect)

### What We're NOT Building Yet

- Auto-conversion tracking via brand API/webhooks (future)
- Subscription renewal tracking (future)
- Per-install SDK tracking (future)

Admin manually verifies lead conversions, same pattern as current manual sale verification.

