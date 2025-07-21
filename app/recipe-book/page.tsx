"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChefHat, Clock, Users, Loader2 } from "lucide-react";
import {
  RecipeGenerationResponseType,
  RecipeIngredient,
  RecipeStep,
  NutritionalInfo,
} from "@/lib/types/recipe";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  getUserRecipes,
  deleteRecipe,
  createRecipe,
} from "@/lib/services/recipe";

function RecipeCard({
  recipe,
}: {
  recipe: RecipeGenerationResponseType["recipe"];
}) {
  if (!recipe) return null;
  return (
    <Card className="bg-white/90 pt-0 backdrop-blur-sm border-0 shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg border-b border-emerald-100/50 p-6">
        <CardTitle className="flex items-center space-x-2 text-emerald-800">
          <ChefHat className="w-5 h-5 text-emerald-600" />
          <span>{recipe.title}</span>
        </CardTitle>
      </div>
      <CardContent className="space-y-4">
        <div>
          <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>
          {recipe.dietaryTags && (
            <div className="flex flex-wrap gap-2 mb-3">
              {recipe.dietaryTags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {recipe.nutrition && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-xs sm:text-sm font-semibold text-blue-700">
                {recipe.nutrition.calories}
              </div>
              <div className="text-xs text-blue-600">Calories</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-xs sm:text-sm font-semibold text-green-700">
                {recipe.nutrition.protein}g
              </div>
              <div className="text-xs text-green-600">Protein</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-xs sm:text-sm font-semibold text-yellow-700">
                {recipe.nutrition.carbs}g
              </div>
              <div className="text-xs text-yellow-600">Carbs</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="text-xs sm:text-sm font-semibold text-red-700">
                {recipe.nutrition.fat}g
              </div>
              <div className="text-xs text-red-600">Fat</div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span className="text-sm font-medium">Timing</span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Prep: {recipe.prepTime || 0} min</div>
              <div>Cook: {recipe.cookTime || 0} min</div>
              <div className="font-medium">
                Total: {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-gray-600">
              <Users className="w-3 h-3" />
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div>{recipe.servings || 4} servings</div>
              <div>
                <span className="text-gray-500">Difficulty:</span>{" "}
                {recipe.difficulty || "Medium"}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-gray-600">
              <ChefHat className="w-3 h-3" />
              <span className="text-sm font-medium">Info</span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <span className="text-gray-500">Cuisine:</span>{" "}
                {recipe.cuisine
                  ? Array.isArray(recipe.cuisine)
                    ? recipe.cuisine.join(", ")
                    : recipe.cuisine
                  : "Not specified"}
              </div>
              <div>
                <span className="text-gray-500">Cost:</span>{" "}
                {recipe.estimatedCost || "Not specified"}
              </div>
            </div>
          </div>
        </div>
        {recipe.ingredients && (
          <div>
            <h4 className="font-semibold mb-2 text-sm">Ingredients</h4>
            <div className="mb-3 text-xs text-gray-600 space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>From your kitchen</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Basic cupboard items</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Additional ingredients from shops</span>
              </div>
            </div>
            <ul className="space-y-1 text-sm">
              {recipe.ingredients.map(
                (
                  ingredient: {
                    name: string;
                    amount: string;
                    unit?: string;
                    notes?: string;
                    origin: "user" | "basic" | "additional";
                  },
                  index: number
                ) => {
                  const getDotColor = (origin: string) => {
                    switch (origin) {
                      case "user":
                        return "bg-green-400";
                      case "basic":
                        return "bg-gray-400";
                      case "additional":
                        return "bg-blue-400";
                      default:
                        return "bg-gray-400";
                    }
                  };
                  return (
                    <li key={index} className="flex items-center space-x-2">
                      <div
                        className={`w-1.5 h-1.5 ${getDotColor(
                          ingredient.origin
                        )} rounded-full flex-shrink-0`}
                      ></div>
                      <span className="text-gray-700">
                        {ingredient.amount}{" "}
                        {ingredient.unit ? `${ingredient.unit} ` : ""}
                        {ingredient.name}
                        {ingredient.notes && ` (${ingredient.notes})`}
                      </span>
                    </li>
                  );
                }
              )}
            </ul>
          </div>
        )}
        {recipe.instructions && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 text-sm">Instructions</h4>
              <ol className="space-y-2 text-sm">
                {recipe.instructions.map(
                  (
                    instruction: {
                      stepNumber: number;
                      instruction: string;
                      timeMinutes?: number;
                    },
                    index: number
                  ) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                        {instruction.stepNumber}
                      </div>
                      <span className="text-gray-700">
                        {instruction.instruction}
                      </span>
                    </li>
                  )
                )}
              </ol>
            </div>
          </>
        )}
        {recipe.tips && recipe.tips.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 text-sm text-emerald-700">
                Tips & Suggestions
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {recipe.tips.map((tip: string, idx: number) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AuthWarningBanner({ onClose }: { onClose: () => void }) {
  return (
    <div className="max-w-7xl mx-auto bg-yellow-100 border-l-4 border-yellow-400 text-yellow-900 px-6 py-3 mb-6 flex items-center justify-between rounded shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pr-4">
        <span>
          <strong>Warning:</strong> You are not signed in.{" "}
        </span>
        <span>
          <Link
            href="/auth/login"
            className="underline text-yellow-900 hover:text-yellow-700 font-semibold mx-1"
          >
            Sign in
          </Link>
          or
          <Link
            href="/auth/sign-up"
            className="underline text-yellow-900 hover:text-yellow-700 font-semibold mx-1"
          >
            Sign up
          </Link>
          to avoid losing your recipes!
        </span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-yellow-700 hover:text-yellow-900 font-bold text-2xl leading-none px-2 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        aria-label="Close warning"
      >
        ×
      </button>
    </div>
  );
}

export default function RecipeBookPage() {
  type DBRecipe = {
    id: number;
    user_id: string;
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
    created_at: string;
  };
  type LocalRecipe =
    import("@/lib/types/recipe").RecipeGenerationResponseType & { id: string };
  const [recipes, setRecipes] = useState<(DBRecipe | LocalRecipe)[]>([]); // DB or local
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  function isLocalRecipe(r: DBRecipe | LocalRecipe): r is LocalRecipe {
    return (r as LocalRecipe).recipe !== undefined;
  }
  function getRecipeTitle(r: DBRecipe | LocalRecipe) {
    return isLocalRecipe(r) ? r.recipe.title : r.title;
  }
  function getRecipeTotalTime(r: DBRecipe | LocalRecipe) {
    return isLocalRecipe(r)
      ? (r.recipe.prepTime || 0) + (r.recipe.cookTime || 0)
      : (r.prep_time || 0) + (r.cook_time || 0);
  }
  function getRecipeProtein(r: DBRecipe | LocalRecipe) {
    return isLocalRecipe(r)
      ? r.recipe.nutrition?.protein
      : r.nutrition?.protein;
  }
  function getRecipeCalories(r: DBRecipe | LocalRecipe) {
    return isLocalRecipe(r)
      ? r.recipe.nutrition?.calories
      : r.nutrition?.calories;
  }
  function getRecipeForCard(r: DBRecipe | LocalRecipe) {
    if (isLocalRecipe(r)) return r.recipe;
    return {
      title: r.title,
      description: r.description,
      prepTime: r.prep_time,
      cookTime: r.cook_time,
      servings: r.servings,
      difficulty: r.difficulty as "Easy" | "Medium" | "Hard",
      cuisine: r.cuisine,
      dietaryTags: r.dietary_tags,
      ingredients: r.ingredients,
      instructions: r.instructions,
      nutrition: r.nutrition,
      tips: r.tips ?? undefined,
      estimatedCost: r.estimated_cost as
        | "Budget"
        | "Moderate"
        | "Premium"
        | undefined,
    };
  }

  // Check auth status and fetch recipes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setShowBanner(false);
        setUserId(data.user.id);
        // MIGRATION: If localStorage has recipes, migrate them to Supabase
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("savedRecipes");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                // Migrate each recipe
                for (const r of parsed) {
                  // r is RecipeGenerationResponseType & { id: string }
                  if (r.recipe) {
                    await createRecipe(r.recipe, data.user.id);
                  }
                }
                localStorage.removeItem("savedRecipes");
              }
            } catch {}
          }
        }
        // Fetch from Supabase
        const { data: dbRecipes } = await getUserRecipes(data.user.id);
        if (dbRecipes) {
          setRecipes(dbRecipes);
          if (dbRecipes.length > 0) setSelectedId(dbRecipes[0].id);
        } else {
          setRecipes([]);
        }
      } else {
        setShowBanner(true);
        setUserId(null);
        // Fallback to localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("savedRecipes");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setRecipes(parsed);
              if (parsed.length > 0)
                setSelectedId(parsed[parsed.length - 1].id);
            } catch {
              setRecipes([]);
            }
          } else {
            setRecipes([]);
          }
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Delete handler
  const handleDelete = async (id: string | number) => {
    if (userId) {
      // DB delete
      setLoading(true);
      await deleteRecipe(Number(id), userId);
      const { data: dbRecipes } = await getUserRecipes(userId);
      setRecipes(dbRecipes || []);
      setSelectedId(dbRecipes && dbRecipes.length > 0 ? dbRecipes[0].id : null);
      setLoading(false);
    } else {
      // Local delete
      const updated = recipes.filter((r) => r.id !== id);
      setRecipes(updated);
      localStorage.setItem("savedRecipes", JSON.stringify(updated));
      setSelectedId(updated.length > 0 ? updated[updated.length - 1].id : null);
    }
  };

  const selectedRecipe = recipes.find((r) => r.id === selectedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4">
        {showBanner && (
          <AuthWarningBanner onClose={() => setShowBanner(false)} />
        )}
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-white/80 rounded-lg shadow-md p-4 mb-6 md:mb-0 md:mr-6 h-fit">
          <h3 className="text-lg font-semibold mb-4 text-purple-800">
            Your Recipes
          </h3>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin mb-2" />
              <span className="text-gray-500 text-sm">Loading recipes...</span>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-gray-500 text-sm">No recipes saved yet.</div>
          ) : (
            <ul className="space-y-2">
              {recipes.map((r) => (
                <li key={r.id} className="flex items-center group">
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-150 ${
                      selectedId === r.id
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white"
                        : "bg-gray-100 hover:bg-purple-100 text-gray-800"
                    }`}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <div className="font-medium leading-tight line-clamp-2">
                      {getRecipeTitle(r)}
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1 flex-wrap">
                      <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span role="img" aria-label="clock">
                          ⏰
                        </span>{" "}
                        {getRecipeTotalTime(r)} min
                      </span>
                      {getRecipeProtein(r) !== undefined && (
                        <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span role="img" aria-label="muscle">
                            💪
                          </span>{" "}
                          {getRecipeProtein(r)}g
                        </span>
                      )}
                      {getRecipeCalories(r) !== undefined && (
                        <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span role="img" aria-label="fire">
                            🔥
                          </span>{" "}
                          {getRecipeCalories(r)} kcal
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete recipe"
                    onClick={() => handleDelete(r.id)}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        {/* Main Recipe Display */}
        <section className="flex-1 min-h-[300px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full h-full py-24">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <span className="text-gray-500 text-lg">
                Loading your recipes...
              </span>
            </div>
          ) : selectedRecipe ? (
            <RecipeCard recipe={getRecipeForCard(selectedRecipe)} />
          ) : (
            <div className="flex flex-col items-center text-center text-gray-600 mt-12 gap-6">
              <div>No recipe to display. Please generate a recipe first.</div>
              <Button
                className="w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => router.push("/")}
              >
                Generate a Recipe
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
