

# Landing Page with Dual-Audience Hero and About Pages

## Overview

Create a public-facing landing page at `/` with a Blakskill-style toggle hero (switching between "Brands" and "Students" messaging), a sticky navigation bar with menu items, and dedicated About pages for each audience. The current `/` redirect to `/login` will be replaced with this landing page.

## New Pages and Components

### 1. Landing Page (`src/pages/LandingPage.tsx`)

A full marketing landing page with these sections:

- **Sticky Navbar**: Volt logo on the left. Menu items: "For Students", "For Brands", "About". Right side: "Sign In" (ghost/outline) and "Get Started" (bold primary action button with volt-gradient).
- **Hero Section** with a pill-shaped toggle (like Blakskill) to switch between two audiences:
  - **Students tab**: "Join the Volt Squad" -- messaging about earning money as a campus ambassador, with a CTA to sign up.
  - **Brands tab**: "Start Selling on Campus" -- messaging about reaching students through campus ambassadors, with a CTA to sign up as a brand.
  - The hero background, headline, subtext, and CTA all animate/transition smoothly when switching tabs.
- **Features/Benefits section**: Grid of cards highlighting key features (earn commissions, track sales, leaderboards, etc.)
- **Social proof / stats section**: Numbers like "500+ campuses", "10,000+ ambassadors"
- **Footer**: Links to About pages, social links, copyright.

### 2. About Students Page (`src/pages/AboutStudents.tsx`)

A clean page explaining how Volt works for students/ambassadors. Sections: how it works (3 steps), benefits, testimonials placeholder, CTA to sign up.

### 3. About Brands Page (`src/pages/AboutBrands.tsx`)

A clean page explaining how Volt works for brands. Sections: why campus marketing, how it works, pricing/plans placeholder, CTA to get started.

### 4. Landing Navbar Component (`src/components/LandingNavbar.tsx`)

Reusable sticky navbar for all public pages. Mobile: hamburger menu using Sheet/Drawer. Desktop: horizontal nav items. Includes the bold "Get Started" CTA button.

## Route Changes (`src/App.tsx`)

- `/` renders `LandingPage` (no longer redirects to `/login`)
- `/about/students` renders `AboutStudents`
- `/about/brands` renders `AboutBrands`
- `/login` and `/forgot-password` remain as-is

## Technical Details

### Hero Toggle Implementation

The toggle uses two buttons inside a rounded pill container. Clicking a tab sets state and triggers a smooth CSS transition on the content below. Each tab has its own:
- Headline text
- Subtitle text
- CTA button (links to `/login` with signup mode param)
- Background gradient or decorative elements

The active tab button gets `volt-gradient` styling; the inactive gets a ghost/transparent style. Content transitions use opacity and translateY with `transition-all duration-500`.

### Files to Create
- `src/pages/LandingPage.tsx` -- main landing page with hero toggle
- `src/pages/AboutStudents.tsx` -- about page for students
- `src/pages/AboutBrands.tsx` -- about page for brands
- `src/components/LandingNavbar.tsx` -- shared public navbar

### Files to Modify
- `src/App.tsx` -- update routes: `/` to LandingPage, add `/about/students` and `/about/brands`

### Design Notes
- All pages use existing Tailwind theme tokens (primary, foreground, card, etc.)
- Space Grotesk for headings, Inter for body (already configured)
- Mobile-first responsive design
- Smooth scroll-based animations using existing `animate-fade-in` utilities
- The landing navbar collapses into a hamburger menu on mobile using the existing Sheet component

