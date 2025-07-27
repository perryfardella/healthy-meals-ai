import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { TokenBalance, TokenValidationResult } from "@/lib/types/token";
import { TOKEN_CONSTANTS } from "@/lib/types/token";

const { COST_PER_RECIPE_GENERATION, COST_PER_PHOTO_ANALYSIS } = TOKEN_CONSTANTS;

/**
 * Get user's token balance from server-side
 */
export async function getUserTokenBalanceServer(
  userId: string,
  useServiceRole: boolean = false
): Promise<TokenBalance | null> {
  try {
    const supabase = useServiceRole
      ? createServiceRoleClient()
      : await createClient();

    const { data, error } = await supabase
      .from("user_tokens")
      .select("tokens_balance, total_generations_used")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user token balance:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserTokenBalanceServer:", error);
    return null;
  }
}

/**
 * Check if user can generate a recipe and return validation result (server-side)
 */
export async function validateTokenForGenerationServer(
  userId: string,
  usageType: "recipe_generation" | "photo_analysis" = "recipe_generation"
): Promise<TokenValidationResult> {
  try {
    const balance = await getUserTokenBalanceServer(userId);

    if (!balance) {
      return {
        can_generate: false,
        remaining_tokens: 0,
        cost_per_generation:
          usageType === "recipe_generation"
            ? COST_PER_RECIPE_GENERATION
            : COST_PER_PHOTO_ANALYSIS,
      };
    }

    const costPerGeneration =
      usageType === "recipe_generation"
        ? COST_PER_RECIPE_GENERATION
        : COST_PER_PHOTO_ANALYSIS;
    const canGenerate = balance.tokens_balance >= costPerGeneration;

    return {
      can_generate: canGenerate,
      remaining_tokens: balance.tokens_balance,
      cost_per_generation: costPerGeneration,
    };
  } catch (error) {
    console.error("Error in validateTokenForGenerationServer:", error);
    return {
      can_generate: false,
      remaining_tokens: 0,
      cost_per_generation:
        usageType === "recipe_generation"
          ? COST_PER_RECIPE_GENERATION
          : COST_PER_PHOTO_ANALYSIS,
    };
  }
}

/**
 * Use tokens for recipe generation or photo analysis (server-side)
 */
export async function consumeTokensServer(
  userId: string,
  usageType: "recipe_generation" | "photo_analysis" = "recipe_generation"
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const balance = await getUserTokenBalanceServer(userId);

    if (!balance) {
      console.error("No token balance found for user:", userId);
      return false;
    }

    const costPerGeneration =
      usageType === "recipe_generation"
        ? COST_PER_RECIPE_GENERATION
        : COST_PER_PHOTO_ANALYSIS;

    // Check if user has enough tokens
    if (balance.tokens_balance >= costPerGeneration) {
      // Use tokens
      const { error } = await supabase
        .from("user_tokens")
        .update({
          tokens_balance: balance.tokens_balance - costPerGeneration,
          total_generations_used: balance.total_generations_used + 1,
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error using tokens:", error);
        return false;
      }
    } else {
      console.error("Insufficient tokens for generation");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in useTokensServer:", error);
    return false;
  }
}

/**
 * Add tokens to user's balance (server-side)
 */
export async function addTokensServer(
  userId: string,
  amount: number,
  useServiceRole: boolean = false
): Promise<boolean> {
  try {
    // Use service role client for webhook operations, regular client for user operations
    const supabase = useServiceRole
      ? createServiceRoleClient()
      : await createClient();

    // First get current balance
    const currentBalance = await getUserTokenBalanceServer(
      userId,
      useServiceRole
    );

    if (!currentBalance) {
      // No record exists, create one with the purchased tokens
      console.log("Creating new token record for user:", userId);
      const { error } = await supabase.from("user_tokens").insert({
        user_id: userId,
        tokens_balance: amount,
        total_generations_used: 0,
      });

      if (error) {
        console.error("Error creating user token record:", error);
        return false;
      }

      console.log("Successfully created token record with", amount, "tokens");
      return true;
    }

    // Record exists, update the balance
    const { error } = await supabase
      .from("user_tokens")
      .update({
        tokens_balance: currentBalance.tokens_balance + amount,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error adding tokens:", error);
      return false;
    }

    console.log("Successfully added", amount, "tokens to existing balance");
    return true;
  } catch (error) {
    console.error("Error in addTokensServer:", error);
    return false;
  }
}

/**
 * Create or update user token record (server-side)
 */
export async function ensureUserTokenRecordServer(
  userId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Check if record exists
    const { data: existing } = await supabase
      .from("user_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existing) {
      return true; // Record already exists
    }

    // Create new record
    const { error } = await supabase.from("user_tokens").insert({
      user_id: userId,
      tokens_balance: TOKEN_CONSTANTS.TOKENS_ON_SIGNUP,
      total_generations_used: 0,
    });

    if (error) {
      console.error("Error creating user token record:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in ensureUserTokenRecordServer:", error);
    return false;
  }
}
