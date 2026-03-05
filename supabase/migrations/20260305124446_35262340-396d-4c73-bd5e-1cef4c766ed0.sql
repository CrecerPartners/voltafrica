
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read own notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- System inserts via triggers (security definer functions)
-- Allow service role / triggers to insert
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: notify on new sale
CREATE OR REPLACE FUNCTION public.notify_on_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    'New Sale Recorded',
    'A sale of ' || NEW.quantity || ' item(s) worth ₦' || NEW.amount || ' has been logged.',
    'sale'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_sale
AFTER INSERT ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.notify_on_sale();

-- Trigger function: notify on new referral
CREATE OR REPLACE FUNCTION public.notify_on_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.referrer_id,
    'New Referral!',
    NEW.referred_name || ' signed up using your referral code.',
    'referral'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_referral
AFTER INSERT ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.notify_on_referral();

-- Trigger function: notify on transaction
CREATE OR REPLACE FUNCTION public.notify_on_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    CASE
      WHEN NEW.type = 'signup_bonus' THEN 'Welcome Bonus!'
      WHEN NEW.type = 'payout' THEN 'Payout Update'
      ELSE 'Transaction Update'
    END,
    NEW.description || ' — ₦' || ABS(NEW.amount),
    'transaction'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_transaction
AFTER INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.notify_on_transaction();

-- Trigger function: notify on payout status change
CREATE OR REPLACE FUNCTION public.notify_on_payout_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Payout ' || INITCAP(NEW.status),
      'Your payout of ₦' || NEW.amount || ' has been ' || NEW.status || '.',
      'payout'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_payout_update
AFTER UPDATE ON public.payouts
FOR EACH ROW EXECUTE FUNCTION public.notify_on_payout_update();
