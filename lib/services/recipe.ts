import { createClient } from "@/lib/supabase/client";
import {
  Recipe,
  RecipeModificationResponseType,
  RecipeIngredient,
  RecipeStep,
  NutritionalInfo,
} from "@/lib/types/recipe";

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
 * Inserts a modified recipe for the current user into the Supabase recipes table.
 * @param recipe - The modified recipe object (app structure)
 * @param userId - The user's UUID
 * @param parentRecipeId - The ID of the original recipe this is based on
 * @param modificationRequest - The original modification request
 * @param modificationCount - The number of modifications in the lineage
 * @returns The inserted recipe row or an error
 */
export async function createModifiedRecipe(
  recipe: Recipe,
  userId: string,
  parentRecipeId: number,
  modificationRequest: string,
  modificationCount: number = 1
) {
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
        parent_recipe_id: parentRecipeId,
        modification_request: modificationRequest,
        modification_count: modificationCount,
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
 * Fetches a single recipe by ID for the current user.
 * @param recipeId - The recipe's ID
 * @param userId - The user's UUID
 * @returns The recipe data or an error
 */
export async function getRecipeById(recipeId: number, userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .eq("user_id", userId)
    .single();
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

/**
 * Calls the recipe modification API to generate a modified recipe.
 * @param originalRecipe - The original recipe to modify
 * @param modificationRequest - The user's modification request
 * @param availableIngredients - Optional list of available ingredients
 * @param dietaryPreferences - Optional dietary preferences
 * @param allergies - Optional allergies
 * @returns The API response with modified recipe or error
 */
export async function modifyRecipe(
  originalRecipe: Recipe,
  modificationRequest: string,
  availableIngredients?: string[],
  dietaryPreferences?: string[],
  allergies?: string[]
): Promise<
  RecipeModificationResponseType | { error: string; suggestions?: string[] }
> {
  try {
    const response = await fetch("/api/recipe-modifier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originalRecipe,
        modificationRequest,
        availableIngredients,
        dietaryPreferences,
        allergies,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || "Failed to modify recipe",
        suggestions: data.suggestions,
      };
    }

    return data;
  } catch (error) {
    console.error("Error modifying recipe:", error);
    return { error: "Network error occurred while modifying recipe" };
  }
}

/**
 * Helper function to convert database recipe to Recipe type
 * @param dbRecipe - Recipe from database
 * @returns Recipe object
 */
export function convertDbRecipeToRecipe(dbRecipe: {
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  cuisine: string[];
  dietary_tags: string[];
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutrition: NutritionalInfo;
  tips: string[] | null;
  estimated_cost: string | null;
}): Recipe {
  return {
    title: dbRecipe.title,
    description: dbRecipe.description,
    prepTime: dbRecipe.prep_time,
    cookTime: dbRecipe.cook_time,
    servings: dbRecipe.servings,
    difficulty: dbRecipe.difficulty as "Easy" | "Medium" | "Hard",
    cuisine: dbRecipe.cuisine,
    dietaryTags: dbRecipe.dietary_tags,
    ingredients: dbRecipe.ingredients,
    instructions: dbRecipe.instructions,
    nutrition: dbRecipe.nutrition,
    tips: dbRecipe.tips || undefined,
    estimatedCost: dbRecipe.estimated_cost as
      | "Budget"
      | "Moderate"
      | "Premium"
      | undefined,
  };
}
