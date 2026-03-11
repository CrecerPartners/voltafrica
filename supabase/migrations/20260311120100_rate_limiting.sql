-- Security Remediation Part 3: Rate Limiting Infrastructure
-- Creates a rate_limits table and helper function for edge function rate limiting.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,           -- e.g. 'payout:user_id' or 'verify-bank:user_id'
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 1
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start);

-- Enable RLS — only service_role can access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.rate_limits
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Rate limit check function
-- Returns TRUE if the request should be ALLOWED, FALSE if rate limited
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _key TEXT,
  _max_requests INTEGER,
  _window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window_start TIMESTAMPTZ;
  _current_count INTEGER;
BEGIN
  _window_start := now() - (_window_seconds || ' seconds')::interval;
  
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE key = _key AND window_start < _window_start;
  
  -- Count requests in current window
  SELECT COALESCE(SUM(request_count), 0) INTO _current_count
  FROM public.rate_limits
  WHERE key = _key AND window_start >= _window_start;
  
  -- If over limit, deny
  IF _current_count >= _max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Record this request
  INSERT INTO public.rate_limits (key, window_start, request_count)
  VALUES (_key, now(), 1);
  
  RETURN TRUE;
END;
$$;
