import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentIntent } from "@/lib/services/stripe";
import { TOKEN_CONSTANTS } from "@/lib/types/token";

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
    const { amount } = body; // amount in dollars

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Calculate token amount based on pricing
    const tokenAmount = amount * TOKEN_CONSTANTS.TOKENS_PER_DOLLAR;

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent({
      userId: user.id,
      amount,
      tokenAmount,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount: paymentIntent.amount,
      tokenAmount: paymentIntent.tokenAmount,
    });
  } catch (error) {
    console.error("Error in POST /api/tokens/purchase:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
