"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Wand2, AlertCircle, CheckCircle } from "lucide-react";
import { Recipe } from "@/lib/types/recipe";
import { modifyRecipe, createModifiedRecipe } from "@/lib/services/recipe";
import { useTokens } from "@/lib/hooks/useTokens";

interface RecipeModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalRecipe: Recipe;
  originalRecipeId: number;
  userId: string;
  onModificationSuccess: () => void; // Callback to refresh recipe list
}

export default function RecipeModificationModal({
  isOpen,
  onClose,
  originalRecipe,
  originalRecipeId,
  userId,
  onModificationSuccess,
}: RecipeModificationModalProps) {
  const [modificationRequest, setModificationRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [modifiedRecipe, setModifiedRecipe] = useState<Recipe | null>(null);
  const [changesExplanation, setChangesExplanation] = useState<string>("");

  const { balance, refreshBalance } = useTokens();
  const tokens = balance?.tokens_balance || 0;

  const handleSubmit = async () => {
    if (!modificationRequest.trim()) {
      setError("Please enter a modification request");
      return;
    }

    if (tokens < 1) {
      setError("Insufficient tokens. You need 1 token to modify a recipe.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setSuccess(false);

    try {
      const result = await modifyRecipe(
        originalRecipe,
        modificationRequest.trim()
      );

      if ("error" in result) {
        setError(
          typeof result.error === "string" ? result.error : "An error occurred"
        );
        setSuggestions(result.suggestions || []);
        return;
      }

      if (result.modifiedRecipe && result.changesExplanation) {
        setModifiedRecipe(result.modifiedRecipe);
        setChangesExplanation(result.changesExplanation);
        setSuccess(true);
      } else {
        setError("Received invalid response from modification service");
      }
    } catch (error) {
      console.error("Error modifying recipe:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModifiedRecipe = async () => {
    if (!modifiedRecipe) return;

    setLoading(true);
    try {
      const { error } = await createModifiedRecipe(
        modifiedRecipe,
        userId,
        originalRecipeId,
        modificationRequest.trim(),
        1 // For now, we'll set modification count to 1, but this could be improved to track lineage
      );

      if (error) {
        setError("Failed to save modified recipe");
        return;
      }

      // Refresh token balance
      await refreshBalance();

      // Notify parent to refresh recipe list
      onModificationSuccess();

      handleClose();
    } catch (error) {
      console.error("Error saving modified recipe:", error);
      setError("Failed to save modified recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModificationRequest("");
    setError(null);
    setSuggestions([]);
    setSuccess(false);
    setModifiedRecipe(null);
    setChangesExplanation("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Modify Recipe: {originalRecipe.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!success ? (
            <>
              {/* Token Balance Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-800">
                    <strong>Token Balance:</strong> {tokens} tokens
                  </div>
                  <div className="text-sm text-blue-600">
                    Cost: 1 token per modification
                  </div>
                </div>
              </div>

              {/* Modification Request Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to change about this recipe?
                </label>
                <Textarea
                  value={modificationRequest}
                  onChange={(e) => setModificationRequest(e.target.value)}
                  placeholder="e.g., 'I don't have lemons, can I use limes instead?', 'Make it vegetarian', 'I don't have a blender, can you modify the recipe?', 'Make it spicier'"
                  className="min-h-[120px]"
                  disabled={loading}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Be specific about what you want to change, what ingredients
                  you have available, or any dietary restrictions.
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-red-800 font-medium">Error</div>
                      <div className="text-red-700 text-sm">{error}</div>
                    </div>
                  </div>
                  {suggestions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-red-800 font-medium text-sm mb-1">
                        Suggestions:
                      </div>
                      <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                        {suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    loading || !modificationRequest.trim() || tokens < 1
                  }
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Modifying Recipe...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Modify Recipe (1 token)
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Success State - Show Modified Recipe */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="text-green-800 font-medium">
                    Recipe Modified Successfully!
                  </div>
                </div>
              </div>

              {/* Changes Explanation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What Changed?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {changesExplanation}
                  </p>
                </CardContent>
              </Card>

              {/* Modified Recipe Preview */}
              {modifiedRecipe && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Modified Recipe Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {modifiedRecipe.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {modifiedRecipe.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Prep:</span>{" "}
                        {modifiedRecipe.prepTime} min
                      </div>
                      <div>
                        <span className="text-gray-500">Cook:</span>{" "}
                        {modifiedRecipe.cookTime} min
                      </div>
                      <div>
                        <span className="text-gray-500">Servings:</span>{" "}
                        {modifiedRecipe.servings}
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty:</span>{" "}
                        {modifiedRecipe.difficulty}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="font-semibold text-blue-700">
                          {modifiedRecipe.nutrition.calories}
                        </div>
                        <div className="text-xs text-blue-600">Calories</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="font-semibold text-green-700">
                          {modifiedRecipe.nutrition.protein}g
                        </div>
                        <div className="text-xs text-green-600">Protein</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <div className="font-semibold text-yellow-700">
                          {modifiedRecipe.nutrition.carbs}g
                        </div>
                        <div className="text-xs text-yellow-600">Carbs</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <div className="font-semibold text-red-700">
                          {modifiedRecipe.nutrition.fat}g
                        </div>
                        <div className="text-xs text-red-600">Fat</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons for Success State */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Discard modified recipe
                </Button>
                <Button
                  onClick={handleSaveModifiedRecipe}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save modified recipe as a new recipe
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
