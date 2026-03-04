

## Three Changes: Skippable Onboarding Walkthrough, Split Name Fields, Sale Edit/Delete

### 1. Skippable Step-by-Step Onboarding Walkthrough

After the signup bonus dialog closes, show a guided onboarding flow — 6 steps as modal cards with progress dots and a **"Skip" button on every step**:

1. Set Up Your Profile → `/profile`
2. Browse Products → `/marketplace`
3. Check Wallet → `/wallet`
4. Copy Referral Code → copies code
5. Request Payout → `/wallet`
6. View Leaderboard → `/leaderboard`

Each step: icon, title, subtitle, "Do This" button + **"Skip" link** at bottom. User can skip any individual step or skip the entire walkthrough. Completion tracked in `localStorage`.

**Files:**
- **Create** `src/components/OnboardingWalkthrough.tsx`
- **Modify** `src/pages/Dashboard.tsx` — trigger walkthrough after bonus dialog closes

### 2. Separate First Name & Last Name on Signup

Replace single "Full Name" field with two required fields. Combine as `${firstName} ${lastName}` for `signUp()`. Make all signup fields (first name, last name, seller type, city) required with validation.

**Files:**
- **Modify** `src/pages/Login.tsx`

### 3. Edit & Delete Pending Sales

Add edit/delete actions on pending sales rows. Edit opens a pre-filled dialog. Delete confirms with alert dialog.

**Database:**
- Migration: RLS policies for users to update/delete own sales where `status = 'pending'`

**Files:**
- **Create** `src/components/EditSaleDialog.tsx`
- **Modify** `src/pages/Sales.tsx` — add action buttons
- **Modify** `src/hooks/useSales.ts` — add `useDeleteSale` and `useUpdateSale` hooks

