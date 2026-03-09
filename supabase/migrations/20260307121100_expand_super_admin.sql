
-- Update the has_role function to include an expanded hardcoded super admin bypass
-- This ensures that crecerpartnerllc@gmail.com is also ALWAYS recognized as an admin at the DB level

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_email TEXT;
BEGIN
  -- 1. Check if the user has the explicit role in user_roles table
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) THEN
    RETURN TRUE;
  END IF;

  -- 2. Hardcoded Super Admin Bypass
  -- Get user email from auth.users (requires security definer)
  SELECT email INTO _user_email FROM auth.users WHERE id = _user_id;
  
  IF (_role = 'admin' AND (_user_email = 'admin@voltafrica.com' OR _user_email = 'crecerpartnerllc@gmail.com')) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;
