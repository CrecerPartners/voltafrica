

## Fix: Seamless Login → OTP Flow

### The Problem

When the user clicks "Sign In", `signIn()` succeeds which immediately sets `user` in auth state. The `useEffect` redirect fires and navigates to `/dashboard` before `signOut()` + `setStep("otp")` can run. The dashboard flashes, then the user bounces back to the login form.

### The Fix

Simple and clean — use a `useRef` flag to suppress the redirect during the login-OTP handoff:

**File: `src/pages/Login.tsx`**

1. Add `const isProcessingLogin = useRef(false)`
2. Update the redirect `useEffect` to check the flag:
   ```
   if (!authLoading && user && !isProcessingLogin.current) {
     navigate("/dashboard", { replace: true });
   }
   ```
3. In the login branch of `handleSubmit`:
   - Set `isProcessingLogin.current = true` **before** calling `signIn`
   - If `signIn` errors, reset the flag to `false`
   - If `signIn` succeeds, call `signOut()`, then `sendLoginOtp()`, then `setStep("otp")`, then set flag to `false`
4. After successful OTP verification in `handleVerifyOtp`, the flag is already `false`, so the `useEffect` redirect naturally sends the user to `/dashboard`

This ensures:
- No dashboard flash — the redirect is suppressed during the sign-in → sign-out → send-OTP window
- OTP screen appears immediately after password validation
- After entering the 8-digit code, the user lands on the dashboard seamlessly

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Add `useRef` flag, guard the redirect `useEffect`, wrap login flow |

