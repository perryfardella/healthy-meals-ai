export interface UserTokens {
  id: number;
  user_id: string;
  tokens_balance: number;
  total_generations_used: number;
  created_at: string;
  updated_at: string;
}

export interface TokenBalance {
  tokens_balance: number;
  total_generations_used: number;
}

export interface TokenTransaction {
  id: number;
  user_id: string;
  transaction_type: "purchase" | "usage" | "refund" | "bonus";
  amount: number;
  description: string;
  created_at: string;
}

export interface TokenPurchaseRequest {
  amount: number;
  payment_provider: "stripe";
  payment_intent_id?: string;
}

export interface TokenUsageRequest {
  amount: number;
  usage_type: "recipe_generation" | "photo_analysis";
  description?: string;
}

export interface TokenValidationResult {
  can_generate: boolean;
  remaining_tokens: number;
  cost_per_generation: number;
}

// Constants for token pricing and limits
export const TOKEN_CONSTANTS = {
  TOKENS_ON_SIGNUP: 10,
  COST_PER_RECIPE_GENERATION: 1,
  COST_PER_PHOTO_ANALYSIS: 2,
  TOKENS_PER_DOLLAR: 100, // $1 = 100 tokens
} as const;

// Token operation types
export type TokenOperation = "add_tokens" | "subtract_tokens";

export interface TokenOperationRequest {
  operation: TokenOperation;
  amount?: number;
  description?: string;
}
