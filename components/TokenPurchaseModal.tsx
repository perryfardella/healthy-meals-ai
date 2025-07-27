"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CreditCard } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TOKEN_PACKAGES = [
  { amount: 1, tokens: 100, popular: false },
  { amount: 5, tokens: 500, popular: true },
  { amount: 10, tokens: 1000, popular: false },
  { amount: 20, tokens: 2000, popular: false },
];

// Stripe card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

function PaymentForm({
  selectedPackage,
  onSuccess,
  onClose,
}: {
  selectedPackage: (typeof TOKEN_PACKAGES)[0];
  onSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: selectedPackage.amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment");
      }

      const { clientSecret } = await response.json();

      // Confirm payment with card element
      const { error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed");
      }

      // Payment successful - wait for webhook to process
      console.log("Payment confirmed, processing tokens...");

      // Show success message and wait for webhook
      setError(null);
      setIsLoading(true);

      // Wait for webhook to process, then refresh and close
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000); // Wait 3 seconds for webhook to process
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {error ? "Processing..." : "Adding tokens..."}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pay ${selectedPackage.amount}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}

export function TokenPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
}: TokenPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(TOKEN_PACKAGES[1]); // Default to $5 package

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Purchase Tokens
          </CardTitle>
          <CardDescription>
            Choose a token package to continue generating healthy meal recipes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token Packages */}
          <div className="grid grid-cols-2 gap-3">
            {TOKEN_PACKAGES.map((pkg) => (
              <div
                key={pkg.amount}
                className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedPackage.amount === pkg.amount
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 -right-2 text-xs bg-green-500">
                    Popular
                  </Badge>
                )}
                <div className="text-center">
                  <div className="text-lg font-bold">${pkg.amount}</div>
                  <div className="text-sm text-gray-600">
                    {pkg.tokens} tokens
                  </div>
                  <div className="text-xs text-gray-500">
                    {pkg.tokens / pkg.amount} tokens/$
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Package Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <div className="text-right">
                <div className="font-bold">${selectedPackage.amount}</div>
                <div className="text-sm text-gray-600">
                  {selectedPackage.tokens} tokens
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Elements */}
          <Elements stripe={stripePromise}>
            <PaymentForm
              selectedPackage={selectedPackage}
              onSuccess={onSuccess || (() => {})}
              onClose={onClose}
            />
          </Elements>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            <p>• 1 token = 1 recipe generation</p>
            <p>• Secure payment powered by Stripe</p>
            <p>• Tokens are added instantly after payment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
