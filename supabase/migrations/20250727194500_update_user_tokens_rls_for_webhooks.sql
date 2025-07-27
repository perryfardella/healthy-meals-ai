-- Migration: Update user_tokens RLS policies for webhook operations
-- Purpose: Allow webhook operations while maintaining security
-- Timestamp: 2025-07-27 19:45:00 UTC

-- Drop existing policies
drop policy if exists "Authenticated users can insert their own token data" on public.user_tokens;
drop policy if exists "Authenticated users can update their own token data" on public.user_tokens;

-- Create new INSERT policy that allows webhook operations
create policy "Allow token record creation for authenticated users and webhooks" on public.user_tokens
  for insert to authenticated
  with check (
    -- Allow if user is inserting their own record
    (select auth.uid()) = user_id
    -- OR allow if it's a webhook operation (no auth context)
    or (select auth.uid()) is null
  );

-- Create new UPDATE policy that allows webhook operations
create policy "Allow token updates for authenticated users and webhooks" on public.user_tokens
  for update to authenticated
  using (
    -- Allow if user is updating their own record
    (select auth.uid()) = user_id
    -- OR allow if it's a webhook operation (no auth context)
    or (select auth.uid()) is null
  )
  with check (
    -- Allow if user is updating their own record
    (select auth.uid()) = user_id
    -- OR allow if it's a webhook operation (no auth context)
    or (select auth.uid()) is null
  );

-- Add a comment explaining the webhook allowance
comment on policy "Allow token record creation for authenticated users and webhooks" on public.user_tokens is 
  'Allows authenticated users to create their own token records and webhooks to create records for any user';

comment on policy "Allow token updates for authenticated users and webhooks" on public.user_tokens is 
  'Allows authenticated users to update their own token records and webhooks to update records for any user'; 