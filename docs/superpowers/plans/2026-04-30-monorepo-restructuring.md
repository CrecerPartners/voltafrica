# Monorepo Restructuring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the single Vite+React SPA into a pnpm monorepo with `apps/voltsquad`, `apps/admin`, and `apps/pool` sharing code via `packages/ui` and `packages/supabase`.

**Architecture:** Three independent Vite apps live under `apps/`. Shared shadcn components and the Supabase client live in `packages/`. Each app uses Vite path aliases to redirect `@/components/ui/*`, `@/lib/utils`, and `@/integrations/supabase/*` to the shared packages — so **zero import statements change** across the codebase. The `supabase/` migrations directory and the static HTML landing pages remain at the root.

**Tech Stack:** pnpm workspaces, Vite 5, React 18, TypeScript 5, Tailwind CSS 3, shadcn/ui (Radix UI), Supabase JS v2, React Router v6, TanStack Query v5

---

## File Map — what moves where

```
digihire/                               (root — was Voltafrica/)
├── pnpm-workspace.yaml                 NEW
├── .npmrc                              NEW
├── package.json                        MODIFY (workspace root, no runtime deps)
├── tsconfig.json                       MODIFY (base config, no paths, no include)
│
├── packages/
│   ├── supabase/                       NEW — @digihire/supabase
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── client.ts               MOVED from src/integrations/supabase/client.ts
│   │       └── types.ts                MOVED from src/integrations/supabase/types.ts
│   │
│   └── ui/                            NEW — @digihire/ui
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── lib/
│           │   └── utils.ts            MOVED from src/lib/utils.ts
│           └── components/             MOVED from src/components/ui/ (38 files)
│
├── apps/
│   ├── voltsquad/                      NEW — voltsquad.digihire.io
│   │   ├── index.html                  COPIED from app.html
│   │   ├── package.json
│   │   ├── vite.config.ts              NEW (with package aliases)
│   │   ├── tsconfig.json               NEW (extends root, with paths)
│   │   ├── tailwind.config.ts          COPIED from root
│   │   ├── postcss.config.js           COPIED from root
│   │   └── src/
│   │       ├── main.tsx                COPIED from src/main.tsx
│   │       ├── index.css               COPIED from src/index.css
│   │       ├── App.tsx                 MODIFIED (admin routes removed)
│   │       ├── pages/                  COPIED (all except admin/)
│   │       ├── components/             COPIED (all except ui/ and admin/)
│   │       ├── hooks/                  COPIED (all except useAdminRole.ts)
│   │       ├── contexts/               COPIED (AuthContext.tsx, CartContext.tsx)
│   │       └── lib/                    COPIED (csvExport.ts, shareUtils.ts, productTaxonomy.ts)
│   │
│   ├── admin/                          NEW — admin.digihire.io
│   │   ├── index.html                  NEW
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts          COPIED from root
│   │   ├── postcss.config.js           COPIED from root
│   │   └── src/
│   │       ├── main.tsx                COPIED from src/main.tsx
│   │       ├── index.css               COPIED from src/index.css
│   │       ├── App.tsx                 NEW (admin routes only)
│   │       ├── pages/                  COPIED from src/pages/admin/
│   │       ├── components/             AdminLayout, AdminProtectedRoute, admin/
│   │       ├── hooks/                  use-toast.ts, use-mobile.tsx, useAdminRole.ts
│   │       └── contexts/               COPIED (AuthContext.tsx only)
│   │
│   └── pool/                           NEW — pool.digihire.io (scaffold)
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       └── src/
│           ├── main.tsx
│           ├── index.css               COPIED from src/index.css
│           ├── App.tsx
│           └── pages/
│               └── Dashboard.tsx       placeholder
│
├── supabase/                           UNCHANGED
├── index.html                          UNCHANGED (public landing)
├── about.html                          UNCHANGED
├── blog.html                           UNCHANGED
├── contact.html                        UNCHANGED
├── events.html                         UNCHANGED
└── voltsquad.html                      UNCHANGED
```

**Key design decision — zero import changes via Vite aliases:**
Each app's `vite.config.ts` defines aliases so existing `@/components/ui/*`, `@/lib/utils`, and `@/integrations/supabase/*` imports resolve to the shared packages transparently. No source file import paths change.

---

## Task 1: Install pnpm and configure workspace root

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`
- Modify: `package.json`
- Modify: `tsconfig.json`

- [ ] **Step 1: Check if pnpm is installed**

```bash
pnpm --version
```

If not found, install it:
```bash
npm install -g pnpm
```

Expected: prints a version like `9.x.x`

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: Create `.npmrc`**

```ini
shamefully-hoist=true
strict-peer-dependencies=false
```

`shamefully-hoist` prevents peer-dep resolution errors with Radix UI and other packages that expect React in the root node_modules.

- [ ] **Step 4: Replace root `package.json`**

The root package.json becomes the workspace coordinator. All runtime deps move to the individual apps.

```json
{
  "name": "digihire-monorepo",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev:voltsquad": "pnpm --filter @digihire/voltsquad dev",
    "dev:admin": "pnpm --filter @digihire/admin dev",
    "dev:pool": "pnpm --filter @digihire/pool dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  },
  "devDependencies": {
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 5: Update root `tsconfig.json` to be a base config only**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  }
}
```

- [ ] **Step 6: Delete old lockfile and node_modules, then install**

```bash
rm -rf node_modules package-lock.json
pnpm install
```

Expected: `pnpm-lock.yaml` is created at the root, `node_modules/` is rebuilt.

- [ ] **Step 7: Commit**

```bash
git add pnpm-workspace.yaml .npmrc package.json tsconfig.json pnpm-lock.yaml
git rm package-lock.json 2>/dev/null || true
git commit -m "chore: initialise pnpm workspace root"
```

---

## Task 2: Create `@digihire/supabase` package

**Files:**
- Create: `packages/supabase/package.json`
- Create: `packages/supabase/tsconfig.json`
- Move: `src/integrations/supabase/client.ts` → `packages/supabase/src/client.ts`
- Move: `src/integrations/supabase/types.ts` → `packages/supabase/src/types.ts`

- [ ] **Step 1: Create the package directory**

```bash
mkdir -p packages/supabase/src
```

- [ ] **Step 2: Create `packages/supabase/package.json`**

```json
{
  "name": "@digihire/supabase",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/client.ts",
    "./client": "./src/client.ts",
    "./types": "./src/types.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.98.0"
  }
}
```

- [ ] **Step 3: Create `packages/supabase/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "."
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Move Supabase source files**

```bash
mv src/integrations/supabase/client.ts packages/supabase/src/client.ts
mv src/integrations/supabase/types.ts packages/supabase/src/types.ts
rmdir src/integrations/supabase
rmdir src/integrations
```

- [ ] **Step 5: Install the new package into the workspace**

```bash
pnpm install
```

Expected: no errors. The package is recognised by pnpm.

- [ ] **Step 6: Commit**

```bash
git add packages/supabase/
git rm -r src/integrations/
git commit -m "chore: extract Supabase client into @digihire/supabase package"
```

---

## Task 3: Create `@digihire/ui` package

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Move: `src/components/ui/` → `packages/ui/src/components/`
- Move: `src/lib/utils.ts` → `packages/ui/src/lib/utils.ts`

- [ ] **Step 1: Create the package directory**

```bash
mkdir -p packages/ui/src/components packages/ui/src/lib
```

- [ ] **Step 2: Move shadcn components and utils**

```bash
cp -r src/components/ui/. packages/ui/src/components/
mv src/lib/utils.ts packages/ui/src/lib/utils.ts
```

Do NOT delete `src/components/ui/` yet — the root src/ still needs it until apps are set up.

- [ ] **Step 3: Create `packages/ui/package.json`**

```json
{
  "name": "@digihire/ui",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/components",
    "./*": "./src/components/*"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.462.0",
    "react-day-picker": "^8.10.1",
    "react-resizable-panels": "^2.1.9",
    "tailwind-merge": "^2.6.0",
    "vaul": "^0.9.9"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

- [ ] **Step 4: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/lib/utils": ["./src/lib/utils"],
      "@/components/ui/*": ["./src/components/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Install the new package**

```bash
pnpm install
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/
git commit -m "chore: extract shadcn components into @digihire/ui package"
```

---

## Task 4: Scaffold `apps/voltsquad`

**Files:**
- Create: `apps/voltsquad/` (full directory tree as described in file map)

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p apps/voltsquad/src/{pages/former,components/{landing,native,admin},hooks,contexts,lib}
```

- [ ] **Step 2: Copy source files**

```bash
# Config files
cp app.html apps/voltsquad/index.html
cp tailwind.config.ts apps/voltsquad/tailwind.config.ts
cp postcss.config.js apps/voltsquad/postcss.config.js

# Source root
cp src/main.tsx apps/voltsquad/src/main.tsx
cp src/index.css apps/voltsquad/src/index.css

# Pages (all non-admin)
cp src/pages/*.tsx apps/voltsquad/src/pages/
cp src/pages/former/LandingPage.tsx apps/voltsquad/src/pages/former/

# Components (all except ui/ and admin/)
cp src/components/*.tsx apps/voltsquad/src/components/
cp src/components/landing/*.tsx apps/voltsquad/src/components/landing/
cp src/components/native/*.tsx apps/voltsquad/src/components/native/

# Hooks (all except useAdminRole — that belongs to admin app)
cp src/hooks/*.tsx apps/voltsquad/src/hooks/ 2>/dev/null || true
cp src/hooks/*.ts apps/voltsquad/src/hooks/ 2>/dev/null || true
rm -f apps/voltsquad/src/hooks/useAdminRole.ts

# Contexts
cp src/contexts/*.tsx apps/voltsquad/src/contexts/

# Lib (utils stays in packages/ui; copy the rest)
cp src/lib/csvExport.ts apps/voltsquad/src/lib/
cp src/lib/shareUtils.ts apps/voltsquad/src/lib/
cp src/lib/productTaxonomy.ts apps/voltsquad/src/lib/
```

- [ ] **Step 3: Create `apps/voltsquad/package.json`**

```json
{
  "name": "@digihire/voltsquad",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@digihire/ui": "workspace:*",
    "@digihire/supabase": "workspace:*",
    "@capacitor/app": "^8.0.1",
    "@capacitor/camera": "^8.0.2",
    "@capacitor/clipboard": "^8.0.1",
    "@capacitor/core": "^8.2.0",
    "@capacitor/filesystem": "^8.1.2",
    "@capacitor/haptics": "^8.0.1",
    "@capacitor/keyboard": "^8.0.1",
    "@capacitor/network": "^8.0.1",
    "@capacitor/preferences": "^8.0.1",
    "@capacitor/share": "^8.0.1",
    "@capacitor/splash-screen": "^8.0.1",
    "@capacitor/status-bar": "^8.0.1",
    "@hookform/resolvers": "^3.10.0",
    "@tanstack/query-sync-storage-persister": "^5.90.24",
    "@tanstack/react-query": "^5.83.0",
    "@tanstack/react-query-persist-client": "^5.90.24",
    "date-fns": "^3.6.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-paystack": "^6.0.0",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@tailwindcss/typography": "^0.5.16",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "jsdom": "^20.0.3",
    "lovable-tagger": "^1.1.13",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.38.0",
    "vite": "^5.4.19",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 4: Create `apps/voltsquad/vite.config.ts`**

The aliases listed first take priority over the generic `@` alias. This is what allows existing `@/components/ui/*` imports to resolve to the shared package without changing any source files.

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" &&
      (await import("lovable-tagger")).componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: [
      // Shared packages — must be listed before the generic @ alias
      {
        find: "@/components/ui",
        replacement: path.resolve(__dirname, "../../packages/ui/src/components"),
      },
      {
        find: "@/lib/utils",
        replacement: path.resolve(__dirname, "../../packages/ui/src/lib/utils"),
      },
      {
        find: "@/integrations/supabase",
        replacement: path.resolve(__dirname, "../../packages/supabase/src"),
      },
      // Generic app alias — must come last
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
}));
```

- [ ] **Step 5: Create `apps/voltsquad/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/ui/*": ["../../packages/ui/src/components/*"],
      "@/lib/utils": ["../../packages/ui/src/lib/utils"],
      "@/integrations/supabase/*": ["../../packages/supabase/src/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src",
    "../../packages/ui/src",
    "../../packages/supabase/src"
  ]
}
```

- [ ] **Step 6: Create `apps/voltsquad/src/App.tsx`**

Open the root `src/App.tsx` and copy it to `apps/voltsquad/src/App.tsx`, then remove everything admin-related:

Lines/imports to **remove** from the copy:
- `import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";`
- `import { AdminLayout } from "@/components/AdminLayout";`
- All page imports that start with `import Admin` (AdminDashboard, AdminUsers, etc.)
- The entire block of routes wrapped in `<AdminProtectedRoute>` / `<AdminLayout>` (all `/admin/*` routes and `/admin/login`)

The resulting App.tsx keeps: QueryClient setup, ThemeProvider, AuthProvider, CartProvider, Capacitor setup, all public routes, and all protected dashboard routes.

- [ ] **Step 7: Install dependencies for the app**

```bash
pnpm install
```

- [ ] **Step 8: Start the dev server and verify it loads**

```bash
pnpm dev:voltsquad
```

Expected: Vite starts on port 8080. Open `http://localhost:8080` — the login page renders without console errors. Navigate to `/dashboard` (after logging in) and confirm the dashboard loads with correct styles.

- [ ] **Step 9: Commit**

```bash
git add apps/voltsquad/
git commit -m "feat: scaffold apps/voltsquad from existing dashboard src"
```

---

## Task 5: Scaffold `apps/admin`

**Files:**
- Create: `apps/admin/` (full directory tree)

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p apps/admin/src/{pages,components/admin,hooks,contexts}
```

- [ ] **Step 2: Copy admin source files**

```bash
# Config files
cp tailwind.config.ts apps/admin/tailwind.config.ts
cp postcss.config.js apps/admin/postcss.config.js

# Source root
cp src/main.tsx apps/admin/src/main.tsx
cp src/index.css apps/admin/src/index.css

# Admin pages (drop the admin/ path nesting — they become the root pages)
cp src/pages/admin/*.tsx apps/admin/src/pages/

# Admin-specific components
cp src/components/AdminLayout.tsx apps/admin/src/components/
cp src/components/AdminProtectedRoute.tsx apps/admin/src/components/
cp src/components/ThemeProvider.tsx apps/admin/src/components/
cp src/components/NavLink.tsx apps/admin/src/components/
cp src/components/admin/*.tsx apps/admin/src/components/admin/

# Hooks the admin app needs
cp src/hooks/use-toast.ts apps/admin/src/hooks/
cp src/hooks/use-mobile.tsx apps/admin/src/hooks/
cp src/hooks/useAdminRole.ts apps/admin/src/hooks/
cp src/hooks/useAdminData.ts apps/admin/src/hooks/
cp src/hooks/useAdminOrders.ts apps/admin/src/hooks/
cp src/hooks/useAdminReviews.ts apps/admin/src/hooks/
cp src/hooks/useAdminVerifications.ts apps/admin/src/hooks/
cp src/hooks/useAdminCampaigns.ts apps/admin/src/hooks/

# Auth context (admin still authenticates via Supabase)
cp src/contexts/AuthContext.tsx apps/admin/src/contexts/
```

- [ ] **Step 3: Create `apps/admin/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/assets/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DigiHire Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `apps/admin/package.json`**

```json
{
  "name": "@digihire/admin",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@digihire/ui": "workspace:*",
    "@digihire/supabase": "workspace:*",
    "@hookform/resolvers": "^3.10.0",
    "@tanstack/react-query": "^5.83.0",
    "date-fns": "^3.6.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.38.0",
    "vite": "^5.4.19"
  }
}
```

- [ ] **Step 5: Create `apps/admin/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@/components/ui",
        replacement: path.resolve(__dirname, "../../packages/ui/src/components"),
      },
      {
        find: "@/lib/utils",
        replacement: path.resolve(__dirname, "../../packages/ui/src/lib/utils"),
      },
      {
        find: "@/integrations/supabase",
        replacement: path.resolve(__dirname, "../../packages/supabase/src"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
```

- [ ] **Step 6: Create `apps/admin/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/ui/*": ["../../packages/ui/src/components/*"],
      "@/lib/utils": ["../../packages/ui/src/lib/utils"],
      "@/integrations/supabase/*": ["../../packages/supabase/src/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src",
    "../../packages/ui/src",
    "../../packages/supabase/src"
  ]
}
```

- [ ] **Step 7: Create `apps/admin/src/App.tsx`**

The admin app is a clean standalone SPA — no CartProvider, no Capacitor, no public product routes.

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminLayout } from "@/components/AdminLayout";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminProducts from "@/pages/AdminProducts";
import AdminSales from "@/pages/AdminSales";
import AdminPayouts from "@/pages/AdminPayouts";
import AdminTraining from "@/pages/AdminTraining";
import AdminReferrals from "@/pages/AdminReferrals";
import AdminLeaderboard from "@/pages/AdminLeaderboard";
import AdminReviews from "@/pages/AdminReviews";
import AdminVerification from "@/pages/AdminVerification";
import AdminOrders from "@/pages/AdminOrders";
import AdminCampaigns from "@/pages/AdminCampaigns";
import AdminCampaignMemberships from "@/pages/AdminCampaignMemberships";
import AdminCampaignEarnings from "@/pages/AdminCampaignEarnings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="digihire-admin-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="sales" element={<AdminSales />} />
                  <Route path="payouts" element={<AdminPayouts />} />
                  <Route path="training" element={<AdminTraining />} />
                  <Route path="referrals" element={<AdminReferrals />} />
                  <Route path="leaderboard" element={<AdminLeaderboard />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="verification" element={<AdminVerification />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="campaigns" element={<AdminCampaigns />} />
                  <Route path="campaigns/memberships" element={<AdminCampaignMemberships />} />
                  <Route path="campaigns/earnings" element={<AdminCampaignEarnings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

Also create `apps/admin/src/pages/NotFound.tsx`:
```tsx
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">404 — Page not found</p>
    </div>
  );
}
```

- [ ] **Step 8: Fix AdminLayout import paths**

The copied `AdminLayout.tsx` will import from `@/pages/admin/AdminLogin` etc. (old paths). Since admin pages are now at `@/pages/AdminLogin` (no `admin/` prefix), search for any such references:

```bash
grep -r "pages/admin/" apps/admin/src/ --include="*.tsx" -l
```

For each file found, remove the `admin/` segment from the import paths. The pages are now directly under `src/pages/`.

- [ ] **Step 9: Install and start**

```bash
pnpm install
pnpm dev:admin
```

Expected: Vite starts on port 8081. Open `http://localhost:8081` — the admin login page renders. Sign in with an admin account and verify the admin dashboard and at least one sub-page (e.g., Users) loads correctly.

- [ ] **Step 10: Commit**

```bash
git add apps/admin/
git commit -m "feat: scaffold apps/admin from existing admin pages"
```

---

## Task 6: Scaffold `apps/pool`

**Files:**
- Create: `apps/pool/` (full scaffold — no existing pages to move)

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p apps/pool/src/pages
```

- [ ] **Step 2: Create `apps/pool/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/assets/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DigiHire | Talent Pool</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Copy shared config files**

```bash
cp tailwind.config.ts apps/pool/tailwind.config.ts
cp postcss.config.js apps/pool/postcss.config.js
cp src/index.css apps/pool/src/index.css
```

- [ ] **Step 4: Create `apps/pool/package.json`**

```json
{
  "name": "@digihire/pool",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@digihire/ui": "workspace:*",
    "@digihire/supabase": "workspace:*",
    "@tanstack/react-query": "^5.83.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "sonner": "^1.7.4"
  },
  "devDependencies": {
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.8.3",
    "vite": "^5.4.19"
  }
}
```

- [ ] **Step 5: Create `apps/pool/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8082,
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@/components/ui",
        replacement: path.resolve(__dirname, "../../packages/ui/src/components"),
      },
      {
        find: "@/lib/utils",
        replacement: path.resolve(__dirname, "../../packages/ui/src/lib/utils"),
      },
      {
        find: "@/integrations/supabase",
        replacement: path.resolve(__dirname, "../../packages/supabase/src"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
```

- [ ] **Step 6: Create `apps/pool/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/ui/*": ["../../packages/ui/src/components/*"],
      "@/lib/utils": ["../../packages/ui/src/lib/utils"],
      "@/integrations/supabase/*": ["../../packages/supabase/src/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src",
    "../../packages/ui/src",
    "../../packages/supabase/src"
  ]
}
```

- [ ] **Step 7: Create `apps/pool/src/main.tsx`**

```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

- [ ] **Step 8: Create `apps/pool/src/App.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/Dashboard";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 9: Create `apps/pool/src/pages/Dashboard.tsx`**

```tsx
export default function Dashboard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Talent Pool</h1>
        <p className="mt-2 text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Install and start**

```bash
pnpm install
pnpm dev:pool
```

Expected: Vite starts on port 8082. Open `http://localhost:8082` — the "Talent Pool — Coming soon" placeholder renders with correct styling (dark background if system is dark mode).

- [ ] **Step 11: Commit**

```bash
git add apps/pool/
git commit -m "feat: scaffold apps/pool talent pool app"
```

---

## Task 7: Final cleanup and root Vite config

**Files:**
- Modify: `vite.config.ts` (root — strip out app-specific rewrites and entries)
- Delete: `src/components/ui/` (now lives in packages/ui)
- Delete: `src/integrations/` (now lives in packages/supabase)

- [ ] **Step 1: Verify all three apps build cleanly**

```bash
pnpm build
```

Expected: all three apps under `apps/` compile to their `dist/` directories without errors. Fix any import errors before proceeding.

- [ ] **Step 2: Update root `vite.config.ts` for static pages only**

The root Vite config no longer needs to serve the React app or the rewrite middleware. It now handles only the static HTML landing pages.

```ts
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "::",
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        about: "about.html",
        blog: "blog.html",
        contact: "contact.html",
        events: "events.html",
        voltsquad: "voltsquad.html",
      },
    },
  },
});
```

- [ ] **Step 3: Remove the now-redundant src/ directories**

Only remove directories that have been fully migrated:

```bash
# Remove ui components (now in packages/ui)
rm -rf src/components/ui

# Keep src/ alive for now — the root vite config no longer builds it
# but the directory is referenced by nothing critical
# Full src/ removal is a separate cleanup commit once all apps are verified in production
```

- [ ] **Step 4: Delete the empty `digihire/` folder** that was accidentally created earlier

```bash
rm -rf ../digihire
```

(Only run this if you confirmed the parent Projects directory contains an empty `digihire` folder created during the planning phase.)

- [ ] **Step 5: Final verification — start all three apps simultaneously**

Open three terminals:

```bash
# Terminal 1
pnpm dev:voltsquad   # → http://localhost:8080

# Terminal 2
pnpm dev:admin       # → http://localhost:8081

# Terminal 3
pnpm dev:pool        # → http://localhost:8082
```

Checklist:
- [ ] Voltsquad: login page loads, dashboard loads after auth, marketplace renders, sidebar navigation works
- [ ] Admin: login page loads, dashboard loads after admin auth, at least 3 sub-pages navigate correctly
- [ ] Pool: placeholder page loads with correct theme styles

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: complete monorepo restructuring — voltsquad, admin, pool apps + shared packages"
```

---

## Vercel Deployment Reference

After restructuring, configure three separate Vercel projects (or use a monorepo setup):

| Project | Root Directory | Build Command | Output Directory | Domain |
|---------|---------------|---------------|------------------|--------|
| digihire-voltsquad | `apps/voltsquad` | `pnpm build` | `dist` | `voltsquad.digihire.io` |
| digihire-admin | `apps/admin` | `pnpm build` | `dist` | `admin.digihire.io` |
| digihire-pool | `apps/pool` | `pnpm build` | `dist` | `pool.digihire.io` |
| digihire-web | `.` (root) | `vite build` | `dist` | `digihire.io` |

In each Vercel project settings: set **Framework Preset** to `Vite` and **Root Directory** to the path shown above. Add a `vercel.json` at the root of each app directory to enable SPA routing:

```json
{
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
}
```
