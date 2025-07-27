import { createClient } from "@/lib/supabase/client";
import type {
  UserTokens,
  TokenBalance,
  TokenValidationResult,
} from "@/lib/types/token";
import { TOKEN_CONSTANTS } from "@/lib/types/token";

const { COST_PER_RECIPE_GENERATION, COST_PER_PHOTO_ANALYSIS } = TOKEN_CONSTANTS;

/**
 * Get user's token balance and free generation count
 */
export async function getUserTokenBalance(
  userId: string
): Promise<TokenBalance | null> {
  try {
    const supabase = createClient();

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
    console.error("Error in getUserTokenBalance:", error);
    return null;
  }
}

/**
 * Get user's token balance from server-side
 * Note: This function should only be used in server-side contexts
 */
export async function getUserTokenBalanceServer(): Promise<TokenBalance | null> {
  try {
    // This function should be called with a server-side Supabase client
    // The actual implementation will be in the API routes
    throw new Error(
      "getUserTokenBalanceServer should not be called from client-side code"
    );
  } catch (error) {
    console.error("Error in getUserTokenBalanceServer:", error);
    return null;
  }
}

/**
 * Check if user can generate a recipe and return validation result
 */
export async function validateTokenForGeneration(
  userId: string,
  usageType: "recipe_generation" | "photo_analysis" = "recipe_generation"
): Promise<TokenValidationResult> {
  try {
    const balance = await getUserTokenBalance(userId);

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
    console.error("Error in validateTokenForGeneration:", error);
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
 * Use tokens for recipe generation or photo analysis
 */
export async function useTokens(
  userId: string,
  usageType: "recipe_generation" | "photo_analysis" = "recipe_generation"
): Promise<boolean> {
  try {
    const supabase = createClient();
    const balance = await getUserTokenBalance(userId);

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
    console.error("Error in useTokens:", error);
    return false;
  }
}

/**
 * Add tokens to user's balance (for purchases, bonuses, etc.)
 */
export async function addTokens(
  userId: string,
  amount: number
): Promise<boolean> {
  try {
    const supabase = createClient();

    // First get current balance
    const currentBalance = await getUserTokenBalance(userId);
    if (!currentBalance) {
      return false;
    }

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

    return true;
  } catch (error) {
    console.error("Error in addTokens:", error);
    return false;
  }
}

/**
 * Subtract tokens from user's balance (for refunds, penalties, etc.)
 */
export async function subtractTokens(
  userId: string,
  amount: number
): Promise<boolean> {
  try {
    const supabase = createClient();

    // First check if user has enough tokens
    const balance = await getUserTokenBalance(userId);
    if (!balance || balance.tokens_balance < amount) {
      console.error("Insufficient tokens for subtraction");
      return false;
    }

    const { error } = await supabase
      .from("user_tokens")
      .update({
        tokens_balance: balance.tokens_balance - amount,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error subtracting tokens:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in subtractTokens:", error);
    return false;
  }
}

/**
 * Reset user tokens to initial amount (admin function)
 */
export async function resetUserTokens(
  userId: string,
  amount: number = TOKEN_CONSTANTS.TOKENS_ON_SIGNUP
): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("user_tokens")
      .update({
        tokens_balance: amount,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error resetting user tokens:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in resetUserTokens:", error);
    return false;
  }
}

/**
 * Get complete user token data
 */
export async function getUserTokens(
  userId: string
): Promise<UserTokens | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("user_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user tokens:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserTokens:", error);
    return null;
  }
}

/**
 * Create or update user token record (fallback for users without token records)
 */
export async function ensureUserTokenRecord(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();

    // Check if record exists
    const existing = await getUserTokens(userId);
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
    console.error("Error in ensureUserTokenRecord:", error);
    return false;
  }
}
