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
      system: `You are a professional chef and nutritionist specializing in healthy, high-protein meal planning. You must generate recipes that follow the exact schema structure provided. Each instruction must be a complete object with stepNumber, instruction, and optional timeMinutes (can be 0 for steps that don't require time). The nutrition object must contain calories, protein, carbs, and fat. The confidence must be a number between 0 and 1.

REQUIRED FIELDS:
- recipe: Complete recipe object with all details
- confidence: A number between 0 and 1 indicating how well the recipe matches user requirements (REQUIRED - do not omit this field)

CRITICAL INGREDIENT ORIGIN CLASSIFICATION:
For each ingredient in the recipe, you MUST specify the "origin" field as one of:
- "user": Ingredients that the user specifically mentioned having available
- "basic": Common cupboard staples like salt, pepper, oil, vinegar, flour, sugar, spices, etc. (only include if user checked "include basic ingredients")
- "additional": Ingredients that need to be purchased from shops (only include if user checked "include extra ingredients")

This helps users understand exactly what they need to buy versus what they already have.

EXAMPLE INGREDIENT STRUCTURE:
{
  "name": "chicken breast",
  "amount": "2",
  "unit": "pieces",
  "notes": "boneless, skinless",
  "origin": "user"
}

EXAMPLE INSTRUCTION STRUCTURE:
{
  "stepNumber": 1,
  "instruction": "Heat oil in a large skillet over medium heat.",
  "timeMinutes": 2
}

Note: timeMinutes can be 0 for steps like "Remove from heat and serve" that don't require time.

COMPLETE RESPONSE STRUCTURE:
{
  "recipe": {
    // ... all recipe details
  },
  "confidence": 0.95  // REQUIRED: number between 0 and 1
}`,
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
- For cuisine preferences: If multiple cuisines are specified, you can either choose one that best fits the ingredients, or create a fusion dish that combines elements from multiple cuisines

OUTPUT REQUIREMENTS:
- Complete recipe with all required fields
- Include any additional ingredient suggestions in the tips section
- Provide confidence score (REQUIRED: number between 0 and 1) based on how well the recipe matches user requirements
- Ensure all dietary restrictions are strictly followed
- Focus on high-protein, nutritious options that support healthy eating goals

INGREDIENT ORIGIN CLASSIFICATION:
- Mark ingredients as "user" if they were specifically mentioned in the user's available ingredients
- Mark ingredients as "basic" if they are common cupboard staples (salt, pepper, oil, etc.) and the user checked "include basic ingredients"
- Mark ingredients as "additional" if they need to be purchased and the user checked "include extra ingredients"
- Be precise about ingredient origins to help users understand what they need to buy

Remember: This is for users who want to transform their pantry into healthy, delicious meals while respecting their dietary needs and preferences.

FINAL CHECK: Ensure your response includes both the "recipe" object and a "confidence" number between 0 and 1.`,
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
