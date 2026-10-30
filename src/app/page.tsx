import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Cpu,
  GitBranch,
  PlayCircle,
  Rss,
  ShieldAlert,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { listProjects } from "@/lib/db";
import { EndpointPill, SemanticTagBadge } from "@/components/changelog/badges";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await listProjects();

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#090A0F]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Terminal className="h-4 w-4" />
            </span>
            <div>
              <span className="font-bold tracking-tight text-white">
                DiffLog
              </span>
              <span className="ml-2 hidden sm:inline rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                difflog.dev
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <Link href="/acme-payments" className="hover:text-white transition-colors">
              Live Portal Demo
            </Link>
            <Link
              href="/acme-payments/rss.xml"
              className="hover:text-white transition-colors"
            >
              RSS Feed XML
            </Link>
            <Link
              href="/dashboard/simulator"
              className="hover:text-white transition-colors"
            >
              CI Ingestion Simulator
            </Link>
            <Link
              href="/dashboard/billing"
              className="hover:text-white transition-colors"
            >
              Founding Member Pricing ($29/mo)
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/acme-payments"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors"
            >
              <span>Public Portal</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <span>Admin Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                Zero-Config GitHub Action • Deterministic oasdiff + Groq LPU Structured JSON Schema
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Stripe-grade API changelogs, generated{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                deterministically
              </span>{" "}
              from Git &amp; OpenAPI.
            </h1>

            <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
              Stop letting API release notes lag weeks behind production. DiffLog
              runs <code className="font-mono text-zinc-200">oasdiff</code> in
              your GitHub Actions runner, detects breaking contract changes with
              100% accuracy, formats developer-ready summaries with Groq LPU
              LLMs, and publishes to your hosted changelog portal &amp; RSS feed in
              under 15 seconds.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/acme-payments"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
              >
                <span>Explore Live Changelog Portal</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/simulator"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-5 py-3 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/25 transition-colors"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Test CI Diff Ingestion</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-5 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
              >
                <span>Manage API Keys</span>
              </Link>
            </div>
          </div>

          {/* Live Preview Window */}
          <div className="mt-14 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/70" />
                <span className="h-3 w-3 rounded-full bg-amber-500/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                <span className="ml-2 font-mono text-xs text-zinc-400">
                  https://acme-payments.difflog.dev — Synced from commit 9f84c21
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[11px] text-rose-300">
                  oasdiff breaking: 2 ERR
                </span>
                <Link
                  href="/acme-payments"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Open Full Portal →
                </Link>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-5">
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  1. Composite GitHub Action (.github/workflows/difflog.yml)
                </div>
                <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#06070B] p-4 font-mono text-xs leading-relaxed text-zinc-300">
{`- name: DiffLog OpenAPI Diff & Changelog
  uses: difflog/action@v1
  with:
    api_key: \${{ secrets.DIFFLOG_API_KEY }}
    spec_path: "openapi.yaml"
    version_tag: "v2026.10.2"`}
                </pre>
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-xs text-zinc-400 space-y-2">
                  <div className="font-semibold text-zinc-200">
                    Deterministic Pipeline Guarantee:
                  </div>
                  <p>
                    1. Extracts{" "}
                    <code className="font-mono text-zinc-200">
                      $HEAD~1:openapi.yaml
                    </code>{" "}
                    and runs Go{" "}
                    <code className="font-mono text-zinc-200">
                      oasdiff breaking
                    </code>{" "}
                    &amp;{" "}
                    <code className="font-mono text-zinc-200">
                      oasdiff changelog
                    </code>
                    .
                  </p>
                  <p>
                    2. Dispatches structured JSON diff to{" "}
                    <code className="font-mono text-zinc-200">
                      POST /api/v1/ingest
                    </code>{" "}
                    with Bearer token authentication.
                  </p>
                </div>
              </div>

              <div className="space-y-3 lg:col-span-7">
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  2. Hosted Public Release Card &amp; RSS Entry
                </div>
                <div className="rounded-xl border border-rose-500/35 bg-gradient-to-b from-rose-950/15 via-zinc-900/70 to-zinc-900/70 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-indigo-300">
                      v2026.10.2 • Oct 28, 2026
                    </span>
                    <span className="rounded border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-300">
                      BREAKING CHANGE DETECTED
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">
                    Mandatory Idempotency Keys, Instant RTP Payouts &amp; Legacy
                    Charge Deprecation
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                    To prevent duplicate settlement mutations during network
                    retries, <code>POST /v1/payments</code> now requires an{" "}
                    <code>Idempotency-Key</code> header and explicit{" "}
                    <code>payment_method_types</code>.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <SemanticTagBadge tag="BREAKING" />
                        <EndpointPill endpoint="POST /v1/payments" />
                      </div>
                      <span className="text-xs text-zinc-400">
                        Required header `Idempotency-Key` added
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <SemanticTagBadge tag="NEW" />
                        <EndpointPill endpoint="POST /v1/payouts/instant" />
                      </div>
                      <span className="text-xs text-zinc-400">
                        Real-time RTP/FedNow merchant disbursements
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <SemanticTagBadge tag="DEPRECATED" />
                        <EndpointPill endpoint="POST /v1/charges/legacy" />
                      </div>
                      <span className="text-xs text-zinc-400">
                        Migrate synchronous card charges to /v1/payments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6">
            <GitBranch className="h-6 w-6 text-indigo-400" />
            <h3 className="mt-4 text-base font-bold text-white">
              1. GitHub Composite Action
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Offloads heavy OpenAPI schema diffing to customer CI runners using{" "}
              <code className="font-mono text-zinc-200">tufin/oasdiff</code> for
              100% deterministic breaking change detection.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6">
            <Cpu className="h-6 w-6 text-emerald-400" />
            <h3 className="mt-4 text-base font-bold text-white">
              2. Groq LPU JSON Schema LLM
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Enforces Groq JSON Object mode (<code className="font-mono text-zinc-200">CHANGELOG_PROMPT</code> +{" "}
              <code className="font-mono text-zinc-200">JSON_SCHEMA</code>) with
              sub-second LPU inference and zero endpoint hallucinations.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6">
            <ShieldAlert className="h-6 w-6 text-rose-400" />
            <h3 className="mt-4 text-base font-bold text-white">
              3. Semantic Impact Badges
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Every route change is classified into{" "}
              <code className="font-mono text-rose-300">[BREAKING]</code>,{" "}
              <code className="font-mono text-emerald-300">[NEW]</code>,{" "}
              <code className="font-mono text-sky-300">[CHANGED]</code>, or{" "}
              <code className="font-mono text-amber-300">[DEPRECATED]</code>.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6">
            <Rss className="h-6 w-6 text-amber-400" />
            <h3 className="mt-4 text-base font-bold text-white">
              4. Hosted Portals &amp; RSS XML
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Instant SSR public changelog portals at{" "}
              <code className="font-mono text-zinc-200">/[slug]</code> with
              standards-compliant <code className="font-mono text-zinc-200">/rss.xml</code> and{" "}
              <code className="font-mono text-zinc-200">/feed.xml</code> feeds.
            </p>
          </div>
        </div>

        {/* Hosted Portals Directory */}
        <div className="mt-14 rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Hosted Public API Portals in Workspace
              </h2>
              <p className="text-xs text-zinc-400">
                Click any project below to inspect its SSR public changelog or
                subscribe via RSS.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Create New Portal in Dashboard</span>
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                <div>
                  <div className="font-semibold text-white">{project.name}</div>
                  <div className="mt-0.5 font-mono text-xs text-zinc-400">
                    /{project.slug}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/${project.slug}/rss.xml`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
                  >
                    <Rss className="h-3.5 w-3.5" />
                    <span>RSS</span>
                  </a>
                  <Link
                    href={`/${project.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    <span>Open Portal</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
