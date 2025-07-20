export interface RecipeIngredient {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
  origin: "user" | "basic" | "additional"; // user = from user's ingredients, basic = basic cupboard items, additional = extra ingredients from shops
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
  cuisine: string | string[];
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
  cuisine?: string | string[];
  includeAdditionalIngredients?: boolean; // whether to suggest ingredients not in pantry
}

export interface RecipeGenerationResponse {
  recipe: Recipe;
  confidence: number; // 0-1 scale
}

// Zod schemas for AI SDK structured data generation
import { z } from "zod";

export const recipeIngredientSchema = z.object({
  name: z
    .string()
    .min(1, "Ingredient name is required")
    .describe("The name of the ingredient"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .describe(
      "The quantity of the ingredient (e.g., '2', '1/2', '1.5', 'to taste')"
    ),
  unit: z
    .string()
    .optional()
    .describe(
      "The unit of measurement (e.g., 'cups', 'tablespoons', 'grams', 'pieces'). Can be omitted for 'to taste' ingredients like salt and pepper."
    ),
  notes: z
    .string()
    .optional()
    .describe(
      "Optional notes about the ingredient (e.g., 'fresh', 'diced', 'room temperature')"
    ),
  origin: z
    .enum(["user", "basic", "additional"])
    .describe(
      "Indicates where the ingredient comes from: 'user' = from user's available ingredients, 'basic' = basic cupboard items like salt/pepper/oil, 'additional' = extra ingredients from shops"
    ),
});

export const recipeStepSchema = z.object({
  stepNumber: z
    .number()
    .int()
    .positive("Step number must be positive")
    .describe("The sequential number of this step"),
  instruction: z
    .string()
    .min(10, "Instruction must be at least 10 characters")
    .describe("Detailed cooking instruction for this step"),
  timeMinutes: z
    .number()
    .int()
    .min(0, "Time must be non-negative")
    .optional()
    .describe(
      "Estimated time in minutes for this step (0 is allowed for steps that don't require time)"
    ),
});

export const nutritionalInfoSchema = z.object({
  calories: z
    .number()
    .int()
    .positive("Calories must be positive")
    .describe("Total calories per serving"),
  protein: z
    .number()
    .min(0, "Protein cannot be negative")
    .describe("Protein content in grams per serving"),
  carbs: z
    .number()
    .min(0, "Carbs cannot be negative")
    .describe("Carbohydrate content in grams per serving"),
  fat: z
    .number()
    .min(0, "Fat cannot be negative")
    .describe("Fat content in grams per serving"),
  fiber: z
    .number()
    .min(0)
    .optional()
    .describe("Fiber content in grams per serving"),
  sugar: z
    .number()
    .min(0)
    .optional()
    .describe("Sugar content in grams per serving"),
  sodium: z
    .number()
    .min(0)
    .optional()
    .describe("Sodium content in milligrams per serving"),
});

export const recipeSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title too long")
    .describe("The name of the recipe"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description too long")
    .describe("A brief description of the recipe and its key features"),
  prepTime: z
    .number()
    .int()
    .min(0, "Prep time cannot be negative")
    .max(480, "Prep time cannot exceed 8 hours")
    .describe("Preparation time in minutes"),
  cookTime: z
    .number()
    .int()
    .min(0, "Cook time cannot be negative")
    .max(480, "Cook time cannot exceed 8 hours")
    .describe("Cooking time in minutes"),
  servings: z
    .number()
    .int()
    .min(1, "Servings must be at least 1")
    .max(20, "Servings cannot exceed 20")
    .describe("Number of servings this recipe yields"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"], {
      errorMap: () => ({ message: "Difficulty must be Easy, Medium, or Hard" }),
    })
    .describe("The difficulty level of the recipe"),
  cuisine: z
    .union([
      z
        .string()
        .min(2, "Cuisine must be at least 2 characters")
        .max(50, "Cuisine name too long"),
      z.array(
        z
          .string()
          .min(2, "Cuisine must be at least 2 characters")
          .max(50, "Cuisine name too long")
      ),
    ])
    .describe(
      "The type of cuisine(s) (e.g., 'Italian', 'Mexican', 'Asian' or ['Italian', 'Mexican'])"
    ),
  dietaryTags: z
    .array(z.string().min(1))
    .min(1, "At least one dietary tag is required")
    .max(10, "Too many dietary tags")
    .describe(
      "Dietary categories (e.g., ['High-Protein', 'Low-Carb', 'Gluten-Free'])"
    ),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, "At least one ingredient is required")
    .max(50, "Too many ingredients")
    .describe("List of ingredients needed for the recipe"),
  instructions: z
    .array(recipeStepSchema)
    .min(1, "At least one instruction is required")
    .max(20, "Too many instructions")
    .describe("Step-by-step cooking instructions"),
  nutrition: nutritionalInfoSchema.describe(
    "Nutritional information per serving"
  ),
  tips: z
    .array(z.string().min(5))
    .optional()
    .describe("Helpful cooking tips and suggestions"),
  estimatedCost: z
    .enum(["Budget", "Moderate", "Premium"])
    .optional()
    .describe("Estimated cost category for ingredients"),
});

export const recipeGenerationResponseSchema = z.object({
  recipe: recipeSchema.describe("The complete recipe with all details"),
  confidence: z
    .number()
    .min(0, "Confidence must be at least 0")
    .max(1, "Confidence cannot exceed 1")
    .describe(
      "Confidence score (0-1) for how well this recipe matches the user's requirements"
    ),
});

// Type exports for use with AI SDK
export type RecipeGenerationResponseType = z.infer<
  typeof recipeGenerationResponseSchema
>;
