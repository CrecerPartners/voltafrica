import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  type: "commission" | "referral_bonus" | "signup_bonus" | "performance_bonus" | "payout" | "manual_sale";
  description: string;
  amount: number;
  status: "pending" | "paid" | "processing";
  proof_file_name: string | null;
  created_at: string;
}

export function useTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as unknown as Transaction[];
    },
    enabled: !!user,
  });
}
