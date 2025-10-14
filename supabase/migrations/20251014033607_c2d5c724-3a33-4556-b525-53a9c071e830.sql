-- Add user_id column to career_cards table
ALTER TABLE public.career_cards 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can create career cards" ON public.career_cards;
DROP POLICY IF EXISTS "Anyone can update career cards" ON public.career_cards;
DROP POLICY IF EXISTS "Career cards are publicly readable" ON public.career_cards;

-- Create secure RLS policies
-- Allow public read access (so shared links work)
CREATE POLICY "Career cards are publicly readable"
ON public.career_cards
FOR SELECT
USING (true);

-- Only authenticated users can create their own cards
CREATE POLICY "Authenticated users can create their own cards"
ON public.career_cards
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only owners can update their own cards
CREATE POLICY "Users can update their own cards"
ON public.career_cards
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only owners can delete their own cards
CREATE POLICY "Users can delete their own cards"
ON public.career_cards
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);