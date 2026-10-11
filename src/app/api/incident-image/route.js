import { NextResponse } from "next/server";

// In-memory cache for fast repeat lookups (24 hour TTL)
const memoryCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Accredited direct newsroom feeds with direct editorial photos
const DIRECT_FEEDS = [
  { name: "The Hindu (Chennai)", url: "https://www.thehindu.com/news/cities/chennai/feeder/default.rss" },
  { name: "The Hindu (Tamil Nadu)", url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss" },
  { name: "The New Indian Express", url: "https://www.newindianexpress.com/states/tamil-nadu/rss" },
  { name: "DT Next", url: "https://www.dtnext.in/rss/tamilnadu" },
];

/**
 * Searches direct Tamil Nadu newsroom RSS feeds for real incident photos
 */
async function searchDirectNewsFeeds(query) {
  const cleanWords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !["today", "update", "news", "report", "with", "from", "alert"].includes(w));

  if (cleanWords.length === 0) return null;

  let bestCandidate = null;
  let maxMatches = 0;

  for (const feed of DIRECT_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 1800 },
      });

      if (!res.ok) continue;
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const item of items) {
        const title = ((item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "").replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
        const media = (
          item.match(/<media:content[^>]*url=["']([^"']+)["']/i) ||
          item.match(/<enclosure[^>]*url=["']([^"']+)["']/i)
        )?.[1];

        // Reject platform logos
        if (!media || media.includes("googleusercontent.com") || media.includes("/logo") || media.includes("favicon")) {
          continue;
        }

        const titleLower = title.toLowerCase();
        const matchCount = cleanWords.filter((w) => titleLower.includes(w)).length;
        if (matchCount > maxMatches) {
          maxMatches = matchCount;
          bestCandidate = {
            image_url: media,
            source: feed.name,
            news_title: title,
            credit: `📷 Photo via ${feed.name} • Fair Use Current Events`,
            incident_verified: true,
          };
        }
      }
    } catch {
      // Continue to next feed
    }
  }

  return bestCandidate;
}

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

    const cacheKey = `${category}:${rawQuery.trim().toLowerCase()}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
      });
    }

    // 1. Search direct newsroom feeds first
    const directResult = await searchDirectNewsFeeds(rawQuery);
    if (directResult) {
      memoryCache.set(cacheKey, { timestamp: Date.now(), data: directResult });
      return NextResponse.json(directResult, {
        headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
      });
    }

    return NextResponse.json({ error: "No direct incident photo found" }, { status: 404 });
  } catch (err) {
    console.error("Error in /api/incident-image:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
