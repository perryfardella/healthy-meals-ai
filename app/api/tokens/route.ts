import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserTokenBalanceServer,
  validateTokenForGenerationServer,
  consumeTokensServer,
  ensureUserTokenRecordServer,
} from "@/lib/services/token-server";

export async function GET() {
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

    // Get token balance
    const balance = await getUserTokenBalanceServer(user.id);

    if (!balance) {
      // Try to create token record if it doesn't exist
      const created = await ensureUserTokenRecordServer(user.id);
      if (!created) {
        return NextResponse.json(
          { error: "Failed to get token balance" },
          { status: 500 }
        );
      }

      // Try again after creation
      const newBalance = await getUserTokenBalanceServer(user.id);
      if (!newBalance) {
        return NextResponse.json(
          { error: "Failed to get token balance" },
          { status: 500 }
        );
      }

      return NextResponse.json(newBalance);
    }

    return NextResponse.json(balance);
  } catch (error) {
    console.error("Error in GET /api/tokens:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { action, usageType = "recipe_generation" } = body;

    switch (action) {
      case "validate":
        const validation = await validateTokenForGenerationServer(
          user.id,
          usageType
        );
        return NextResponse.json(validation);

      case "use":
        const success = await consumeTokensServer(user.id, usageType);
        if (success) {
          // Get updated balance
          const updatedBalance = await getUserTokenBalanceServer(user.id);
          return NextResponse.json({
            success: true,
            balance: updatedBalance,
          });
        } else {
          return NextResponse.json(
            { error: "Insufficient tokens" },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in POST /api/tokens:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
