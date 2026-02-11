
-- ============================================================
-- Step 1a: Create passes table
-- ============================================================
CREATE TABLE public.passes (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL,           -- in rupees
  benefits text[] NOT NULL DEFAULT '{}',
  tier text NOT NULL CHECK (tier IN ('basic', 'earlybird')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view available passes)
CREATE POLICY "Passes are publicly readable"
  ON public.passes FOR SELECT
  USING (true);

-- No direct writes from clients
CREATE POLICY "No direct insert on passes"
  ON public.passes FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update on passes"
  ON public.passes FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "No direct delete on passes"
  ON public.passes FOR DELETE
  TO anon, authenticated
  USING (false);

-- ============================================================
-- Step 1b: Create events table
-- ============================================================
CREATE TABLE public.events (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('cultural', 'gaming', 'workshop')),
  day integer NOT NULL CHECK (day IN (1, 2, 3)),
  team_size text NOT NULL,
  duration text,
  fee integer NOT NULL DEFAULT 0,   -- in rupees
  prize_pool text,
  description text,
  poster_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Events are publicly readable"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "No direct insert on events"
  ON public.events FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update on events"
  ON public.events FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "No direct delete on events"
  ON public.events FOR DELETE
  TO anon, authenticated
  USING (false);

-- ============================================================
-- Step 1c: Seed passes data
-- ============================================================
INSERT INTO public.passes (id, name, description, price, benefits, tier) VALUES
  ('basic-registration', 'Basic Registration (BR)',
   'Get access to the fest grounds and experience the magic of EUPHORIA 2026.',
   299,
   ARRAY['Entry to fest grounds','Access to food court','View cultural performances','Participate in open events'],
   'basic'),
  ('early-bird-all-night', 'Early Bird All Night Pass',
   'The ultimate night experience with exclusive access to pro shows and after-parties.',
   999,
   ARRAY['All Basic Registration benefits','Priority entry to pro shows','Access to all night events','Exclusive after-party access','Early bird discount pricing','Complimentary refreshments'],
   'earlybird');

-- ============================================================
-- Step 1d: Seed events data
-- ============================================================
INSERT INTO public.events (id, name, category, day, team_size, duration, fee, prize_pool, description) VALUES
  ('1', 'Event Name', 'cultural', 1, 'Solo', '2 hours', 100, '₹10,000', 'Event description goes here. Add details about the event, rules, and what participants can expect.'),
  ('2', 'Event Name', 'cultural', 1, 'Duet', '3 hours', 200, '₹15,000', 'Event description goes here. Add details about the event, rules, and what participants can expect.'),
  ('3', 'Event Name', 'gaming', 2, '5 members', '3 hours', 500, '₹25,000', 'Event description goes here. Add details about the event, rules, and what participants can expect.'),
  ('4', 'Event Name', 'gaming', 2, 'Solo', '2 hours', 100, '₹10,000', 'Event description goes here. Add details about the event, rules, and what participants can expect.'),
  ('5', 'Event Name', 'workshop', 3, 'Solo', '4 hours', 250, 'Certificate', 'Event description goes here. Add details about the event, rules, and what participants can expect.'),
  ('6', 'Event Name', 'workshop', 3, 'Duet', '3 hours', 200, 'Certificate', 'Event description goes here. Add details about the event, rules, and what participants can expect.');

-- ============================================================
-- Step 1e: Add user_id to orders (nullable for guest checkout)
-- ============================================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- ============================================================
-- Step 1f: Harden RLS on orders
-- ============================================================

-- Drop old permissive SELECT policies
DROP POLICY IF EXISTS "Orders readable by razorpay_order_id lookup" ON public.orders;

-- Authenticated users can read their own orders
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- Step 1g: Harden RLS on order_items
-- ============================================================

DROP POLICY IF EXISTS "Order items readable if order is accessible" ON public.order_items;

-- Authenticated users can read items for their own orders
CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- ============================================================
-- Step 1h: get_order_summary function for guest confirmation page
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_order_summary(p_order_id text, p_email text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'order', json_build_object(
      'razorpay_order_id', o.razorpay_order_id,
      'full_name', o.full_name,
      'email', o.email,
      'college', o.college,
      'total_amount', o.total_amount,
      'status', o.status,
      'created_at', o.created_at
    ),
    'items', COALESCE((
      SELECT json_agg(json_build_object(
        'item_name', oi.item_name,
        'item_type', oi.item_type,
        'price', oi.price,
        'quantity', oi.quantity
      ))
      FROM public.order_items oi
      WHERE oi.order_id = o.id
    ), '[]'::json)
  ) INTO result
  FROM public.orders o
  WHERE o.razorpay_order_id = p_order_id
    AND o.email = p_email;

  IF result IS NULL THEN
    RETURN json_build_object('error', 'Order not found');
  END IF;

  RETURN result;
END;
$$;
