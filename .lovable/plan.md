

# Mobile-Native Bottom Navigation Bar

## Overview

Replace the collapsible sidebar with a **bottom tab bar** on mobile devices, creating a native app-like navigation experience. The sidebar remains for desktop/tablet. This follows the pattern shown in the reference image (Home, Feed, Members, Inbox tabs at the bottom).

## What Changes

### 1. New Component: `MobileBottomNav`

A fixed bottom navigation bar visible only on mobile (`md:hidden`). It will show 5 primary tabs (the most-used routes) with icons and labels, plus a "More" menu for remaining pages. The active tab gets a highlighted style (filled icon + primary color). Uses `useLocation` for active state and `useNavigate` for instant transitions.

**Primary tabs (bottom bar):**
- Dashboard (home icon)
- Marketplace (shopping bag)
- Wallet (wallet icon)
- Sales (chart icon)
- More (menu icon -- opens a drawer/sheet with: Calculator, Referrals, Leaderboard, Profile, Logout)

### 2. Update `DashboardLayout`

- Hide the sidebar entirely on mobile (`hidden md:block`)
- Hide the `SidebarTrigger` on mobile
- Add `MobileBottomNav` component (only renders on mobile)
- Add bottom padding to `<main>` on mobile so content doesn't get hidden behind the nav bar
- Simplify the mobile header: show Volt logo on the left, notification + avatar on the right

### 3. Update `AppSidebar`

- Add `className="hidden md:flex"` so it only renders on desktop/tablet

### 4. CSS/Styling Enhancements

- Add `safe-area-inset` padding for notched phones (env(safe-area-inset-bottom))
- Smooth transitions on tab switches
- Haptic-like active states with scale transforms

---

## Technical Details

### New File: `src/components/MobileBottomNav.tsx`

- Uses `useIsMobile()` hook to conditionally render
- Fixed position at bottom, `z-50`, with backdrop blur and border-top
- 5 tab buttons in a flex row
- "More" tab opens a Drawer (vaul) with remaining nav items + logout
- Active tab detection via `useLocation().pathname`
- `pb-[env(safe-area-inset-bottom)]` for safe area on iOS

### Modified: `src/components/DashboardLayout.tsx`

- Import `useIsMobile` and `MobileBottomNav`
- Wrap `AppSidebar` in a div with `hidden md:block`
- Hide `SidebarTrigger` on mobile, show Volt logo instead
- Add `pb-20 md:pb-0` to main content area
- Render `<MobileBottomNav />` at the end

### Modified: `src/index.css`

- Add utility class for safe-area bottom padding
- Ensure smooth touch interactions (touch-action, -webkit-tap-highlight-color)

