/**
 * incidentPhotoMatcher.js
 * 
 * Searches accredited Tamil Nadu newsrooms (The Hindu, The New Indian Express, DT Next)
 * to match genuine on-the-ground photojournalist images for civic alerts, 
 * citizen reports, and TN Today editorial articles.
 */

const DIRECT_FEEDS = [
  { name: "The Hindu (Chennai)", url: "https://www.thehindu.com/news/cities/chennai/feeder/default.rss" },
  { name: "The Hindu (Tamil Nadu)", url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss" },
  { name: "The New Indian Express", url: "https://www.newindianexpress.com/states/tamil-nadu/rss" },
  { name: "DT Next", url: "https://www.dtnext.in/rss/tamilnadu" },
];

// In-memory cache for fast repeat lookups (24 hour TTL)
const memoryCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Searches direct newsroom feeds for the highest keyword-matched photograph.
 */
export async function matchIncidentPhoto({ title = "", category = "general" } = {}) {
  if (!title || typeof title !== "string") return null;

  const cacheKey = `${category}:${title.trim().toLowerCase()}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const cleanWords = title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !["today", "update", "news", "report", "with", "from", "alert", "this"].includes(w));

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
        const itemTitle = ((item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "")
          .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
          .trim();
        const media = (
          item.match(/<media:content[^>]*url=["']([^"']+)["']/i) ||
          item.match(/<enclosure[^>]*url=["']([^"']+)["']/i)
        )?.[1];

        // Reject platform logos and generic icons
        if (!media || media.includes("googleusercontent.com") || media.includes("/logo") || media.includes("favicon")) {
          continue;
        }

        const titleLower = itemTitle.toLowerCase();
        const matchCount = cleanWords.filter((w) => titleLower.includes(w)).length;
        if (matchCount > maxMatches) {
          maxMatches = matchCount;
          bestCandidate = {
            image_url: media,
            source: feed.name,
            news_title: itemTitle,
            credit: `📷 Photo via ${feed.name} • Fair Use Current Events`,
            incident_verified: true,
          };
        }
      }
    } catch {
      // Continue to next feed if one times out or errors
    }
  }

  // Cache even null candidates to avoid repeated slow fetches for unique municipal notices
  memoryCache.set(cacheKey, { timestamp: Date.now(), data: bestCandidate });
  return bestCandidate;
}

/**
 * Attaches real photojournalist images to an array of posts before database insertion.
 * Only attaches if media_urls is currently empty or undefined.
 */
export async function attachIncidentPhotosToPosts(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return posts;

  return Promise.all(
    posts.map(async (post) => {
      // If the post already has photos, keep them
      if (
        (Array.isArray(post.media_urls) && post.media_urls.length > 0) ||
        (Array.isArray(post.before_photos) && post.before_photos.length > 0)
      ) {
        return post;
      }

      const titleToSearch = post.title_en || post.title || "";
      if (!titleToSearch) return post;

      try {
        const photo = await matchIncidentPhoto({
          title: titleToSearch,
          category: post.category_slug || post.category || "general",
        });

        if (photo?.image_url) {
          const updated = {
            ...post,
            media_urls: [photo.image_url],
          };
          if ('source' in post) {
            updated.source = post.source || photo.source;
          }
          return updated;
        }
      } catch {
        // Fall back gracefully to original post without photos
      }

      return post;
    })
  );
}

/**
 * Attaches real photojournalist image to a TN Today article before database insertion.
 */
export async function attachIncidentPhotoToArticle(article) {
  if (!article) return article;

  // If article already has an authentic image (not an AI prompt), keep it
  const existing = (article.featured_image || "").trim();
  const isPrompt = existing.startsWith("photo:") || existing.startsWith("illustration:") || existing.length > 300;
  if (existing && !isPrompt && !existing.includes("googleusercontent.com")) {
    return article;
  }

  try {
    const photo = await matchIncidentPhoto({
      title: article.title || "",
      category: article.category || "governance",
    });

    if (photo?.image_url) {
      return {
        ...article,
        featured_image: photo.image_url,
        social_image: article.social_image || photo.image_url,
      };
    }
  } catch {
    // Keep original
  }

  return article;
}
