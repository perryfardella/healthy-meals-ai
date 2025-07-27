/**
 * Recipe Generator API Route
 *
 * Uses Vercel AI SDK v5 (beta) for AI-powered recipe generation
 */

import { generateObject } from "ai";
import { recipeGenerationResponseSchema } from "@/lib/types/recipe";
import { createClient } from "@/lib/supabase/server";
import {
  validateTokenForGenerationServer,
  consumeTokensServer,
} from "@/lib/services/token-server";

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

    // Check authentication and token balance
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate token balance for recipe generation
    const tokenValidation = await validateTokenForGenerationServer(
      user.id,
      "recipe_generation"
    );
    if (!tokenValidation.can_generate) {
      return Response.json(
        {
          error: "Insufficient tokens",
          details: {
            remaining_tokens: tokenValidation.remaining_tokens,
            cost_per_generation: tokenValidation.cost_per_generation,
          },
        },
        { status: 402 }
      );
    }

    // Extract the user's content from the messages
    const userContent =
      messages.find((msg) => msg.role === "user")?.content || "";

    // Generate the AI response with structured output
    const result = await generateObject({
      model: "openai/gpt-4o-mini",
      system: `You are a professional chef and nutritionist specializing in healthy, high-protein meal planning. You are also a creative culinary artist who loves to experiment with different flavors, cuisines, and cooking techniques. Your goal is to generate recipes that are not only healthy and high-protein but also exciting, flavorful, and varied. 

CRITICAL SCHEMA REQUIREMENTS:
- You MUST return a JSON object with exactly TWO top-level fields: "recipe" and "confidence"
- The "recipe" field must contain ALL recipe data including: title, description, prepTime, cookTime, servings, difficulty, cuisine, dietaryTags, ingredients, instructions, nutrition, tips, and estimatedCost
- The "instructions" array must be nested INSIDE the "recipe" object, not at the top level
- The "nutrition" object must be nested INSIDE the "recipe" object, not at the top level  
- The "tips" array must be nested INSIDE the "recipe" object, not at the top level
- The "estimatedCost" must be nested INSIDE the "recipe" object, not at the top level
- The "confidence" field must be a number between 0 and 1 at the top level

Each instruction must be a complete object with stepNumber, instruction, and optional timeMinutes (can be 0 for steps that don't require time). The nutrition object must contain calories, protein, carbs, and fat.`,
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

        ADDITIONAL REQUIREMENTS FOR CREATIVITY:
        - Avoid generating repetitive or overly common recipes like basic stir fries unless they offer a unique twist
        - Each recipe should include at least one unique feature, such as a special ingredient, an innovative cooking technique, or a creative presentation method
        - Strive for variety in cuisines, cooking methods, and ingredient combinations. Consider global cuisines (e.g., Italian, Japanese, Mexican, Mediterranean) and less common techniques (e.g., sous vide, smoking, or fermenting)
        - Think about how to make the dish visually appealing as well as tasty
        - Ensure the recipe is something users will want to make—delicious, exciting, and practical for home cooking

        RECIPE GUIDELINES:
        - Create balanced, flavorful meals that are both healthy and satisfying
        - Include helpful cooking tips and variations where appropriate to enhance versatility
        - Ensure all nutritional values are realistic and accurate
        - Use common cooking techniques and accessible ingredients
        - Provide clear portion sizes and serving information
        - Include estimated cost category (Budget/Moderate/Premium) based on ingredients used
        - Include any suggested additional ingredients in the tips section if they would significantly improve the recipe
        - For cuisine preferences: If multiple cuisines are specified, you can either choose one that best fits the ingredients or create a fusion dish that combines elements from multiple cuisines

        OUTPUT REQUIREMENTS:
        - Complete recipe with all required fields
        - Include any additional ingredient suggestions in the tips section
        - Provide confidence score (REQUIRED: number between 0 and 1) based on how well the recipe matches user requirements, including how creative and appealing the recipe is
        - Ensure all dietary restrictions are strictly followed
        - Focus on high-protein, nutritious options that support healthy eating goals

        INGREDIENT ORIGIN CLASSIFICATION:
        - Mark ingredients as "user" if they were specifically mentioned in the user's available ingredients
        - Mark ingredients as "basic" if they are common cupboard staples (salt, pepper, oil, etc.) and the user checked "include basic ingredients"
        - Mark ingredients as "additional" if they need to be purchased and the user checked "include extra ingredients"
        - Be precise about ingredient origins to help users understand what they need to buy

        CONFIDENCE SCORE:
        - The confidence score should reflect how well the recipe matches the user's requirements, including dietary restrictions, available ingredients, and preparation time
        - Additionally, consider how creative, flavorful, and practical the recipe is. A recipe that is both highly suitable and highly creative should receive a higher score

        Remember: This is for users who want to transform their pantry into healthy, delicious meals while respecting their dietary needs and preferences. Each recipe should be unique and inspiring, encouraging users to try something new.

        FINAL CHECK: Ensure your response includes both the "recipe" object and a "confidence" number between 0 and 1.
        
        CORRECT STRUCTURE EXAMPLE:
        {
          "recipe": {
            "title": "Recipe Title",
            "description": "Recipe description",
            "prepTime": 15,
            "cookTime": 30,
            "servings": 4,
            "difficulty": "Medium",
            "cuisine": "Mediterranean",
            "dietaryTags": ["High-Protein"],
            "ingredients": [...],
            "instructions": [...],  // ← NESTED inside recipe
            "nutrition": {...},     // ← NESTED inside recipe
            "tips": [...],          // ← NESTED inside recipe
            "estimatedCost": "Moderate"  // ← NESTED inside recipe
          },
          "confidence": 0.85  // ← TOP LEVEL
        }`,
      schema: recipeGenerationResponseSchema,
      maxRetries: 3,
    });

    // Use tokens for recipe generation
    const tokenUsed = await consumeTokensServer(user.id, "recipe_generation");
    if (!tokenUsed) {
      return Response.json(
        { error: "Failed to process token usage" },
        { status: 500 }
      );
    }

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
