-- Handle refund reversal for commissions
CREATE OR REPLACE FUNCTION public.handle_order_reversal()
RETURNS TRIGGER AS $$
BEGIN
  -- If order status changes to 'cancelled' or 'refunded'
  IF (NEW.status IN ('cancelled', 'refunded')) AND (OLD.status NOT IN ('cancelled', 'refunded')) THEN
    -- Mark corresponding commission transactions as 'rejected' or reverse them
    -- Actually, it's better to update the status to 'rejected' so they don't count towards balance
    -- And they won't become withdrawable.
    UPDATE public.transactions 
    SET status = 'rejected', 
        description = description || ' (Order ' || NEW.status || ')'
    WHERE related_order_id = NEW.id 
    AND type = 'commission';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_handle_order_reversal ON public.orders;
CREATE TRIGGER trg_handle_order_reversal
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_reversal();
