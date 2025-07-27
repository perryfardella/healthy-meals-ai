import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addTokensServer } from "@/lib/services/token-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid token amount" },
        { status: 400 }
      );
    }

    // TODO: Integrate with Stripe for payment processing
    // For now, this is a placeholder that adds tokens directly
    // In production, this should:
    // 1. Create a payment intent with Stripe
    // 2. Verify payment completion
    // 3. Add tokens only after successful payment

    const success = await addTokensServer(user.id, amount);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to add tokens" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${amount} tokens to your account`,
      amount,
    });
  } catch (error) {
    console.error("Error in POST /api/tokens/purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
