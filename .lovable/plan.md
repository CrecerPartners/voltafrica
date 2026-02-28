

# Full-Screen Image Viewer + Universal Share Button

## Overview
Three improvements: (1) clicking a product image opens a full-screen lightbox with left/right navigation, (2) a universal share button that uses the browser's native `navigator.share()` API to let users share to ANY app (WhatsApp Status, DMs, groups, Instagram, Telegram, etc.), and (3) streamlined share UX across the product detail sheet.

---

## 1. Full-Screen Image Lightbox

**New component: `src/components/ImageLightbox.tsx`**

A modal overlay that shows the clicked image at full size with:
- Dark backdrop covering the entire screen
- Large image centered with `object-contain` to fit any aspect ratio
- Left/right arrow buttons to navigate between images
- Keyboard support (arrow keys, Escape to close)
- Image counter ("2 / 4") at the top
- A universal share button on the lightbox itself (share current image)
- Close button (X) in the top-right corner
- Built using Radix Dialog for accessibility

## 2. Universal Share Button (Native Share API)

**How it works:** The Web Share API (`navigator.share()`) opens the device's native share sheet -- which includes WhatsApp (DMs, groups, AND Status), Instagram, Telegram, Facebook, Twitter, email, and every other app installed on the user's phone. This is the best way to support "all socials" without building individual integrations.

**Fallback:** On desktop browsers that don't support `navigator.share()`, fall back to a popover with icon buttons for WhatsApp, Twitter/X, copy link, plus a "Copy All" button.

**Share helper: `src/lib/shareUtils.ts`**

A utility file with:
- `shareContent(title, text, url?)` -- tries `navigator.share()` first, falls back to clipboard copy
- `shareToWhatsApp(text)` -- opens `https://api.whatsapp.com/send?text=...` (works for DMs, groups, and Status)
- `shareToTwitter(text, url)` -- opens Twitter intent
- `shareToTelegram(text, url)` -- opens Telegram share link
- `shareToFacebook(url)` -- opens Facebook sharer
- `copyToClipboard(text, label)` -- copies and shows toast

## 3. Changes to ProductDetailSheet

**Updated `src/components/ProductDetailSheet.tsx`:**

- **Image grid**: Clicking an image opens the new lightbox (not just hover actions). Keep hover overlay but simplify to just a "View" icon.
- **Per-image share**: Inside the lightbox, a share button that shares the image URL + product caption via native share.
- **Replace individual platform sections** with a cleaner layout:
  - Keep WhatsApp, Instagram, Twitter caption previews (collapsible)
  - Each caption gets a single row: platform icon + preview text + **Share** button (native) + **Copy** button
  - The Share button uses `navigator.share()` with the caption + referral link pre-filled
- **Universal "Share Product" button** at the bottom: uses native share with product name, description, and referral link. This one button covers WhatsApp Status, DMs, groups, Instagram, Telegram, etc.
- **Video share**: If video exists, share button sends video URL + caption via native share

## 4. Share Fallback Popover

**New component: `src/components/SharePopover.tsx`**

For desktop browsers without native share support:
- A popover triggered by the share button
- Row of circular icon buttons: WhatsApp, Twitter/X, Telegram, Facebook, Copy Link
- Each opens the respective deep link or copies to clipboard
- Clean, compact grid of icons

---

## Technical Details

### New Files
| File | Purpose |
|------|---------|
| `src/components/ImageLightbox.tsx` | Full-screen image viewer with arrows and share |
| `src/lib/shareUtils.ts` | Share utility functions (native share + fallbacks) |
| `src/components/SharePopover.tsx` | Desktop fallback share menu with social icons |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/ProductDetailSheet.tsx` | Integrate lightbox on image click, replace per-platform share buttons with universal share, add SharePopover fallback, streamline sales assets section |

### Key Implementation Notes
- `navigator.share()` is well-supported on mobile (iOS Safari, Chrome Android) where social sharing matters most
- `navigator.canShare()` check before attempting share
- WhatsApp link uses `https://api.whatsapp.com/send?text=` which supports DMs and groups; for Status, the native share sheet is the only way
- No new dependencies needed -- all built with existing Dialog, Popover, and Button components
- Images open in lightbox via Dialog with `useState` for current index

