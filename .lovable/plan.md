

# Redesign Dashboard Quick Actions

## Overview

Reorganize the Dashboard layout so the **Quick Actions** section is more prominent -- placed right after the stats cards, styled as a grid of visually distinct action boxes (Cards) instead of the current subtle outline buttons at the bottom.

## New Layout Order

1. Welcome header
2. Stats cards (Total Earnings, Pending Payout, Total Sales, Referrals)
3. **Quick Actions grid** (new prominent section)
4. Earnings Trend chart + Recent Activity

## Quick Actions Grid

A section titled **"Quick Actions"** with a 2-column (mobile) / 3-column (desktop) grid of Card boxes. Each card has an icon, title, subtitle, and navigates to the correct page on click. The actions:

| Action | Icon | Subtitle | Route |
|--------|------|----------|-------|
| Set Up Your Profile | UserCog | Complete your profile | `/profile` |
| Browse Products | ShoppingBag | Find offers to promote | `/marketplace` |
| Check Wallet | Wallet | View balance & payouts | `/wallet` |
| Copy Referral Code | Copy | Share & earn bonuses | (clipboard copy) |
| Request Payout | Banknote | Cash out your earnings | `/wallet` (or open payout dialog) |
| View Leaderboard | Trophy | See your ranking | `/leaderboard` |

Each card will be a clickable `Card` component with hover effects (`hover:border-primary/50 hover:shadow-md transition-all cursor-pointer`), an icon in a colored circle, bold title, and muted subtitle.

## Technical Changes

### Modified: `src/pages/Dashboard.tsx`

- Add a `quickActions` array with label, icon, subtitle, and onClick handler for each action
- Move the Quick Actions section to appear **immediately after** the stats grid
- Render as Card components in a responsive grid instead of outline Buttons
- Remove the old bottom button row (replaced by the new section)
- Add imports for `UserCog, Banknote, Trophy` from lucide-react
