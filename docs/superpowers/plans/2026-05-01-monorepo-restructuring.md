# Digihire Multi-Domain Restructuring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Digihire monolith into an npm workspaces repo with five independently deployable Vite apps (`landing`, `voltsquad`, `talentpool`, `brands`, `admin`) sharing code via `@digihire/shared`.

**Architecture:** npm workspaces at the repo root. `packages/shared` exports the Supabase client, AuthContext, all shadcn UI components, and shared hooks as `@digihire/shared`. Each app under `apps/` has its own `package.json`, `vite.config.ts`, and `index.html`. Apps resolve `@digihire/shared` via a Vite alias pointing directly to the shared TypeScript source — no build step needed for the shared package. All apps sign out to `VITE_LANDING_URL` (`https://digihire.io`).

**Tech Stack:** npm workspaces, Vite 5, React 18, TypeScript 5, Tailwind CSS 3, shadcn/ui, Supabase JS v2, React Router v6, TanStack Query v5, Vercel (one project per app).

---

## File Map

```text
Digihire/
├── package.json                          MODIFY  — add workspaces + root scripts
├── tsconfig.json                         MODIFY  — strip paths/include, become base
├── tailwind.config.ts                    KEEP    — extended by each app
│
├── packages/
│   └── shared/                          NEW  @digihire/shared
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts                 barrel export
│           ├── integrations/supabase/
│           │   ├── client.ts            MOVED from src/integrations/supabase/client.ts
│           │   └── types.ts             MOVED from src/integrations/supabase/types.ts
│           ├── contexts/
│           │   ├── AuthContext.tsx      MOVED + sign-out redirect updated
│           │   └── CartContext.tsx      MOVED
│           ├── hooks/                   MOVED (hooks used by 2+ apps)
│           ├── components/
│           │   ├── ui/                  MOVED from src/components/ui/
│           │   └── auth/               NEW  role-tabbed login component
│           └── lib/                     MOVED from src/lib/
│
├── apps/
│   ├── landing/                         NEW
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html                   MOVED from root index.html
│   │   ├── about.html                   MOVED
│   │   ├── blog.html                    MOVED
│   │   ├── contact.html                 MOVED
│   │   ├── events.html                  MOVED
│   │   ├── voltsquad.html              MOVED
│   │   └── public/                      MOVED from root public/
│   │
│   ├── voltsquad/                       NEW  — current user dashboard
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html                   MOVED from app.html
│   │   └── src/
│   │       ├── main.tsx                 MOVED from src/main.tsx
│   │       ├── App.tsx                  MOVED + admin routes removed
│   │       ├── index.css
│   │       ├── pages/                   MOVED from src/pages/ (non-admin)
│   │       ├── components/              MOVED from src/components/ (non-admin, non-shared)
│   │       └── hooks/                   voltsquad-only hooks
│   │
│   ├── admin/                           NEW
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── index.css
│   │       ├── pages/                   MOVED from src/pages/admin/
│   │       ├── components/              MOVED from src/components/admin/ + AdminLayout etc.
│   │       └── hooks/                   MOVED from src/hooks/useAdmin*.ts
│   │
│   ├── talentpool/                      SCAFFOLD (pages TBD)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── index.css
│   │       └── pages/Login.tsx
│   │
│   └── brands/                          SCAFFOLD (pages TBD)
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── index.css
│           └── pages/Login.tsx
│
├── mobile/                              UNCHANGED
├── volt-africa/                         UNCHANGED
└── supabase/                            UNCHANGED
```

---

## Phase 1 — Workspace Foundation

### Task 1: Convert root `package.json` to npm workspaces

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update package.json**

Replace the `"name"` and `"scripts"` fields and add `"workspaces"`. Keep all existing `"dependencies"` and `"devDependencies"` in root — they hoist to root `node_modules` for all workspace packages to use.

```json
{
  "name": "digihire",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:landing":   "npm run dev   --workspace=apps/landing",
    "dev:voltsquad": "npm run dev   --workspace=apps/voltsquad",
    "dev:talentpool":"npm run dev   --workspace=apps/talentpool",
    "dev:brands":    "npm run dev   --workspace=apps/brands",
    "dev:admin":     "npm run dev   --workspace=apps/admin",
    "build:landing":   "npm run build --workspace=apps/landing",
    "build:voltsquad": "npm run build --workspace=apps/voltsquad",
    "build:talentpool":"npm run build --workspace=apps/talentpool",
    "build:brands":    "npm run build --workspace=apps/brands",
    "build:admin":     "npm run build --workspace=apps/admin",
    "build:all": "npm run build --workspaces --if-present"
  },
  "dependencies": {
    ... (keep all existing dependencies exactly as they are)
  },
  "devDependencies": {
    ... (keep all existing devDependencies exactly as they are)
  }
}
```

- [ ] **Step 2: Run install to initialise workspace**

```bash
npm install
```

Expected: no errors. A `node_modules/` symlink structure now supports workspaces.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: convert root to npm workspaces"
```

---

### Task 2: Update root `tsconfig.json` to a base config

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Read current tsconfig.json**

Open `tsconfig.json` and note the current contents.

- [ ] **Step 2: Strip app-specific fields, keep compiler options**

The root tsconfig becomes the base that each app's tsconfig extends. Remove `"include"`, `"exclude"`, `"paths"` (those go in each app's tsconfig). Keep all `"compilerOptions"`.

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
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

> Keep whatever compiler options are already in the file. The key change is removing `"include"` and `"paths"` from the root.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: convert root tsconfig to base config"
```

---

## Phase 2 — Shared Package

### Task 3: Scaffold `packages/shared`

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p packages/shared/src
```

- [ ] **Step 2: Create `packages/shared/package.json`**

```json
{
  "name": "@digihire/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

- [ ] **Step 3: Create `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `packages/shared/src/index.ts` (empty barrel for now)**

```typescript
// Populated in Task 8
export {};
```

- [ ] **Step 5: Run install to register the workspace package**

```bash
npm install
```

Expected: `node_modules/@digihire/shared` symlink now points to `packages/shared`.

- [ ] **Step 6: Commit**

```bash
git add packages/shared/
git commit -m "chore: scaffold @digihire/shared workspace package"
```

---

### Task 4: Move Supabase integration to shared

**Files:**
- Create: `packages/shared/src/integrations/supabase/client.ts`
- Create: `packages/shared/src/integrations/supabase/types.ts`

- [ ] **Step 1: Create directory**

```bash
mkdir -p packages/shared/src/integrations/supabase
```

- [ ] **Step 2: Copy `src/integrations/supabase/client.ts` to shared**

Copy the file verbatim — no import changes needed, it has no internal `@/` imports.

```bash
cp src/integrations/supabase/client.ts packages/shared/src/integrations/supabase/client.ts
cp src/integrations/supabase/types.ts packages/shared/src/integrations/supabase/types.ts
```

- [ ] **Step 3: Verify the client.ts has no `@/` imports**

Open `packages/shared/src/integrations/supabase/client.ts` and confirm all imports are from `@supabase/supabase-js` or `@capacitor/preferences` — no `@/` aliases.

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/integrations/
git commit -m "chore: move Supabase client to @digihire/shared"
```

---

### Task 5: Move `lib/` utilities to shared

**Files:**
- Create: `packages/shared/src/lib/utils.ts`
- Create: `packages/shared/src/lib/shareUtils.ts`
- Create: `packages/shared/src/lib/csvExport.ts`
- Create: `packages/shared/src/lib/productTaxonomy.ts`

- [ ] **Step 1: Copy lib files**

```bash
mkdir -p packages/shared/src/lib
cp src/lib/utils.ts packages/shared/src/lib/utils.ts
cp src/lib/shareUtils.ts packages/shared/src/lib/shareUtils.ts
cp src/lib/csvExport.ts packages/shared/src/lib/csvExport.ts
cp src/lib/productTaxonomy.ts packages/shared/src/lib/productTaxonomy.ts
```

- [ ] **Step 2: Fix any `@/` imports in lib files**

Open each file and replace `@/` with relative paths. `lib/` files typically have no internal `@/` imports, but verify.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/lib/
git commit -m "chore: move lib utilities to @digihire/shared"
```

---

### Task 6: Move UI components to shared

**Files:**
- Create: `packages/shared/src/components/ui/` (copy all ~50 files from `src/components/ui/`)

- [ ] **Step 1: Copy all shadcn UI components**

```bash
mkdir -p packages/shared/src/components/ui
cp src/components/ui/*.tsx packages/shared/src/components/ui/
```

- [ ] **Step 2: Fix internal `@/` imports in shared UI components**

Shadcn components import `cn` from `@/lib/utils` and occasionally import sibling components. In the shared package, `@/` doesn't exist — use relative paths instead.

Run this PowerShell replacement across all copied UI components:

```powershell
Get-ChildItem packages/shared/src/components/ui/*.tsx | ForEach-Object {
  (Get-Content $_.FullName -Raw) `
    -replace 'from "@/lib/utils"', 'from "../../lib/utils"' `
    -replace "from '@/lib/utils'", "from '../../lib/utils'" `
    -replace 'from "@/components/ui/', 'from "./' `
    -replace "from '@/components/ui/", "from './" |
  Set-Content $_.FullName
}
```

- [ ] **Step 3: Manually verify one component**

Open `packages/shared/src/components/ui/button.tsx`. It should have `from "../../lib/utils"` — not `from "@/lib/utils"`.

- [ ] **Step 4: Move `ThemeProvider` to shared**

```bash
cp src/components/ThemeProvider.tsx packages/shared/src/components/ThemeProvider.tsx
```

Run the same PowerShell replacement on it to fix any `@/components/ui/` imports to relative paths.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/components/
git commit -m "chore: move shadcn UI components and ThemeProvider to @digihire/shared"
```

---

### Task 7: Move shared hooks to shared

**Files:**
- Create: `packages/shared/src/hooks/` (hooks used by 2+ apps)

Hooks that go to shared (used across apps or likely to be):
`useProfile`, `useWallet`, `useNotifications`, `useTransactions`, `useCampaigns`, `useReferrals`, `useSales`, `useTraining`, `useProducts`, `useProduct`, `useReviews`, `use-mobile`, `useCountUp`, `use-toast`

Hooks that stay in `apps/voltsquad/src/hooks/` (voltsquad-only):
`useSellerShop`, `useLeaderboard`, `usePullToRefresh`, `useModalBackHandler`

- [ ] **Step 1: Copy shared hooks**

```bash
mkdir -p packages/shared/src/hooks
cp src/hooks/useProfile.ts packages/shared/src/hooks/
cp src/hooks/useWallet.ts packages/shared/src/hooks/
cp src/hooks/useNotifications.ts packages/shared/src/hooks/
cp src/hooks/useTransactions.ts packages/shared/src/hooks/
cp src/hooks/useCampaigns.ts packages/shared/src/hooks/
cp src/hooks/useReferrals.ts packages/shared/src/hooks/
cp src/hooks/useSales.ts packages/shared/src/hooks/
cp src/hooks/useTraining.ts packages/shared/src/hooks/
cp src/hooks/useProducts.ts packages/shared/src/hooks/
cp src/hooks/useProduct.ts packages/shared/src/hooks/
cp src/hooks/useReviews.ts packages/shared/src/hooks/
cp src/hooks/use-mobile.tsx packages/shared/src/hooks/
cp src/hooks/useCountUp.ts packages/shared/src/hooks/
cp src/hooks/use-toast.ts packages/shared/src/hooks/
```

- [ ] **Step 2: Fix `@/` imports in all copied hooks**

All hooks import from `@/integrations/supabase/client`. Replace with relative path:

```powershell
Get-ChildItem packages/shared/src/hooks/* | ForEach-Object {
  (Get-Content $_.FullName -Raw) `
    -replace 'from "@/integrations/supabase/client"', 'from "../integrations/supabase/client"' `
    -replace "from '@/integrations/supabase/client'", "from '../integrations/supabase/client'" `
    -replace 'from "@/lib/', 'from "../lib/' `
    -replace "from '@/lib/", "from '../lib/" |
  Set-Content $_.FullName
}
```

- [ ] **Step 3: Verify one hook manually**

Open `packages/shared/src/hooks/useProfile.ts`. Confirm it imports from `"../integrations/supabase/client"` not `"@/integrations/supabase/client"`.

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/hooks/
git commit -m "chore: move shared hooks to @digihire/shared"
```

---

### Task 8: Move contexts to shared (with sign-out redirect)

**Files:**
- Create: `packages/shared/src/contexts/AuthContext.tsx` (modified)
- Create: `packages/shared/src/contexts/CartContext.tsx`

This task has the only **behaviour change** in Phase 2: `signOut` redirects to `VITE_LANDING_URL` instead of staying in the app.

- [ ] **Step 1: Copy CartContext with import fix**

```bash
mkdir -p packages/shared/src/contexts
cp src/contexts/CartContext.tsx packages/shared/src/contexts/CartContext.tsx
```

Fix imports in CartContext:

```powershell
(Get-Content packages/shared/src/contexts/CartContext.tsx -Raw) `
  -replace 'from "@/integrations/supabase/client"', 'from "../integrations/supabase/client"' `
  -replace 'from "@/components/ui/', 'from "../components/ui/' `
  -replace 'from "@/lib/', 'from "../lib/' |
Set-Content packages/shared/src/contexts/CartContext.tsx
```

- [ ] **Step 2: Create modified AuthContext in shared**

Copy `src/contexts/AuthContext.tsx` to `packages/shared/src/contexts/AuthContext.tsx` and apply these two changes:

**Change 1** — fix the `@/` import at the top:
```typescript
// OLD
import { supabase } from "@/integrations/supabase/client";

// NEW
import { supabase } from "../integrations/supabase/client";
```

**Change 2** — update `signOut` to redirect to landing URL on web:
```typescript
// OLD
const signOut = async (options?: { skipRedirect?: boolean }) => {
  if (options?.skipRedirect) {
    intentionalSignOut.current = true;
  }
  await supabase.auth.signOut();
  intentionalSignOut.current = false;
  if (Capacitor.isNativePlatform() && !options?.skipRedirect) {
    window.location.href = "/";
  }
};

// NEW
const signOut = async (options?: { skipRedirect?: boolean }) => {
  if (options?.skipRedirect) {
    intentionalSignOut.current = true;
  }
  await supabase.auth.signOut();
  intentionalSignOut.current = false;
  if (!options?.skipRedirect) {
    if (Capacitor.isNativePlatform()) {
      window.location.href = "/";
    } else {
      window.location.href = import.meta.env.VITE_LANDING_URL ?? "https://digihire.io";
    }
  }
};
```

**Change 3** — update the `onAuthStateChange` SIGNED_OUT redirect:
```typescript
// OLD
if (event === "SIGNED_OUT" && !intentionalSignOut.current) {
  window.location.replace("/login");
}

// NEW
if (event === "SIGNED_OUT" && !intentionalSignOut.current) {
  if (Capacitor.isNativePlatform()) {
    window.location.replace("/login");
  } else {
    window.location.replace(import.meta.env.VITE_LANDING_URL ?? "https://digihire.io");
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/contexts/
git commit -m "chore: move contexts to @digihire/shared, redirect sign-out to landing URL"
```

---

### Task 9: Populate the shared barrel export

**Files:**
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Write the barrel export**

```typescript
// Supabase
export { supabase } from "./integrations/supabase/client";
export type { Database } from "./integrations/supabase/types";

// Contexts + Theme
export { AuthProvider, useAuth } from "./contexts/AuthContext";
export { CartProvider, useCart } from "./contexts/CartContext";
export { ThemeProvider } from "./components/ThemeProvider";

// Hooks
export { useProfile } from "./hooks/useProfile";
export { useWallet } from "./hooks/useWallet";
export { useNotifications } from "./hooks/useNotifications";
export { useTransactions } from "./hooks/useTransactions";
export { useCampaigns } from "./hooks/useCampaigns";
export { useReferrals } from "./hooks/useReferrals";
export { useSales } from "./hooks/useSales";
export { useTraining } from "./hooks/useTraining";
export { useProducts } from "./hooks/useProducts";
export { useProduct } from "./hooks/useProduct";
export { useReviews } from "./hooks/useReviews";
export { useMobile } from "./hooks/use-mobile";
export { useCountUp } from "./hooks/useCountUp";
export { useToast, toast } from "./hooks/use-toast";

// Lib
export { cn } from "./lib/utils";
export * from "./lib/shareUtils";
export * from "./lib/csvExport";
export * from "./lib/productTaxonomy";

// UI components — named re-exports so consumers import from "@digihire/shared"
export { Button, buttonVariants } from "./components/ui/button";
export { Input } from "./components/ui/input";
export { Label } from "./components/ui/label";
export { Badge, badgeVariants } from "./components/ui/badge";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./components/ui/card";
export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./components/ui/dialog";
export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./components/ui/sheet";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from "./components/ui/select";
export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from "./components/ui/form";
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./components/ui/table";
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";
export { Separator } from "./components/ui/separator";
export { Skeleton } from "./components/ui/skeleton";
export { Toaster } from "./components/ui/toaster";
export { Toaster as Sonner } from "./components/ui/sonner";
export { Progress } from "./components/ui/progress";
export { Switch } from "./components/ui/switch";
export { Textarea } from "./components/ui/textarea";
export { Checkbox } from "./components/ui/checkbox";
export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
export { Slider } from "./components/ui/slider";
export { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from "./components/ui/dropdown-menu";
export { Popover, PopoverTrigger, PopoverContent } from "./components/ui/popover";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./components/ui/tooltip";
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from "./components/ui/command";
export { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "./components/ui/alert-dialog";
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/ui/accordion";
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./components/ui/collapsible";
export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from "./components/ui/drawer";
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "./components/ui/input-otp";
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./components/ui/pagination";
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./components/ui/hover-card";
export { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarPortal, MenubarSubContent, MenubarSubTrigger, MenubarGroup, MenubarSub, MenubarShortcut } from "./components/ui/menubar";
export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle } from "./components/ui/navigation-menu";
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar } from "./components/ui/sidebar";
export { Calendar } from "./components/ui/calendar";
export { DatePickerWithRange } from "./components/ui/date-range-picker";
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from "./components/ui/chart";
export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./components/ui/carousel";
export { AspectRatio } from "./components/ui/aspect-ratio";
export { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./components/ui/resizable";
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "./components/ui/context-menu";
export { Toggle, toggleVariants } from "./components/ui/toggle";
export { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./components/ui/breadcrumb";
```

> **Note:** If any of these component files do not exist in your `src/components/ui/`, remove that line from the barrel. Run `ls packages/shared/src/components/ui/` to get the actual file list.

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/index.ts
git commit -m "chore: populate @digihire/shared barrel export"
```

---

## Phase 3 — App Scaffolds

### Task 10: Scaffold `apps/voltsquad`

**Files:**
- Create: `apps/voltsquad/package.json`
- Create: `apps/voltsquad/tsconfig.json`
- Create: `apps/voltsquad/vite.config.ts`
- Create: `apps/voltsquad/index.html`

- [ ] **Step 1: Create directories**

```bash
mkdir -p apps/voltsquad/src
```

- [ ] **Step 2: Create `apps/voltsquad/package.json`**

```json
{
  "name": "@digihire/voltsquad",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@digihire/shared": "*"
  }
}
```

- [ ] **Step 3: Create `apps/voltsquad/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*":               ["./src/*"],
      "@digihire/shared":  ["../../packages/shared/src/index.ts"],
      "@digihire/shared/*":["../../packages/shared/src/*"]
    }
  },
  "include": ["src", "../../packages/shared/src"]
}
```

- [ ] **Step 4: Create `apps/voltsquad/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "::",
    port: 8081,
    hmr: { overlay: false },
  },
  resolve: {
    alias: {
      "@":              path.resolve(__dirname, "./src"),
      "@digihire/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
});
```

- [ ] **Step 5: Copy `app.html` from root as `apps/voltsquad/index.html`**

```bash
cp app.html apps/voltsquad/index.html
```

Then update the `<script>` tag inside it to point to `./src/main.tsx`:

```html
<!-- Change this line -->
<script type="module" src="/src/main.tsx"></script>
<!-- To: -->
<script type="module" src="/src/main.tsx"></script>
```

(Path stays the same — Vite serves from the app root.)

- [ ] **Step 6: Commit**

```bash
git add apps/voltsquad/
git commit -m "chore: scaffold apps/voltsquad"
```

---

### Task 11: Scaffold `apps/admin`

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/vite.config.ts`
- Create: `apps/admin/index.html`

- [ ] **Step 1: Create directories**

```bash
mkdir -p apps/admin/src
```

- [ ] **Step 2: Create `apps/admin/package.json`**

```json
{
  "name": "@digihire/admin",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@digihire/shared": "*"
  }
}
```

- [ ] **Step 3: Create `apps/admin/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*":               ["./src/*"],
      "@digihire/shared":  ["../../packages/shared/src/index.ts"],
      "@digihire/shared/*":["../../packages/shared/src/*"]
    }
  },
  "include": ["src", "../../packages/shared/src"]
}
```

- [ ] **Step 4: Create `apps/admin/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "::",
    port: 8082,
    hmr: { overlay: false },
  },
  resolve: {
    alias: {
      "@":              path.resolve(__dirname, "./src"),
      "@digihire/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  base: "/admin/",
});
```

> `base: "/admin/"` ensures assets are requested from `/admin/` when deployed under `digihire.io/admin`.

- [ ] **Step 5: Create `apps/admin/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Digihire Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add apps/admin/
git commit -m "chore: scaffold apps/admin"
```

---

### Task 12: Scaffold `apps/landing`

**Files:**
- Create: `apps/landing/package.json`
- Create: `apps/landing/vite.config.ts`

The landing app is a **Vite multi-page app** (multiple HTML files, no React SPA). The HTML files are moved verbatim.

- [ ] **Step 1: Create directory**

```bash
mkdir -p apps/landing/public
```

- [ ] **Step 2: Create `apps/landing/package.json`**

```json
{
  "name": "@digihire/landing",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 3: Create `apps/landing/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions: {
      input: {
        main:      path.resolve(__dirname, "index.html"),
        about:     path.resolve(__dirname, "about.html"),
        blog:      path.resolve(__dirname, "blog.html"),
        contact:   path.resolve(__dirname, "contact.html"),
        events:    path.resolve(__dirname, "events.html"),
        voltsquad: path.resolve(__dirname, "voltsquad.html"),
      },
    },
  },
});
```

- [ ] **Step 4: Move HTML files and public assets**

```bash
cp index.html    apps/landing/index.html
cp about.html    apps/landing/about.html
cp blog.html     apps/landing/blog.html
cp contact.html  apps/landing/contact.html
cp events.html   apps/landing/events.html
cp voltsquad.html apps/landing/voltsquad.html
cp -r public/*   apps/landing/public/
```

- [ ] **Step 5: Commit**

```bash
git add apps/landing/
git commit -m "chore: scaffold apps/landing and move marketing HTML files"
```

---

### Task 13: Scaffold `apps/talentpool`

**Files:**
- Create: `apps/talentpool/package.json`
- Create: `apps/talentpool/tsconfig.json`
- Create: `apps/talentpool/vite.config.ts`
- Create: `apps/talentpool/index.html`
- Create: `apps/talentpool/src/main.tsx`
- Create: `apps/talentpool/src/App.tsx`
- Create: `apps/talentpool/src/index.css`
- Create: `apps/talentpool/src/pages/Login.tsx`

- [ ] **Step 1: Create directories**

```bash
mkdir -p apps/talentpool/src/pages
```

- [ ] **Step 2: Create `apps/talentpool/package.json`**

```json
{
  "name": "@digihire/talentpool",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@digihire/shared": "*"
  }
}
```

- [ ] **Step 3: Create `apps/talentpool/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*":               ["./src/*"],
      "@digihire/shared":  ["../../packages/shared/src/index.ts"],
      "@digihire/shared/*":["../../packages/shared/src/*"]
    }
  },
  "include": ["src", "../../packages/shared/src"]
}
```

- [ ] **Step 4: Create `apps/talentpool/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "::",
    port: 8083,
    hmr: { overlay: false },
  },
  resolve: {
    alias: {
      "@":              path.resolve(__dirname, "./src"),
      "@digihire/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
});
```

- [ ] **Step 5: Create `apps/talentpool/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Digihire Talent Pool</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `apps/talentpool/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Create `apps/talentpool/src/main.tsx`**

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 8: Create `apps/talentpool/src/pages/Login.tsx`**

Talentpool login defaults the tab to the `talent` role. Reuses `AuthProvider` from shared. The actual `AuthLogin` shared component is built in Task 16 — for now, render a placeholder:

```typescript
import { AuthProvider } from "@digihire/shared";

export default function Login() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Talent Pool login — coming soon</p>
      </div>
    </AuthProvider>
  );
}
```

- [ ] **Step 9: Create `apps/talentpool/src/App.tsx`**

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 10: Create `apps/talentpool/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";
import baseConfig from "../../tailwind.config";

export default {
  ...baseConfig,
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
} satisfies Config;
```

- [ ] **Step 11: Commit**

```bash
git add apps/talentpool/
git commit -m "chore: scaffold apps/talentpool"
```

---

### Task 14: Scaffold `apps/brands`

Follow the exact same steps as Task 13 but with `brands` substituted for `talentpool`, port `8084`, and `"Digihire Brands"` as the HTML title.

- [ ] **Step 1:** `mkdir -p apps/brands/src/pages`
- [ ] **Step 2:** Create `apps/brands/package.json` (same as talentpool, name `@digihire/brands`)
- [ ] **Step 3:** Create `apps/brands/tsconfig.json` (identical to talentpool)
- [ ] **Step 4:** Create `apps/brands/vite.config.ts` (port `8084`)
- [ ] **Step 5:** Create `apps/brands/index.html` (title `"Digihire Brands"`)
- [ ] **Step 6:** Create `apps/brands/src/index.css` (identical to talentpool)
- [ ] **Step 7:** Create `apps/brands/src/main.tsx` (identical to talentpool)
- [ ] **Step 8:** Create `apps/brands/src/pages/Login.tsx` (placeholder, same pattern as talentpool)
- [ ] **Step 9:** Create `apps/brands/src/App.tsx` (identical to talentpool)
- [ ] **Step 10:** Create `apps/brands/tailwind.config.ts` (identical to talentpool)
- [ ] **Step 11: Commit**

```bash
git add apps/brands/
git commit -m "chore: scaffold apps/brands"
```

---

## Phase 4 — Migrate Source Code Into Apps

### Task 15: Migrate voltsquad source code

**Files:**
- Create: `apps/voltsquad/src/main.tsx`
- Create: `apps/voltsquad/src/App.tsx`
- Create: `apps/voltsquad/src/index.css`
- Create: `apps/voltsquad/src/pages/` (all non-admin pages)
- Create: `apps/voltsquad/src/components/` (non-admin, non-shared components)
- Create: `apps/voltsquad/src/hooks/` (voltsquad-only hooks)

- [ ] **Step 1: Copy main.tsx and index.css**

```bash
cp src/main.tsx apps/voltsquad/src/main.tsx
cp src/index.css apps/voltsquad/src/index.css
```

- [ ] **Step 2: Copy all non-admin pages**

```bash
mkdir -p apps/voltsquad/src/pages/former
cp src/pages/Index.tsx            apps/voltsquad/src/pages/
cp src/pages/Dashboard.tsx        apps/voltsquad/src/pages/
cp src/pages/Marketplace.tsx      apps/voltsquad/src/pages/
cp src/pages/WalletPage.tsx       apps/voltsquad/src/pages/
cp src/pages/Calculator.tsx       apps/voltsquad/src/pages/
cp src/pages/Referrals.tsx        apps/voltsquad/src/pages/
cp src/pages/Sales.tsx            apps/voltsquad/src/pages/
cp src/pages/Leaderboard.tsx      apps/voltsquad/src/pages/
cp src/pages/Training.tsx         apps/voltsquad/src/pages/
cp src/pages/TrainingCourse.tsx   apps/voltsquad/src/pages/
cp src/pages/Profile.tsx          apps/voltsquad/src/pages/
cp src/pages/ProductPage.tsx      apps/voltsquad/src/pages/
cp src/pages/SellerShop.tsx       apps/voltsquad/src/pages/
cp src/pages/Checkout.tsx         apps/voltsquad/src/pages/
cp src/pages/OrderConfirmation.tsx apps/voltsquad/src/pages/
cp src/pages/BuyerOrders.tsx      apps/voltsquad/src/pages/
cp src/pages/Login.tsx            apps/voltsquad/src/pages/
cp src/pages/ForgotPassword.tsx   apps/voltsquad/src/pages/
cp src/pages/ResetPassword.tsx    apps/voltsquad/src/pages/
cp src/pages/AboutStudents.tsx    apps/voltsquad/src/pages/
cp src/pages/AboutBrands.tsx      apps/voltsquad/src/pages/
cp src/pages/NotFound.tsx         apps/voltsquad/src/pages/
cp src/pages/Campaigns.tsx        apps/voltsquad/src/pages/
cp src/pages/CampaignDetail.tsx   apps/voltsquad/src/pages/
cp src/pages/MyCampaigns.tsx      apps/voltsquad/src/pages/
cp src/pages/DigiHireSalesActivations.tsx apps/voltsquad/src/pages/
cp src/pages/former/LandingPage.tsx apps/voltsquad/src/pages/former/
```

- [ ] **Step 3: Copy voltsquad-specific components (non-admin, non-shared)**

```bash
mkdir -p apps/voltsquad/src/components/ui
mkdir -p apps/voltsquad/src/components/native
mkdir -p apps/voltsquad/src/components/landing

cp src/components/AppSidebar.tsx         apps/voltsquad/src/components/
cp src/components/DashboardLayout.tsx    apps/voltsquad/src/components/
cp src/components/ProtectedRoute.tsx     apps/voltsquad/src/components/
cp src/components/PublicProductLayout.tsx apps/voltsquad/src/components/
cp src/components/LandingNavbar.tsx      apps/voltsquad/src/components/
cp src/components/MobileBottomNav.tsx    apps/voltsquad/src/components/
cp src/components/NotificationsPopover.tsx apps/voltsquad/src/components/
cp src/components/CartDrawer.tsx         apps/voltsquad/src/components/
cp src/components/ImageLightbox.tsx      apps/voltsquad/src/components/
cp src/components/KYCModal.tsx           apps/voltsquad/src/components/
cp src/components/MfaSetup.tsx           apps/voltsquad/src/components/
cp src/components/MfaVerification.tsx    apps/voltsquad/src/components/
cp src/components/OnboardingWalkthrough.tsx apps/voltsquad/src/components/
cp src/components/OtpVerification.tsx    apps/voltsquad/src/components/
cp src/components/ProductDetailSheet.tsx apps/voltsquad/src/components/
cp src/components/RequestPayoutDialog.tsx apps/voltsquad/src/components/
cp src/components/ReviewPrompt.tsx       apps/voltsquad/src/components/
cp src/components/ReviewSection.tsx      apps/voltsquad/src/components/
cp src/components/SharePopover.tsx       apps/voltsquad/src/components/
cp src/components/SignupBonusDialog.tsx  apps/voltsquad/src/components/
cp src/components/ThemeProvider.tsx      apps/voltsquad/src/components/
cp src/components/ThemeToggle.tsx        apps/voltsquad/src/components/
cp src/components/native/*.tsx           apps/voltsquad/src/components/native/
cp src/components/landing/*.tsx          apps/voltsquad/src/components/landing/
```

- [ ] **Step 4: Copy voltsquad-only hooks**

```bash
mkdir -p apps/voltsquad/src/hooks
cp src/hooks/useSellerShop.ts      apps/voltsquad/src/hooks/
cp src/hooks/useLeaderboard.ts     apps/voltsquad/src/hooks/
cp src/hooks/usePullToRefresh.ts   apps/voltsquad/src/hooks/
cp src/hooks/useModalBackHandler.ts apps/voltsquad/src/hooks/
```

- [ ] **Step 5: Copy data and assets**

```bash
mkdir -p apps/voltsquad/src/data apps/voltsquad/src/assets
cp src/data/mockData.ts      apps/voltsquad/src/data/
cp -r src/assets/*           apps/voltsquad/src/assets/
```

- [ ] **Step 6: Fix `@/` imports that reference shared code in all copied voltsquad files**

In `apps/voltsquad/src/`, files importing from `@/components/ui/`, `@/contexts/`, `@/integrations/supabase/`, `@/lib/`, or shared hooks need to import from `@digihire/shared` instead.

Run this PowerShell replacement across all copied voltsquad source:

```powershell
$files = Get-ChildItem -Path apps/voltsquad/src -Recurse -Include *.ts,*.tsx

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw

  # Shared imports → @digihire/shared
  $content = $content -replace 'from "@/components/ui/[^"]*"', 'from "@digihire/shared"'
  $content = $content -replace "from '@/components/ui/[^']*'", "from '@digihire/shared'"
  $content = $content -replace 'from "@/contexts/AuthContext"', 'from "@digihire/shared"'
  $content = $content -replace 'from "@/contexts/CartContext"', 'from "@digihire/shared"'
  $content = $content -replace 'from "@/integrations/supabase/client"', 'from "@digihire/shared"'
  $content = $content -replace 'from "@/integrations/supabase/types"', 'from "@digihire/shared"'
  $content = $content -replace 'from "@/lib/utils"', 'from "@digihire/shared"'
  $content = $content -replace 'from "@/lib/shareUtils"', 'from "@digihire/shared"'
  $content = $content -replace 'from "@/lib/csvExport"', 'from "@digihire/shared"'
  $content = $content -replace 'from "@/lib/productTaxonomy"', 'from "@digihire/shared"'

  Set-Content $file.FullName $content
}
```

> **Note:** This replaces named imports like `import { Button } from "@/components/ui/button"` with `import { Button } from "@digihire/shared"`. Since the barrel re-exports everything, this works correctly. Verify a few files manually after running.

- [ ] **Step 7: Create `apps/voltsquad/src/App.tsx`**

This is the current `src/App.tsx` with admin routes removed. Copy `src/App.tsx` to `apps/voltsquad/src/App.tsx`, then remove these route blocks:

```typescript
// REMOVE these routes from apps/voltsquad/src/App.tsx:
// <Route path="/admin/login" element={<AdminLogin />} />
// <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
//   ... all /admin/* routes
// </Route>

// REMOVE these imports:
// import AdminLayout from ...
// import AdminProtectedRoute from ...
// import AdminDashboard, AdminUsers, AdminProducts, ... from @/pages/admin/...
```

Also update all `@/` imports in the file using the same PowerShell pattern from Step 6.

- [ ] **Step 8: Create `apps/voltsquad/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";
import baseConfig from "../../tailwind.config";

export default {
  ...baseConfig,
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
} satisfies Config;
```

- [ ] **Step 9: Try to build voltsquad**

```bash
npm run build:voltsquad
```

Expected: TypeScript and Vite compilation succeeds. Fix any import errors that appear — they will be `@/` paths that weren't caught by the bulk replacement (e.g. hook imports that are shared). Address each error individually by changing the import to `@digihire/shared` or keeping it as `@/` if it refers to a voltsquad-local file.

- [ ] **Step 10: Run voltsquad dev server and verify it loads**

```bash
npm run dev:voltsquad
```

Open `http://localhost:8081` in a browser. The app should load the login page without console errors.

- [ ] **Step 11: Commit**

```bash
git add apps/voltsquad/
git commit -m "feat: migrate voltsquad app source into apps/voltsquad"
```

---

### Task 16: Migrate admin source code

**Files:**
- Create: `apps/admin/src/main.tsx`
- Create: `apps/admin/src/App.tsx`
- Create: `apps/admin/src/index.css`
- Create: `apps/admin/src/pages/` (from `src/pages/admin/`)
- Create: `apps/admin/src/components/` (from `src/components/admin/` + AdminLayout etc.)
- Create: `apps/admin/src/hooks/` (from `src/hooks/useAdmin*.ts`)

- [ ] **Step 1: Copy admin pages**

```bash
mkdir -p apps/admin/src/pages
cp src/pages/admin/*.tsx apps/admin/src/pages/
```

- [ ] **Step 2: Copy admin-specific components**

```bash
mkdir -p apps/admin/src/components
cp src/components/admin/*.tsx         apps/admin/src/components/
cp src/components/AdminLayout.tsx     apps/admin/src/components/
cp src/components/AdminProtectedRoute.tsx apps/admin/src/components/
```

- [ ] **Step 3: Copy admin hooks**

```bash
mkdir -p apps/admin/src/hooks
cp src/hooks/useAdmin*.ts  apps/admin/src/hooks/
cp src/hooks/useAdminCampaigns.ts apps/admin/src/hooks/
```

- [ ] **Step 4: Create `apps/admin/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Create `apps/admin/src/main.tsx`**

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 6: Create `apps/admin/src/App.tsx`**

Copy only the admin-related portion of `src/App.tsx`. The admin app needs its own providers and only the `/admin/*` routes (served at `/` within the admin app, since Vercel rewrites `/admin/*` → this app):

```typescript
import { Toaster } from "@digihire/shared";
import { Toaster as Sonner } from "@digihire/shared";
import { TooltipProvider } from "@digihire/shared";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@digihire/shared";
import { AuthProvider } from "@digihire/shared";
import AdminLayout from "@/components/AdminLayout";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 86400000, staleTime: 300000 } },
});

const persister = createSyncStoragePersister({ storage: window.localStorage });

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename="/admin">
              <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/products" element={<AdminProducts />} />
                  <Route path="/sales" element={<AdminSales />} />
                  <Route path="/payouts" element={<AdminPayouts />} />
                  <Route path="/training" element={<AdminTraining />} />
                  <Route path="/referrals" element={<AdminReferrals />} />
                  <Route path="/leaderboard" element={<AdminLeaderboard />} />
                  <Route path="/reviews" element={<AdminReviews />} />
                  <Route path="/verification" element={<AdminVerification />} />
                  <Route path="/orders" element={<AdminOrders />} />
                  <Route path="/campaigns" element={<AdminCampaigns />} />
                  <Route path="/campaigns/memberships" element={<AdminCampaignMemberships />} />
                  <Route path="/campaigns/earnings" element={<AdminCampaignEarnings />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
```

> Note `basename="/admin"` on BrowserRouter — this makes React Router aware the app is mounted at `/admin`.

- [ ] **Step 7: Fix `@/` imports in all admin files**

Run the same PowerShell replacement from Task 15 Step 6 on `apps/admin/src/`.

- [ ] **Step 8: Create `apps/admin/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";
import baseConfig from "../../tailwind.config";

export default {
  ...baseConfig,
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
} satisfies Config;
```

- [ ] **Step 9: Build admin and fix errors**

```bash
npm run build:admin
```

Fix any remaining import errors. Expected: clean build.

- [ ] **Step 10: Commit**

```bash
git add apps/admin/
git commit -m "feat: migrate admin source into apps/admin"
```

---

### Task 17: Build and smoke-test landing

- [ ] **Step 1: Build landing**

```bash
npm run build:landing
```

Expected: Vite processes all 6 HTML files into `apps/landing/dist/`. No errors.

- [ ] **Step 2: Preview landing**

```bash
cd apps/landing && npx vite preview
```

Open `http://localhost:4173` in a browser. The marketing home page should load.

- [ ] **Step 3: Commit if changes were needed**

```bash
git add apps/landing/
git commit -m "feat: migrate landing HTML files into apps/landing"
```

---

## Phase 5 — Cleanup

### Task 18: Remove old root `src/` directory and root HTML files

> Only do this after all apps build successfully (Tasks 15-17).

- [ ] **Step 1: Verify all apps build**

```bash
npm run build:voltsquad && npm run build:admin && npm run build:landing
```

All three must succeed before proceeding.

- [ ] **Step 2: Remove old source**

```bash
rm -rf src/
rm -f app.html index.html about.html blog.html contact.html events.html voltsquad.html
rm -f vite.config.ts tsconfig.app.json
```

- [ ] **Step 3: Verify workspace still installs**

```bash
npm install
```

- [ ] **Step 4: Run a final build of all apps**

```bash
npm run build:all
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old src/ and root HTML files after migration"
```

---

## Phase 6 — Vercel Deployment Configuration

### Task 19: Create per-app Vercel configuration

Each Vercel project is configured with:
- **Root Directory:** the `apps/<name>` folder
- **Build Command:** `cd ../.. && npm install && npm run build --workspace=apps/<name>`
- **Output Directory:** `apps/<name>/dist`
- **Install Command:** (leave empty — handled by build command)

- [ ] **Step 1: Create `apps/voltsquad/vercel.json`**

```json
{
  "rewrites": [
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 2: Create `apps/admin/vercel.json`**

```json
{
  "rewrites": [
    { "source": "/admin/((?!assets/).*)", "destination": "/admin/index.html" },
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 3: Create `apps/talentpool/vercel.json`**

```json
{
  "rewrites": [
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 4: Create `apps/brands/vercel.json`**

```json
{
  "rewrites": [
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 5: Create `apps/landing/vercel.json`**

The landing app proxies `/admin/*` to the admin Vercel project. Replace `ADMIN_VERCEL_URL` with the actual deployment URL of `digihire-admin` once it is deployed.

```json
{
  "rewrites": [
    { "source": "/admin/:path*", "destination": "ADMIN_VERCEL_URL/admin/:path*" }
  ]
}
```

- [ ] **Step 6: Document per-app environment variables**

Create `.env.example` in each app:

`apps/voltsquad/.env.example`:
```env
VITE_SUPABASE_URL=https://yaojxewpkrjonrvqpsxi.supabase.co
VITE_SUPABASE_ANON_KEY=
VITE_APP_NAME=voltsquad
VITE_APP_DOMAIN=voltsquad.digihire.io
VITE_LANDING_URL=https://digihire.io
```

`apps/admin/.env.example`:
```env
VITE_SUPABASE_URL=https://yaojxewpkrjonrvqpsxi.supabase.co
VITE_SUPABASE_ANON_KEY=
VITE_APP_NAME=admin
VITE_APP_DOMAIN=digihire.io
VITE_LANDING_URL=https://digihire.io
```

`apps/talentpool/.env.example`:
```env
VITE_SUPABASE_URL=https://yaojxewpkrjonrvqpsxi.supabase.co
VITE_SUPABASE_ANON_KEY=
VITE_APP_NAME=talentpool
VITE_APP_DOMAIN=talentpool.digihire.io
VITE_LANDING_URL=https://digihire.io
```

`apps/brands/.env.example`:
```env
VITE_SUPABASE_URL=https://yaojxewpkrjonrvqpsxi.supabase.co
VITE_SUPABASE_ANON_KEY=
VITE_APP_NAME=brands
VITE_APP_DOMAIN=brands.digihire.io
VITE_LANDING_URL=https://digihire.io
```

- [ ] **Step 7: Commit**

```bash
git add apps/*/vercel.json apps/*/.env.example
git commit -m "chore: add Vercel config and env examples for all apps"
```

---

## Vercel Project Setup (Manual — done in Vercel dashboard)

For each app, create a new Vercel project connected to the same GitHub repo:

| Project Name | Root Directory | Domain |
| --- | --- | --- |
| `digihire-landing` | `apps/landing` | `digihire.io` |
| `digihire-voltsquad` | `apps/voltsquad` | `voltsquad.digihire.io` |
| `digihire-talentpool` | `apps/talentpool` | `talentpool.digihire.io` |
| `digihire-brands` | `apps/brands` | `brands.digihire.io` |
| `digihire-admin` | `apps/admin` | (no custom domain — URL used in landing rewrite) |

**Build Command for all projects:**
```
cd ../.. && npm install && npm run build --workspace=apps/<name>
```

**After deploying `digihire-admin`:** copy its deployment URL into `apps/landing/vercel.json` `ADMIN_VERCEL_URL` and redeploy `digihire-landing`.

---

## Environment Variables to Set in Vercel Dashboard

Set these in each project's Vercel Environment Variables settings. Never commit actual keys to git.

| Variable | All apps |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://yaojxewpkrjonrvqpsxi.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (from Supabase project settings) |
| `VITE_LANDING_URL` | `https://digihire.io` |
| `VITE_APP_NAME` | app-specific (see .env.example) |
| `VITE_APP_DOMAIN` | app-specific (see .env.example) |
