import Stripe from "stripe";
import { PlanTier } from "@/lib/db/types";

export interface PricingPlanInfo {
  id: PlanTier;
  name: string;
  priceMonthly: number;
  badge?: string;
  description: string;
  projectLimit: number;
  features: string[];
  stripePriceId: string;
}

export const SPECSYNC_PLANS: PricingPlanInfo[] = [
  {
    id: "starter",
    name: "Founding Member Starter",
    priceMonthly: 29,
    badge: "Most Popular • Founding Offer",
    description:
      "Locked-in Founding Member pricing for engineering teams automating OpenAPI release notes.",
    projectLimit: 3,
    features: [
      "Up to 3 API Projects & Public Portals",
      "Unlimited GitHub Action oasdiff runs",
      "Deterministic Breaking Change Detection",
      "Structured AI Release Summarization",
      "Hosted Public RSS & Atom XML Feeds",
      "Direct access to Founding Member Slack channel",
    ],
    stripePriceId:
      process.env.STRIPE_STARTER_PRICE_ID || "price_starter_29_monthly",
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 79,
    description:
      "For multi-service platform teams shipping weekly partner-facing API changes.",
    projectLimit: 10,
    features: [
      "Up to 10 API Projects & Public Portals",
      "Everything in Starter",
      "Slack & Discord Breaking Change Alert Webhooks",
      "Custom Domain CNAME Preview",
      "Priority CI Ingestion Queue",
    ],
    stripePriceId:
      process.env.STRIPE_GROWTH_PRICE_ID || "price_growth_79_monthly",
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: 199,
    description:
      "For high-velocity fintech, AI, and enterprise API platforms with strict SLA compliance.",
    projectLimit: 50,
    features: [
      "Up to 50 API Projects",
      "Everything in Growth",
      "Dedicated Custom Prompt Guardrails",
      "99.99% Edge SLA & Audit Logs",
      "Dedicated Solutions Engineer",
    ],
    stripePriceId:
      process.env.STRIPE_SCALE_PRICE_ID || "price_scale_199_monthly",
  },
];

export function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2024-09-30.acacia" as Stripe.LatestApiVersion,
  });
}
