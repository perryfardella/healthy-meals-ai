import Stripe from "stripe";

// Only create Stripe instance if keys are available (for build-time compatibility)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-06-30.basil",
    })
  : null;

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// Token pricing configuration
export const TOKEN_PRICING = {
  TOKENS_PER_DOLLAR: 100, // $1 = 100 tokens
  MIN_PURCHASE_AMOUNT: 1, // Minimum $1 purchase
  MAX_PURCHASE_AMOUNT: 100, // Maximum $100 purchase
} as const;

// Stripe product configuration
export const STRIPE_PRODUCT_CONFIG = {
  PRODUCT_NAME: "Healthy Meals AI Tokens",
  PRODUCT_DESCRIPTION: "Purchase tokens to generate healthy meal recipes",
  CURRENCY: "usd",
} as const;
