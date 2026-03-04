import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductType = "physical" | "digital" | "lead";
export type CommissionModel = "percentage" | "fixed" | "per_signup" | "per_install";

export interface DbProduct {
  id: string;
  name: string;
  brand: string;
  category: "gadgets" | "telco" | "fintech" | "events" | "fashion" | "courses";
  commission_rate: number;
  price: number;
  image: string;
  description: string;
  assets: {
    images: string[];
    videoUrl?: string;
    whatsappMessage: string;
    instagramCaption: string;
    twitterCaption: string;
    sellingTips: string[];
    fulfillment_url?: string;
  };
  slug: string;
  product_type: ProductType;
  commission_model: CommissionModel;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "gadgets" | "telco" | "fintech" | "events" | "fashion" | "courses";
  commissionRate: number;
  price: number;
  image: string;
  description: string;
  assets: DbProduct["assets"];
  slug: string;
  productType: ProductType;
  commissionModel: CommissionModel;
}

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
    productType: (db.product_type as ProductType) || "physical",
    commissionModel: (db.commission_model as CommissionModel) || "percentage",
  };
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products" as any)
        .select("*")
        .order("commission_rate", { ascending: false });
      if (error) throw error;
      return (data as unknown as DbProduct[]).map(mapProduct);
    },
  });
}
