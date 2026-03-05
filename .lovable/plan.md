

## Fix Three Issues: OTP Redirect, First-Time-Only Dialogs, Onboarding UI

### Issue 1: OTP redirects to home instead of dashboard

The code in `Login.tsx` line 102 calls `navigate("/dashboard")` — this should work. The likely problem is a **race condition**: `verifyOtp` triggers `onAuthStateChange` which may not complete before the navigate fires, OR the Login page itself re-renders when auth state changes and the component unmounts before navigation completes.

**Fix**: Add a small delay or use `replace: true` in navigate, and ensure the Login page doesn't redirect authenticated users back to `/`. Check if there's an auth state listener somewhere redirecting logged-in users away from `/login` to `/` instead of `/dashboard`.

Actually, the real issue: Login page has no guard for already-authenticated users. When OTP verifies, `onAuthStateChange` fires → user is now authenticated → but the Login component is still mounted and may not redirect properly. The `navigate("/dashboard")` should work, but we should also add a redirect check: if user is already authenticated on the Login page, redirect to `/dashboard`.

**Changes to `src/pages/Login.tsx`:**
- Add `useAuth()` import and check: if `user` exists and not loading, redirect to `/dashboard`
- Ensure `navigate("/dashboard", { replace: true })` is used

### Issue 2: Signup bonus + onboarding shows every login

The current code in `Dashboard.tsx` lines 100-109 uses `localStorage` with key `volt-bonus-seen-{user_id}`. This should work — but only if `profile.user_id` is consistent. The bug is likely that localStorage is being cleared, or the `user_id` changes between sessions.

More likely: the `localStorage.setItem` on line 107 is called **before** `setShowBonusDialog(true)` takes effect — but actually looking again, it sets localStorage AND shows the dialog. So it should only show once.

Wait — the real problem: `localStorage` is per-browser/device. If the user clears cache or uses a different device, it shows again. A more robust solution: **use the database** to track whether the user has seen the bonus. But the simpler fix the user wants: store this flag in the `profiles` table or check the account creation date vs. a threshold.

**Simpler approach**: Check if the profile was created recently (e.g., within last 5 minutes of the current session start). If the profile `created_at` is much older than the current session, don't show the bonus/onboarding. This way it only triggers on genuinely new signups.

**Changes to `src/pages/Dashboard.tsx`:**
- Instead of only checking localStorage, also check if `profile.created_at` is within the last 2 minutes (indicating a fresh signup in this session)
- Only show bonus dialog if: no localStorage flag AND profile was just created
- Same logic for onboarding walkthrough

### Issue 3: Onboarding walkthrough UI improvements

**Changes to `src/components/OnboardingWalkthrough.tsx`:**
- Make "Next" a solid/outlined button (more prominent than "Skip All")
- Make "Skip All" a subtle ghost/text link
- Reduce dialog visual weight: smaller icon, less padding, subtler border
- Make the overall dialog less "overpowering"

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Login.tsx` | Add auth redirect guard; use `navigate("/dashboard", { replace: true })` |
| `src/pages/Dashboard.tsx` | Add `created_at` recency check — only show bonus/onboarding for profiles created within last 2 minutes |
| `src/components/OnboardingWalkthrough.tsx` | Make "Next" button prominent (outline/secondary variant), "Skip All" as subtle text link, reduce visual weight of dialog |

