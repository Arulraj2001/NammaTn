import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { LogIn, X } from "lucide-react";

/**
 * Inline banner shown in write-action areas when user is not logged in.
 * action: string describing what requires login (e.g. "post in the live chat")
 * onDismiss: optional callback
 */
export default function LoginPromptBanner({ action = "participate", onDismiss, compact = false }) {
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  if (isAuthenticated) return null;

  if (compact) {
    return (
      <button
        onClick={() => requireAuth(() => {}, `Sign in to ${action}`)}
        className="flex items-center gap-2 w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        <LogIn className="w-4 h-4 flex-shrink-0" />
        <span>Sign in to {action}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        <LogIn className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Sign in to {action}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Free, fast, and no spam</p>
      </div>
      <button
        onClick={() => requireAuth(() => {}, `Sign in to ${action}`)}
        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex-shrink-0 transition-colors"
      >
        Sign In
      </button>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 text-slate-400 hover:text-slate-600">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}