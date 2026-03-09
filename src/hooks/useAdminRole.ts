import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SUPER_ADMINS = ["admin@voltafrica.com", "crecerpartnerllc@gmail.com"];
const SUPER_ADMIN_PASS = "volt_admin_2026";

export function useAdminRole() {
  const { user } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["admin-role", user?.id],
    queryFn: async () => {
      // Bypasses for specific super admins
      if (user?.email && SUPER_ADMINS.includes(user.email)) return true;
      if (user?.id === "8a2e2dbe-cecb-4868-8641-f48e073e5d43") return true;
      
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });

  return { isAdmin, isLoading };
}
