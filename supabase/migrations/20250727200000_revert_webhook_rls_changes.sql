-- Migration: Revert webhook RLS changes back to original secure policies
-- Purpose: Remove the problematic webhook policies and restore original security
-- Timestamp: 2025-07-27 20:00:00 UTC

-- Drop the problematic policies we created
drop policy if exists "Allow token record creation for authenticated users and webhooks" on public.user_tokens;
drop policy if exists "Allow token updates for authenticated users and webhooks" on public.user_tokens;

-- Restore the original secure policies
create policy "Authenticated users can insert their own token data" on public.user_tokens
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Authenticated users can update their own token data" on public.user_tokens
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id); 