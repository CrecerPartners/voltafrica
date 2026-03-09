-- Add delivery_type to products
CREATE TYPE public.delivery_method AS ENUM ('lead_url', 'direct_link', 'license_key', 'manual_provision');

ALTER TABLE public.products
ADD COLUMN delivery_type public.delivery_method NOT NULL DEFAULT 'manual_provision',
ADD COLUMN delivery_instructions TEXT;

-- Add delivery_details to order_items
ALTER TABLE public.order_items
ADD COLUMN delivery_details JSONB;

-- Create license_keys table
CREATE TABLE public.license_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key_value TEXT NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, key_value)
);

-- Enable RLS for license_keys
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with license_keys
CREATE POLICY "Admins can manage license keys"
  ON public.license_keys
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can only read their own keys via the order view if we ever need direct queries, 
-- but generally this is handled by order_items.delivery_details so we can leave it restricted to admins.

-- Create trigger for updated_at
CREATE TRIGGER update_license_keys_updated_at
  BEFORE UPDATE ON public.license_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
