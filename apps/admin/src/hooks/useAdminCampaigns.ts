import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@digihire/shared";
import { useProfile } from "@digihire/shared";
import type {
  Campaign,
  CampaignMembership,
  CampaignSubmission,
  CampaignEarning,
} from "@digihire/shared";

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
        .from("campaigns" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Campaign[];
    },
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (input: CampaignFormInput) => {
      if (!profile?.id) throw new Error("Profile not loaded");
      const { error } = await supabase.from("campaigns" as any).insert({
        ...input,
        created_by: profile.id,
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
      const { error } = await supabase
        .from("campaigns" as any)
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });
}

export function useAdminPendingMemberships() {
  return useQuery({
    queryKey: ["admin-pending-memberships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_memberships" as any)
        .select(
          "*, campaign:campaigns(title, tracking_link_base), seller:profiles(id, name, email)"
        )
        .eq("status", "pending")
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return data as unknown as Array<
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
      if (!profile?.id) throw new Error("Profile not loaded");
      const trackingLink = trackingLinkBase
        ? `${trackingLinkBase}?ref=${sellerId}`
        : null;
      const { error } = await supabase
        .from("campaign_memberships" as any)
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: profile.id,
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
      if (!profile?.id) throw new Error("Profile not loaded");
      const { error } = await supabase
        .from("campaign_memberships" as any)
        .update({
          status: "rejected",
          approved_by: profile.id,
          rejection_note: note ?? null,
        })
        .eq("id", membershipId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-pending-memberships"] }),
  });
}

export function useAdminPendingSubmissions() {
  return useQuery({
    queryKey: ["admin-pending-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_submissions" as any)
        .select(
          "*, campaign:campaigns(title, commission_type, commission_value), seller:profiles(id, name, email)"
        )
        .eq("status", "pending_review")
        .order("submitted_at", { ascending: true });
      if (error) throw error;
      return data as unknown as Array<
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
      if (!profile?.id) throw new Error("Profile not loaded");
      const earning =
        commissionType === "percentage"
          ? (saleAmount * commissionValue) / 100
          : commissionValue;

      const { error: earnError } = await supabase
        .from("campaign_earnings" as any)
        .insert({
          campaign_id: campaignId,
          seller_id: sellerId,
          submission_id: submissionId,
          amount: earning,
          status: "pending",
        });
      if (earnError) throw earnError;

      const { error: subError } = await supabase
        .from("campaign_submissions" as any)
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile.id,
        })
        .eq("id", submissionId);
      if (subError) throw subError;
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
      if (!profile?.id) throw new Error("Profile not loaded");
      const { error } = await supabase
        .from("campaign_submissions" as any)
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile.id,
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
        .from("campaign_earnings" as any)
        .select(
          "*, campaign:campaigns(title), seller:profiles(name, email, user_id), submission:campaign_submissions(amount, evidence_url, notes, submission_type)"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as Array<
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
      if (!profile?.id) throw new Error("Profile not loaded");
      const now = new Date().toISOString();

      // Step 1: mark earning as paid (without transaction_id yet)
      const { error: earnUpdateError } = await supabase
        .from("campaign_earnings" as any)
        .update({
          status: "paid",
          approved_at: now,
          approved_by: profile.id,
        })
        .eq("id", earningId);
      if (earnUpdateError) throw earnUpdateError;

      // Step 2: insert transaction (if this fails, earning is paid but has no transaction_id — detectable/fixable)
      const { data: txn, error: txnError } = await supabase
        .from("transactions")
        .insert({
          user_id: sellerUserId,
          date: now,
          type: "commission" as const,
          description: `Campaign payout: ${campaignTitle}`,
          amount,
          status: "verified",
          proof_file_name: null,
          withdrawable_at: now,
        })
        .select("id")
        .single();
      if (txnError) throw txnError;

      // Step 3: link transaction_id back to earning (best-effort update)
      await supabase
        .from("campaign_earnings" as any)
        .update({ transaction_id: txn.id })
        .eq("id", earningId);
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
      if (!profile?.id) throw new Error("Profile not loaded");
      const { error } = await supabase
        .from("campaign_earnings" as any)
        .update({
          status: "rejected",
          approved_by: profile.id,
        })
        .eq("id", earningId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-pending-earnings"] }),
  });
}


