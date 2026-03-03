

## Sync Verification with Signup & Clean Up Profile

### Problem
- The "University" field in Profile settings is irrelevant — during signup, the user already selects "What best describes you?" (Student, NYSC member, etc.) and their city, stored as `"SellerType — City"` in the `university` column.
- The Verification section re-asks "What best describes you?" with different options (Student/Corporate/Creator) — this is redundant and disconnected from signup.
- Only Student and Corporate trigger ID upload, but NYSC members and others should too where applicable.

### Solution

**1. Remove "University" field from Profile tab** — it's just the combined signup data, not useful to edit.

**2. Auto-populate `account_type` from signup data** — parse the `university` field (e.g. `"Student — Lagos"`) to extract the seller type. Map signup categories to verification types:
- Student → student (needs ID)
- NYSC member → nysc (needs ID)  
- Fresh grad → graduate
- Corporate → corporate (needs ID)
- Micro-influencer, Content creator, Young urban youth seller → creator

**3. Show the seller type as read-only in Verification** with a note "Set during signup". Remove the dropdown. All types that logically need an ID (student, NYSC, corporate) will show the upload field.

**4. Update `needsIdUpload` logic** to include NYSC members: `student`, `corporate`, or `nysc`.

### Files to Modify

**`src/pages/Profile.tsx`**:
- Remove the `university` ProfileField from Personal Information
- In the initialization block, parse `profile.university` to derive `account_type` if it's empty (auto-sync from signup)
- Replace the account_type `<Select>` dropdown with a read-only display showing the derived type
- Update `needsIdUpload` to: `["student", "corporate", "nysc"].includes(accountType)`

**`src/pages/Login.tsx`** (minor):
- Also save the raw seller type into `account_type` metadata during signup so new users get it directly. Update the `signUp` call to pass `account_type` in user metadata.

**`src/contexts/AuthContext.tsx`** (minor):
- Pass `account_type` through to the signup metadata.

**`supabase function handle_new_user`** (migration):
- Set `account_type` from `raw_user_meta_data->>'account_type'` during profile creation so it's populated from day one.

No new tables or columns needed.

