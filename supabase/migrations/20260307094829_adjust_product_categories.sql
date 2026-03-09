
-- Drop the existing check constraint on category to allow any text
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

-- Add new columns for enhanced product classification
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_type TEXT check (product_type in ('Physical', 'Digital')),
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Map old categories to new product_type
UPDATE public.products SET product_type = 'Physical' WHERE category = 'physical';
UPDATE public.products SET product_type = 'Digital' WHERE category IN ('digital', 'fintech', 'events');

-- Ensure all current records have a product_type
UPDATE public.products SET product_type = 'Digital' WHERE product_type IS NULL;

-- Make product_type required for new products
ALTER TABLE public.products ALTER COLUMN product_type SET NOT NULL;
