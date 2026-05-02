import { useQuery } from "@tanstack/react-query";
import { supabase } from "@digihire/shared";

export function useAdminVerifications() {
  return useQuery({
    queryKey: ["admin-verifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or("verification_status.eq.pending,id_document_url.neq.")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      // Filter out empty id_document_url that aren't pending
      return (data || []).filter(
        (p) => p.verification_status === "pending" || (p.id_document_url && p.id_document_url.length > 0)
      );
    },
  });
}


