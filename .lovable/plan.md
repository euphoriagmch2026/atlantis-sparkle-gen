

# Allow Multiple Basic Registrations

## Overview
Remove the "locked" behavior of the Basic Registration item and allow users to change its quantity via +/- buttons, with a minimum of 1 when events exist in the cart.

## Changes

### 1. `src/contexts/CartContext.tsx`
- **Remove the guard** in `updateQuantity` that blocks changes to `BASIC_REGISTRATION_ID`. Instead, enforce a minimum of 1 when event items exist:
  ```
  if (itemId === BASIC_REGISTRATION_ID) {
    const hasEvents = prev.some(i => i.type === 'event');
    if (hasEvents && quantity < 1) return prev; // enforce min 1
    if (!hasEvents && quantity < 1) { remove it; return; }
  }
  ```
- The `removeFromCart` guard stays — users still can't fully delete registration via the trash icon; only quantity control is allowed.
- No new state needed — the existing `quantity` field on the PassCartItem already handles this.

### 2. `src/components/passes/CartSummary.tsx`
- Replace the static Lock icon + price display for the registration item with a quantity selector matching the event items' design:
  - `−` button (disabled when `regItem.quantity === 1` and events exist), quantity number, `+` button
  - Show `₹{regItem.price * regItem.quantity}` as the line total
- Remove the `Lock` icon import (no longer needed).
- Update the helper text from "Automatically included with events" to "Min. 1 required with events".

### 3. `src/pages/Cart.tsx`
No changes needed — it just renders `<CartSummary />`.

### Files Modified
- `src/contexts/CartContext.tsx` — update `updateQuantity` logic
- `src/components/passes/CartSummary.tsx` — add +/- buttons for registration item

