

# Wallet, Payouts & Manual Sales -- End-to-End Plan

## Current State

- **Wallet page** shows balances and transaction history, has a "Request Payout" button that only shows a toast
- **Manual Sale dialog** exists on the Wallet page -- inserts into both `sales` and `transactions` tables
- **Sales page** shows sales list but has no "Log a Sale" button
- **Profile page** collects bank name and account number
- There is no `payouts` table or payout request flow

## What We'll Build

### 1. Payouts Table (Database Migration)

Create a `payouts` table to track payout requests:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | not null |
| amount | numeric | requested amount |
| status | text | `pending` / `processing` / `paid` / `rejected` |
| bank_name | text | snapshot from profile |
| account_number | text | snapshot from profile |
| requested_at | timestamptz | default now() |
| processed_at | timestamptz | nullable |
| notes | text | nullable, admin notes |

RLS: users can SELECT and INSERT their own rows.

Also insert a corresponding `payout` transaction (negative amount) when a payout is requested.

### 2. Request Payout Flow (Wallet Page)

Replace the dummy toast with a real **Request Payout dialog** that:
- Shows the user's available balance
- Lets them enter the amount (validated against available balance, minimum threshold e.g. 1,000 naira)
- Shows their bank details from profile (with a link to Profile if missing)
- On submit: inserts into `payouts` table + inserts a `payout` transaction with negative amount and `processing` status
- Invalidates queries so wallet updates immediately

### 3. Add "Log a Sale" Button to Sales Page

The ManualSaleDialog already exists but is only accessible from the Wallet page. We'll add the same button + dialog to the Sales page so users can log sales from either place.

### 4. Wallet Balance Logic Fix

Update `useWallet` to also account for `processing` payouts (currently only counts `paid` earnings minus payouts). Ensure that when a payout is requested, the available balance decreases immediately.

---

## Technical Details

### Database Migration SQL

```sql
CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  bank_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  notes text
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payouts" ON public.payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payouts" ON public.payouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### New Files
- `src/components/RequestPayoutDialog.tsx` -- dialog with amount input, bank details display, submit logic

### Modified Files
- `src/pages/WalletPage.tsx` -- wire up RequestPayoutDialog instead of toast
- `src/pages/Sales.tsx` -- add "Log a Sale" button + ManualSaleDialog
- `src/hooks/useWallet.ts` -- adjust balance calc to subtract processing payouts

### Flow Summary

```text
User makes sale --> Logs via ManualSaleDialog (Sales or Wallet page)
  --> Inserts into `sales` (pending) + `transactions` (pending, positive amount)

Sale confirmed by admin --> transaction status updated to `paid`
  --> Available balance increases

User requests payout --> RequestPayoutDialog
  --> Inserts into `payouts` (pending) + `transactions` (payout, negative amount, processing)
  --> Available balance decreases

Admin processes payout --> updates payout status to `paid`, transaction to `paid`
```

