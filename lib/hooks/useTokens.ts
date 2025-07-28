"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import type { TokenBalance, TokenValidationResult } from "@/lib/types/token";
import { subscribeToTokenBalanceUpdates } from "@/lib/utils/token-events";

interface UseTokensReturn {
  balance: TokenBalance | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  validateGeneration: (
    usageType?: "recipe_generation" | "photo_analysis"
  ) => Promise<TokenValidationResult | null>;
  useTokens: (
    usageType?: "recipe_generation" | "photo_analysis"
  ) => Promise<boolean>;
}

export function useTokens(): UseTokensReturn {
  const { user } = useUser();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tokens");
      if (!response.ok) {
        throw new Error("Failed to fetch token balance");
      }

      const data = await response.json();
      console.log("Fetched new balance:", data);
      setBalance(data);
    } catch (err) {
      console.error("Error fetching token balance:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch token balance"
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const validateGeneration = useCallback(
    async (
      usageType: "recipe_generation" | "photo_analysis" = "recipe_generation"
    ): Promise<TokenValidationResult | null> => {
      if (!user) {
        return null;
      }

      try {
        const response = await fetch("/api/tokens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "validate",
            usageType,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to validate tokens");
        }

        return await response.json();
      } catch (err) {
        console.error("Error validating tokens:", err);
        return null;
      }
    },
    [user]
  );

  const useTokens = useCallback(
    async (
      usageType: "recipe_generation" | "photo_analysis" = "recipe_generation"
    ): Promise<boolean> => {
      if (!user) {
        return false;
      }

      try {
        const response = await fetch("/api/tokens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "use",
            usageType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to use tokens");
        }

        const result = await response.json();

        // Update local balance
        if (result.success && result.balance) {
          setBalance(result.balance);
        }

        return result.success;
      } catch (err) {
        console.error("Error using tokens:", err);
        return false;
      }
    },
    [user]
  );

  // Fetch balance on mount and when user changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Set up real-time subscription for token balance updates
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    console.log("Setting up real-time subscription for user:", user.id);

    // Subscribe to changes in the user_tokens table for the current user
    const subscription = supabase
      .channel(`user_tokens_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_tokens",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Token balance updated via real-time:", payload);
          // Refresh balance when tokens are updated
          fetchBalance();
        }
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
        // If real-time fails, fall back to polling every 30 seconds
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(
            "Real-time subscription failed, falling back to polling"
          );
        }
      });

    // Subscribe to global token balance events
    const unsubscribe = subscribeToTokenBalanceUpdates(fetchBalance);

    return () => {
      console.log("Cleaning up real-time subscription for user:", user.id);
      subscription.unsubscribe();
      unsubscribe();
    };
  }, [user, fetchBalance]);

  return {
    balance,
    loading,
    error,
    refreshBalance: fetchBalance,
    validateGeneration,
    useTokens,
  };
}
