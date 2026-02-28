
# Full Backend Setup with External Supabase

## Overview
Connect your Supabase project and replace all mock data with real authentication, database tables, file storage, and live queries. After this, users will sign up for real, their sales/earnings will persist, and proof-of-sale uploads will be stored in the cloud.

---

## Phase 1: Connect Supabase + Authentication

### 1.1 Install Supabase client
- Add `@supabase/supabase-js` dependency
- Create `src/integrations/supabase/client.ts` with your project URL and anon key

### 1.2 Auth context
- Create `src/contexts/AuthContext.tsx` with signup, login, logout, and session listener (`onAuthStateChange`)
- Wrap the app in the auth provider
- Protect dashboard routes: redirect to `/login` if not authenticated
- Update `Login.tsx` to call `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()`
- Add logout button to sidebar/header

### 1.3 Profiles table
- **Migration**: Create `profiles` table (id, user_id FK to auth.users, name, email, university, whatsapp, bank_name, account_number, tier, referral_code, avatar_url, created_at)
- **Trigger**: Auto-create profile row on signup
- **RLS**: Users can read/update only their own profile
- Update `Profile.tsx` and `DashboardLayout.tsx` to fetch from `profiles` table instead of `currentUser` mock

---

## Phase 2: Database Tables

### 2.1 Products table
- **Migration**: Create `products` table matching the current `Product` interface (id, name, brand, category, commission_rate, price, image_emoji, description, assets JSONB)
- **RLS**: All authenticated users can read products (admin-only insert/update -- handled later)
- **Seed**: Insert the 14 existing mock products via the insert tool

### 2.2 Sales table
- **Migration**: Create `sales` table (id, user_id FK, product_id FK, date, customer, quantity, amount, commission, status, proof_file_url, notes, created_at)
- **RLS**: Users can insert and read their own sales only

### 2.3 Transactions table
- **Migration**: Create `transactions` table (id, user_id FK, date, type, description, amount, status, proof_file_name, created_at)
- **RLS**: Users can read their own transactions; insert allowed for manual_sale type

### 2.4 Referrals table
- **Migration**: Create `referrals` table (id, referrer_id FK, referred_user_id FK, date, status, earnings)
- **RLS**: Users can read referrals where they are the referrer

### 2.5 Leaderboard view
- **Migration**: Create a database view `leaderboard_view` that aggregates total earnings and sales count per user from the transactions/sales tables, joined with profiles for name and university
- Public read access for all authenticated users

---

## Phase 3: File Storage (Proof of Sale)

### 3.1 Storage bucket
- **Migration**: Create a `sale-proofs` storage bucket (private)
- **RLS**: Users can upload to their own folder (`user_id/filename`), read their own files

### 3.2 Update ManualSaleDialog
- On submit, upload the proof file to `sale-proofs/{user_id}/{timestamp}_{filename}` via Supabase Storage
- Save the returned URL in the `sales` and `transactions` tables
- Show upload progress indicator

---

## Phase 4: Wire Up UI to Live Data

### 4.1 React Query hooks
- Create `src/hooks/useProfile.ts` -- fetch/update current user profile
- Create `src/hooks/useProducts.ts` -- fetch products list
- Create `src/hooks/useSales.ts` -- fetch user sales, submit manual sale
- Create `src/hooks/useTransactions.ts` -- fetch user transactions
- Create `src/hooks/useReferrals.ts` -- fetch user referrals
- Create `src/hooks/useLeaderboard.ts` -- fetch leaderboard view
- Create `src/hooks/useWallet.ts` -- compute wallet summary from transactions

### 4.2 Update pages
- `Dashboard.tsx` -- use hooks instead of mock imports; compute stats from real data
- `Marketplace.tsx` -- fetch products from DB
- `WalletPage.tsx` -- use transactions hook, wallet summary hook
- `Sales.tsx` -- use sales hook
- `Referrals.tsx` -- use referrals hook
- `Leaderboard.tsx` -- use leaderboard hook
- `Profile.tsx` -- use profile hook for read/update
- `Calculator.tsx` -- use products hook for commission rates

### 4.3 Signup bonus
- On profile creation trigger, auto-insert a ₦500 `signup_bonus` transaction

---

## Technical Summary

| Layer | What | Count |
|-------|------|-------|
| Migrations | profiles, products, sales, transactions, referrals, leaderboard_view, storage bucket, RLS policies, triggers | ~5 migrations |
| New files | AuthContext, supabase client, 7 hooks | ~9 files |
| Modified files | App.tsx, Login.tsx, DashboardLayout.tsx, Dashboard, Marketplace, Wallet, Sales, Referrals, Leaderboard, Profile, Calculator, ManualSaleDialog, AppSidebar | ~13 files |
| Seeded data | 14 products inserted into products table | 1 insert |

### Important Notes
- The `mockData.ts` file will be kept temporarily for reference but all imports will be replaced with hook-based data
- `formatNaira` utility will move to `src/lib/utils.ts` since it's not mock-specific
- User roles table will be created (as required by security guidelines) but admin features are out of scope for this phase
- All tables use RLS -- no public access to user data
