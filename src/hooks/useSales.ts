import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Sale {
  id: string;
  user_id: string;
  product_id: string | null;
  date: string;
  customer: string;
  quantity: number;
  amount: number;
  commission: number;
  status: "confirmed" | "pending" | "cancelled";
  conversion_status: string | null;
  proof_file_url: string | null;
  notes: string | null;
  created_at: string;
  product_name?: string;
  category?: string;
  product_type?: string;
}

export function useSales() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales" as any)
        .select("*, products:product_id(name, category, product_type)")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((s) => ({
        ...s,
        product_name: s.products?.name || "Unknown",
        category: s.products?.category || "digital",
        product_type: s.products?.product_type || "physical",
      })) as Sale[];
    },
    enabled: !!user,
  });
}
