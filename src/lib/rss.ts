import { NextResponse } from "next/server";
import { getProjectBySlug, listChangelogEntries } from "@/lib/db";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function buildRssFeedResponse(slug: string): Promise<NextResponse> {
  const project = await getProjectBySlug(slug);
  if (!project || !project.is_public) {
    return new NextResponse("Project feed not found", { status: 404 });
  }

  const entries = await listChangelogEntries(project.id, {
    publishedOnly: true,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const portalUrl = `${appUrl}/${project.slug}`;
  const feedUrl = `${appUrl}/${project.slug}/rss.xml`;
  const lastBuildDate =
    entries.length > 0
      ? new Date(entries[0].published_at).toUTCString()
      : new Date().toUTCString();

  const itemsXml = entries
    .map((entry) => {
      const entryUrl = `${portalUrl}#${entry.id}`;
      const pubDate = new Date(entry.published_at).toUTCString();
      const changeBullets = entry.structured_changes
        .map(
          (item) =>
            `<li><strong>[${escapeXml(item.tag)}]</strong> <code>${escapeXml(
              item.endpoint
            )}</code> — ${escapeXml(item.description)}</li>`
        )
        .join("");

      const htmlDescription = `<p>${escapeXml(entry.summary)}</p><ul>${changeBullets}</ul>`;

      return `
    <item>
      <title>${escapeXml(
        `${entry.version_tag ? `[${entry.version_tag}] ` : ""}${
          entry.has_breaking_changes ? "[BREAKING] " : ""
        }${entry.title}`
      )}</title>
      <link>${escapeXml(entryUrl)}</link>
      <guid isPermaLink="true">${escapeXml(entryUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${
        entry.has_breaking_changes ? "BREAKING_CHANGE" : "API_RELEASE"
      }</category>
      <description><![CDATA[${htmlDescription}]]></description>
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(project.name)} — API Changelog (DiffLog)</title>
    <link>${escapeXml(portalUrl)}</link>
    <description>Deterministic OpenAPI schema changelog and breaking change feed for ${escapeXml(
      project.name
    )}.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(
      feedUrl
    )}" rel="self" type="application/rss+xml" />${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
