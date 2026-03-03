
-- Shop logo
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shop_logo_url text DEFAULT '';

-- Verification & identity
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_document_url text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name text NOT NULL DEFAULT '',
  rating integer NOT NULL,
  comment text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_review_rating
BEFORE INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for verification docs (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket for shop logos (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for shop-logos (public read, authenticated upload)
CREATE POLICY "Public can read shop logos" ON storage.objects FOR SELECT USING (bucket_id = 'shop-logos');
CREATE POLICY "Authenticated users can upload shop logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shop-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own shop logos" ON storage.objects FOR UPDATE USING (bucket_id = 'shop-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for verification-docs (private, only owner + admin)
CREATE POLICY "Users can upload own verification docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read own verification docs" ON storage.objects FOR SELECT USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
