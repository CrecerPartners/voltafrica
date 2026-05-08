-- =================================================================================
-- Migration: Setup Super Admin User
-- Target UID: 1c5183ec-d53a-4a4e-8531-fc19e8343354
-- =================================================================================

DO $$
DECLARE
  target_uid uuid := '1c5183ec-d53a-4a4e-8531-fc19e8343354';
BEGIN

  -- 1. Auto-confirm the user's email to bypass verification
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = target_uid;

  -- 2. Give them the highest system role (admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_uid, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- 3. Add all product-level roles to their metadata so UI allows access to all dashboards
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{account_types}',
    '["brand", "talent", "voltsquad"]'::jsonb
  )
  WHERE id = target_uid;

  -- 4. Initialize a brand profile
  INSERT INTO public.brand_profiles (id, company_name, contact_name)
  VALUES (target_uid, 'Super Admin Brand', 'Super Admin')
  ON CONFLICT (id) DO NOTHING;

  -- 5. Initialize a talent/voltsquad profile
  INSERT INTO public.talent_profiles (id, full_name, status, profile_completion)
  VALUES (target_uid, 'Super Admin Talent', 'incomplete', 0)
  ON CONFLICT (id) DO NOTHING;

END $$;
