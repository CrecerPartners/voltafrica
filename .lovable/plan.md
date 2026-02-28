

# Fix WhatsApp Share Link Being Blocked

## Problem
The WhatsApp share button opens `api.whatsapp.com` which gets blocked inside the preview iframe (`ERR_BLOCKED_BY_RESPONSE`). WhatsApp's API domain sets headers that prevent it from loading in iframes.

## Fix
In `src/lib/shareUtils.ts`, change the WhatsApp share URL from `https://api.whatsapp.com/send?text=` to `https://wa.me/?text=`. The `wa.me` domain is WhatsApp's official short-link domain designed for sharing, and it handles iframe/redirect contexts better.

Also add `noopener,noreferrer` to all `window.open()` calls across the share utils to ensure they open cleanly in a new tab.

### File: `src/lib/shareUtils.ts`
- Line 23: Change `https://api.whatsapp.com/send?text=` to `https://wa.me/?text=`
- Add `"_blank", "noopener,noreferrer"` to all `window.open` calls

One file changed, single-line fix.
