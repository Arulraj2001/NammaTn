/**
 * useNotify — client-side notification creator.
 *
 * Since we have no backend functions, notifications are created client-side
 * at the moment of submission. Each call is fire-and-forget (errors are silent).
 *
 * Usage:
 *   const { notify } = useNotify();
 *   notify({ type: "post_verified", title: "Receipt verified", message: "...", target_type: "post", target_id: post.id });
 */
import { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export function useNotify() {
  const { user } = useAuth();

  const notify = useCallback(
    async ({ type, title, message, target_type, target_id, priority = "normal" }) => {
      if (!user?.id) return; // Only create notifications for authenticated users
      base44.entities.Notification.create({
        user_id: user.id,
        type,
        title,
        message: message || "",
        target_type: target_type || "",
        target_id: target_id || "",
        priority,
        is_read: false,
      }).catch(() => {}); // Silent — never break the UI
    },
    [user]
  );

  return { notify };
}