"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RecipeGenerationRequest,
  RecipeGenerationResponse,
} from "@/lib/types/recipe";

export function RecipeGenerator() {
  const [ingredients, setIngredients] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [allergies, setAllergies] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [servings, setServings] = useState("4");
  const [cuisine, setCuisine] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<RecipeGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setRecipe(null);

    try {
      const request: RecipeGenerationRequest = {
        availableIngredients: ingredients
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        dietaryPreferences: dietaryPreferences
          ? dietaryPreferences
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p)
          : undefined,
        allergies: allergies
          ? allergies
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a)
          : undefined,
        maxPrepTime: maxPrepTime ? parseInt(maxPrepTime) : undefined,
        servings: parseInt(servings),
        cuisine: cuisine || undefined,
      };

      const response = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipe");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }

      let result = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        result += chunk;
      }

      // Parse the JSON response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      const parsedRecipe = JSON.parse(jsonMatch[0]) as RecipeGenerationResponse;
      setRecipe(parsedRecipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Your Recipe</CardTitle>
          <CardDescription>
            Enter your available ingredients and preferences to get a
            personalized, high-protein recipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="ingredients">Available Ingredients *</Label>
              <Input
                id="ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g., chicken breast, quinoa, broccoli, olive oil"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate ingredients with commas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
                <Input
                  id="dietaryPreferences"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  placeholder="e.g., high-protein, low-carb, vegan"
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g., nuts, dairy, gluten"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxPrepTime">Max Prep Time (minutes)</Label>
                <Input
                  id="maxPrepTime"
                  type="number"
                  value={maxPrepTime}
                  onChange={(e) => setMaxPrepTime(e.target.value)}
                  placeholder="30"
                />
              </div>

              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  min="1"
                  max="12"
                />
              </div>

              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Input
                  id="cuisine"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g., Mediterranean, Asian, Italian"
                />
              </div>
            </div>

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? "Generating Recipe..." : "Generate Recipe"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {recipe && <RecipeDisplay recipe={recipe} />}
    </div>
  );
}

function RecipeDisplay({ recipe }: { recipe: RecipeGenerationResponse }) {
  const {
    recipe: recipeData,
    usedIngredients,
    suggestedAdditionalIngredients,
    confidence,
  } = recipe;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{recipeData.title}</CardTitle>
        <CardDescription>{recipeData.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipe Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Prep Time</p>
            <p className="font-semibold">{recipeData.prepTime} min</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cook Time</p>
            <p className="font-semibold">{recipeData.cookTime} min</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Servings</p>
            <p className="font-semibold">{recipeData.servings}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Difficulty</p>
            <p className="font-semibold">{recipeData.difficulty}</p>
          </div>
        </div>

        {/* Dietary Tags */}
        <div>
          <h3 className="font-semibold mb-2">Dietary Tags</h3>
          <div className="flex flex-wrap gap-2">
            {recipeData.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Nutrition */}
        <div>
          <h3 className="font-semibold mb-2">Nutrition (per serving)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="font-semibold">{recipeData.nutrition.calories}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="font-semibold text-green-600">
                {recipeData.nutrition.protein}g
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Carbs</p>
              <p className="font-semibold">{recipeData.nutrition.carbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Fat</p>
              <p className="font-semibold">{recipeData.nutrition.fat}g</p>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <h3 className="font-semibold mb-2">Ingredients</h3>
          <ul className="space-y-1">
            {recipeData.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-sm">
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </span>
                {ingredient.notes && (
                  <span className="text-xs text-muted-foreground">
                    ({ingredient.notes})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ol className="space-y-2">
            {recipeData.instructions.map((step) => (
              <li key={step.stepNumber} className="flex gap-3">
                <span className="font-semibold text-sm min-w-[20px]">
                  {step.stepNumber}.
                </span>
                <span className="text-sm">{step.instruction}</span>
                {step.timeMinutes && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({step.timeMinutes} min)
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        {recipeData.tips && recipeData.tips.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Tips</h3>
            <ul className="space-y-1">
              {recipeData.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Used Ingredients */}
        <div>
          <h3 className="font-semibold mb-2">Ingredients Used</h3>
          <div className="flex flex-wrap gap-2">
            {usedIngredients.map((ingredient) => (
              <span
                key={ingredient}
                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested Additional Ingredients */}
        {suggestedAdditionalIngredients &&
          suggestedAdditionalIngredients.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">
                Suggested Additional Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestedAdditionalIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Confidence Score */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Recipe confidence: {Math.round(confidence * 100)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
