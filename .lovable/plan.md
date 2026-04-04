

# Fix Price Display & Create Order Details View

## 1. Fix Paise-to-Rupees Display in Profile.tsx

Two lines need updating:

- **Line 173** (order total): Change `₹{order.total_amount}` → `₹{(order.total_amount / 100).toFixed(2)}`
- **Line 189** (item price): Change `₹{item.price * item.quantity}` → `₹{((item.price * item.quantity) / 100).toFixed(2)}`

## 2. Create `user_order_details_view` (DB Migration)

A SQL view joining `orders` and `order_items`:

```sql
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
```

## 3. Edge Function Verification

The `create-razorpay-order` edge function already correctly:
- Extracts `user_id` from the auth header (lines 82-89)
- Inserts `full_name`, `email`, `phone`, `college`, `user_id` into `orders` (lines 167-181)
- Loops through line items and inserts each into `order_items` with `order_id` (lines 186-198)

No edge function changes needed.

