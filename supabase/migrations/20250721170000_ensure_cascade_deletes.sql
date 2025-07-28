-- Migration: Ensure cascade deletes work properly
-- Purpose: Fix the cascade delete behavior for user-related tables
-- Timestamp: 2025-07-21 17:00:00 UTC

-- 1. First, let's check if the constraints exist and drop them if they do
-- This is a safer approach that won't affect other constraints

-- For recipes table
DO $$
BEGIN
    -- Drop the constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'recipes_user_id_fkey' 
        AND conrelid = 'public.recipes'::regclass
    ) THEN
        ALTER TABLE public.recipes DROP CONSTRAINT recipes_user_id_fkey;
    END IF;
END $$;

-- For user_tokens table
DO $$
BEGIN
    -- Drop the constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_tokens_user_id_fkey' 
        AND conrelid = 'public.user_tokens'::regclass
    ) THEN
        ALTER TABLE public.user_tokens DROP CONSTRAINT user_tokens_user_id_fkey;
    END IF;
END $$;

-- 2. Now add the constraints with CASCADE DELETE
ALTER TABLE public.recipes 
ADD CONSTRAINT recipes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_tokens 
ADD CONSTRAINT user_tokens_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Verify the constraints were created correctly
DO $$
DECLARE
    cascade_count integer;
BEGIN
    -- Check that we have CASCADE delete rules
    SELECT COUNT(*) INTO cascade_count
    FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
    WHERE tc.table_name IN ('recipes', 'user_tokens')
    AND tc.constraint_type = 'FOREIGN KEY'
    AND rc.delete_rule = 'CASCADE';
    
    IF cascade_count < 2 THEN
        RAISE EXCEPTION 'Cascade delete constraints not properly created. Found % constraints with CASCADE rule.', cascade_count;
    END IF;
END $$; 