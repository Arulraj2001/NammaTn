import { supabase } from "@/api/supabaseClient";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";
import { isPubliclyVisible as sharedVisibilityGuard, isSafePublicListing } from "@/lib/visibility";

/**
 * Normalize a civic receipt ID for fuzzy matching.
 */
export const normalizeCivicId = (q) => {
  if (!q) return null;
  const stripped = q.replace(/[\s]/g, "").toUpperCase();
  if (/^TN-[A-Z0-9]+$/.test(stripped)) return stripped;
  const match = stripped.match(/^TN([A-Z0-9]+)$/);
  if (match) return `TN-${match[1]}`;
  return null;
};

/** Public visibility guard — re-exported from shared lib */
export const isPubliclyVisible = sharedVisibilityGuard;

/**
 * Main search across posts.
 * Returns { civicMatch: Post|null, results: Post[] }
 */
export const searchPosts = async (query, {
  type = "all",
  district = "all",
  category = "all",
  civicStatus = "all",
  sort = "-created_date"
} = {}) => {
  let dbQuery = supabase.from("post").select("*").eq("status", "active");
  if (type && type !== "all") dbQuery = dbQuery.eq("post_type", type);
  if (district && district !== "all") dbQuery = dbQuery.eq("district_slug", district);
  if (category && category !== "all") dbQuery = dbQuery.eq("category_slug", category);

  const orderCol = sort.startsWith("-") ? sort.substring(1) : sort;
  const ascending = !sort.startsWith("-");
  dbQuery = dbQuery.order(orderCol, { ascending });

  const { data: raw, error } = await dbQuery.limit(300);
  if (error) throw error;

  const posts = raw.filter(isPubliclyVisible);

  // Civic Receipt ID exact match
  let civicMatch = null;
  const normalizedId = normalizeCivicId(query);
  if (normalizedId) {
    civicMatch = posts.find((p) =>
      p.civic_receipt_id === normalizedId ||
      (p.civic_receipt_id || "").toUpperCase() === normalizedId
    ) || null;

    if (!civicMatch) {
      const { data: direct, error: directError } = await supabase
        .from("post")
        .select("*")
        .eq("civic_receipt_id", normalizedId)
        .order("created_date", { ascending: false })
        .limit(1);
      if (!directError && direct?.[0] && isPubliclyVisible(direct[0])) {
        civicMatch = direct[0];
      }
    }

    if (!civicMatch) {
      const partialQ = normalizedId.replace("TN-", "").toLowerCase();
      civicMatch = posts.find((p) =>
        p.civic_receipt_id && p.civic_receipt_id.toLowerCase().includes(partialQ)
      ) || null;
    }
  }

  if (!query || query.trim().length < 2) {
    const filtered = applyCivicStatusFilter(posts, civicStatus);
    return { civicMatch: null, results: filtered.slice(0, 50) };
  }

  const q = query.trim().toLowerCase();

  const results = posts.filter((p) => {
    if (!applyCivicStatusFilter([p], civicStatus).length) return false;
    const fields = [
      p.title_en, p.title_ta, p.content_en, p.content_ta,
      p.district_name, p.area_name, p.category_name,
      p.civic_receipt_id, p.official_complaint_id, p.location_text,
      p.author_name,
    ].map((f) => (f || "").toLowerCase());
    return fields.some((f) => f.includes(q));
  });

  return { civicMatch, results };
};

function applyCivicStatusFilter(posts, civicStatus) {
  if (!civicStatus || civicStatus === "all") return posts;
  if (civicStatus === "has_complaint") return posts.filter((p) => !!p.official_complaint_id);
  if (civicStatus === "no_complaint") return posts.filter((p) => !p.official_complaint_id && p.civic_receipt_id);
  if (civicStatus === "civic_only") return posts.filter((p) => !!p.civic_receipt_id);
  return posts.filter((p) => p.civic_status === civicStatus);
}

/** Search scam alerts */
export const searchScams = async (query) => {
  const { data: items, error } = await supabase
    .from("scam_alert")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(50);
  if (error) return [];

  if (!query || query.trim().length < 2) return items.slice(0, 10);
  const q = query.toLowerCase();
  return items.filter((s) =>
    (s.title || "").toLowerCase().includes(q) ||
    (s.description || "").toLowerCase().includes(q) ||
    (s.district_name || "").toLowerCase().includes(q) ||
    (s.area_name || "").toLowerCase().includes(q)
  );
};

/** Public safety guard for Jobs/Stay/Listings */
const isSafeForPublic = isSafePublicListing;

/** Search job alerts */
export const searchJobs = async (query) => {
  const { data: items, error } = await supabase
    .from("job_alert")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(80);
  if (error) return [];

  const safe = items.filter(isSafeForPublic);
  if (!query || query.trim().length < 2) return safe.slice(0, 10);
  const q = query.toLowerCase();
  return safe.filter((j) =>
    (j.title || "").toLowerCase().includes(q) ||
    (j.district_name || "").toLowerCase().includes(q) ||
    (j.description || "").toLowerCase().includes(q) ||
    (j.company_or_poster_name || "").toLowerCase().includes(q)
  );
};

/** Search stay listings */
export const searchStay = async (query) => {
  const { data: items, error } = await supabase
    .from("stay_listing")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(80);
  if (error) return [];

  const safe = items.filter(isSafeForPublic);
  if (!query || query.trim().length < 2) return safe.slice(0, 10);
  const q = query.toLowerCase();
  return safe.filter((s) =>
    (s.title || "").toLowerCase().includes(q) ||
    (s.district_name || "").toLowerCase().includes(q) ||
    (s.area_name || "").toLowerCase().includes(q) ||
    (s.landmark || "").toLowerCase().includes(q)
  );
};

/** Search local listings */
export const searchListings = async (query) => {
  const { data: items, error } = await supabase
    .from("local_listing")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(80);
  if (error) return [];

  const safe = items.filter((l) => isSafeForPublic(l) && l.is_publicly_visible !== false);
  if (!query || query.trim().length < 2) return safe.slice(0, 10);
  const q = query.toLowerCase();
  return safe.filter((l) =>
    (l.business_name || "").toLowerCase().includes(q) ||
    (l.district_name || "").toLowerCase().includes(q) ||
    (l.area_name || "").toLowerCase().includes(q) ||
    (l.description || "").toLowerCase().includes(q)
  );
};

/** Search community discussions */
export const searchDiscussions = async (query) => {
  const { data: items, error } = await supabase
    .from("community_discussion")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(50);
  if (error) return [];

  const visible = items.filter((d) => d.status !== "removed" && d.status !== "hidden");
  if (!query || query.trim().length < 2) return visible.slice(0, 10);
  const q = query.toLowerCase();
  return visible.filter((d) =>
    (d.title || "").toLowerCase().includes(q) ||
    (d.content || "").toLowerCase().includes(q) ||
    (d.district_name || "").toLowerCase().includes(q)
  );
};

export const getSearchSuggestions = (query) => {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase();
  const districtHits = DISTRICTS.filter(
    (d) => d.name_en.toLowerCase().includes(q) || (d.name_ta || "").includes(q)
  ).slice(0, 3).map((d) => ({ type: "district", label: d.name_en, slug: d.slug }));

  const catHits = CATEGORIES.filter(
    (c) => c.name_en.toLowerCase().includes(q) || (c.name_ta || "").includes(q)
  ).slice(0, 3).map((c) => ({ type: "category", label: c.name_en, icon: c.icon, slug: c.slug }));

  return [...districtHits, ...catHits];
};

const RECENT_SEARCHES_KEY = "tn_recent_searches";
export const getRecentSearches = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]"); }
  catch { return []; }
};
export const addRecentSearch = (term) => {
  if (!term?.trim()) return;
  const existing = getRecentSearches().filter((s) => s !== term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([term, ...existing].slice(0, 6)));
};
export const clearRecentSearches = () => localStorage.removeItem(RECENT_SEARCHES_KEY);