import { useState, useCallback } from "react";
import { checkRateLimit, getRateLimitResetIn } from "@/lib/security";

/**
 * Hook to enforce client-side rate limiting on actions.
 * Returns { allowed, resetIn, attempt } where attempt() returns true/false.
 *
 * @param {string} key       - unique key for this action
 * @param {number} limit     - max calls per window
 * @param {number} windowMs  - window duration in ms
 */
export function useRateLimit(key, limit = 5, windowMs = 60_000) {
  const [blocked, setBlocked] = useState(false);
  const [resetIn, setResetIn] = useState(0);

  const attempt = useCallback(() => {
    const allowed = checkRateLimit(key, limit, windowMs);
    if (!allowed) {
      const secs = getRateLimitResetIn(key, windowMs);
      setResetIn(secs);
      setBlocked(true);
      setTimeout(() => setBlocked(false), secs * 1000);
    }
    return allowed;
  }, [key, limit, windowMs]);

  return { blocked, resetIn, attempt };
}