

## Full Checkout with Paystack — Implementation Plan

This is a significant feature addition: buyers can browse products, add to cart, and pay via Paystack — all within Volt. No external redirect. Buyer accounts are optional (guest checkout supported).

---

### What We Need to Build

**1. Database Tables**
- `orders` — stores each order (guest or authenticated buyer), delivery info, payment status, Paystack reference
- `order_items` — line items per order (product_id, quantity, price at time of purchase, referring seller's code)
- RLS: public INSERT (guest checkout), authenticated users can read their own orders, admins can read/update all

**2. Cart System (Client-Side)**
- React context (`CartContext`) storing items in state + `localStorage` for persistence
- Add to cart from product page and marketplace
- Cart drawer/sheet accessible from navbar (item count badge)
- Quantity controls, remove item, clear cart

**3. Checkout Page (`/checkout`)**
- Delivery form: name, email, phone, address, city, state
- Order summary with item list and totals
- Optional: "Create account" checkbox for guest buyers
- "Pay with Paystack" button that initiates payment

**4. Paystack Integration**
- Edge function `create-paystack-payment` — creates a Paystack transaction, returns authorization URL
- Edge function `paystack-webhook` — receives Paystack webhook on payment success/failure, updates order status
- Paystack secret key stored as a secret
- Client redirects to Paystack's hosted payment page, then back to `/order-confirmation`

**5. Order Confirmation Page (`/order-confirmation`)**
- Shows order details after successful payment
- "Continue Shopping" and optional "Create Account" CTAs

**6. Referral Attribution**
- When a buyer checks out, the `ref` code from `localStorage` (captured from product URL) is saved on the order items
- Admin/system can later attribute commissions to the referring seller

---

### Technical Details

| Area | Details |
|------|---------|
| **New DB tables** | `orders` (id, email, name, phone, address, city, state, total, status, paystack_reference, user_id nullable, created_at), `order_items` (id, order_id, product_id, quantity, price, commission_rate, ref_code) |
| **New edge functions** | `create-paystack-payment`, `paystack-webhook` |
| **New secret** | `PAYSTACK_SECRET_KEY` |
| **New files** | `src/contexts/CartContext.tsx`, `src/pages/Checkout.tsx`, `src/pages/OrderConfirmation.tsx`, `src/components/CartDrawer.tsx` |
| **Modified files** | `src/pages/ProductPage.tsx` (add "Add to Cart" button), `src/pages/Marketplace.tsx` (add cart button to cards), `src/components/PublicProductLayout.tsx` (cart icon in navbar), `src/App.tsx` (new routes) |
| **Button label updates** | Seller: "Copy My Share Link" (was "Get Referral Link"). Buyer: "Add to Cart" + "Buy Now" (direct to checkout with single item) |

### Flow Summary

```text
Buyer clicks shared link → Product page (public) → "Add to Cart"
                                                  → Cart drawer → "Checkout"
→ /checkout (guest form + order summary) → "Pay with Paystack"
→ Paystack hosted page → payment → webhook updates order → /order-confirmation
```

No account required to purchase. Referral code travels from URL → localStorage → order_items for commission tracking.

