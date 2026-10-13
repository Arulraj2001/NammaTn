import { NextResponse } from "next/server";

/**
 * GET /api/incident-image
 * Stock image & external newsroom feed scraping has been permanently disabled.
 */
export async function GET() {
  return NextResponse.json({ error: "External stock image scraping disabled" }, { status: 404 });
}

