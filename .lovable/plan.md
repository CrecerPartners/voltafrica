

# Enhance Product Assets for All Categories + Tighten Marketplace UI

## Overview
Two changes: (1) Give every product -- digital, fintech, events, not just physical -- proper images and sharable assets with direct social sharing buttons, and (2) polish the Marketplace page layout for a cleaner, more professional look.

---

## 1. Add Images and Richer Assets to ALL Products

**Problem:** Currently only physical products (earbuds, watch, hoodie, lamp) have images. Digital (MTN, Spotify, Coursera, Netflix), fintech (PiggyVest, Kuda, Cowrywise), and events products all have empty `images: []` arrays.

**Fix in `src/data/mockData.ts`:**
- Add 2 relevant Unsplash/placeholder images per product for every category:
  - Digital: brand-relevant lifestyle images (e.g., person streaming music for Spotify, studying for Coursera)
  - Fintech: finance/savings themed images (piggy bank, phone banking)
  - Events: crowd/concert/networking themed images
- Add a `twitterCaption` field to `ProductAssets` interface for broader social sharing
- Add a `videoUrl` field (optional, string or empty) to `ProductAssets` for products that have promo videos

**Updated `ProductAssets` interface:**
```
interface ProductAssets {
  images: string[];
  videoUrl?: string;
  whatsappMessage: string;
  instagramCaption: string;
  twitterCaption: string;
  sellingTips: string[];
}
```

---

## 2. Upgrade ProductDetailSheet with Social Share Buttons

**Changes in `src/components/ProductDetailSheet.tsx`:**

- **Product Images section**: Always show (even for non-physical). Add a "Share to WhatsApp" button per image that opens `https://wa.me/?text=` with the image URL + referral link
- **Video section**: If `videoUrl` exists, show an embedded video placeholder with a "Share Video" button
- **Sales Assets section**: Replace plain "Copy" buttons with a row of social share icons:
  - WhatsApp: opens `https://wa.me/?text=` with pre-filled message + referral link
  - Instagram: copy caption (can't deep-link to IG post creation)
  - Twitter/X: opens `https://twitter.com/intent/tweet?text=` with caption + link
  - General copy button stays for clipboard
- **"Share All Assets" button**: One-tap copies all text assets (WhatsApp msg + IG caption + referral link) to clipboard
- Make image grid show images at a better aspect ratio with rounded corners
- Add "Download Image" button that opens image in new tab (since direct download from Unsplash cross-origin isn't possible)

---

## 3. Tighten Marketplace Page UI

**Changes in `src/pages/Marketplace.tsx`:**

- Add a product count indicator next to the header (e.g., "14 products")
- Tighten card padding and spacing for a denser, cleaner grid
- Add a subtle hover scale effect on cards (`hover:shadow-md hover:-translate-y-0.5 transition-all`)
- Show a small asset indicator on each card (e.g., a camera icon with count like "2 images") so students know assets are available before clicking
- Make the "Get Link" button slightly smaller and more compact
- Add an empty state message when no products match a filter
- Improve filter bar: add a search input to filter products by name

---

## Files Changed

| File | Change |
|------|--------|
| `src/data/mockData.ts` | Add `twitterCaption` and `videoUrl` to interface; add images to all 14 products |
| `src/components/ProductDetailSheet.tsx` | Add social share buttons (WhatsApp, Twitter/X), video section, "Share All" button, improved image grid |
| `src/pages/Marketplace.tsx` | Add search input, asset count indicator on cards, hover effects, product count, empty state |

