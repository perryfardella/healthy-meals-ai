-- Migration: Create recipes table for Healthy Meals AI
-- Purpose: Store user recipes with full CRUD, RLS, and secure access
-- Timestamp: 2025-07-21 12:11:14 UTC

-- 1. Create the recipes table
create table public.recipes (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text not null,
  prep_time integer not null,
  cook_time integer not null,
  servings integer not null,
  difficulty text not null, -- 'Easy', 'Medium', 'Hard'
  cuisine text[] not null,
  dietary_tags text[] not null,
  ingredients jsonb not null, -- array of RecipeIngredient
  instructions jsonb not null, -- array of RecipeStep
  nutrition jsonb not null, -- NutritionalInfo
  tips text[],
  estimated_cost text, -- 'Budget', 'Moderate', 'Premium'
  created_at timestamptz not null default now()
);

comment on table public.recipes is 'Stores all user recipes, including metadata, ingredients, instructions, and nutrition.';

-- 2. Enable Row Level Security (RLS)
alter table public.recipes enable row level security;

-- 3. Index for fast user lookups
create index if not exists idx_recipes_user_id on public.recipes(user_id);

-- 4. RLS Policies
-- Only authenticated users can access their own recipes. Anon users cannot access any recipes in the DB.

-- SELECT: Only recipe owner can read
create policy "Authenticated users can select their own recipes" on public.recipes
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT: Only authenticated users can insert, and only for themselves
create policy "Authenticated users can insert their own recipes" on public.recipes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE: Only recipe owner can update
create policy "Authenticated users can update their own recipes" on public.recipes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- DELETE: Only recipe owner can delete
create policy "Authenticated users can delete their own recipes" on public.recipes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- No policies for anon users: they cannot access the recipes table at all. 