-- Allow anyone (including anonymous visitors) to read products
DROP POLICY "Authenticated users can read products" ON public.products;

CREATE POLICY "Anyone can read products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);