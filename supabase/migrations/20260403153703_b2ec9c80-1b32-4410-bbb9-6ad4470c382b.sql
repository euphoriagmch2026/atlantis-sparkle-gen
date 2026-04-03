
-- 1. Fix profiles: restrict SELECT to owner only
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Add length constraints to messages table
ALTER TABLE public.messages
  ADD CONSTRAINT messages_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT messages_email_length CHECK (char_length(email) BETWEEN 5 AND 255),
  ADD CONSTRAINT messages_message_length CHECK (char_length(message) BETWEEN 10 AND 2000);

-- 3. Fix trigger function to use SECURITY INVOKER explicitly
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
