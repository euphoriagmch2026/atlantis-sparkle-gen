
-- Drop overly permissive write policies
DROP POLICY "Service role can insert orders" ON public.orders;
DROP POLICY "Service role can update orders" ON public.orders;
DROP POLICY "Service role can insert order items" ON public.order_items;

-- Deny all insert/update for anon/authenticated users (service role bypasses RLS)
CREATE POLICY "No direct insert on orders"
  ON public.orders FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update on orders"
  ON public.orders FOR UPDATE
  USING (false);

CREATE POLICY "No direct insert on order_items"
  ON public.order_items FOR INSERT
  WITH CHECK (false);
