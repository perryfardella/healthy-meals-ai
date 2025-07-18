"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Utensils,
  Heart,
  Zap,
  Clock,
  Users,
  Sparkles,
  Leaf,
  Shield,
  ShoppingCart,
  ChefHat,
} from "lucide-react";

interface DietaryPreference {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Allergy {
  id: string;
  label: string;
}

interface GeneratedMeal {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  prepTime: string;
  difficulty: string;
  tags: string[];
}

const dietaryPreferences: DietaryPreference[] = [
  {
    id: "high-protein",
    label: "High Protein",
    icon: <Zap className="w-4 h-4" />,
  },
  { id: "low-carb", label: "Low Carb", icon: <Leaf className="w-4 h-4" /> },
  { id: "vegan", label: "Vegan", icon: <Heart className="w-4 h-4" /> },
  { id: "vegetarian", label: "Vegetarian", icon: <Leaf className="w-4 h-4" /> },
  { id: "keto", label: "Keto", icon: <Zap className="w-4 h-4" /> },
  { id: "paleo", label: "Paleo", icon: <Shield className="w-4 h-4" /> },
];

const commonAllergies: Allergy[] = [
  { id: "gluten", label: "Gluten" },
  { id: "dairy", label: "Dairy" },
  { id: "nuts", label: "Tree Nuts" },
  { id: "peanuts", label: "Peanuts" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "shellfish", label: "Shellfish" },
  { id: "fish", label: "Fish" },
];

export default function Home() {
  const [ingredients, setIngredients] = useState<string>("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customPreferences, setCustomPreferences] = useState<string[]>([]);
  const [customAllergies, setCustomAllergies] = useState<string[]>([]);
  const [newPreference, setNewPreference] = useState<string>("");
  const [newAllergy, setNewAllergy] = useState<string>("");
  const [includeExtraIngredients, setIncludeExtraIngredients] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState<GeneratedMeal | null>(
    null
  );
  const [tokensBalance, setTokensBalance] = useState(5); // Free generations for new users
  const [freeGenerationsLeft, setFreeGenerationsLeft] = useState(5);

  const togglePreference = (preferenceId: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(preferenceId)
        ? prev.filter((id) => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const toggleAllergy = (allergyId: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergyId)
        ? prev.filter((id) => id !== allergyId)
        : [...prev, allergyId]
    );
  };

  const addCustomPreference = () => {
    if (
      newPreference.trim() &&
      !customPreferences.includes(newPreference.trim())
    ) {
      setCustomPreferences((prev) => [...prev, newPreference.trim()]);
      setNewPreference("");
    }
  };

  const removeCustomPreference = (preference: string) => {
    setCustomPreferences((prev) => prev.filter((p) => p !== preference));
  };

  const addCustomAllergy = () => {
    if (newAllergy.trim() && !customAllergies.includes(newAllergy.trim())) {
      setCustomAllergies((prev) => [...prev, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeCustomAllergy = (allergy: string) => {
    setCustomAllergies((prev) => prev.filter((a) => a !== allergy));
  };

  const generateMeal = async () => {
    if (!ingredients.trim()) {
      alert("Please enter some ingredients!");
      return;
    }

    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      const mockMeal: GeneratedMeal = {
        id: "1",
        name: "High-Protein Quinoa Chicken Bowl",
        ingredients: [
          "1 cup quinoa",
          "2 chicken breasts",
          "1 cup broccoli",
          "1/2 cup cherry tomatoes",
          "1/4 cup feta cheese",
          "2 tbsp olive oil",
          "1 lemon",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Cook quinoa according to package instructions",
          "Season chicken breasts with salt and pepper",
          "Grill chicken for 6-8 minutes per side until cooked through",
          "Steam broccoli for 3-4 minutes until tender",
          "Slice chicken and arrange over quinoa",
          "Top with broccoli, tomatoes, and feta",
          "Drizzle with olive oil and lemon juice",
        ],
        macros: {
          calories: 450,
          protein: 35,
          carbs: 25,
          fat: 18,
        },
        prepTime: "25 minutes",
        difficulty: "Easy",
        tags: ["High Protein", "Gluten Free", "Quick"],
      };

      setGeneratedMeal(mockMeal);
      setIsGenerating(false);

      // Deduct token/free generation
      if (freeGenerationsLeft > 0) {
        setFreeGenerationsLeft((prev) => prev - 1);
      } else {
        setTokensBalance((prev) => prev - 1);
      }
    }, 2000);
  };

  const purchaseTokens = () => {
    // This would integrate with Lemon Squeezy
    alert("Redirecting to Lemon Squeezy for token purchase...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-800 via-pink-800 to-indigo-800 bg-clip-text text-transparent mb-3 sm:mb-4">
            Transform Your Pantry Into a Gourmet Kitchen
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto px-2 font-medium">
            Get personalized, high-protein meal plans tailored to your
            ingredients and dietary needs. Save time, eat healthy, and enjoy
            delicious meals every day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Ingredients Input */}
            <Card className="bg-white/90 pt-0 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b border-purple-100/50 p-6">
                <CardTitle className="flex items-center space-x-2 text-purple-800">
                  <Utensils className="w-5 h-5 text-purple-600" />
                  <span>What&apos;s in your kitchen?</span>
                </CardTitle>
                <CardDescription className="text-purple-600/80">
                  List the ingredients you have available. Be as specific as
                  possible for better results.
                </CardDescription>
              </div>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="ingredients"
                      className="text-base font-medium text-gray-700 mb-2 block"
                    >
                      Ingredients
                    </Label>
                    <textarea
                      id="ingredients"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="e.g., chicken breast, quinoa, broccoli, olive oil, garlic, lemon..."
                      className="w-full h-24 sm:h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-extra"
                      checked={includeExtraIngredients}
                      onChange={(e) =>
                        setIncludeExtraIngredients(e.target.checked)
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor="include-extra" className="text-sm">
                      Include additional ingredients for creative suggestions
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dietary Preferences */}
            <Card className="bg-white/90 pt-0 backdrop-blur-sm border-0 shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b border-green-100/50 p-6">
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <Heart className="w-5 h-5 text-green-600" />
                  <span>Dietary Preferences</span>
                </CardTitle>
                <CardDescription className="text-green-600/80">
                  Select your dietary preferences to get personalized meal
                  suggestions.
                </CardDescription>
              </div>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {dietaryPreferences.map((preference) => (
                      <Button
                        key={preference.id}
                        variant={
                          selectedPreferences.includes(preference.id)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => togglePreference(preference.id)}
                        className="justify-start text-xs sm:text-sm"
                      >
                        {preference.icon}
                        <span className="ml-1 sm:ml-2">{preference.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Custom Preferences */}
                  {customPreferences.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Custom Preferences:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {customPreferences.map((preference) => (
                          <div
                            key={preference}
                            className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                          >
                            <span>{preference}</span>
                            <button
                              onClick={() => removeCustomPreference(preference)}
                              className="text-green-600 hover:text-green-800 ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Custom Preference */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPreference}
                      onChange={(e) => setNewPreference(e.target.value)}
                      placeholder="Add custom preference..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent h-9"
                      onKeyPress={(e) =>
                        e.key === "Enter" && addCustomPreference()
                      }
                    />
                    <Button
                      onClick={addCustomPreference}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white h-9 px-4"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card className="bg-white/90 pt-0 backdrop-blur-sm border-0 shadow-xl shadow-orange-500/10 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b border-orange-100/50 p-6">
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <span>Allergies & Intolerances</span>
                </CardTitle>
                <CardDescription className="text-orange-600/80">
                  Select any ingredients you need to avoid for safety.
                </CardDescription>
              </div>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {commonAllergies.map((allergy) => (
                      <Button
                        key={allergy.id}
                        variant={
                          selectedAllergies.includes(allergy.id)
                            ? "destructive"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleAllergy(allergy.id)}
                        className="text-xs sm:text-sm"
                      >
                        {allergy.label}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Allergies */}
                  {customAllergies.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Custom Allergies:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {customAllergies.map((allergy) => (
                          <div
                            key={allergy}
                            className="flex items-center space-x-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
                          >
                            <span>{allergy}</span>
                            <button
                              onClick={() => removeCustomAllergy(allergy)}
                              className="text-orange-600 hover:text-orange-800 ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Custom Allergy */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Add custom allergy..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent h-9"
                      onKeyPress={(e) =>
                        e.key === "Enter" && addCustomAllergy()
                      }
                    />
                    <Button
                      onClick={addCustomAllergy}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white h-9 px-4"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generateMeal}
              disabled={isGenerating || !ingredients.trim()}
              className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="hidden sm:inline">
                    Generating your meal...
                  </span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">
                    Generate Healthy Meal
                  </span>
                  <span className="sm:hidden">Generate Meal</span>
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Token Info */}
            <Card className="bg-white/90 pt-0 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg border-b border-blue-100/50 p-6">
                <CardTitle className="text-lg text-blue-800">
                  Your Balance
                </CardTitle>
              </div>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Free Generations
                    </span>
                    <Badge variant="secondary">{freeGenerationsLeft}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Paid Tokens</span>
                    <Badge variant="outline">{tokensBalance}</Badge>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">
                      100 tokens = $1
                    </p>
                    <Button
                      onClick={purchaseTokens}
                      size="sm"
                      className="w-full text-xs sm:text-sm"
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Buy More Tokens</span>
                      <span className="sm:hidden">Buy Tokens</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Meal */}
            {generatedMeal && (
              <Card className="bg-white/90 pt-0 backdrop-blur-sm border-0 shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg border-b border-emerald-100/50 p-6">
                  <CardTitle className="flex items-center space-x-2 text-emerald-800">
                    <ChefHat className="w-5 h-5 text-emerald-600" />
                    <span>Your Generated Meal</span>
                  </CardTitle>
                </div>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {generatedMeal.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {generatedMeal.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-xs sm:text-sm font-semibold text-blue-700">
                        {generatedMeal.macros.calories}
                      </div>
                      <div className="text-xs text-blue-600">Calories</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-xs sm:text-sm font-semibold text-green-700">
                        {generatedMeal.macros.protein}g
                      </div>
                      <div className="text-xs text-green-600">Protein</div>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <div className="text-xs sm:text-sm font-semibold text-yellow-700">
                        {generatedMeal.macros.carbs}g
                      </div>
                      <div className="text-xs text-yellow-600">Carbs</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <div className="text-xs sm:text-sm font-semibold text-red-700">
                        {generatedMeal.macros.fat}g
                      </div>
                      <div className="text-xs text-red-600">Fat</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{generatedMeal.prepTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{generatedMeal.difficulty}</span>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">
                      Ingredients
                    </h4>
                    <ul className="space-y-1 text-xs sm:text-sm">
                      {generatedMeal.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">
                      Instructions
                    </h4>
                    <ol className="space-y-2 text-xs sm:text-sm">
                      {generatedMeal.instructions.map((instruction, index) => (
                        <li key={index} className="flex space-x-2">
                          <span className="font-semibold text-green-600 min-w-[16px] sm:min-w-[20px] flex-shrink-0">
                            {index + 1}.
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
