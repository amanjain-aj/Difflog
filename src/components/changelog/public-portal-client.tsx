"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  FileCode2,
  Filter,
  GitCommit,
  Rss,
  Search,
  ShieldAlert,
  Sparkles,
  Terminal,
} from "lucide-react";
import { ChangelogEntry, ChangeTag, Project } from "@/lib/db/types";
import { EndpointPill, SemanticTagBadge } from "@/components/changelog/badges";
import { formatRelativeDate, shortCommit } from "@/lib/utils";

interface PublicPortalClientProps {
  project: Project;
  entries: ChangelogEntry[];
  allProjects: Project[];
}

export function PublicPortalClient({
  project,
  entries,
  allProjects,
}: PublicPortalClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<ChangeTag | "ALL">("ALL");
  const [breakingOnly, setBreakingOnly] = useState(false);
  const [expandedDiffIds, setExpandedDiffIds] = useState<Record<string, boolean>>({});
  const [copiedRss, setCopiedRss] = useState(false);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (breakingOnly && !entry.has_breaking_changes) return false;

      if (activeTag !== "ALL") {
        const hasTag = entry.structured_changes.some((c) => c.tag === activeTag);
        if (!hasTag) return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const inTitle = entry.title.toLowerCase().includes(q);
        const inSummary = entry.summary.toLowerCase().includes(q);
        const inVersion = (entry.version_tag || "").toLowerCase().includes(q);
        const inCommit = entry.commit_hash.toLowerCase().includes(q);
        const inEndpoints = entry.structured_changes.some(
          (c) =>
            c.endpoint.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        );
        return inTitle || inSummary || inVersion || inCommit || inEndpoints;
      }

      return true;
    });
  }, [entries, breakingOnly, activeTag, searchQuery]);

  const stats = useMemo(() => {
    let breakingCount = 0;
    let newEndpoints = 0;
    let changedEndpoints = 0;
    let deprecatedEndpoints = 0;

    for (const entry of entries) {
      for (const item of entry.structured_changes) {
        if (item.tag === "BREAKING") breakingCount++;
        if (item.tag === "NEW") newEndpoints++;
        if (item.tag === "CHANGED") changedEndpoints++;
        if (item.tag === "DEPRECATED") deprecatedEndpoints++;
      }
    }
    return {
      totalReleases: entries.length,
      breakingCount,
      newEndpoints,
      changedEndpoints,
      deprecatedEndpoints,
    };
  }, [entries]);

  const toggleDiffDrawer = (id: string) => {
    setExpandedDiffIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyRssUrl = () => {
    const url = `${window.location.origin}/${project.slug}/rss.xml`;
    navigator.clipboard.writeText(url);
    setCopiedRss(true);
    setTimeout(() => setCopiedRss(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100">
      {/* Top Subdomain Header Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#090A0F]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-zinc-100 hover:text-indigo-400 transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                <Terminal className="h-4 w-4" />
              </span>
              <span>DiffLog</span>
            </Link>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100">{project.name}</span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400">
                {project.slug}.difflog.dev
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Project Switcher */}
            <div className="hidden md:flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/70 p-1 text-xs">
              {allProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.slug}`}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    p.slug === project.slug
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {p.slug}
                </Link>
              ))}
            </div>

            <button
              onClick={copyRssUrl}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
              title="Copy RSS Feed URL"
            >
              {copiedRss ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Feed URL</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Copy RSS</span>
                </>
              )}
            </button>

            <a
              href={`/${project.slug}/rss.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <Rss className="h-3.5 w-3.5" />
              <span>rss.xml</span>
            </a>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white transition-colors"
            >
              <span>Admin Portal</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-zinc-800/80 bg-gradient-to-b from-indigo-950/20 via-[#090A0F] to-[#090A0F]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Deterministic oasdiff + Structured Groq LPU Release Notes</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {project.name} Changelog
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Real-time schema changes, new endpoints, parameter additions, and
                breaking contract mutations synced directly from CI on every merge
                to <code className="text-zinc-200 font-mono">main</code>.
              </p>
            </div>

            {/* Telemetry Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/50 px-3.5 py-2.5">
                <div className="text-[11px] font-mono uppercase text-zinc-400">
                  Releases
                </div>
                <div className="mt-0.5 text-xl font-bold text-white">
                  {stats.totalReleases}
                </div>
              </div>
              <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 px-3.5 py-2.5">
                <div className="text-[11px] font-mono uppercase text-rose-400">
                  Breaking
                </div>
                <div className="mt-0.5 text-xl font-bold text-rose-300">
                  {stats.breakingCount}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 px-3.5 py-2.5">
                <div className="text-[11px] font-mono uppercase text-emerald-400">
                  New Routes
                </div>
                <div className="mt-0.5 text-xl font-bold text-emerald-300">
                  {stats.newEndpoints}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-3.5 py-2.5">
                <div className="text-[11px] font-mono uppercase text-amber-400">
                  Deprecated
                </div>
                <div className="mt-0.5 text-xl font-bold text-amber-300">
                  {stats.deprecatedEndpoints}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Semantic Filter Bar */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints (/v1/payments), parameters, commit SHA, or version..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400 mr-1">
                <Filter className="h-3.5 w-3.5" />
                Filter:
              </span>
              {(["ALL", "BREAKING", "NEW", "CHANGED", "DEPRECATED"] as const).map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-mono font-medium transition-all ${
                      activeTag === tag
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                        : "border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {tag === "ALL" ? "All Changes" : `[${tag}]`}
                  </button>
                )
              )}

              <button
                onClick={() => setBreakingOnly((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  breakingOnly
                    ? "border-rose-500 bg-rose-500/20 text-rose-200"
                    : "border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                <span>Breaking Releases Only</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Timeline Feed */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {filteredEntries.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center">
            <FileCode2 className="mx-auto h-10 w-10 text-zinc-600" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-200">
              No matching API changelog entries
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Try clearing your endpoint search query or semantic tag filter.
            </p>
          </div>
        ) : (
          <div className="relative space-y-10 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-px before:bg-zinc-800 md:before:left-[180px]">
            {filteredEntries.map((entry) => {
              const isDiffOpen = Boolean(expandedDiffIds[entry.id]);

              return (
                <article
                  key={entry.id}
                  id={entry.id}
                  className="relative flex flex-col gap-4 md:flex-row md:gap-10"
                >
                  {/* Left Sticky Date & Version Column */}
                  <div className="flex items-center gap-3 md:w-[160px] md: shrink-0 md:flex-col md:items-end md:text-right pl-10 md:pl-0">
                    <time
                      dateTime={entry.published_at}
                      className="font-mono text-xs font-medium text-zinc-400"
                    >
                      {formatRelativeDate(entry.published_at)}
                    </time>
                    {entry.version_tag && (
                      <span className="inline-flex items-center rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-300">
                        {entry.version_tag}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                      <GitCommit className="h-3 w-3" />
                      {shortCommit(entry.commit_hash)}
                    </span>
                  </div>

                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute left-[13px] top-1.5 h-3.5 w-3.5 rounded-full border-2 md:left-[174px] ${
                      entry.has_breaking_changes
                        ? "border-rose-400 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                        : "border-indigo-400 bg-zinc-950"
                    }`}
                  />

                  {/* Release Card */}
                  <div
                    className={`flex-1 rounded-2xl border p-6 transition-all ${
                      entry.has_breaking_changes
                        ? "border-rose-500/35 bg-gradient-to-b from-rose-950/15 via-zinc-900/70 to-zinc-900/70"
                        : "border-zinc-800/90 bg-zinc-900/50"
                    }`}
                  >
                    {/* Breaking Warning Header if applicable */}
                    {entry.has_breaking_changes && (
                      <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-200">
                        <div className="flex items-center gap-2 font-medium">
                          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                          <span>
                            Breaking Schema Contract Change Detected by{" "}
                            <code className="font-mono font-semibold">oasdiff breaking</code>
                          </span>
                        </div>
                        <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider text-rose-300">
                          Action Required
                        </span>
                      </div>
                    )}

                    {/* Title & Summary */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h2 className="text-xl font-bold text-white">
                        {entry.title}
                      </h2>
                    </div>

                    <p className="mt-2.5 text-sm leading-relaxed text-zinc-300">
                      {entry.summary}
                    </p>

                    {/* Structured Route Changes Table */}
                    <div className="mt-6 space-y-2.5">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        Endpoint & Schema Operations ({entry.structured_changes.length})
                      </div>
                      <div className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800/90 bg-zinc-950/60">
                        {entry.structured_changes.map((item, idx) => (
                          <div
                            key={`${entry.id}-item-${idx}`}
                            className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="flex flex-wrap items-center gap-2.5 sm:w-72 shrink-0">
                              <SemanticTagBadge tag={item.tag} />
                              <EndpointPill endpoint={item.endpoint} />
                            </div>
                            <p className="flex-1 text-xs leading-relaxed text-zinc-300 sm:text-sm">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Commit Message + Raw oasdiff JSON Drawer Toggle */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 truncate max-w-xl">
                        <GitCommit className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span className="text-zinc-300">
                          {shortCommit(entry.commit_hash)}
                        </span>
                        {entry.commit_message && (
                          <span className="truncate text-zinc-500">
                            — {entry.commit_message}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleDiffDrawer(entry.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[11px] text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                      >
                        <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                        <span>
                          {isDiffOpen ? "Hide Raw oasdiff JSON" : "Inspect Raw oasdiff JSON"}
                        </span>
                      </button>
                    </div>

                    {isDiffOpen && (
                      <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-800 bg-[#050608] p-4">
                        <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span>Deterministic oasdiff payload stored in JSONB</span>
                          <span>commit: {entry.commit_hash}</span>
                        </div>
                        <pre className="text-xs font-mono text-indigo-200/90 leading-relaxed">
                          {JSON.stringify(entry.raw_diff, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
