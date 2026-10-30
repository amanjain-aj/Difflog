"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  GitCommit,
  KeyRound,
  Plus,
  RefreshCw,
  Rss,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { EndpointPill, SemanticTagBadge } from "@/components/changelog/badges";
import { ChangelogEntry, Organization, Project } from "@/lib/db/types";
import { formatRelativeDate, shortCommit } from "@/lib/utils";
import { DEMO_ACME_RAW_API_KEY } from "@/lib/crypto/api-keys";

interface ProjectWithEntries extends Project {
  entries: ChangelogEntry[];
}

export default function AdminDashboardPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<ProjectWithEntries[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [storageMode, setStorageMode] = useState<string>("local-json");
  const [groqConfigured, setGroqConfigured] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // New project modal / drawer state
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  // Newly generated raw API key banner (shown once on creation/rotation)
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  // Entry editor state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editVersionTag, setEditVersionTag] = useState("");
  const [savingEntry, setSavingEntry] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      setOrganization(data.organization);
      setProjects(data.projects || []);
      setStorageMode(data.storage_mode || "local-json");
      setGroqConfigured(Boolean(data.groq_configured));
      if (!selectedProjectId && data.projects?.length > 0) {
        setSelectedProjectId(data.projects[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectSlug.trim()) return;
    setCreatingProject(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          slug: newProjectSlug,
        }),
      });
      const data = await res.json();
      if (res.ok && data.project) {
        setRevealedApiKey(data.rawApiKey);
        setNewProjectName("");
        setNewProjectSlug("");
        await fetchDashboardData();
        setSelectedProjectId(data.project.id);
      } else {
        alert(data.error || "Failed to create project");
      }
    } finally {
      setCreatingProject(false);
    }
  };

  const handleRotateApiKey = async (projectId: string) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "rotate_key",
        projectId,
      }),
    });
    const data = await res.json();
    if (res.ok && data.rawApiKey) {
      setRevealedApiKey(data.rawApiKey);
      await fetchDashboardData();
    }
  };

  const startEditingEntry = (entry: ChangelogEntry) => {
    setEditingEntryId(entry.id);
    setEditTitle(entry.title);
    setEditSummary(entry.summary);
    setEditVersionTag(entry.version_tag || "");
  };

  const saveEntryEdits = async (entry: ChangelogEntry) => {
    setSavingEntry(true);
    try {
      const res = await fetch(`/api/projects/${entry.project_id}/entries`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: entry.id,
          title: editTitle,
          summary: editSummary,
          version_tag: editVersionTag || null,
        }),
      });
      if (res.ok) {
        setEditingEntryId(null);
        await fetchDashboardData();
      }
    } finally {
      setSavingEntry(false);
    }
  };

  const togglePublishStatus = async (entry: ChangelogEntry) => {
    await fetch(`/api/projects/${entry.project_id}/entries`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entryId: entry.id,
        is_published: !entry.is_published,
      }),
    });
    await fetchDashboardData();
  };

  const handleDeleteEntry = async (entry: ChangelogEntry) => {
    await fetch(
      `/api/projects/${entry.project_id}/entries?entryId=${entry.id}`,
      {
        method: "DELETE",
      }
    );
    await fetchDashboardData();
  };

  const workflowSnippet = `name: DiffLog API Changelog
on:
  push:
    branches: [main]

jobs:
  sync-openapi-changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - name: Run DiffLog OpenAPI Diff & Ingest
        uses: difflog/action@v1
        with:
          api_key: \${{ secrets.DIFFLOG_API_KEY }}
          spec_path: "openapi.yaml"
          version_tag: "v\${{ github.run_number }}.0"`;

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100">
      <DashboardNav />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Status Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="text-xs text-zinc-400">Organization</div>
              <div className="font-semibold text-white">
                {organization?.name || "Loading..."}
              </div>
            </div>
            <span className="h-6 w-px bg-zinc-800" />
            <div>
              <div className="text-xs text-zinc-400">Plan Tier</div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase text-indigo-400">
                <span>{organization?.plan_tier || "starter"}</span>
                <Link
                  href="/dashboard/billing"
                  className="text-[11px] underline text-zinc-400 hover:text-white"
                >
                  (Manage)
                </Link>
              </div>
            </div>
            <span className="h-6 w-px bg-zinc-800" />
            <div>
              <div className="text-xs text-zinc-400">Database Adapter</div>
              <div className="font-mono text-xs text-emerald-400">
                {storageMode === "supabase"
                  ? "Supabase PostgreSQL (RLS Active)"
                  : "Local Persistent Store (.data/specsync-db.json)"}
              </div>
            </div>
            <span className="h-6 w-px bg-zinc-800" />
            <div>
              <div className="text-xs text-zinc-400">
                Groq Summarizer Status
              </div>
              <div
                className={`font-mono text-xs ${
                  groqConfigured ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {groqConfigured
                  ? "Live GROQ_API_KEY Active"
                  : "Requires GROQ_API_KEY in .env.local for /api/v1/ingest"}
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/simulator"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Test Live Groq Ingestion</span>
          </Link>
        </div>

        {/* Newly Generated Raw API Key Alert */}
        {revealedApiKey && (
          <div className="mb-8 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <KeyRound className="h-4 w-4" />
                  <span>
                    New Project API Key Generated — Copy Now (Stored as SHA-256
                    Hash)
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-300">
                  Add this key as{" "}
                  <code className="font-mono text-emerald-200">
                    DIFFLOG_API_KEY
                  </code>{" "}
                  in your repository&apos;s GitHub Actions secrets.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="rounded-lg border border-emerald-500/30 bg-zinc-950 px-3 py-1.5 font-mono text-xs text-emerald-300">
                  {revealedApiKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(revealedApiKey);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
                >
                  {copiedKey ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Projects List + Create Project Form */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                API Projects ({projects.length})
              </h2>
              <div className="mt-4 space-y-2">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                      activeProject?.id === proj.id
                        ? "border-indigo-500/60 bg-indigo-950/25"
                        : "border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        {proj.name}
                      </span>
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                        {proj.entries.length} releases
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between font-mono text-xs text-zinc-400">
                      <span>/{proj.slug}</span>
                      <span className="text-[11px] text-emerald-400">
                        Public Portal
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Create Project Form */}
              <form
                onSubmit={handleCreateProject}
                className="mt-6 border-t border-zinc-800/80 pt-5 space-y-3"
              >
                <div className="text-xs font-semibold text-zinc-300">
                  Create New API Project
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => {
                      setNewProjectName(e.target.value);
                      if (!newProjectSlug) {
                        setNewProjectSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                        );
                      }
                    }}
                    placeholder="Project Name (e.g. Billing V2 API)"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={newProjectSlug}
                    onChange={(e) => setNewProjectSlug(e.target.value)}
                    placeholder="Portal Slug (e.g. billing-v2)"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-white disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>
                    {creatingProject
                      ? "Provisioning Portal..."
                      : "Create Project & Generate Key"}
                  </span>
                </button>
              </form>
            </div>

            {/* GitHub Composite Action Quickstart Card */}
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  GitHub Action Setup (.github/workflows/difflog.yml)
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(workflowSnippet);
                    setCopiedWorkflow(true);
                    setTimeout(() => setCopiedWorkflow(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {copiedWorkflow ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy YAML</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
                {workflowSnippet}
              </pre>
            </div>
          </div>

          {/* Right Column: Active Project API Keys & Release History Editor */}
          <div className="space-y-6 lg:col-span-8">
            {loading && !activeProject ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center text-sm text-zinc-400">
                Loading project configuration...
              </div>
            ) : activeProject ? (
              <>
                {/* Project Header & API Key Rotation */}
                <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-bold text-white">
                          {activeProject.name}
                        </h1>
                        <Link
                          href={`/${activeProject.slug}`}
                          className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-300 hover:bg-indigo-500/20"
                        >
                          <span>/{activeProject.slug}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <a
                          href={`/${activeProject.slug}/rss.xml`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-xs text-amber-300 hover:bg-amber-500/20"
                        >
                          <Rss className="h-3 w-3" />
                          <span>rss.xml</span>
                        </a>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        SHA-256 Key Hash:{" "}
                        <code className="font-mono text-zinc-300">
                          {activeProject.api_key_hash.slice(0, 24)}...
                        </code>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {activeProject.slug === "acme-payments" && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              DEMO_ACME_RAW_API_KEY
                            );
                            setRevealedApiKey(DEMO_ACME_RAW_API_KEY);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          <span>Reveal Demo Key</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleRotateApiKey(activeProject.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Rotate API Key</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Changelog Entries Management List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                      Synced Release Entries ({activeProject.entries.length})
                    </h2>
                    <span className="text-xs text-zinc-500">
                      Edit Markdown summaries or toggle public visibility
                    </span>
                  </div>

                  {activeProject.entries.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-10 text-center">
                      <AlertCircle className="mx-auto h-8 w-8 text-zinc-600" />
                      <p className="mt-2 text-sm font-medium text-zinc-300">
                        No releases ingested for this project yet.
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Use the{" "}
                        <Link
                          href="/dashboard/simulator"
                          className="text-indigo-400 underline"
                        >
                          CI Ingestion Simulator
                        </Link>{" "}
                        or push an OpenAPI change via GitHub Actions.
                      </p>
                    </div>
                  ) : (
                    activeProject.entries.map((entry) => {
                      const isEditing = editingEntryId === entry.id;

                      return (
                        <div
                          key={entry.id}
                          className="rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3.5">
                            <div className="flex flex-wrap items-center gap-2">
                              {entry.version_tag && (
                                <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-300">
                                  {entry.version_tag}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400">
                                <GitCommit className="h-3.5 w-3.5" />
                                {shortCommit(entry.commit_hash)}
                              </span>
                              <span className="text-xs text-zinc-500">
                                • {formatRelativeDate(entry.published_at)}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  entry.is_published
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : "bg-zinc-800 text-zinc-400"
                                }`}
                              >
                                {entry.is_published ? "Published" : "Draft / Hidden"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => togglePublishStatus(entry)}
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 hover:border-zinc-700"
                              >
                                {entry.is_published ? (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
                                    <span>Unpublish</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Publish</span>
                                  </>
                                )}
                              </button>

                              {!isEditing ? (
                                <button
                                  onClick={() => startEditingEntry(entry)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 hover:border-zinc-700"
                                >
                                  <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                                  <span>Edit Markdown</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => saveEntryEdits(entry)}
                                  disabled={savingEntry}
                                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                  <span>
                                    {savingEntry ? "Saving..." : "Save"}
                                  </span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteEntry(entry)}
                                className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-400 hover:border-rose-500/40 hover:text-rose-400"
                                title="Delete Entry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="mt-4 space-y-3">
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                <div className="sm:col-span-3">
                                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Release Headline
                                  </label>
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) =>
                                      setEditTitle(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Version Tag
                                  </label>
                                  <input
                                    type="text"
                                    value={editVersionTag}
                                    onChange={(e) =>
                                      setEditVersionTag(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                  Markdown Summary
                                </label>
                                <textarea
                                  rows={3}
                                  value={editSummary}
                                  onChange={(e) =>
                                    setEditSummary(e.target.value)
                                  }
                                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4">
                              <h3 className="text-base font-bold text-white">
                                {entry.title}
                              </h3>
                              <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                                {entry.summary}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {entry.structured_changes.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1"
                                  >
                                    <SemanticTagBadge tag={item.tag} />
                                    <EndpointPill endpoint={item.endpoint} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
