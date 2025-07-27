import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { handlePaymentSuccess } from "@/lib/services/stripe";

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Processing payment_intent.succeeded:", paymentIntent.id);
        console.log("Payment intent metadata:", paymentIntent.metadata);

        // Only process token purchases
        if (paymentIntent.metadata?.purchaseType === "token_purchase") {
          console.log(
            "Processing token purchase for user:",
            paymentIntent.metadata.userId
          );
          const success = await handlePaymentSuccess(paymentIntent.id);

          if (!success) {
            console.error(
              "Failed to process payment success for:",
              paymentIntent.id
            );
            return NextResponse.json(
              { error: "Failed to process payment" },
              { status: 500 }
            );
          }

          console.log("Successfully processed payment:", paymentIntent.id);
        } else {
          console.log("Skipping non-token purchase payment:", paymentIntent.id);
        }
        break;

      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
