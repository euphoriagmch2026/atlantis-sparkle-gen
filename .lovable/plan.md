

# Implementation Plan

## Analysis Summary

After reviewing the codebase, here's what I found:

- **The edge function already inserts order items** (lines 186-200 of `create-razorpay-order/index.ts`) and already extracts `user_id` from the auth header (lines 82-89). The `orders` table already has a `user_id` column and an RLS policy for authenticated SELECT. So request #2 is **already implemented** — no DB or edge function changes needed.
- **Checkout.tsx line 24** still navigates to `/passes` on empty cart — needs to be `/events`.
- **HeroSection** still has the "Buy Passes" button — needs removal.
- **Profile page** does not exist yet — needs creation.

## Changes

### 1. HeroSection — Remove "Buy Passes" button
**File:** `src/components/landing/HeroSection.tsx`
- Delete lines 74-81 (the "Buy Passes" Button block)
- The remaining two buttons ("Explore Events" and "Register Now") stay centered via the existing flex layout

### 2. Checkout.tsx — Fix stale redirect
**File:** `src/pages/Checkout.tsx`
- Line 24: Change `navigate("/passes")` to `navigate("/events")`

### 3. Create Profile page
**File:** `src/pages/Profile.tsx` (new)
- Check auth state; redirect to `/auth` if not logged in
- Fetch profile from `profiles` table
- Fetch orders with items: `supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false })`
- Display profile info (name, email, phone, college) in a card at the top
- Display order history below using cards — each showing: order ID (truncated razorpay_order_id), date, status badge, total amount, and expandable list of order_items (item name, quantity, price)
- Styled with existing Atlantis theme (glass-card, FloatingParticles)

### 4. Add `/profile` route
**File:** `src/App.tsx`
- Import Profile page and add `<Route path="/profile" element={<Profile />} />`

### 5. Navbar — Add "Profile & Orders" link
**File:** `src/components/landing/Navbar.tsx`
- In the desktop dropdown menu (line 143-158): Add a `DropdownMenuItem` labeled "Profile & Orders" that navigates to `/profile`, placed before "Browse Events"
- In the mobile menu (lines 226-241): Add a "Profile & Orders" button/link for logged-in users

### 6. No database or edge function changes needed
The `orders.user_id`, order items insertion, and RLS policies are already correctly implemented.

