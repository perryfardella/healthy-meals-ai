# Stripe Integration Setup Guide

This guide will help you set up Stripe for token purchases in the Healthy Meals AI app.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key (client-side)
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook endpoint secret

# Supabase Configuration (for webhook operations)
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Your Supabase service role key
```

**Note**: The `NEXT_PUBLIC_` prefix is required for environment variables that need to be accessible in the browser. This is Next.js's security feature to prevent accidentally exposing server-side secrets to the client.

**Security Note**: The service role key is used only for webhook operations and is never exposed to the client. This follows Supabase's official recommendation for webhook integrations.

## Stripe Dashboard Setup

### 1. Create a Stripe Account

- Go to [stripe.com](https://stripe.com) and create an account
- Complete the account verification process

### 2. Get API Keys

- In your Stripe Dashboard, go to **Developers > API keys**
- Copy your **Publishable key** and **Secret key**
- Use test keys for development, live keys for production

### 3. Set Up Webhooks

- Go to **Developers > Webhooks**
- Click **Add endpoint**
- Set the endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
- Select the following events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- Copy the webhook signing secret and add it to your environment variables

### 4. Configure Payment Methods

- Go to **Settings > Payment methods**
- Enable the payment methods you want to accept (e.g., cards, Apple Pay, Google Pay)

## Testing

### Test Cards

Use these test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Mode vs Live Mode

- Use test keys for development and testing
- Switch to live keys only when deploying to production
- Test webhooks using the Stripe CLI or webhook forwarding

## Token Pricing

The app is configured with the following token pricing:

- **Rate**: 100 tokens per $1
- **Minimum Purchase**: $1 (100 tokens)
- **Maximum Purchase**: $100 (10,000 tokens)
- **Cost per Recipe**: 1 token
- **Cost per Photo Analysis**: 2 tokens (future feature)

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** to prevent replay attacks
3. **Use HTTPS** in production for all webhook endpoints
4. **Implement proper error handling** for failed payments
5. **Add logging** for payment events and errors

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**

   - Check that your API keys are correct
   - Ensure you're using test keys for development

2. **Webhook not receiving events**

   - Verify the webhook URL is accessible
   - Check that the webhook secret is correct
   - Ensure the endpoint is returning a 200 status code

3. **Payment fails with "card declined"**
   - Use test card numbers for testing
   - Check that the payment method is enabled in your Stripe dashboard

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will log detailed information about payment processing and webhook events.

## Production Deployment

1. **Switch to live keys** in your production environment
2. **Update webhook endpoints** to use your production domain
3. **Test the complete payment flow** with small amounts
4. **Monitor webhook events** in the Stripe dashboard
5. **Set up error monitoring** for payment failures

## Support

For Stripe-specific issues:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For app-specific issues:

- Check the application logs
- Review the webhook event logs in Stripe dashboard
