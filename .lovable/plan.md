

# Landing Page Updates: Earnings Section, Screenshot Previews

## Overview
Keep the hero section exactly as-is (with the Students/Brands toggle). Add an earnings section and screenshot hover previews on feature cards.

## Changes

### 1. Add promotional image section (after Stats, before Features)
- Display `IMG_2564-2.png` and `IMG_2890.png` as full-width promotional visuals
- Simple layout: images centered with some padding

### 2. Add "Ways to Earn" section (after promotional images, before Features)
- Section heading: "Multiple ways to earn on Volt"
- Simple numbered list (not a table), styled as dark cards:
  1. **Signup Bonus** -- N500 Credit to your Volt account the moment you register.
  2. **Direct Sales Commission** -- Up to 30%
  3. **Referral Bonus** -- N1,000 "Spark Bonus" for every friend you bring who makes their first 5 sales.
  4. **High-Volume Bonus** -- Extra Cash for Influencers who hit weekly targets.
  5. **Lead Base Pay** -- N5,000 - N30,000 monthly (Team Leads only).
- CTA button: "Sign Up & Claim My N500 Bonus" linking to signup

### 3. Screenshot hover previews on Feature Cards
- Copy uploaded screenshots to `src/assets/`:
  - `IMG_2872-2.png` -> Earn Commissions
  - `IMG_2874-2.png` -> Curated Marketplace
  - `IMG_2875-2.png` -> Track Everything
  - `IMG_2877.png` -> Leaderboards
  - `IMG_2876-2.png` -> Refer & Earn
  - `IMG_2873-2.png` -> Tier Rewards
- On desktop hover: screenshot slides up from below the card content (CSS overflow hidden + transform transition)
- Screenshots CSS-cropped to hide phone status bar and bottom nav
- On mobile: no hover effect, cards stay as-is

### 4. CSS additions (`src/index.css`)
- Add hover reveal animation styles for the screenshot preview

## Files Modified

| File | Change |
|------|--------|
| `src/pages/LandingPage.tsx` | Add promo images section, earnings list, screenshot hover on feature cards |
| `src/index.css` | Add screenshot hover animation CSS |

## What stays the same
- Hero section with Students/Brands toggle -- **unchanged**
- Stats section -- **unchanged**
- Footer -- **unchanged**
- Navbar -- **unchanged**

