import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminGuard from "./AdminGuard";

export default function AdminLayout() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
        <Suspense fallback={null}>
          <AdminSidebar />
        </Suspense>
        <main className="flex-1 min-w-0 lg:overflow-auto">
          <div className="pt-14 lg:pt-0">
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}