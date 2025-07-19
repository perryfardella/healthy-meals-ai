/**
 * Recipe Generator API Route
 *
 * Uses Vercel AI SDK v5 (beta) for AI-powered recipe generation
 * TODO: Integrates with Vercel AI Gateway for centralized model management
 */

import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, generateObject, UIMessage } from "ai";
import { recipeGenerationResponseSchema } from "@/lib/types/recipe";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = await generateObject({
    model: openai("gpt-3.5-turbo"),
    messages: convertToModelMessages(messages),
    schema: recipeGenerationResponseSchema,
    schemaName: "RecipeGenerationResponse",
    schemaDescription:
      "A complete recipe with ingredients, instructions, nutrition, and metadata for healthy meal generation",
    prompt: `You are a professional chef and nutritionist specializing in healthy, high-protein meal planning. Generate a delicious, nutritious recipe based on the user's available ingredients and preferences.

CRITICAL REQUIREMENTS:
- PRIORITIZE HIGH-PROTEIN OPTIONS: Focus on meals with 25-40g of protein per serving
- USE AVAILABLE INGREDIENTS: Maximize use of ingredients the user has on hand
- RESPECT DIETARY RESTRICTIONS: Strictly avoid any ingredients that match the user's allergies
- CONSIDER DIETARY PREFERENCES: Tailor the recipe to match dietary preferences (vegan, keto, low-carb, etc.)
- REALISTIC TIMING: Ensure prep and cook times are accurate and reasonable
- NUTRITIONAL ACCURACY: Provide realistic, accurate nutritional information
- CLEAR INSTRUCTIONS: Write step-by-step instructions that are easy to follow

FORM DATA CONTEXT:
The user will provide:
- Available ingredients (text list)
- Dietary preferences (high-protein, low-carb, vegan, vegetarian, keto, paleo)
- Allergies and restrictions (gluten, dairy, nuts, etc.)
- Meal type preferences (breakfast, lunch, dinner, snack, dessert)
- Maximum cooking time limit
- Serving size requirements
- Difficulty level preference
- Whether they can purchase additional ingredients

RECIPE GUIDELINES:
- Create balanced, flavorful meals that are both healthy and satisfying
- Include helpful cooking tips and variations where appropriate
- Ensure all nutritional values are realistic and accurate
- Use common cooking techniques and accessible ingredients
- Provide clear portion sizes and serving information
- Include estimated cost category (Budget/Moderate/Premium) based on ingredients used

OUTPUT REQUIREMENTS:
- Complete recipe with all required fields
- List which user ingredients were used
- Suggest additional ingredients if they would significantly improve the recipe
- Provide confidence score based on how well the recipe matches user requirements
- Ensure all dietary restrictions are strictly followed
- Focus on high-protein, nutritious options that support healthy eating goals

Remember: This is for users who want to transform their pantry into healthy, delicious meals while respecting their dietary needs and preferences.`,
  });

  return Response.json(result.object);
}
