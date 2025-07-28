/**
 * Recipe Modifier API Route
 *
 * Uses Vercel AI SDK v5 (beta) for AI-powered recipe modifications
 * Takes an existing recipe and modification request, generates a new modified recipe
 */

import { generateObject } from "ai";
import { recipeModificationSchema, Recipe } from "@/lib/types/recipe";
import { createClient } from "@/lib/supabase/server";
import {
  validateTokenForGenerationServer,
  consumeTokensServer,
} from "@/lib/services/token-server";

export async function POST(req: Request) {
  try {
    const {
      originalRecipe,
      modificationRequest,
      availableIngredients,
      dietaryPreferences,
      allergies,
    }: {
      originalRecipe: Recipe;
      modificationRequest: string;
      availableIngredients?: string[];
      dietaryPreferences?: string[];
      allergies?: string[];
    } = await req.json();

    if (!originalRecipe || !modificationRequest) {
      return Response.json(
        { error: "Invalid request: originalRecipe and modificationRequest are required" },
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

    // Validate token balance for recipe modification (same cost as generation)
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

    // Generate the AI response with structured output and retry logic
    let result;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        result = await generateObject({
          model: "openai/gpt-4o-mini",
          system: `You are a professional chef and nutritionist specializing in recipe modifications. Your expertise lies in adapting existing recipes based on ingredient substitutions, dietary changes, cooking method adjustments, and other modifications while maintaining the recipe's appeal and nutritional value.

CRITICAL JSON FORMATTING REQUIREMENTS:
- You MUST return VALID JSON with one of two formats:
  FORMAT 1 (SUCCESS): {"modifiedRecipe": {...}, "confidence": number, "changesExplanation": "detailed explanation"}
  FORMAT 2 (ERROR): {"error": true, "message": "explanation", "suggestions": ["suggestion1", "suggestion2"]}
- If you can modify the recipe, use FORMAT 1 with confidence > 0
- If you cannot modify the recipe, use FORMAT 2 with error: true
- The "modifiedRecipe" field must contain ALL recipe data with the same structure as the original
- The "changesExplanation" must clearly explain what was changed and why
- The "confidence" field must be a number between 0 and 1 at the top level
- ALL arrays must be properly closed with closing brackets
- ALL objects must be properly closed with closing braces
- NO nested JSON objects within string values
- Each instruction must be a complete object with stepNumber, instruction, and optional timeMinutes
- The nutrition object must contain calories, protein, carbs, and fat

IMPORTANT: Ensure your JSON is syntactically correct and can be parsed by a JSON parser.`,
          prompt: `You have been asked to modify the following recipe:

ORIGINAL RECIPE:
Title: ${originalRecipe.title}
Description: ${originalRecipe.description}
Prep Time: ${originalRecipe.prepTime} minutes
Cook Time: ${originalRecipe.cookTime} minutes
Servings: ${originalRecipe.servings}
Difficulty: ${originalRecipe.difficulty}
Cuisine: ${Array.isArray(originalRecipe.cuisine) ? originalRecipe.cuisine.join(", ") : originalRecipe.cuisine}
Dietary Tags: ${originalRecipe.dietaryTags.join(", ")}

INGREDIENTS:
${originalRecipe.ingredients.map(ing => `- ${ing.amount} ${ing.unit || ""} ${ing.name}${ing.notes ? ` (${ing.notes})` : ""}`).join("\n")}

INSTRUCTIONS:
${originalRecipe.instructions.map(inst => `${inst.stepNumber}. ${inst.instruction}${inst.timeMinutes ? ` (${inst.timeMinutes} min)` : ""}`).join("\n")}

NUTRITIONAL INFO:
- Calories: ${originalRecipe.nutrition.calories}
- Protein: ${originalRecipe.nutrition.protein}g
- Carbs: ${originalRecipe.nutrition.carbs}g
- Fat: ${originalRecipe.nutrition.fat}g

${originalRecipe.tips ? `TIPS:\n${originalRecipe.tips.map(tip => `- ${tip}`).join("\n")}` : ""}

MODIFICATION REQUEST:
${modificationRequest}

${availableIngredients ? `AVAILABLE INGREDIENTS:\n${availableIngredients.join(", ")}` : ""}

${dietaryPreferences ? `DIETARY PREFERENCES:\n${dietaryPreferences.join(", ")}` : ""}

${allergies ? `ALLERGIES TO AVOID:\n${allergies.join(", ")}` : ""}

MODIFICATION GUIDELINES:
- MAINTAIN RECIPE INTEGRITY: Keep the core appeal and character of the original recipe while making requested changes
- INGREDIENT SUBSTITUTIONS: When substituting ingredients, choose equivalents that maintain similar flavors, textures, and nutritional profiles when possible
- DIETARY ADAPTATIONS: If making dietary changes (vegetarian, vegan, keto, etc.), ensure ALL ingredients comply with the dietary restriction
- COOKING METHOD ADJUSTMENTS: If equipment isn't available, suggest alternative cooking methods that achieve similar results
- NUTRITIONAL CONSIDERATIONS: Maintain high-protein focus when possible, and ensure nutritional information is updated accurately
- ALLERGEN AWARENESS: Strictly avoid any ingredients that match specified allergies
- PRACTICAL MODIFICATIONS: Ensure modifications are realistic and achievable for home cooking
- CLEAR EXPLANATIONS: Provide detailed explanations of why specific changes were made

SPECIFIC MODIFICATION SCENARIOS:
- **Ingredient Unavailable**: Suggest suitable substitutes that maintain flavor and texture profiles
- **Dietary Restriction Changes**: Adapt all ingredients and cooking methods to comply with new restrictions
- **Equipment Limitations**: Modify cooking methods while achieving similar results
- **Serving Size Changes**: Adjust all ingredient quantities proportionally
- **Time Constraints**: Suggest prep shortcuts or cooking method changes to reduce time
- **Skill Level Adjustments**: Simplify or elaborate techniques based on requested difficulty changes

QUALITY STANDARDS:
- The modified recipe should be as appealing as the original
- All substitutions should be explained and justified
- Nutritional information must be recalculated accurately
- Instructions should be clear and complete
- The recipe should remain practical for home cooking

CRITICAL REQUIREMENTS:
- Update ALL affected recipe components (ingredients, instructions, nutrition, etc.)
- Ensure ingredient origins are properly classified (user/basic/additional)
- Maintain step numbering in instructions
- Provide realistic prep and cook times
- Update dietary tags if the modification changes dietary profile
- Include tips for successful execution of modifications

CONFIDENCE SCORING:
- Score based on how well the modification addresses the request while maintaining recipe quality
- Consider the practicality and appeal of the modified recipe
- Factor in how closely the modification matches the user's specific needs

ONLY REJECT IF:
- The modification request conflicts with fundamental recipe characteristics in an irreversible way
- The requested changes would make the recipe unsafe or inedible
- Essential ingredients cannot be substituted without completely changing the dish

Remember: Most modification requests can be accommodated with creativity and culinary knowledge. Always try to find a solution that respects both the original recipe and the user's needs.

OUTPUT FORMAT:
For successful modifications, return:
{
  "modifiedRecipe": {
    "title": "Updated Recipe Title",
    "description": "Updated description...",
    // ... all other recipe fields with modifications
  },
  "confidence": 0.85,
  "changesExplanation": "Detailed explanation of all changes made and reasoning behind them"
}

For cases where modification is not possible, return:
{
  "error": true,
  "message": "Clear explanation of why modification cannot be made",
  "suggestions": ["Alternative suggestion 1", "Alternative suggestion 2"]
}`,
          schema: recipeModificationSchema,
          maxRetries: 1, // We'll handle retries manually
        });

        // If we get here, the generation was successful
        break;
      } catch (error) {
        attempts++;
        console.error(`Recipe modification attempt ${attempts} failed:`, error);

        if (attempts >= maxAttempts) {
          throw error; // Re-throw the error to be handled by the outer catch block
        }

        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Check if the result is an error response
    if (
      result &&
      result.object &&
      result.object.error &&
      result.object.message
    ) {
      // Don't consume tokens for failed modifications
      return Response.json(
        {
          error: result.object.message,
          suggestions: result.object.suggestions || [],
        },
        { status: 400 }
      );
    }

    // Use tokens for recipe modification (same cost as generation)
    const tokenUsed = await consumeTokensServer(user.id, "recipe_generation");
    if (!tokenUsed) {
      return Response.json(
        { error: "Failed to process token usage" },
        { status: 500 }
      );
    }

    return Response.json(result?.object);
  } catch (error) {
    console.error("Recipe modification error:", error);

    // Log the actual generated data for debugging
    if (error && typeof error === "object" && "value" in error) {
      console.error(
        "Generated value that failed validation:",
        JSON.stringify(error.value, null, 2)
      );
    }

    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (
        error.message.includes("AI_TypeValidationError") ||
        error.message.includes("ZodError")
      ) {
        return Response.json(
          { error: "AI generated invalid recipe modification format. Please try again." },
          { status: 500 }
        );
      }

      if (error.message.includes("AI_JSONParseError")) {
        return Response.json(
          { error: "AI generated malformed JSON. Please try again." },
          { status: 500 }
        );
      }
    }

    return Response.json(
      { error: "Failed to modify recipe. Please try again." },
      { status: 500 }
    );
  }
} 