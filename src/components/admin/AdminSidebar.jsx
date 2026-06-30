import React, { useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import {
  LayoutDashboard, FileText, MessageSquare, Tag, MapPin,
  Image, Megaphone, Flag, Settings, LogOut, Menu, X, ChevronRight, Shield, Zap, Globe, Users, Mail, Home, UserCheck, BookOpen, SearchCheck, Newspaper,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "TN Today", icon: Newspaper, path: "/admin/tn-today", badge: "CMS" },
  { label: "Posts", icon: FileText, path: "/admin/posts" },
  { label: "Comments", icon: MessageSquare, path: "/admin/comments" },
  { label: "Reports", icon: Flag, path: "/admin/reports" },
  { label: "AI Moderation", icon: Shield, path: "/admin/moderation", badge: "AI" },
  { label: "Categories", icon: Tag, path: "/admin/categories" },
  { label: "Districts", icon: MapPin, path: "/admin/districts" },
  { label: "Media", icon: Image, path: "/admin/media" },
  { label: "Ads", icon: Megaphone, path: "/admin/ads" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
  { label: "SEO Manager", icon: SearchCheck, path: "/admin/seo", badge: "SEO" },
  { label: "AI Settings", icon: Zap, path: "/admin/moderation-settings" },
  { label: "Phase 8 Hub", icon: Globe, path: "/admin/phase8", badge: "NEW" },
  { label: "Community & Donations", icon: Users, path: "/admin/community" },
  { label: "Contact Messages", icon: Mail, path: "/admin/contacts" },
  { label: "Stay & Rooms", icon: Home, path: "/admin/stay" },
  { label: "Civic Receipts", icon: FileText, path: "/admin/civic", badge: "NEW" },
  { label: "Bribe Tracker", icon: AlertTriangle, path: "/admin/bribes", badge: "NEW" },
  { label: "Citizen Awareness", icon: BookOpen, path: "/admin/awareness", badge: "NEW" },
  { label: "Monetization", icon: Megaphone, path: "/admin/monetization", badge: "NEW" },
  { label: "Users", icon: UserCheck, path: "/admin/users" },
];

function NavItem({ item, active, onClick, pendingCount = 0 }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{item.label}</span>
      {pendingCount > 0 && (
        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">{pendingCount}</span>
      )}
      {item.badge && !active && pendingCount === 0 && (
        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{item.badge}</span>
      )}
      {active && <ChevronRight className="w-3 h-3 ml-auto" />}
    </Link>
  );
}

export default function AdminSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: pendingDonations = [] } = useQuery({
    queryKey: ["admin-donations-pending"],
    queryFn: () => base44.entities.DonationRecord.filter({ status: "pending" }),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  const pendingCount = pendingDonations.length;

  const { data: newContacts = [] } = useQuery({
    queryKey: ["admin-contacts-new"],
    queryFn: () => base44.entities.ContactMessage.filter({ status: "new" }),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  const newContactCount = newContacts.length;

  const { data: pendingStay = [] } = useQuery({
    queryKey: ["admin-stay-pending"],
    queryFn: () => base44.entities.StayListing.filter({ status: "pending" }),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  const pendingStayCount = pendingStay.length;

  const { data: pendingListings = [] } = useQuery({
    queryKey: ["admin-listings-pending"],
    queryFn: () => base44.entities.LocalListing.filter({ status: "pending" }),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  const pendingListingsCount = pendingListings.length;

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(false);
    window.location.href = "/admin/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-200">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">TN</span>
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm leading-tight">VizhiTN</div>
          <div className="text-xs text-slate-500">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={location.pathname === item.path}
            onClick={() => setMobileOpen(false)}
            pendingCount={
              item.path === "/admin/community" ? pendingCount :
              item.path === "/admin/contacts" ? newContactCount :
              item.path === "/admin/stay" ? pendingStayCount :
              item.path === "/admin/monetization" ? pendingListingsCount : 0
            }
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-slate-200 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 flex items-center gap-3 px-4 py-3">
        <button onClick={() => setMobileOpen(true)} className="p-1">
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <div className="font-bold text-slate-900 text-sm">VizhiTN Admin</div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-2xl flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}