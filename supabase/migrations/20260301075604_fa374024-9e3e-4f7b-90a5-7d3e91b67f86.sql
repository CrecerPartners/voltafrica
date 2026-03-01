CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  bank_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  notes text
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payouts" ON public.payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payouts" ON public.payouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);