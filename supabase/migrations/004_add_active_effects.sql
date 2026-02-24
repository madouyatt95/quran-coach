-- Add activeEffects column to quiz_matches for Mario Kart style power-ups
ALTER TABLE public.quiz_matches 
ADD COLUMN IF NOT EXISTS "activeEffects" jsonb DEFAULT '[]'::jsonb;
