/**
 * Centralized public visibility guard.
 * Used across services/posts, services/search, services/trending.
 * A post/item is publicly visible only if it passes ALL these checks.
 */
export function isPubliclyVisible(p) {
  if (!p) return false;
  // Status checks: only "active" is allowed in public views
  if (p.status && p.status !== "active") return false;
  // Moderation checks
  if (p.moderation_status === "hidden" || p.moderation_status === "pending" || p.moderation_status === "rejected" || p.moderation_status === "deleted") return false;
  // Explicit visibility flag
  if (p.is_publicly_visible === false) return false;
  // Civic status: duplicate_invalid/deleted should not appear in public
  if (p.civic_status === "duplicate_invalid" || p.civic_status === "deleted" || p.civic_status === "removed") return false;
  return true;
}
