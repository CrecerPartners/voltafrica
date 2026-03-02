

# Brands Section Content Overhaul

## Overview
When the "Brands" tab is selected on the landing page, replace the student-focused content (Ways to Earn, Features) with comprehensive brand-focused content below the hero image. The page will conditionally render different sections based on the active tab.

## Content Sections (Brands tab only, below hero image)

### 1. Brand Stats Bar
Five key metrics in a styled row:
- 2M+ active student buyers nationwide
- 60k students per major campus
- 100+ student sales agents per campus
- 1000+ peer-driven interactions per campaign
- 10 or fewer days to launch campus sales

### 2. "Why Brands Choose Volt" - 7 benefit cards
Grid of cards (2-col on desktop), each with title + description:
- Zero-Stress Logistics
- Sales Density, Not Surface Reach
- Social-First Sales Content
- Faster Time-to-Market
- Repeat Buying & Community-Led Adoption
- Vetted Campus Sales Force
- Direct Peer-to-Peer Trust & Selling
- Performance Tracking, Not Guesswork

### 3. "The Volt Advantage" - Comparison Table
Side-by-side table comparing Traditional Ads vs The Volt Way across 5 dimensions: Reach, Cost, Engagement, Tracking, Sales.

### 4. "Product Verticals We Distribute" - Category List
Six product verticals displayed as styled pills/cards:
- Electronics & Gadgets
- Telco & Utility Services
- Fintech & Financial Services
- Events & Access
- Fashion & Lifestyle
- Academic & Professional Tools

### 5. "The Volt Process" - 4-step timeline
Numbered steps: List Your Brand, Campaign Activation, Campus Sales Go Live, Track Sales & Scale.

### 6. Final CTA
"Distribution for the Next Generation" with the tagline: "This is campus distribution infrastructure."

## Technical Approach

### File: `src/pages/LandingPage.tsx`
- Wrap the existing "Ways to Earn", "Features", and student-focused sections in a conditional `{tab === "students" && ...}`
- Add a `{tab === "brands" && ...}` block containing all the new brands content sections
- The Stats bar, CTA, and Footer remain shared across both tabs
- Update the shared stats section to show different stats based on the active tab (student stats vs brand stats)

### Conditional rendering structure:
```text
Hero (shared, with toggle)
  |-- Student image / Brand image (already done)
  |
  |-- tab === "students":
  |     Stats bar (existing)
  |     Ways to Earn (existing)
  |     Features with screenshots (existing)
  |
  |-- tab === "brands":
  |     Brand Stats (2M+, 60k, etc.)
  |     Why Brands Choose Volt (8 cards)
  |     The Volt Advantage (comparison table)
  |     Product Verticals
  |     The Volt Process (4 steps)
  |
  CTA (shared)
  Footer (shared)
```

No new files needed -- all changes in `src/pages/LandingPage.tsx`.

