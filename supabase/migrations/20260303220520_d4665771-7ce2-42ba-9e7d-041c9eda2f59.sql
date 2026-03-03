
-- Update handle_new_user to set account_type from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _ref_code TEXT;
  _raw_type TEXT;
  _account_type TEXT;
BEGIN
  _ref_code := 'VOLT-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
  
  _raw_type := COALESCE(NEW.raw_user_meta_data->>'account_type', '');
  _account_type := CASE _raw_type
    WHEN 'Student' THEN 'student'
    WHEN 'NYSC member' THEN 'nysc'
    WHEN 'Fresh grad' THEN 'graduate'
    WHEN 'Corporate' THEN 'corporate'
    WHEN 'Micro-influencer' THEN 'creator'
    WHEN 'Content creator' THEN 'creator'
    WHEN 'Young urban youth seller' THEN 'creator'
    ELSE ''
  END;

  INSERT INTO public.profiles (user_id, name, email, university, referral_code, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    _ref_code,
    _account_type
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  INSERT INTO public.transactions (user_id, date, type, description, amount, status)
  VALUES (NEW.id, CURRENT_DATE, 'signup_bonus', 'Welcome bonus', 500, 'paid');

  RETURN NEW;
END;
$function$;
