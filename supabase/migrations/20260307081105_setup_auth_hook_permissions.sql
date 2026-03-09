
-- Update the migration to create a Postgres function that calls the Edge Function
-- This makes the hook "visible" in the Postgres Functions list

CREATE OR REPLACE FUNCTION public.auth_email_hook_wrapper(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is a placeholder that reminds you to use the Edge Function
  -- In the Supabase Dashboard -> Auth -> Hooks -> Send Email
  -- You should see an "Edge Function" option. Select "auth-email-hook".
  
  -- If you prefer to trigger it from here, you can use pg_net,
  -- but selecting the Edge Function directly in the Auth Hooks UI is recommended.
  RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auth_email_hook_wrapper(jsonb) TO supabase_auth_admin;
