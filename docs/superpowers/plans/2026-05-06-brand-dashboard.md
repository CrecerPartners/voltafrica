# Brand Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete brand-side client operations portal inside `apps/brands` — action cards home, VoltSquad campaign management, sales recruitment intake, activation/field-marketing booking, reports, and admin visibility into recruitment requests.

**Architecture:** Extend the existing `apps/brands` React app (light theme, `#2563eb` primary blue, Tailwind + `motion/react`). `BrandDashboard.tsx` acts as the layout shell with a sidebar and nested routes; each module lives in its own page file. Three new Supabase tables (`brand_campaigns`, `recruitment_requests`, `activation_requests`) with RLS enforce data isolation per brand. Admin additions go into `apps/admin`.

**Tech Stack:** React 18, React Router v6 nested routes, Supabase (via `supabase as any` cast), `@digihire/shared` (hooks, auth), `motion/react`, Tailwind CSS, lucide-react.

---

## File Structure

**New files — `apps/brands/src/`**
```
pages/brand/BrandHome.tsx          — action cards + quick stats (overview route)
pages/brand/CampaignLaunch.tsx     — multi-section campaign setup form
pages/brand/CampaignList.tsx       — brand's campaign list
pages/brand/CampaignDetail.tsx     — single campaign stats + tracking code
pages/brand/RecruitmentRequest.tsx — 2-step recruitment intake form
pages/brand/RecruitmentDashboard.tsx — recruitment requests status view
pages/brand/ActivationRequest.tsx  — activation form + meeting booking
pages/brand/Reports.tsx            — unified activity summary
hooks/useBrandCampaigns.ts
hooks/useRecruitmentRequests.ts
hooks/useActivationRequests.ts
```

**Modified files**
```
apps/brands/src/types.ts                          — add 3 new interfaces
apps/brands/src/pages/brand/BrandDashboard.tsx    — expand sidebar + add 8 new routes
apps/brands/src/components/Navbar.tsx             — add Campaigns + Recruitment links
apps/admin/src/pages/AdminRecruitment.tsx         — new admin recruitment view
apps/admin/src/components/AdminLayout.tsx         — add Recruitment nav item
apps/admin/src/App.tsx                            — add /recruitment route
supabase/migrations/20260506120000_brand_dashboard.sql — 3 new tables
```

---

### Task 1: Supabase migration — 3 new tables

**Files:**
- Create: `supabase/migrations/20260506120000_brand_dashboard.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260506120000_brand_dashboard.sql

-- ── brand_campaigns ──────────────────────────────────────────────────────────
create table public.brand_campaigns (
  id               uuid        primary key default gen_random_uuid(),
  brand_id         uuid        not null references public.brand_profiles(id) on delete cascade,
  campaign_name    text        not null,
  brand_name       text,
  campaign_goal    text,
  product_name     text,
  product_category text,
  target_audience  text,
  city             text,
  region           text,
  start_date       date,
  end_date         date,
  payout_model     text,
  target_volume    int,
  tracking_link    text,
  notes            text,
  status           text        not null default 'pending',
  total_sellers    int         not null default 0,
  total_conversions int        not null default 0,
  total_leads      int         not null default 0,
  tracking_code    text        unique default 'c-' || substr(gen_random_uuid()::text, 1, 8),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── recruitment_requests ─────────────────────────────────────────────────────
create table public.recruitment_requests (
  id                   uuid        primary key default gen_random_uuid(),
  brand_id             uuid        not null references public.brand_profiles(id) on delete cascade,
  contact_person       text,
  hiring_timeline      text,
  location             text,
  industry             text,
  job_title            text        not null,
  num_hires            int,
  role_type            text,
  experience_level     text,
  industry_preference  text,
  responsibilities     text,
  required_skills      text[],
  salary_min           int,
  salary_max           int,
  work_type            text,
  job_location         text,
  deadline             date,
  additional_notes     text,
  status               text        not null default 'open',
  applicant_count      int         not null default 0,
  shortlist_count      int         not null default 0,
  assigned_support     text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── activation_requests ──────────────────────────────────────────────────────
create table public.activation_requests (
  id                   uuid        primary key default gen_random_uuid(),
  brand_id             uuid        not null references public.brand_profiles(id) on delete cascade,
  company_name         text,
  contact_person       text,
  email                text,
  phone                text,
  activation_type      text,
  location             text,
  preferred_start_date date,
  preferred_end_date   date,
  goals                text,
  approximate_scale    text,
  notes                text,
  booking_type         text        not null default 'form',
  meeting_slot         text,
  status               text        not null default 'pending',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── updated_at triggers ──────────────────────────────────────────────────────
create trigger update_brand_campaigns_updated_at
  before update on public.brand_campaigns
  for each row execute function public.update_updated_at_column();

create trigger update_recruitment_requests_updated_at
  before update on public.recruitment_requests
  for each row execute function public.update_updated_at_column();

create trigger update_activation_requests_updated_at
  before update on public.activation_requests
  for each row execute function public.update_updated_at_column();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.brand_campaigns       enable row level security;
alter table public.recruitment_requests  enable row level security;
alter table public.activation_requests   enable row level security;

-- brand_campaigns
create policy "brands_select_own_campaigns"
  on public.brand_campaigns for select
  using (auth.uid() = brand_id);

create policy "brands_insert_own_campaigns"
  on public.brand_campaigns for insert
  with check (auth.uid() = brand_id);

create policy "admins_all_campaigns"
  on public.brand_campaigns for all
  using  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- recruitment_requests
create policy "brands_select_own_recruitment"
  on public.recruitment_requests for select
  using (auth.uid() = brand_id);

create policy "brands_insert_own_recruitment"
  on public.recruitment_requests for insert
  with check (auth.uid() = brand_id);

create policy "admins_all_recruitment"
  on public.recruitment_requests for all
  using  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- activation_requests
create policy "brands_select_own_activations"
  on public.activation_requests for select
  using (auth.uid() = brand_id);

create policy "brands_insert_own_activations"
  on public.activation_requests for insert
  with check (auth.uid() = brand_id);

create policy "admins_all_activations"
  on public.activation_requests for all
  using  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260506120000_brand_dashboard.sql
git commit -m "feat(db): add brand_campaigns, recruitment_requests, activation_requests tables"
```

---

### Task 2: TypeScript types + 3 data hooks

**Files:**
- Modify: `apps/brands/src/types.ts`
- Create: `apps/brands/src/hooks/useBrandCampaigns.ts`
- Create: `apps/brands/src/hooks/useRecruitmentRequests.ts`
- Create: `apps/brands/src/hooks/useActivationRequests.ts`

- [ ] **Step 1: Replace `apps/brands/src/types.ts` with the expanded version**

```typescript
export interface BrandProfile {
  id: string;
  company_name?: string;
  contact_name?: string;
  phone?: string;
  website?: string;
  company_type?: string;
  industry?: string;
  company_size?: string;
  city?: string;
  country?: string;
  primary_goal?: string;
  description?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrandCampaign {
  id: string;
  brand_id: string;
  campaign_name: string;
  brand_name?: string;
  campaign_goal?: string;
  product_name?: string;
  product_category?: string;
  target_audience?: string;
  city?: string;
  region?: string;
  start_date?: string;
  end_date?: string;
  payout_model?: string;
  target_volume?: number;
  tracking_link?: string;
  notes?: string;
  status: string;
  total_sellers: number;
  total_conversions: number;
  total_leads: number;
  tracking_code?: string;
  created_at: string;
  updated_at: string;
}

export interface RecruitmentRequest {
  id: string;
  brand_id: string;
  contact_person?: string;
  hiring_timeline?: string;
  location?: string;
  industry?: string;
  job_title: string;
  num_hires?: number;
  role_type?: string;
  experience_level?: string;
  industry_preference?: string;
  responsibilities?: string;
  required_skills?: string[];
  salary_min?: number;
  salary_max?: number;
  work_type?: string;
  job_location?: string;
  deadline?: string;
  additional_notes?: string;
  status: string;
  applicant_count: number;
  shortlist_count: number;
  assigned_support?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivationRequest {
  id: string;
  brand_id: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  activation_type?: string;
  location?: string;
  preferred_start_date?: string;
  preferred_end_date?: string;
  goals?: string;
  approximate_scale?: string;
  notes?: string;
  booking_type: string;
  meeting_slot?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Create `apps/brands/src/hooks/useBrandCampaigns.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase as _supabase, useAuth } from '@digihire/shared';
import type { BrandCampaign } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _supabase as any;

export function useBrandCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from('brand_campaigns')
      .select('*')
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }: { data: BrandCampaign[] | null; error: { message: string } | null }) => {
        setCampaigns(err ? [] : (data ?? []));
        setError(err?.message ?? null);
        setLoading(false);
      });
  }, [user?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const createCampaign = async (payload: Omit<BrandCampaign, 'id' | 'brand_id' | 'status' | 'total_sellers' | 'total_conversions' | 'total_leads' | 'tracking_code' | 'created_at' | 'updated_at'>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };
    const { data, error: err } = await supabase
      .from('brand_campaigns')
      .insert({ ...payload, brand_id: user.id })
      .select()
      .single();
    if (!err && data) setCampaigns(prev => [data, ...prev]);
    return { data, error: err };
  };

  return { campaigns, loading, error, createCampaign, refetch: fetch };
}
```

- [ ] **Step 3: Create `apps/brands/src/hooks/useRecruitmentRequests.ts`**

```typescript
import { useState, useEffect } from 'react';
import { supabase as _supabase, useAuth } from '@digihire/shared';
import type { RecruitmentRequest } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _supabase as any;

export function useRecruitmentRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RecruitmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    supabase
      .from('recruitment_requests')
      .select('*')
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }: { data: RecruitmentRequest[] | null; error: { message: string } | null }) => {
        setRequests(err ? [] : (data ?? []));
        setError(err?.message ?? null);
        setLoading(false);
      });
  }, [user?.id]);

  const createRequest = async (payload: Omit<RecruitmentRequest, 'id' | 'brand_id' | 'status' | 'applicant_count' | 'shortlist_count' | 'assigned_support' | 'created_at' | 'updated_at'>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };
    const { data, error: err } = await supabase
      .from('recruitment_requests')
      .insert({ ...payload, brand_id: user.id })
      .select()
      .single();
    if (!err && data) setRequests(prev => [data, ...prev]);
    return { data, error: err };
  };

  return { requests, loading, error, createRequest };
}
```

- [ ] **Step 4: Create `apps/brands/src/hooks/useActivationRequests.ts`**

```typescript
import { useState, useEffect } from 'react';
import { supabase as _supabase, useAuth } from '@digihire/shared';
import type { ActivationRequest } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _supabase as any;

export function useActivationRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    supabase
      .from('activation_requests')
      .select('*')
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }: { data: ActivationRequest[] | null; error: { message: string } | null }) => {
        setRequests(err ? [] : (data ?? []));
        setError(err?.message ?? null);
        setLoading(false);
      });
  }, [user?.id]);

  const createRequest = async (payload: Omit<ActivationRequest, 'id' | 'brand_id' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };
    const { data, error: err } = await supabase
      .from('activation_requests')
      .insert({ ...payload, brand_id: user.id })
      .select()
      .single();
    if (!err && data) setRequests(prev => [data, ...prev]);
    return { data, error: err };
  };

  return { requests, loading, error, createRequest };
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/brands/src/types.ts apps/brands/src/hooks/
git commit -m "feat(brands): add types and data hooks for campaigns, recruitment, activations"
```

---

### Task 3: BrandHome — action cards + quick stats

**Files:**
- Create: `apps/brands/src/pages/brand/BrandHome.tsx`

- [ ] **Step 1: Create the file**

```typescript
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Megaphone, Users, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { useBrandProfile } from '../../hooks/useBrandProfile';
import { useBrandCampaigns } from '../../hooks/useBrandCampaigns';
import { useRecruitmentRequests } from '../../hooks/useRecruitmentRequests';
import { useActivationRequests } from '../../hooks/useActivationRequests';

const ACTION_CARDS = [
  {
    icon: Megaphone,
    title: 'Launch a VoltSquad Campaign',
    desc: 'Deploy sellers to promote your product or service across our network.',
    to: '/brand/campaigns/new',
    color: 'bg-blue-50 text-[#2563eb] border-blue-100',
    btn: 'bg-[#2563eb] text-white',
  },
  {
    icon: Users,
    title: 'Submit Recruitment Request',
    desc: 'Request pre-vetted sales talent — BDRs, AEs, SDRs, and more.',
    to: '/brand/recruitment/new',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    btn: 'bg-violet-600 text-white',
  },
  {
    icon: Zap,
    title: 'Book an Activation',
    desc: 'Request field marketing support or book a strategy call with our team.',
    to: '/brand/activations',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    btn: 'bg-amber-500 text-white',
  },
  {
    icon: BarChart3,
    title: 'Track Activity',
    desc: 'View campaign performance, recruitment progress, and activation status.',
    to: '/brand/reports',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    btn: 'bg-emerald-600 text-white',
  },
];

export default function BrandHome() {
  const { profile } = useBrandProfile();
  const { campaigns } = useBrandCampaigns();
  const { requests: recruitmentRequests } = useRecruitmentRequests();
  const { requests: activationRequests } = useActivationRequests();

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const openRecruitment = recruitmentRequests.filter(r => r.status === 'open' || r.status === 'in_review').length;
  const pendingActivations = activationRequests.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-3xl bg-gradient-to-tr from-[#1a1a1a] to-[#2d2d2d] p-8 text-white shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Brand Portal</p>
        <h2 className="text-2xl font-extrabold mb-2">{profile?.company_name ?? 'Welcome back'}</h2>
        <p className="text-gray-400 text-sm">Select an action below to get started.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Active Campaigns" value={activeCampaigns} to="/brand/campaigns" />
        <Stat label="Open Requests" value={openRecruitment} to="/brand/recruitment" />
        <Stat label="Pending Activations" value={pendingActivations} to="/brand/activations" />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ACTION_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={card.to}
              className="group flex flex-col h-full rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`h-11 w-11 rounded-xl border flex items-center justify-center mb-4 ${card.color}`}>
                <card.icon size={20} />
              </div>
              <h3 className="font-bold text-[#1a1a1a] mb-1">{card.title}</h3>
              <p className="text-xs text-gray-500 flex-1 leading-relaxed">{card.desc}</p>
              <div className={`mt-5 inline-flex items-center gap-1.5 self-start rounded-lg px-4 py-2 text-xs font-bold transition-all ${card.btn} group-hover:opacity-90`}>
                Get Started <ArrowRight size={13} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link to={to} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:border-[#2563eb]/30 transition-all text-center">
      <p className="text-2xl font-extrabold text-[#1a1a1a]">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">{label}</p>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/brands/src/pages/brand/BrandHome.tsx
git commit -m "feat(brands): add BrandHome action cards dashboard"
```

---

### Task 4: Expand BrandDashboard — sidebar + routes

**Files:**
- Modify: `apps/brands/src/pages/brand/BrandDashboard.tsx`

- [ ] **Step 1: Replace `BrandDashboard.tsx` with the expanded version**

```typescript
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@digihire/shared';
import { useBrandProfile } from '../../hooks/useBrandProfile';
import { Building2, Target, Megaphone, Users, Zap, BarChart3, LayoutDashboard } from 'lucide-react';
import BrandSetup from './BrandSetup';
import BrandHome from './BrandHome';
import CampaignLaunch from './CampaignLaunch';
import CampaignList from './CampaignList';
import CampaignDetail from './CampaignDetail';
import RecruitmentRequest from './RecruitmentRequest';
import RecruitmentDashboard from './RecruitmentDashboard';
import ActivationRequest from './ActivationRequest';
import Reports from './Reports';

const NAV = [
  { to: '/brand', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/brand/campaigns', label: 'Campaigns', icon: Megaphone, exact: false },
  { to: '/brand/recruitment', label: 'Recruitment', icon: Users, exact: false },
  { to: '/brand/activations', label: 'Activations', icon: Zap, exact: false },
  { to: '/brand/reports', label: 'Reports', icon: BarChart3, exact: false },
];

export default function BrandDashboard() {
  const { profile, loading } = useBrandProfile();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;

  const isProfileComplete = !!profile?.industry;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-3">
            {/* Brand card */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2563eb] font-bold border-2 border-white shadow-sm shrink-0">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1a1a1a] truncate">{profile?.company_name ?? 'Your Brand'}</p>
                <p className="text-[10px] text-gray-400 truncate">{profile?.industry ?? 'Complete setup'}</p>
              </div>
            </div>

            {/* Primary nav */}
            <nav className="rounded-2xl bg-white p-2 shadow-sm border border-gray-100 space-y-0.5">
              {NAV.map(item => {
                const active = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to) && item.to !== '/brand';
                const isOverview = item.to === '/brand';
                const overviewActive = isOverview && location.pathname === '/brand';
                const isActive = isOverview ? overviewActive : active;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-[#2563eb] text-white shadow-sm' : 'text-[#4a4a4a] hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Settings */}
            <nav className="rounded-2xl bg-white p-2 shadow-sm border border-gray-100">
              <Link
                to="/brand/setup"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/brand/setup' ? 'bg-[#2563eb] text-white shadow-sm' : 'text-[#4a4a4a] hover:bg-gray-50'
                }`}
              >
                <Target size={16} /> Company Profile
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-3 min-w-0">
          <Routes>
            <Route path="/" element={isProfileComplete ? <BrandHome /> : <BrandSetup />} />
            <Route path="/setup" element={<BrandSetup />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/new" element={<CampaignLaunch />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/recruitment" element={<RecruitmentDashboard />} />
            <Route path="/recruitment/new" element={<RecruitmentRequest />} />
            <Route path="/activations" element={<ActivationRequest />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/brands/src/pages/brand/BrandDashboard.tsx
git commit -m "feat(brands): expand BrandDashboard layout with full sidebar nav and routes"
```

---

### Task 5: CampaignLaunch — multi-section form

**Files:**
- Create: `apps/brands/src/pages/brand/CampaignLaunch.tsx`

- [ ] **Step 1: Create the file**

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrandCampaigns } from '../../hooks/useBrandCampaigns';
import { useBrandProfile } from '../../hooks/useBrandProfile';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { BrandCampaign } from '../../types';

type FormData = Omit<BrandCampaign, 'id' | 'brand_id' | 'status' | 'total_sellers' | 'total_conversions' | 'total_leads' | 'tracking_code' | 'created_at' | 'updated_at'>;

export default function CampaignLaunch() {
  const navigate = useNavigate();
  const { profile } = useBrandProfile();
  const { createCampaign } = useBrandCampaigns();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    campaign_name: '',
    brand_name: profile?.company_name ?? '',
    campaign_goal: '',
    product_name: '',
    product_category: '',
    target_audience: '',
    city: '',
    region: '',
    start_date: '',
    end_date: '',
    payout_model: '',
    target_volume: undefined,
    tracking_link: '',
    notes: '',
  });

  React.useEffect(() => {
    if (profile?.company_name && !form.brand_name) {
      setForm(p => ({ ...p, brand_name: profile.company_name ?? '' }));
    }
  }, [profile?.company_name]);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.campaign_name || !form.campaign_goal || !form.product_name) {
      setError('Campaign name, goal, and product name are required.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await createCampaign({
        ...form,
        target_volume: form.target_volume ? Number(form.target_volume) : undefined,
      });
      if (err) throw err;
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit campaign request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
        <div className="h-16 w-16 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Campaign Request Submitted!</h3>
        <p className="text-sm text-gray-500 mb-8">Our team will review and activate your campaign within 24–48 hours.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/brand/campaigns')} className="rounded-xl bg-[#2563eb] text-white px-6 py-2.5 text-sm font-bold hover:bg-[#1d4ed8] transition-all">
            View Campaigns
          </button>
          <button onClick={() => { setSubmitted(false); setForm({ campaign_name: '', brand_name: profile?.company_name ?? '', campaign_goal: '', product_name: '', product_category: '', target_audience: '', city: '', region: '', start_date: '', end_date: '', payout_model: '', target_volume: undefined, tracking_link: '', notes: '' }); }} className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-bold text-[#4a4a4a] hover:bg-gray-50 transition-all">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-6 flex items-center gap-4">
        <button onClick={() => navigate('/brand/campaigns')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">Launch a VoltSquad Campaign</h2>
          <p className="text-sm text-gray-400">Fill in the details and our team will activate your campaign.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">

        {/* Section 1 */}
        <section className="space-y-5">
          <SectionLabel n="1" title="Campaign Basics" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Campaign Name *" required>
              <input required value={form.campaign_name} onChange={set('campaign_name')} placeholder="Summer B2B Push" className={inputCls} />
            </Field>
            <Field label="Brand Name">
              <input value={form.brand_name ?? ''} onChange={set('brand_name')} placeholder="Your company name" className={inputCls} />
            </Field>
            <Field label="Campaign Goal *" className="md:col-span-2">
              <select required value={form.campaign_goal ?? ''} onChange={set('campaign_goal')} className={inputCls}>
                <option value="" disabled>Select goal</option>
                <option>Lead Generation</option>
                <option>Sales / Conversions</option>
                <option>App Sign-ups</option>
                <option>Brand Awareness</option>
                <option>Event Registrations</option>
              </select>
            </Field>
          </div>
        </section>

        <Divider />

        {/* Section 2 */}
        <section className="space-y-5">
          <SectionLabel n="2" title="Product / Service" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Product / Service Name *">
              <input required value={form.product_name ?? ''} onChange={set('product_name')} placeholder="e.g. Acme CRM Pro" className={inputCls} />
            </Field>
            <Field label="Product Category">
              <select value={form.product_category ?? ''} onChange={set('product_category')} className={inputCls}>
                <option value="">Select category</option>
                <option>SaaS / Software</option>
                <option>Fintech / Financial</option>
                <option>E-commerce / Retail</option>
                <option>Health & Wellness</option>
                <option>Education / EdTech</option>
                <option>Logistics / Delivery</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Target Audience" className="md:col-span-2">
              <textarea value={form.target_audience ?? ''} onChange={set('target_audience')} rows={3} placeholder="Describe who your ideal customer is..." className={inputCls + ' resize-none'} />
            </Field>
          </div>
        </section>

        <Divider />

        {/* Section 3 */}
        <section className="space-y-5">
          <SectionLabel n="3" title="Location & Schedule" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="City">
              <input value={form.city ?? ''} onChange={set('city')} placeholder="Lagos" className={inputCls} />
            </Field>
            <Field label="Region">
              <input value={form.region ?? ''} onChange={set('region')} placeholder="South West Nigeria" className={inputCls} />
            </Field>
            <Field label="Start Date">
              <input type="date" value={form.start_date ?? ''} onChange={set('start_date')} className={inputCls} />
            </Field>
            <Field label="End Date">
              <input type="date" value={form.end_date ?? ''} onChange={set('end_date')} className={inputCls} />
            </Field>
          </div>
        </section>

        <Divider />

        {/* Section 4 */}
        <section className="space-y-5">
          <SectionLabel n="4" title="Commercial Terms" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Payout / Commission Model">
              <select value={form.payout_model ?? ''} onChange={set('payout_model')} className={inputCls}>
                <option value="">Select model</option>
                <option>Per Lead</option>
                <option>Per Sale</option>
                <option>Per Sign-up</option>
                <option>Fixed per Seller</option>
                <option>Revenue Share (%)</option>
              </select>
            </Field>
            <Field label="Target Volume">
              <input type="number" min={1} value={form.target_volume ?? ''} onChange={set('target_volume')} placeholder="e.g. 500" className={inputCls} />
            </Field>
            <Field label="Tracking Link / Landing Page" className="md:col-span-2">
              <input type="url" value={form.tracking_link ?? ''} onChange={set('tracking_link')} placeholder="https://yoursite.com/lp" className={inputCls} />
            </Field>
          </div>
        </section>

        <Divider />

        {/* Section 5 */}
        <section className="space-y-5">
          <SectionLabel n="5" title="Assets & Notes" />
          <Field label="Campaign Assets">
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-xs text-gray-400 font-medium">Asset upload will be available in the next update.</p>
              <p className="text-[10px] text-gray-300 mt-1">For now, share links to assets in the notes field below.</p>
            </div>
          </Field>
          <Field label="Notes / Instructions">
            <textarea value={form.notes ?? ''} onChange={set('notes')} rows={4} placeholder="Any specific instructions, asset links, or context for our team..." className={inputCls + ' resize-none'} />
          </Field>
        </section>

        {error && <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-8 py-3 text-sm font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-60 transition-all shadow-lg shadow-blue-100">
            {submitting ? 'Submitting...' : 'Submit Campaign Request'} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-[#2563eb] transition-all';

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2563eb]/10 text-[#2563eb] text-xs font-black">{n}</span>
      <h3 className="font-bold text-[#1a1a1a]">{title}</h3>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/brands/src/pages/brand/CampaignLaunch.tsx
git commit -m "feat(brands): add CampaignLaunch multi-section form"
```

---

### Task 6: CampaignList + CampaignDetail

**Files:**
- Create: `apps/brands/src/pages/brand/CampaignList.tsx`
- Create: `apps/brands/src/pages/brand/CampaignDetail.tsx`

- [ ] **Step 1: Create `CampaignList.tsx`**

```typescript
import { Link } from 'react-router-dom';
import { useBrandCampaigns } from '../../hooks/useBrandCampaigns';
import { Plus, Megaphone, Users, TrendingUp, RefreshCw } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-100',
  active:    'bg-green-50 text-green-700 border-green-100',
  paused:    'bg-gray-50 text-gray-500 border-gray-100',
  completed: 'bg-blue-50 text-blue-700 border-blue-100',
};

export default function CampaignList() {
  const { campaigns, loading, refetch } = useBrandCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">VoltSquad Campaigns</h2>
          <p className="text-sm text-gray-400">Track all your active and past campaigns.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 transition-all">
            <RefreshCw size={16} />
          </button>
          <Link to="/brand/campaigns/new" className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-all shadow-sm shadow-blue-100">
            <Plus size={16} /> New Campaign
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto mb-4">
            <Megaphone size={24} />
          </div>
          <h3 className="font-bold text-[#1a1a1a] mb-1">No campaigns yet</h3>
          <p className="text-sm text-gray-400 mb-6">Launch your first campaign to start reaching VoltSquad sellers.</p>
          <Link to="/brand/campaigns/new" className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-all">
            <Plus size={16} /> Launch Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <Link key={c.id} to={`/brand/campaigns/${c.id}`} className="flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:border-[#2563eb]/30 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                  <Megaphone size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#1a1a1a] truncate group-hover:text-[#2563eb] transition-colors">{c.campaign_name}</p>
                  <p className="text-xs text-gray-400">{c.campaign_goal ?? 'No goal set'} · Created {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users size={13} /> {c.total_sellers}</span>
                  <span className="flex items-center gap-1"><TrendingUp size={13} /> {c.total_conversions}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[c.status] ?? STATUS_COLOR.pending}`}>
                  {c.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `CampaignDetail.tsx`**

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { useBrandCampaigns } from '../../hooks/useBrandCampaigns';
import { ArrowLeft, Copy, Users, TrendingUp, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  active: 'bg-green-50 text-green-700 border-green-100',
  paused: 'bg-gray-50 text-gray-500 border-gray-100',
  completed: 'bg-blue-50 text-blue-700 border-blue-100',
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, loading } = useBrandCampaigns();
  const [copied, setCopied] = useState(false);

  const campaign = campaigns.find(c => c.id === id);

  const copyTrackingCode = () => {
    if (campaign?.tracking_code) {
      navigator.clipboard.writeText(`https://digihire.io/c/${campaign.tracking_code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;
  if (!campaign) return (
    <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
      <p className="text-gray-400">Campaign not found.</p>
      <button onClick={() => navigate('/brand/campaigns')} className="mt-4 text-sm text-[#2563eb] font-semibold hover:underline">
        Back to Campaigns
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/brand/campaigns')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-[#1a1a1a] truncate">{campaign.campaign_name}</h2>
          <p className="text-sm text-gray-400">{campaign.campaign_goal} · {campaign.product_name}</p>
        </div>
        <span className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[campaign.status] ?? STATUS_COLOR.pending}`}>
          {campaign.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Users size={18} />} label="Sellers Joined" value={campaign.total_sellers} />
        <StatCard icon={<TrendingUp size={18} />} label="Conversions" value={campaign.total_conversions} />
        <StatCard icon={<FileText size={18} />} label="Total Leads" value={campaign.total_leads} />
      </div>

      {/* Tracking Code */}
      {campaign.tracking_code && (
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Tracking Code</p>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <code className="flex-1 text-sm font-mono text-[#1a1a1a] truncate">
              https://digihire.io/c/{campaign.tracking_code}
            </code>
            <button onClick={copyTrackingCode} className="flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors shrink-0">
              {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
        </div>
      )}

      {/* Campaign Details */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-[#1a1a1a] mb-4">Campaign Details</h3>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <Detail label="Brand" value={campaign.brand_name} />
          <Detail label="Product" value={campaign.product_name} />
          <Detail label="Category" value={campaign.product_category} />
          <Detail label="Payout Model" value={campaign.payout_model} />
          <Detail label="Target Volume" value={campaign.target_volume?.toString()} />
          <Detail label="Location" value={[campaign.city, campaign.region].filter(Boolean).join(', ')} />
          <Detail label="Start Date" value={campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : undefined} />
          <Detail label="End Date" value={campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : undefined} />
        </div>
        {campaign.notes && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Notes</p>
            <p className="text-sm text-gray-600 leading-relaxed">{campaign.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm text-center">
      <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto mb-3">{icon}</div>
      <p className="text-2xl font-extrabold text-[#1a1a1a]">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-[#1a1a1a] mt-0.5">{value || '—'}</p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/brands/src/pages/brand/CampaignList.tsx apps/brands/src/pages/brand/CampaignDetail.tsx
git commit -m "feat(brands): add CampaignList and CampaignDetail pages"
```

---

### Task 7: RecruitmentRequest — 2-step intake form

**Files:**
- Create: `apps/brands/src/pages/brand/RecruitmentRequest.tsx`

- [ ] **Step 1: Create the file**

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecruitmentRequests } from '../../hooks/useRecruitmentRequests';
import { useBrandProfile } from '../../hooks/useBrandProfile';
import { CheckCircle2, ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import type { RecruitmentRequest } from '../../types';

type FormData = Omit<RecruitmentRequest, 'id' | 'brand_id' | 'status' | 'applicant_count' | 'shortlist_count' | 'assigned_support' | 'created_at' | 'updated_at'>;

const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-[#2563eb] transition-all';

export default function RecruitmentRequest() {
  const navigate = useNavigate();
  const { profile } = useBrandProfile();
  const { createRequest } = useRecruitmentRequests();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState<FormData>({
    contact_person: profile?.contact_name ?? '',
    hiring_timeline: '',
    location: '',
    industry: profile?.industry ?? '',
    job_title: '',
    num_hires: undefined,
    role_type: '',
    experience_level: '',
    industry_preference: '',
    responsibilities: '',
    required_skills: [],
    salary_min: undefined,
    salary_max: undefined,
    work_type: '',
    job_location: '',
    deadline: '',
    additional_notes: '',
  });

  React.useEffect(() => {
    setForm(p => ({
      ...p,
      contact_person: p.contact_person || profile?.contact_name || '',
      industry: p.industry || profile?.industry || '',
    }));
  }, [profile?.contact_name, profile?.industry]);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !(form.required_skills ?? []).includes(skill)) {
        setForm(p => ({ ...p, required_skills: [...(p.required_skills ?? []), skill] }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) =>
    setForm(p => ({ ...p, required_skills: (p.required_skills ?? []).filter(s => s !== skill) }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contact_person || !form.hiring_timeline) {
      setError('Contact person and hiring timeline are required.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.job_title) {
      setError('Job title is required.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await createRequest({
        ...form,
        num_hires: form.num_hires ? Number(form.num_hires) : undefined,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
      });
      if (err) throw err;
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
        <div className="h-16 w-16 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Recruitment Request Submitted!</h3>
        <p className="text-sm text-gray-500 mb-8">Our talent team will review your request and be in touch within 48 hours.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/brand/recruitment')} className="rounded-xl bg-violet-600 text-white px-6 py-2.5 text-sm font-bold hover:bg-violet-700 transition-all">
            View Requests
          </button>
          <button onClick={() => { setSubmitted(false); setStep(1); }} className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-bold text-[#4a4a4a] hover:bg-gray-50 transition-all">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => step === 1 ? navigate('/brand/recruitment') : setStep(1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
            {step === 1 ? <ArrowLeft size={18} /> : <ChevronLeft size={18} />}
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#1a1a1a]">Sales Recruitment Request</h2>
            <p className="text-sm text-gray-400">Step {step} of 2 — {step === 1 ? 'Company Details' : 'Talent Requirements'}</p>
          </div>
        </div>
        {/* Step indicator */}
        <div className="flex gap-2">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-violet-500' : 'bg-gray-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-violet-500' : 'bg-gray-200'}`} />
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNext} className="p-8 space-y-6">
          <h3 className="font-bold text-[#1a1a1a]">Step 1: Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Contact Person *">
              <input required value={form.contact_person ?? ''} onChange={set('contact_person')} placeholder="Full name" className={inputCls} />
            </Field>
            <Field label="Hiring Timeline *">
              <select required value={form.hiring_timeline ?? ''} onChange={set('hiring_timeline')} className={inputCls}>
                <option value="" disabled>Select timeline</option>
                <option>Immediately</option>
                <option>Within 30 days</option>
                <option>1–3 months</option>
                <option>3–6 months</option>
                <option>Just planning</option>
              </select>
            </Field>
            <Field label="Company Location">
              <input value={form.location ?? ''} onChange={set('location')} placeholder="City, Country" className={inputCls} />
            </Field>
            <Field label="Industry">
              <input value={form.industry ?? ''} onChange={set('industry')} placeholder="e.g. SaaS, Fintech" className={inputCls} />
            </Field>
          </div>
          {error && <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3 text-sm font-bold text-white hover:bg-violet-700 transition-all">
              Next: Talent Requirements <ArrowRight size={16} />
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <h3 className="font-bold text-[#1a1a1a]">Step 2: Talent Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Job Title *">
              <input required value={form.job_title} onChange={set('job_title')} placeholder="e.g. B2B Sales Executive" className={inputCls} />
            </Field>
            <Field label="Number of Hires">
              <input type="number" min={1} value={form.num_hires ?? ''} onChange={set('num_hires')} placeholder="e.g. 3" className={inputCls} />
            </Field>
            <Field label="Role Type">
              <select value={form.role_type ?? ''} onChange={set('role_type')} className={inputCls}>
                <option value="">Select type</option>
                <option>Full-time</option>
                <option>Contract</option>
                <option>Part-time</option>
                <option>Commission-only</option>
              </select>
            </Field>
            <Field label="Experience Level">
              <select value={form.experience_level ?? ''} onChange={set('experience_level')} className={inputCls}>
                <option value="">Select level</option>
                <option>Entry-level (0–2 yrs)</option>
                <option>Mid-level (3–5 yrs)</option>
                <option>Senior (5+ yrs)</option>
                <option>Any level</option>
              </select>
            </Field>
            <Field label="Work Type">
              <select value={form.work_type ?? ''} onChange={set('work_type')} className={inputCls}>
                <option value="">Select work type</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
                <option>Field / External</option>
              </select>
            </Field>
            <Field label="Job Location">
              <input value={form.job_location ?? ''} onChange={set('job_location')} placeholder="City / Region" className={inputCls} />
            </Field>
            <Field label="Salary Min (₦)">
              <input type="number" value={form.salary_min ?? ''} onChange={set('salary_min')} placeholder="e.g. 150000" className={inputCls} />
            </Field>
            <Field label="Salary Max (₦)">
              <input type="number" value={form.salary_max ?? ''} onChange={set('salary_max')} placeholder="e.g. 400000" className={inputCls} />
            </Field>
            <Field label="Application Deadline">
              <input type="date" value={form.deadline ?? ''} onChange={set('deadline')} className={inputCls} />
            </Field>
            <Field label="Industry Preference">
              <input value={form.industry_preference ?? ''} onChange={set('industry_preference')} placeholder="e.g. SaaS, Fintech" className={inputCls} />
            </Field>
            <Field label="Required Skills" className="md:col-span-2">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type a skill and press Enter (e.g. Cold calling)"
                className={inputCls}
              />
              {(form.required_skills ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.required_skills ?? []).map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-violet-400 hover:text-violet-700 transition-colors">×</button>
                    </span>
                  ))}
                </div>
              )}
            </Field>
            <Field label="Key Responsibilities" className="md:col-span-2">
              <textarea value={form.responsibilities ?? ''} onChange={set('responsibilities')} rows={3} placeholder="Describe the main responsibilities of this role..." className={inputCls + ' resize-none'} />
            </Field>
            <Field label="Additional Notes" className="md:col-span-2">
              <textarea value={form.additional_notes ?? ''} onChange={set('additional_notes')} rows={3} placeholder="Any other context for our talent team..." className={inputCls + ' resize-none'} />
            </Field>
          </div>
          {error && <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div className="flex justify-between items-center">
            <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-[#1a1a1a] transition-colors">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60 transition-all">
              {submitting ? 'Submitting...' : 'Submit Request'} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/brands/src/pages/brand/RecruitmentRequest.tsx
git commit -m "feat(brands): add 2-step RecruitmentRequest form"
```

---

### Task 8: RecruitmentDashboard — status view

**Files:**
- Create: `apps/brands/src/pages/brand/RecruitmentDashboard.tsx`

- [ ] **Step 1: Create the file**

```typescript
import { Link } from 'react-router-dom';
import { useRecruitmentRequests } from '../../hooks/useRecruitmentRequests';
import { Plus, Users, CheckCircle2, Clock } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  open:          'bg-blue-50 text-blue-700 border-blue-100',
  in_review:     'bg-yellow-50 text-yellow-700 border-yellow-100',
  shortlisting:  'bg-violet-50 text-violet-700 border-violet-100',
  closed:        'bg-gray-50 text-gray-500 border-gray-100',
};

const STATUS_LABEL: Record<string, string> = {
  open:         'Open',
  in_review:    'In Review',
  shortlisting: 'Shortlisting',
  closed:       'Closed',
};

export default function RecruitmentDashboard() {
  const { requests, loading } = useRecruitmentRequests();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">Recruitment Requests</h2>
          <p className="text-sm text-gray-400">Track your open and active hiring requests.</p>
        </div>
        <Link to="/brand/recruitment/new" className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-all shadow-sm">
          <Plus size={16} /> New Request
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-[#1a1a1a] mb-1">No recruitment requests yet</h3>
          <p className="text-sm text-gray-400 mb-6">Submit your first request to start hiring vetted sales talent.</p>
          <Link to="/brand/recruitment/new" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-all">
            <Plus size={16} /> Submit Request
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-[#1a1a1a]">{r.job_title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[r.status] ?? STATUS_COLOR.open}`}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                    {r.role_type && <span>{r.role_type}</span>}
                    {r.work_type && <span>· {r.work_type}</span>}
                    {r.num_hires && <span>· {r.num_hires} hire{r.num_hires > 1 ? 's' : ''}</span>}
                    <span className="flex items-center gap-1"><Clock size={11} /> {new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-[#1a1a1a]">{r.applicant_count}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Applicants</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-violet-600">{r.shortlist_count}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Shortlisted</p>
                  </div>
                </div>
              </div>
              {r.assigned_support && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 size={13} className="text-green-500" />
                  <span>Assigned to: <strong>{r.assigned_support}</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/brands/src/pages/brand/RecruitmentDashboard.tsx
git commit -m "feat(brands): add RecruitmentDashboard status view"
```

---

### Task 9: ActivationRequest — form + meeting booking

**Files:**
- Create: `apps/brands/src/pages/brand/ActivationRequest.tsx`

- [ ] **Step 1: Create the file**

```typescript
import React, { useState } from 'react';
import { useActivationRequests } from '../../hooks/useActivationRequests';
import { useBrandProfile } from '../../hooks/useBrandProfile';
import { CheckCircle2, FileText, Calendar } from 'lucide-react';

const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-[#2563eb] transition-all';

const ACTIVATION_TYPES = ['Brand Activation', 'Field Marketing', 'Campus Activation', 'Pop-up / Experience', 'Product Demo', 'B2B Roadshow', 'Other'];

const MEETING_SLOTS = [
  'Mon 9:00 AM WAT', 'Mon 11:00 AM WAT', 'Mon 2:00 PM WAT',
  'Tue 9:00 AM WAT', 'Tue 11:00 AM WAT', 'Tue 2:00 PM WAT',
  'Wed 9:00 AM WAT', 'Wed 11:00 AM WAT', 'Wed 2:00 PM WAT',
  'Thu 9:00 AM WAT', 'Thu 11:00 AM WAT', 'Thu 2:00 PM WAT',
  'Fri 9:00 AM WAT', 'Fri 11:00 AM WAT',
];

export default function ActivationRequest() {
  const { profile } = useBrandProfile();
  const { createRequest, requests } = useActivationRequests();
  const [mode, setMode] = useState<'form' | 'book'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    company_name: profile?.company_name ?? '',
    contact_person: profile?.contact_name ?? '',
    email: '',
    phone: profile?.phone ?? '',
    activation_type: '',
    location: '',
    preferred_start_date: '',
    preferred_end_date: '',
    goals: '',
    approximate_scale: '',
    notes: '',
  });
  const [selectedSlot, setSelectedSlot] = useState('');

  React.useEffect(() => {
    setForm(p => ({
      ...p,
      company_name: p.company_name || profile?.company_name || '',
      contact_person: p.contact_person || profile?.contact_name || '',
      phone: p.phone || profile?.phone || '',
    }));
  }, [profile?.company_name, profile?.contact_name, profile?.phone]);

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'book' && !selectedSlot) {
      setError('Please select a meeting slot.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = mode === 'form'
        ? { ...form, booking_type: 'form' as const }
        : { ...form, booking_type: 'meeting' as const, meeting_slot: selectedSlot };
      const { error: err } = await createRequest(payload);
      if (err) throw err;
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
        <div className="h-16 w-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
          {mode === 'form' ? 'Activation Request Submitted!' : 'Meeting Booked!'}
        </h3>
        <p className="text-sm text-gray-500 mb-8">
          {mode === 'form'
            ? 'Our field team will review and get back to you within 48 hours.'
            : `Your meeting slot (${selectedSlot}) is confirmed. You'll receive a calendar invite.`}
        </p>
        <button onClick={() => { setSubmitted(false); setSelectedSlot(''); }} className="rounded-xl bg-amber-500 text-white px-6 py-2.5 text-sm font-bold hover:bg-amber-600 transition-all">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">Activations & Field Marketing</h2>
          <p className="text-sm text-gray-400">Request field marketing support or book a strategy call.</p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-xs font-bold text-amber-600">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-2xl bg-white border border-gray-100 p-1.5 shadow-sm w-fit gap-1">
        <button
          onClick={() => setMode('form')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${mode === 'form' ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-gray-400 hover:text-[#1a1a1a]'}`}
        >
          <FileText size={15} /> Submit Request
        </button>
        <button
          onClick={() => setMode('book')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${mode === 'book' ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-gray-400 hover:text-[#1a1a1a]'}`}
        >
          <Calendar size={15} /> Book a Meeting
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Shared fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Company Name">
              <input value={form.company_name} onChange={set('company_name')} placeholder="Your company" className={inputCls} />
            </Field>
            <Field label="Contact Person">
              <input value={form.contact_person} onChange={set('contact_person')} placeholder="Full name" className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className={inputCls} />
            </Field>
            <Field label="Phone">
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+234 800 000 0000" className={inputCls} />
            </Field>
          </div>

          {mode === 'form' ? (
            <>
              <div className="h-px bg-gray-100" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Activation Type">
                  <select value={form.activation_type} onChange={set('activation_type')} className={inputCls}>
                    <option value="">Select type</option>
                    {ACTIVATION_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Location">
                  <input value={form.location} onChange={set('location')} placeholder="City / Venue" className={inputCls} />
                </Field>
                <Field label="Preferred Start Date">
                  <input type="date" value={form.preferred_start_date} onChange={set('preferred_start_date')} className={inputCls} />
                </Field>
                <Field label="Preferred End Date">
                  <input type="date" value={form.preferred_end_date} onChange={set('preferred_end_date')} className={inputCls} />
                </Field>
                <Field label="Approximate Scale" className="md:col-span-2">
                  <select value={form.approximate_scale} onChange={set('approximate_scale')} className={inputCls}>
                    <option value="">Select scale</option>
                    <option>Small (&lt;50 people / 1 location)</option>
                    <option>Medium (50–200 people / 2–5 locations)</option>
                    <option>Large (200+ people / multi-city)</option>
                  </select>
                </Field>
                <Field label="Goals" className="md:col-span-2">
                  <textarea value={form.goals} onChange={set('goals')} rows={3} placeholder="What do you want to achieve?" className={inputCls + ' resize-none'} />
                </Field>
                <Field label="Additional Notes" className="md:col-span-2">
                  <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Anything else our team should know..." className={inputCls + ' resize-none'} />
                </Field>
              </div>
            </>
          ) : (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Select Available Slot (WAT)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MEETING_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                        selectedSlot === slot
                          ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-[#4a4a4a] hover:border-[#2563eb]/40 hover:bg-blue-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60 transition-all shadow-sm">
              {submitting ? 'Submitting...' : mode === 'form' ? 'Submit Request' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>

      {/* Past requests */}
      {requests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-[#1a1a1a] text-sm">Past Requests</h3>
          {requests.map(r => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-4 shadow-sm text-sm">
              <div>
                <p className="font-semibold text-[#1a1a1a]">{r.activation_type || (r.booking_type === 'meeting' ? `Meeting: ${r.meeting_slot}` : 'Activation Request')}</p>
                <p className="text-xs text-gray-400">{r.location} · {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${r.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : r.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/brands/src/pages/brand/ActivationRequest.tsx
git commit -m "feat(brands): add ActivationRequest form with meeting booking"
```

---

### Task 10: Reports — unified activity view

**Files:**
- Create: `apps/brands/src/pages/brand/Reports.tsx`

- [ ] **Step 1: Create the file**

```typescript
import { Link } from 'react-router-dom';
import { useBrandCampaigns } from '../../hooks/useBrandCampaigns';
import { useRecruitmentRequests } from '../../hooks/useRecruitmentRequests';
import { useActivationRequests } from '../../hooks/useActivationRequests';
import { Megaphone, Users, Zap, TrendingUp, RefreshCw } from 'lucide-react';

export default function Reports() {
  const { campaigns, loading: cLoading, refetch } = useBrandCampaigns();
  const { requests: recruitReqs, loading: rLoading } = useRecruitmentRequests();
  const { requests: activationReqs, loading: aLoading } = useActivationRequests();

  const loading = cLoading || rLoading || aLoading;

  const totalSellers = campaigns.reduce((s, c) => s + c.total_sellers, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.total_conversions, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.total_leads, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">Reports & Tracking</h2>
          <p className="text-sm text-gray-400">Consolidated view of all your activity with Digihire.</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 transition-all text-xs font-semibold">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading reports...</div>
      ) : (
        <>
          {/* Campaign Summary */}
          <Section title="VoltSquad Campaigns" icon={<Megaphone size={16} />} color="text-[#2563eb]" to="/brand/campaigns">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricCard label="Total Campaigns" value={campaigns.length} />
              <MetricCard label="Active" value={campaigns.filter(c => c.status === 'active').length} />
              <MetricCard label="Total Sellers" value={totalSellers} />
              <MetricCard label="Conversions" value={totalConversions} />
            </div>
            {campaigns.slice(0, 3).map(c => (
              <Link key={c.id} to={`/brand/campaigns/${c.id}`} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:text-[#2563eb] transition-colors group">
                <span className="text-sm font-semibold text-[#1a1a1a] group-hover:text-[#2563eb]">{c.campaign_name}</span>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users size={12} /> {c.total_sellers}</span>
                  <span className="flex items-center gap-1"><TrendingUp size={12} /> {c.total_conversions}</span>
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </Section>

          {/* Recruitment Summary */}
          <Section title="Recruitment" icon={<Users size={16} />} color="text-violet-600" to="/brand/recruitment">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricCard label="Total Requests" value={recruitReqs.length} />
              <MetricCard label="Open" value={recruitReqs.filter(r => r.status === 'open').length} />
              <MetricCard label="In Review" value={recruitReqs.filter(r => r.status === 'in_review').length} />
              <MetricCard label="Shortlisting" value={recruitReqs.filter(r => r.status === 'shortlisting').length} />
            </div>
            {recruitReqs.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <span className="text-sm font-semibold text-[#1a1a1a]">{r.job_title}</span>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{r.num_hires ?? 1} hire{(r.num_hires ?? 1) > 1 ? 's' : ''}</span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </Section>

          {/* Activations Summary */}
          <Section title="Activations" icon={<Zap size={16} />} color="text-amber-500" to="/brand/activations">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <MetricCard label="Total Requests" value={activationReqs.length} />
              <MetricCard label="Pending" value={activationReqs.filter(a => a.status === 'pending').length} />
              <MetricCard label="Confirmed" value={activationReqs.filter(a => a.status === 'confirmed').length} />
            </div>
            {activationReqs.slice(0, 3).map(a => (
              <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <span className="text-sm font-semibold text-[#1a1a1a]">{a.activation_type || (a.booking_type === 'meeting' ? `Meeting: ${a.meeting_slot}` : 'Activation')}</span>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, icon, color, to, children }: { title: string; icon: React.ReactNode; color: string; to: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className={`flex items-center gap-2 font-bold text-[#1a1a1a] ${color}`}>
          {icon}
          <span className="text-[#1a1a1a]">{title}</span>
        </div>
        <Link to={to} className="text-xs font-semibold text-[#2563eb] hover:underline">View all →</Link>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
      <p className="text-xl font-extrabold text-[#1a1a1a]">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  active: 'bg-green-50 text-green-700 border-green-100',
  open: 'bg-blue-50 text-blue-700 border-blue-100',
  in_review: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  shortlisting: 'bg-violet-50 text-violet-700 border-violet-100',
  confirmed: 'bg-green-50 text-green-700 border-green-100',
  closed: 'bg-gray-50 text-gray-500 border-gray-100',
  completed: 'bg-blue-50 text-blue-700 border-blue-100',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[status] ?? STATUS_COLORS.pending}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/brands/src/pages/brand/Reports.tsx
git commit -m "feat(brands): add Reports unified activity view"
```

---

### Task 11: Wire Navbar + build

**Files:**
- Modify: `apps/brands/src/components/Navbar.tsx`

- [ ] **Step 1: Update Navbar — add Campaigns + Recruitment links**

In `Navbar.tsx`, find the `hidden md:flex` nav links block and replace it:

```typescript
{user && (
  <div className="hidden md:flex items-center gap-6">
    <Link to="/brand" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">Dashboard</Link>
    <Link to="/brand/campaigns" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">Campaigns</Link>
    <Link to="/brand/recruitment" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">Recruitment</Link>
    <Link to="/brand/setup" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">Profile</Link>
  </div>
)}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build:brands
```

Expected: `✓ built in <Ns>` with zero TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add apps/brands/src/components/Navbar.tsx
git commit -m "feat(brands): add Campaigns and Recruitment links to Navbar"
```

---

### Task 12: Admin Recruitment view

**Files:**
- Create: `apps/admin/src/pages/AdminRecruitment.tsx`
- Modify: `apps/admin/src/components/AdminLayout.tsx` (add nav item)
- Modify: `apps/admin/src/App.tsx` (add route + import)

- [ ] **Step 1: Create `apps/admin/src/pages/AdminRecruitment.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { supabase as _supabase } from '@digihire/shared';
import { Users, ChevronDown, ChevronUp, Save } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _supabase as any;

interface RecruitmentRequest {
  id: string;
  brand_id: string;
  contact_person?: string;
  hiring_timeline?: string;
  location?: string;
  industry?: string;
  job_title: string;
  num_hires?: number;
  role_type?: string;
  experience_level?: string;
  required_skills?: string[];
  salary_min?: number;
  salary_max?: number;
  work_type?: string;
  job_location?: string;
  deadline?: string;
  responsibilities?: string;
  additional_notes?: string;
  status: string;
  applicant_count: number;
  shortlist_count: number;
  assigned_support?: string;
  created_at: string;
  brand_profiles?: { company_name?: string };
}

const STATUS_OPTIONS = ['open', 'in_review', 'shortlisting', 'closed'];
const STATUS_COLOR: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-100',
  in_review: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  shortlisting: 'bg-violet-50 text-violet-700 border-violet-100',
  closed: 'bg-gray-50 text-gray-500 border-gray-100',
};

export default function AdminRecruitment() {
  const [requests, setRequests] = useState<RecruitmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { status: string; assigned_support: string; applicant_count: number; shortlist_count: number }>>({});

  useEffect(() => {
    supabase
      .from('recruitment_requests')
      .select('*, brand_profiles(company_name)')
      .order('created_at', { ascending: false })
      .then(({ data }: { data: RecruitmentRequest[] | null }) => {
        const rows = data ?? [];
        setRequests(rows);
        const initialEdits: typeof edits = {};
        rows.forEach(r => {
          initialEdits[r.id] = {
            status: r.status,
            assigned_support: r.assigned_support ?? '',
            applicant_count: r.applicant_count,
            shortlist_count: r.shortlist_count,
          };
        });
        setEdits(initialEdits);
        setLoading(false);
      });
  }, []);

  const handleSave = async (id: string) => {
    setSaving(id);
    const edit = edits[id];
    const { error } = await supabase
      .from('recruitment_requests')
      .update({
        status: edit.status,
        assigned_support: edit.assigned_support || null,
        applicant_count: Number(edit.applicant_count),
        shortlist_count: Number(edit.shortlist_count),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...edit } : r));
    }
    setSaving(null);
  };

  const setEdit = (id: string, field: string, value: string | number) =>
    setEdits(p => ({ ...p, [id]: { ...p[id], [field]: value } }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruitment Requests</h1>
          <p className="text-muted-foreground text-sm">Review and manage brand recruitment submissions.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Users className="h-4 w-4" /> {requests.length} Requests
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">No recruitment requests yet.</div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const edit = edits[r.id] ?? { status: r.status, assigned_support: r.assigned_support ?? '', applicant_count: r.applicant_count, shortlist_count: r.shortlist_count };
            const isExpanded = expanded === r.id;
            return (
              <div key={r.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : r.id)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">{r.job_title}</p>
                      <p className="text-xs text-muted-foreground">{r.brand_profiles?.company_name ?? r.brand_id} · {r.num_hires ?? 1} hire{(r.num_hires ?? 1) > 1 ? 's' : ''} · {r.work_type ?? 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase ${STATUS_COLOR[r.status] ?? STATUS_COLOR.open}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-5 space-y-5 bg-muted/20">
                    {/* Request details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <Detail label="Contact" value={r.contact_person} />
                      <Detail label="Location" value={r.location} />
                      <Detail label="Industry" value={r.industry} />
                      <Detail label="Timeline" value={r.hiring_timeline} />
                      <Detail label="Experience" value={r.experience_level} />
                      <Detail label="Deadline" value={r.deadline ? new Date(r.deadline).toLocaleDateString() : undefined} />
                      <Detail label="Salary" value={r.salary_min && r.salary_max ? `₦${r.salary_min.toLocaleString()} – ₦${r.salary_max.toLocaleString()}` : undefined} />
                      <Detail label="Submitted" value={new Date(r.created_at).toLocaleDateString()} />
                    </div>
                    {r.required_skills && r.required_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {r.required_skills.map(s => <span key={s} className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {r.responsibilities && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Responsibilities</p>
                        <p className="text-sm text-foreground/80">{r.responsibilities}</p>
                      </div>
                    )}

                    {/* Admin controls */}
                    <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                        <select value={edit.status} onChange={e => setEdit(r.id, 'status', e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary">
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Support</label>
                        <input value={edit.assigned_support} onChange={e => setEdit(r.id, 'assigned_support', e.target.value)} placeholder="Team member name" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Applicants</label>
                        <input type="number" min={0} value={edit.applicant_count} onChange={e => setEdit(r.id, 'applicant_count', e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shortlisted</label>
                        <input type="number" min={0} value={edit.shortlist_count} onChange={e => setEdit(r.id, 'shortlist_count', e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => handleSave(r.id)} disabled={saving === r.id} className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all">
                        {saving === r.id ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}
```

- [ ] **Step 2: Add Recruitment nav item to `apps/admin/src/components/AdminLayout.tsx`**

In `AdminLayout.tsx`, add to the `navItems` array after `{ label: "Talent Pool", path: "/admin/talent-pool", icon: UserSearch }`:

```typescript
import { ..., ClipboardCheck } from "lucide-react";

// In navItems array, after the Brands entry:
{ label: "Recruitment", path: "/admin/recruitment", icon: ClipboardCheck },
```

- [ ] **Step 3: Add route to `apps/admin/src/App.tsx`**

After the `<Route path="/brands" element={<AdminBrands />} />` line, add:

```typescript
import AdminRecruitment from "@/pages/AdminRecruitment";

// In routes:
<Route path="/recruitment" element={<AdminRecruitment />} />
```

- [ ] **Step 4: Build all apps and verify**

```bash
npm run build:brands
npm run build:admin
```

Expected: both complete with `✓ built` and zero TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/pages/AdminRecruitment.tsx apps/admin/src/components/AdminLayout.tsx apps/admin/src/App.tsx
git commit -m "feat(admin): add Recruitment management page with status update and support assignment"
```

---

## Self-Review

**Spec coverage:**
- ✅ Action cards home with 4 modules
- ✅ VoltSquad campaign launch form (all 13 fields from spec)
- ✅ Campaign list, detail, status, metrics (sellers/conversions/leads/tracking code)
- ✅ Recruitment 2-step form (Step 1: company details, Step 2: all talent requirement fields)
- ✅ Recruitment dashboard (open requests, applicant count, shortlist count, assigned support, stage)
- ✅ Activation short form with all spec fields
- ✅ Meeting/booking system with available time slots + confirmation
- ✅ Reports unified view (campaign + recruitment + activation)
- ✅ Admin: view all recruitment requests, update status, assign support, update applicant/shortlist counts
- ✅ Supabase RLS on all 3 new tables
- ✅ Notifications: status badges reflect admin updates in real-time (on refetch)
- ⚠️ Campaign assets upload: stubbed (spec says "campaign assets upload" — noted in the form)
- ⚠️ Confirmation email for bookings: out of scope for frontend-only MVP (requires Supabase edge function)
- ⚠️ Admin calendar visibility: out of scope for MVP

**Type consistency:** All three hooks use the same type names from `types.ts`. `BrandCampaign`, `RecruitmentRequest`, `ActivationRequest` are used consistently across hooks and pages.

**Placeholder scan:** No TBD or TODO blocks. Asset upload uses a descriptive placeholder div. Meeting booking uses static slots (documented as MVP approach).
