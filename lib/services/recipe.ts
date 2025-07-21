import { createClient } from "@/lib/supabase/client";
import { Recipe } from "@/lib/types/recipe";

/**
 * Inserts a new recipe for the current user into the Supabase recipes table.
 * @param recipe - The recipe object (app structure)
 * @param userId - The user's UUID
 * @returns The inserted recipe row or an error
 */
export async function createRecipe(recipe: Recipe, userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipes")
    .insert([
      {
        user_id: userId,
        title: recipe.title,
        description: recipe.description,
        prep_time: recipe.prepTime,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        cuisine: Array.isArray(recipe.cuisine)
          ? recipe.cuisine
          : [recipe.cuisine],
        dietary_tags: recipe.dietaryTags,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutrition: recipe.nutrition,
        tips: recipe.tips ?? null,
        estimated_cost: recipe.estimatedCost ?? null,
      },
    ])
    .select()
    .single();
  return { data, error };
}

/**
 * Fetches all recipes for the current user from Supabase.
 * @param userId - The user's UUID
 * @returns Array of recipes or an error
 */
export async function getUserRecipes(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

/**
 * Deletes a recipe by id for the current user.
 * @param recipeId - The recipe's id (number)
 * @param userId - The user's UUID
 * @returns The deleted recipe row or an error
 */
export async function deleteRecipe(recipeId: number, userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("user_id", userId)
    .select()
    .single();
  return { data, error };
}
