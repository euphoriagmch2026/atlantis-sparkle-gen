

# Rename "Gaming" → "Sports" Across the Application

## Overview
Replace all references to "gaming" with "sports" in frontend code, types, and database records. Update the associated icon from `Gamepad2` to `Trophy`.

## Changes

### 1. Frontend Components (7 files)

| File | Change |
|------|--------|
| `src/components/events/EventFilters.tsx` | `{ id: 'gaming', label: 'Gaming' }` → `{ id: 'sports', label: 'Sports' }` |
| `src/components/events/EventCard.tsx` | Type literal `'gaming'` → `'sports'`; key in `categoryColors` |
| `src/components/landing/EventsPreviewSection.tsx` | Title `'Gaming'` → `'Sports'`, description updated, icon `Gamepad2` → `Trophy` |
| `src/components/landing/ScheduleSection.tsx` | Key `gaming` → `sports` in `CATEGORY_COLORS` |
| `src/components/checkout/OrderSummary.tsx` | Key `gaming` → `sports` in `eventCategoryColors` |
| `src/components/passes/CartSummary.tsx` | Key `gaming` → `sports` in `eventCategoryColors` |
| `src/pages/EventDetails.tsx` | Key `gaming` → `sports` in `categoryColors` |
| `src/pages/Events.tsx` | Type cast `'gaming'` → `'sports'` |

### 2. Types
- `src/types/passes.ts`: Change `'cultural' | 'gaming' | 'workshop'` → `'cultural' | 'sports' | 'workshop'`

### 3. Database Update
Run an UPDATE on the `events` table to change existing records:
```sql
UPDATE events SET category = 'sports' WHERE category = 'gaming';
```

### 4. Icon Change
In `EventsPreviewSection.tsx`, replace `import { Gamepad2 }` with `import { Trophy }` from `lucide-react` and use `<Trophy />` for the Sports category card.

