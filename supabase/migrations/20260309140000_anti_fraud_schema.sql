-- 1. Add anti-fraud fields to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- 2. Add verification fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bank_account_verified BOOLEAN DEFAULT false;

-- 3. Update transactions table
-- Add withdrawable_at for commission lock lock period
-- Add related_order_id for attribution
-- Add reference_info for anti-fraud metadata
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS withdrawable_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS related_order_id UUID REFERENCES public.orders(id),
ADD COLUMN IF NOT EXISTS reference_info JSONB DEFAULT '{}'::jsonb;

-- Ensure status check includes verified/rejected/under_review
-- Need to check if there is an existing constraint
DO $$
BEGIN
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_status_check 
      CHECK (status IN ('pending', 'verified', 'rejected', 'under_review', 'paid', 'processing'));
EXCEPTION
    WHEN others THEN
        -- Fallback if we can't find/drop constraint
        NULL;
END $$;

-- 4. New table for IP/Device history tracking (Anti-fraud log)
CREATE TABLE IF NOT EXISTS public.identity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  device_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for anti-fraud lookups
CREATE INDEX IF NOT EXISTS idx_identity_logs_ip ON public.identity_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_identity_logs_device ON public.identity_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_orders_ip ON public.orders(ip_address);
CREATE INDEX IF NOT EXISTS idx_transactions_related_order ON public.transactions(related_order_id);

-- 5. Commission Calculation Trigger
CREATE OR REPLACE FUNCTION public.process_order_commissions()
RETURNS TRIGGER AS $$
DECLARE
  _item RECORD;
  _seller_id UUID;
  _commission_amount NUMERIC;
  _is_fraud BOOLEAN := false;
  _fraud_reason TEXT := '';
  _lock_days INTEGER := 7;
  _seller_email TEXT;
  _seller_phone TEXT;
BEGIN
  -- Only process if status changed to 'paid' or 'confirmed'
  IF (NEW.status IN ('paid', 'confirmed')) AND (OLD.status NOT IN ('paid', 'confirmed')) THEN
    
    FOR _item IN (SELECT * FROM public.order_items WHERE order_id = NEW.id) LOOP
      -- Find seller by ref_code
      SELECT user_id, email, whatsapp INTO _seller_id, _seller_email, _seller_phone 
      FROM public.profiles WHERE referral_code = _item.ref_code;
      
      IF _seller_id IS NOT NULL THEN
        -- 1. Self-Referral Block Logic
        _is_fraud := false;
        _fraud_reason := '';
        
        IF _seller_id = NEW.user_id THEN
          _is_fraud := true;
          _fraud_reason := 'Self-purchase by same user ID';
        ELSIF NEW.email = _seller_email THEN
          _is_fraud := true;
          _fraud_reason := 'Buyer and Seller email match';
        ELSIF NEW.phone = _seller_phone THEN
          _is_fraud := true;
          _fraud_reason := 'Buyer and Seller phone match';
        END IF;

        -- 2. Device / IP Abuse Check
        -- Flag if this IP or Device has been associated with other orders from different emails
        IF NOT _is_fraud THEN
          IF EXISTS (
              SELECT 1 FROM public.orders 
              WHERE (ip_address = NEW.ip_address OR device_id = NEW.device_id) 
              AND email != NEW.email
              AND created_at > now() - interval '30 days'
          ) THEN
             _is_fraud := true;
             _fraud_reason := 'Shared IP/Device with another account';
          END IF;
        END IF;

        -- Calculate commission based on rate in order_item
        _commission_amount := (_item.price * _item.quantity * _item.commission_rate / 100);

        -- If it was a fixed model, price might be 0 but commission_rate should hold the value 
        -- (Ideally we'd handle different models here, but following current schema)
        IF _commission_amount = 0 AND _item.commission_rate > 0 THEN
           _commission_amount := _item.commission_rate * _item.quantity;
        END IF;

        IF _commission_amount > 0 THEN
          -- Insert transaction with holding period
          INSERT INTO public.transactions (
            user_id, 
            type, 
            description, 
            amount, 
            status, 
            related_order_id, 
            date,
            withdrawable_at,
            reference_info
          ) VALUES (
            _seller_id,
            'commission',
            'Commission for ' || (SELECT name FROM products WHERE id = _item.product_id) || ' (Order: ' || SUBSTRING(NEW.id::text, 1, 8) || ')',
            _commission_amount,
            CASE WHEN _is_fraud THEN 'under_review'::text ELSE 'verified'::text END,
            NEW.id,
            CURRENT_DATE,
            now() + (_lock_days || ' days')::interval,
            jsonb_build_object(
              'buyer_email', NEW.email,
              'buyer_phone', NEW.phone,
              'buyer_ip', NEW.ip_address,
              'fraud_reason', _fraud_reason,
              'is_fraud_flagged', _is_fraud
            )
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_handle_order_commissions ON public.orders;
CREATE TRIGGER trg_handle_order_commissions
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.process_order_commissions();
