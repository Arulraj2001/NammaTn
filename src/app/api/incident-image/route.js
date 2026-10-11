import { NextResponse } from "next/server";
import { matchIncidentPhoto } from "@/lib/incidentPhotoMatcher";

/**
 * GET /api/incident-image?q={query}&category={category}
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const category = searchParams.get("category") || "general";

    if (!rawQuery.trim()) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    const photo = await matchIncidentPhoto({
      title: rawQuery,
      category,
    });

    if (photo) {
      return NextResponse.json(photo, {
        headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
      });
    }

    return NextResponse.json({ error: "No direct incident photo found" }, { status: 404 });
  } catch (err) {
    console.error("Error in /api/incident-image:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
