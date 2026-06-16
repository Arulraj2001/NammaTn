import { supabase } from "@/api/supabaseClient";
import { isPubliclyVisible } from "@/lib/visibility";

// Engagement score = upvotes*2 + comments*3 + recency_bonus
const engagementScore = (post) => {
  const ageHours = (Date.now() - new Date(post.created_date).getTime()) / 3600000;
  const recency = Math.max(0, 1 - ageHours / 168); // decay over 7 days
  return (post.upvotes || 0) * 2 + (post.comment_count || 0) * 3 + recency * 20;
};

// Map date tab to cutoff timestamp
const getDateCutoff = (dateRange) => {
  const now = Date.now();
  if (dateRange === "today") return now - 24 * 3600 * 1000;
  if (dateRange === "week") return now - 7 * 24 * 3600 * 1000;
  if (dateRange === "month") return now - 30 * 24 * 3600 * 1000;
  return 0; // "all"
};

// Compute trending reason label
const getTrendingReason = (post) => {
  if ((post.verification_count || 0) >= 10) return "Highly Verified";
  if ((post.upvotes || 0) >= 20) return "Most Voted";
  if ((post.comment_count || 0) >= 10) return "Hot Discussion";
  if ((post.still_not_fixed_count || 0) >= 5) return "Urgent — Not Fixed";
  if (post.civic_status === "unresolved_escalated") return "Escalated";
  if (post.civic_status === "citizen_verified_fixed") return "Resolved";
  return null;
};

/**
 * Get trending posts with optional filters.
 * @param {number} limit
 * @param {{ district?: string, category?: string, civicOnly?: boolean, dateRange?: string }} options
 */
export const getTrendingPosts = async (limit = 10, options = {}) => {
  const { district = "all", category = "all", civicOnly = false, dateRange = "week" } = options;

  let query = supabase.from("post").select("*").eq("status", "active");
  if (district && district !== "all") query = query.eq("district_slug", district);
  if (category && category !== "all") query = query.eq("category_slug", category);

  const { data: raw, error } = await query.order("created_date", { ascending: false }).limit(200);
  if (error) throw error;

  const cutoff = getDateCutoff(dateRange);

  const posts = raw
    .filter(isPubliclyVisible)
    .filter((p) => civicOnly ? !!p.civic_receipt_id : true)
    .filter((p) => {
      if (!cutoff) return true;
      return new Date(p.created_date).getTime() >= cutoff;
    });

  return posts
    .map((p) => ({ ...p, _score: engagementScore(p), _reason: getTrendingReason(p) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
};

export const getTrendingDistricts = async () => {
  const { data: posts, error } = await supabase
    .from("post")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(300);
  if (error) throw error;

  const visible = posts.filter(isPubliclyVisible);
  const districtMap = {};
  visible.forEach((p) => {
    if (!p.district_slug) return;
    if (!districtMap[p.district_slug]) {
      districtMap[p.district_slug] = {
        slug: p.district_slug,
        name: p.district_name || p.district_slug,
        postCount: 0,
        engagement: 0,
        recentPosts: [],
      };
    }
    districtMap[p.district_slug].postCount++;
    districtMap[p.district_slug].engagement += engagementScore(p);
    if (districtMap[p.district_slug].recentPosts.length < 3) {
      districtMap[p.district_slug].recentPosts.push(p);
    }
  });
  return Object.values(districtMap).sort((a, b) => b.engagement - a.engagement).slice(0, 10);
};

export const getTrendingCategories = async () => {
  const { data: posts, error } = await supabase
    .from("post")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(300);
  if (error) throw error;

  const visible = posts.filter(isPubliclyVisible);
  const catMap = {};
  visible.forEach((p) => {
    if (!p.category_slug) return;
    if (!catMap[p.category_slug]) {
      catMap[p.category_slug] = {
        slug: p.category_slug,
        name: p.category_name || p.category_slug,
        postCount: 0,
        engagement: 0,
      };
    }
    catMap[p.category_slug].postCount++;
    catMap[p.category_slug].engagement += engagementScore(p);
  });
  return Object.values(catMap).sort((a, b) => b.engagement - a.engagement).slice(0, 8);
};

export const getTopDiscussions = async (limit = 5) => {
  const { data: posts, error } = await supabase
    .from("post")
    .select("*")
    .eq("status", "active")
    .order("comment_count", { ascending: false })
    .limit(limit * 3);
  if (error) throw error;

  return posts.filter(isPubliclyVisible).slice(0, limit);
};