

# Remove Technical Events & Add Duet Team Size

## Summary
Removing the "Technical" category from the events system and adding "Duet" as a new team size filter option.

---

## Changes Required

### 1. EventCard.tsx - Update Category Type
Remove 'technical' from the Event interface's category union type since it will no longer be used.

**Current:** `category: 'cultural' | 'technical' | 'gaming' | 'workshop'`  
**Updated:** `category: 'cultural' | 'gaming' | 'workshop'`

Also remove the technical color mapping from categoryColors.

---

### 2. EventFilters.tsx - Update Filters
**Categories:** Remove the "Technical" filter option from the categories array.

**Team Types:** Add "Duet" as a new filter option between Solo and Team:
- All
- Solo  
- Duet (new)
- Team

---

### 3. Events.tsx - Update Placeholder Events & Filter Logic
**Placeholder Events:**
- Remove all events with category 'technical' (events with id '3' and '4')
- Add a sample event with 'Duet' team size to showcase the option

**Filter Logic:**
- Update the team type filtering to handle 'duet' as a separate option
- Duet will match events where teamSize includes "duet" (case-insensitive)

---

## Technical Details

The filter logic will be updated to:
```text
- 'solo' -> matches teamSize containing "solo"
- 'duet' -> matches teamSize containing "duet" 
- 'team' -> matches everything else (group events)
```

---

## Files to Modify
1. `src/components/events/EventCard.tsx` - Type definition
2. `src/components/events/EventFilters.tsx` - Filter options
3. `src/pages/Events.tsx` - Sample data and filter logic

