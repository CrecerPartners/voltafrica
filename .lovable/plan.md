

## Plan: Use Dynamic URLs + Implement Seller Shop

### The Problem
The codebase has hardcoded `https://voltafrica.lovable.app` in referral/share links (Marketplace line 52, ProductPage line 48). When you get a custom domain, all those links break.

### The Fix

**Use `window.location.origin` everywhere** instead of hardcoding the URL. This way, whether the domain is `voltafrica.lovable.app`, `voltafrica.com`, or anything else, the links auto-adapt.

### Changes Required

**1. `src/pages/ProductPage.tsx` (line 48)**
```typescript
// Before
const referralLink = `https://voltafrica.lovable.app/product/${product.slug}?ref=${userRefCode}`;
// After
const referralLink = `${window.location.origin}/product/${product.slug}?ref=${userRefCode}`;
```

**2. `src/pages/Marketplace.tsx` (line 52)**
```typescript
// Before
navigator.clipboard.writeText(`https://voltafrica.lovable.app/product/${product.slug}?ref=${code}`);
// After
navigator.clipboard.writeText(`${window.location.origin}/product/${product.slug}?ref=${code}`);
```

**3. Future shop link in Profile.tsx** (when we build the shop feature)
```typescript
const shopLink = `${window.location.origin}/s/${profile.shop_slug}`;
```

All share links, referral links, and shop links will use `window.location.origin` so they automatically work with any domain.

### Scope
This is a quick 2-file fix. The seller shop feature (approved in previous plan) will also use this pattern from the start.

### Files to modify
- `src/pages/ProductPage.tsx` — line 48
- `src/pages/Marketplace.tsx` — line 52
- Any other files with hardcoded domain (will scan during implementation)

