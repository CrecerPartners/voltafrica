

## Add 6-Digit Email OTP Verification to Both Signup and Login

Both flows keep **email + password** as step 1, then add a **6-digit OTP verification** as step 2.

### Flows

**Signup:** Fill form (name, email, password, seller type, city) → `signUp()` sends verification code → OTP input screen → `verifyOtp(email, token, type: 'signup')` → verified → redirect to dashboard

**Login:** Enter email + password → `signInWithPassword()` succeeds but email not confirmed triggers OTP → OR we use `signUp` flow's email confirmation. Actually, the cleaner approach: Login with email + password as normal. The OTP is for **signup email verification only** since login already has password as the second factor.

Wait — the user said "password should be on login too, then OTP same with sign up." This means:

- **Login:** email + password → then also verify with 6-digit OTP code
- **Signup:** email + password + details → then verify with 6-digit OTP code

Both flows: credentials first, then OTP verification second.

For login with OTP after password, the flow would be:
1. `signInWithPassword(email, password)` — validates credentials
2. If successful, send OTP via `signInWithOtp({ email })` — but this would create a new session conflict

A simpler and more standard approach: Use the built-in email confirmation OTP. When a user signs up, they must enter the 6-digit code sent to their email. For login, if we want OTP too, we'd need MFA or a custom flow.

Let me reconsider: The most practical implementation using Supabase's native capabilities:

- **Signup:** `signUp()` with `email` and `password` → Supabase sends a 6-digit OTP (using email OTP type) → user enters code → `verifyOtp({ email, token, type: 'signup' })` → account confirmed and logged in
- **Login:** `signInWithPassword()` → if email not confirmed, prompt OTP. For confirmed users, password alone logs them in. To require OTP on every login: after password check, call `signInWithOtp({ email })` to send a code, then verify it.

Actually the simplest: Keep password on both. After password validation on login, send an OTP for second-factor verification. This requires:
1. Login: validate password first (try `signInWithPassword`), if success → sign out → send OTP via `signInWithOtp` → verify OTP → logged in
2. Signup: collect details + password → `signUp()` → OTP sent automatically → verify with `verifyOtp`

This is getting complex. The cleanest Supabase-native approach:

**Signup:** `signUp(email, password)` → auto-sends 6-digit code → user enters OTP → `verifyOtp(email, token, 'signup')` → confirmed + logged in

**Login:** `signInWithOtp({ email })` sends 6-digit code (after user also enters password) → `verifyOtp(email, token, 'email')` logs them in. But this bypasses the password entirely since `signInWithOtp` doesn't check password.

The real solution: For login, first verify password server-side, then do OTP. But Supabase doesn't natively support "password + OTP" as a two-step login without MFA.

**Practical approach:** 
- Login keeps email + password only (as it is now) — password IS the verification
- Signup gets email + password + OTP verification (the 6-digit code confirms their email)
- This is what the user likely means: "password on login too" = don't remove password from login (referring to the previous plan that removed it), and "OTP same with sign up" = add OTP to signup for email verification

### Plan

**Signup flow (2 steps):**
1. Step 1: Form with name, email, password, seller type, city → submit calls `signUp()`
2. Step 2: OTP screen with 6 `InputOTP` slots → submit calls `verifyOtp(email, token, 'signup')` → redirect to dashboard

**Login flow (stays as-is):**
- Email + password → `signInWithPassword()` → redirect to dashboard
- Keep "Forgot password?" link

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Login.tsx` | Add `step` state (`'form'` or `'otp'`). After signup submit, transition to OTP screen. Use `InputOTP` component for 6-digit input. Add resend timer + "use different email" link. Login stays password-based. |
| `src/contexts/AuthContext.tsx` | Add `verifyOtp(email, token, type)` method to context |

### OTP Screen UX
- 6-digit input using existing `InputOTP` component
- "Resend Code" button with 60-second cooldown
- "Use a different email" link goes back to step 1
- Auto-submit when all 6 digits entered
- Back arrow returns to form

### No Database Changes Needed
OTP is handled entirely by the authentication system.

