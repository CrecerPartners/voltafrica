

# Make Volt Dashboard Fully Mobile Responsive

## Overview
Audit and fix all pages so they adapt smoothly from mobile (320px+) to tablet (768px) to desktop (1024px+). The layout already has some responsive basics, but several areas need attention.

## Changes by File

### 1. `src/pages/Sales.tsx`
- Change summary stats from `grid-cols-3` to `grid-cols-1 sm:grid-cols-3` so they stack on mobile
- Wrap the sales table in a horizontal scroll container (`overflow-x-auto`) for small screens
- Make filter buttons wrap more gracefully -- remove the vertical border divider on mobile, use `flex-wrap gap-2`
- Reduce stat card text size on mobile (`text-xl sm:text-2xl`)

### 2. `src/pages/Referrals.tsx`
- Change stats grid from `grid-cols-3` to `grid-cols-1 sm:grid-cols-3`
- Reduce referral code text from `text-3xl md:text-4xl` to `text-2xl sm:text-3xl md:text-4xl`
- Stack referral list items vertically on small screens (name on top, badge/earnings below)
- Reduce stat values text size on mobile

### 3. `src/pages/WalletPage.tsx`
- Reduce balance text from `text-3xl` to `text-2xl sm:text-3xl`
- Make transaction rows stack description and amount more cleanly on tiny screens
- Make tab triggers scrollable horizontally on mobile with `overflow-x-auto`

### 4. `src/pages/Dashboard.tsx`
- Reduce chart height on mobile (`h-[180px] sm:h-[220px]`)
- Make chart tooltip and grid colors theme-aware using CSS variables instead of hardcoded dark HSL values
- Ensure activity items don't overflow on small screens

### 5. `src/pages/Leaderboard.tsx`
- Leaderboard entries: reduce padding and text on mobile
- Make tier progress card responsive with smaller text on mobile

### 6. `src/pages/Profile.tsx`
- Avatar card: stack avatar and info vertically on mobile (`flex-col sm:flex-row`)
- Already mostly responsive, minor text size tweaks

### 7. `src/pages/Login.tsx`
- Already well-centered and responsive -- no changes needed

### 8. `src/components/DashboardLayout.tsx`
- Add `gap-2` between header items on mobile for tighter spacing
- Already handles sidebar well via the sidebar component

### 9. `src/components/AppSidebar.tsx`
- Already uses `collapsible="icon"` and mobile sheet -- no changes needed

## Summary
Mostly small tweaks: responsive grid breakpoints, text size scaling, horizontal scroll for tables, and stacking layouts on narrow screens. No structural changes needed.
