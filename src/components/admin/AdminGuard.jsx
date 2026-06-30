import React from "react";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/lib/AuthContext";

export default function AdminGuard({ children }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}