-- Fix finding #6: Add WITH CHECK to profiles UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix finding #10: Enable RLS on identity_logs
ALTER TABLE public.identity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can read identity logs" ON public.identity_logs;
CREATE POLICY "Only admins can read identity logs" ON public.identity_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  
-- Fix finding #11: Fix KYC storage policy (using storage.objects bucket_id = 'kyc-documents')
DROP POLICY IF EXISTS "Admins can view all KYC" ON storage.objects;
CREATE POLICY "Admins can view all KYC" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-documents' AND public.has_role(auth.uid(), 'admin'::public.app_role));
