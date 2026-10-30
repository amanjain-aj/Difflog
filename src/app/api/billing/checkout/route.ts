import { NextRequest, NextResponse } from "next/server";
import { getDefaultOrganization, updateOrganizationPlan } from "@/lib/db";
import { PlanTier } from "@/lib/db/types";
import { getStripeClient, SPECSYNC_PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const planTier = (body?.planTier || "starter") as PlanTier;
    const selectedPlan =
      SPECSYNC_PLANS.find((p) => p.id === planTier) || SPECSYNC_PLANS[0];
    const org = await getDefaultOrganization();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripe = getStripeClient();
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: selectedPlan.stripePriceId,
            quantity: 1,
          },
        ],
        metadata: {
          organization_id: org.id,
          plan_tier: selectedPlan.id,
        },
        success_url: `${appUrl}/dashboard/billing?checkout=success&plan=${selectedPlan.id}`,
        cancel_url: `${appUrl}/dashboard/billing?checkout=cancelled`,
      });

      return NextResponse.json({
        mode: "stripe_live",
        checkoutUrl: session.url,
      });
    }

    // Local simulated Stripe checkout when STRIPE_SECRET_KEY is not configured
    const updatedOrg = await updateOrganizationPlan(
      org.id,
      selectedPlan.id,
      org.stripe_customer_id || `cus_sim_${org.id.slice(0, 8)}`,
      `sub_sim_${selectedPlan.id}_${Date.now()}`
    );

    return NextResponse.json({
      mode: "simulated",
      organization: updatedOrg,
      checkoutUrl: `/dashboard/billing?checkout=success&plan=${selectedPlan.id}`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to create Stripe checkout session",
      },
      { status: 500 }
    );
  }
}
