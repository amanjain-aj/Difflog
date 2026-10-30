import { NextRequest, NextResponse } from "next/server";
import {
  createProject,
  getDefaultOrganization,
  getStorageMode,
  listChangelogEntries,
  listProjects,
  rotateProjectApiKey,
} from "@/lib/db";

export async function GET() {
  const [organization, projects] = await Promise.all([
    getDefaultOrganization(),
    listProjects(),
  ]);

  const projectsWithEntries = await Promise.all(
    projects.map(async (project) => {
      const entries = await listChangelogEntries(project.id);
      return {
        ...project,
        entries,
      };
    })
  );

  return NextResponse.json({
    storage_mode: getStorageMode(),
    groq_configured: Boolean(
      process.env.GROQ_API_KEY &&
        process.env.GROQ_API_KEY.trim() !== "" &&
        process.env.GROQ_API_KEY.trim() !== "gsk_..."
    ),
    organization,
    projects: projectsWithEntries,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, projectId, name, slug, custom_domain } = body ?? {};

    if (action === "rotate_key") {
      if (!projectId) {
        return NextResponse.json(
          { error: "projectId is required to rotate an API key." },
          { status: 400 }
        );
      }
      const rotated = await rotateProjectApiKey(projectId);
      if (!rotated) {
        return NextResponse.json(
          { error: "Project not found." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        project: rotated.project,
        rawApiKey: rotated.rawApiKey,
      });
    }

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Both project name and slug are required." },
        { status: 400 }
      );
    }

    const created = await createProject({
      name,
      slug,
      custom_domain: custom_domain || null,
      is_public: true,
    });

    return NextResponse.json(
      {
        project: created.project,
        rawApiKey: created.rawApiKey,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create/update project",
      },
      { status: 400 }
    );
  }
}
