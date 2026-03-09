ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS income_target_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS income_target_timeframe TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS income_target_items JSONB DEFAULT '[]'::jsonb;
