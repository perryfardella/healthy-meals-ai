export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timeMinutes?: number;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface Recipe {
  title: string;
  description: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  cuisine: string;
  dietaryTags: string[]; // e.g., ['High-Protein', 'Low-Carb', 'Gluten-Free']
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutrition: NutritionalInfo;
  tips?: string[];
  estimatedCost?: "Budget" | "Moderate" | "Premium";
}

export interface RecipeGenerationRequest {
  availableIngredients: string[];
  dietaryPreferences?: string[];
  allergies?: string[];
  maxPrepTime?: number; // in minutes
  servings?: number;
  cuisine?: string;
  includeAdditionalIngredients?: boolean; // whether to suggest ingredients not in pantry
}

export interface RecipeGenerationResponse {
  recipe: Recipe;
  usedIngredients: string[];
  suggestedAdditionalIngredients?: string[];
  confidence: number; // 0-1 scale
}
