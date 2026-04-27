# Campaigns Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full Campaigns section to the seller dashboard and admin panel — sellers browse/join campaigns, submit sales evidence, and track earnings; admins create campaigns, approve memberships, review submissions, and approve payouts.

**Architecture:** Four dedicated Supabase tables (campaigns, campaign_memberships, campaign_submissions, campaign_earnings) form the data layer. Sellers get three pages under `/dashboard/campaigns`. Admins get three pages under `/admin/campaigns`. Earnings credit to the existing `transactions` table only after admin approval.

**Tech Stack:** React 18, React Router v6, React Query, Supabase, Shadcn UI, Tailwind CSS, TypeScript

---

## File Structure

### New files
- `src/hooks/useCampaigns.ts` — seller-facing queries + mutations
- `src/hooks/useAdminCampaigns.ts` — admin queries + mutations
- `src/pages/Campaigns.tsx` — browse campaigns grid `/dashboard/campaigns`
- `src/pages/CampaignDetail.tsx` — campaign detail tabs `/dashboard/campaigns/:id`
- `src/pages/MyCampaigns.tsx` — joined campaigns `/dashboard/campaigns/mine`
- `src/pages/admin/AdminCampaigns.tsx` — campaign management table `/admin/campaigns`
- `src/pages/admin/AdminCampaignForm.tsx` — create/edit campaign sheet
- `src/pages/admin/AdminCampaignMemberships.tsx` — membership approval queue `/admin/campaigns/memberships`
- `src/pages/admin/AdminCampaignEarnings.tsx` — submissions review + earnings approval queue `/admin/campaigns/earnings`

### Modified files
- `src/components/AppSidebar.tsx` — add Campaigns nav item
- `src/components/AdminLayout.tsx` — add 3 admin campaigns nav items
- `src/App.tsx` — add seller + admin routes

---

## Task 1: Database Schema

**Run all SQL in the Supabase dashboard SQL editor (or a migration file).**

- [ ] **Step 1: Create campaigns table**

```sql
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  brand_name text not null,
  banner_image_url text,
  join_type text not null check (join_type in ('instant','approval')) default 'instant',
  status text not null check (status in ('draft','active','paused','ended')) default 'draft',
  eligibility_type text not null check (eligibility_type in ('open','restricted')) default 'open',
  eligibility_criteria jsonb,
  commission_type text not null check (commission_type in ('percentage','flat')) default 'flat',
  commission_value numeric not null default 0,
  commission_per text not null check (commission_per in ('sale','lead','activation')) default 'sale',
  start_date timestamptz,
  end_date timestamptz,
  assets jsonb default '[]'::jsonb,
  tracking_link_base text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table campaigns enable row level security;

create policy "Sellers can read non-draft campaigns" on campaigns
  for select using (status in ('active','paused','ended'));

create policy "Admins can do everything" on campaigns
  for all using (
    auth.uid() in (
      select user_id from profiles where id = created_by
    )
  );
```

- [ ] **Step 2: Create campaign_memberships table**

```sql
create table campaign_memberships (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  tracking_link text,
  joined_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references profiles(id),
  rejection_note text,
  unique (campaign_id, seller_id)
);

alter table campaign_memberships enable row level security;

create policy "Sellers can see own memberships" on campaign_memberships
  for select using (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Sellers can insert own memberships" on campaign_memberships
  for insert with check (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Service role / admins can manage all" on campaign_memberships
  for all using (true);
```

- [ ] **Step 3: Create campaign_submissions table**

```sql
create table campaign_submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  membership_id uuid not null references campaign_memberships(id),
  submission_type text not null check (submission_type in ('manual','tracked')) default 'manual',
  amount numeric not null default 0,
  evidence_url text,
  notes text,
  status text not null check (status in ('pending_review','approved','rejected')) default 'pending_review',
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

alter table campaign_submissions enable row level security;

create policy "Sellers can see own submissions" on campaign_submissions
  for select using (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Sellers can insert own submissions" on campaign_submissions
  for insert with check (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Service role / admins can manage all" on campaign_submissions
  for all using (true);
```

- [ ] **Step 4: Create campaign_earnings table**

```sql
create table campaign_earnings (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  submission_id uuid references campaign_submissions(id),
  amount numeric not null default 0,
  status text not null check (status in ('pending','paid','rejected')) default 'pending',
  approved_at timestamptz,
  approved_by uuid references profiles(id),
  transaction_id uuid references transactions(id),
  created_at timestamptz default now()
);

alter table campaign_earnings enable row level security;

create policy "Sellers can see own earnings" on campaign_earnings
  for select using (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Service role / admins can manage all" on campaign_earnings
  for all using (true);
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add campaigns database schema (4 tables)"
```

---

## Task 2: Seller Campaign Hooks

**File:** `src/hooks/useCampaigns.ts` (create new)

- [ ] **Step 1: Create file with types + list/detail queries**

Create `src/hooks/useCampaigns.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  brand_name: string;
  banner_image_url: string | null;
  join_type: "instant" | "approval";
  status: "draft" | "active" | "paused" | "ended";
  eligibility_type: "open" | "restricted";
  eligibility_criteria: Record<string, unknown> | null;
  commission_type: "percentage" | "flat";
  commission_value: number;
  commission_per: "sale" | "lead" | "activation";
  start_date: string | null;
  end_date: string | null;
  assets: Array<{ label: string; url: string; type: string }>;
  tracking_link_base: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CampaignMembership {
  id: string;
  campaign_id: string;
  seller_id: string;
  status: "pending" | "approved" | "rejected";
  tracking_link: string | null;
  joined_at: string;
  approved_at: string | null;
  approved_by: string | null;
  rejection_note: string | null;
}

export interface CampaignSubmission {
  id: string;
  campaign_id: string;
  seller_id: string;
  membership_id: string;
  submission_type: "manual" | "tracked";
  amount: number;
  evidence_url: string | null;
  notes: string | null;
  status: "pending_review" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface CampaignEarning {
  id: string;
  campaign_id: string;
  seller_id: string;
  submission_id: string | null;
  amount: number;
  status: "pending" | "paid" | "rejected";
  approved_at: string | null;
  approved_by: string | null;
  transaction_id: string | null;
  created_at: string;
}

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("status", ["active", "paused", "ended"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id,
  });
}
```

- [ ] **Step 2: Add membership queries**

Append to `src/hooks/useCampaigns.ts`:

```typescript
export function useMyCampaignMemberships() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["campaign-memberships", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_memberships")
        .select("*, campaign:campaigns(*)")
        .eq("seller_id", profile!.id);
      if (error) throw error;
      return data as Array<CampaignMembership & { campaign: Campaign }>;
    },
    enabled: !!profile?.id,
  });
}

export function useCampaignMembership(campaignId: string) {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["campaign-membership", campaignId, profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_memberships")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("seller_id", profile!.id)
        .maybeSingle();
      if (error) throw error;
      return data as CampaignMembership | null;
    },
    enabled: !!profile?.id && !!campaignId,
  });
}

export function useJoinCampaign() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data: campaign, error: cErr } = await supabase
        .from("campaigns")
        .select("join_type, tracking_link_base")
        .eq("id", campaignId)
        .single();
      if (cErr) throw cErr;

      const isInstant = campaign.join_type === "instant";
      const trackingLink =
        isInstant && campaign.tracking_link_base
          ? `${campaign.tracking_link_base}?ref=${profile!.id}`
          : null;

      const { error } = await supabase.from("campaign_memberships").insert({
        campaign_id: campaignId,
        seller_id: profile!.id,
        status: isInstant ? "approved" : "pending",
        tracking_link: trackingLink,
      });
      if (error) throw error;
    },
    onSuccess: (_data, campaignId) => {
      qc.invalidateQueries({ queryKey: ["campaign-memberships"] });
      qc.invalidateQueries({ queryKey: ["campaign-membership", campaignId] });
    },
  });
}
```

- [ ] **Step 3: Add submission + earnings queries**

Append to `src/hooks/useCampaigns.ts`:

```typescript
export function useCampaignSubmissions(campaignId: string) {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["campaign-submissions", campaignId, profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_submissions")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("seller_id", profile!.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as CampaignSubmission[];
    },
    enabled: !!profile?.id && !!campaignId,
  });
}

export function useSubmitEntry() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (input: {
      campaignId: string;
      membershipId: string;
      submissionType: "manual" | "tracked";
      amount: number;
      evidenceUrl?: string;
      notes?: string;
    }) => {
      const { error } = await supabase.from("campaign_submissions").insert({
        campaign_id: input.campaignId,
        seller_id: profile!.id,
        membership_id: input.membershipId,
        submission_type: input.submissionType,
        amount: input.amount,
        evidence_url: input.evidenceUrl ?? null,
        notes: input.notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ["campaign-submissions", input.campaignId] });
    },
  });
}

export function useMyCampaignEarnings(campaignId?: string) {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["campaign-earnings", campaignId ?? "all", profile?.id],
    queryFn: async () => {
      let query = supabase
        .from("campaign_earnings")
        .select("*")
        .eq("seller_id", profile!.id);
      if (campaignId) query = query.eq("campaign_id", campaignId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as CampaignEarning[];
    },
    enabled: !!profile?.id,
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCampaigns.ts
git commit -m "feat: add seller campaign hooks"
```

---

## Task 3: Admin Campaign Hooks

**File:** `src/hooks/useAdminCampaigns.ts` (create new)

- [ ] **Step 1: Create file with types + list/CRUD hooks**

Create `src/hooks/useAdminCampaigns.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import type {
  Campaign,
  CampaignMembership,
  CampaignSubmission,
  CampaignEarning,
} from "@/hooks/useCampaigns";

export type { Campaign };

export interface CampaignFormInput {
  title: string;
  description: string;
  brand_name: string;
  banner_image_url: string;
  join_type: "instant" | "approval";
  eligibility_type: "open" | "restricted";
  eligibility_criteria: Record<string, unknown> | null;
  commission_type: "percentage" | "flat";
  commission_value: number;
  commission_per: "sale" | "lead" | "activation";
  start_date: string | null;
  end_date: string | null;
  assets: Array<{ label: string; url: string; type: string }>;
  tracking_link_base: string;
}

export function useAdminCampaigns() {
  return useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (input: CampaignFormInput) => {
      const { error } = await supabase.from("campaigns").insert({
        ...input,
        created_by: profile!.id,
        status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-campaigns"] }),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CampaignFormInput> & { id: string; status?: string }) => {
      const { error } = await supabase.from("campaigns").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
```

- [ ] **Step 2: Add membership approval hooks**

Append to `src/hooks/useAdminCampaigns.ts`:

```typescript
export function useAdminPendingMemberships() {
  return useQuery({
    queryKey: ["admin-pending-memberships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_memberships")
        .select(
          "*, campaign:campaigns(title, tracking_link_base), seller:profiles(id, name, email)"
        )
        .eq("status", "pending")
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return data as Array<
        CampaignMembership & {
          campaign: { title: string; tracking_link_base: string | null };
          seller: { id: string; name: string; email: string };
        }
      >;
    },
  });
}

export function useApproveMembership() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async ({
      membershipId,
      sellerId,
      trackingLinkBase,
    }: {
      membershipId: string;
      sellerId: string;
      trackingLinkBase: string | null;
    }) => {
      const trackingLink = trackingLinkBase
        ? `${trackingLinkBase}?ref=${sellerId}`
        : null;
      const { error } = await supabase
        .from("campaign_memberships")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: profile!.id,
          tracking_link: trackingLink,
        })
        .eq("id", membershipId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-pending-memberships"] }),
  });
}

export function useRejectMembership() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async ({
      membershipId,
      note,
    }: {
      membershipId: string;
      note?: string;
    }) => {
      const { error } = await supabase
        .from("campaign_memberships")
        .update({
          status: "rejected",
          approved_by: profile!.id,
          rejection_note: note ?? null,
        })
        .eq("id", membershipId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-pending-memberships"] }),
  });
}
```

- [ ] **Step 3: Add submission review + earnings approval hooks**

Append to `src/hooks/useAdminCampaigns.ts`:

```typescript
export function useAdminPendingSubmissions() {
  return useQuery({
    queryKey: ["admin-pending-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_submissions")
        .select(
          "*, campaign:campaigns(title, commission_type, commission_value), seller:profiles(id, name, email)"
        )
        .eq("status", "pending_review")
        .order("submitted_at", { ascending: true });
      if (error) throw error;
      return data as Array<
        CampaignSubmission & {
          campaign: {
            title: string;
            commission_type: "percentage" | "flat";
            commission_value: number;
          };
          seller: { id: string; name: string; email: string };
        }
      >;
    },
  });
}

export function useApproveSubmission() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async ({
      submissionId,
      campaignId,
      sellerId,
      commissionType,
      commissionValue,
      saleAmount,
    }: {
      submissionId: string;
      campaignId: string;
      sellerId: string;
      commissionType: "percentage" | "flat";
      commissionValue: number;
      saleAmount: number;
    }) => {
      const earning =
        commissionType === "percentage"
          ? (saleAmount * commissionValue) / 100
          : commissionValue;

      const { error: subError } = await supabase
        .from("campaign_submissions")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile!.id,
        })
        .eq("id", submissionId);
      if (subError) throw subError;

      const { error: earnError } = await supabase
        .from("campaign_earnings")
        .insert({
          campaign_id: campaignId,
          seller_id: sellerId,
          submission_id: submissionId,
          amount: earning,
          status: "pending",
        });
      if (earnError) throw earnError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending-submissions"] });
      qc.invalidateQueries({ queryKey: ["admin-pending-earnings"] });
    },
  });
}

export function useRejectSubmission() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from("campaign_submissions")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile!.id,
        })
        .eq("id", submissionId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-pending-submissions"] }),
  });
}

export function useAdminPendingEarnings() {
  return useQuery({
    queryKey: ["admin-pending-earnings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_earnings")
        .select(
          "*, campaign:campaigns(title), seller:profiles(name, email, user_id), submission:campaign_submissions(amount, evidence_url, notes, submission_type)"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Array<
        CampaignEarning & {
          campaign: { title: string };
          seller: { name: string; email: string; user_id: string };
          submission: {
            amount: number;
            evidence_url: string | null;
            notes: string | null;
            submission_type: string;
          } | null;
        }
      >;
    },
  });
}

export function useApproveEarning() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async ({
      earningId,
      sellerUserId,
      amount,
      campaignTitle,
    }: {
      earningId: string;
      sellerUserId: string;
      amount: number;
      campaignTitle: string;
    }) => {
      const now = new Date().toISOString();

      // Write to transactions (using existing Transaction schema)
      const { data: txn, error: txnError } = await supabase
        .from("transactions")
        .insert({
          user_id: sellerUserId,
          date: now,
          type: "commission",
          description: `Campaign payout: ${campaignTitle}`,
          amount,
          status: "verified",
          proof_file_name: null,
          withdrawable_at: now,
        })
        .select("id")
        .single();
      if (txnError) throw txnError;

      const { error } = await supabase
        .from("campaign_earnings")
        .update({
          status: "paid",
          approved_at: now,
          approved_by: profile!.id,
          transaction_id: txn.id,
        })
        .eq("id", earningId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending-earnings"] });
      qc.invalidateQueries({ queryKey: ["campaign-earnings"] });
    },
  });
}

export function useRejectEarning() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (earningId: string) => {
      const { error } = await supabase
        .from("campaign_earnings")
        .update({
          status: "rejected",
          approved_at: new Date().toISOString(),
          approved_by: profile!.id,
        })
        .eq("id", earningId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-pending-earnings"] }),
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAdminCampaigns.ts
git commit -m "feat: add admin campaign hooks"
```

---

## Task 4: Browse Campaigns Page

**File:** `src/pages/Campaigns.tsx` (create new)

- [ ] **Step 1: Create Campaigns.tsx**

Create `src/pages/Campaigns.tsx`:

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useCampaigns,
  useMyCampaignMemberships,
  useJoinCampaign,
} from "@/hooks/useCampaigns";
import type { Campaign, CampaignMembership } from "@/hooks/useCampaigns";
import { formatNaira } from "@/lib/utils";

function commissionLabel(c: Campaign) {
  if (c.commission_type === "percentage")
    return `${c.commission_value}% per ${c.commission_per}`;
  return `${formatNaira(c.commission_value)} per ${c.commission_per}`;
}

function getMembershipStatus(
  campaignId: string,
  memberships: Array<CampaignMembership & { campaign: Campaign }>
): "none" | "pending" | "approved" | "rejected" {
  const m = memberships.find((m) => m.campaign_id === campaignId);
  return m ? m.status : "none";
}

export default function Campaigns() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: memberships = [] } = useMyCampaignMemberships();
  const join = useJoinCampaign();

  function handleJoin(campaignId: string) {
    join.mutate(campaignId, {
      onSuccess: () =>
        toast.success("Joined! Check My Campaigns for your tracking link."),
      onError: () => toast.error("Failed to join. Please try again."),
    });
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="w-6 h-6" /> Campaigns
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse brand campaigns and earn commissions.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No active campaigns right now. Check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const status = getMembershipStatus(campaign.id, memberships);
            const locked =
              campaign.eligibility_type === "restricted" && status === "none";

            return (
              <Card key={campaign.id} className={locked ? "opacity-75" : ""}>
                {campaign.banner_image_url && (
                  <img
                    src={campaign.banner_image_url}
                    alt={campaign.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {campaign.title}
                    </CardTitle>
                    {locked && (
                      <Lock
                        className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5"
                        aria-label="Restricted campaign"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {campaign.brand_name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Commission</span>
                    <span className="font-medium">
                      {commissionLabel(campaign)}
                    </span>
                  </div>
                  {campaign.end_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ends</span>
                      <span>
                        {new Date(campaign.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      {status === "approved" && (
                        <Badge className="bg-green-500">Active</Badge>
                      )}
                      {status === "pending" && (
                        <Badge variant="outline">Pending Approval</Badge>
                      )}
                      {status === "rejected" && (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/dashboard/campaigns/${campaign.id}`}>
                          View
                        </Link>
                      </Button>
                      {status === "none" && !locked && (
                        <Button
                          size="sm"
                          onClick={() => handleJoin(campaign.id)}
                          disabled={join.isPending}
                        >
                          Join
                        </Button>
                      )}
                      {locked && (
                        <Button size="sm" disabled>
                          <Lock className="w-3 h-3 mr-1" /> Locked
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Campaigns.tsx
git commit -m "feat: add campaigns browse page"
```

---

## Task 5: Campaign Detail Page

**File:** `src/pages/CampaignDetail.tsx` (create new)

- [ ] **Step 1: Create CampaignDetail.tsx**

Create `src/pages/CampaignDetail.tsx`:

```tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Lock, Download, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCampaign,
  useCampaignMembership,
  useJoinCampaign,
  useCampaignSubmissions,
  useSubmitEntry,
  useMyCampaignEarnings,
} from "@/hooks/useCampaigns";
import { formatNaira } from "@/lib/utils";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: campaign, isLoading } = useCampaign(id!);
  const { data: membership } = useCampaignMembership(id!);
  const { data: submissions = [] } = useCampaignSubmissions(id!);
  const { data: earnings = [] } = useMyCampaignEarnings(id);
  const join = useJoinCampaign();
  const submit = useSubmitEntry();

  const [calcVolume, setCalcVolume] = useState("");
  const [submitAmount, setSubmitAmount] = useState("");
  const [submitNotes, setSubmitNotes] = useState("");
  const [submitType, setSubmitType] = useState<"manual" | "tracked">("manual");

  if (isLoading || !campaign) {
    return <div className="p-6 h-64 bg-muted rounded-lg animate-pulse" />;
  }

  const isApprovedMember = membership?.status === "approved";

  const calcProjected =
    calcVolume && !isNaN(Number(calcVolume)) && Number(calcVolume) > 0
      ? campaign.commission_type === "percentage"
        ? (Number(calcVolume) * campaign.commission_value) / 100
        : Number(calcVolume) * campaign.commission_value
      : null;

  function handleJoin() {
    join.mutate(campaign!.id, {
      onSuccess: () =>
        toast.success(
          campaign!.join_type === "instant"
            ? "Joined! Your tracking link is ready."
            : "Request submitted. Waiting for admin approval."
        ),
      onError: () => toast.error("Failed to join."),
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!membership) return;
    submit.mutate(
      {
        campaignId: campaign!.id,
        membershipId: membership.id,
        submissionType: submitType,
        amount: Number(submitAmount),
        notes: submitNotes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Submission received. Pending review.");
          setSubmitAmount("");
          setSubmitNotes("");
        },
        onError: () => toast.error("Submission failed."),
      }
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Link
        to="/dashboard/campaigns"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> All Campaigns
      </Link>

      {campaign.banner_image_url && (
        <img
          src={campaign.banner_image_url}
          alt={campaign.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      )}

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          <p className="text-muted-foreground">{campaign.brand_name}</p>
        </div>
        {!membership && (
          <Button onClick={handleJoin} disabled={join.isPending}>
            {join.isPending ? "Joining..." : "Join Campaign"}
          </Button>
        )}
        {membership?.status === "pending" && (
          <Badge variant="outline">Pending Approval</Badge>
        )}
        {membership?.status === "approved" && (
          <Badge className="bg-green-500">Active Member</Badge>
        )}
        {membership?.status === "rejected" && (
          <Badge variant="destructive">Rejected</Badge>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          {isApprovedMember && (
            <TabsTrigger value="submit">Submit Entry</TabsTrigger>
          )}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {campaign.description && <p>{campaign.description}</p>}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Commission</span>
                  <p className="font-medium">
                    {campaign.commission_type === "percentage"
                      ? `${campaign.commission_value}%`
                      : formatNaira(campaign.commission_value)}{" "}
                    per {campaign.commission_per}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Join Type</span>
                  <p className="font-medium capitalize">{campaign.join_type}</p>
                </div>
                {campaign.start_date && (
                  <div>
                    <span className="text-muted-foreground">Start Date</span>
                    <p className="font-medium">
                      {new Date(campaign.start_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {campaign.end_date && (
                  <div>
                    <span className="text-muted-foreground">End Date</span>
                    <p className="font-medium">
                      {new Date(campaign.end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {isApprovedMember && membership?.tracking_link && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Your tracking link
                  </p>
                  <p className="text-sm font-mono break-all">
                    {membership.tracking_link}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {earnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold">
                      {formatNaira(
                        earnings.reduce((s, e) => s + e.amount, 0)
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {formatNaira(
                        earnings
                          .filter((e) => e.status === "pending")
                          .reduce((s, e) => s + e.amount, 0)
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {formatNaira(
                        earnings
                          .filter((e) => e.status === "paid")
                          .reduce((s, e) => s + e.amount, 0)
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Paid Out</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CALCULATOR */}
        <TabsContent value="calculator" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Earnings Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {campaign.commission_per === "sale"
                    ? "Number of Sales"
                    : `Number of ${campaign.commission_per}s`}
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter volume"
                  value={calcVolume}
                  onChange={(e) => setCalcVolume(e.target.value)}
                />
              </div>
              {calcProjected !== null && (
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Projected Earnings
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {formatNaira(calcProjected)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSETS */}
        <TabsContent value="assets" className="pt-4">
          {!isApprovedMember ? (
            <div className="text-center py-16 space-y-3">
              <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Join this campaign to access brand assets.
              </p>
            </div>
          ) : campaign.assets.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              No assets uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {campaign.assets.map((asset, i) => (
                <Card key={i}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{asset.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {asset.type}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={asset.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SUBMIT ENTRY */}
        {isApprovedMember && (
          <TabsContent value="submit" className="pt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Submit a Sale</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={submitType === "manual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSubmitType("manual")}
                    >
                      Manual Entry
                    </Button>
                    <Button
                      type="button"
                      variant={
                        submitType === "tracked" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSubmitType("tracked")}
                    >
                      Tracked Link
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Amount (₦)</Label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={submitAmount}
                      onChange={(e) => setSubmitAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={submitNotes}
                      onChange={(e) => setSubmitNotes(e.target.value)}
                      placeholder="Any additional context..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={submit.isPending}>
                    {submit.isPending ? "Submitting..." : "Submit Entry"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {submissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Submission History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            {new Date(s.submitted_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="capitalize">
                            {s.submission_type}
                          </TableCell>
                          <TableCell>{formatNaira(s.amount)}</TableCell>
                          <TableCell>
                            {s.status === "approved" && (
                              <Badge className="bg-green-500">Approved</Badge>
                            )}
                            {s.status === "pending_review" && (
                              <Badge variant="outline">Pending</Badge>
                            )}
                            {s.status === "rejected" && (
                              <Badge variant="destructive">Rejected</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CampaignDetail.tsx
git commit -m "feat: add campaign detail page with tabs"
```

---

## Task 6: My Campaigns Page

**File:** `src/pages/MyCampaigns.tsx` (create new)

- [ ] **Step 1: Create MyCampaigns.tsx**

Create `src/pages/MyCampaigns.tsx`:

```tsx
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useMyCampaignMemberships,
  useMyCampaignEarnings,
} from "@/hooks/useCampaigns";
import { formatNaira } from "@/lib/utils";

export default function MyCampaigns() {
  const { data: memberships = [], isLoading } = useMyCampaignMemberships();
  const { data: allEarnings = [] } = useMyCampaignEarnings();

  if (isLoading) {
    return <div className="p-6 h-64 bg-muted rounded-lg animate-pulse" />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <p className="text-muted-foreground mt-1">
          Campaigns you have joined.
        </p>
      </div>

      {memberships.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground">
            You haven't joined any campaigns yet.
          </p>
          <Button asChild>
            <Link to="/dashboard/campaigns">Browse Campaigns</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {memberships.map((m) => {
            const campaignEarnings = allEarnings.filter(
              (e) => e.campaign_id === m.campaign_id
            );
            const totalPending = campaignEarnings
              .filter((e) => e.status === "pending")
              .reduce((s, e) => s + e.amount, 0);
            const totalPaid = campaignEarnings
              .filter((e) => e.status === "paid")
              .reduce((s, e) => s + e.amount, 0);
            const totalAll = campaignEarnings.reduce(
              (s, e) => s + e.amount,
              0
            );

            return (
              <Card key={m.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {m.campaign.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {m.campaign.brand_name}
                      </p>
                    </div>
                    {m.status === "approved" && (
                      <Badge className="bg-green-500">Active</Badge>
                    )}
                    {m.status === "pending" && (
                      <Badge variant="outline">Pending</Badge>
                    )}
                    {m.status === "rejected" && (
                      <Badge variant="destructive">Rejected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                      <p className="font-semibold">{formatNaira(totalAll)}</p>
                      <p className="text-muted-foreground text-xs">
                        Submitted
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {formatNaira(totalPending)}
                      </p>
                      <p className="text-muted-foreground text-xs">Pending</p>
                    </div>
                    <div>
                      <p className="font-semibold">{formatNaira(totalPaid)}</p>
                      <p className="text-muted-foreground text-xs">Paid Out</p>
                    </div>
                  </div>
                  {m.tracking_link && (
                    <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                      {m.tracking_link}
                    </div>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/campaigns/${m.campaign_id}`}>
                      View Campaign
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/MyCampaigns.tsx
git commit -m "feat: add my campaigns page"
```

---

## Task 7: Admin Campaign Form + Management Page

**Files:** `src/pages/admin/AdminCampaignForm.tsx` and `src/pages/admin/AdminCampaigns.tsx` (create both)

- [ ] **Step 1: Create AdminCampaignForm.tsx**

Create `src/pages/admin/AdminCampaignForm.tsx`:

```tsx
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCreateCampaign,
  useUpdateCampaign,
  type CampaignFormInput,
  type Campaign,
} from "@/hooks/useAdminCampaigns";

interface AdminCampaignFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  campaign?: Campaign;
}

const EMPTY: CampaignFormInput = {
  title: "",
  description: "",
  brand_name: "",
  banner_image_url: "",
  join_type: "instant",
  eligibility_type: "open",
  eligibility_criteria: null,
  commission_type: "flat",
  commission_value: 0,
  commission_per: "sale",
  start_date: null,
  end_date: null,
  assets: [],
  tracking_link_base: "",
};

export default function AdminCampaignForm({
  open,
  onOpenChange,
  campaign,
}: AdminCampaignFormProps) {
  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const [form, setForm] = useState<CampaignFormInput>(
    campaign
      ? {
          title: campaign.title,
          description: campaign.description ?? "",
          brand_name: campaign.brand_name,
          banner_image_url: campaign.banner_image_url ?? "",
          join_type: campaign.join_type,
          eligibility_type: campaign.eligibility_type,
          eligibility_criteria: campaign.eligibility_criteria,
          commission_type: campaign.commission_type,
          commission_value: campaign.commission_value,
          commission_per: campaign.commission_per,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          assets: campaign.assets,
          tracking_link_base: campaign.tracking_link_base ?? "",
        }
      : EMPTY
  );

  function set<K extends keyof CampaignFormInput>(
    key: K,
    value: CampaignFormInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (campaign) {
      update.mutate(
        { id: campaign.id, ...form },
        {
          onSuccess: () => {
            toast.success("Campaign updated.");
            onOpenChange(false);
          },
          onError: () => toast.error("Update failed."),
        }
      );
    } else {
      create.mutate(form, {
        onSuccess: () => {
          toast.success("Campaign created as draft.");
          onOpenChange(false);
        },
        onError: () => toast.error("Create failed."),
      });
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {campaign ? "Edit Campaign" : "New Campaign"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <Input
              required
              value={form.brand_name}
              onChange={(e) => set("brand_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Banner Image URL</Label>
            <Input
              value={form.banner_image_url}
              onChange={(e) => set("banner_image_url", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Join Type</Label>
              <Select
                value={form.join_type}
                onValueChange={(v) =>
                  set("join_type", v as "instant" | "approval")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Eligibility</Label>
              <Select
                value={form.eligibility_type}
                onValueChange={(v) =>
                  set("eligibility_type", v as "open" | "restricted")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Commission Type</Label>
              <Select
                value={form.commission_type}
                onValueChange={(v) =>
                  set("commission_type", v as "percentage" | "flat")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat (₦)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Per</Label>
              <Select
                value={form.commission_per}
                onValueChange={(v) =>
                  set(
                    "commission_per",
                    v as "sale" | "lead" | "activation"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="activation">Activation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Commission Value</Label>
            <Input
              type="number"
              min="0"
              required
              value={form.commission_value}
              onChange={(e) =>
                set("commission_value", Number(e.target.value))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.start_date?.split("T")[0] ?? ""}
                onChange={(e) =>
                  set("start_date", e.target.value || null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.end_date?.split("T")[0] ?? ""}
                onChange={(e) =>
                  set("end_date", e.target.value || null)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tracking Link Base URL</Label>
            <Input
              value={form.tracking_link_base}
              onChange={(e) => set("tracking_link_base", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending
              ? "Saving..."
              : campaign
              ? "Update Campaign"
              : "Create Campaign"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Create AdminCampaigns.tsx**

Create `src/pages/admin/AdminCampaigns.tsx`:

```tsx
import { useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminCampaigns, useUpdateCampaign, type Campaign } from "@/hooks/useAdminCampaigns";
import AdminCampaignForm from "./AdminCampaignForm";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "secondary",
  active: "default",
  paused: "outline",
  ended: "destructive",
};

export default function AdminCampaigns() {
  const { data: campaigns = [], isLoading } = useAdminCampaigns();
  const update = useUpdateCampaign();
  const [formOpen, setFormOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | undefined>();

  function changeStatus(id: string, status: string) {
    update.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Campaign ${status}.`),
        onError: () => toast.error("Status update failed."),
      }
    );
  }

  function openCreate() {
    setEditCampaign(undefined);
    setFormOpen(true);
  }

  function openEdit(c: Campaign) {
    setEditCampaign(c);
    setFormOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No campaigns yet. Create one to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Join Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>{c.brand_name}</TableCell>
                <TableCell>
                  {c.commission_type === "percentage"
                    ? `${c.commission_value}%`
                    : `₦${c.commission_value}`}{" "}
                  / {c.commission_per}
                </TableCell>
                <TableCell className="capitalize">{c.join_type}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[c.status]}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(c)}>
                        Edit
                      </DropdownMenuItem>
                      {c.status === "draft" && (
                        <DropdownMenuItem
                          onClick={() => changeStatus(c.id, "active")}
                        >
                          Publish
                        </DropdownMenuItem>
                      )}
                      {c.status === "active" && (
                        <DropdownMenuItem
                          onClick={() => changeStatus(c.id, "paused")}
                        >
                          Pause
                        </DropdownMenuItem>
                      )}
                      {c.status === "paused" && (
                        <DropdownMenuItem
                          onClick={() => changeStatus(c.id, "active")}
                        >
                          Resume
                        </DropdownMenuItem>
                      )}
                      {c.status !== "ended" && (
                        <DropdownMenuItem
                          onClick={() => changeStatus(c.id, "ended")}
                        >
                          End Campaign
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AdminCampaignForm
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={editCampaign}
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminCampaigns.tsx src/pages/admin/AdminCampaignForm.tsx
git commit -m "feat: add admin campaign management page"
```

---

## Task 8: Admin Membership Approvals Page

**File:** `src/pages/admin/AdminCampaignMemberships.tsx` (create new)

- [ ] **Step 1: Create AdminCampaignMemberships.tsx**

Create `src/pages/admin/AdminCampaignMemberships.tsx`:

```tsx
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminPendingMemberships,
  useApproveMembership,
  useRejectMembership,
} from "@/hooks/useAdminCampaigns";

export default function AdminCampaignMemberships() {
  const { data: memberships = [], isLoading } = useAdminPendingMemberships();
  const approve = useApproveMembership();
  const reject = useRejectMembership();

  function handleApprove(m: (typeof memberships)[number]) {
    approve.mutate(
      {
        membershipId: m.id,
        sellerId: m.seller.id,
        trackingLinkBase: m.campaign.tracking_link_base,
      },
      {
        onSuccess: () => toast.success(`${m.seller.name} approved.`),
        onError: () => toast.error("Approval failed."),
      }
    );
  }

  function handleReject(membershipId: string) {
    reject.mutate(
      { membershipId },
      {
        onSuccess: () => toast.success("Request rejected."),
        onError: () => toast.error("Rejection failed."),
      }
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Membership Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Pending join requests for approval-required campaigns.
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      ) : memberships.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No pending membership requests.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seller</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <p className="font-medium">{m.seller.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.seller.email}
                  </p>
                </TableCell>
                <TableCell>{m.campaign.title}</TableCell>
                <TableCell>
                  {new Date(m.joined_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(m)}
                      disabled={approve.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(m.id)}
                      disabled={reject.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/AdminCampaignMemberships.tsx
git commit -m "feat: add admin membership approvals page"
```

---

## Task 9: Admin Submissions + Earnings Review Page

**File:** `src/pages/admin/AdminCampaignEarnings.tsx` (create new)

This single page handles both steps: (1) reviewing submissions to create earnings, (2) approving earnings to credit wallets.

- [ ] **Step 1: Create AdminCampaignEarnings.tsx**

Create `src/pages/admin/AdminCampaignEarnings.tsx`:

```tsx
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminPendingSubmissions,
  useApproveSubmission,
  useRejectSubmission,
  useAdminPendingEarnings,
  useApproveEarning,
  useRejectEarning,
} from "@/hooks/useAdminCampaigns";
import { formatNaira } from "@/lib/utils";

export default function AdminCampaignEarnings() {
  const { data: submissions = [], isLoading: subLoading } =
    useAdminPendingSubmissions();
  const approveSubmission = useApproveSubmission();
  const rejectSubmission = useRejectSubmission();

  const { data: earnings = [], isLoading: earnLoading } =
    useAdminPendingEarnings();
  const approveEarning = useApproveEarning();
  const rejectEarning = useRejectEarning();

  function handleApproveSubmission(s: (typeof submissions)[number]) {
    approveSubmission.mutate(
      {
        submissionId: s.id,
        campaignId: s.campaign_id,
        sellerId: s.seller.id,
        commissionType: s.campaign.commission_type,
        commissionValue: s.campaign.commission_value,
        saleAmount: s.amount,
      },
      {
        onSuccess: () =>
          toast.success(`Submission approved. Earning created for ${s.seller.name}.`),
        onError: () => toast.error("Approval failed."),
      }
    );
  }

  function handleApproveEarning(e: (typeof earnings)[number]) {
    approveEarning.mutate(
      {
        earningId: e.id,
        sellerUserId: e.seller.user_id,
        amount: e.amount,
        campaignTitle: e.campaign.title,
      },
      {
        onSuccess: () =>
          toast.success(
            `${formatNaira(e.amount)} paid out to ${e.seller.name}.`
          ),
        onError: () => toast.error("Payout failed."),
      }
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* SECTION 1: Submission Review */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Submission Review</h1>
          <p className="text-muted-foreground mt-1">
            Review seller-submitted sales. Approving creates a pending earning.
          </p>
        </div>

        {subLoading ? (
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
        ) : submissions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No pending submissions.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium">{s.seller.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.seller.email}
                    </p>
                  </TableCell>
                  <TableCell>{s.campaign.title}</TableCell>
                  <TableCell>{formatNaira(s.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {s.submission_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.evidence_url ? (
                      <a
                        href={s.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline text-blue-500"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                    {s.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveSubmission(s)}
                        disabled={approveSubmission.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          rejectSubmission.mutate(s.id, {
                            onSuccess: () =>
                              toast.success("Submission rejected."),
                            onError: () => toast.error("Rejection failed."),
                          })
                        }
                        disabled={rejectSubmission.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* SECTION 2: Earnings Approval */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Earnings Approval</h2>
          <p className="text-muted-foreground mt-1">
            Approve pending earnings to credit seller wallets.
          </p>
        </div>

        {earnLoading ? (
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
        ) : earnings.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No pending earnings.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <p className="font-medium">{e.seller.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.seller.email}
                    </p>
                  </TableCell>
                  <TableCell>{e.campaign.title}</TableCell>
                  <TableCell className="font-semibold">
                    {formatNaira(e.amount)}
                  </TableCell>
                  <TableCell>
                    {e.submission?.evidence_url ? (
                      <a
                        href={e.submission.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline text-blue-500"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                    {e.submission?.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {e.submission.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveEarning(e)}
                        disabled={approveEarning.isPending}
                      >
                        Approve & Pay
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          rejectEarning.mutate(e.id, {
                            onSuccess: () =>
                              toast.success("Earning rejected."),
                            onError: () => toast.error("Rejection failed."),
                          })
                        }
                        disabled={rejectEarning.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/AdminCampaignEarnings.tsx
git commit -m "feat: add admin submissions review and earnings approval page"
```

---

## Task 10: Wire Up Routes and Sidebar

**Files:** `src/components/AppSidebar.tsx`, `src/components/AdminLayout.tsx`, `src/App.tsx`

- [ ] **Step 1: Add Campaigns to seller sidebar**

In `src/components/AppSidebar.tsx`, line 1 — add `Megaphone` to the lucide import:

```typescript
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Users,
  BarChart3,
  Trophy,
  User,
  Zap,
  Calculator,
  GraduationCap,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
```

Then in the `navItems` array (line 31), add after the Referrals entry:

```typescript
{ title: "Campaigns", url: "/dashboard/campaigns", icon: Megaphone },
```

The full array should look like:

```typescript
const navItems = [
  { title: "Talent Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "My Orders", url: "/orders", icon: ShoppingBag },
  { title: "Calculator", url: "/calculator", icon: Calculator },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Referrals", url: "/referrals", icon: Users },
  { title: "Campaigns", url: "/dashboard/campaigns", icon: Megaphone },
  { title: "Sales", url: "/sales", icon: BarChart3 },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Settings", url: "/profile", icon: User },
];
```

- [ ] **Step 2: Add Campaigns nav to AdminLayout**

In `src/components/AdminLayout.tsx`, line 2 — add `Megaphone, UserCheck, BadgeDollarSign` to the lucide import:

```typescript
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  GraduationCap,
  ArrowLeft,
  Star,
  ShieldCheck,
  ClipboardList,
  Megaphone,
  UserCheck,
  BadgeDollarSign,
} from "lucide-react";
```

Then in the `navItems` array (line 18), append three items at the end:

```typescript
const navItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Sales", path: "/admin/sales", icon: ShoppingCart },
  { label: "Orders", path: "/admin/orders", icon: ClipboardList },
  { label: "Payouts", path: "/admin/payouts", icon: Wallet },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Verification", path: "/admin/verification", icon: ShieldCheck },
  { label: "Training", path: "/admin/training", icon: GraduationCap },
  { label: "Referrals", path: "/admin/referrals", icon: Users },
  { label: "Leaderboard", path: "/admin/leaderboard", icon: LayoutDashboard },
  { label: "Campaigns", path: "/admin/campaigns", icon: Megaphone },
  { label: "Memberships", path: "/admin/campaigns/memberships", icon: UserCheck },
  { label: "Earnings", path: "/admin/campaigns/earnings", icon: BadgeDollarSign },
];
```

- [ ] **Step 3: Add routes to App.tsx**

Open `src/App.tsx`. Add these imports near the top with the other page imports:

```typescript
import Campaigns from "@/pages/Campaigns";
import CampaignDetail from "@/pages/CampaignDetail";
import MyCampaigns from "@/pages/MyCampaigns";
import AdminCampaigns from "@/pages/admin/AdminCampaigns";
import AdminCampaignMemberships from "@/pages/admin/AdminCampaignMemberships";
import AdminCampaignEarnings from "@/pages/admin/AdminCampaignEarnings";
```

Inside the seller `ProtectedRoute` / `DashboardLayout` block, add:

```tsx
<Route path="/dashboard/campaigns" element={<Campaigns />} />
<Route path="/dashboard/campaigns/mine" element={<MyCampaigns />} />
<Route path="/dashboard/campaigns/:id" element={<CampaignDetail />} />
```

Inside the admin `AdminProtectedRoute` / `AdminLayout` block, add:

```tsx
<Route path="/admin/campaigns" element={<AdminCampaigns />} />
<Route path="/admin/campaigns/memberships" element={<AdminCampaignMemberships />} />
<Route path="/admin/campaigns/earnings" element={<AdminCampaignEarnings />} />
```

- [ ] **Step 4: Verify TypeScript build**

```bash
npm run build
```

Expected: exits with code 0, no type errors. If errors appear, fix them before committing.

- [ ] **Step 5: Commit**

```bash
git add src/components/AppSidebar.tsx src/components/AdminLayout.tsx src/App.tsx
git commit -m "feat: wire up campaigns routes and sidebar nav"
```

---

## Task 11: Manual QA Checklist

Start the dev server: `npm run dev`

- [ ] Seller: `/dashboard/campaigns` loads — campaign cards visible
- [ ] Seller: "Join" on an instant-join campaign — badge changes to "Active" without page reload
- [ ] Seller: "View" opens detail page — 4 tabs present
- [ ] Seller: Earnings Calculator — enter a number, projected payout appears
- [ ] Seller: Assets tab — shows lock overlay when not a member; shows download links when member
- [ ] Seller: Submit Entry tab — visible only to approved members; submitting shows in history as "Pending"
- [ ] Seller: `/dashboard/campaigns/mine` — joined campaigns with earnings breakdown
- [ ] Admin: `/admin/campaigns` — all campaigns listed with status
- [ ] Admin: "New Campaign" — sheet opens; create saves as draft
- [ ] Admin: Publish a draft — status changes to "active" in table
- [ ] Admin: Pause / End — status transitions work
- [ ] Admin: `/admin/campaigns/memberships` — pending requests for approval campaigns appear
- [ ] Admin: Approve membership — disappears from queue; seller's tracking link is set
- [ ] Admin: `/admin/campaigns/earnings` — pending submissions section shows seller submissions
- [ ] Admin: Approve submission — earning created, moves to Earnings Approval section
- [ ] Admin: Approve earning — transaction row created; seller's wallet balance updates
- [ ] Sidebar: "Campaigns" nav item visible to sellers; highlighted when on `/dashboard/campaigns*` routes

```bash
git add .
git commit -m "chore: campaigns feature complete"
```
