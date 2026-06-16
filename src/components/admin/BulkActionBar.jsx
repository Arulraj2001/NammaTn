import React, { useState } from "react";
import { CheckSquare, Trash2, Flag, CheckCircle, X, Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

/**
 * Admin bulk-action toolbar shown when items are selected.
 * Props:
 *   selectedCount  - number of selected items
 *   onApprove      - async fn
 *   onFlag         - async fn
 *   onRemove       - async fn
 *   onClearSelection - fn
 */
export default function BulkActionBar({ selectedCount, onApprove, onFlag, onRemove, onClearSelection }) {
  const [loading, setLoading] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  if (selectedCount === 0) return null;

  const run = async (action, fn) => {
    setLoading(action);
    await fn();
    setLoading(null);
    setConfirmAction(null);
  };

  return (
    <>
      <div className="sticky top-16 z-30 flex items-center gap-3 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg mb-4 flex-wrap">
        <CheckSquare className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">{selectedCount} selected</span>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {onApprove && (
            <button
              onClick={() => run("approve", onApprove)}
              disabled={!!loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
              Approve
            </button>
          )}
          {onFlag && (
            <button
              onClick={() => run("flag", onFlag)}
              disabled={!!loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading === "flag" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flag className="w-3 h-3" />}
              Flag
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => setConfirmAction("remove")}
              disabled={!!loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading === "remove" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Remove
            </button>
          )}
          <button
            onClick={onClearSelection}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === "remove"}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title={`Remove ${selectedCount} item${selectedCount !== 1 ? "s" : ""}?`}
        description="This will mark the selected items as removed. This action is logged."
        confirmLabel="Remove All"
        onConfirm={() => run("remove", onRemove)}
        destructive
      />
    </>
  );
}