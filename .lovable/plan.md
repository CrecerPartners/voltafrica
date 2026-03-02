

# Admin Dashboard Complete Overhaul

This is a large rework of the admin dashboard to make it a full end-to-end management hub. Here's the plan broken into sections:

---

## 1. Overview Dashboard -- Make it Richer

**Current state**: 6 simple stat cards with numbers only.

**Changes**:
- Add recent activity feed (latest 5 sales, latest 5 signups)
- Add quick-action buttons (e.g., "Review Pending Sales", "Process Payouts")
- Add a simple revenue chart using Recharts (already installed) showing sales over the last 30 days
- Show tier distribution breakdown (Bronze/Silver/Gold/Platinum user counts)
- Add pending items alerts at the top when there are items requiring attention

---

## 2. Users -- Full Management

**Current state**: Table with name/email/university/tier/joined. Only action is changing tier.

**Changes**:
- Add a user detail sheet/dialog that shows full profile: avatar, name, email, university, WhatsApp, bank details, tier, referral code, join date
- Add edit capability for key fields (name, university, WhatsApp, bank details)
- Add delete user action (with confirmation) -- requires new RLS policy for admin DELETE on profiles
- Add a "View Sales" / "View Transactions" quick link per user
- Show avatar thumbnail in the table row
- Add export/stats summary at the top

---

## 3. Products -- Image and Video Management

**Current state**: Table + dialog with text fields only. Image is just a URL input.

**Changes**:
- Add file upload for product images using the existing storage (create a `product-images` bucket)
- Support multiple images via the existing `assets` JSONB field (assets.images array)
- Add video URL field in the product form (store in assets.videos)
- Show image thumbnail in the table and in the edit dialog
- Add image preview and remove functionality in the form

---

## 4. Sales -- Full Management

**Current state**: Table with confirm/cancel actions for pending sales. Shows date, customer, product, amount, commission, status, proof.

**Changes**:
- Add sale detail dialog showing all info including notes, quantity, seller name (join with profiles)
- Add ability to add/edit admin notes on a sale
- Show the seller's name in the table (query profiles by user_id)
- Add search/filter by seller name, product, date range
- Add proof image preview (inline lightbox instead of just download)
- Add ability to edit sale amount/commission before confirming

---

## 5. Payouts -- Full Management

**Current state**: Table with process/reject for pending. Shows amount, bank, account, status, notes.

**Changes**:
- Show the requester's name (join with profiles)
- Add a detail dialog with full bank info, requester profile, and transaction history
- Allow admin to add custom notes when processing or rejecting (currently hardcoded "Rejected by admin")
- Add a notes input dialog before reject/process actions
- Add search and date range filtering

---

## 6. Training -- YouTube Embed + Cover

**Current state**: Course form has title, description, category, level, color, sort order. Lesson form has title, module title, module number, sort order, YouTube URL.

**Changes**:
- In the lesson form, show a YouTube thumbnail preview auto-extracted from the URL (using `https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg`)
- Use the YouTube thumbnail as the course cover when displaying courses (from first lesson's video)
- Add a cover image upload option for courses (create storage or use URL)
- Show YouTube embed preview in the lesson edit dialog
- Show video thumbnails in the lesson list

---

## 7. New Admin Sections -- Leaderboard, Referrals, Marketplace Settings

**Changes**:
- **Admin Referrals page** (`/admin/referrals`): View all referrals across users, see referrer name, referred name, status, earnings. Ability to update referral status and earnings.
- **Admin Leaderboard page** (`/admin/leaderboard`): View the leaderboard, ability to reset/manage it. Read-only view of current standings.
- Update the `AdminLayout` nav to include the new sections.

---

## Technical Details

### Database Changes
- Migration to create `product-images` storage bucket (public)
- Migration to add admin DELETE policy on `profiles` table
- Migration to add admin UPDATE policy on `referrals` table (to manage referral status/earnings)
- Migration to add admin INSERT policy on `referrals` (if needed)

### New Files
- `src/pages/admin/AdminReferrals.tsx` -- Referrals management page
- `src/pages/admin/AdminLeaderboard.tsx` -- Leaderboard view page

### Modified Files
- `src/pages/admin/AdminDashboard.tsx` -- Rich overview with charts, activity feed, quick actions
- `src/pages/admin/AdminUsers.tsx` -- User detail sheet, edit/delete, avatar display
- `src/pages/admin/AdminProducts.tsx` -- Image upload, video URL, multi-image management
- `src/pages/admin/AdminSales.tsx` -- Seller names, detail dialog, notes editing, proof preview
- `src/pages/admin/AdminPayouts.tsx` -- Requester names, notes dialog, detail view
- `src/pages/admin/AdminTraining.tsx` -- YouTube thumbnail preview, cover image from video
- `src/components/AdminLayout.tsx` -- Add Referrals and Leaderboard nav items
- `src/App.tsx` -- Add new admin routes
- `src/hooks/useAdminData.ts` -- Update sales/payouts queries to join with profiles for names; add referral mutations

### Data Joins for Names
- Admin sales query: join `profiles` on `user_id` to get seller name
- Admin payouts query: join `profiles` on `user_id` to get requester name
- Admin referrals: already has `referred_name`, need to join profiles for referrer name

