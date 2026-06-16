import React, { useState, useEffect } from "react";
import { Users, Loader2 } from "lucide-react";
import { confirmItem, hasConfirmed } from "@/services/communityConfirm";

/**
 * ConfirmButton — community factual validation
 * 
 * Props:
 *  - targetType: "situation_update" | "emergency_post" | "scam_alert" | "office_report"
 *  - targetId: string
 *  - confirmCount: number (initial count from DB record)
 *  - districtSlug: string
 *  - onConfirmed: async () => void  — called AFTER session recorded; should persist count to DB
 */
export default function ConfirmButton({ targetType, targetId, confirmCount = 0, districtSlug, onConfirmed }) {
  const [confirmed, setConfirmed] = useState(false);
  const [count, setCount] = useState(confirmCount);
  const [loading, setLoading] = useState(false);

  // Sync count if parent prop changes (after DB refetch)
  useEffect(() => { setCount(confirmCount); }, [confirmCount]);

  useEffect(() => {
    hasConfirmed(targetType, targetId).then(setConfirmed);
  }, [targetType, targetId]);

  const handleConfirm = async () => {
    if (confirmed || loading) return;
    setLoading(true);
    const success = await confirmItem(targetType, targetId, districtSlug);
    if (success) {
      const newCount = count + 1;
      setConfirmed(true);
      setCount(newCount);
      // Persist new count to DB via callback
      if (onConfirmed) await onConfirmed(newCount);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleConfirm}
      disabled={confirmed || loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
        confirmed
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 cursor-default"
          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-300"
      }`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3" />}
      {confirmed
        ? `✓ ${count} people confirmed this`
        : `${count > 0 ? `${count} confirmed · ` : ""}Confirm this is true`}
    </button>
  );
}