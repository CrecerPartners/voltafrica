ALTER TABLE profiles
ADD COLUMN transaction_pin TEXT,
ADD COLUMN bank_code TEXT,
ADD COLUMN security_locked_until TIMESTAMPTZ;

-- Revoke insert privileges on payouts and transactions from authenticated users
-- Only the service role (edge functions) should insert payouts or transactions
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own payouts" ON payouts;

CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "Users can insert own payouts" ON payouts FOR INSERT TO authenticated WITH CHECK (false);

-- Update the existing policies to be explicit if they aren't already
DROP POLICY IF EXISTS "Service role can insert transactions" ON transactions;
CREATE POLICY "Service role can insert transactions" ON transactions FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert payouts" ON payouts;
CREATE POLICY "Service role can insert payouts" ON payouts FOR INSERT TO service_role WITH CHECK (true);
