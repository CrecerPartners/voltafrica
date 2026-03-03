
-- Orders table (supports guest checkout with nullable user_id)
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  paystack_reference TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (guest checkout)
CREATE POLICY "Anyone can insert orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Authenticated users can read their own orders
CREATE POLICY "Users can read own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "Admins can select all orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 0,
  ref_code TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Anyone can insert order items (guest checkout)
CREATE POLICY "Anyone can insert order_items"
ON public.order_items FOR INSERT
WITH CHECK (true);

-- Users can read order items for their orders
CREATE POLICY "Users can read own order_items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Admins can read all order items
CREATE POLICY "Admins can select all order_items"
ON public.order_items FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all order items
CREATE POLICY "Admins can update all order_items"
ON public.order_items FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster lookups
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_paystack_reference ON public.orders(paystack_reference);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
