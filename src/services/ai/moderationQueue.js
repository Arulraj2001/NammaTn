/**
 * Moderation Queue Service
 * Manages the smart moderation queue — routing, prioritization, and queue stats.
 */
import { supabase } from "@/api/supabaseClient";
import { computeModerationPriority, computeContentTrustScore } from "./trustScore";

export const QUEUE_TYPES = {
  PENDING: "pending_review",
  HIGH_PRIORITY: "high_priority",
  SPAM: "flagged_spam",
  ABUSE: "abuse_reports",
  SENSITIVE: "sensitive_data",
};

/**
 * Load the full moderation queue — enriched with priority scores.
 * Returns posts sorted by priority (highest first).
 */
export async function loadModerationQueue(reportMap = {}) {
  const [flaggedPostsRes, activePostsRes] = await Promise.all([
    supabase.from("post").select("*").eq("status", "flagged").order("created_date", { ascending: false }).limit(200),
    supabase.from("post").select("*").eq("status", "active").order("updated_date", { ascending: false }).limit(100)
  ]);

  const flaggedPosts = flaggedPostsRes.data || [];
  const activePosts = activePostsRes.data || [];

  // Combine: all flagged + recently updated active posts that have reports
  const allPosts = [...flaggedPosts];
  activePosts.forEach((p) => {
    if (reportMap[p.id] && !allPosts.find((fp) => fp.id === p.id)) {
      allPosts.push(p);
    }
  });

  const enriched = allPosts.map((post) => {
    const reportCount = reportMap[post.id] || 0;
    const priority = computeModerationPriority(post, reportCount);
    const trustScore = computeContentTrustScore(post, reportCount);
    const queueType = assignQueueType(post, reportCount, priority);
    return { ...post, _priority: priority, _trustScore: trustScore, _queueType: queueType, _reportCount: reportCount };
  });

  return enriched.sort((a, b) => b._priority - a._priority);
}

function assignQueueType(post, reportCount, priority) {
  if (reportCount >= 3) return QUEUE_TYPES.ABUSE;
  if (priority >= 60) return QUEUE_TYPES.HIGH_PRIORITY;
  if (post.status === "flagged") return QUEUE_TYPES.PENDING;
  return QUEUE_TYPES.PENDING;
}

/**
 * Build a report count map from all reports.
 * { postId: count }
 */
export async function buildReportMap() {
  const { data: reports, error } = await supabase
    .from("report")
    .select("target_id")
    .eq("target_type", "post")
    .eq("status", "pending")
    .order("created_date", { ascending: false })
    .limit(500);
  if (error) return {};

  const map = {};
  reports.forEach((r) => {
    map[r.target_id] = (map[r.target_id] || 0) + 1;
  });
  return map;
}

/**
 * Queue stats summary.
 */
export async function getQueueStats() {
  const [flaggedPostsRes, pendingReportsRes, flaggedCommentsRes] = await Promise.all([
    supabase.from("post").select("*").eq("status", "flagged").order("created_date", { ascending: false }).limit(500),
    supabase.from("report").select("*").eq("status", "pending").order("created_date", { ascending: false }).limit(500),
    supabase.from("comment").select("*").eq("status", "flagged").order("created_date", { ascending: false }).limit(200),
  ]);

  const flaggedPosts = flaggedPostsRes.data || [];
  const pendingReports = pendingReportsRes.data || [];
  const flaggedComments = flaggedCommentsRes.data || [];

  const highPriority = flaggedPosts.filter((p) => {
    const reports = pendingReports.filter((r) => r.target_id === p.id).length;
    return computeModerationPriority(p, reports) >= 45;
  });

  return {
    total: flaggedPosts.length + pendingReports.length + flaggedComments.length,
    flagged_posts: flaggedPosts.length,
    pending_reports: pendingReports.length,
    flagged_comments: flaggedComments.length,
    high_priority: highPriority.length,
  };
}