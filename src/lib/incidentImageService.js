/**
 * Client service to fetch real incident photographs and authorized press credits
 */

const clientCache = new Map();

export async function fetchIncidentImage(query, category = "general") {
  if (!query || typeof query !== "string") return null;

  const cacheKey = `${category}:${query.trim().toLowerCase()}`;
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey);
  }

  try {
    const res = await fetch(`/api/incident-image?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.image_url) {
      clientCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn("Failed to fetch incident image:", err);
  }
  return null;
}
