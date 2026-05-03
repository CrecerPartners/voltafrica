# Talent Pool Firebase → Supabase Migration Design

**Date:** 2026-05-03  
**Status:** Approved

---

## Overview

Migrate `Digihire-Talent-Pool--main` (a standalone Firebase/React app) into the existing Digihire monorepo. Remove all Firebase dependencies and replace with the shared Supabase client and `AuthContext` from `@digihire/shared`. Distribute pages across three existing apps: `apps/talentpool/`, `apps/brands/`, and `apps/admin/`. Create Supabase tables for all talent pool data.

---

## Source Distribution Map

| Source (`Digihire-Talent-Pool--main`) | Destination |
|---|---|
| `pages/talent/*` | `apps/talentpool/src/pages/` |
| `pages/academy/*` | `apps/talentpool/src/pages/academy/` |
| `pages/LandingPage.tsx` | Discarded — `apps/landing/` owns the public site |
| `pages/LoginPage.tsx` | `apps/talentpool/src/pages/Login.tsx` + `apps/brands/src/pages/Login.tsx` |
| `pages/TalentSignupPage.tsx` | `apps/talentpool/src/pages/Signup.tsx` |
| `pages/BrandSignupPage.tsx` | `apps/brands/src/pages/Signup.tsx` |
| `pages/VerifyEmailPage.tsx` | `apps/talentpool/src/pages/VerifyEmail.tsx` + `apps/brands/src/pages/VerifyEmail.tsx` |
| `pages/brand/*` | `apps/brands/src/pages/` |
| `pages/admin/*` | `apps/admin/src/pages/` (new talent pool sections) |
| `components/common/Navbar.tsx` | Each app gets its own copy, updated to use `useAuth()` from `@digihire/shared` instead of Firebase auth listener |
| `contexts/AuthContext.tsx` | Deleted — replaced by `@digihire/shared` `AuthContext` |
| `lib/firebase.ts` | Deleted — replaced by `@digihire/shared` Supabase client |
| `types.ts` | Split: talent types → `apps/talentpool/src/types.ts`, brand types → `apps/brands/src/types.ts` |

---

## Supabase Schema

All tables created in a single new migration file: `supabase/migrations/<timestamp>_talent_pool.sql`.

### `talent_profiles`

One row per talent user.

```sql
create table talent_profiles (
  id                 uuid primary key references auth.users on delete cascade,
  full_name          text,
  phone              text,
  city               text,
  state              text,
  experience_years   int,
  skills             text[],
  role_interests     text[],
  availability       text,        -- 'immediate' | '2weeks' | '1month'
  work_preference    text,        -- 'remote' | 'hybrid' | 'onsite'
  salary_min         int,
  salary_max         int,
  cv_url             text,
  linkedin_url       text,
  bio                text,
  status             text default 'incomplete',  -- 'incomplete' | 'complete' | 'under_review' | 'shortlisted' | 'matched' | 'archived'
  profile_completion int  default 0,             -- 0-100
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
```

### `brand_profiles`

One row per brand user.

```sql
create table brand_profiles (
  id            uuid primary key references auth.users on delete cascade,
  company_name  text,
  industry      text,
  company_size  text,
  website       text,
  primary_goal  text,   -- 'campaigns' | 'recruitment' | 'activations'
  description   text,
  logo_url      text,
  contact_name  text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

### `talent_courses`

Academy courses — independent of the voltsquad training system.

```sql
create table talent_courses (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  thumbnail_url  text,
  modules        jsonb default '[]',  -- [{title, duration_minutes, content}]
  has_certificate bool default false,
  is_published   bool default false,
  created_at     timestamptz default now()
);
```

### `talent_enrollments`

Per-user course progress.

```sql
create table talent_enrollments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users on delete cascade,
  course_id         uuid not null references talent_courses on delete cascade,
  progress          int default 0,   -- 0-100
  completed_modules int[] default '{}',
  completed_at      timestamptz,
  created_at        timestamptz default now(),
  unique (user_id, course_id)
);
```

### `talent_webinars`

Scheduled webinar events.

```sql
create table talent_webinars (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  scheduled_at     timestamptz,
  duration_minutes int,
  meeting_url      text,
  is_published     bool default false,
  created_at       timestamptz default now()
);
```

### `talent_admin_notes`

Internal admin notes on a talent.

```sql
create table talent_admin_notes (
  id         uuid primary key default gen_random_uuid(),
  talent_id  uuid not null references talent_profiles on delete cascade,
  admin_id   uuid not null references auth.users,
  note       text not null,
  created_at timestamptz default now()
);
```

### RLS Policies

| Table | Talent user | Brand user | Admin |
|---|---|---|---|
| `talent_profiles` | Read + write own row | None | Read + write all |
| `brand_profiles` | None | Read + write own row | Read + write all |
| `talent_courses` | Read published | Read published | Read + write all |
| `talent_enrollments` | Read + write own rows | None | Read + write all |
| `talent_webinars` | Read published | Read published | Read + write all |
| `talent_admin_notes` | None | None | Read + write all |

Admin is identified by `auth.jwt() ->> 'user_metadata' ->> 'account_type' = 'admin'` (consistent with the existing admin pattern in the monorepo).

---

## Auth & Role Management

### New `account_type` values

| Value | App | Description |
|---|---|---|
| `"user"` | `apps/voltsquad/` | VoltSquad seller (existing) |
| `"admin"` | `apps/admin/` | Platform admin (existing) |
| `"talent"` | `apps/talentpool/` | Talent registrant (new) |
| `"brand"` | `apps/brands/` | Brand/company user (new) |

### Signup

Both apps call `supabase.auth.signUp` with `account_type` in `user_metadata`:

```ts
// apps/talentpool/src/pages/Signup.tsx
await supabase.auth.signUp({
  email, password,
  options: { data: { name, account_type: "talent" } }
})

// apps/brands/src/pages/Signup.tsx
await supabase.auth.signUp({
  email, password,
  options: { data: { name, account_type: "brand" } }
})
```

No changes to `@digihire/shared`'s `AuthContext`.

### Route Protection

Each app defines a local `ProtectedRoute` using `useAuth()` from `@digihire/shared`:

```tsx
// apps/talentpool/src/components/ProtectedRoute.tsx
const { user, loading } = useAuth();
if (loading) return <Spinner />;
if (!user || user.user_metadata?.account_type !== "talent") {
  return <Navigate to="/login" replace />;
}
return <>{children}</>;
```

Same pattern for `apps/brands/` checking `"brand"`.

### Login

Each app has a simple email/password login page — no role tabs (each app serves one role). On success, redirect to the respective dashboard.

### Sign-out

Uses the shared `signOut()` which redirects to `VITE_LANDING_URL` (`https://digihire.io`).

---

## Apps Structure After Migration

### `apps/talentpool/src/`

```
pages/
  Login.tsx
  Signup.tsx
  VerifyEmail.tsx
  academy/
    AcademyPage.tsx
    CourseDetailPage.tsx
  talent/
    TalentDashboard.tsx
    TalentProfileView.tsx
    ProfileSetup.tsx
components/
  Navbar.tsx
  ProtectedRoute.tsx
hooks/
  useTalentProfile.ts
  useTalentCourses.ts
  useTalentEnrollments.ts
types.ts
App.tsx
main.tsx
```

### `apps/brands/src/`

```
pages/
  Login.tsx
  Signup.tsx
  VerifyEmail.tsx
  brand/
    BrandDashboard.tsx
    BrandSetup.tsx
components/
  Navbar.tsx
  ProtectedRoute.tsx
hooks/
  useBrandProfile.ts
types.ts
App.tsx
main.tsx
```

### New files in `apps/admin/src/`

```
pages/
  AdminTalentPool.tsx      ← migrated from Firebase AdminDashboard.tsx
  AdminBrands.tsx          ← migrated from Firebase brand admin view
components/
  TalentDetailsModal.tsx   ← migrated from Firebase TalentDetailsModal.tsx
```

New routes added to `apps/admin/src/App.tsx`:
```
/admin/talent-pool   → AdminTalentPool
/admin/brands        → AdminBrands
```

New sidebar entries in the existing `AdminLayout` or sidebar component — two new sections: **Talent Pool** and **Brands**.

---

## Firebase Removal Checklist

All of the following are deleted and have no replacement in the monorepo:

- `lib/firebase.ts`
- `firebase-applet-config.json`
- `firebase-blueprint.json`
- `firestore.rules`
- `DRAFT_firestore.rules`
- All `import { ... } from "firebase/..."` statements across all migrated files

Firebase npm packages (`firebase`) are not added to any monorepo app's `package.json`.

---

## Data Layer Replacement Pattern

Every Firestore call is replaced with the equivalent Supabase call using the client from `@digihire/shared`:

```ts
import { supabase } from "@digihire/shared";

// Firestore: getDoc(doc(db, "talentProfiles", uid))
// Supabase:
const { data } = await supabase
  .from("talent_profiles")
  .select("*")
  .eq("id", user.id)
  .single();

// Firestore: setDoc(doc(db, "talentProfiles", uid), data)
// Supabase:
await supabase
  .from("talent_profiles")
  .upsert({ id: user.id, ...data });
```

---

## Per-App Environment Variables

Both new apps use the same env var set as the rest of the monorepo:

```env
VITE_SUPABASE_URL=https://yaojxewpkrjonrvqpsxi.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_APP_NAME=talentpool        # or "brands"
VITE_APP_DOMAIN=talentpool.digihire.io   # or "brands.digihire.io"
VITE_LANDING_URL=https://digihire.io
```

---

## Out of Scope

- Page UI redesigns — existing Firebase app UI is kept as-is, only data layer changes
- Supabase Storage integration for CV/logo uploads — file upload wiring is a follow-on task
- Vercel project setup for `talentpool` and `brands` — deployment configuration is separate
- `volt-africa/` and `mobile/` app updates

