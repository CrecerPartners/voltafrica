

# Three New Features: Earnings Calculator, Sales Assets Hub, and Manual Sale Entry

## Overview
Adding three features students have been asking for: (1) a calculator to see how much they could earn selling different product combinations, (2) a place to grab product images and sharable marketing assets, and (3) a way to manually log sales with proof on the Wallet page.

---

## Feature 1: Earnings Calculator

**What it does:** Students pick products from a dropdown, set the quantity they think they can sell, and instantly see their projected earnings. They can add multiple products to build a "sales plan" and see a grand total -- motivating them to sell more.

**Where it lives:** New page at `/calculator` with a sidebar nav entry.

### UI Design
- Header: "Earnings Calculator" with subtitle "See how much you could earn"
- A card with a product selector (dropdown of all products) + quantity input + "Add" button
- A running list of added products showing: product name, price, commission %, qty, and projected commission per product
- A prominent **total projected earnings** display at the bottom
- "Clear All" and "Share Plan" buttons
- A motivational message based on the total (e.g., "That's enough for a new laptop!" or "You'd be on track for Gold tier!")

### Technical Details
- New file: `src/pages/Calculator.tsx`
- Uses existing `products` array from `mockData.ts` for product data and commission rates
- Pure client-side math: `qty * price * (commissionRate / 100)`
- Uses `useState` for the product list, Select component for product picker
- Add route `/calculator` in `App.tsx`, add nav item in `AppSidebar.tsx` with `Calculator` icon from lucide

---

## Feature 2: Sales Assets Hub (Product Detail Drawer)

**What it does:** When a student clicks on a product card in the Marketplace, a detail panel opens showing product images, description, selling tips, and downloadable/sharable marketing assets (social media captions, WhatsApp messages, Instagram story templates).

**Where it lives:** Integrated into the existing Marketplace page via a sheet/drawer component.

### UI Design
- Clicking a product card opens a **Sheet** (slide-in panel from the right)
- Inside the sheet:
  - Large product image/emoji at top
  - Product name, brand, price, commission info
  - **"Product Images" section**: Grid of placeholder product photos (mock URLs) with "Copy Image Link" and "Download" buttons
  - **"Sales Assets" section**: Pre-written WhatsApp message, Instagram caption, and a shareable product link -- each with a "Copy" button
  - **"Selling Tips" section**: 2-3 bullet points on how to pitch the product
  - "Get Referral Link" button at the bottom

### Technical Details
- New file: `src/components/ProductDetailSheet.tsx`
- Update `src/data/mockData.ts`: Add `assets` field to `Product` interface with `images: string[]`, `whatsappMessage: string`, `instagramCaption: string`, `sellingTips: string[]`
- Update `src/pages/Marketplace.tsx`: Add click handler on product cards to open the sheet, pass selected product as prop
- Uses existing Sheet component from `@/components/ui/sheet`
- Copy-to-clipboard for all sharable content using `navigator.clipboard`

---

## Feature 3: Manual Sale Entry on Wallet Page

**What it does:** Students can manually log a sale they made (e.g., sold a hoodie in person), select the product, enter customer info, upload proof (receipt/screenshot), and it appears in their transaction history as "pending review."

**Where it lives:** A button on the Wallet page that opens a dialog/modal form.

### UI Design
- "Log a Sale" button at the top of the Wallet page (next to the header)
- Clicking it opens a **Dialog** with a form:
  - Product selector (dropdown from product list)
  - Quantity sold (number input, default 1)
  - Customer name or identifier (text input)
  - Proof of sale: file upload button (stores locally as a preview, shows filename)
  - Optional notes field
  - Auto-calculated commission display based on selected product
  - "Submit Sale" button
- On submit: adds the sale to the local transactions list with status "pending" and shows a success toast
- The new transaction appears immediately in the transaction list with a special "manual" badge

### Technical Details
- New file: `src/components/ManualSaleDialog.tsx`
- Update `src/pages/WalletPage.tsx`: Add "Log a Sale" button, import and render the dialog, manage state for manually added transactions
- Update `src/data/mockData.ts`: Add `"manual_sale"` to the Transaction type union, add label in WalletPage
- Uses existing Dialog, Select, Input, Button, and Textarea components
- File upload is cosmetic (stores filename in state, shows preview) -- no backend storage
- Commission auto-calculates from the product's `commissionRate` and `price`

---

## Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Calculator.tsx` | Create | Earnings calculator page |
| `src/components/ProductDetailSheet.tsx` | Create | Product detail + assets drawer |
| `src/components/ManualSaleDialog.tsx` | Create | Manual sale entry form |
| `src/data/mockData.ts` | Edit | Add assets data to products, add manual_sale type |
| `src/pages/Marketplace.tsx` | Edit | Add click-to-open product detail sheet |
| `src/pages/WalletPage.tsx` | Edit | Add "Log a Sale" button + dialog integration |
| `src/components/AppSidebar.tsx` | Edit | Add Calculator nav item |
| `src/App.tsx` | Edit | Add /calculator route |

