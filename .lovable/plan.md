

# Phase 4: Passes & Tickets System

## Summary
Building a complete passes and ticketing system with pass type cards, shopping cart functionality, and checkout flow - all styled with the Atlantis underwater theme.

---

## New Files to Create

### 1. Pass Type Definitions
**File:** `src/types/passes.ts`

Define the pass types and cart item interfaces:
- Pass interface with id, name, description, price, benefits array, color theme
- CartItem interface for tracking quantity selections
- Pass tiers: General, Day Pass, Pro Show, VIP

---

### 2. Pass Card Component
**File:** `src/components/passes/PassCard.tsx`

Individual pass display card featuring:
- Tier-specific styling with glowing borders (teal, gold, coral, mystic)
- Pass name with Cinzel font and glow effects
- Price prominently displayed
- Benefits list with checkmark icons
- Quantity selector (+/- buttons with current count)
- "Add to Cart" button with ripple effect
- Hover animations consistent with EventCard styling

---

### 3. Cart Summary Component  
**File:** `src/components/passes/CartSummary.tsx`

Floating/sticky cart panel showing:
- List of added items with quantities
- Individual item totals
- Remove item buttons
- Grand total with gold accent styling
- "Proceed to Checkout" CTA button
- Empty cart state with thematic message

---

### 4. Passes Page
**File:** `src/pages/Passes.tsx`

Full passes page layout:
- Hero section with underwater theme
- Grid of 4 pass type cards
- Sticky cart summary sidebar (desktop) / bottom sheet (mobile)
- FloatingParticles background effect
- Responsive layout: 2 columns on tablet, 4 on desktop

---

### 5. Cart Context (State Management)
**File:** `src/contexts/CartContext.tsx`

React Context for cart state:
- addToCart function
- removeFromCart function
- updateQuantity function
- clearCart function
- cartItems array
- totalAmount computed value
- Persistent state via localStorage

---

## Files to Modify

### 1. App.tsx
Add new route: `/passes` pointing to Passes page

### 2. Navbar.tsx  
Update "Passes" link from `/#passes` to `/passes`

### 3. Index.tsx
Add a passes preview section or update existing CTA buttons to link to `/passes`

---

## Pass Types Structure

| Pass | Price | Benefits |
|------|-------|----------|
| **General Fest Pass** | Placeholder | Access to all cultural events, Gaming zone entry, Food court access |
| **Day Pass** | Placeholder | Single day access, Select events, Food court access |
| **Pro Show Pass** | Placeholder | VIP seating at pro shows, Meet & greet access, Exclusive merchandise |
| **VIP Pass** | Placeholder | All-access pass, Priority entry, Exclusive lounge, Goodies bag |

---

## Technical Details

### Cart State Shape
```text
CartContext:
  items: [
    { passId: string, passName: string, price: number, quantity: number }
  ]
  addItem(pass, quantity)
  removeItem(passId)
  updateQuantity(passId, quantity)
  clearCart()
  total: computed from items
```

### Styling Approach
- Pass cards use `glass-card` class with tier-specific border colors
- Hover effects with `hover:scale-[1.02]` and glow shadows
- Price uses `text-glow-gold` for emphasis
- Benefits list with animated checkmark icons
- Quantity buttons styled as circular icon buttons

### Responsive Design
- Mobile: Single column pass cards, bottom cart drawer
- Tablet: 2-column grid, side cart panel
- Desktop: 4-column grid, sticky sidebar cart

---

## Implementation Order

1. Create pass types and CartContext
2. Build PassCard component
3. Build CartSummary component  
4. Create Passes page with layout
5. Update routing and navigation
6. Add localStorage persistence for cart

