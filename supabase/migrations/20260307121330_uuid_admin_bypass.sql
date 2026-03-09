
-- Assign admin role explicitly to user 8a2e2dbe-cecb-4868-8641-f48e073e5d43
-- in case it was missing. 

INSERT INTO public.user_roles (user_id, role)
VALUES ('8a2e2dbe-cecb-4868-8641-f48e073e5d43', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Further update has_role for explicit UUID bypass at DB level
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
  
  IF (_role = 'admin') AND (
    _user_email IN ('admin@voltafrica.com', 'crecerpartnerllc@gmail.com') OR 
    _user_id = '8a2e2dbe-cecb-4868-8641-f48e073e5d43'
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;
