import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminGuard from "./AdminGuard";

export default function AdminLayout() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
        <Suspense fallback={<aside className="hidden lg:flex flex-col w-56 bg-white border-r border-slate-200 h-screen sticky top-0 flex-shrink-0" />}>
          <AdminSidebar />
        </Suspense>
        <main className="flex-1 min-w-0 lg:overflow-auto">
          <div className="pt-14 lg:pt-0">
            <Suspense fallback={
              <div className="min-h-[60vh] w-full flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}