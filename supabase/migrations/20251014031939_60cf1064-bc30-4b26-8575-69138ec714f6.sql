-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for storing career cards
CREATE TABLE public.career_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.career_cards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read career cards (they are meant to be shared)
CREATE POLICY "Career cards are publicly readable"
ON public.career_cards
FOR SELECT
USING (true);

-- Allow anyone to insert career cards
CREATE POLICY "Anyone can create career cards"
ON public.career_cards
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update their own cards (by matching the id they know)
CREATE POLICY "Anyone can update career cards"
ON public.career_cards
FOR UPDATE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_career_cards_updated_at
BEFORE UPDATE ON public.career_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();