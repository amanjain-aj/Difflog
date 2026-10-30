import { NextRequest, NextResponse } from "next/server";
import { updateOrganizationPlan } from "@/lib/db";
import { PlanTier } from "@/lib/db/types";
import { getStripeClient } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (stripe && webhookSecret && sig) {
      const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orgId = session.metadata?.organization_id;
        const planTier = (session.metadata?.plan_tier || "starter") as PlanTier;
        if (orgId) {
          await updateOrganizationPlan(
            orgId,
            planTier,
            typeof session.customer === "string" ? session.customer : undefined,
            typeof session.subscription === "string"
              ? session.subscription
              : undefined
          );
        }
      }
      return NextResponse.json({ received: true });
    }

    // Fallback JSON webhook payload handling for local webhook testing
    const payload = JSON.parse(rawBody);
    if (payload?.type === "checkout.session.completed") {
      const orgId = payload.data?.object?.metadata?.organization_id;
      const planTier = (payload.data?.object?.metadata?.plan_tier ||
        "starter") as PlanTier;
      if (orgId) {
        await updateOrganizationPlan(orgId, planTier);
      }
    }
    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Webhook signature verification failed",
      },
      { status: 400 }
    );
  }
}
