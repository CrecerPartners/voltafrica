

## Plan: OTP for Both Login & Signup + Landing Headline Updates

### 1. Add OTP to Login Flow

Currently login uses `signInWithPassword()` and goes straight to dashboard. The new flow:

1. User enters email + password → `signInWithPassword()` validates credentials
2. If successful, immediately sign the user out, then send an OTP via `supabase.auth.signInWithOtp({ email })`
3. UI transitions to OTP screen (same `OtpVerification` component used for signup)
4. User enters 6-digit code → `verifyOtp(email, token, 'email')` → logged in → redirect to dashboard

**AuthContext changes:**
- Add `sendLoginOtp(email)` method that calls `supabase.auth.signInWithOtp({ email })`
- Add `resendLoginOtp(email)` (same call, for resend button)

**Login.tsx changes:**
- Login `handleSubmit`: after successful `signIn()`, call `signOut()` then `sendLoginOtp(email)`, transition to OTP step
- `handleVerifyOtp`: use type `'email'` for login, `'signup'` for signup
- `handleResendOtp`: call `resendLoginOtp` for login, `resendSignupOtp` for signup

### 2. Landing Page Headlines

**`src/pages/LandingPage.tsx`** — update the `audiences` object:
- Students headline: `"Join 1,000+ Gen Z Sellers Earning on Volt"`
- Brands headline: `"Built for Brands Selling to Gen Z & Millennials"`
- Brands subtitle: `"Fintech · Fashion · Food · Apps · Subscriptions · Events"`

### Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/AuthContext.tsx` | Add `sendLoginOtp` and `resendLoginOtp` methods |
| `src/pages/Login.tsx` | Login flow: password → sign out → send OTP → OTP screen → verify |
| `src/pages/LandingPage.tsx` | Update 3 headline/subtitle strings |

### No Database Changes Needed

