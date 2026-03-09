-- Add organization field to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS organization TEXT;

-- Update existing records: if brand is available, use it as default organization
UPDATE public.products SET organization = brand WHERE organization IS NULL;
