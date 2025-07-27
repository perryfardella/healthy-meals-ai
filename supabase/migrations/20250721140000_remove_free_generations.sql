-- Migration: Remove free_generations_left column from user_tokens table
-- Purpose: Simplify token system to only use tokens, not free generations
-- Timestamp: 2025-07-21 14:00:00 UTC

-- 1. Update existing records to give users 10 tokens if they have free generations left
UPDATE public.user_tokens 
SET tokens_balance = tokens_balance + (free_generations_left * 1)
WHERE free_generations_left > 0;

-- 2. Remove the free_generations_left column
ALTER TABLE public.user_tokens DROP COLUMN IF EXISTS free_generations_left;

-- 3. Update the trigger function to only set tokens_balance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, tokens_balance)
  VALUES (new.id, 10);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 