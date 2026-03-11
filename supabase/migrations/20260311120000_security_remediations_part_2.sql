-- Security Remediation Part 2: Remove hardcoded admin bypass from has_role()
-- This function should ONLY check the user_roles table, no hardcoded emails or UUIDs.

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Ensure existing admin users are properly in user_roles table
-- (so removing the bypass doesn't lock them out)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE u.email IN ('admin@voltafrica.com', 'crecerpartnerllc@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;
