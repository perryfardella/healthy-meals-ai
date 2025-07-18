import { streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import {
  RecipeGenerationRequest,
  RecipeGenerationResponse,
} from "../types/recipe";

const SYSTEM_PROMPT = `You are a professional chef and nutritionist specializing in creating healthy, high-protein meals. Your task is to generate detailed recipes based on available ingredients and user preferences.

IMPORTANT: You must respond with a valid JSON object that matches the exact structure specified. Do not include any markdown formatting, code blocks, or additional text outside the JSON.

The response must be a single JSON object with this exact structure:
{
  "recipe": {
    "title": "Recipe Title",
    "description": "Brief description of the recipe",
    "prepTime": 15,
    "cookTime": 25,
    "servings": 4,
    "difficulty": "Easy",
    "cuisine": "Mediterranean",
    "dietaryTags": ["High-Protein", "Low-Carb"],
    "ingredients": [
      {
        "name": "Ingredient Name",
        "amount": "2",
        "unit": "cups",
        "notes": "optional notes"
      }
    ],
    "instructions": [
      {
        "stepNumber": 1,
        "instruction": "Step description",
        "timeMinutes": 5
      }
    ],
    "nutrition": {
      "calories": 450,
      "protein": 35,
      "carbs": 25,
      "fat": 20,
      "fiber": 8,
      "sugar": 5,
      "sodium": 600
    },
    "tips": ["Tip 1", "Tip 2"],
    "estimatedCost": "Budget"
  },
  "usedIngredients": ["ingredient1", "ingredient2"],
  "suggestedAdditionalIngredients": ["optional1", "optional2"],
  "confidence": 0.9
}

Guidelines:
- Prioritize high-protein recipes (aim for 25-40g protein per serving)
- Use available ingredients as the primary focus
- Suggest additional ingredients only if they significantly improve the recipe
- Ensure all nutritional values are realistic and accurate
- Keep prep and cook times reasonable
- Include helpful cooking tips
- Consider dietary restrictions and allergies
- Make recipes practical and achievable for home cooks`;

export async function generateRecipeStream(
  request: RecipeGenerationRequest
): Promise<ReadableStream<string>> {
  const userPrompt = buildUserPrompt(request);

  const result = await streamText({
    model: deepseek("deepseek-chat"),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    maxTokens: 2000,
  });

  return result.textStream;
}

function buildUserPrompt(request: RecipeGenerationRequest): string {
  const {
    availableIngredients,
    dietaryPreferences = [],
    allergies = [],
    maxPrepTime,
    servings = 4,
    cuisine,
    includeAdditionalIngredients = false,
  } = request;

  let prompt = `Please create a healthy, high-protein recipe using these available ingredients: ${availableIngredients.join(
    ", "
  )}.`;

  if (dietaryPreferences.length > 0) {
    prompt += `\n\nDietary preferences: ${dietaryPreferences.join(", ")}.`;
  }

  if (allergies.length > 0) {
    prompt += `\n\nAllergies to avoid: ${allergies.join(", ")}.`;
  }

  if (maxPrepTime) {
    prompt += `\n\nMaximum prep time: ${maxPrepTime} minutes.`;
  }

  prompt += `\n\nServings: ${servings}.`;

  if (cuisine) {
    prompt += `\n\nPreferred cuisine: ${cuisine}.`;
  }

  if (includeAdditionalIngredients) {
    prompt += `\n\nYou may suggest additional ingredients that would enhance the recipe, but focus primarily on the available ingredients.`;
  } else {
    prompt += `\n\nFocus only on the available ingredients. Do not suggest additional ingredients unless absolutely necessary for basic cooking (like oil, salt, pepper).`;
  }

  prompt += `\n\nPlease respond with a valid JSON object following the exact structure specified in the system prompt.`;

  return prompt;
}

export async function generateRecipe(
  request: RecipeGenerationRequest
): Promise<RecipeGenerationResponse> {
  const stream = await generateRecipeStream(request);
  const reader = stream.getReader();
  let result = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      result += value;
    }
  } finally {
    reader.releaseLock();
  }

  try {
    // Clean up the response to extract just the JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as RecipeGenerationResponse;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.error("Raw response:", result);
    throw new Error("Failed to generate recipe: Invalid response format");
  }
}
