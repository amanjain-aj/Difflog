import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  listChangelogEntries,
  listProjects,
} from "@/lib/db";
import { PublicPortalClient } from "@/components/changelog/public-portal-client";

export const dynamic = "force-dynamic";

export default async function ProjectChangelogPortalPage({
  params,
}: {
  params: { slug: string };
}) {
  const [project, allProjects] = await Promise.all([
    getProjectBySlug(params.slug),
    listProjects(),
  ]);

  if (!project || !project.is_public) {
    notFound();
  }

  const entries = await listChangelogEntries(project.id, {
    publishedOnly: true,
  });

  return (
    <PublicPortalClient
      project={project}
      entries={entries}
      allProjects={allProjects.filter((p) => p.is_public)}
    />
  );
}
