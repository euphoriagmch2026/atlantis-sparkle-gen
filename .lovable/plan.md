

# Refactor: Remove Passes Page, Auto-Registration Fee, Event Detail Pages

## Overview

Remove the standalone Passes page. Automatically include one "Basic Registration" fee (₹299, fetched from DB) whenever the cart has events. Add individual event detail pages with `rules` field. Clean up types and navigation.

## Database Changes

**Migration**: Add `rules` text column to `events` table (nullable, default empty string).

No other DB changes needed — the `passes` table stays (the backend still needs it for pricing the auto-added registration item).

## File Changes

### 1. Remove Passes Page & Navigation

- **Delete** `src/pages/Passes.tsx`
- **`src/App.tsx`**: Remove `/passes` route and `Passes` import
- **`src/components/landing/Navbar.tsx`**: Remove `{ label: "Passes", href: "/passes" }` from `navLinks`
- **`src/components/landing/Footer.tsx`**: Remove `{ label: "Passes", href: "/passes" }` from `quickLinks`

### 2. Auto-Basic Registration in CartContext

- **`src/contexts/CartContext.tsx`**:
  - Define `BASIC_REGISTRATION_ID = 'basic-registration'`
  - On mount, fetch the Basic Registration pass price from DB (`supabase.from('passes').select('*').eq('id', 'basic-registration').single()`)
  - Store fetched price in a ref
  - In `addEventToCart`: after adding the event, if no pass item with id `basic-registration` exists in cart, auto-add it (quantity 1, non-removable flag)
  - In `removeFromCart`: after removing, if no event items remain, auto-remove the basic registration item
  - Add a `isAutoItem(id)` helper so the UI can hide quantity controls / delete button for the auto-added registration
  - Export `isAutoItem` from context

### 3. Update Cart & Checkout UI

- **`src/components/passes/CartSummary.tsx`**:
  - For the auto-added Basic Registration item, hide +/- quantity buttons and delete button
  - Show it as a separate "Registration Fee" section or inline with a lock icon and explanatory text like "Automatically included"
  
- **`src/components/checkout/OrderSummary.tsx`**:
  - Same treatment — show Basic Registration as a non-editable line item

- **`src/pages/Cart.tsx`**: No structural changes needed (uses CartSummary)

### 4. Event Detail Page

- **Create `src/pages/EventDetails.tsx`**:
  - Fetch single event from DB by `eventId` param: `supabase.from('events').select('*').eq('id', eventId).single()`
  - Display: hero image/poster, title, category badge, day badge, team size, duration, fee, prize pool, full description, rules (rendered as a list if line-separated)
  - Prominent "Add to Cart" button (same logic as EventCard)
  - Back navigation to `/events`
  - Styled with existing Atlantis theme (glass-card, FloatingParticles background)

- **`src/App.tsx`**: Add `<Route path="/events/:eventId" element={<EventDetails />} />`

- **`src/components/events/EventCard.tsx`**:
  - Wrap card in a clickable area that navigates to `/events/${event.id}`
  - Keep "Add to Cart" button with `e.stopPropagation()` so it doesn't trigger navigation

### 5. Type Updates

- **`src/components/events/EventCard.tsx`** (Event interface): Add `rules?: string`
- **`src/types/passes.ts`**: Remove `Pass` interface and `PassTier` type (or keep PassTier since cart still uses it internally for the auto-item). Keep `PassCartItem` type but simplify. Remove the comment about PASSES data.

### 6. Edge Function Compatibility

The `create-razorpay-order` edge function already handles both `pass` and `event` item types and looks up prices from the DB. The auto-added Basic Registration item will be sent as `{ id: 'basic-registration', type: 'pass', quantity: 1 }` — no edge function changes needed.

## Technical Notes

- The Basic Registration price is fetched from the `passes` table at runtime, not hardcoded, satisfying the "no hardcoded prices" constraint
- A frontend constant `BASIC_REGISTRATION_ID` identifies the auto-item but the price always comes from DB
- The `events.rules` column is nullable so existing events won't break

