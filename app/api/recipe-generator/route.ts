/**
 * Recipe Generator API Route
 *
 * Uses Vercel AI SDK v5 (beta) for AI-powered recipe generation
 */

import { generateObject } from "ai";
import { recipeGenerationResponseSchema } from "@/lib/types/recipe";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Array<{ role: string; content: string }> } =
      await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    // Extract the user's content from the messages
    const userContent =
      messages.find((msg) => msg.role === "user")?.content || "";

    // Generate the AI response with structured output
    const result = await generateObject({
      model: "openai/gpt-4o-mini",
      // TODO: Get a fallback working
      system: `You are a professional chef and nutritionist specializing in healthy, high-protein meal planning. You must generate recipes that follow the exact schema structure provided. Each instruction must be a complete object with stepNumber, instruction, and optional timeMinutes. The nutrition object must contain calories, protein, carbs, and fat. The confidence must be a number between 0 and 1. UsedIngredients must be an array of strings.`,
      prompt: `Generate a recipe with the following requirements:

${userContent}

CRITICAL REQUIREMENTS:
- PRIORITIZE HIGH-PROTEIN OPTIONS: Focus on meals with 25-40g of protein per serving
- USE AVAILABLE INGREDIENTS: Maximize use of ingredients the user has on hand
- RESPECT DIETARY RESTRICTIONS: Strictly avoid any ingredients that match the user's allergies
- CONSIDER DIETARY PREFERENCES: Tailor the recipe to match dietary preferences (vegan, keto, low-carb, etc.)
- REALISTIC TIMING: Ensure prep and cook times are accurate and reasonable
- NUTRITIONAL ACCURACY: Provide realistic, accurate nutritional information
- CLEAR INSTRUCTIONS: Write step-by-step instructions that are easy to follow

RECIPE GUIDELINES:
- Create balanced, flavorful meals that are both healthy and satisfying
- Include helpful cooking tips and variations where appropriate
- Ensure all nutritional values are realistic and accurate
- Use common cooking techniques and accessible ingredients
- Provide clear portion sizes and serving information
- Include estimated cost category (Budget/Moderate/Premium) based on ingredients used
- Include any suggested additional ingredients in the tips section if they would significantly improve the recipe

OUTPUT REQUIREMENTS:
- Complete recipe with all required fields
- List which user ingredients were used
- Include any additional ingredient suggestions in the tips section
- Provide confidence score based on how well the recipe matches user requirements
- Ensure all dietary restrictions are strictly followed
- Focus on high-protein, nutritious options that support healthy eating goals

Remember: This is for users who want to transform their pantry into healthy, delicious meals while respecting their dietary needs and preferences.`,
      schema: recipeGenerationResponseSchema,
      maxRetries: 3,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Recipe generation error:", error);

    // Log the actual generated data for debugging
    if (error && typeof error === "object" && "value" in error) {
      console.error(
        "Generated value that failed validation:",
        JSON.stringify(error.value, null, 2)
      );
    }

    // Provide more specific error messages
    if (error instanceof Error) {
      if (
        error.message.includes("AI_TypeValidationError") ||
        error.message.includes("ZodError")
      ) {
        return Response.json(
          { error: "AI generated invalid recipe format. Please try again." },
          { status: 500 }
        );
      }
    }

    return Response.json(
      { error: "Failed to generate recipe. Please try again." },
      { status: 500 }
    );
  }
}
