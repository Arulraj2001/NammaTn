import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { LogIn, LogOut, LayoutDashboard, ChevronDown, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const { user, isAuthenticated, logout, isLoadingAuth } = useAuth();
  const { requireAuth } = useAuthModal();
  const [open, setOpen] = useState(false);

  if (isLoadingAuth) return null;

  if (!isAuthenticated) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
        onClick={() => requireAuth(() => {}, "Sign in to participate")}
      >
        <LogIn className="w-3.5 h-3.5 mr-1" />
        Sign In
      </Button>
    );
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" className="w-full h-full rounded-full object-cover" />
          ) : initials}
        </div>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:block max-w-[80px] truncate">
          {displayName}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-52 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-2">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              {user?.role === "admin" && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Admin</span>
              )}
            </div>
            <Link to="/me" onClick={() => setOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              My Dashboard
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}