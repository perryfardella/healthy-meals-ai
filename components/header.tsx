"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, ShoppingCart } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { useUser } from "@/lib/hooks/useUser";
import { useTokens } from "@/lib/hooks/useTokens";
import { TokenPurchaseModal } from "@/components/TokenPurchaseModal";

export interface HeaderProps {
  onPurchaseTokens?: () => void;
}

export function Header({ onPurchaseTokens }: HeaderProps) {
  const { user, loading: userLoading } = useUser();
  const { balance, loading: tokenLoading, refreshBalance } = useTokens();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const isAuth = user !== null;
  const isLoading = userLoading || tokenLoading;

  const handlePurchaseClick = () => {
    if (onPurchaseTokens) {
      onPurchaseTokens();
    } else {
      setIsPurchaseModalOpen(true);
    }
  };

  const handlePurchaseSuccess = () => {
    refreshBalance();
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => (window.location.href = "/")}
            >
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Healthy Meals AI
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {isAuth && !isLoading && (
                <div className="hidden sm:flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {balance?.tokens_balance || 0} tokens
                  </span>
                </div>
              )}
              <Button
                onClick={handlePurchaseClick}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
              >
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Buy Tokens</span>
                <span className="sm:hidden">Buy</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/recipe-book")}
                className="text-xs sm:text-sm"
              >
                Recipe Book
              </Button>
              <div className="flex items-center space-x-2">
                {isAuth ? (
                  <LogoutButton />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.href = "/auth/login")}
                      className="text-xs sm:text-sm"
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => (window.location.href = "/auth/sign-up")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <TokenPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </>
  );
}
