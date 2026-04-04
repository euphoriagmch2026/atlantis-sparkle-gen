CREATE VIEW public.user_order_details_view AS
SELECT
  o.id AS order_id,
  o.created_at,
  o.full_name,
  o.email,
  o.phone,
  o.status,
  o.total_amount / 100.0 AS total_rupees,
  oi.item_name,
  oi.quantity,
  oi.price / 100.0 AS item_price_rupees
FROM public.orders o
JOIN public.order_items oi ON oi.order_id = o.id;