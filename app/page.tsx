"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Utensils,
  Heart,
  Zap,
  Clock,
  Users,
  Sparkles,
  Leaf,
  Shield,
  ChefHat,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";

// Form validation schema
const formSchema = z.object({
  ingredients: z
    .string()
    .min(
      1,
      "Ingredients are required - please tell us what you have available!"
    )
    .min(10, "Please enter at least 10 characters describing your ingredients")
    .max(500, "Ingredients description is too long"),
  includeExtraIngredients: z.boolean(),
  includeBasicIngredients: z.boolean(),
  dietaryPreferences: z.array(z.string()),
  customPreferences: z.array(z.string()),
  allergies: z.array(z.string()),
  customAllergies: z.array(z.string()),
  maxCookingTime: z.string(),
  mealType: z.array(z.string()),
  servingSize: z.string(),
  difficultyLevel: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface DietaryPreference {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Allergy {
  id: string;
  label: string;
}

interface MealType {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface CookingTime {
  id: string;
  label: string;
  value: string;
}

interface ServingSize {
  id: string;
  label: string;
  value: string;
}

interface DifficultyLevel {
  id: string;
  label: string;
  value: string;
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

const mealTypes: MealType[] = [
  { id: "breakfast", label: "Breakfast", icon: <Sun className="w-4 h-4" /> },
  { id: "lunch", label: "Lunch", icon: <Utensils className="w-4 h-4" /> },
  { id: "dinner", label: "Dinner", icon: <Moon className="w-4 h-4" /> },
  { id: "snack", label: "Snack", icon: <Coffee className="w-4 h-4" /> },
  { id: "dessert", label: "Dessert", icon: <Heart className="w-4 h-4" /> },
];

const cookingTimes: CookingTime[] = [
  { id: "15min", label: "15 minutes", value: "15" },
  { id: "30min", label: "30 minutes", value: "30" },
  { id: "45min", label: "45 minutes", value: "45" },
  { id: "60min", label: "1 hour", value: "60" },
  { id: "90min", label: "1.5 hours", value: "90" },
  { id: "120min", label: "2+ hours", value: "120" },
];

const servingSizes: ServingSize[] = [
  { id: "1", label: "1 serving", value: "1" },
  { id: "2", label: "2 servings", value: "2" },
  { id: "4", label: "4 servings", value: "4" },
  { id: "6", label: "6 servings", value: "6" },
  { id: "8", label: "8+ servings", value: "8" },
];

const difficultyLevels: DifficultyLevel[] = [
  { id: "easy", label: "Easy", value: "easy" },
  { id: "medium", label: "Medium", value: "medium" },
  { id: "hard", label: "Hard", value: "hard" },
];

export default function Home() {
  const [newPreference, setNewPreference] = useState<string>("");
  const [newAllergy, setNewAllergy] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState<GeneratedMeal | null>(
    null
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      includeExtraIngredients: false,
      includeBasicIngredients: true,
      dietaryPreferences: [],
      customPreferences: [],
      allergies: [],
      customAllergies: [],
      maxCookingTime: "30",
      mealType: [],
      servingSize: "4",
      difficultyLevel: "medium",
    },
  });

  const { watch, setValue, getValues } = form;
  const watchedValues = watch();

  const togglePreference = (preferenceId: string) => {
    const currentPreferences = getValues("dietaryPreferences");
    const newPreferences = currentPreferences.includes(preferenceId)
      ? currentPreferences.filter((id) => id !== preferenceId)
      : [...currentPreferences, preferenceId];
    setValue("dietaryPreferences", newPreferences);
  };

  const toggleAllergy = (allergyId: string) => {
    const currentAllergies = getValues("allergies");
    const newAllergies = currentAllergies.includes(allergyId)
      ? currentAllergies.filter((id) => id !== allergyId)
      : [...currentAllergies, allergyId];
    setValue("allergies", newAllergies);
  };

  const addCustomPreference = () => {
    if (
      newPreference.trim() &&
      !getValues("customPreferences").includes(newPreference.trim())
    ) {
      const currentCustomPreferences = getValues("customPreferences");
      setValue("customPreferences", [
        ...currentCustomPreferences,
        newPreference.trim(),
      ]);
      setNewPreference("");
    }
  };

  const removeCustomPreference = (preference: string) => {
    const currentCustomPreferences = getValues("customPreferences");
    setValue(
      "customPreferences",
      currentCustomPreferences.filter((p) => p !== preference)
    );
  };

  const addCustomAllergy = () => {
    if (
      newAllergy.trim() &&
      !getValues("customAllergies").includes(newAllergy.trim())
    ) {
      const currentCustomAllergies = getValues("customAllergies");
      setValue("customAllergies", [
        ...currentCustomAllergies,
        newAllergy.trim(),
      ]);
      setNewAllergy("");
    }
  };

  const removeCustomAllergy = (allergy: string) => {
    const currentCustomAllergies = getValues("customAllergies");
    setValue(
      "customAllergies",
      currentCustomAllergies.filter((a) => a !== allergy)
    );
  };

  const toggleMealType = (mealTypeId: string) => {
    const currentMealTypes = getValues("mealType");
    const newMealTypes = currentMealTypes.includes(mealTypeId)
      ? currentMealTypes.filter((id) => id !== mealTypeId)
      : [...currentMealTypes, mealTypeId];
    setValue("mealType", newMealTypes);
  };

  const setCookingTime = (timeValue: string) => {
    setValue("maxCookingTime", timeValue);
  };

  const setServingSize = (sizeValue: string) => {
    setValue("servingSize", sizeValue);
  };

  const setDifficultyLevel = (levelValue: string) => {
    setValue("difficultyLevel", levelValue);
  };

  const generateMeal = async () => {
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
    }, 2000);
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(generateMeal)}
            className="space-y-4 sm:space-y-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4 sm:space-y-6">
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
                      <FormField
                        control={form.control}
                        name="ingredients"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700 mb-2 block">
                              Ingredients{" "}
                              <span className="text-red-500 font-bold">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="e.g., chicken breast, quinoa, broccoli, olive oil, garlic, lemon... (required)"
                                className="w-full h-24 sm:h-32 resize-none text-sm sm:text-base bg-white/80 backdrop-blur-sm border-2 focus:border-purple-500"
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="includeBasicIngredients"
                        render={({ field }) => (
                          <FormItem
                            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => field.onChange(!field.value)}
                          >
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                              />
                            </FormControl>
                            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                              Include basic ingredients found in most cupboards
                              (salt, pepper, oil, etc.)
                            </Label>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="includeExtraIngredients"
                        render={({ field }) => (
                          <FormItem
                            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => field.onChange(!field.value)}
                          >
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4 rounded border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:border-green-500 transition-all duration-200 cursor-pointer"
                              />
                            </FormControl>
                            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                              I&apos;m able to go to the shops - the AI will add
                              additional ingredients that are commonly found at
                              most convenience and grocery stores
                            </Label>
                          </FormItem>
                        )}
                      />
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
                            type="button"
                            variant={
                              watchedValues.dietaryPreferences?.includes(
                                preference.id
                              )
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => togglePreference(preference.id)}
                            className="justify-start text-xs sm:text-sm"
                          >
                            {preference.icon}
                            <span className="ml-1 sm:ml-2">
                              {preference.label}
                            </span>
                          </Button>
                        ))}
                      </div>

                      {/* Custom Preferences */}
                      {watchedValues.customPreferences &&
                        watchedValues.customPreferences.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">
                              Custom Preferences:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {watchedValues.customPreferences.map(
                                (preference) => (
                                  <div
                                    key={preference}
                                    className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                                  >
                                    <span>{preference}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeCustomPreference(preference)
                                      }
                                      className="text-green-600 hover:text-green-800 ml-1"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )
                              )}
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomPreference();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addCustomPreference}
                          className="px-3 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-md transition-colors duration-200"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Allergies */}
                <Card className="bg-white/90 pt-0 backdrop-blur-sm border-0 shadow-xl shadow-red-500/10 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg border-b border-red-100/50 p-6">
                    <CardTitle className="flex items-center space-x-2 text-red-800">
                      <Shield className="w-5 h-5 text-red-600" />
                      <span>Allergies & Restrictions</span>
                    </CardTitle>
                    <CardDescription className="text-red-600/80">
                      Select any allergies or dietary restrictions to avoid.
                    </CardDescription>
                  </div>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {commonAllergies.map((allergy) => (
                          <Button
                            key={allergy.id}
                            type="button"
                            variant={
                              watchedValues.allergies?.includes(allergy.id)
                                ? "destructive"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => toggleAllergy(allergy.id)}
                            className="justify-start text-xs sm:text-sm"
                          >
                            {allergy.label}
                          </Button>
                        ))}
                      </div>

                      {/* Custom Allergies */}
                      {watchedValues.customAllergies &&
                        watchedValues.customAllergies.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">
                              Custom Allergies:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {watchedValues.customAllergies.map((allergy) => (
                                <div
                                  key={allergy}
                                  className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs"
                                >
                                  <span>{allergy}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeCustomAllergy(allergy)}
                                    className="text-red-600 hover:text-red-800 ml-1"
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomAllergy();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addCustomAllergy}
                          className="px-3 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-medium rounded-md transition-colors duration-200"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meal Preferences */}
                <Card className="bg-white/90 pt-0 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg border-b border-blue-100/50 p-6">
                    <CardTitle className="flex items-center space-x-2 text-blue-800">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Meal Preferences</span>
                    </CardTitle>
                    <CardDescription className="text-blue-600/80">
                      Customize your meal preferences for better results.
                    </CardDescription>
                  </div>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Meal Types */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Meal Type
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {mealTypes.map((mealType) => (
                            <Button
                              key={mealType.id}
                              type="button"
                              variant={
                                watchedValues.mealType?.includes(mealType.id)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleMealType(mealType.id)}
                              className="justify-start text-xs"
                            >
                              {mealType.icon}
                              <span className="ml-1">{mealType.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Cooking Time */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Maximum Cooking Time
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {cookingTimes.map((time) => (
                            <Button
                              key={time.id}
                              type="button"
                              variant={
                                watchedValues.maxCookingTime === time.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setCookingTime(time.value)}
                              className="text-xs"
                            >
                              {time.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Serving Size */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Serving Size
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {servingSizes.map((size) => (
                            <Button
                              key={size.id}
                              type="button"
                              variant={
                                watchedValues.servingSize === size.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setServingSize(size.value)}
                              className="text-xs"
                            >
                              {size.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty Level */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Difficulty Level
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {difficultyLevels.map((level) => (
                            <Button
                              key={level.id}
                              type="button"
                              variant={
                                watchedValues.difficultyLevel === level.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setDifficultyLevel(level.value)}
                              className="text-xs"
                            >
                              {level.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <div className="relative group">
                  <Button
                    type="submit"
                    disabled={
                      isGenerating || !watchedValues.ingredients?.trim()
                    }
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

                  {/* Tooltip for disabled state */}
                  {!isGenerating && !watchedValues.ingredients?.trim() && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Please add ingredients to generate a meal
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                {generatedMeal && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Generated Meal */}
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
                            <div className="text-xs text-blue-600">
                              Calories
                            </div>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <div className="text-xs sm:text-sm font-semibold text-green-700">
                              {generatedMeal.macros.protein}g
                            </div>
                            <div className="text-xs text-green-600">
                              Protein
                            </div>
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
                            {generatedMeal.ingredients.map(
                              (ingredient, index) => (
                                <li
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-gray-700">
                                    {ingredient}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <Separator />

                        {/* Instructions */}
                        <div>
                          <h4 className="font-semibold mb-2 text-sm sm:text-base">
                            Instructions
                          </h4>
                          <ol className="space-y-2 text-xs sm:text-sm">
                            {generatedMeal.instructions.map(
                              (instruction, index) => (
                                <li
                                  key={index}
                                  className="flex items-start space-x-2"
                                >
                                  <div className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                    {index + 1}
                                  </div>
                                  <span className="text-gray-700">
                                    {instruction}
                                  </span>
                                </li>
                              )
                            )}
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
