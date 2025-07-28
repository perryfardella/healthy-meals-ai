// Simple event system for token balance updates
type TokenBalanceListener = () => void;

class TokenBalanceEventManager {
  private listeners: TokenBalanceListener[] = [];

  subscribe(listener: TokenBalanceListener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  notify() {
    console.log("Notifying token balance listeners:", this.listeners.length);
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in token balance listener:", error);
      }
    });
  }
}

// Global instance
export const tokenBalanceEvents = new TokenBalanceEventManager();

// Convenience functions
export const subscribeToTokenBalanceUpdates = (
  listener: TokenBalanceListener
) => {
  return tokenBalanceEvents.subscribe(listener);
};

export const notifyTokenBalanceUpdate = () => {
  tokenBalanceEvents.notify();
};
