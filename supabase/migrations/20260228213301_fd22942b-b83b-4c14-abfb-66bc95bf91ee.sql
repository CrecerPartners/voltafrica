
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ref_code TEXT;
BEGIN
  _ref_code := 'VOLT-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
  
  INSERT INTO public.profiles (user_id, name, email, university, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    _ref_code
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  INSERT INTO public.transactions (user_id, date, type, description, amount, status)
  VALUES (NEW.id, CURRENT_DATE, 'signup_bonus', 'Welcome bonus', 500, 'paid');

  RETURN NEW;
END;
$$;
