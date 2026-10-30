"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, CreditCard, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SPECSYNC_PLANS } from "@/lib/stripe";
import { Organization, PlanTier } from "@/lib/db/types";

function BillingContent() {
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
  const checkoutPlan = searchParams.get("plan");

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<PlanTier | null>(null);

  const loadOrg = async () => {
    const res = await fetch("/api/projects", { cache: "no-store" });
    const data = await res.json();
    setOrganization(data.organization);
  };

  useEffect(() => {
    loadOrg();
  }, [checkoutStatus]);

  const handleSubscribe = async (planTier: PlanTier) => {
    setLoadingPlan(planTier);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {checkoutStatus === "success" && (
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 text-sm text-emerald-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>
              Subscription updated to{" "}
              <strong className="uppercase">{checkoutPlan}</strong> plan! Your
              organization quota and Founding Member benefits are active.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Founding Member Offer — First 10 Customers Lock In $29/mo</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white">
            Stripe Billing & Subscription Plans
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Deterministic OpenAPI diffing in CI + hosted developer portals with
            instant RSS & Slack webhook alerts.
          </p>
        </div>

        {organization && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs">
            <div className="text-zinc-400">Current Active Plan</div>
            <div className="mt-0.5 flex items-center gap-2 font-mono text-sm font-bold uppercase text-indigo-400">
              <CreditCard className="h-4 w-4" />
              <span>{organization.plan_tier}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {SPECSYNC_PLANS.map((plan) => {
          const isCurrent = organization?.plan_tier === plan.id;
          const isStarter = plan.id === "starter";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 ${
                isStarter
                  ? "border-indigo-500/60 bg-gradient-to-b from-indigo-950/25 via-zinc-900/60 to-zinc-900/60 shadow-[0_0_30px_rgba(99,102,241,0.12)]"
                  : "border-zinc-800/90 bg-zinc-900/40"
              }`}
            >
              <div>
                {plan.badge && (
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 px-3 py-0.5 text-[11px] font-semibold text-indigo-300">
                    <Zap className="h-3 w-3" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 border-t border-zinc-800/80 pt-6">
                  {plan.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-xs text-zinc-300"
                    >
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || loadingPlan === plan.id}
                className={`mt-8 w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                  isCurrent
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 cursor-default"
                    : isStarter
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "bg-zinc-100 text-zinc-950 hover:bg-white"
                }`}
              >
                {isCurrent
                  ? "Current Active Plan"
                  : loadingPlan === plan.id
                  ? "Redirecting to Stripe Checkout..."
                  : `Switch to ${plan.name} ($${plan.priceMonthly}/mo)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100">
      <DashboardNav />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-zinc-400">
            Loading billing configuration...
          </div>
        }
      >
        <BillingContent />
      </Suspense>
    </div>
  );
}
