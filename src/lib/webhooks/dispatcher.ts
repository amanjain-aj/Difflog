import { ChangelogEntry, Project } from "@/lib/db/types";

/**
 * Dispatches outbound webhook notifications (Slack & Discord) when a new
 * API changelog entry is ingested and published.
 */
export async function dispatchReleaseNotifications(
  project: Project,
  entry: ChangelogEntry
): Promise<{ slackSent: boolean; discordSent: boolean }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const portalUrl = `${appUrl}/${project.slug}#${entry.id}`;

  let slackSent = false;
  let discordSent = false;

  const slackUrl = process.env.SLACK_WEBHOOK_URL?.trim();
  if (slackUrl) {
    try {
      const res = await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${
            entry.has_breaking_changes ? "🚨 *[BREAKING API CHANGE]*" : "🚀 *New API Release*"
          } *${project.name}* (${entry.version_tag || entry.commit_hash.slice(0, 7)})\n*${
            entry.title
          }*\n${entry.summary}\n<${portalUrl}|View full changelog on DiffLog>`,
        }),
      });
      slackSent = res.ok;
    } catch {
      slackSent = false;
    }
  }

  const discordUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (discordUrl) {
    try {
      const res = await fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `**${
            entry.has_breaking_changes ? "🚨 [BREAKING] " : "🚀 "
          }${project.name} — ${entry.title}**\n${entry.summary}\n${portalUrl}`,
        }),
      });
      discordSent = res.ok;
    } catch {
      discordSent = false;
    }
  }

  return { slackSent, discordSent };
}
