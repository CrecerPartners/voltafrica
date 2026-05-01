# Digihire Multi-Domain Restructuring Design

**Date:** 2026-05-01  
**Status:** Approved

---

## Overview

Restructure the Digihire monolith into a multi-app workspace where each subdomain is an independently deployable Vite app. All apps share a single Supabase backend, the same authentication system, and a common package (`@digihire/shared`) for reusable code.

---

## Domains

| Domain | App | Description |
| --- | --- | --- |
| `digihire.io` | `landing` | Public marketing site |
| `voltsquad.digihire.io` | `voltsquad` | User (seller) dashboard — current app |
| `talentpool.digihire.io` | `talentpool` | Talent registration + mini dashboard |
| `brands.digihire.io` | `brands` | Brand dashboard |
| `digihire.io/admin` | `admin` | Admin panel covering all three apps |

---

## Repository Structure

```text
Digihire/
├── apps/
│   ├── landing/               # digihire.io
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       └── pages/         # marketing pages (about, blog, contact, events)
│   │
│   ├── voltsquad/             # voltsquad.digihire.io
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── pages/         # dashboard, marketplace, wallet, campaigns, etc.
│   │       ├── components/    # voltsquad-specific components
│   │       └── hooks/         # voltsquad-specific hooks
│   │
│   ├── talentpool/            # talentpool.digihire.io
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── pages/
│   │       ├── components/
│   │       └── hooks/
│   │
│   ├── brands/                # brands.digihire.io
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── pages/
│   │       ├── components/
│   │       └── hooks/
│   │
│   └── admin/                 # digihire.io/admin
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── pages/         # migrated from src/pages/admin/
│           ├── components/    # migrated from src/components/admin/
│           └── hooks/         # admin-specific hooks
│
├── packages/
│   └── shared/                # @digihire/shared
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts       # barrel export
│           ├── integrations/
│           │   └── supabase/
│           │       ├── client.ts
│           │       └── types.ts
│           ├── contexts/
│           │   ├── AuthContext.tsx
│           │   └── CartContext.tsx
│           ├── hooks/         # hooks used by 2+ apps
│           │   ├── useProfile.ts
│           │   ├── useWallet.ts
│           │   ├── useNotifications.ts
│           │   └── ...
│           ├── components/
│           │   ├── ui/        # all 50 shadcn components
│           │   └── auth/      # login form, OTP, MFA (role-aware)
│           └── lib/
│               ├── utils.ts
│               ├── shareUtils.ts
│               └── csvExport.ts
│
├── mobile/                    # Capacitor wrapper (unchanged)
├── volt-africa/               # Expo React Native (unchanged)
├── supabase/                  # Edge functions + migrations (unchanged)
├── package.json               # Root — declares npm workspaces
├── tsconfig.json              # Base TS config (extended by each app)
└── tailwind.config.ts         # Base Tailwind config (extended by each app)
```

---

## Shared Package — `@digihire/shared`

### What goes in shared

A piece of code goes into `@digihire/shared` if **two or more apps use it**. If only one app uses it, it stays in that app's `src/`.

| Category | Contents |
| --- | --- |
| Supabase | `client.ts` (with Capacitor storage adapter), `types.ts` |
| Auth | `AuthContext.tsx`, login form, OTP verification, MFA setup, password reset |
| UI | All 50 shadcn components |
| Hooks | `useProfile`, `useWallet`, `useNotifications`, `useTransactions`, `useCampaigns`, `useReferrals`, `useSales`, `useTraining`, `useProducts`, `useProduct`, `useReviews`, `use-mobile`, `useCountUp`, `use-toast` |
| Contexts | `AuthContext`, `CartContext` |
| Lib | `utils.ts`, `shareUtils.ts`, `csvExport.ts`, `productTaxonomy.ts` |

### Auth — sign-out behaviour

All apps sign out via a shared `signOut()` in `AuthContext`. On sign-out, the user is redirected to `VITE_LANDING_URL` (i.e. `https://digihire.io`). This value is injected per app via environment variable.

```ts
// packages/shared/src/contexts/AuthContext.tsx
const signOut = async () => {
  await supabase.auth.signOut()
  window.location.href = import.meta.env.VITE_LANDING_URL
}
```

### Auth — role-based login tabs

The shared login component renders tabs for each role. The default active tab is set by the app via a prop:

```tsx
// apps/brands/src/pages/Login.tsx
<AuthLogin defaultRole="brand" />

// apps/voltsquad/src/pages/Login.tsx
<AuthLogin defaultRole="user" />

// apps/talentpool/src/pages/Login.tsx
<AuthLogin defaultRole="talent" />
```

Tabs: `User (VoltSquad)` | `Talent` | `Brand`. Admin login is separate and not tabbed.

---

## Code Migration Map

| Current location | Moves to |
| --- | --- |
| `src/pages/admin/*` | `apps/admin/src/pages/` |
| `src/components/admin/*` | `apps/admin/src/components/` |
| `src/hooks/useAdmin*.ts` | `apps/admin/src/hooks/` |
| `src/components/AdminLayout.tsx` | `apps/admin/src/components/` |
| `src/components/AdminProtectedRoute.tsx` | `apps/admin/src/components/` |
| `src/pages/*` (non-admin) | `apps/voltsquad/src/pages/` |
| `src/components/*` (non-admin, non-shared) | `apps/voltsquad/src/components/` |
| `src/hooks/*` used by 2+ apps | `packages/shared/src/hooks/` |
| `src/hooks/*` voltsquad-only (e.g. `useSellerShop`, `useLeaderboard`, `usePullToRefresh`) | `apps/voltsquad/src/hooks/` |
| `src/components/ui/*` | `packages/shared/src/components/ui/` |
| `src/contexts/*` | `packages/shared/src/contexts/` |
| `src/integrations/supabase/*` | `packages/shared/src/integrations/supabase/` |
| `src/lib/*` | `packages/shared/src/lib/` |
| `index.html`, `about.html`, `blog.html`, `contact.html`, `events.html` | `apps/landing/` |
| `voltsquad.html` | `apps/landing/` — it is a marketing page for the VoltSquad feature, not the app itself |
| `public/nav-partial.html`, `public/footer-partial.html` | `apps/landing/public/` |

---

## Per-App Environment Variables

Each app's `.env` (and Vercel project env) includes:

```env
VITE_SUPABASE_URL=https://yaojxewpkrjonrvqpsxi.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_APP_NAME=voltsquad
VITE_APP_DOMAIN=voltsquad.digihire.io
VITE_LANDING_URL=https://digihire.io
```

`VITE_APP_NAME` is used by the shared auth component to default the correct role tab and for cross-app redirect links.

---

## Deployment

Each app is a **separate Vercel project** targeting the same GitHub repository with a different root directory.

| Vercel Project | Root Directory | Domain |
| --- | --- | --- |
| `digihire-landing` | `apps/landing` | `digihire.io` |
| `digihire-voltsquad` | `apps/voltsquad` | `voltsquad.digihire.io` |
| `digihire-talentpool` | `apps/talentpool` | `talentpool.digihire.io` |
| `digihire-brands` | `apps/brands` | `brands.digihire.io` |
| `digihire-admin` | `apps/admin` | `digihire.io/admin` (via rewrite on landing project) |

**Admin path rewrite:** The `digihire-landing` Vercel project includes a rewrite rule that proxies `/admin/*` to the `digihire-admin` project URL. This makes `digihire.io/admin` work without a subdomain.

**Build command** for all apps: `cd ../.. && npm run build --workspace=apps/<name>`  
**Install command:** `cd ../.. && npm install`

---

## npm Workspaces (Root `package.json`)

```json
{
  "name": "digihire",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:landing": "npm run dev --workspace=apps/landing",
    "dev:voltsquad": "npm run dev --workspace=apps/voltsquad",
    "dev:talentpool": "npm run dev --workspace=apps/talentpool",
    "dev:brands": "npm run dev --workspace=apps/brands",
    "dev:admin": "npm run dev --workspace=apps/admin",
    "build:all": "npm run build --workspaces --if-present"
  }
}
```

**Local development:** Run `npm run dev:voltsquad` from the root to start just that app.

---

## Scalability Considerations

- Adding a new app = create `apps/<name>/`, add `@digihire/shared` as a dependency, configure Vercel project. No changes to shared or other apps.
- Adding shared functionality = add to `packages/shared/src/`, export from `index.ts`. All apps get it automatically on next install.
- The `packages/` directory is structured to accept additional packages (e.g. `packages/ui` if the team wants a dedicated component library, or `packages/api` for a typed API client).
- Mobile apps (`mobile/`, `volt-africa/`) are unaffected — they continue to reference the main app build or their own source.

---

## Out of Scope

- `talentpool` and `brands` app page designs — details to be provided separately.
- Supabase schema changes for new roles (talent, brand) — separate spec.
- Mobile app updates to reflect new domain structure.
