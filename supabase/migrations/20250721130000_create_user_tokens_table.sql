-- Migration: Create user_tokens table for Healthy Meals AI
-- Purpose: Store user token balances and free generation counts for the token-based system
-- Timestamp: 2025-07-21 13:00:00 UTC

-- 1. Create the user_tokens table
create table public.user_tokens (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) not null unique,
  tokens_balance integer not null default 10,
  total_generations_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_tokens is 'Stores user token balances and free generation counts for the Healthy Meals AI app.';

-- 2. Enable Row Level Security (RLS)
alter table public.user_tokens enable row level security;

-- 3. Index for fast user lookups
create index if not exists idx_user_tokens_user_id on public.user_tokens(user_id);

-- 4. RLS Policies
-- Only authenticated users can access their own token data. Anon users cannot access any token data.

-- SELECT: Only token owner can read
create policy "Authenticated users can select their own token data" on public.user_tokens
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT: Only authenticated users can insert, and only for themselves
create policy "Authenticated users can insert their own token data" on public.user_tokens
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE: Only token owner can update
create policy "Authenticated users can update their own token data" on public.user_tokens
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- DELETE: Only token owner can delete
create policy "Authenticated users can delete their own token data" on public.user_tokens
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- No policies for anon users: they cannot access the user_tokens table at all.

-- 5. Create a function to automatically create token record for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_tokens (user_id, tokens_balance)
  values (new.id, 10);
  return new;
end;
$$ language plpgsql security definer;

-- 6. Create trigger to automatically create token record when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Create a function to update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 8. Create trigger to automatically update updated_at
create trigger update_user_tokens_updated_at
  before update on public.user_tokens
  for each row execute procedure public.update_updated_at_column(); 