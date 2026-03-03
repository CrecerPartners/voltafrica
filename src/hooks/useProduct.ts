import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DbProduct, Product } from "./useProducts";

function mapProduct(db: DbProduct): Product {
  return {
    id: db.id,
    name: db.name,
    brand: db.brand,
    category: db.category,
    commissionRate: db.commission_rate,
    price: db.price,
    image: db.image,
    description: db.description,
    assets: db.assets,
    slug: db.slug,
  };
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug");
      const { data, error } = await supabase
        .from("products" as any)
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Product not found");
      return mapProduct(data as unknown as DbProduct);
    },
    enabled: !!slug,
  });
}
