

# Fix Feature Card Screenshots — Capture Real App Screenshots

## Problem

The feature card hover previews show placeholder images because the screenshot files (`/screenshots/commissions.png`, etc.) don't exist in the `public/` directory. They all fall back to `placeholder.svg`.

## Solution

Use the browser automation tool to capture real screenshots of each app page in mobile format (375x812 viewport), then save them to `public/screenshots/`. Since these pages are behind authentication, you'll need to be logged in first in the preview.

### Step 1: Log in to the preview

You'll need to log in to the app in the preview iframe first so the browser can access the protected routes.

### Step 2: Navigate and screenshot each page

Capture mobile-format screenshots of these pages and save to `public/screenshots/`:

| Feature Card | App Route | Screenshot File |
|---|---|---|
| Earn Commissions | `/sales` | `public/screenshots/commissions.png` |
| Curated Marketplace | `/marketplace` | `public/screenshots/marketplace.png` |
| Track Everything | `/dashboard` | `public/screenshots/dashboard.png` |
| Leaderboards | `/leaderboard` | `public/screenshots/leaderboard.png` |
| Refer & Earn | `/referrals` | `public/screenshots/referrals.png` |
| Tier Rewards | `/wallet` (or `/profile`) | `public/screenshots/tiers.png` |

### Step 3: Update hover card styling

Adjust the `HoverCardContent` image display to use a taller aspect ratio that better fits mobile screenshots (change from `h-40` to a taller height like `h-64` or use `aspect-[9/16]`), and set `object-cover` with `object-top` so the top of the screenshot is visible.

### Prerequisites

**You must be logged in** to the preview app before I can capture screenshots. Please log in to the app in the preview window, then approve this plan so I can proceed.

