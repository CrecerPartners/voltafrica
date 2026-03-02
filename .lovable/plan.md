

# Fixes for Sales Verification, Payout Processing, Training Embeds, and Referral Actions

## Issues Identified

After reviewing the code, here's what needs fixing:

---

## 1. Sales Verification -- Transaction Status Update (Backend Fix)

**Current behavior**: When admin confirms a sale, it tries to find a matching "commission" transaction with "pending" status. But when a user logs a sale via ManualSaleDialog, the transaction is created with type `"manual_sale"`, not `"commission"`. So the `handleConfirm` function never finds the matching transaction to update.

**Fix**: Update `AdminSales.tsx` `handleConfirm` to search for the transaction matching the sale more reliably -- match by `user_id` AND look for both `"commission"` and `"manual_sale"` types with `"pending"` status. Also match by amount to be precise.

**User-side pending indicator**: The Sales page and Wallet page already show pending status. Add a more prominent "Pending Verification" banner on the user's Sales page when they have pending sales.

---

## 2. Payout Processing -- Update Transaction on Completion

**Current behavior**: When admin marks a payout as "processed", only the `payouts` table is updated. The user's corresponding payout transaction (negative amount, status "processing") is never updated to reflect completion.

**Fix**: In `AdminPayouts.tsx`, when processing a payout:
- Find the user's payout transaction (type "payout", status "processing", matching user_id and amount) and update its status to "paid"
- When rejecting a payout, update the transaction status to "cancelled" so the balance is restored

This requires:
- Import `useAdminTransactions` and `useUpdateTransactionStatus` in AdminPayouts
- Add logic in `confirmAction` to find and update the matching transaction

---

## 3. Training -- YouTube Embed Link Field

**Current behavior**: The lesson dialog already has a YouTube URL field with an embedded video preview. However, looking at the code more carefully, the field label says "YouTube URL" but the user wants an explicit "Embed Link" field.

**Fix**: Rename the field label to "YouTube Embed / Video Link" for clarity. The embed preview is already working. No functional change needed -- just a label update.

---

## 4. Referral Actions -- Add Quick Actions

**Current behavior**: The referrals page only has an "Edit" button per row. No bulk or quick actions.

**Fix**: Add quick action buttons directly in each row:
- A "Mark Active" button for "signed_up" referrals
- A "Mark Inactive" button for "active" referrals  
- These act as one-click status changes without opening the edit dialog

---

## Technical Changes

### Files to Modify

1. **`src/pages/admin/AdminSales.tsx`**
   - Fix `handleConfirm` to match transactions by both `"commission"` and `"manual_sale"` types, and by matching amount
   - Fix `handleCancel` similarly
   - Add a count badge showing pending sales in the header

2. **`src/pages/admin/AdminPayouts.tsx`**
   - Import `useAdminTransactions` and `useUpdateTransactionStatus` from useAdminData
   - In `confirmAction` when processing: find the matching payout transaction and update status to "paid"
   - In `confirmAction` when rejecting: find the matching payout transaction and update status to "cancelled"

3. **`src/pages/admin/AdminTraining.tsx`**
   - Change YouTube URL field label to "YouTube Embed / Video Link"

4. **`src/pages/admin/AdminReferrals.tsx`**
   - Add inline quick-action buttons (Mark Active / Mark Inactive) in each table row
   - Add summary stats cards at the top (total signed up, active, inactive counts)

5. **`src/pages/Sales.tsx`**
   - Add a pending verification alert banner when there are pending sales

6. **`src/pages/WalletPage.tsx`**
   - Show a notification banner when there are processing payouts that haven't been completed yet

