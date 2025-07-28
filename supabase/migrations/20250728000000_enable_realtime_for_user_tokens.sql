-- Migration: Enable real-time for user_tokens table
-- Purpose: Allow real-time subscriptions to token balance changes
-- Timestamp: 2025-07-28 00:00:00 UTC

-- Enable real-time for the user_tokens table
alter publication supabase_realtime add table public.user_tokens;

-- Add comment for documentation
comment on table public.user_tokens is 'Stores user token balances and free generation counts for the Healthy Meals AI app. Real-time enabled for instant balance updates.'; 