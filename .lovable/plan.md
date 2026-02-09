

# Phase 5: Checkout & Payment Flow

## Summary
Building a complete checkout experience with a user details form, order summary, and Razorpay payment integration. The checkout will collect participant information and process payments for both event registrations and passes.

---

## New Files to Create

### 1. Checkout Page
**File:** `src/pages/Checkout.tsx`

Full checkout page with two main sections:

**Left Section - User Details Form:**
- Name (required)
- Email (required, validated)
- Phone number (required, 10 digits)
- College/Organization (required)
- For team events: ability to add team member names

**Right Section - Order Summary:**
- Reuse CartSummary component in read-only mode
- Shows all cart items grouped by type
- Grand total prominently displayed
- "Pay Now" button to initiate Razorpay

**Layout:**
- Two-column on desktop (form left, summary right)
- Single column stacked on mobile
- FloatingParticles background for theme consistency
- Redirect to /passes if cart is empty

---

### 2. Checkout Form Component
**File:** `src/components/checkout/CheckoutForm.tsx`

React Hook Form powered form with Zod validation:
- Input fields styled with the glass-card aesthetic
- Real-time validation feedback
- Error states with themed styling
- Loading state during payment processing

**Form Fields:**
| Field | Type | Validation |
|-------|------|------------|
| Full Name | text | Required, min 2 chars |
| Email | email | Required, valid email format |
| Phone | tel | Required, 10 digits |
| College | text | Required |
| Team Members | array | Optional, only for team events |

---

### 3. Order Summary Component
**File:** `src/components/checkout/OrderSummary.tsx`

Read-only version of cart summary for checkout:
- No quantity modification controls
- Clean list of all items with prices
- Subtotals for passes and events
- Grand total with gold glow styling
- Secure payment badge/indicator

---

### 4. Razorpay Integration Hook
**File:** `src/hooks/useRazorpay.ts`

Custom hook for Razorpay payment flow:
- Dynamically loads Razorpay script
- `initiatePayment(amount, orderId, userDetails)` function
- Handles success/failure callbacks
- Returns payment status and loading state

**Note:** Razorpay requires a backend to create orders. This will be prepared for Supabase Edge Function integration (to be set up separately).

---

### 5. Order Confirmation Page
**File:** `src/pages/OrderConfirmation.tsx`

Success page after payment:
- Order ID display
- Summary of purchased items
- Email confirmation message
- Animated success checkmark
- "Back to Home" and "View Events" CTAs

---

## Files to Modify

### 1. App.tsx
Add new routes:
- `/checkout` - Checkout page
- `/order-confirmation` - Success page

### 2. CartSummary.tsx
Wire up the `onCheckout` prop:
- Navigate to `/checkout` when clicked
- Disable button if cart is empty

### 3. Passes.tsx
Pass the checkout handler to CartSummary

### 4. Events.tsx
Add a floating "Checkout" button when cart has items

---

## Technical Details

### Form Validation Schema (Zod)
```text
checkoutSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  college: z.string().min(2, "College name is required"),
  teamMembers: z.array(z.string()).optional()
})
```

### Razorpay Integration Flow
```text
1. User fills form and clicks "Pay Now"
2. Frontend validates form
3. Call Supabase Edge Function to create Razorpay order
4. Edge function returns order_id
5. Open Razorpay checkout modal with order_id
6. On success: Edge function verifies signature
7. Store order in database
8. Clear cart and redirect to confirmation
```

### Component Structure
```text
Checkout.tsx
├── Navbar
├── FloatingParticles
├── Main Content (flex container)
│   ├── CheckoutForm (left/top)
│   │   ├── Form fields
│   │   ├── Team members section (conditional)
│   │   └── Pay Now button
│   └── OrderSummary (right/bottom on mobile)
│       ├── Items list (read-only)
│       ├── Subtotals
│       └── Grand total
└── Footer
```

### Styling Approach
Following existing patterns:
- Form inputs use `glass-card` backgrounds with primary border on focus
- Labels use muted-foreground color
- Error messages in destructive color
- Pay button uses gold gradient for emphasis
- Success page uses primary glow effects

### Responsive Design
- **Mobile**: Single column, form above order summary
- **Tablet/Desktop**: Two-column layout with sticky order summary

---

## Edge Function Placeholder

The checkout flow will prepare for a Supabase Edge Function that:
- Creates Razorpay orders
- Verifies payment signatures
- Stores orders in database

For now, the frontend will have the complete UI and Razorpay script loading, with the actual payment call ready to be connected once the edge function is set up.

---

## Implementation Order

1. Create `src/components/checkout/CheckoutForm.tsx` with form validation
2. Create `src/components/checkout/OrderSummary.tsx` for read-only cart display
3. Create `src/hooks/useRazorpay.ts` for payment script loading
4. Create `src/pages/Checkout.tsx` with full layout
5. Create `src/pages/OrderConfirmation.tsx` for success state
6. Update `src/App.tsx` with new routes
7. Update `src/components/passes/CartSummary.tsx` to navigate to checkout
8. Update `src/pages/Passes.tsx` and `src/pages/Events.tsx` with checkout navigation

