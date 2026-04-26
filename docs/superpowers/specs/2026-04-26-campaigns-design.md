# Campaigns Section — Design Spec

**Date:** 2026-04-26
**Status:** Approved
**Project:** VoltSquad / DigiHire Seller Dashboard

---

## Overview

A Campaigns section in the seller dashboard that allows sellers to discover brand campaigns, join them, submit sales evidence, and track earnings. Admins create and manage campaigns, approve memberships (when required), and approve earnings before they credit to the seller's wallet.

---

## Data Model

### `campaigns`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| description | text | |
| brand_name | text | |
| banner_image_url | text | |
| join_type | enum | `instant \| approval` |
| status | enum | `draft \| active \| paused \| ended` |
| eligibility_type | enum | `open \| restricted` |
| eligibility_criteria | jsonb | e.g. `{"min_sales": 10, "tier": "silver"}` |
| commission_type | enum | `percentage \| flat` |
| commission_value | numeric | |
| commission_per | enum | `sale \| lead \| activation` |
| start_date | timestamptz | |
| end_date | timestamptz | |
| assets | jsonb | Array of `{label, url, type}` |
| tracking_link_base | text | Base URL for generating seller-unique links |
| created_by | uuid FK → profiles | Admin only for now |
| created_at | timestamptz | |

### `campaign_memberships`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| campaign_id | uuid FK → campaigns | |
| seller_id | uuid FK → profiles | |
| status | enum | `pending \| approved \| rejected` |
| tracking_link | text | Generated on approval |
| joined_at | timestamptz | |
| approved_at | timestamptz | Nullable |
| approved_by | uuid FK → profiles | Nullable, admin who approved |
| rejection_note | text | Nullable |

### `campaign_submissions`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| campaign_id | uuid FK → campaigns | |
| seller_id | uuid FK → profiles | |
| membership_id | uuid FK → campaign_memberships | |
| submission_type | enum | `manual \| tracked` |
| amount | numeric | Sale amount claimed |
| evidence_url | text | Screenshot/proof for manual entries |
| notes | text | Nullable |
| status | enum | `pending_review \| approved \| rejected` |
| submitted_at | timestamptz | |
| reviewed_at | timestamptz | Nullable |
| reviewed_by | uuid FK → profiles | Nullable |

### `campaign_earnings`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| campaign_id | uuid FK → campaigns | |
| seller_id | uuid FK → profiles | |
| submission_id | uuid FK → campaign_submissions | Nullable for tracked conversions |
| amount | numeric | Calculated payout |
| status | enum | `pending \| approved \| paid` |
| approved_at | timestamptz | Nullable |
| approved_by | uuid FK → profiles | Nullable |
| transaction_id | uuid FK → transactions | Populated when paid out |

---

## Data Flow

```
Admin creates campaign (draft → active)
  ↓
Seller views campaign (eligibility checked at render)
  ↓
Seller joins → campaign_memberships row
  ├─ instant join → status = approved, tracking link generated immediately
  └─ approval join → status = pending, admin approves → tracking link generated
  ↓
Seller submits sale → campaign_submissions row (status = pending_review)
  ↓
Admin approves submission → campaign_earnings row (status = pending)
  ↓
Admin approves earning → transactions row written
                       → campaign_earnings.status = paid
                       → campaign_earnings.transaction_id linked
```

---

## Seller Dashboard UX

### Sidebar

Add **"Campaigns"** to the seller dashboard sidebar with two sub-items: Browse and My Campaigns.

### Browse Campaigns — `/dashboard/campaigns`

- Card grid of all active campaigns
- Each card: brand logo, title, commission rate, deadline, join status badge
- Restricted campaigns: lock icon with eligibility tooltip, Join button disabled
- Joined campaigns: green "Active" badge
- Cards link to campaign detail page

### Campaign Detail — `/dashboard/campaigns/:id`

Four tabs:

**Overview**
- Description, brand info, commission structure, dates, eligibility status

**Earnings Calculator**
- Input: expected sales volume
- Output: projected payout based on commission structure
- Read-only for non-members, interactive for members

**Assets**
- Brand assets: images, copy templates, banners
- Gated: non-members see blurred preview with lock overlay
- Members: full download access

**Submit Entry** *(approved members only)*
- Manual entry: sale amount + evidence screenshot upload
- Tracked: paste tracking link conversion note
- Submission history table with status badges (`pending_review | approved | rejected`)

### My Campaigns — `/dashboard/campaigns/mine`

- Filtered view: only campaigns the seller has joined
- Earnings summary per campaign: total submitted / approved / paid out
- Links back to each campaign detail

---

## Admin UX

### Campaign Management — `/admin/campaigns`

- Table of all campaigns, filterable by status
- Actions: edit, pause/resume, end
- "New Campaign" button → creation form:
  - Brand details, banner upload
  - Commission structure (type, value, per)
  - Join type: instant or approval
  - Eligibility criteria
  - Date range
  - Asset uploads

### Membership Approvals — `/admin/campaigns/memberships`

- Queue of pending join requests (only for `join_type = approval` campaigns)
- Shows seller profile info
- Approve → tracking link generated, seller notified
- Reject → optional rejection note stored

### Earnings Approvals — `/admin/campaigns/earnings`

- Queue of all pending earnings
- Shows: seller name, campaign, linked submission, evidence preview, payout amount
- Approve → writes to `transactions`, marks earning as `paid`, stores `transaction_id`
- Reject → earning marked rejected, seller notified
- Bulk approve available

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Campaign ends with pending submissions | Submissions remain processable; no auto-rejection |
| Seller rejected from approval campaign | New membership row allowed (old row kept for audit) |
| Tracked link conversion arrives | Auto-creates `campaign_submissions` with `type = tracked`; still requires admin review |
| Eligibility check | Computed at render time from seller's live stats; not stored |
| Duplicate submissions | No auto-dedup; admin review is the guard; full history visible to both parties |
| Campaign paused mid-cycle | Existing memberships and pending submissions unaffected; new joins blocked |

---

## Future Extensibility

- **Brand portal:** `campaigns.created_by` already exists. Unlock creation UI for brand-role accounts. No schema changes required.
- **Auto-payout option:** Add `payout_type` column to `campaigns` (`manual \| auto`). Auto path skips the earnings approval step and writes directly to `transactions`.
- **Commission tiers:** `eligibility_criteria` jsonb is open-ended; tier-based commission rates can be added without schema changes.
