
# Admin Dashboard - Full End-to-End Build

## Overview
Build a comprehensive admin dashboard at `/admin` with sub-pages to manage all aspects of the Volt platform: users, products, sales verification, payout processing, and training content. Access is restricted to users with the `admin` role via server-side RLS and a client-side `AdminProtectedRoute`.

---

## Database Changes

### 1. RLS Policy Updates
Add admin-level policies to existing tables so admins can read/update all rows:

- **profiles**: Admin can SELECT and UPDATE all rows
- **sales**: Admin can SELECT and UPDATE all rows (to verify/confirm/cancel sales)
- **transactions**: Admin can SELECT and UPDATE all rows (to update status after payout)
- **payouts**: Admin can SELECT and UPDATE all rows (to process payouts)
- **products**: Admin can INSERT, UPDATE, and DELETE
- **referrals**: Admin can SELECT all rows
- **training_courses**: Admin can INSERT, UPDATE, DELETE
- **training_lessons**: Admin can INSERT, UPDATE, DELETE

All policies use the existing `has_role(auth.uid(), 'admin')` function.

---

## New Files

### Components

1. **`src/components/AdminProtectedRoute.tsx`**
   - Wraps admin routes; checks `has_role` via a database query
   - Redirects non-admin users to `/dashboard`
   - Shows loading spinner while checking

2. **`src/components/AdminLayout.tsx`**
   - Sidebar navigation with links: Overview, Users, Products, Sales, Payouts, Training
   - Header with "Admin Panel" title and back-to-dashboard link
   - Outlet for nested routes

### Pages

3. **`src/pages/admin/AdminDashboard.tsx`** - Overview
   - Summary cards: total users, total sales, pending sales, pending payouts, total revenue
   - Quick counts fetched via admin queries

4. **`src/pages/admin/AdminUsers.tsx`** - User Management
   - Table of all profiles with search/filter
   - View user details, update tier, view their sales/transactions
   - Columns: Name, Email, University, Tier, Joined, Sales Count

5. **`src/pages/admin/AdminProducts.tsx`** - Product Management
   - Table of all products with add/edit/delete
   - Dialog form for creating/editing products (name, brand, category, price, commission rate, image URL, description, assets)

6. **`src/pages/admin/AdminSales.tsx`** - Sales Verification
   - Table of all sales across all users with status filter
   - View proof file (download from storage)
   - Approve (confirm) or reject (cancel) sales with one click
   - On confirm: update sale status to "confirmed", update corresponding transaction to "paid"
   - On cancel: update sale status to "cancelled", update corresponding transaction to "cancelled"

7. **`src/pages/admin/AdminPayouts.tsx`** - Payout Processing
   - Table of all payout requests with status filter
   - Show bank details, amount, user name
   - Mark as "processed" or "rejected"
   - On process: update payout status, update corresponding transaction status

8. **`src/pages/admin/AdminTraining.tsx`** - Training Content
   - List all courses with add/edit/delete
   - Expand a course to manage its lessons (add/edit/delete)
   - Fields: title, description, category, level, cover color, YouTube URL, module info

### Hooks

9. **`src/hooks/useAdminRole.ts`**
   - Calls `supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })` 
   - Returns `{ isAdmin, isLoading }`

10. **`src/hooks/useAdminData.ts`**
    - Admin-specific queries: all users, all sales, all payouts, all products, all courses/lessons
    - Admin mutations: update sale status, update payout status, CRUD products, CRUD training

---

## Route Setup (App.tsx)

Add admin routes nested under `AdminProtectedRoute` and `AdminLayout`:

```text
/admin           -> AdminDashboard (overview)
/admin/users     -> AdminUsers
/admin/products  -> AdminProducts
/admin/sales     -> AdminSales
/admin/payouts   -> AdminPayouts
/admin/training  -> AdminTraining
```

---

## Key Flows

### Sale Verification Flow
1. Admin views pending sales in AdminSales
2. Clicks "View Proof" to download/preview the proof file from storage
3. Clicks "Confirm" or "Reject"
4. Sale status updates, corresponding transaction status updates accordingly

### Payout Processing Flow
1. Admin views pending payouts in AdminPayouts
2. Reviews bank details and amount
3. Clicks "Mark Processed" after completing bank transfer
4. Payout status and transaction status update

### Product Management Flow
1. Admin adds/edits products in AdminProducts
2. Changes are immediately visible in the student marketplace

### Training Management Flow
1. Admin creates courses, then adds lessons to each course
2. Students see new content in the Training section

---

## Technical Notes

- All admin queries bypass user-scoped RLS via admin policies using `has_role`
- The `AdminProtectedRoute` performs a server-side role check, not client-side storage
- Admin pages are completely separate from the student dashboard layout
- File downloads for sale proofs use `supabase.storage.from('sale-proofs').download(path)`
- Estimated total: ~10 new files, 1 modified file (App.tsx), 1 database migration
