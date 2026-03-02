

# Landing Page Updates

## Overview
Three changes to the landing page at `/`: remove "For Students" and "For Brands" nav links from the header, and force a dark theme on the landing page.

## Changes

### 1. Remove nav links from header (`src/components/LandingNavbar.tsx`)
- Remove the `navItems` array entirely
- Remove the desktop `<nav>` section that renders the links
- Remove the nav items from the mobile Sheet drawer (keep only Sign In / Get Started buttons)
- Simplify layout: logo on left, Sign In + Get Started on right

### 2. Force dark theme on landing page (`src/pages/LandingPage.tsx`)
- Wrap the entire landing page in a `<div className="dark">` wrapper so it uses the dark CSS variables regardless of the user's theme setting
- Update the outer container to use explicit dark background colors (e.g., `bg-[#111]` or rely on the dark theme variables)
- This keeps the rest of the app unaffected -- only the landing page will be dark

### 3. Clean up footer links (`src/pages/LandingPage.tsx`)
- Remove "For Students" and "For Brands" links from the footer nav as well
- Keep just "Sign In" or simplify to just the logo + copyright

## Files Modified

| File | Change |
|------|--------|
| `src/components/LandingNavbar.tsx` | Remove nav items, keep only logo + auth buttons |
| `src/pages/LandingPage.tsx` | Wrap in `dark` class for dark theme; remove about links from footer |

