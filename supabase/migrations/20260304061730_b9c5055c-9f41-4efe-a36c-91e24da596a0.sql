
-- Add product_type and commission_model to products
ALTER TABLE public.products ADD COLUMN product_type text NOT NULL DEFAULT 'physical';
ALTER TABLE public.products ADD COLUMN commission_model text NOT NULL DEFAULT 'percentage';

-- Add conversion_status to sales for lead tracking
ALTER TABLE public.sales ADD COLUMN conversion_status text DEFAULT NULL;
