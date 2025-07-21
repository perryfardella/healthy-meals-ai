"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChefHat, Clock, Users } from "lucide-react";
import { RecipeGenerationResponseType } from "@/lib/types/recipe";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function RecipeCard({
  recipe,
}: {
  recipe: RecipeGenerationResponseType["recipe"];
}) {
  if (!recipe) return null;
  return (
    <Card className="bg-white/90 pt-0 backdrop-blur-sm border-0 shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 max-w-2xl mx-auto mt-8">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg border-b border-emerald-100/50 p-6">
        <CardTitle className="flex items-center space-x-2 text-emerald-800">
          <ChefHat className="w-5 h-5 text-emerald-600" />
          <span>Your Generated Recipe</span>
        </CardTitle>
      </div>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{recipe.title}</h3>
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

export default function RecipeBookPage() {
  const [recipe, setRecipe] = useState<
    RecipeGenerationResponseType["recipe"] | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("latestRecipe");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRecipe(parsed.recipe ? parsed.recipe : parsed); // support both {recipe: ...} and direct
        } catch {
          setRecipe(null);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-800 via-pink-800 to-indigo-800 bg-clip-text text-transparent mb-6 text-center">
          Recipe Book
        </h2>
        {recipe ? (
          <RecipeCard recipe={recipe} />
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
      </main>
    </div>
  );
}
