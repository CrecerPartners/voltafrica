
-- Assign admin role to crecerpartnerllc@gmail.com
-- This script finds the user ID by email and inserts it into user_roles

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role 
FROM auth.users 
WHERE email = 'crecerpartnerllc@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
