

## Plan: Use Email OTP Token Instead of Magic Link

### Problem
The login OTP currently calls `supabase.auth.signInWithOtp({ email })` which sends a **magic link** (a clickable URL). The user wants a **6-digit code** instead, matching the signup OTP experience.

### Solution

**1. `src/contexts/AuthContext.tsx`** — Update `sendLoginOtp` and `resendLoginOtp`:
- Pass `shouldCreateUser: false` to prevent creating new accounts
- Set `options.channel = 'email'` (not strictly required but explicit)
- The key fix: Supabase's `signInWithOtp` sends a magic link by default. To get a **token** instead, the email template must include `{{ .Token }}` instead of `{{ .ConfirmationURL }}`. Since we use custom email templates via the auth-email-hook, the template already receives `token` in the payload data. We need to update the **magic-link email template** to display the token code instead of a button link.

**2. `supabase/functions/_shared/email-templates/magic-link.tsx`** — Redesign to show a 6-digit OTP code:
- Remove the clickable button with `confirmationUrl`
- Add a `token` prop and display it as a large, styled 6-digit code (matching the reauthentication template pattern)
- Update copy: "Enter this code to log in to your Volt account"

**3. `supabase/functions/auth-email-hook/index.ts`** — Update subject line:
- Change `magiclink` subject from `'Your Volt login link ⚡'` to `'Your Volt login code ⚡'`
- The `templateProps` already passes `token: payload.data.token` so no other changes needed

**4. Redeploy edge function** after changes.

### Files to Modify

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Add `shouldCreateUser: false` to `signInWithOtp` calls |
| `supabase/functions/_shared/email-templates/magic-link.tsx` | Replace link button with 6-digit token display |
| `supabase/functions/auth-email-hook/index.ts` | Update magiclink subject line |

