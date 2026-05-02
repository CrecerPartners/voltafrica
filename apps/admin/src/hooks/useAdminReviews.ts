import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@digihire/shared";

export function useAdminReviews() {
  return useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(name, brand)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
}

