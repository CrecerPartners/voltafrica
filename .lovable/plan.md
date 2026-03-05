

## Plan: Marketplace Banner + Verification Improvements

### 1. Marketplace Banner with Personalized Greeting & Search

**File: `src/pages/Marketplace.tsx`**

Replace the current headline section (lines 106-121) with:
- A styled banner card with gradient background
- Personalized headline: "What are you selling today, **{firstName}**?" (extracted from `profile.name`)
- Integrated search input with a search icon button inside the banner
- Keep the "Public Store" link button
- Move the product count below the banner

### 2. Pending Verification Notice in Profile Settings

**File: `src/pages/Profile.tsx`**

Currently, the profile page already shows "Pending Verification" and "Verified" badges in the verification card (lines 231-236). Enhancement:
- For users whose `verification_status` is `unverified` and who haven't uploaded an ID yet, show a prominent alert/banner at the top of the profile page: "Your identity has not been verified. Please upload your ID to get verified."
- Also show the unverified state in the avatar card area with an orange/warning indicator

### 3. Admin Verification Already Exists — Ensure It Works

**File: `src/pages/admin/AdminVerification.tsx`** and **`src/hooks/useAdminVerifications.ts`**

The admin verification page already exists with approve/reject functionality. No major changes needed — it already:
- Lists profiles with pending/verified/unverified status
- Has approve (set to "verified") and reject (set to "unverified") buttons
- Shows document links

Minor improvement: ensure the `useUpdateProfile` hook from `useAdminData` correctly updates `verification_status`.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Marketplace.tsx` | Replace headline with personalized banner + integrated search |
| `src/pages/Profile.tsx` | Add prominent unverified alert banner for unverified users |

