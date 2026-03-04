
-- Allow users to update their own pending sales
CREATE POLICY "Users can update own pending sales"
ON public.sales
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Allow users to delete their own pending sales
CREATE POLICY "Users can delete own pending sales"
ON public.sales
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');
