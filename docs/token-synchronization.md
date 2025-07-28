# Token Balance Synchronization

## Overview

The Healthy Meals AI application uses real-time database subscriptions to keep token balances synchronized across all components in real-time.

## How It Works

### Real-time Updates

- **Supabase Real-time**: The `user_tokens` table is enabled for real-time subscriptions
- **Automatic Updates**: When tokens are purchased or used, all components automatically update their displayed balance
- **Fallback Polling**: If real-time fails, the system falls back to polling every 30 seconds

### Implementation Details

#### 1. Real-time Subscription

```typescript
// In useTokens hook
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
      // Refresh balance when tokens are updated
      fetchBalance();
    }
  )
  .subscribe();
```

#### 2. Purchase Flow

1. User makes payment through Stripe
2. Stripe webhook processes the payment
3. `addTokensServer()` updates the database
4. Real-time subscription triggers in all components
5. Token balance updates instantly across the app

#### 3. Usage Flow

1. User generates a recipe
2. `useTokens()` deducts tokens from database
3. Real-time subscription triggers
4. All components show updated balance

## Benefits

- **Instant Updates**: No manual refresh needed
- **Consistent State**: All components always show the same balance
- **Better UX**: Users see immediate feedback when purchasing or using tokens
- **Reliable**: Fallback polling ensures updates even if real-time fails

## Components Using Real-time

- **Header**: Shows current token balance
- **Main Page**: Shows token balance and purchase prompts
- **Recipe Book**: May show token usage information
- **Any future components**: Will automatically get real-time updates

## Database Schema

The `user_tokens` table is enabled for real-time:

```sql
-- Migration: 20250728000000_enable_realtime_for_user_tokens.sql
alter publication supabase_realtime add table public.user_tokens;
```

## Error Handling

- Real-time subscription failures are logged
- Fallback polling ensures updates continue
- Loading states show when balance is being updated
- Console logs help with debugging

## Future Enhancements

- Add toast notifications for successful purchases
- Implement optimistic updates for better UX
- Add retry logic for failed real-time connections
- Consider using React Query for more advanced caching
