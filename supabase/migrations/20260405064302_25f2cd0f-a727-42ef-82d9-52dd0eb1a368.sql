
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_category_check;
UPDATE public.events SET category = 'sports' WHERE category = 'gaming';
ALTER TABLE public.events ADD CONSTRAINT events_category_check CHECK (category IN ('cultural', 'sports', 'workshop', 'literary'));
