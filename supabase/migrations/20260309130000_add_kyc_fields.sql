ALTER TABLE profiles
ADD COLUMN nin TEXT,
ADD COLUMN bvn TEXT,
ADD COLUMN proof_of_address_url TEXT;

INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload their own KYC" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own KYC" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all KYC" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'kyc-documents');
