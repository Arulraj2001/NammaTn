import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Link } from "react-router-dom";
import {
  User, FileText, CheckCircle, MessageSquare, Flag, Briefcase, Building2,
  Bell, Settings, Plus, AlertTriangle, ChevronRight, LogOut,
  Eye, Bookmark, BarChart3, Home
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { formatDistanceToNow } from "date-fns";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";
import { getDaysOpen } from "@/lib/civicReceipt";
import { getBookmarks } from "@/services/bookmarks";

const T = (en, ta, lang) => lang === "ta" ? ta : en;

const TABS = [
  { key: "overview",      icon: Home,          label_en: "Overview",            label_ta: "கண்ணோட்டம்" },
  { key: "receipts",      icon: FileText,      label_en: "Civic Receipts",      label_ta: "குடிமை ரசீதுகள்" },
  { key: "activity",      icon: BarChart3,     label_en: "My Activity",         label_ta: "என் செயல்பாடு" },
  { key: "comments",      icon: MessageSquare, label_en: "Comments",            label_ta: "கருத்துகள்" },
  { key: "reports",       icon: Flag,          label_en: "My Reports",          label_ta: "என் புகார்கள்" },
  { key: "jobs",          icon: Briefcase,     label_en: "Jobs / Stay",         label_ta: "வேலை / தங்குமிடம்" },
  { key: "orgs",          icon: Building2,     label_en: "Organisations",       label_ta: "நிறுவனங்கள்" },
  { key: "notifications", icon: Bell,          label_en: "Notifications",       label_ta: "அறிவிப்புகள்" },
  { key: "settings",      icon: Settings,      label_en: "Settings",            label_ta: "அமைப்புகள்" },
];

const RECEIPT_FILTERS = [
  { key: "all", label: "All" },
  { key: "reported", label: "Reported" },
  { key: "community_verified", label: "Verified" },
  { key: "complaint_needed", label: "Needs Complaint" },
  { key: "complaint_filed", label: "Filed" },
  { key: "claimed_fixed", label: "Claimed Fixed" },
  { key: "citizen_verified_fixed", label: "Verified Fixed" },
  { key: "unresolved_escalated", label: "Escalated" },
];

function EmptyState({ icon: Icon, title, desc, cta, ctaTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</p>
      <p className="text-xs text-slate-400 max-w-xs mb-4">{desc}</p>
      {cta && ctaTo && (
        <Link to={ctaTo} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <Plus className="w-3.5 h-3.5" /> {cta}
        </Link>
      )}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewTab({ user, profile, receipts, comments, reports, activity, notifications, lang }) {
  const bookmarks = useMemo(() => getBookmarks().slice(0, 4), []);

  const displayProfile = profile || {
    trust_score: 10,
    approved_verifications_count: 0,
    resolved_issues_count: 0,
    spam_deletions_count: 0
  };

  const pending = useMemo(() => {
    const items = [];
    receipts.filter(r => r.civic_status === "complaint_needed" && !r.official_complaint_id)
      .slice(0, 2).forEach(r => items.push({ id: r.id, label: `Add complaint ID: ${(r.title_en || "").slice(0, 40)}`, to: `/post/${r.id}`, color: "orange" }));
    receipts.filter(r => r.civic_status === "claimed_fixed")
      .slice(0, 2).forEach(r => items.push({ id: r.id + "_f", label: `Verify if fixed: ${(r.title_en || "").slice(0, 40)}`, to: `/post/${r.id}`, color: "teal" }));
    receipts.filter(r => r.civic_status === "unresolved_escalated")
      .slice(0, 1).forEach(r => items.push({ id: r.id + "_e", label: `Escalated: ${(r.title_en || "").slice(0, 40)}`, to: `/post/${r.id}`, color: "red" }));
    return items.slice(0, 5);
  }, [receipts]);

  const unread = notifications.filter(n => !n.is_read);

  const stats = [
    { label: T("Civic Receipts", "குடிமை ரசீதுகள்", lang), value: receipts.length, color: "blue" },
    { label: T("Verified", "சரிபார்க்கப்பட்டவை", lang), value: activity.filter(a => a.action_type === "verify").length, color: "green" },
    { label: T("Comments", "கருத்துகள்", lang), value: comments.length, color: "purple" },
    { label: T("Reports", "புகார்கள்", lang), value: reports.length, color: "orange" },
  ];

  const colorMap = {
    blue: "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
    green: "bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
    purple: "bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300",
    orange: "bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300",
  };

  return (
    <div className="space-y-5">
      {/* Welcome banner with Trust Score */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white flex justify-between items-start gap-4">
        <div>
          <p className="text-xs text-blue-200 mb-1">{T("Welcome back", "மீண்டும் வருக", lang)}</p>
          <h2 className="text-lg font-bold mb-3">{user?.full_name || user?.email || T("Community Member", "சமூக உறுப்பினர்", lang)}</h2>
          <Link to="/create" className="inline-flex items-center gap-1.5 bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50">
            <Plus className="w-4 h-4" /> {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு", lang)}
          </Link>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 text-right flex-shrink-0">
          <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">{T("Trust Score", "நம்பகத்தன்மை புள்ளி", lang)}</p>
          <p className="text-3xl font-extrabold text-white mt-0.5">{displayProfile.trust_score}</p>
          <p className="text-[9px] text-blue-100/80 mt-1">
            {displayProfile.trust_score >= 80 ? T("High Trust", "உயர் நம்பிக்கை", lang) :
             displayProfile.trust_score >= 40 ? T("Medium Trust", "நடுத்தர நம்பிக்கை", lang) :
             T("Standard Member", "நிலையான உறுப்பினர்", lang)}
          </p>
        </div>
      </div>

      {/* Trust score components breakdown */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center shadow-sm">
        <div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">+{displayProfile.approved_verifications_count * 5}</p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{T("Verifications", "சரிபார்ப்புகள்", lang)}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">{displayProfile.approved_verifications_count} {T("Approved", "அங்கீகரிக்கப்பட்டது", lang)}</p>
        </div>
        <div>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">+{displayProfile.resolved_issues_count * 15}</p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{T("Resolutions", "தீர்வுகள்", lang)}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">{displayProfile.resolved_issues_count} {T("Resolved", "தீர்க்கப்பட்டது", lang)}</p>
        </div>
        <div>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">-{displayProfile.spam_deletions_count * 20}</p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{T("Spam Penalties", "தணிக்கை தண்டனை", lang)}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">{displayProfile.spam_deletions_count} {T("Deleted", "நீக்கப்பட்டது", lang)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 text-center ${colorMap[s.color]}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 font-medium leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending actions */}
      {pending.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            {T("Pending Actions", "நிலுவையில் உள்ள செயல்கள்", lang)}
          </h3>
          <div className="space-y-2">
            {pending.map(item => (
              <Link key={item.id} to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700">
                <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Unread notifications snippet */}
      {unread.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {unread.length} {T("Unread Notifications", "படிக்காத அறிவிப்புகள்", lang)}
          </h3>
          <div className="space-y-1.5">
            {unread.slice(0, 3).map(n => (
              <div key={n.id} className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <span>{n.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent receipts */}
      {receipts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
            {T("Recent Civic Receipts", "சமீபத்திய குடிமை ரசீதுகள்", lang)}
          </h3>
          <div className="space-y-2">
            {receipts.slice(0, 4).map(r => (
              <Link key={r.id} to={`/post/${r.id}`}
                className="flex items-start gap-3 py-2 px-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-xl group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-white truncate group-hover:text-blue-600">{r.title_en}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <CivicStatusBadge status={r.civic_status || "reported"} size="xs" />
                    <span className="text-[10px] text-slate-400">{getDaysOpen(r.created_date)}d open</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-500" />
            {T("Saved / Bookmarks", "சேமிக்கப்பட்டவை", lang)}
          </h3>
          <div className="space-y-2">
            {bookmarks.map(b => (
              <Link key={b.id} to={`/post/${b.id}`}
                className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 py-1">
                <span className="text-slate-400">📌</span>
                <span className="flex-1 truncate">{b.title_en}</span>
                <span className="text-slate-400 text-[10px] flex-shrink-0">{b.district_name}</span>
              </Link>
            ))}
          </div>
          <Link to="/bookmarks" className="text-xs text-blue-600 hover:underline mt-2 block">
            {T("View all saved →", "அனைத்தையும் பார்க்க →", lang)}
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Receipts ──────────────────────────────────────────────────────────────────
function ReceiptsTab({ receipts, lang }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? receipts : receipts.filter(r => r.civic_status === filter);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {RECEIPT_FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${filter === f.key ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
            {f.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No civic receipts yet"
          desc="Document a local issue with photos and location to create a civic receipt."
          cta="Create Civic Receipt" ctaTo="/create" />
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 ${r.moderation_status === "hidden" ? "border-red-200 dark:border-red-800" : r.moderation_status === "pending" ? "border-amber-200" : "border-slate-200 dark:border-slate-700"}`}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {r.civic_receipt_id && <span className="text-xs font-mono text-blue-600 font-bold">{r.civic_receipt_id}</span>}
                <CivicStatusBadge status={r.civic_status || "reported"} size="xs" />
                {r.moderation_status === "hidden" && <span className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-lg font-medium">Hidden</span>}
                {r.moderation_status === "pending" && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-lg font-medium">Pending Review</span>}
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1 line-clamp-2">{r.title_en}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400 mb-3">
                {r.district_name && <span>📍 {r.district_name}</span>}
                <span>📅 {getDaysOpen(r.created_date)}d open</span>
                <span>✓ {r.verification_count || 0} verified</span>
                {r.official_complaint_id && <span className="text-green-600">ID: {r.official_complaint_id}</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link to={`/post/${r.id}`} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> View
                </Link>
                {!r.official_complaint_id && ["community_verified", "complaint_needed"].includes(r.civic_status) && (
                  <Link to={`/post/${r.id}`} className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600">+ Add Complaint ID</Link>
                )}
                {r.civic_status === "claimed_fixed" && (
                  <Link to={`/post/${r.id}`} className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700">Verify If Fixed</Link>
                )}
                <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/post/${r.id}`)}
                  className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Activity ──────────────────────────────────────────────────────────────────
function ActivityTab({ activity, lang }) {
  const labels = {
    verify: { label: "Verified an issue", icon: "✓", color: "text-blue-600" },
    duplicate: { label: "Reported as duplicate", icon: "⚠", color: "text-slate-500" },
    still_not_fixed: { label: "Reported still not fixed", icon: "🔴", color: "text-red-600" },
    citizen_verified_fixed: { label: "Confirmed as fixed", icon: "✅", color: "text-green-600" },
    claim_fixed: { label: "Claimed as fixed", icon: "🛠", color: "text-teal-600" },
  };

  return activity.length === 0 ? (
    <EmptyState icon={BarChart3} title="No activity yet"
      desc="Verify issues, report still-not-fixed, or confirm fixes to build your activity history." />
  ) : (
    <div className="space-y-2">
      {activity.map(a => {
        const meta = labels[a.action_type] || { label: a.action_type, icon: "•", color: "text-slate-500" };
        return (
          <div key={a.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-base flex-shrink-0">{meta.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${meta.color}`}>{meta.label}</p>
              <p className="text-[10px] text-slate-400">{a.created_date ? formatDistanceToNow(new Date(a.created_date), { addSuffix: true }) : ""}</p>
            </div>
            <Link to={`/post/${a.post_id}`} className="text-xs text-blue-600 hover:underline flex-shrink-0">View →</Link>
          </div>
        );
      })}
    </div>
  );
}

// ── Comments ──────────────────────────────────────────────────────────────────
function CommentsTab({ comments, lang }) {
  return comments.length === 0 ? (
    <EmptyState icon={MessageSquare} title={T("No comments yet", "இன்னும் கருத்துகள் இல்லை", lang)}
      desc="Join community discussions by commenting on civic receipts and posts." />
  ) : (
    <div className="space-y-3">
      {comments.map(c => {
        const isHidden = ["hidden", "removed"].includes(c.status);
        return (
          <div key={c.id} className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 ${isHidden ? "border-red-200 dark:border-red-900/30" : "border-slate-200 dark:border-slate-700"}`}>
            {isHidden ? (
              <p className="text-xs text-red-600 italic">This comment is hidden due to moderation.</p>
            ) : c.status === "flagged" ? (
              <p className="text-xs text-amber-600 italic">This comment is pending review.</p>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{c.content}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-400">{c.created_date ? formatDistanceToNow(new Date(c.created_date), { addSuffix: true }) : ""}</span>
              <Link to={`/post/${c.post_id}`} className="text-xs text-blue-600 hover:underline">View post →</Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
function ReportsTab({ reports, lang }) {
  const ST = { pending: "text-yellow-600 bg-yellow-50", reviewed: "text-blue-600 bg-blue-50", dismissed: "text-slate-500 bg-slate-100", actioned: "text-green-600 bg-green-50" };
  return reports.length === 0 ? (
    <EmptyState icon={Flag} title={T("No reports submitted", "புகார்கள் இல்லை", lang)}
      desc="Use the report button on posts or comments to flag unsafe content." />
  ) : (
    <div className="space-y-3">
      {reports.map(r => (
        <div key={r.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{(r.target_type || "").replace(/_/g, " ")} · {(r.reason || "").replace(/_/g, " ")}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${ST[r.status] || ST.pending}`}>{r.status}</span>
          </div>
          {r.details && <p className="text-xs text-slate-500 italic">{r.details}</p>}
          <p className="text-[10px] text-slate-400 mt-1">{r.created_date ? formatDistanceToNow(new Date(r.created_date), { addSuffix: true }) : ""}</p>
        </div>
      ))}
    </div>
  );
}

// ── Jobs / Stay / Listings ────────────────────────────────────────────────────
function JobsTab({ user, lang }) {
  const opts = { enabled: !!user?.id, staleTime: 60_000 };
  const { data: jobs = [] } = useQuery({ queryKey: ["my-jobs", user?.id], queryFn: () => base44.entities.JobAlert.filter({ created_by_id: user?.id }, "-created_date", 50), ...opts });
  const { data: stays = [] } = useQuery({ queryKey: ["my-stays", user?.id], queryFn: () => base44.entities.StayListing.filter({ created_by_id: user?.id }, "-created_date", 50), ...opts });
  const { data: listings = [] } = useQuery({ queryKey: ["my-listings", user?.id], queryFn: () => base44.entities.LocalListing.filter({ created_by_id: user?.id }, "-created_date", 50), ...opts });

  const ST = { active: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", rejected: "bg-red-100 text-red-600", removed: "bg-red-100 text-red-600", expired: "bg-slate-100 text-slate-500" };

  if (!jobs.length && !stays.length && !listings.length) {
    return <EmptyState icon={Briefcase} title="No submissions yet" desc="Post jobs, stay listings, or local business listings to manage them here." />;
  }

  const Section = ({ title, items, renderItem }) => items.length === 0 ? null : (
    <div>
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{title} ({items.length})</h3>
      <div className="space-y-2">{items.map(renderItem)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Section title="Job Alerts" items={jobs} renderItem={j => (
        <div key={j.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <p className="text-sm font-medium text-slate-800 dark:text-white truncate mb-1">{j.title}</p>
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ST[j.status] || ST.pending}`}>{j.status}</span>
            {j.safety_status === "scam" && <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">🚨 Scam flagged</span>}
            {j.report_count > 0 && <span className="text-xs text-red-500">{j.report_count} reports</span>}
          </div>
          {j.admin_note && <p className="text-xs text-amber-600 mt-1 italic">Admin: {j.admin_note}</p>}
        </div>
      )} />
      <Section title="Stay Listings" items={stays} renderItem={s => (
        <div key={s.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <p className="text-sm font-medium text-slate-800 dark:text-white truncate mb-1">{s.title}</p>
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ST[s.status] || ST.pending}`}>{s.status}</span>
            {s.report_count > 0 && <span className="text-xs text-red-500">{s.report_count} reports</span>}
          </div>
        </div>
      )} />
      <Section title="Local Listings" items={listings} renderItem={l => (
        <div key={l.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <p className="text-sm font-medium text-slate-800 dark:text-white truncate mb-1">{l.business_name}</p>
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ST[l.status] || ST.pending}`}>{l.status}</span>
            {l.is_verified && <span className="text-xs text-blue-600 font-medium">✓ Verified</span>}
            {l.is_featured && <span className="text-xs text-amber-600 font-medium">⭐ Featured</span>}
            {l.report_count > 0 && <span className="text-xs text-red-500">{l.report_count} reports</span>}
          </div>
          {l.admin_note && <p className="text-xs text-amber-600 mt-1 italic">Admin: {l.admin_note}</p>}
        </div>
      )} />
    </div>
  );
}

// ── Organisations ─────────────────────────────────────────────────────────────
function OrgsTab({ user, lang }) {
  const opts = { enabled: !!user?.email, staleTime: 60_000 };
  const { data: rwaGroups = [] } = useQuery({ queryKey: ["my-rwa", user?.email], queryFn: () => base44.entities.RWAGroup.filter({ admin_email: user?.email }, "-created_date", 20), ...opts });
  const { data: sponsors = [] } = useQuery({ queryKey: ["my-sponsors", user?.email], queryFn: () => base44.entities.CivicSponsor.filter({ contact_email: user?.email }, "-created_date", 20), ...opts });

  const ST = { pending: "bg-yellow-100 text-yellow-700", active: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600", suspended: "bg-orange-100 text-orange-600", completed: "bg-teal-100 text-teal-700" };

  if (!rwaGroups.length && !sponsors.length) {
    return (
      <div className="space-y-4">
        <EmptyState icon={Building2} title="No organisations yet" desc="Register your RWA, CSR organisation, or sponsor profile." />
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/rwa" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700">Register RWA</Link>
          <Link to="/csr" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">Register CSR / Sponsor</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rwaGroups.map(g => (
        <div key={g.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{g.group_name}</p>
              <p className="text-xs text-slate-500 capitalize">{(g.group_type || "").replace(/_/g, " ")} · {g.plan}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${ST[g.status] || ST.pending}`}>{g.status}</span>
          </div>
          {g.is_verified && <p className="text-xs text-blue-600 font-medium">✓ Verified by NammaTN234</p>}
          {g.status === "pending" && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 mt-1">Request is under review. We'll contact you within 48 hours.</p>}
        </div>
      ))}
      {sponsors.map(s => (
        <div key={s.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{s.sponsor_name}</p>
              <p className="text-xs text-slate-500 capitalize">{(s.sponsor_type || "").replace(/_/g, " ")} · {s.plan}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${ST[s.status] || ST.pending}`}>{s.status}</span>
          </div>
          {s.is_verified && <p className="text-xs text-blue-600 font-medium">✓ Verified</p>}
          {s.admin_note && <p className="text-xs text-slate-500 italic mt-1">Note: {s.admin_note}</p>}
          {s.status === "pending" && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 mt-1">Under review. We'll be in touch within 48 hours.</p>}
        </div>
      ))}
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
function NotificationsTab({ notifications, onRefresh, lang }) {
  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true, read_at: new Date().toISOString() });
    onRefresh();
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true, read_at: new Date().toISOString() })));
    onRefresh();
  };

  const priorityBorder = { urgent: "border-l-red-500", high: "border-l-orange-400", normal: "border-l-blue-400", low: "border-l-slate-300" };

  return (
    <div>
      {notifications.some(n => !n.is_read) && (
        <div className="flex justify-end mb-3">
          <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>
      )}
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={T("No notifications yet", "அறிவிப்புகள் இல்லை", lang)}
          desc="Notifications appear here when there are updates on your Civic Receipts, comments, or submissions." />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`bg-white dark:bg-slate-800 border border-l-4 rounded-xl px-4 py-3 ${priorityBorder[n.priority] || priorityBorder.normal} ${!n.is_read ? "border-slate-200 dark:border-slate-700" : "border-slate-100 dark:border-slate-800 opacity-60"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${!n.is_read ? "text-slate-800 dark:text-white" : "text-slate-500"}`}>{n.title}</p>
                  {n.message && <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>}
                  <p className="text-[10px] text-slate-400 mt-1">{n.created_date ? formatDistanceToNow(new Date(n.created_date), { addSuffix: true }) : ""}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.target_id && (
                    <Link to={
                      n.target_type === "post" ? `/post/${n.target_id}` :
                      n.target_type === "job_alert" ? `/jobs` :
                      n.target_type === "stay_listing" ? `/stay` :
                      n.target_type === "stay_report" ? `/stay` :
                      `/me`
                    } className="text-xs text-blue-600 hover:underline">View</Link>
                  )}
                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)} className="w-2 h-2 rounded-full bg-blue-500 hover:bg-blue-700 flex-shrink-0" title="Mark as read" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsTab({ user, lang, logout }) {
  const [displayName, setDisplayName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProfile = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    await base44.auth.updateMe({ full_name: displayName.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const theme = localStorage.getItem("tn_theme") || "light";
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("tn_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="space-y-5 max-w-lg">
      {/* Profile */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Profile</h3>
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Display Name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Email (read-only)</label>
          <p className="text-sm text-slate-400 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl">{user?.email}</p>
        </div>
        <button onClick={saveProfile} disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Profile"}
        </button>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Language / மொழி</h3>
        <div className="flex gap-2">
          {[{ key: "en", label: "English" }, { key: "ta", label: "தமிழ்" }].map(l => (
            <button key={l.key} onClick={() => { localStorage.setItem("tn_lang", l.key); window.location.reload(); }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${lang === l.key ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"}`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Theme</h3>
        <button onClick={toggleTheme}
          className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
          {theme === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
        </button>
      </div>

      {/* Sign out */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Account</h3>
        <button onClick={() => logout(true)}
          className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 dark:border-red-800 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MyDashboard() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin, logout } = useAuth();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // Show login prompt for guests
  if (!isLoadingAuth && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {T("Sign in to view your dashboard", "உங்கள் கட்டுப்பாட்டு மையத்தை பார்க்க உள்நுழையுங்கள்", lang)}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {T("Track your Civic Receipts, activity, comments, and account settings.", "உங்கள் குடிமை ரசீதுகள், செயல்பாடு மற்றும் கணக்கு அமைப்புகளை கண்காணியுங்கள்.", lang)}
        </p>
        <button onClick={navigateToLogin}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">
          {T("Sign In", "உள்நுழை", lang)}
        </button>
      </div>
    );
  }

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return <MyDashboardContent user={user} lang={lang} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />;
}

// Separate content component so hooks only run when authenticated
function MyDashboardContent({ user, lang, activeTab, setActiveTab, logout }) {
  const { data: myProfile = null } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const { data: myReceipts = [] } = useQuery({
    queryKey: ["my-receipts", user?.id],
    queryFn: () => base44.entities.Post.filter({ created_by_id: user?.id, post_type: "complaint" }, "-created_date", 100),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const { data: myActivity = [] } = useQuery({
    queryKey: ["my-activity", user?.id],
    queryFn: () => base44.entities.CivicAction.filter({ actor_id: user?.id, is_authenticated: true }, "-created_date", 100),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const { data: myComments = [] } = useQuery({
    queryKey: ["my-comments", user?.id],
    queryFn: () => base44.entities.Comment.filter({ author_id: user?.id }, "-created_date", 100),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const { data: myReports = [] } = useQuery({
    queryKey: ["my-reports", user?.id],
    queryFn: () => base44.entities.Report.filter({ reporter_session: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const { data: myNotifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ["my-notifications", user?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const unreadCount = myNotifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {T("My Dashboard", "என் கட்டுப்பாட்டு மையம்", lang)}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
        </div>
        <Link to="/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
          <Plus className="w-4 h-4" /> {T("New Receipt", "புதிய ரசீது", lang)}
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap border-b-2 transition-all ${isActive ? "text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/10" : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"}`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{T(tab.label_en, tab.label_ta, lang)}</span>
              {tab.key === "notifications" && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab user={user} profile={myProfile} receipts={myReceipts} comments={myComments} reports={myReports} activity={myActivity} notifications={myNotifications} lang={lang} />}
      {activeTab === "receipts" && <ReceiptsTab receipts={myReceipts} lang={lang} />}
      {activeTab === "activity" && <ActivityTab activity={myActivity} lang={lang} />}
      {activeTab === "comments" && <CommentsTab comments={myComments} lang={lang} />}
      {activeTab === "reports" && <ReportsTab reports={myReports} lang={lang} />}
      {activeTab === "jobs" && <JobsTab user={user} lang={lang} />}
      {activeTab === "orgs" && <OrgsTab user={user} lang={lang} />}
      {activeTab === "notifications" && <NotificationsTab notifications={myNotifications} onRefresh={refetchNotifications} lang={lang} />}
      {activeTab === "settings" && <SettingsTab user={user} lang={lang} logout={logout} />}
    </div>
  );
}