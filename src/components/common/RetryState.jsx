import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Generic error + retry UI for query failures.
 * Props: message (string), onRetry (fn), compact (bool)
 */
export default function RetryState({ message = "Failed to load content.", onRetry, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-4 px-3 text-sm text-slate-500 dark:text-slate-400">
        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
        <span>{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="ml-auto flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs font-medium">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}