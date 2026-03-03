
-- Add slug column to products
ALTER TABLE public.products ADD COLUMN slug text UNIQUE;

-- Backfill existing products with generated slugs
UPDATE public.products 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(brand || '-' || name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

-- Make slug NOT NULL after backfill
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
