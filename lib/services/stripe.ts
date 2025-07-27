import {
  stripe,
  TOKEN_PRICING,
  STRIPE_PRODUCT_CONFIG,
} from "@/lib/stripe/config";
import { addTokensServer } from "./token-server";

export interface CreatePaymentIntentParams {
  userId: string;
  amount: number; // Amount in dollars
  tokenAmount: number; // Number of tokens to purchase
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  tokenAmount: number;
}

export async function createPaymentIntent({
  userId,
  amount,
  tokenAmount,
}: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable."
    );
  }

  // Validate amount
  if (
    amount < TOKEN_PRICING.MIN_PURCHASE_AMOUNT ||
    amount > TOKEN_PRICING.MAX_PURCHASE_AMOUNT
  ) {
    throw new Error(
      `Amount must be between $${TOKEN_PRICING.MIN_PURCHASE_AMOUNT} and $${TOKEN_PRICING.MAX_PURCHASE_AMOUNT}`
    );
  }

  // Validate token amount
  const expectedTokens = amount * TOKEN_PRICING.TOKENS_PER_DOLLAR;
  if (tokenAmount !== expectedTokens) {
    throw new Error(
      `Token amount mismatch. Expected ${expectedTokens} tokens for $${amount}`
    );
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: STRIPE_PRODUCT_CONFIG.CURRENCY,
    metadata: {
      userId,
      tokenAmount: tokenAmount.toString(),
      purchaseType: "token_purchase",
    },
    description: `${STRIPE_PRODUCT_CONFIG.PRODUCT_NAME} - ${tokenAmount} tokens for $${amount}`,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    amount,
    tokenAmount,
  };
}

export async function handlePaymentSuccess(
  paymentIntentId: string
): Promise<boolean> {
  if (!stripe) {
    console.error("Stripe is not configured");
    return false;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      console.error("Payment not succeeded:", paymentIntent.status);
      return false;
    }

    const { userId, tokenAmount } = paymentIntent.metadata;

    if (!userId || !tokenAmount) {
      console.error("Missing metadata in payment intent");
      return false;
    }

    // Add tokens to user account using service role for webhook operations
    const success = await addTokensServer(userId, parseInt(tokenAmount), true);

    if (!success) {
      console.error("Failed to add tokens to user account");
      return false;
    }

    console.log(`Successfully added ${tokenAmount} tokens to user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error handling payment success:", error);
    return false;
  }
}

export async function getPaymentIntent(paymentIntentId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}
