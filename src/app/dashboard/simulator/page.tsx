"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Play,
  Sparkles,
  Terminal,
} from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DEMO_ACME_RAW_API_KEY } from "@/lib/crypto/api-keys";
import { EndpointPill, SemanticTagBadge } from "@/components/changelog/badges";
import { ChangelogEntry } from "@/lib/db/types";

const SAMPLE_DIFF_JSON = JSON.stringify(
  {
    endpoints: {
      added: [
        {
          method: "POST",
          path: "/v1/payouts/instant",
          summary: "Trigger an instant real-time RTP/FedNow merchant payout",
        },
      ],
      modified: [
        {
          method: "POST",
          path: "/v1/payments",
          parameters: {
            added: [
              {
                name: "Idempotency-Key",
                in: "header",
                required: true,
              },
            ],
          },
          requestBody: {
            requiredPropertiesAdded: ["payment_method_types"],
            propertiesAdded: ["settlement_currency", "payment_method_types"],
            enumValuesAdded: {
              currency: ["jpy", "cad", "aud"],
            },
          },
        },
        {
          method: "POST",
          path: "/v1/charges/legacy",
          deprecated: { from: false, to: true },
        },
      ],
    },
  },
  null,
  2
);

const SAMPLE_BREAKING_JSON = JSON.stringify(
  [
    {
      id: "request-parameter-became-required",
      level: "ERR",
      text: "added the new required 'header' request parameter 'Idempotency-Key'",
      operation: "POST",
      path: "/v1/payments",
    },
    {
      id: "new-required-request-property",
      level: "ERR",
      text: "added the new required property 'payment_method_types' to the request body",
      operation: "POST",
      path: "/v1/payments",
    },
  ],
  null,
  2
);

export default function CiIngestionSimulatorPage() {
  const [apiKey, setApiKey] = useState(DEMO_ACME_RAW_API_KEY);
  const [commitHash, setCommitHash] = useState(
    "c7f92b418e01a3d5f7b9e1c2a4d6f80123456789"
  );
  const [commitMessage, setCommitMessage] = useState(
    "feat(payments): require Idempotency-Key on POST /v1/payments and launch POST /v1/payouts/instant"
  );
  const [versionTag, setVersionTag] = useState("v2026.10.30");
  const [diffText, setDiffText] = useState(SAMPLE_DIFF_JSON);
  const [breakingText, setBreakingText] = useState(SAMPLE_BREAKING_JSON);

  const [submitting, setSubmitting] = useState(false);
  const [errorResult, setErrorResult] = useState<{
    title: string;
    message: string;
    code?: string;
  } | null>(null);
  const [ingestedEntry, setIngestedEntry] = useState<ChangelogEntry | null>(
    null
  );
  const [portalSlug, setPortalSlug] = useState<string>("acme-payments");

  const handleDispatchIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorResult(null);
    setIngestedEntry(null);

    try {
      let parsedDiff: unknown;
      let parsedBreaking: unknown;

      try {
        parsedDiff = JSON.parse(diffText);
        parsedBreaking = breakingText.trim() ? JSON.parse(breakingText) : [];
      } catch {
        setErrorResult({
          title: "Invalid JSON Payload",
          message:
            "Make sure both the oasdiff changelog JSON and breaking JSON fields contain valid JSON.",
        });
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/v1/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          commit_hash: commitHash,
          commit_message: commitMessage,
          version_tag: versionTag,
          diff: parsedDiff,
          breaking: parsedBreaking,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorResult({
          title: data.error || "Ingestion Error",
          message: data.message || "Failed to ingest OpenAPI diff",
          code: data.code,
        });
      } else {
        setIngestedEntry(data.entry);
        if (data.project?.slug) {
          setPortalSlug(data.project.slug);
        }
      }
    } catch (err: unknown) {
      setErrorResult({
        title: "Network Error",
        message: err instanceof Error ? err.message : "Request failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100">
      <DashboardNav />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Terminal className="h-3.5 w-3.5" />
            <span>GitHub Action Runner → POST /api/v1/ingest</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">
            CI OpenAPI Diff & Live AI Ingestion Simulator
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-400">
            Simulate the exact payload dispatched by{" "}
            <code className="font-mono text-zinc-200">
              .github/actions/specsync/action.yml
            </code>{" "}
            after running{" "}
            <code className="font-mono text-zinc-200">oasdiff changelog</code>{" "}
            and{" "}
            <code className="font-mono text-zinc-200">oasdiff breaking</code>{" "}
            against{" "}
            <code className="font-mono text-zinc-200">
              examples/openapi-v1.yaml
            </code>{" "}
            and{" "}
            <code className="font-mono text-zinc-200">
              examples/openapi-v2.yaml
            </code>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form Column */}
          <form
            onSubmit={handleDispatchIngest}
            className="space-y-5 rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-6 lg:col-span-7"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Bearer Project API Key
                </label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-emerald-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Version / Release Tag
                </label>
                <input
                  type="text"
                  value={versionTag}
                  onChange={(e) => setVersionTag(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Git Commit SHA ($GITHUB_SHA)
                </label>
                <input
                  type="text"
                  required
                  value={commitHash}
                  onChange={(e) => setCommitHash(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Git Commit Message
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                oasdiff changelog JSON (/tmp/diff.json)
              </label>
              <textarea
                rows={10}
                value={diffText}
                onChange={(e) => setDiffText(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-indigo-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                oasdiff breaking JSON (/tmp/breaking.json)
              </label>
              <textarea
                rows={6}
                value={breakingText}
                onChange={(e) => setBreakingText(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-rose-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>
                {submitting
                  ? "Running Structured AI Schema Summarizer..."
                  : "POST /api/v1/ingest (Live AI Summarization)"}
              </span>
            </button>
          </form>

          {/* Output Column */}
          <div className="space-y-6 lg:col-span-5">
            {errorResult && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-6">
                <div className="flex items-center gap-2 text-base font-bold text-rose-300">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                  <span>{errorResult.title}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-200">
                  {errorResult.message}
                </p>
                {errorResult.code === "MISSING_GROQ_API_KEY" && (
                  <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-300">
                    <div className="text-zinc-400 mb-1">
                      # Set your live Groq key in .env.local:
                    </div>
                    <div className="text-emerald-400">
                      GROQ_API_KEY=&quot;gsk_your-live-groq-key&quot;
                    </div>
                  </div>
                )}
              </div>
            )}

            {ingestedEntry && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/15 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span>201 Created — Release Published</span>
                  </div>
                  <Link
                    href={`/${portalSlug}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
                  >
                    <span>View on Portal</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-base font-bold text-white">
                    {ingestedEntry.title}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                    {ingestedEntry.summary}
                  </p>
                  <div className="mt-4 space-y-2">
                    {ingestedEntry.structured_changes.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-zinc-800/90 bg-zinc-900/60 p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <SemanticTagBadge tag={item.tag} />
                          <EndpointPill endpoint={item.endpoint} />
                        </div>
                        <p className="mt-1.5 text-xs text-zinc-300">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                <Sparkles className="h-4 w-4" />
                <span>Strict JSON Schema Contract</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Every ingestion request validates the Bearer API Key against{" "}
                <code className="font-mono text-zinc-200">
                  projects.api_key_hash
                </code>
                , checks organization quota, and enforces strict JSON Schema validation
                with our AI summarizer so the model can never hallucinate fields or invalid
                change tags.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
