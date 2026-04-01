

# Full Analysis & Production Deployment Prompts

## Issues Found

### Critical Build Error
- `create-razorpay-order/index.ts` line 143: Invalid escape character `\` after `college: userDetails.college,\` — causes deployment failure.
- Line 144 references `userDetails.userId` but `UserDetailsSchema` has no `userId` field — will always be `undefined`.

### Security Vulnerabilities
1. **Orders table `USING (true)` SELECT policy** ("Public view by ID") — anyone can read ALL orders including names, emails, phones, colleges. Major PII leak.
2. **Duplicate/conflicting RLS policies** on `orders` — 3 SELECT policies plus an ALL policy with `USING (true)` effectively grant everyone full read access.
3. **Service role ALL policy** with `USING (true)` on `orders` targets `public` role — this means the anon role also gets full access through this policy.
4. **"Register Now" button** in HeroSection does nothing (no onClick handler).
5. **Contact form** has no backend — form submission does nothing.
6. **Schedule page** uses hardcoded data instead of fetching from the events table.
7. **Footer quick links** use `#schedule` and `#register` anchors that don't work from non-index pages.
8. **Auth page** has no "Register" distinction — just a generic Supabase Auth UI with no signup fields for phone/college.
9. **No email confirmation** is actually sent — the verify function references RESEND_API_KEY but the confirmation page says "A confirmation email has been sent" regardless.

---

## Prompt 1: Fix Critical Build Error + Security Hardening

Send this first:

---

**URGENT: Fix the build error in `create-razorpay-order/index.ts` and harden database security.**

1. **Fix build error** in `supabase/functions/create-razorpay-order/index.ts`:
   - Line 143 has a stray backslash: `college: userDetails.college,\` — remove the `\`.
   - Line 144 references `userDetails.userId` but the Zod schema `UserDetailsSchema` does not have a `userId` field. Fix this by extracting the authenticated user from the request's Authorization header using `supabase.auth.getUser(token)` and using that user's ID. If no authenticated user, set `user_id` to `null` (guest checkout).

2. **Fix dangerous RLS policies on the `orders` table**:
   - DROP the policy named `"Public view by ID"` — it uses `USING (true)` which exposes ALL order data (names, emails, phones) to the public internet.
   - DROP the policy named `"Service role full access"` — it targets the `public` role with `USING (true)`, which means anon users also get full access.
   - DROP the duplicate policies `"Users can view own orders"` and `"Users can view their own orders"` — keep only `"Users can read own orders"`.
   - The `get_order_summary` function already exists as the secure guest lookup mechanism, so no public SELECT policy is needed.

3. **Fix RLS on `order_items`**: DROP the duplicate policy `"Users can view own order items"` — keep only `"Users can read own order items"`.

4. Deploy the fixed `create-razorpay-order` edge function after changes.

Do NOT change any frontend code in this prompt. Focus only on the edge function fix and database security.

---

## Prompt 2: Authentication with Registration Flow

Send this second:

---

**Replace the Auth page with a proper Registration + Login system.**

Requirements:
- Users need to provide: Full Name, Email, Password, Phone Number, and College Name during signup.
- Phone and College should be stored in the `profiles` table (which already exists with `phone` and `college` columns).
- The existing `handle_new_user` trigger creates a profile on signup — update it to also save `phone` and `college` from `raw_user_meta_data`.

Implementation:
1. **Replace `src/pages/Auth.tsx`** with a custom auth page that has two tabs: "Sign In" and "Register".
   - **Sign In tab**: Email + Password fields, "Forgot Password?" link, Sign In button.
   - **Register tab**: Full Name, Email, Password, Confirm Password, Phone (10 digits), College fields, Register button.
   - Use `supabase.auth.signUp()` with `options.data` to pass `full_name`, `phone`, `college` as user metadata.
   - Use `supabase.auth.signInWithPassword()` for login.
   - After registration, show a message: "Check your email to verify your account before signing in."
   - Style it to match the existing dark Atlantis/Euphoria theme with glass-card styling.

2. **Update the database trigger** `handle_new_user` to also save phone and college:
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
   BEGIN
     INSERT INTO public.profiles (id, full_name, phone, college, avatar_url)
     VALUES (
       new.id,
       new.raw_user_meta_data->>'full_name',
       new.raw_user_meta_data->>'phone',
       new.raw_user_meta_data->>'college',
       new.raw_user_meta_data->>'avatar_url'
     );
     RETURN new;
   END;
   $$;
   ```

3. **Wire the "Register Now" button** in `src/components/landing/HeroSection.tsx` (line 83-88) to navigate to `/auth?tab=register`.

4. **Fix Footer quick links**: Change `#schedule` to `/schedule` and `#register` to `/auth?tab=register`.

Do NOT enable auto-confirm for email signups. Users must verify their email first.

---

## Prompt 3: Contact Page with Working Form + Messages Table

Send this third:

---

**Make the Contact page form functional by saving submissions to the database and showing a success toast.**

The `messages` table already exists with columns: `id`, `name`, `email`, `message`, `created_at` and an RLS policy allowing public inserts.

Implementation:
1. **Update `src/pages/Contact.tsx`**:
   - Use `react-hook-form` with `zod` validation: Name (min 2 chars, max 100), Email (valid format), Message (min 10 chars, max 1000).
   - On submit, insert into the `messages` table using `supabase.from('messages').insert({ id: crypto.randomUUID(), name, email, message })`.
   - Show a success toast "Message sent! We'll get back to you soon." on success.
   - Show an error toast on failure.
   - Disable the submit button while submitting and show a loading spinner.
   - Keep the existing two-column layout (contact info left, form right).
   - Add the address, email, phone, and Google Maps embed from the Footer component to the contact info side.

2. **Add a SELECT policy** to the `messages` table so admins can read messages later (for now, just ensure inserts work for anonymous users, which they already do).

---

## Prompt 4: Schedule Page Fetching from Database

Send this fourth:

---

**Update the Schedule page to fetch event data from the `events` table instead of using hardcoded data.**

1. **Update `src/components/landing/ScheduleSection.tsx`**:
   - Fetch events from the `events` table using `supabase.from('events').select('*').order('day').order('name')`.
   - Group events by their `day` column (1, 2, 3, 4).
   - For each day, display the events in a timeline format as currently designed.
   - Use the event's `name` as the title, `description` as the description, and `category` as a colored badge.
   - Keep the day tabs UI but generate them dynamically from the data.
   - Show a loading skeleton while data loads.
   - If no events exist for a day, show "Schedule coming soon" placeholder.
   - The date labels (April 30, May 1, etc.) and theme names ("The Awakening", etc.) can remain hardcoded as a mapping since they are not in the events table.

2. The `ScheduleSection` is used on both the Index page and the `/schedule` route — ensure both work correctly.

---

## Prompt 5: Order Confirmation Email (Free via Lovable Email)

Send this fifth:

---

**Set up order confirmation emails that are sent automatically after successful payment using Lovable's built-in email system.**

Requirements:
- After payment verification succeeds in `verify-razorpay-payment`, send a confirmation email to the buyer.
- The email should include: buyer's name, order ID, list of items purchased with quantities, total amount paid, and a thank you message branded with EUPHORIA 2026 styling.
- Use the built-in Lovable email infrastructure (not Resend or any third-party service).
- Remove the existing Resend email code from `verify-razorpay-payment/index.ts` (lines 88-131) since we are switching to the built-in system.

Email template details:
- Subject: "Your EUPHORIA 2026 Registration is Confirmed!"
- Body: Branded header with EUPHORIA 2026, greeting with buyer's name, order summary table (item name, quantity, price), total paid, order ID for reference, "See you at the fest!" closing message.
- Use the project's color scheme: deep ocean blues/teals as accents on a white email background.

---

## Prompt 6: Final Production Polish

Send this last:

---

**Production polish and remaining fixes for deployment.**

1. **Order Confirmation page**: Update `src/pages/OrderConfirmation.tsx` to use the secure `get_order_summary` database function instead of relying solely on navigation state. If `location.state` is missing (e.g., user refreshes the page), show a form asking for Order ID and Email, then call `supabase.rpc('get_order_summary', { p_order_id: orderId, p_email: email })` to fetch and display the order details.

2. **Checkout page user pre-fill**: If the user is logged in, pre-fill the checkout form (Full Name, Email, Phone, College) from their profile data by fetching from the `profiles` table.

3. **Pass `user_id` during checkout**: In `src/pages/Checkout.tsx`, check if the user is authenticated. If yes, include the user's ID in the checkout flow so the edge function can associate the order with the user.

4. **Meta tags for SEO**: Add proper `<title>` and `<meta description>` tags to `index.html` for EUPHORIA 2026.

5. **Remove hardcoded PASSES array**: The `PASSES` constant in `src/types/passes.ts` (lines 35-64) is no longer used since passes are fetched from the database. Remove it to avoid confusion. Keep the type definitions.

6. **404 page**: Ensure the NotFound page has proper styling matching the theme with a link back to home.

---

## Summary of All Issues Addressed

| Issue | Prompt |
|-------|--------|
| Build error (backslash + missing userId) | Prompt 1 |
| PII-leaking RLS policies on orders | Prompt 1 |
| Duplicate RLS policies | Prompt 1 |
| No registration flow / "Register Now" button broken | Prompt 2 |
| Profile trigger missing phone/college | Prompt 2 |
| Footer broken links | Prompt 2 |
| Contact form non-functional | Prompt 3 |
| Schedule page hardcoded | Prompt 4 |
| No confirmation email sent | Prompt 5 |
| Order confirmation page fragile (state-dependent) | Prompt 6 |
| Checkout not pre-filling user data | Prompt 6 |
| Stale hardcoded PASSES array | Prompt 6 |
| SEO meta tags missing | Prompt 6 |

Send these prompts in order (1 through 6). Each is scoped to avoid conflicts with the others.

