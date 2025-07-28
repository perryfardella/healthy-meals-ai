-- Migration: Add recipe relationships for recipe modifications
-- Purpose: Track parent-child relationships between original and modified recipes
-- Timestamp: 2025-07-28 10:00:00 UTC

-- 1. Add parent_recipe_id column to track recipe modifications
alter table public.recipes 
add column parent_recipe_id bigint references public.recipes(id) on delete set null;

-- 2. Add index for efficient relationship queries
create index if not exists idx_recipes_parent_recipe_id on public.recipes(parent_recipe_id);

-- 3. Add helpful comments
comment on column public.recipes.parent_recipe_id is 'References the original recipe if this is a modification. NULL for original recipes.';

-- 4. Add modification tracking columns for better UX
alter table public.recipes 
add column modification_request text,
add column modification_count integer not null default 0;

comment on column public.recipes.modification_request is 'The original user request that led to this recipe modification. NULL for original recipes.';
comment on column public.recipes.modification_count is 'Number of times this recipe (or its ancestors) has been modified. 0 for original recipes.';

-- 5. Create a function to get recipe lineage (optional, for future features)
create or replace function get_recipe_lineage(recipe_id bigint)
returns table(
  id bigint,
  title text,
  modification_request text,
  level integer
)
language sql
stable
as $$
  with recursive recipe_lineage as (
    -- Base case: start with the given recipe
    select r.id, r.title, r.modification_request, 0 as level
    from recipes r
    where r.id = recipe_id
    
    union all
    
    -- Recursive case: find parent recipes
    select r.id, r.title, r.modification_request, rl.level + 1
    from recipes r
    inner join recipe_lineage rl on r.id = rl.id
    where r.parent_recipe_id is not null
  )
  select * from recipe_lineage
  order by level desc;
$$;

comment on function get_recipe_lineage is 'Returns the full lineage of a recipe from original to current modification.'; 