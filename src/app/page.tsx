import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Cpu,
  FileCode2,
  GitCompare,
  GitMerge,
  Globe,
  Rss,
  ShieldAlert,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { listProjects } from "@/lib/db";
import { EndpointPill, SemanticTagBadge } from "@/components/changelog/badges";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await listProjects();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#090A0F] dark:text-zinc-100 transition-colors duration-200">
      {/* Top Navbar — Clean Visitor-First Navigation (No internal "Admin Dashboard" button) */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 dark:border-zinc-800/80 dark:bg-[#090A0F]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-600/30 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-400">
              <Terminal className="h-4 w-4" />
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-zinc-900 dark:text-white text-base">
                DiffLog
              </span>
              <span className="hidden sm:inline rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                difflog.dev
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <a
              href="#how-it-works"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#before-after"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Why DiffLog
            </a>
            <Link
              href="/acme-payments"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Live Demo Portal
            </Link>
            <a
              href="#pricing"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Pricing ($29/mo)
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:text-white transition-colors"
            >
              <span>Log In</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: Crystal-Clear Value Proposition */}
      <section className="relative overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                Automated OpenAPI Changelog &amp; Breaking Change Detector
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl leading-[1.12]">
              Turn every OpenAPI commit into a{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 dark:from-indigo-400 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Stripe-grade public changelog
              </span>
              .
            </h1>

            <p className="mt-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
              Whenever your team merges changes to{" "}
              <code className="rounded bg-zinc-200/80 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-sm text-zinc-900 dark:text-zinc-200">
                openapi.yaml
              </code>
              , DiffLog automatically diffs the old and new schema in GitHub
              Actions, flags{" "}
              <strong className="font-semibold text-rose-600 dark:text-rose-400">
                [BREAKING]
              </strong>{" "}
              contract changes with 100% deterministic accuracy, writes crisp
              developer release notes, and updates your public changelog portal
              &amp; RSS feed in 15 seconds.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
              >
                <span>Start Automating Your Changelog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/acme-payments"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span>View Live Public Changelog Demo</span>
                <ArrowUpRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Zero-config 3-line GitHub Action
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                100% deterministic breaking change detection
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Hosted Portal + RSS XML + Slack Alerts
              </span>
            </div>
          </div>

          {/* Interactive Visual Pipeline: Input OpenAPI Diff -> Output Hosted Changelog */}
          <div className="mt-14 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/90">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  Live Pipeline Preview: Git Push → oasdiff → Hosted Public Changelog
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  2 Breaking Changes Caught Automatically
                </span>
                <Link
                  href="/acme-payments"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Open Live Portal →
                </Link>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left: What happens in Git */}
              <div className="space-y-3 lg:col-span-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    INPUT: Your Git Commit (openapi.yaml)
                  </span>
                  <span className="rounded bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                    git push origin main
                  </span>
                </div>
                <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-200 dark:border-zinc-800 dark:bg-[#06070B]">
{`  /v1/payments:
    post:
      parameters:
+       - name: Idempotency-Key
+         in: header
+         required: true   # <-- BREAKING!
      requestBody:
        properties:
          currency:
-           enum: [usd, eur, gbp]
+           enum: [usd, eur, gbp, jpy, cad]
+ /v1/payouts/instant:
+   post:
+     summary: Real-time RTP merchant payout`}
                </pre>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-400 space-y-1.5">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-200">
                    How DiffLog processes this commit:
                  </div>
                  <p>
                    1. Runs{" "}
                    <code className="font-mono text-zinc-900 dark:text-zinc-200">
                      oasdiff breaking
                    </code>{" "}
                    in GitHub Actions and detects that{" "}
                    <code className="font-mono text-rose-600 dark:text-rose-300">
                      Idempotency-Key
                    </code>{" "}
                    became required.
                  </p>
                  <p>
                    2. Structured AI formats the schema diff into a
                    developer-ready release note with zero hallucinated routes.
                  </p>
                </div>
              </div>

              {/* Right: What your API consumers see */}
              <div className="space-y-3 lg:col-span-7">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    OUTPUT: Published Instantly on acme-payments.difflog.dev
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    Synced in 4.2s
                  </span>
                </div>

                <div className="rounded-xl border border-rose-500/35 bg-gradient-to-b from-rose-500/5 via-white to-white dark:from-rose-950/15 dark:via-zinc-900/70 dark:to-zinc-900/70 p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                      v2026.10.2 • Oct 28, 2026 • commit 9f84c21
                    </span>
                    <span className="rounded border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-700 dark:text-rose-300">
                      BREAKING CHANGE ALERT
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-white">
                    Mandatory Idempotency Keys, Instant RTP Payouts &amp; Legacy
                    Charge Deprecation
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                    To prevent duplicate settlement mutations during network
                    retries,{" "}
                    <code className="font-mono font-semibold">
                      POST /v1/payments
                    </code>{" "}
                    now requires an{" "}
                    <code className="font-mono font-semibold">
                      Idempotency-Key
                    </code>{" "}
                    header. We also launched real-time RTP payouts.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <SemanticTagBadge tag="BREAKING" />
                        <EndpointPill endpoint="POST /v1/payments" />
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Required header `Idempotency-Key` added
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <SemanticTagBadge tag="NEW" />
                        <EndpointPill endpoint="POST /v1/payouts/instant" />
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Real-time RTP/FedNow merchant disbursements
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <SemanticTagBadge tag="CHANGED" />
                        <EndpointPill endpoint="POST /v1/payments" />
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Added `jpy` and `cad` currency enum values
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works in 3 Steps */}
      <section
        id="how-it-works"
        className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              How DiffLog Works
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              From Git merge to published API release notes in 3 steps
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              No manual copy-pasting from Jira tickets or PR descriptions. Set
              it up once in GitHub Actions and your API documentation stays in
              sync forever.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800/90 dark:bg-zinc-900/40">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                  <GitCompare className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs font-bold text-zinc-400">
                  STEP 01
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
                1. Deterministic Diff in CI
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                On every merge to <code className="font-mono">main</code>, our
                GitHub Action compares your previous{" "}
                <code className="font-mono">openapi.yaml</code> against the new
                commit using <code className="font-mono">oasdiff</code>—catching
                removed fields, new required headers, and status code changes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800/90 dark:bg-zinc-900/40">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <Cpu className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs font-bold text-zinc-400">
                  STEP 02
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
                2. Structured AI Summarization
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                DiffLog sends the mathematical schema diff and Git commit
                message to our Structured AI Engine with a strict JSON Schema contract. It
                writes human-friendly migration advice and classifies every
                route as <code className="font-mono">[BREAKING]</code>,{" "}
                <code className="font-mono">[NEW]</code>,{" "}
                <code className="font-mono">[CHANGED]</code>, or{" "}
                <code className="font-mono">[DEPRECATED]</code>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800/90 dark:bg-zinc-900/40">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <Globe className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs font-bold text-zinc-400">
                  STEP 03
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
                3. Instant Portal, RSS &amp; Alerts
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Your public changelog portal (<code className="font-mono">/{`{slug}`}</code>),
                developer RSS feed (<code className="font-mono">/rss.xml</code>),
                and partner Slack/Discord channels update immediately—keeping
                every API consumer informed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Why Engineering Teams Switch (Before vs After) */}
      <section
        id="before-after"
        className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              The Problem We Solve
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Why manual API release notes fail
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Without DiffLog */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 dark:bg-rose-950/10">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Without DiffLog (Manual Release Notes)</span>
              </div>
              <ul className="mt-4 space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>
                    Backend engineers ship a new required parameter on Friday;
                    partner integrations break over the weekend because nobody
                    updated the changelog.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>
                    Product &amp; DevRel spend hours at the end of the month
                    digging through 100+ Git commits trying to figure out which
                    API endpoints changed.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>
                    Generic LLM commit-message summarizers hallucinate endpoints
                    or miss subtle OpenAPI schema breaking changes.
                  </span>
                </li>
              </ul>
            </div>

            {/* With DiffLog */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 dark:bg-emerald-950/10">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                <Zap className="h-4 w-4" />
                <span>With DiffLog (Automated OpenAPI Sync)</span>
              </div>
              <ul className="mt-4 space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓
                  </span>
                  <span>
                    Every schema change is diffed mathematically via{" "}
                    <code className="font-mono">oasdiff</code> on every merge to{" "}
                    <code className="font-mono">main</code>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓
                  </span>
                  <span>
                    Breaking contract changes are flagged in red with exact
                    migration instructions before customers open support
                    tickets.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓
                  </span>
                  <span>
                    Partners subscribe once via RSS (<code className="font-mono">/rss.xml</code>)
                    or Slack webhooks and get real-time updates automatically.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Live Hosted Portals & Pricing Summary */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Hosted Portals Directory */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800/90 dark:bg-zinc-900/40 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Interactive Examples
                </span>
                <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
                  Explore Live Hosted API Portals
                </h2>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Click any API project below to test endpoint search, semantic
                  tag filtering, raw diff inspection, and RSS feeds.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70"
                >
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {project.name}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      https://{project.slug}.difflog.dev
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/${project.slug}/rss.xml`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                    >
                      <Rss className="h-3.5 w-3.5" />
                      <span>RSS Feed</span>
                    </a>
                    <Link
                      href={`/${project.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      <span>View Changelog</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Founding Member Plan Card */}
          <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 via-white to-white p-6 shadow-md dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-zinc-900/60 lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              <Zap className="h-3 w-3" />
              <span>Founding Member Plan</span>
            </div>
            <h3 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">
              Simple, Developer-First Pricing
            </h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                $29
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                / month • Starter Plan
              </span>
            </div>
            <ul className="mt-5 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Up to 3 Hosted Public API Changelog Portals</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Unlimited GitHub Action `oasdiff` CI syncs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Structured AI Release Summarization</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Public RSS/Atom Feeds + Slack &amp; Discord Webhooks</span>
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-8 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-zinc-900 dark:text-white">
              DiffLog
            </span>
            <span>— Automated OpenAPI Changelogs from Git.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/acme-payments"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Demo Portal
            </Link>
            <Link
              href="/acme-payments/rss.xml"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              RSS Feed
            </Link>
            <Link
              href="/login"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
