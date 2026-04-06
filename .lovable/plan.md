

# Add Sports Tab & Time Display to Schedule

## Database Migration

Add a `time` text column to the `events` table (nullable, so existing events won't break):

```sql
ALTER TABLE public.events ADD COLUMN time text;
```

Also update the `user_order_details_view` if it selects from events — but it only joins orders/order_items, so no change needed there.

## ScheduleSection.tsx Changes

### 1. Update EventRow interface
Add `time: string | null` field.

### 2. Update Supabase query
Add `time` to the select list. Change `.order('name')` to `.order('time', { ascending: true, nullsFirst: false })` then `.order('name')` as a tiebreaker.

### 3. Add Sports tab state
Replace the single `activeDay` index with a `activeTab` state that can be `'sports'` or a day number index. When `activeTab === 'sports'`:
- Collect ALL events where `category === 'sports'` across all days
- Sort them by day, then by time

When a Day tab is selected:
- Filter that day's events to EXCLUDE `category === 'sports'`

### 4. Update tab UI
After the day buttons, add a "Sports" button styled consistently. Highlight it when `activeTab === 'sports'`. The day theme badge is hidden when Sports tab is active.

### 5. Display time on event cards
- Import `Clock` icon from `lucide-react`
- In each event card, if `event.time` exists, render it with a small clock icon above the event name
- Style: `<div className="flex items-center gap-1 text-xs text-accent mb-1"><Clock className="w-3 h-3" /><span>{event.time}</span></div>`

### 6. Sort helper
Add a `parseTime` utility that extracts the start time from strings like `"10:00 AM - 11:30 AM"` and converts to minutes for sorting. Events without a time sort to the end.

## Files Changed
- **Migration**: New SQL file adding `time` column
- **`src/components/landing/ScheduleSection.tsx`**: All UI and logic changes above

No other files need updating — the Schedule page and other consumers just render `<ScheduleSection />`.

