
-- Add shop columns to profiles
ALTER TABLE public.profiles ADD COLUMN bio text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN shop_name text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN shop_slug text UNIQUE;

-- Create seller_shop_items table
CREATE TABLE public.seller_shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.seller_shop_items ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own items
CREATE POLICY "Users manage own shop items" ON public.seller_shop_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Anyone (including anon visitors) can read shop items for public storefront
CREATE POLICY "Anyone can read shop items" ON public.seller_shop_items
  FOR SELECT TO anon USING (true);

-- Allow anon SELECT on profiles for public shop pages
CREATE POLICY "Anon can read profiles" ON public.profiles
  FOR SELECT TO anon USING (true);
