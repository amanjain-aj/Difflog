import { NextRequest, NextResponse } from "next/server";
import {
  deleteChangelogEntry,
  listChangelogEntries,
  updateChangelogEntry,
} from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const entries = await listChangelogEntries(params.id);
  return NextResponse.json({ entries });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { entryId, title, summary, is_published, version_tag } = body ?? {};
    if (!entryId) {
      return NextResponse.json(
        { error: "entryId is required" },
        { status: 400 }
      );
    }
    const updated = await updateChangelogEntry(entryId, {
      title,
      summary,
      is_published,
      version_tag,
    });
    if (!updated) {
      return NextResponse.json(
        { error: "Changelog entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ entry: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get("entryId");
  if (!entryId) {
    return NextResponse.json(
      { error: "entryId query param is required" },
      { status: 400 }
    );
  }
  const deleted = await deleteChangelogEntry(entryId);
  return NextResponse.json({ deleted });
}
