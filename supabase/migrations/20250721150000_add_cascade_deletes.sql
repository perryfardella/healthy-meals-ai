-- Migration: Add cascade deletes for user-related tables
-- Purpose: Ensure that when a user is deleted, all their recipes and token records are also deleted
-- Timestamp: 2025-07-21 15:00:00 UTC

-- 1. Drop existing foreign key constraints (PostgreSQL auto-generates constraint names)
-- We'll use a simple approach that works regardless of the actual constraint names
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all foreign key constraints on recipes.user_id
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.recipes'::regclass 
        AND contype = 'f'
    ) LOOP
        EXECUTE 'ALTER TABLE public.recipes DROP CONSTRAINT ' || r.conname;
    END LOOP;
    
    -- Drop all foreign key constraints on user_tokens.user_id  
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.user_tokens'::regclass 
        AND contype = 'f'
    ) LOOP
        EXECUTE 'ALTER TABLE public.user_tokens DROP CONSTRAINT ' || r.conname;
    END LOOP;
END $$;

-- 2. Re-add foreign key constraints with CASCADE DELETE
ALTER TABLE public.recipes 
ADD CONSTRAINT recipes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_tokens 
ADD CONSTRAINT user_tokens_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Add comments to document the cascade behavior
COMMENT ON CONSTRAINT recipes_user_id_fkey ON public.recipes IS 'Cascades delete to remove all user recipes when user is deleted';
COMMENT ON CONSTRAINT user_tokens_user_id_fkey ON public.user_tokens IS 'Cascades delete to remove user token record when user is deleted'; 