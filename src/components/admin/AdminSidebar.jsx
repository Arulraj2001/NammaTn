import React, { useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import {
  LayoutDashboard, FileText, MessageSquare, Tag, MapPin,
  Image, Megaphone, Flag, Settings, LogOut, Menu, X, ChevronRight, Shield, Zap, Globe, Mail, UserCheck, BookOpen, SearchCheck, Newspaper,
  Video
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { label: "YouTube Studio", icon: Video, path: "/admin/youtube-studio", badge: "90D" },
    ],
  },
  {
    title: "Content & Editorial",
    items: [
      { label: "TN Today", icon: Newspaper, path: "/admin/tn-today", badge: "CMS" },
      { label: "Posts", icon: FileText, path: "/admin/posts" },
      { label: "Comments", icon: MessageSquare, path: "/admin/comments" },
      { label: "Citizen Awareness", icon: BookOpen, path: "/admin/awareness" },
      { label: "Civic Receipts", icon: FileText, path: "/admin/civic" },
      { label: "Phase 8 Hub", icon: Globe, path: "/admin/phase8" },
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      { label: "Reports", icon: Flag, path: "/admin/reports" },
      { label: "AI Moderation", icon: Shield, path: "/admin/moderation", badge: "AI" },
      { label: "Contact Messages", icon: Mail, path: "/admin/contacts" },
    ],
  },
  {
    title: "Taxonomy & Directory",
    items: [
      { label: "Categories", icon: Tag, path: "/admin/categories" },
      { label: "Districts", icon: MapPin, path: "/admin/districts" },
      { label: "Media & Storage", icon: Image, path: "/admin/media", badge: "Clean" },
      { label: "Users", icon: UserCheck, path: "/admin/users" },
    ],
  },
  {
    title: "Monetization & SEO",
    items: [
      { label: "Monetization", icon: Megaphone, path: "/admin/monetization" },
      { label: "Ads", icon: Megaphone, path: "/admin/ads" },
      { label: "SEO Manager", icon: SearchCheck, path: "/admin/seo", badge: "SEO" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { label: "Settings", icon: Settings, path: "/admin/settings" },
      { label: "AI Settings", icon: Zap, path: "/admin/moderation-settings" },
    ],
  },
];

function NavItem({ item, active, onClick, pendingCount = 0 }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150",
        active
          ? "bg-blue-600 text-white font-semibold shadow-xs"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-105",
          active ? "text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
        )}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {pendingCount > 0 && (
        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center shadow-xs">
          {pendingCount}
        </span>
      )}
      {item.badge && pendingCount === 0 && (
        <span
          className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
            active
              ? "bg-white/20 text-white"
              : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50"
          )}
        >
          {item.badge}
        </span>
      )}
      {active && <ChevronRight className="w-3 h-3 text-white/80 ml-auto flex-shrink-0" />}
    </Link>
  );
}

export default function AdminSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: newContacts = [] } = useQuery({
    queryKey: ["admin-contacts-new"],
    queryFn: () => base44.entities.ContactMessage.filter({ status: "new" }),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  const newContactCount = newContacts.length;

  const { data: pendingSponsors = [] } = useQuery({
    queryKey: ["admin-sponsors-pending"],
    queryFn: () => base44.entities.CivicSponsor.filter({ status: "pending" }),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  const pendingSponsorsCount = pendingSponsors.length;

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout(false);
    window.location.href = "/admin/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-sm text-white font-black text-xs tracking-wider">
          TN
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight tracking-tight">
              VizhiTN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Online" />
          </div>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
            Admin Console
          </p>
        </div>
      </div>

      {/* Grouped Nav */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto overflow-x-hidden">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  active={location.pathname === item.path}
                  onClick={() => setMobileOpen(false)}
                  pendingCount={
                    item.path === "/admin/contacts" ? newContactCount :
                    item.path === "/admin/monetization" ? pendingSponsorsCount : 0
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User & Logout Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex-shrink-0 space-y-2">
        {user?.email && (
          <div className="px-2 py-1 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0 uppercase">
              {user.full_name?.[0] || user.email?.[0] || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user.full_name || "Admin"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 flex-shrink-0 shadow-2xs">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="font-extrabold text-slate-900 dark:text-white text-sm">
          VizhiTN Admin
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}