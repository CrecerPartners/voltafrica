# Talent Pool Firebase → Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `Digihire-Talent-Pool--main` into the monorepo by distributing pages across `apps/talentpool/`, `apps/brands/`, and `apps/admin/`, replacing all Firebase with Supabase.

**Architecture:** Source files are copied from `Digihire-Talent-Pool--main/Digihire-Talent-Pool--main/src/` into their target apps, then every Firebase import and call is replaced with the Supabase equivalent from `@digihire/shared`. Six new Supabase tables hold talent/brand profile data. The existing shared `AuthContext` handles auth — no Firebase dependency anywhere.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v3, Supabase (via `@digihire/shared`), motion (framer motion), react-router-dom, npm workspaces.

**Source directory shorthand:** `SRC` = `Digihire-Talent-Pool--main/Digihire-Talent-Pool--main/src`

---

## Phase 1 — Database & Dependencies

### Task 1: Add `motion` dependency and create Supabase migration

**Files:**
- Modify: `package.json` (root)
- Create: `supabase/migrations/<timestamp>_talent_pool.sql`

- [ ] **Step 1: Add `motion` to root package.json dependencies**

In `package.json` at root, add `"motion": "^12.0.0"` inside the `"dependencies"` object (alphabetically between `"lucide-react"` and `"next-themes"`):

```json
"motion": "^12.0.0",
```

- [ ] **Step 2: Install**

```bash
npm install
```

Expected: resolves without error, `motion` appears in `node_modules/`.

- [ ] **Step 3: Create the migration file**

Get a timestamp with: `date +%Y%m%d%H%M%S` (use current datetime, e.g. `20260504120000`).

Create `supabase/migrations/20260504120000_talent_pool.sql`:

```sql
-- Talent Profiles
create table if not exists talent_profiles (
  id                    uuid primary key references auth.users on delete cascade,
  full_name             text,
  phone                 text,
  gender                text,
  date_of_birth         text,
  city                  text,
  state                 text,
  country               text,
  preferred_work_location text,
  work_preference       text,
  job_type_preference   text[],
  role_interests        text[],
  experience_years      int,
  industry_experience   text[],
  bio                   text,
  education             jsonb default '[]',
  certifications        jsonb default '[]',
  work_history          jsonb default '[]',
  skills                text[],
  languages             text[],
  linkedin_url          text,
  portfolio_url         text,
  cv_url                text,
  profile_photo_url     text,
  expected_salary       text,
  availability          text,
  status                text not null default 'incomplete',
  profile_completion    int not null default 0,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Brand Profiles
create table if not exists brand_profiles (
  id            uuid primary key references auth.users on delete cascade,
  company_name  text,
  contact_name  text,
  phone         text,
  website       text,
  company_type  text,
  industry      text,
  company_size  text,
  city          text,
  country       text,
  primary_goal  text,
  description   text,
  logo_url      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Talent Academy Courses (independent of voltsquad training)
create table if not exists talent_courses (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  thumbnail_url  text,
  category       text,
  modules        jsonb default '[]',
  has_certificate bool default false,
  is_published   bool default false,
  created_at     timestamptz default now()
);

-- Talent Course Enrollments
create table if not exists talent_enrollments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users on delete cascade,
  course_id         uuid not null references talent_courses on delete cascade,
  progress          int default 0,
  completed_modules text[] default '{}',
  completed_at      timestamptz,
  created_at        timestamptz default now(),
  unique (user_id, course_id)
);

-- Talent Webinars
create table if not exists talent_webinars (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  scheduled_at     timestamptz,
  duration_minutes int,
  meeting_url      text,
  is_published     bool default false,
  created_at       timestamptz default now()
);

-- Admin Internal Notes on Talent
create table if not exists talent_admin_notes (
  id         uuid primary key default gen_random_uuid(),
  talent_id  uuid not null references talent_profiles on delete cascade,
  admin_id   uuid not null references auth.users,
  note       text not null,
  created_at timestamptz default now()
);

-- RLS
alter table talent_profiles enable row level security;
alter table brand_profiles enable row level security;
alter table talent_courses enable row level security;
alter table talent_enrollments enable row level security;
alter table talent_webinars enable row level security;
alter table talent_admin_notes enable row level security;

-- talent_profiles policies
create policy "talent can manage own profile"
  on talent_profiles for all
  using (auth.uid() = id);

create policy "admin can manage all talent profiles"
  on talent_profiles for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- brand_profiles policies
create policy "brand can manage own profile"
  on brand_profiles for all
  using (auth.uid() = id);

create policy "admin can manage all brand profiles"
  on brand_profiles for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- talent_courses policies
create policy "published courses readable by all authenticated"
  on talent_courses for select
  using (is_published = true and auth.role() = 'authenticated');

create policy "admin can manage courses"
  on talent_courses for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- talent_enrollments policies
create policy "user can manage own enrollments"
  on talent_enrollments for all
  using (auth.uid() = user_id);

create policy "admin can manage all enrollments"
  on talent_enrollments for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- talent_webinars policies
create policy "published webinars readable by authenticated"
  on talent_webinars for select
  using (is_published = true and auth.role() = 'authenticated');

create policy "admin can manage webinars"
  on talent_webinars for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- talent_admin_notes policies
create policy "admin can manage notes"
  on talent_admin_notes for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');
```

- [ ] **Step 4: Apply migration**

```bash
npx supabase db push
```

Expected: migration applies without error. Tables appear in Supabase dashboard.

- [ ] **Step 5: Commit**

```bash
git add package.json supabase/migrations/
git commit -m "feat: add motion dep and talent pool Supabase migration"
```

---

## Phase 2 — `apps/talentpool/`

### Task 2: Types, ProtectedRoute, Navbar

**Files:**
- Create: `apps/talentpool/src/types.ts`
- Create: `apps/talentpool/src/components/ProtectedRoute.tsx`
- Create: `apps/talentpool/src/components/Navbar.tsx`

- [ ] **Step 1: Create `apps/talentpool/src/types.ts`**

```typescript
export type TalentStatus = 'incomplete' | 'complete' | 'under_review' | 'shortlisted' | 'matched' | 'archived';

export interface TalentProfile {
  id: string;
  full_name: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  city?: string;
  state?: string;
  country?: string;
  preferred_work_location?: string;
  work_preference?: string;
  job_type_preference?: string[];
  role_interests?: string[];
  experience_years?: number;
  industry_experience?: string[];
  bio?: string;
  education?: any[];
  certifications?: any[];
  work_history?: any[];
  skills?: string[];
  languages?: string[];
  linkedin_url?: string;
  portfolio_url?: string;
  cv_url?: string;
  profile_photo_url?: string;
  expected_salary?: string;
  availability?: string;
  status: TalentStatus;
  profile_completion?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TalentCourse {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  category?: string;
  modules: { title: string; duration_minutes?: number; content?: string }[];
  has_certificate: boolean;
  is_published: boolean;
  created_at?: string;
}

export interface TalentEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_modules: string[];
  completed_at?: string;
  created_at?: string;
}
```

- [ ] **Step 2: Create `apps/talentpool/src/components/ProtectedRoute.tsx`**

```typescript
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@digihire/shared';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  if (!user || user.user_metadata?.account_type !== 'talent') return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

- [ ] **Step 3: Create `apps/talentpool/src/components/Navbar.tsx`**

```typescript
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@digihire/shared';
import { Settings } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = user?.user_metadata?.name ?? user?.email ?? '';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white font-bold text-xl">D</div>
            <span className="text-xl font-bold tracking-tight text-slate-800">digihire.io</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/academy" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">Academy</Link>
            {user && <Link to="/talent" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">My Profile</Link>}
          </div>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800">{displayName}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">talent</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                {displayName.charAt(0)}
              </div>
              <button
                onClick={() => navigate('/talent')}
                className="p-2 text-slate-400 hover:text-sky-600 transition-all border border-transparent hover:border-sky-100 hover:bg-sky-50 rounded-lg"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={handleLogout}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 ml-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest">Login</Link>
              <Link to="/signup" className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-sky-200 hover:bg-sky-700 transition-all uppercase tracking-widest">
                Join Pool
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/talentpool/src/
git commit -m "feat(talentpool): add types, ProtectedRoute, Navbar"
```

---

### Task 3: Auth pages — Login, Signup, VerifyEmail

**Files:**
- Create: `apps/talentpool/src/pages/Login.tsx`
- Create: `apps/talentpool/src/pages/Signup.tsx`
- Create: `apps/talentpool/src/pages/VerifyEmail.tsx`

- [ ] **Step 1: Create `apps/talentpool/src/pages/Login.tsx`**

```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@digihire/shared';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    } else {
      navigate('/talent');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-sm border border-gray-200"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600 shadow-sm">
            <LogIn size={24} />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-800">Welcome back</h2>
          <p className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-widest">Sign in to your talent account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-100">{error}</div>
          )}
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300"><Mail size={16} /></div>
                <input type="email" required className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder-slate-300" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300"><Lock size={16} /></div>
                <input type="password" required className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder-slate-300" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-lg bg-sky-600 py-4 text-xs font-bold text-white hover:bg-sky-700 focus:outline-none disabled:opacity-50 transition-all shadow-lg shadow-sky-100 uppercase tracking-widest">
            {loading ? 'Authenticating...' : 'Sign in'}
            {!loading && <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={14} />}
          </button>
        </form>
        <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-4 border-t border-gray-50">
          Need an account? <Link to="/signup" className="text-sky-600 hover:text-sky-700 ml-1">Join the Talent Pool</Link>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/talentpool/src/pages/Signup.tsx`**

```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, supabase } from '@digihire/shared';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      const { error: signUpErr } = await signUp(formData.email, formData.password, formData.fullName, undefined, 'talent');
      if (signUpErr) throw signUpErr;
      // Create initial talent profile row
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('talent_profiles').upsert({
          id: user.id,
          full_name: formData.fullName,
          phone: formData.phoneNumber,
          status: 'incomplete',
          profile_completion: 0,
        });
      }
      navigate('/verify-email');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl grid md:grid-cols-2 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="bg-slate-900 p-10 text-white flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-sky-500 font-bold text-xl mb-12">D</div>
            <h2 className="text-3xl font-bold leading-tight">Join the Digihire Talent Pool</h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">Create your professional account to start matching with top roles at elite brands.</p>
          </div>
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full border border-sky-500/30 flex items-center justify-center text-[10px] font-bold text-sky-400">01</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Step 01</span>
                <span className="text-xs font-bold">Account Registration</span>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-40">
              <div className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">02</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Step 02</span>
                <span className="text-xs font-bold">Profile Setup</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-10">
          <form className="space-y-5" onSubmit={handleSignup}>
            {error && <div className="rounded-lg bg-red-50 p-4 text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-100">{error}</div>}
            <div className="space-y-4">
              <InputField label="Full Name" name="fullName" type="text" placeholder="John Doe" icon={<User size={16} />} value={formData.fullName} onChange={handleChange} />
              <InputField label="Email" name="email" type="email" placeholder="john@example.com" icon={<Mail size={16} />} value={formData.email} onChange={handleChange} />
              <InputField label="Phone" name="phoneNumber" type="tel" placeholder="+1 234 567 890" icon={<Phone size={16} />} value={formData.phoneNumber} onChange={handleChange} />
              <InputField label="Password" name="password" type="password" placeholder="••••••••" icon={<Lock size={16} />} value={formData.password} onChange={handleChange} />
              <InputField label="Confirm" name="confirmPassword" type="password" placeholder="••••••••" icon={<Lock size={16} />} value={formData.confirmPassword} onChange={handleChange} />
            </div>
            <button type="submit" disabled={loading} className="group flex w-full justify-center rounded-lg bg-sky-600 py-4 text-xs font-bold text-white hover:bg-sky-700 focus:outline-none disabled:opacity-50 transition-all shadow-lg shadow-sky-100 uppercase tracking-widest">
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={14} />}
            </button>
          </form>
          <div className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-gray-50 pt-6">
            Already registered? <Link to="/login" className="text-sky-600 hover:text-sky-700 ml-1">Login here</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, name, type, placeholder, icon, value, onChange }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300">{icon}</div>
        <input name={name} type={type} required className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder-slate-300 font-medium" placeholder={placeholder} value={value} onChange={onChange} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `apps/talentpool/src/pages/VerifyEmail.tsx`**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, supabase } from '@digihire/shared';
import { motion } from 'motion/react';
import { Mail, CheckCircle, RefreshCw, LogOut, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const { user, signOut } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!user?.email) return;
    setSending(true);
    setError('');
    const { error: err } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (err) setError(err.message);
    else setSuccess('Verification email sent! Check your inbox.');
    setSending(false);
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setError('');
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    if (freshUser?.email_confirmed_at) {
      setSuccess('Email verified! Redirecting...');
      setTimeout(() => navigate('/talent'), 1500);
    } else {
      setError('Email not yet verified. Click the link in your email and try again.');
    }
    setChecking(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#fafafa] px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm border border-gray-100 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-500">
          <Mail size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h1>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          We've sent a verification link to <span className="font-bold text-slate-900">{user?.email}</span>.
          <span className="text-xs italic block mt-2 text-slate-400">Check your Spam folder if you don't see it.</span>
        </p>
        {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-100">{error}</div>}
        {success && <div className="mb-6 rounded-lg bg-green-50 p-4 text-[10px] font-bold text-green-500 uppercase tracking-widest border border-green-100">{success}</div>}
        <div className="space-y-4">
          <button onClick={handleCheckStatus} disabled={checking} className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-4 text-xs font-bold text-white hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 uppercase tracking-widest disabled:opacity-50">
            {checking ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />} I've Verified My Email
          </button>
          <button onClick={handleResend} disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-4 text-xs font-bold text-slate-600 hover:bg-gray-50 transition-all uppercase tracking-widest disabled:opacity-50">
            {sending ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />} Resend Email
          </button>
        </div>
        <div className="mt-10 border-t border-gray-50 pt-8 flex justify-between items-center">
          <button onClick={() => signOut()} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
            <LogOut size={12} /> Sign Out
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Step 1.5 of 2 <ArrowRight size={12} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/talentpool/src/pages/
git commit -m "feat(talentpool): add Login, Signup, VerifyEmail pages"
```

---

### Task 4: Talent hooks

**Files:**
- Create: `apps/talentpool/src/hooks/useTalentProfile.ts`
- Create: `apps/talentpool/src/hooks/useTalentCourses.ts`
- Create: `apps/talentpool/src/hooks/useTalentEnrollments.ts`

- [ ] **Step 1: Create `apps/talentpool/src/hooks/useTalentProfile.ts`**

```typescript
import { useState, useEffect } from 'react';
import { supabase, useAuth } from '@digihire/shared';
import { TalentProfile } from '../types';

export function useTalentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    supabase
      .from('talent_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (mounted) { setProfile(data); setLoading(false); }
      });
    return () => { mounted = false; };
  }, [user]);

  const updateProfile = async (updates: Partial<TalentProfile>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('talent_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { error };
  };

  return { profile, loading, setProfile, updateProfile };
}
```

- [ ] **Step 2: Create `apps/talentpool/src/hooks/useTalentCourses.ts`**

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@digihire/shared';
import { TalentCourse } from '../types';

export function useTalentCourses() {
  const [courses, setCourses] = useState<TalentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('talent_courses')
      .select('*')
      .eq('is_published', true)
      .then(({ data }) => {
        if (mounted) { setCourses(data ?? []); setLoading(false); }
      });
    return () => { mounted = false; };
  }, []);

  return { courses, loading };
}

export function useTalentCourse(id: string) {
  const [course, setCourse] = useState<TalentCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    supabase
      .from('talent_courses')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (mounted) { setCourse(data); setLoading(false); }
      });
    return () => { mounted = false; };
  }, [id]);

  return { course, loading };
}
```

- [ ] **Step 3: Create `apps/talentpool/src/hooks/useTalentEnrollments.ts`**

```typescript
import { useState, useEffect } from 'react';
import { supabase, useAuth } from '@digihire/shared';
import { TalentEnrollment } from '../types';

export function useTalentEnrollments() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<TalentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    supabase
      .from('talent_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (mounted) { setEnrollments(data ?? []); setLoading(false); }
      });
    return () => { mounted = false; };
  }, [user]);

  const enroll = async (courseId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('talent_enrollments')
      .insert({ user_id: user.id, course_id: courseId, progress: 0, completed_modules: [] })
      .select()
      .single();
    if (!error && data) setEnrollments(prev => [...prev, data]);
    return { error };
  };

  return { enrollments, loading, enroll };
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/talentpool/src/hooks/
git commit -m "feat(talentpool): add talent hooks (profile, courses, enrollments)"
```

---

### Task 5: ProfileSetup page

**Files:**
- Create: `apps/talentpool/src/pages/talent/ProfileSetup.tsx`

Copy `SRC/pages/talent/ProfileSetup.tsx` and apply these exact changes:

- [ ] **Step 1: Replace imports at the top**

Remove:
```typescript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
```

Add:
```typescript
import { supabase, useAuth } from '@digihire/shared';
```

- [ ] **Step 2: Replace the `Props` interface and component signature**

The component receives `profile: TalentProfile | null` and `onUpdate`. Change the `TalentProfile` import:

Remove:
```typescript
import { TalentProfile } from '../../types';
```

Add:
```typescript
import { TalentProfile } from '../types';
```

- [ ] **Step 3: Replace the progress fields array in `useMemo`**

Remove:
```typescript
const fields = [
  'fullName', 'phone', 'gender', 'bio', 'currentCity', 'state', 'country',
  'workPreference', 'yearsOfExperience', 'expectedSalary', 'jobTypePreference',
  'roleInterest', 'skills', 'linkedinProfile', 'cvUrl', 'profilePhotoUrl', 'industryExperience'
];
const filledFields = fields.filter(field => {
  const val = formData[field as keyof TalentProfile];
```

Add:
```typescript
const fields: (keyof TalentProfile)[] = [
  'full_name', 'phone', 'gender', 'bio', 'city', 'state', 'country',
  'work_preference', 'experience_years', 'expected_salary', 'job_type_preference',
  'role_interests', 'skills', 'linkedin_url', 'cv_url', 'profile_photo_url', 'industry_experience'
];
const filledFields = fields.filter(field => {
  const val = formData[field];
```

- [ ] **Step 4: Replace `handleSubmit` body**

Remove the entire Firestore block inside `handleSubmit`:
```typescript
const profileRef = doc(db, 'talentProfiles', profile.userId);
// ... entire try block with updateDoc ...
```

Replace with:
```typescript
const { error } = await supabase
  .from('talent_profiles')
  .update({
    full_name: formData.full_name,
    phone: formData.phone,
    gender: formData.gender,
    date_of_birth: formData.date_of_birth,
    city: formData.city,
    state: formData.state,
    country: formData.country,
    preferred_work_location: formData.preferred_work_location,
    work_preference: formData.work_preference,
    job_type_preference: formData.job_type_preference,
    role_interests: formData.role_interests,
    experience_years: formData.experience_years,
    industry_experience: formData.industry_experience,
    bio: formData.bio,
    education: formData.education,
    certifications: formData.certifications,
    work_history: formData.work_history,
    skills: formData.skills,
    languages: formData.languages,
    linkedin_url: formData.linkedin_url,
    portfolio_url: formData.portfolio_url,
    cv_url: formData.cv_url,
    profile_photo_url: formData.profile_photo_url,
    expected_salary: formData.expected_salary,
    availability: formData.availability,
    status: progress === 100 ? 'complete' : 'incomplete',
    profile_completion: progress,
    updated_at: new Date().toISOString(),
  })
  .eq('id', profile!.id);
if (error) throw error;
onUpdate({ ...profile!, ...formData, status: progress === 100 ? 'complete' : 'incomplete', profile_completion: progress } as TalentProfile);
```

- [ ] **Step 5: Replace all Firebase field references in the JSX**

Use find-and-replace across the file:

| Find | Replace |
|---|---|
| `profile?.userId` | `profile?.id` |
| `formData.fullName` | `formData.full_name` |
| `formData.currentCity` | `formData.city` |
| `formData.yearsOfExperience` | `formData.experience_years` |
| `formData.roleInterest` | `formData.role_interests` |
| `formData.availabilityStatus` | `formData.availability` |
| `formData.workPreference` | `formData.work_preference` |
| `formData.expectedSalary` | `formData.expected_salary` |
| `formData.linkedinProfile` | `formData.linkedin_url` |
| `formData.portfolioUrl` | `formData.portfolio_url` |
| `formData.cvUrl` | `formData.cv_url` |
| `formData.profilePhotoUrl` | `formData.profile_photo_url` |
| `formData.jobTypePreference` | `formData.job_type_preference` |
| `formData.industryExperience` | `formData.industry_experience` |
| `formData.profileProgress` | `formData.profile_completion` |
| `name="fullName"` | `name="full_name"` |
| `name="currentCity"` | `name="city"` |
| `name="yearsOfExperience"` | `name="experience_years"` |
| `name="roleInterest"` | `name="role_interests"` |
| `name="workPreference"` | `name="work_preference"` |
| `name="expectedSalary"` | `name="expected_salary"` |
| `name="linkedinProfile"` | `name="linkedin_url"` |
| `name="portfolioUrl"` | `name="portfolio_url"` |
| `name="jobTypePreference"` | `name="job_type_preference"` |
| `name="industryExperience"` | `name="industry_experience"` |
| `name="availabilityStatus"` | `name="availability"` |

Also remove the import of `handleFirestoreError` and `OperationType` from the catch block — replace with just `setError(err.message)`.

- [ ] **Step 6: Remove file upload handler (stub it)**

The `handleFileUpload` function calls Firebase Storage. Replace its body with a stub that shows an alert:

```typescript
const handleFileUpload = async (_e: React.ChangeEvent<HTMLInputElement>, _field: string) => {
  alert('File upload will be wired to Supabase Storage in a follow-on task.');
};
```

- [ ] **Step 7: Commit**

```bash
git add apps/talentpool/src/pages/talent/ProfileSetup.tsx
git commit -m "feat(talentpool): add ProfileSetup page (Supabase)"
```

---

### Task 6: TalentProfileView and TalentDashboard pages

**Files:**
- Create: `apps/talentpool/src/pages/talent/TalentProfileView.tsx`
- Create: `apps/talentpool/src/pages/talent/TalentDashboard.tsx`

- [ ] **Step 1: Create `apps/talentpool/src/pages/talent/TalentProfileView.tsx`**

Copy `SRC/pages/talent/TalentProfileView.tsx` and apply:

Remove:
```typescript
import { TalentProfile } from '../../types';
```
Add:
```typescript
import { TalentProfile } from '../types';
```

Replace all field references using this map (same fields as Task 5):

| Find | Replace |
|---|---|
| `profile.fullName` | `profile.full_name` |
| `profile.roleInterest` | `profile.role_interests` |
| `profile.currentCity` | `profile.city` |
| `profile.yearsOfExperience` | `profile.experience_years` |
| `profile.availabilityStatus` | `profile.availability` |
| `profile.workPreference` | `profile.work_preference` |
| `profile.expectedSalary` | `profile.expected_salary` |
| `profile.linkedinProfile` | `profile.linkedin_url` |
| `profile.portfolioUrl` | `profile.portfolio_url` |
| `profile.jobTypePreference` | `profile.job_type_preference` |

- [ ] **Step 2: Create `apps/talentpool/src/pages/talent/TalentDashboard.tsx`**

Copy `SRC/pages/talent/TalentDashboard.tsx` and apply:

Remove Firebase imports:
```typescript
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TalentProfile } from '../../types';
```

Add:
```typescript
import { useAuth } from '@digihire/shared';
import { TalentProfile } from '../types';
import { useTalentProfile } from '../../hooks/useTalentProfile';
```

Replace the `useEffect` profile-fetch block with hook usage:

Remove:
```typescript
const [profile, setProfile] = useState<TalentProfile | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user) return;
  let isMounted = true;
  const fetchProfile = async () => { ... };
  fetchProfile();
  return () => { isMounted = false; };
}, [user]);
```

Add:
```typescript
const { profile, loading, setProfile } = useTalentProfile();
```

Replace the `handleProfileUpdate` (if present) to call `setProfile` directly since `useTalentProfile` manages state.

Also fix `user.uid` → `user?.id` anywhere it appears, and `user?.fullName` → `user?.user_metadata?.name`.

Fix the import of child components:
```typescript
import ProfileSetup from './ProfileSetup';
import TalentProfileView from './TalentProfileView';
```
These stay the same (same relative directory).

- [ ] **Step 3: Commit**

```bash
git add apps/talentpool/src/pages/talent/
git commit -m "feat(talentpool): add TalentDashboard and TalentProfileView pages"
```

---

### Task 7: Academy pages

**Files:**
- Create: `apps/talentpool/src/pages/academy/AcademyPage.tsx`
- Create: `apps/talentpool/src/pages/academy/CourseDetailPage.tsx`

- [ ] **Step 1: Create `apps/talentpool/src/pages/academy/AcademyPage.tsx`**

Copy `SRC/pages/academy/AcademyPage.tsx` and apply:

Remove:
```typescript
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course } from '../../types';
```

Add:
```typescript
import { TalentCourse } from '../types';
import { useTalentCourses } from '../../hooks/useTalentCourses';
```

Replace the `useState` + `useEffect` data-fetch block:

Remove:
```typescript
const [courses, setCourses] = useState<Course[]>([]);
const [loading, setLoading] = useState(true);
useEffect(() => { ... fetchCourses ... }, []);
```

Add:
```typescript
const { courses, loading } = useTalentCourses();
```

Replace `Course` type references with `TalentCourse`.

Replace `course.thumbnailUrl` → `course.thumbnail_url`, `course.hasCertificate` → `course.has_certificate`.

Remove the seed-data `useEffect` from `App.tsx` (that was in the Firebase `App.tsx`) — do not port the seed logic.

- [ ] **Step 2: Create `apps/talentpool/src/pages/academy/CourseDetailPage.tsx`**

Copy `SRC/pages/academy/CourseDetailPage.tsx` and apply:

Remove Firebase imports, add:
```typescript
import { useParams } from 'react-router-dom';
import { TalentCourse } from '../types';
import { useTalentCourse } from '../../hooks/useTalentCourses';
import { useTalentEnrollments } from '../../hooks/useTalentEnrollments';
```

Replace Firestore course fetch with:
```typescript
const { id } = useParams<{ id: string }>();
const { course, loading } = useTalentCourse(id!);
const { enrollments, enroll } = useTalentEnrollments();
const isEnrolled = enrollments.some(e => e.course_id === id);
```

Replace `course.thumbnailUrl` → `course.thumbnail_url`, `course.hasCertificate` → `course.has_certificate`, `course.authorId` → remove (not in schema).

Replace the enroll Firestore call with `await enroll(id!)`.

- [ ] **Step 3: Commit**

```bash
git add apps/talentpool/src/pages/academy/
git commit -m "feat(talentpool): add AcademyPage and CourseDetailPage"
```

---

### Task 8: Talentpool App.tsx

**Files:**
- Modify: `apps/talentpool/src/App.tsx`

- [ ] **Step 1: Replace `apps/talentpool/src/App.tsx` entirely**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider, ThemeProvider, TooltipProvider, Toaster } from '@digihire/shared';
import { Toaster as Sonner } from '@digihire/shared';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import TalentDashboard from './pages/talent/TalentDashboard';
import AcademyPage from './pages/academy/AcademyPage';
import CourseDetailPage from './pages/academy/CourseDetailPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24, staleTime: 1000 * 60 * 5 } },
});
const persister = createSyncStoragePersister({ storage: window.localStorage });

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-[#fafafa] font-sans text-[#1a1a1a]">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/academy" element={<AcademyPage />} />
                    <Route path="/academy/course/:id" element={<CourseDetailPage />} />
                    <Route path="/talent/*" element={<ProtectedRoute><TalentDashboard /></ProtectedRoute>} />
                    <Route path="*" element={<Login />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
```

- [ ] **Step 2: Verify talentpool builds**

```bash
npm run build:talentpool
```

Expected: `tsc + vite build` completes with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/talentpool/src/App.tsx
git commit -m "feat(talentpool): wire App.tsx with full routing and providers"
```

---

## Phase 3 — `apps/brands/`

### Task 9: Brand types, ProtectedRoute, Navbar

**Files:**
- Create: `apps/brands/src/types.ts`
- Create: `apps/brands/src/components/ProtectedRoute.tsx`
- Create: `apps/brands/src/components/Navbar.tsx`

- [ ] **Step 1: Create `apps/brands/src/types.ts`**

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
```

- [ ] **Step 2: Create `apps/brands/src/components/ProtectedRoute.tsx`**

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@digihire/shared';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  if (!user || user.user_metadata?.account_type !== 'brand') return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

- [ ] **Step 3: Create `apps/brands/src/components/Navbar.tsx`**

```typescript
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@digihire/shared';
import { Settings } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.name ?? user?.email ?? '';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white font-bold text-xl">D</div>
            <span className="text-xl font-bold tracking-tight text-slate-800">digihire.io</span>
          </Link>
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/brand" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">Dashboard</Link>
              <Link to="/brand/setup" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">Company Profile</Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800">{displayName}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">brand</span>
              </div>
              <button onClick={() => navigate('/brand')} className="p-2 text-slate-400 hover:text-sky-600 transition-all border border-transparent hover:border-sky-100 hover:bg-sky-50 rounded-lg">
                <Settings size={18} />
              </button>
              <button onClick={() => signOut()} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 ml-2">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest">Login</Link>
              <Link to="/signup" className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-sky-200 hover:bg-sky-700 transition-all uppercase tracking-widest">Register Brand</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/brands/src/
git commit -m "feat(brands): add types, ProtectedRoute, Navbar"
```

---

### Task 10: Brand auth pages

**Files:**
- Create: `apps/brands/src/pages/Login.tsx`
- Create: `apps/brands/src/pages/Signup.tsx`
- Create: `apps/brands/src/pages/VerifyEmail.tsx`

- [ ] **Step 1: Create `apps/brands/src/pages/Login.tsx`**

Same structure as talentpool Login.tsx but redirect to `/brand` on success and label says "brand account":

```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@digihire/shared';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signIn(email, password);
    if (err) { setError(err.message || 'Failed to login'); setLoading(false); }
    else navigate('/brand');
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600 shadow-sm"><LogIn size={24} /></div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-800">Brand Login</h2>
          <p className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-widest">Sign in to your brand account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="rounded-lg bg-red-50 p-4 text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-100">{error}</div>}
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300"><Mail size={16} /></div>
                <input type="email" required className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder-slate-300" placeholder="hr@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300"><Lock size={16} /></div>
                <input type="password" required className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder-slate-300" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-lg bg-sky-600 py-4 text-xs font-bold text-white hover:bg-sky-700 focus:outline-none disabled:opacity-50 transition-all shadow-lg shadow-sky-100 uppercase tracking-widest">
            {loading ? 'Authenticating...' : 'Sign in'}
            {!loading && <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={14} />}
          </button>
        </form>
        <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-4 border-t border-gray-50">
          Need an account? <Link to="/signup" className="text-sky-600 hover:text-sky-700 ml-1">Register your Brand</Link>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/brands/src/pages/Signup.tsx`**

Copy `SRC/pages/BrandSignupPage.tsx` and apply:

Remove:
```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
```

Add:
```typescript
import { useAuth, supabase } from '@digihire/shared';
```

Replace `handleSignup` body:

```typescript
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
  setLoading(true);
  setError('');
  try {
    const { error: signUpErr } = await signUp(formData.email, formData.password, formData.contactName, undefined, 'brand');
    if (signUpErr) throw signUpErr;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('brand_profiles').upsert({
        id: user.id,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        phone: formData.phoneNumber,
      });
    }
    navigate('/verify-email');
  } catch (err: any) {
    setError(err.message || 'Failed to create account');
    setLoading(false);
  }
};
```

Add `const { signUp } = useAuth();` to the component.

Fix the navigate import (already from `react-router-dom`).

- [ ] **Step 3: Create `apps/brands/src/pages/VerifyEmail.tsx`**

Copy verbatim from `apps/talentpool/src/pages/VerifyEmail.tsx` — it is identical. Change the redirect target from `/talent` to `/brand` (two occurrences).

- [ ] **Step 4: Commit**

```bash
git add apps/brands/src/pages/
git commit -m "feat(brands): add Login, Signup, VerifyEmail pages"
```

---

### Task 11: Brand hook and pages

**Files:**
- Create: `apps/brands/src/hooks/useBrandProfile.ts`
- Create: `apps/brands/src/pages/brand/BrandSetup.tsx`
- Create: `apps/brands/src/pages/brand/BrandDashboard.tsx`

- [ ] **Step 1: Create `apps/brands/src/hooks/useBrandProfile.ts`**

```typescript
import { useState, useEffect } from 'react';
import { supabase, useAuth } from '@digihire/shared';
import { BrandProfile } from '../types';

export function useBrandProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    supabase
      .from('brand_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (mounted) { setProfile(data); setLoading(false); }
      });
    return () => { mounted = false; };
  }, [user]);

  const updateProfile = async (updates: Partial<BrandProfile>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('brand_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { error };
  };

  return { profile, loading, setProfile, updateProfile };
}
```

- [ ] **Step 2: Create `apps/brands/src/pages/brand/BrandSetup.tsx`**

Copy `SRC/pages/brand/BrandSetup.tsx` and apply:

Remove:
```typescript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { BrandProfile } from '../../types';
```

Add:
```typescript
import { BrandProfile } from '../types';
import { useBrandProfile } from '../../hooks/useBrandProfile';
```

The component currently takes `profile` and `onUpdate` as props. Change it to use the hook instead:

Replace props signature:
```typescript
// Remove: interface Props { profile: BrandProfile | null; onUpdate: ... }
// Remove: export default function BrandSetup({ profile, onUpdate }: Props)
export default function BrandSetup() {
  const { profile, updateProfile } = useBrandProfile();
```

Replace `handleSubmit` body — remove Firestore block, replace with:
```typescript
const { error } = await updateProfile({
  company_name: formData.company_name ?? formData.companyName,
  contact_name: formData.contact_name ?? formData.contactPerson,
  phone: formData.phone,
  website: formData.website,
  company_type: formData.company_type ?? formData.companyType,
  industry: formData.industry,
  company_size: formData.company_size ?? formData.companySize,
  city: formData.city,
  country: formData.country,
  primary_goal: formData.primary_goal ?? formData.primaryGoal,
});
if (error) throw error;
alert('Company profile updated!');
```

Replace field references in JSX:

| Find | Replace |
|---|---|
| `formData.companyName` | `formData.company_name` |
| `formData.contactPerson` | `formData.contact_name` |
| `formData.companyType` | `formData.company_type` |
| `formData.companySize` | `formData.company_size` |
| `formData.primaryGoal` | `formData.primary_goal` |
| `name="companyName"` | `name="company_name"` |
| `name="contactPerson"` | `name="contact_name"` |
| `name="companyType"` | `name="company_type"` |
| `name="companySize"` | `name="company_size"` |
| `name="primaryGoal"` | `name="primary_goal"` |
| `profile?.userId` | `profile?.id` |

- [ ] **Step 3: Create `apps/brands/src/pages/brand/BrandDashboard.tsx`**

Copy `SRC/pages/brand/BrandDashboard.tsx` and apply:

Remove Firebase imports, add:
```typescript
import { useAuth } from '@digihire/shared';
import { BrandProfile } from '../types';
import { useBrandProfile } from '../../hooks/useBrandProfile';
```

Replace the `useState` + `useEffect` fetch block with:
```typescript
const { profile, loading } = useBrandProfile();
```

Replace all field references:

| Find | Replace |
|---|---|
| `profile?.companyName` | `profile?.company_name` |
| `profile?.contactPerson` | `profile?.contact_name` |
| `profile?.industry` | `profile?.industry` (unchanged) |
| `user.uid` | `user?.id` |

Replace the `BrandSetup` usage — since `BrandSetup` no longer takes props, remove `profile={profile} onUpdate={...}` from its JSX usage.

- [ ] **Step 4: Commit**

```bash
git add apps/brands/src/
git commit -m "feat(brands): add useBrandProfile, BrandSetup, BrandDashboard"
```

---

### Task 12: Brands App.tsx

**Files:**
- Modify: `apps/brands/src/App.tsx`

- [ ] **Step 1: Replace `apps/brands/src/App.tsx` entirely**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider, ThemeProvider, TooltipProvider, Toaster } from '@digihire/shared';
import { Toaster as Sonner } from '@digihire/shared';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import BrandDashboard from './pages/brand/BrandDashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24, staleTime: 1000 * 60 * 5 } },
});
const persister = createSyncStoragePersister({ storage: window.localStorage });

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-[#fafafa] font-sans text-[#1a1a1a]">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/brand/*" element={<ProtectedRoute><BrandDashboard /></ProtectedRoute>} />
                    <Route path="*" element={<Login />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
```

- [ ] **Step 2: Verify brands builds**

```bash
npm run build:brands
```

Expected: `tsc + vite build` completes with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/brands/src/App.tsx
git commit -m "feat(brands): wire App.tsx with full routing and providers"
```

---

## Phase 4 — `apps/admin/` Additions

### Task 13: TalentDetailsModal and AdminTalentPool page

**Files:**
- Create: `apps/admin/src/components/TalentDetailsModal.tsx`
- Create: `apps/admin/src/pages/AdminTalentPool.tsx`

- [ ] **Step 1: Create `apps/admin/src/components/TalentDetailsModal.tsx`**

Copy `SRC/pages/admin/TalentDetailsModal.tsx` and apply:

Remove:
```typescript
import { doc, updateDoc, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TalentProfile, InternalNote } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
```

Add at top:
```typescript
import { supabase, useAuth } from '@digihire/shared';
```

Add local types at top of file:
```typescript
interface TalentProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  role_interests?: string[];
  city?: string;
  country?: string;
  experience_years?: number;
  expected_salary?: string;
  availability?: string;
  work_preference?: string;
  education?: any[];
  cv_url?: string;
  linkedin_url?: string;
  status: string;
}
interface InternalNote {
  id: string;
  talent_id: string;
  admin_id: string;
  note: string;
  created_at: string;
}
```

Replace `fetchNotes` in `useEffect`:
```typescript
const { data } = await supabase
  .from('talent_admin_notes')
  .select('*')
  .eq('talent_id', talent.id)
  .order('created_at', { ascending: false });
setNotes((data ?? []) as InternalNote[]);
```

Replace `handleUpdateStatus`:
```typescript
const handleUpdateStatus = async (newStatus: string) => {
  setIsUpdating(true);
  const { error } = await supabase
    .from('talent_profiles')
    .update({ status: newStatus })
    .eq('id', talent.id);
  if (!error) { setStatus(newStatus as any); alert(`Status updated to ${newStatus}`); }
  else alert('Failed to update status');
  setIsUpdating(false);
};
```

Replace `handleAddNote`:
```typescript
const handleAddNote = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newNote.trim() || !user) return;
  const { data, error } = await supabase
    .from('talent_admin_notes')
    .insert({ talent_id: talent.id, admin_id: user.id, note: newNote })
    .select()
    .single();
  if (!error && data) { setNotes([data as InternalNote, ...notes]); setNewNote(''); }
};
```

Replace `const { user: admin } = useAuth()` with `const { user } = useAuth()` and update all `admin` references to `user`.

Replace field references in JSX:

| Find | Replace |
|---|---|
| `talent.fullName` | `talent.full_name` |
| `talent.userId` | `talent.id` |
| `talent.currentCity` | `talent.city` |
| `talent.yearsOfExperience` | `talent.experience_years` |
| `talent.availabilityStatus` | `talent.availability` |
| `talent.workPreference` | `talent.work_preference` |
| `talent.expectedSalary` | `talent.expected_salary` |
| `talent.linkedinProfile` | `talent.linkedin_url` |
| `talent.roleInterest` | `talent.role_interests` |
| `talent.profileProgress` | remove (not used in modal) |
| `note.createdAt` | `note.created_at` |

- [ ] **Step 2: Create `apps/admin/src/pages/AdminTalentPool.tsx`**

Copy `SRC/pages/admin/AdminDashboard.tsx` and apply:

Remove:
```typescript
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TalentProfile, InternalNote } from '../../types';
```

Add at top:
```typescript
import { supabase } from '@digihire/shared';
import TalentDetailsModal from '@/components/TalentDetailsModal';
```

Add local `TalentProfile` type (same interface as defined in TalentDetailsModal above — copy it).

Replace `fetchTalents` in `useEffect`:
```typescript
const fetchTalents = async () => {
  const { data } = await supabase
    .from('talent_profiles')
    .select('*')
    .order('updated_at', { ascending: false });
  setTalents((data ?? []) as TalentProfile[]);
  setLoading(false);
};
```

Replace `TalentDetailsModal` import path:
```typescript
import TalentDetailsModal from '@/components/TalentDetailsModal';
```

Replace field references in `filteredTalents` filter and in `TalentCard`:

| Find | Replace |
|---|---|
| `t.fullName` | `t.full_name` |
| `t.roleInterest` | `t.role_interests` |
| `talent.fullName` | `talent.full_name` |
| `talent.roleInterest` | `talent.role_interests` |
| `talent.currentCity` | `talent.city` |
| `talent.yearsOfExperience` | `talent.experience_years` |
| `talent.userId` | `talent.id` |

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/components/TalentDetailsModal.tsx apps/admin/src/pages/AdminTalentPool.tsx
git commit -m "feat(admin): add TalentDetailsModal and AdminTalentPool page"
```

---

### Task 14: AdminBrands page

**Files:**
- Create: `apps/admin/src/pages/AdminBrands.tsx`

- [ ] **Step 1: Create `apps/admin/src/pages/AdminBrands.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@digihire/shared';
import { Building2, Globe, Target, Users, Search } from 'lucide-react';

interface BrandProfile {
  id: string;
  company_name?: string;
  contact_name?: string;
  phone?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  city?: string;
  country?: string;
  primary_goal?: string;
  created_at?: string;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('brand_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setBrands(data ?? []); setLoading(false); });
  }, []);

  const filtered = brands.filter(b =>
    (b.company_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (b.contact_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (b.industry ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-muted-foreground text-sm">All registered brand accounts.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 text-sm font-bold text-sky-600">
          <Building2 className="h-4 w-4" /> {brands.length} Brands
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by company, contact, or industry..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading brands...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(brand => (
            <div key={brand.id} className="bg-card border rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-bold text-lg border">
                  {(brand.company_name ?? 'B').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{brand.company_name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">{brand.contact_name ?? '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><Target className="h-3 w-3" />{brand.industry ?? '—'}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" />{brand.company_size ?? '—'}</span>
                {brand.website && (
                  <a href={brand.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sky-600 hover:underline col-span-2">
                    <Globe className="h-3 w-3" />{brand.website}
                  </a>
                )}
              </div>
              {brand.primary_goal && (
                <span className="inline-block px-2 py-1 bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-wider rounded border border-sky-100">
                  Goal: {brand.primary_goal}
                </span>
              )}
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-3 text-center py-20 text-muted-foreground">No brands found.</div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/src/pages/AdminBrands.tsx
git commit -m "feat(admin): add AdminBrands page"
```

---

### Task 15: Wire admin — AdminLayout sidebar + App.tsx routes

**Files:**
- Modify: `apps/admin/src/components/AdminLayout.tsx`
- Modify: `apps/admin/src/App.tsx`

- [ ] **Step 1: Add new nav items to `apps/admin/src/components/AdminLayout.tsx`**

Add imports at the top of the imports list:
```typescript
import { Building2, UserSearch } from "lucide-react";
```

In the `navItems` array, after the `Campaigns` / `Memberships` / `Earnings` entries, add:
```typescript
  { label: "Talent Pool", path: "/admin/talent-pool", icon: UserSearch },
  { label: "Brands", path: "/admin/brands", icon: Building2 },
```

- [ ] **Step 2: Add routes to `apps/admin/src/App.tsx`**

Add imports after the last existing admin page import:
```typescript
import AdminTalentPool from "@/pages/AdminTalentPool";
import AdminBrands from "@/pages/AdminBrands";
```

Inside the `<Route element={<AdminProtectedRoute>...}>` block, after the last existing route, add:
```typescript
<Route path="/talent-pool" element={<AdminTalentPool />} />
<Route path="/brands" element={<AdminBrands />} />
```

- [ ] **Step 3: Verify admin builds**

```bash
npm run build:admin
```

Expected: `tsc + vite build` completes with 0 errors.

- [ ] **Step 4: Verify all apps build**

```bash
npm run build:all
```

Expected: all 5 apps build successfully.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/
git commit -m "feat(admin): add Talent Pool and Brands sidebar sections and routes"
```

---

## Final Verification

- [ ] Run `npm run dev:talentpool` — open `http://localhost:8083`, confirm signup flow works end-to-end (signup → verify email → talent dashboard).
- [ ] Run `npm run dev:brands` — open `http://localhost:8084`, confirm brand signup and dashboard load.
- [ ] Run `npm run dev:admin` — open `http://localhost:8082/admin`, confirm Talent Pool and Brands appear in the sidebar.
- [ ] Run `npm test` — confirm 1 test still passes.
