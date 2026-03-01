

# Add Price Field to Sale Form & Sale Verification Before Payout

## Overview

Two changes: (1) Add a **price field** after quantity in the "Log a Sale" dialog, and (2) enforce that only **verified/confirmed sales** contribute to the payout-eligible balance, with clear messaging that payment confirmation takes 3-7 working days.

## Changes

### 1. ManualSaleDialog -- Add Price Field (`src/components/ManualSaleDialog.tsx`)

- Add a `price` state field (defaults to the selected product's price but can be overridden)
- Insert a **Price** input field in the grid row after Quantity (change from 2-col to 3-col grid: Quantity | Price | Customer)
- Update commission calculation to use the entered price instead of `selectedProduct.price`
- Update the sale insert to use the entered price for `amount`
- Auto-populate price when a product is selected

### 2. Wallet Balance -- Only Count Confirmed Sales (`src/hooks/useWallet.ts`)

- Change `availableBalance` calculation: only count transactions with `status === "paid"` **and** exclude transactions linked to unverified sales
- The current logic already separates `pending` from `paid` -- but we need to also ensure `processing` payouts are properly deducted
- Update the summary so `availableBalance` only reflects fully confirmed/paid earnings

### 3. Payout Dialog -- Verification Messaging (`src/components/RequestPayoutDialog.tsx`)

- Add an info banner stating: "Only verified sales are eligible for payout. Sale verification and payment confirmation takes 3-7 working days."
- Update the success toast to mention the 3-7 working days timeline
- Keep the existing `MIN_PAYOUT` and bank details checks

### 4. Sale Submission Messaging (`src/components/ManualSaleDialog.tsx`)

- Update the `DialogDescription` and success toast to clearly state that the sale will be reviewed and payment confirmed within 3-7 working days
- Add a small info note below the commission estimate: "Commission will reflect in your wallet once the sale and payment are confirmed (3-7 working days)"

## Files Modified

| File | Change |
|------|--------|
| `src/components/ManualSaleDialog.tsx` | Add price input field after quantity; update commission calc; add verification messaging |
| `src/hooks/useWallet.ts` | Ensure only `paid` status transactions count toward available balance (already mostly correct, minor review) |
| `src/components/RequestPayoutDialog.tsx` | Add info banner about 3-7 working days verification; update success toast |

