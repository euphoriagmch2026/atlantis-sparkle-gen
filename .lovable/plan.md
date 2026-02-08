
# Phase 4: Passes & Tickets System

## Summary
Building a complete passes and ticketing system with pass type cards, shopping cart functionality, and checkout flow - all styled with the Atlantis underwater theme to match the existing design.

---

## New Files to Create

### 1. Pass Type Definitions
**File:** `src/types/passes.ts`

Define TypeScript interfaces for the passes system:
- `Pass` interface with id, name, description, price, benefits array, tier/color theme
- `CartItem` interface for tracking selected passes with quantity
- Four pass tiers: General Fest Pass, Day Pass, Pro Show Pass, VIP Pass

---

### 2. Cart Context (State Management)
**File:** `src/contexts/CartContext.tsx`

React Context provider for managing cart state across the application:
- `addToCart(pass, quantity)` - Add a pass to cart
- `removeFromCart(passId)` - Remove item from cart
- `updateQuantity(passId, quantity)` - Update item quantity
- `clearCart()` - Empty the cart
- `cartItems` array and `totalAmount` computed value
- Automatic persistence to localStorage

---

### 3. Pass Card Component
**File:** `src/components/passes/PassCard.tsx`

Individual pass display card matching the existing EventCard styling:
- Tier-specific border colors (teal for General, gold for VIP, coral for Pro Show, mystic for Day)
- Glowing border effects on hover using the existing `glass-card` pattern
- Pass name with Cinzel font and glow effects
- Price prominently displayed with gold accent
- Benefits list with checkmark icons
- Quantity selector (+/- buttons with current count)
- "Add to Cart" button with hover effects
- Smooth hover scale animation: `hover:scale-[1.02]`

---

### 4. Cart Summary Component
**File:** `src/components/passes/CartSummary.tsx`

Cart panel for viewing selected items:
- List of added items with quantities and prices
- Individual item totals
- Remove item buttons (trash icon)
- Grand total with gold text glow styling
- "Proceed to Checkout" CTA button styled as primary
- Empty cart state with themed message ("Your treasure chest is empty")
- Will be used as sidebar on desktop and drawer on mobile

---

### 5. Passes Page
**File:** `src/pages/Passes.tsx`

Full passes page layout following Events page structure:
- Hero section with underwater theme and page title
- Grid of 4 pass type cards (responsive: 1 column mobile, 2 tablet, 4 desktop)
- Sticky cart summary sidebar on desktop (lg breakpoint and above)
- Bottom drawer/sheet for cart on mobile using existing Drawer component
- FloatingParticles background effect for consistency
- Wrapped in CartProvider for state access

---

## Files to Modify

### 1. App.tsx
- Wrap the app with CartProvider
- Add new route: `/passes` pointing to Passes page

### 2. Navbar.tsx
- Update "Passes" link from `/#passes` to `/passes`

---

## Pass Types Structure

| Pass | Tier Color | Benefits |
|------|------------|----------|
| **General Fest Pass** | Teal (primary) | Access to all cultural events, Gaming zone entry, Food court access |
| **Day Pass** | Purple (mystic) | Single day access, Select events, Food court access |
| **Pro Show Pass** | Coral | VIP seating at pro shows, Meet & greet access, Exclusive merchandise |
| **VIP Pass** | Gold (accent) | All-access pass, Priority entry, Exclusive lounge, Goodies bag |

Note: Prices will be placeholders (TBD) to be filled in later.

---

## Technical Details

### Cart State Shape
```text
CartContext:
  items: [
    { 
      passId: string, 
      passName: string, 
      price: number, 
      quantity: number,
      tier: string 
    }
  ]
  addItem(pass, quantity)
  removeItem(passId)
  updateQuantity(passId, newQuantity)
  clearCart()
  totalAmount: number (computed)
  totalItems: number (computed)
```

### Styling Approach
Following existing patterns from EventCard:
- Pass cards use `glass-card` class with tier-specific border colors
- Hover effects with `hover:scale-[1.02]` and dynamic glow shadows
- Price uses `text-glow-gold` for emphasis
- Benefits list with Lucide Check icons in primary color
- Quantity buttons styled as small circular buttons with border

### Responsive Design
- **Mobile** (< 768px): Single column pass cards, bottom drawer for cart (uses Drawer component)
- **Tablet** (768px - 1024px): 2-column grid, cart accessible via floating button
- **Desktop** (> 1024px): 2x2 or 4-column grid, sticky sidebar cart (like Events page filters)

### localStorage Persistence
Cart state automatically syncs to localStorage with key `euphoria-cart` so users don't lose their selection on page refresh.

---

## Implementation Order

1. Create `src/types/passes.ts` with type definitions
2. Create `src/contexts/CartContext.tsx` with state management
3. Build `src/components/passes/PassCard.tsx` component
4. Build `src/components/passes/CartSummary.tsx` component
5. Create `src/pages/Passes.tsx` with full layout
6. Update `src/App.tsx` with CartProvider and route
7. Update `src/components/landing/Navbar.tsx` navigation link
