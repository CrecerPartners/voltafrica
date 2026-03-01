

# Modernize Marketplace Product Cards

## Overview

Redesign the marketplace product cards to use a **hero image** instead of an emoji icon, giving them a modern e-commerce look. Each card will display the first image from the product's `assets.images` array as a cover photo, with the product details below.

## Card Layout (New Design)

Each product card will follow this structure:

```text
+---------------------------+
|                           |
|      [Product Image]      |  <-- aspect-ratio 4:3, object-cover, rounded top
|                           |
+---------------------------+
| Category Badge            |
| Product Name              |
| Brand                     |
| Short description...      |
|                           |
| Price        Commission%  |
|              [Get Link]   |
+---------------------------+
```

- **Image area**: Uses the first URL from `product.assets.images[]` as a cover image. Falls back to a gradient placeholder with the emoji if no images exist.
- **Hover effect**: Subtle scale-up on the image, card lifts with shadow.
- **Category badge**: Overlaid on the image (top-right corner) with a frosted glass effect.
- **Details section**: Clean typography below the image with name, brand, description, price, and commission rate.

## Technical Changes

### Modified: `src/pages/Marketplace.tsx`

- Replace the emoji `<div className="text-2xl">{product.image}</div>` with an `<img>` element showing `product.assets.images[0]`
- Add a fallback for products without images: show a muted placeholder with the emoji centered
- Move the category badge to overlay on top of the image (absolute positioning)
- Wrap the image in an `AspectRatio` container (4:3 ratio) with `overflow-hidden rounded-t-lg`
- Adjust `CardContent` padding and spacing for the new layout
- The card structure changes from all-in-one padding to: image block (no padding) + content block (with padding)

### No other files need modification

The `Product` interface and data stay the same -- we're just using `assets.images[0]` which already exists in the data model.

