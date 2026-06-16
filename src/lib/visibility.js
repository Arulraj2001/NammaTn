/**
 * Centralized public visibility guard.
 * Used across services/posts, services/search, services/trending.
 * A post/item is publicly visible only if it passes ALL these checks.
 */
export function isPubliclyVisible(p) {
  if (!p) return false;
  // Status checks
  if (p.status === "removed" || p.status === "hidden" || p.status === "flagged" || p.status === "rejected") return false;
  // Moderation checks
  if (p.moderation_status === "hidden" || p.moderation_status === "pending") return false;
  // Explicit visibility flag
  if (p.is_publicly_visible === false) return false;
  // Civic status: duplicate_invalid should not appear in public
  if (p.civic_status === "duplicate_invalid") return false;
  return true;
}

/** Safety guard for jobs/stay/listings */
export function isSafePublicListing(item) {
  if (!item) return false;
  if (item.status === "removed" || item.status === "rejected" || item.status === "pending") return false;
  if (item.safety_status === "scam" || item.safety_status === "rejected") return false;
  if (item.moderation_status === "hidden") return false;
  if (item.is_publicly_visible === false) return false;
  if ((item.report_count || 0) >= 5) return false;
  return true;
}