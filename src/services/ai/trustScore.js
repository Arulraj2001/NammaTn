/**
 * Trust Score Service
 * Computes contributor and content trust scores locally.
 * No external API needed — uses engagement signals.
 */

/**
 * Compute a content trust score (0–100) for a post.
 * Higher = more trustworthy content.
 */
export function computeContentTrustScore(post, reportCount = 0) {
  let score = 50; // baseline

  const upvotes = post.upvotes || 0;
  const downvotes = post.downvotes || 0;
  const comments = post.comment_count || 0;
  const totalReactions = upvotes + downvotes;

  // Engagement ratio bonus
  if (totalReactions > 0) {
    const ratio = upvotes / totalReactions;
    score += (ratio - 0.5) * 30; // up to +15 or -15
  }

  // Comment activity bonus (capped)
  score += Math.min(comments * 1.5, 15);

  // Report penalty
  score -= reportCount * 10;

  // Status penalties
  if (post.status === "flagged") score -= 20;
  if (post.status === "removed") score -= 40;

  // Media bonus (media-backed posts slightly more credible)
  if (post.media_urls?.length > 0) score += 5;

  // Anonymous slight penalty (harder to verify)
  if (post.is_anonymous) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get trust label from score.
 */
export function getTrustLabel(score) {
  if (score >= 80) return { label: "High Trust", color: "text-green-600", bg: "bg-green-50" };
  if (score >= 60) return { label: "Moderate", color: "text-blue-600", bg: "bg-blue-50" };
  if (score >= 40) return { label: "Neutral", color: "text-slate-600", bg: "bg-slate-100" };
  if (score >= 20) return { label: "Low Trust", color: "text-amber-600", bg: "bg-amber-50" };
  return { label: "Flagged", color: "text-red-600", bg: "bg-red-50" };
}

/**
 * Compute a session-level contributor score based on post history.
 * Used internally for moderation prioritization — NOT shown publicly.
 */
export function computeContributorSignals(posts = [], reports = []) {
  const total = posts.length;
  if (total === 0) return { level: "new", flags: [] };

  const flagged = posts.filter((p) => p.status === "flagged" || p.status === "removed").length;
  const flagRatio = flagged / total;
  const reportedByOthers = reports.length;

  const flags = [];
  if (flagRatio > 0.5) flags.push("high_flag_ratio");
  if (reportedByOthers >= 3) flags.push("multiple_reports");
  if (total > 20 && flagRatio < 0.05) flags.push("trusted_contributor");

  const level = flagRatio > 0.4 ? "watchlist"
    : flagRatio > 0.2 ? "caution"
    : total > 10 && flagRatio < 0.05 ? "trusted"
    : "normal";

  return { level, flags, total, flagged, reportedByOthers };
}

/**
 * Priority score for moderation queue (higher = needs attention sooner).
 */
export function computeModerationPriority(post, reportCount = 0, analysisResult = null) {
  let priority = 0;

  // Reports are the strongest signal
  priority += reportCount * 25;

  // AI analysis signals
  if (analysisResult) {
    priority += (analysisResult.toxicity_score || 0) * 40;
    priority += (analysisResult.spam_score || 0) * 30;
    if (analysisResult.sensitive?.hasSensitive) priority += 20;
  }

  // High engagement + flagged = needs fast review
  const engagement = (post.upvotes || 0) + (post.comment_count || 0);
  if (post.status === "flagged" && engagement > 10) priority += 15;

  // Rapid virality (many upvotes quickly)
  if ((post.upvotes || 0) > 50) priority += 10;

  return Math.min(Math.round(priority), 100);
}

export function getPriorityLabel(score) {
  if (score >= 70) return { label: "Critical", color: "text-red-600", bg: "bg-red-50 border-red-200" };
  if (score >= 45) return { label: "High", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" };
  if (score >= 20) return { label: "Medium", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  return { label: "Low", color: "text-slate-500", bg: "bg-slate-50 border-slate-200" };
}