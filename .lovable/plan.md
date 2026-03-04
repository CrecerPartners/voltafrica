

## Enrich Admin Panel for All New Features

The admin currently manages users, products, sales, payouts, training, referrals, and leaderboard. But recent features added verification, reviews, shop customization, and multi-product-type support that the admin can't yet manage. Here's what needs updating:

### What's Missing

1. **Verification Management** — Admin has no way to view/approve/reject user ID verification requests. The `verification_status`, `account_type`, `id_document_url` fields exist on profiles but are invisible in admin.
2. **Reviews Management** — The `reviews` table exists but admin can't view, moderate, or delete reviews.
3. **User Detail Panel** — Missing: verification status, account type, social links, shop slug, shop logo, bio. The edit form only shows name/university/whatsapp/bank.
4. **Dashboard Overview** — No stats for: pending verifications, total reviews, lead conversions, product type breakdown.
5. **Orders Management** — Orders table exists but there's no admin page for it. Admin can't see buyer orders or track fulfillment.

### Plan

**1. New Page: Admin Reviews (`src/pages/admin/AdminReviews.tsx`)**
- List all reviews with product name, reviewer, rating (stars), comment, date
- Delete button for moderation
- Filter by rating (1-5) and search by product/reviewer
- New hook: `useAdminReviews` + `useDeleteReview` in `useAdminData.ts`

**2. New Page: Admin Verification (`src/pages/admin/AdminVerification.tsx`)**
- List profiles where `id_document_url IS NOT NULL` or `verification_status = 'pending'`
- Show: name, account type, verification status, uploaded doc (view/download from `verification-docs` bucket)
- Quick actions: Approve (set `verified`), Reject (set `unverified`)
- New hook: `useAdminVerifications` in `useAdminData.ts` (filtered query on profiles)

**3. New Page: Admin Orders (`src/pages/admin/AdminOrders.tsx`)**
- List all orders with buyer name, email, total, status, date
- Expand to see order items (product, quantity, price, ref code)
- Update order status (pending → confirmed → delivered)
- New hooks: `useAdminOrders` in `useAdminData.ts`

**4. Enrich AdminUsers detail panel**
- Show: account type, verification status (with badge), social links, shop slug, shop logo, bio
- Add verification status dropdown (unverified/pending/verified) to edit form
- Link to view their shop (`/s/{shop_slug}`)

**5. Enrich AdminDashboard**
- Add cards: Pending Verifications, Total Reviews, Lead Conversions (verified), Total Orders
- Add product type breakdown (physical/digital/lead counts)

**6. Update AdminLayout nav**
- Add: Reviews, Verification, Orders to sidebar

### Files to Create
| File | Purpose |
|------|---------|
| `src/pages/admin/AdminReviews.tsx` | Review moderation page |
| `src/pages/admin/AdminVerification.tsx` | ID verification management |
| `src/pages/admin/AdminOrders.tsx` | Order tracking/management |

### Files to Modify
| File | Changes |
|------|---------|
| `src/hooks/useAdminData.ts` | Add: `useAdminReviews`, `useDeleteReview`, `useAdminVerifications`, `useAdminOrders`, `useUpdateOrderStatus` |
| `src/components/AdminLayout.tsx` | Add Reviews, Verification, Orders nav items |
| `src/App.tsx` | Add 3 new admin routes |
| `src/pages/admin/AdminUsers.tsx` | Enrich detail panel with verification, account type, social links, shop info |
| `src/pages/admin/AdminDashboard.tsx` | Add pending verifications, reviews, orders, leads stats + product type breakdown |

### No database changes needed — all tables and columns already exist.

