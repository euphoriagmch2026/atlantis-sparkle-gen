
-- Explicit deny SELECT on messages (defence-in-depth)
CREATE POLICY "No select on messages"
  ON public.messages FOR SELECT
  TO anon, authenticated
  USING (false);

-- Explicit deny DELETE on orders
CREATE POLICY "No direct delete on orders"
  ON public.orders FOR DELETE
  TO anon, authenticated
  USING (false);

-- Explicit deny DELETE on order_items
CREATE POLICY "No direct delete on order_items"
  ON public.order_items FOR DELETE
  TO anon, authenticated
  USING (false);

-- Explicit deny UPDATE on order_items
CREATE POLICY "No direct update on order_items"
  ON public.order_items FOR UPDATE
  TO anon, authenticated
  USING (false);
