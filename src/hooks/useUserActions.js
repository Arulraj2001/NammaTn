/**
 * useUserActions — per-user, per-target deduplication store.
 *
 * Stores completed actions in localStorage keyed by:
 *   tn_action_{userId|sessionId}_{targetId}_{actionType}
 *
 * This is the client-side guard layer. It works for both
 * authenticated users (keyed by user.id) and session guests (keyed by session).
 *
 * For authenticated users the key uses their user ID so clearing localStorage
 * or switching browsers won't re-allow actions — the DB record itself is the
 * server-side source of truth when we write a Reaction/Confirmation record.
 */

import { useAuth } from "@/lib/AuthContext";
import { getSessionId } from "@/lib/security";

function actorKey() {
  // Prefer user ID if authenticated
  try {
    const stored = localStorage.getItem("tn_user_id");
    if (stored) return stored;
  } catch {}
  return getSessionId();
}

function storageKey(targetId, actionType) {
  return `tn_action_${actorKey()}_${targetId}_${actionType}`;
}

/**
 * Returns helpers for checking & recording one-time user actions.
 */
export function useUserActions() {
  const { user } = useAuth();

  // Keep user.id in localStorage for cross-render consistency
  if (user?.id) {
    try { localStorage.setItem("tn_user_id", user.id); } catch {}
  }

  /**
   * Has this actor already performed `actionType` on `targetId`?
   */
  function hasDone(targetId, actionType) {
    try {
      return localStorage.getItem(storageKey(targetId, actionType)) === "1";
    } catch {
      return false;
    }
  }

  /**
   * Record that this actor performed `actionType` on `targetId`.
   */
  function markDone(targetId, actionType) {
    try {
      localStorage.setItem(storageKey(targetId, actionType), "1");
    } catch {}
  }

  /**
   * Undo the record (e.g. when toggling a vote off).
   */
  function unmarkDone(targetId, actionType) {
    try {
      localStorage.removeItem(storageKey(targetId, actionType));
    } catch {}
  }

  /**
   * Returns { hasDone, markDone, unmarkDone } bound to a specific targetId.
   */
  function forTarget(targetId) {
    return {
      hasDone: (type) => hasDone(targetId, type),
      markDone: (type) => markDone(targetId, type),
      unmarkDone: (type) => unmarkDone(targetId, type),
    };
  }

  return { hasDone, markDone, unmarkDone, forTarget };
}