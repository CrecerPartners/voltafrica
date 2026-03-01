

# Fix Feature Cards Display

## Problem
The feature cards with hover screenshot previews look tacky -- the HoverCard popups are awkward on mobile (hover doesn't work well on touch) and the card styling needs polish on both mobile and desktop.

## Changes

### File: `src/pages/LandingPage.tsx`

**1. Remove HoverCard on mobile, keep on desktop only**
- On mobile, the screenshot preview doesn't work well since there's no hover. Remove the HoverCard wrapper on mobile and show the screenshot inline as a small thumbnail at the top of each card instead.
- Use a responsive approach: on mobile, each card shows a small rounded screenshot thumbnail above the icon/text. On desktop, keep the hover preview behavior.

**2. Improve card styling**
- Add consistent card heights with `h-full` so cards in a row align
- Improve spacing and padding for a cleaner look
- Make the icon background slightly larger and more prominent
- Add subtle border radius and shadow improvements

**3. Mobile layout: switch to 1-column on small screens**
- Change grid from `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` to include better mobile spacing
- On mobile (< sm), show cards in a clean single column with the screenshot as a small inline preview image inside each card

**4. Desktop HoverCard improvements**
- Increase HoverCard width from `w-48` to `w-52` for a better screenshot aspect ratio
- Add a subtle shadow and smoother border radius
- Keep the `object-cover object-top` cropping

### Technical approach

Replace the current HoverCard-wrapped cards with a component that:
- On desktop: keeps the HoverCard behavior with improved styling
- On mobile: shows a compact card with a small screenshot thumbnail visible directly (no hover needed), using the `useIsMobile` hook to conditionally render

This uses the existing `useIsMobile` hook from `src/hooks/use-mobile.tsx`.

