import { NextRequest, NextResponse } from "next/server";
import { generateRecipeStream } from "@/lib/services/ai";
import { RecipeGenerationRequest } from "@/lib/types/recipe";

export async function POST(request: NextRequest) {
  try {
    const body: RecipeGenerationRequest = await request.json();

    // Validate required fields
    if (!body.availableIngredients || body.availableIngredients.length === 0) {
      return NextResponse.json(
        { error: "Available ingredients are required" },
        { status: 400 }
      );
    }

    // Generate recipe stream
    const stream = await generateRecipeStream(body);

    // Return the stream as a response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
