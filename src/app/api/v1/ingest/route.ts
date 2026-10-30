import { NextRequest, NextResponse } from "next/server";
import {
  createChangelogEntry,
  getProjectByApiKey,
  listChangelogEntries,
} from "@/lib/db";
import { summarizeOpenApiDiff } from "@/lib/llm/summarizer";
import { dispatchReleaseNotifications } from "@/lib/webhooks/dispatcher";

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Bearer API Key
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "Missing or malformed Authorization header. Expected 'Authorization: Bearer <API_KEY>'.",
        },
        { status: 401 }
      );
    }

    const rawApiKey = authHeader.slice(7).trim();
    if (!rawApiKey) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Empty Bearer token provided.",
        },
        { status: 401 }
      );
    }

    const authContext = await getProjectByApiKey(rawApiKey);
    if (!authContext) {
      return NextResponse.json(
        {
          error: "Invalid API Key",
          message:
            "No SpecSync project matched the provided API key hash. Verify your API key in the Admin Dashboard.",
        },
        { status: 401 }
      );
    }

    const { project, organization } = authContext;

    // 2. Validate Organization Quota
    const existingEntries = await listChangelogEntries(project.id);
    const quotaLimit =
      organization.plan_tier === "scale"
        ? 10000
        : organization.plan_tier === "growth"
        ? 1000
        : 250;

    if (existingEntries.length >= quotaLimit) {
      return NextResponse.json(
        {
          error: "Quota Exceeded",
          message: `Organization '${organization.name}' has reached its ${organization.plan_tier} plan changelog entry limit (${quotaLimit}). Upgrade in Billing.`,
        },
        { status: 429 }
      );
    }

    // 3. Parse incoming oasdiff payload
    const body = await req.json();
    const {
      commit_hash,
      commit_message,
      version_tag,
      diff,
      breaking,
      is_published = true,
    } = body ?? {};

    if (!commit_hash || typeof commit_hash !== "string") {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Field 'commit_hash' (string) is required in the ingestion payload.",
        },
        { status: 400 }
      );
    }

    if (diff === undefined || diff === null) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message:
            "Field 'diff' (JSON output from `oasdiff changelog`) is required in the ingestion payload.",
        },
        { status: 400 }
      );
    }

    // 4. Summarize via live OpenAI API with strict JSON Schema enforcement
    const structuredRelease = await summarizeOpenApiDiff({
      commit_hash,
      commit_message,
      version_tag,
      diff,
      breaking,
    });

    // 5. Store entry in Supabase / Database
    const entry = await createChangelogEntry({
      project_id: project.id,
      commit_hash,
      commit_message: commit_message || null,
      title: structuredRelease.title,
      summary: structuredRelease.summary,
      has_breaking_changes: structuredRelease.has_breaking_changes,
      raw_diff: {
        diff,
        breaking: breaking || [],
      },
      structured_changes: structuredRelease.items,
      version_tag: version_tag || null,
      is_published: Boolean(is_published),
    });

    // 6. Emit outbound Slack/Discord release notifications if published
    const notifications = entry.is_published
      ? await dispatchReleaseNotifications(project, entry)
      : { slackSent: false, discordSent: false };

    return NextResponse.json(
      {
        status: "ingested",
        project: {
          id: project.id,
          name: project.name,
          slug: project.slug,
          portal_url: `/${project.slug}`,
          rss_url: `/${project.slug}/rss.xml`,
        },
        entry,
        notifications,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorObj = err as Error & { code?: string; status?: number };
    if (errorObj.code === "MISSING_GROQ_API_KEY") {
      return NextResponse.json(
        {
          error: "Groq API Key Required",
          code: "MISSING_GROQ_API_KEY",
          message: errorObj.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Ingestion Failed",
        message:
          errorObj?.message ||
          "An unexpected error occurred while processing the OpenAPI diff.",
      },
      { status: errorObj?.status || 500 }
    );
  }
}
