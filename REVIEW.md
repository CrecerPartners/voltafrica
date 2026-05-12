---
phase: voltsquad-app
reviewed: 2026-05-12T00:00:00Z
depth: standard
files_reviewed: 62
files_reviewed_list:
  - apps/voltsquad/src/App.tsx
  - apps/voltsquad/src/main.tsx
  - apps/voltsquad/src/components/AppSidebar.tsx
  - apps/voltsquad/src/components/CartDrawer.tsx
  - apps/voltsquad/src/components/DashboardLayout.tsx
  - apps/voltsquad/src/components/EditSaleDialog.tsx
  - apps/voltsquad/src/components/ImageLightbox.tsx
  - apps/voltsquad/src/components/KYCModal.tsx
  - apps/voltsquad/src/components/LandingNavbar.tsx
  - apps/voltsquad/src/components/ManualSaleDialog.tsx
  - apps/voltsquad/src/components/MfaSetup.tsx
  - apps/voltsquad/src/components/MfaVerification.tsx
  - apps/voltsquad/src/components/MobileBottomNav.tsx
  - apps/voltsquad/src/components/NavLink.tsx
  - apps/voltsquad/src/components/NotificationsPopover.tsx
  - apps/voltsquad/src/components/OnboardingWalkthrough.tsx
  - apps/voltsquad/src/components/OtpVerification.tsx
  - apps/voltsquad/src/components/ProductDetailSheet.tsx
  - apps/voltsquad/src/components/ProtectedRoute.tsx
  - apps/voltsquad/src/components/PublicProductLayout.tsx
  - apps/voltsquad/src/components/RequestPayoutDialog.tsx
  - apps/voltsquad/src/components/ReviewPrompt.tsx
  - apps/voltsquad/src/components/ReviewSection.tsx
  - apps/voltsquad/src/components/SharePopover.tsx
  - apps/voltsquad/src/components/SignupBonusDialog.tsx
  - apps/voltsquad/src/components/ThemeToggle.tsx
  - apps/voltsquad/src/components/landing/BrandsContent.tsx
  - apps/voltsquad/src/components/native/MobileOnboarding.tsx
  - apps/voltsquad/src/components/native/NativeSplash.tsx
  - apps/voltsquad/src/hooks/useAdminRole.ts
  - apps/voltsquad/src/hooks/useLeaderboard.ts
  - apps/voltsquad/src/hooks/useModalBackHandler.ts
  - apps/voltsquad/src/hooks/usePullToRefresh.ts
  - apps/voltsquad/src/hooks/useSellerShop.ts
  - apps/voltsquad/src/pages/AboutBrands.tsx
  - apps/voltsquad/src/pages/AboutStudents.tsx
  - apps/voltsquad/src/pages/BuyerOrders.tsx
  - apps/voltsquad/src/pages/Calculator.tsx
  - apps/voltsquad/src/pages/CampaignDetail.tsx
  - apps/voltsquad/src/pages/Campaigns.tsx
  - apps/voltsquad/src/pages/Checkout.tsx
  - apps/voltsquad/src/pages/Dashboard.tsx
  - apps/voltsquad/src/pages/DigiHireSalesActivations.tsx
  - apps/voltsquad/src/pages/ForgotPassword.tsx
  - apps/voltsquad/src/pages/Index.tsx
  - apps/voltsquad/src/pages/Leaderboard.tsx
  - apps/voltsquad/src/pages/Login.tsx
  - apps/voltsquad/src/pages/Marketplace.tsx
  - apps/voltsquad/src/pages/MyCampaigns.tsx
  - apps/voltsquad/src/pages/NotFound.tsx
  - apps/voltsquad/src/pages/OrderConfirmation.tsx
  - apps/voltsquad/src/pages/ProductPage.tsx
  - apps/voltsquad/src/pages/Profile.tsx
  - apps/voltsquad/src/pages/Referrals.tsx
  - apps/voltsquad/src/pages/ResetPassword.tsx
  - apps/voltsquad/src/pages/Sales.tsx
  - apps/voltsquad/src/pages/SellerShop.tsx
  - apps/voltsquad/src/pages/Training.tsx
  - apps/voltsquad/src/pages/TrainingCourse.tsx
  - apps/voltsquad/src/pages/WalletPage.tsx
findings:
  critical: 9
  warning: 11
  info: 6
  total: 26
status: issues_found
---

# Voltsquad App: Code Review Report

**Reviewed:** 2026-05-12
**Depth:** standard
**Files Reviewed:** 62
**Status:** issues_found

## Summary

Reviewed the full Voltsquad React application — a gig-economy platform where sellers earn commissions by promoting brands. The codebase is well-structured overall with clear component separation and a good auth flow skeleton. However, nine critical defects were found that must be fixed before shipping. The most severe issues are: (1) a super-admin password and email bypass list shipped in the client bundle, (2) a hardcoded Paystack test key in Checkout, (3) an XSS vector via `dangerouslySetInnerHTML` with Supabase-supplied SVG, (4) client-side commission calculation written directly to the database enabling earnings fraud, (5) KYC fields with no format validation, and (6) orphaned database rows created before Paystack payment completes. Eleven warnings address logic bugs, UI-breaking edge cases, and data integrity gaps. Six info items cover code quality issues.

---

## Critical Issues

### CR-01: Hardcoded Super-Admin Password and Email Bypass List in Client Bundle

**File:** `apps/voltsquad/src/hooks/useAdminRole.ts:5-6, 15-16`
**Issue:** `SUPER_ADMIN_PASS = "volt_admin_2026"` and a hardcoded email list (`SUPER_ADMINS`) are shipped in the compiled JavaScript bundle. The password constant is unused in the query function but still present in the bundle — any user can read it via browser DevTools. The email bypass on line 15 means any user whose Supabase metadata `email` matches the list is granted admin without going through the `has_role` RPC. The UUID bypass on line 16 hardcodes a specific user as perpetual admin with no revocation path.
**Fix:** Remove all client-side bypasses. Admin status must be determined solely by the server-side `has_role` RPC enforced via Supabase RLS.

```ts
// DELETE lines 5-6 and 15-16 entirely:
// const SUPER_ADMINS = ["admin@voltafrica.com", "crecerpartnersllc@gmail.com"];
// const SUPER_ADMIN_PASS = "volt_admin_2026";
// if (user?.email && SUPER_ADMINS.includes(user.email)) return true;
// if (user?.id === "8a2e2dbe-cecb-4868-8641-f48e073e5d43") return true;

// Keep only:
const { data, error } = await supabase.rpc("has_role", {
  _user_id: user!.id,
  _role: "admin",
});
if (error) throw error;
return data as boolean;
```

---

### CR-02: Hardcoded Paystack API Key Fallback in Checkout

**File:** `apps/voltsquad/src/pages/Checkout.tsx:168`
**Issue:** A real Paystack test key (`pk_test_4e1d855c4863fc9556d8d7c419612e2b36cbf8be`) is hardcoded as the fallback when `VITE_PAYSTACK_TEST_PUBLIC_KEY` is absent. The key is live, belongs to a real account, and will persist in git history forever. If the pattern is later copied for a production key, real payment data could be directed to the wrong merchant account. There is also no way to tell at runtime which environment is active.
**Fix:** Remove the hardcoded fallback. Throw a build-time error if the env variable is missing.

```ts
const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
if (!publicKey) {
  toast.error("Payment configuration error. Please contact support.");
  setLoading(false);
  return;
}
```

---

### CR-03: XSS via `dangerouslySetInnerHTML` with Supabase-Supplied QR Code SVG

**File:** `apps/voltsquad/src/components/MfaSetup.tsx:120`
**Issue:** The TOTP QR code from `supabase.auth.mfa.enroll()` is rendered with `dangerouslySetInnerHTML={{ __html: mfaQr }}`. The value is an SVG string coming directly from the API response. If Supabase's infrastructure or CDN is ever compromised, or if the client is pointed at a rogue server URL, arbitrary HTML and JavaScript could be injected into the DOM with no sanitisation. This is a stored XSS vector targeting the MFA setup flow.
**Fix:** Render as an `<img>` with a base64 data URI, or regenerate the QR client-side from the `totp.secret` using a library like `qrcode`.

```tsx
// Replace dangerouslySetInnerHTML with:
<img
  src={`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(mfaQr)))}`}
  alt="Scan this QR code with your authenticator app"
  className="w-48 h-48"
/>
```

---

### CR-04: Client-Side Commission Calculation Written Directly to Database — Earnings Fraud Vector

**File:** `apps/voltsquad/src/components/ManualSaleDialog.tsx:47-52, 73-107`
**Issue:** The `commission` value is computed entirely in the browser from client-fetched product data (lines 48-52) and then inserted directly into the `sales` and `transactions` tables via the Supabase anon key (lines 79, 97). A technically capable user can intercept the Supabase request (e.g., with a browser proxy) and submit an arbitrarily inflated commission amount. Supabase RLS enforces `user_id = auth.uid()` but does NOT validate the numeric `commission` column. This is a direct financial fraud vector where sellers can inflate their own wallet balance.
**Fix:** Remove `commission` from the client-side insert. A database trigger or Edge Function should calculate commission server-side from `products.commission_rate` when the sale row is inserted.

```ts
// Remove from saleData:
// commission: isLead ? 0 : commission,

// Remove from transactions insert:
// amount: commission,

// Add a Postgres trigger:
// CREATE OR REPLACE FUNCTION calculate_sale_commission()
// RETURNS TRIGGER AS $$ ... $$
```

---

### CR-05: KYC Fields (NIN/BVN) Accept Arbitrary Input — No Format Validation

**File:** `apps/voltsquad/src/components/KYCModal.tsx:51-72`
**Issue:** NIN and BVN values are taken directly from text inputs and passed to `updateProfile.mutateAsync()` with no format validation. The UI placeholder says "11-digit" but there is no `maxLength`, `pattern`, or `type="number"` constraint on the inputs, and no validation in `handleSubmit`. Any string — including empty, alphabetic, or SQL-like strings — is stored as the user's KYC NIN/BVN. If the downstream system (payout verification) assumes these are 11-digit numerics, invalid values will cause silent failures at payout time.
**Fix:** Add validation before submission:

```ts
const handleSubmit = async () => {
  if (!/^\d{11}$/.test(nin)) {
    toast.error("NIN must be exactly 11 digits");
    return;
  }
  if (!/^\d{11}$/.test(bvn)) {
    toast.error("BVN must be exactly 11 digits");
    return;
  }
  // ... existing code
};
```

Also add `maxLength={11}` and `inputMode="numeric"` to both Input elements.

---

### CR-06: Orders Created in Database Before Payment Completes — No Rollback on Failure

**File:** `apps/voltsquad/src/pages/Checkout.tsx:129-199`
**Issue:** `orders` and `order_items` rows are inserted into the database before the Paystack script even loads, and before the user completes payment. Three failure paths leave orphaned pending orders: (1) Paystack script fails to load (`script.onerror`), (2) user closes the browser tab after DB insert but before paying, (3) `order_items` insert fails but the `orders` row is already committed. The `if (itemsError) throw itemsError` on line 161 does not clean up the already-created order. This creates unbounded orphaned pending orders and makes order state unreliable.
**Fix:** At minimum, delete the orphaned order on `script.onerror` and use a transaction-like pattern. The correct fix is to create the order server-side only after Paystack confirms payment.

```ts
script.onerror = async () => {
  await supabase.from("order_items").delete().eq("order_id", order.id);
  await supabase.from("orders").delete().eq("id", order.id);
  setLoading(false);
  toast.error("Failed to load payment processor. Please try again.");
};
```

---

### CR-07: Paystack Script Tag Appended on Every Submit Click — Multiple Instances

**File:** `apps/voltsquad/src/pages/Checkout.tsx:176-198`
**Issue:** Every invocation of `handleSubmit` unconditionally appends a new `<script src="https://js.paystack.co/v1/inline.js">` to `document.body` without checking if it is already loaded. If the user clicks "Pay" twice (possible since `setLoading(true)` may not prevent re-entrant clicks during async DB inserts), or if the initial click's script fails and loading is reset, duplicate script tags accumulate. Multiple script loads cause `window.PaystackPop` to be re-defined, potentially producing duplicate payment modals or broken state.
**Fix:** Guard script injection:

```ts
const loadPaystack = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof (window as any).PaystackPop !== "undefined") {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="paystack"]');
    if (existing) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Paystack load failed"));
    document.body.appendChild(s);
  });
```

---

### CR-08: Deep-Link Auth Handler Silently Swallows Session Errors on Native

**File:** `apps/voltsquad/src/App.tsx:213-234`
**Issue:** The `appUrlOpen` deep-link handler extracts tokens from any URL with an `access_token` hash fragment and calls `supabase.auth.setSession()`. On Android, any installed app can trigger the app's URL scheme — a malicious app could send a forged deep link. The URL host is not validated (only the hash is checked). When `setSession` fails (line 228-232), the error is silently dropped: `if (!error) { window.location.href = '/dashboard'; }` — no `else` branch notifies the user. The user sees nothing and remains on whatever screen they were on, with no indication the auth attempt failed.
**Fix:** Validate the URL origin and surface errors:

```ts
const allowedHosts = ["digihire.io", "voltsquad.app", "supabase.co"];
if (!allowedHosts.some(h => url.hostname.endsWith(h))) return;

if (error) {
  console.error("Deep link session error:", error.message);
  window.location.href = "/login?error=link_expired";
  return;
}
window.location.href = "/dashboard";
```

---

### CR-09: `BuyerOrders` Loading State Never Resolves When Profile Is Not Yet Loaded

**File:** `apps/voltsquad/src/pages/BuyerOrders.tsx:18-45`
**Issue:** `loading` is initialised to `true`. The `useEffect` returns early (`if (!profile?.user_id) return`) without setting `setLoading(false)` when the profile is unavailable. On first render — when the `useProfile()` query hasn't resolved yet — `profile` is `undefined`, the early return fires, and `loading` is never set to `false`. The user sees an indefinite "Loading orders..." spinner. This can also trigger if the user has no profile record (edge case for new accounts).
**Fix:**

```ts
useEffect(() => {
  if (!profile?.user_id) {
    setLoading(false);
    return;
  }
  fetchOrders();
}, [profile?.user_id]);
```

---

## Warnings

### WR-01: Transaction PIN Pre-Filled From Profile Hash — Hash-of-Hash on Blind Save

**File:** `apps/voltsquad/src/pages/Profile.tsx:99-100, 172-185`
**Issue:** `securityForm.transaction_pin` is initialised from `profile.transaction_pin` — the SHA-256 hash already stored in the database. If the user navigates to the Security tab and clicks "Save PIN" without changing the field, `hashPin(existingHash)` runs and stores a hash-of-a-hash. The user's PIN is now permanently broken (no valid 4-digit input will match) until manually reset. The hash also appears in browser DevTools memory.
**Fix:** Never pre-populate credential fields. Start the PIN input empty and only hash/save if the user has entered a new value.

```ts
setSecurityForm({ transaction_pin: "" });
// In handleSaveSecurity, guard:
if (!securityForm.transaction_pin) return; // user didn't change PIN, skip save
```

---

### WR-02: `handleSaveProfile` Always Applies 24-Hour Security Lockout Regardless of What Changed

**File:** `apps/voltsquad/src/pages/Profile.tsx:151-156`
**Issue:** Every call to `handleSaveProfile` — including saving a display name, WhatsApp number, or social media links — includes `security_locked_until` in the payload, locking the wallet for 24 hours. A user who updates their Instagram handle will unexpectedly find withdrawals disabled, with no clear explanation. The security lockout should only apply when bank account details are modified.
**Fix:**

```ts
const payload: any = { ...profileForm, social_links: profileForm.social_links };
const bankChanged =
  profileForm.account_number !== profile?.account_number ||
  profileForm.bank_code !== profile?.bank_code;
if (bankChanged) {
  payload.security_locked_until = new Date(Date.now() + 86400000).toISOString();
}
await updateProfile.mutateAsync(payload);
```

---

### WR-03: `handleSaveSecurity` Hashes Empty String When PIN Field Is Blank

**File:** `apps/voltsquad/src/pages/Profile.tsx:172-185`
**Issue:** The guard `if (securityForm.transaction_pin && securityForm.transaction_pin.length !== 4)` skips validation when `transaction_pin` is an empty string (falsy). `hashPin("")` is then called, storing a SHA-256 hash of an empty string as the user's PIN. Any subsequent payout attempt requiring PIN entry will fail with a confusing error because no 4-digit input will ever match the hash of `""`.
**Fix:**

```ts
if (!securityForm.transaction_pin) {
  toast.error("Please enter a 4-digit PIN");
  return;
}
if (!/^\d{4}$/.test(securityForm.transaction_pin)) {
  toast.error("PIN must be exactly 4 digits");
  return;
}
```

---

### WR-04: `OrderConfirmation` Uses Bare `setTimeout` for Delivery Polling — No Cleanup, Flaky

**File:** `apps/voltsquad/src/pages/OrderConfirmation.tsx:35-43`
**Issue:** A 2-second `setTimeout` is used to wait for the webhook Edge Function to populate `delivery_details`. If the function is slow (cold start, network latency), delivery details won't be present after 2 seconds and the section silently shows nothing. The timeout fires even if the component has unmounted (user navigated away), causing a state update on an unmounted component. There is no cleanup in the `useEffect` return function.
**Fix:** Add a cleanup flag and implement short retry polling:

```ts
useEffect(() => {
  if (!isSuccess || !reference) return;
  let mounted = true;
  const poll = async () => {
    const { data: order } = await supabase.from("orders")...;
    if (!order || !mounted) return;
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
      if (!mounted) return;
      const { data: items } = await supabase.from("order_items")...;
      if (items?.some(it => it.delivery_details)) {
        if (mounted) setDeliveryItems(items);
        return;
      }
    }
  };
  poll();
  return () => { mounted = false; };
}, [isSuccess, reference]);
```

---

### WR-05: `usePullToRefresh` — Stale `pullDistance` Captured in `handleTouchEnd` Closure

**File:** `apps/voltsquad/src/hooks/usePullToRefresh.ts:33-43`
**Issue:** `handleTouchEnd` is memoised with `useCallback([pullDistance, threshold, onRefresh])`. Because `pullDistance` is React state, it captures the value from the last render when the callback was re-created. Rapid touch events may batch state updates, causing the value read inside `handleTouchEnd` to be stale (not the final distance at release time). This means the threshold check can fail even when the user pulled far enough, making pull-to-refresh unreliable.
**Fix:** Track live pull distance in a ref instead of reading it from state inside the callback:

```ts
const pullDistanceRef = useRef(0);

// In handleTouchMove:
pullDistanceRef.current = distance;
setPullDistance(distance);

// In handleTouchEnd (remove pullDistance from deps):
if (pullDistanceRef.current >= threshold) { ... }
pullDistanceRef.current = 0;
```

---

### WR-06: Unauthenticated Review Submission — No Rate Limiting or Auth Requirement

**File:** `apps/voltsquad/src/components/ReviewSection.tsx:36-44`
**Issue:** The review form is visible to all visitors (authenticated and not) and submits `reviewer_name` as free text with no authentication. A bot or malicious user can flood any product with 5-star or 1-star reviews under arbitrary names, permanently distorting product ratings which are displayed prominently on the product page.
**Fix:** Require authentication for review submission (gate the form on `!!user`), or add server-side rate limiting by IP address via an Edge Function. At minimum, add a honeypot field to filter bots.

---

### WR-07: `ManualSaleDialog` File Input Not Reset After Form Submission

**File:** `apps/voltsquad/src/components/ManualSaleDialog.tsx:120-129`
**Issue:** `resetForm()` calls `setProofFile(null)` to clear the React state, but the hidden `<input id="proof-upload" type="file">` DOM element retains its selected file. If the user opens the dialog again and tries to upload the same file, the `onChange` event will not fire (browsers don't fire `change` if the selected file is the same), leaving `proofFile` as `null` and the form unsubmittable.
**Fix:** Store a ref to the file input and clear its value on reset:

```ts
const proofInputRef = useRef<HTMLInputElement>(null);
// In resetForm():
if (proofInputRef.current) proofInputRef.current.value = "";
// On the input element:
<input ref={proofInputRef} id="proof-upload" ... />
```

---

### WR-08: Mobile Dashboard Logo Links to `/` — Causes Redirect Loop for Authenticated Users

**File:** `apps/voltsquad/src/components/DashboardLayout.tsx:47`
**Issue:** On mobile (non-native web), the header logo links to `/`. The `/` route in `App.tsx` line 153 renders `<Navigate to="/login" replace />` on web. An authenticated user clicking the logo will be sent to `/login`, which then immediately redirects back to `/dashboard` via the `useEffect` in `Login.tsx`. This causes a visible flash and an unnecessary round-trip through the auth check.
**Fix:** Link to `/dashboard` instead of `/`:

```tsx
<Link to="/dashboard" className="flex items-center">
  <img src="/assets/logo-color.png" ... />
</Link>
```

---

### WR-09: `EditSaleDialog` Submits with Empty Customer Name for Non-Lead Products

**File:** `apps/voltsquad/src/components/EditSaleDialog.tsx:61-77`
**Issue:** `handleSubmit` calls `updateSale.mutate()` without validating that `customer` is non-empty for non-lead products. The creation flow (`ManualSaleDialog`) requires a customer name, but the edit flow does not. A user can edit a sale and save an empty customer field, writing `customer: ""` to the database.
**Fix:**

```ts
const handleSubmit = () => {
  if (!sale) return;
  if (!isLead && !customer.trim()) {
    toast.error("Customer name is required");
    return;
  }
  updateSale.mutate({ ... });
};
```

---

### WR-10: `Profile.tsx` Bank Name Always Saved as Literal `"Selected Bank"`

**File:** `apps/voltsquad/src/pages/Profile.tsx:447`
**Issue:** When the bank dropdown `onValueChange` fires, `bank_name` is set to the hardcoded string `"Selected Bank"` regardless of which bank was chosen. This string is saved to the profile. The payout dialog displays `profile.bank_name` to the user as their selected bank — every user will see "Selected Bank" as their bank name regardless of what they selected.
**Fix:** Build a code-to-name lookup:

```ts
const BANK_NAMES: Record<string, string> = {
  "044": "Access Bank", "011": "First Bank", "058": "Guaranty Trust Bank",
  "033": "UBA", "057": "Zenith Bank", /* ... */
};
onValueChange={(val) => setProfileForm({
  ...profileForm,
  bank_code: val,
  bank_name: BANK_NAMES[val] ?? "Unknown Bank",
})}
```

---

### WR-11: Lead Clicks from Unauthenticated Buyers With Referral Code Are Not Attributed

**File:** `apps/voltsquad/src/pages/ProductPage.tsx:131-163`
**Issue:** In `handleLeadClick`, the `sales` insert (lead attribution) only runs `if (user)`. An unauthenticated buyer who arrives via a seller's referral link (with `refCode` in the URL) clicks "Sign Up Now", gets redirected to the external sign-up URL with the ref code, but no lead is recorded. The seller receives no click attribution for this conversion, silently losing earned commission for the lead product type.
**Fix:** Log unauthenticated lead clicks via a public Edge Function that does not require auth:

```ts
if (!user && refCode) {
  // Fire-and-forget via public edge function
  supabase.functions.invoke("log-lead-click", {
    body: { product_id: product.id, ref_code: refCode }
  }).catch(() => {}); // non-blocking
}
```

---

## Info

### IN-01: Hardcoded User UUID as Perpetual Admin Bypass

**File:** `apps/voltsquad/src/hooks/useAdminRole.ts:16`
**Issue:** `if (user?.id === "8a2e2dbe-cecb-4868-8641-f48e073e5d43") return true;` hardcodes a UUID as unconditional admin in client-side code. The UUID is visible in the compiled bundle, the bypass cannot be revoked without a code deploy, and the user's admin privileges do not show up in any database role table.
**Fix:** Remove the bypass. Grant the user the `admin` role via the database and let the `has_role` RPC handle the check.

---

### IN-02: Marketing Gallery Page Ships Placeholder Content

**File:** `apps/voltsquad/src/pages/DigiHireSalesActivations.tsx:371-382`
**Issue:** The visual gallery section on the public-facing sales activations page contains six placeholder boxes with the literal text "Placeholder for activation photo" and a comment "Replace with actual campaign photos". This is visible to prospective brand clients.
**Fix:** Replace with real images, or conditionally hide the section behind a feature flag until assets are available.

---

### IN-03: `console.error` Left in Production Checkout Flow

**File:** `apps/voltsquad/src/pages/Checkout.tsx:119, 201`
**Issue:** Two `console.error` calls remain in the checkout flow. Line 119 logs IP detection failures; line 201 logs checkout errors. These surface internal error details in browser DevTools for any user.
**Fix:** Remove or replace with a structured logging utility that is stripped or silenced in production builds.

---

### IN-04: Earnings Chart Buckets by Week-of-Month — Collides Across Months

**File:** `apps/voltsquad/src/pages/Dashboard.tsx:86-95`
**Issue:** The earnings chart uses `Math.ceil(d.getDate() / 7)` to bucket transactions, producing keys `W1`-`W5`. Transactions from different months with the same week-of-month (e.g., January Week 2 and March Week 2) are summed into the same bucket `W2`, making the chart misleading.
**Fix:** Use a year-qualified week key:

```ts
const getWeekKey = (d: Date) => {
  const start = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};
```

---

### IN-05: Referral Share Link Hardcodes `volt.ng` Domain

**File:** `apps/voltsquad/src/pages/Referrals.tsx:31`
**Issue:** `"https://volt.ng/ref/${profile.referral_code}"` hardcodes the production domain. In staging, preview deployments, or if the domain changes, shared referral links will point to the wrong URL.
**Fix:** Use `window.location.origin` or a `VITE_APP_URL` environment variable:

```ts
const shareUrl = `${window.location.origin}/ref/${profile.referral_code}`;
```

---

### IN-06: Native Browser `confirm()` Used for MFA Disable — Blocked in Capacitor WebViews

**File:** `apps/voltsquad/src/components/MfaSetup.tsx:68`
**Issue:** `window.confirm()` is used to confirm MFA disable. Native `confirm()` dialogs are blocked in some Capacitor Android WebView configurations and are stylistically inconsistent with the rest of the app, which uses Radix `AlertDialog` for destructive confirmations.
**Fix:** Replace with a Radix `AlertDialog` consistent with the pattern used in `Sales.tsx`.

---

_Reviewed: 2026-05-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
