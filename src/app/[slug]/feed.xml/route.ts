import { NextRequest } from "next/server";
import { buildRssFeedResponse } from "@/lib/rss";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  return buildRssFeedResponse(params.slug);
}
