
# Landing Page Enhancements

## Overview

Three changes: add a "How to Earn with Volt" rewards card section, add hover-to-preview screenshots on feature cards, remove "For Students"/"For Brands" from the navbar, and update "Direct Sale" to "Direct Sales Commission -- up to 30% per product sold."

## Changes

### 1. Add "How to Earn with Volt" Section (`src/pages/LandingPage.tsx`)

Insert a new section after the Features grid showing five reward cards in a responsive grid. Each card has an icon, bold title, and reward description:

- **Signup Bonus** -- N500 Credit to your Volt account the moment you register
- **Direct Sales Commission** -- Up to 30% per product sold
- **Referral Bonus** -- N1,000 "Spark Bonus" for every friend you bring who makes their first 5 sales
- **High-Volume Bonus** -- Extra Cash for Influencers who hit weekly targets
- **Lead Base Pay** -- N5,000 - N30,000 monthly (Team Leads only)

Below the cards: a "Find Your Niche" subheading and a bold **"Sign Up & Claim My N500 Bonus"** CTA button linking to signup.

New icons imported: `Gift, DollarSign, Flame, Target, Crown` from lucide-react.

### 2. Feature Cards with Screenshot Previews on Hover (`src/pages/LandingPage.tsx`)

- Add a `screenshot` field to each feature object (e.g., `/screenshots/commissions.png`)
- Wrap each feature Card in a `HoverCardTrigger` from Radix UI
- On hover, a `HoverCardContent` pops up showing a rounded placeholder screenshot image
- Placeholder images used initially -- real screenshots can be swapped in later by uploading to `/public/screenshots/`

### 3. Remove Nav Items from Navbar (`src/components/LandingNavbar.tsx`)

- Remove the `navItems` array and all desktop/mobile nav link rendering
- Navbar becomes: **Volt logo | Sign In | Get Started**
- "For Students" and "For Brands" links remain in the footer and hero toggle

## Technical Details

### Modified: `src/pages/LandingPage.tsx`
- Add `rewards` data array with 5 items (using updated "Direct Sales Commission" wording)
- Add "How to Earn with Volt" section with responsive card grid (2 cols mobile, 3 cols desktop)
- Import `HoverCard, HoverCardTrigger, HoverCardContent` from `@/components/ui/hover-card`
- Add `screenshot` string to each feature entry
- Wrap feature cards in HoverCard with image preview popup
- Import additional lucide icons for reward cards

### Modified: `src/components/LandingNavbar.tsx`
- Remove `navItems` array
- Remove desktop `<nav>` element
- Remove nav links from mobile Sheet content
- Keep logo, Sign In button, Get Started button, and mobile hamburger (for Sign In/Get Started only)
