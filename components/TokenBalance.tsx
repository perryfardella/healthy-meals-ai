"use client";

import { useTokens } from "@/lib/hooks/useTokens";
import { Sparkles, Coins } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TokenBalance() {
  const { balance, loading, error } = useTokens();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Sparkles className="w-5 h-5" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Failed to load token balance</p>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Token Balance
        </CardTitle>
        <CardDescription>
          Your available tokens for recipe generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Paid Tokens</span>
          </div>
          <Badge variant="secondary" className="text-lg font-bold">
            {balance.tokens_balance}
          </Badge>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total Generations Used</span>
            <span>{balance.total_generations_used}</span>
          </div>
        </div>

        {balance.tokens_balance === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You&apos;re out of tokens! Purchase more to continue generating
              recipes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
