import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, ArrowLeft, ShieldAlert,
  FileText, AlertTriangle, Plus
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getAreaBySlug } from "@/services/areas";
import { getActiveScams } from "@/services/scamAlerts";
import { getAreaCivicPosts } from "@/services/posts";
import { usePageMeta } from "@/hooks/usePageMeta";
import ScamCard from "@/components/phase8/ScamCard";
import AreaCivicPulse from "@/components/civic/AreaCivicPulse";
import PostCard from "@/components/posts/PostCard";


export default function AreaDetail() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [tab, setTab] = useState("civic");

  const { data: area, isLoading: areaLoading } = useQuery({
    queryKey: ["area", slug],
    queryFn: () => getAreaBySlug(slug),
    enabled: !!slug,
  });

  usePageMeta({
    title: area ? `${area.name_en} – NammaTN` : "Area – NammaTN",
    description: area ? `Civic Receipts, alerts, and local updates for ${area.name_en}` : "",
  });

  const { data: civicPosts = [], isLoading: civicLoading } = useQuery({
    queryKey: ["area-civic-posts", slug],
    queryFn: () => getAreaCivicPosts(slug, 50),
    enabled: !!slug,
    staleTime: 60_000,
  });

  const { data: scams = [] } = useQuery({
    queryKey: ["scams-area", slug],
    queryFn: () => getActiveScams(20),
    select: (data) => data.filter((s) => s.area_slug === slug),
  });

  if (areaLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!area) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
      <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
      <p>{T("Area not found.", "பகுதி கண்டுபிடிக்கப்படவில்லை.")}</p>
      <Link to="/areas" className="mt-4 inline-block text-blue-600 text-sm hover:underline">← {T("All Areas", "அனைத்து பகுதிகள்")}</Link>
    </div>
  );

  // Civic stats
  const totalCivic = civicPosts.length;
  const communityVerified = civicPosts.filter((p) => p.verification_count >= 3 || p.civic_status === "community_verified").length;
  const complaintNeeded = civicPosts.filter((p) => !p.official_complaint_id && ["reported", "community_verified", "complaint_needed"].includes(p.civic_status)).length;
  const complaintFiled = civicPosts.filter((p) => !!p.official_complaint_id).length;
  const underFollowup = civicPosts.filter((p) => p.civic_status === "under_followup").length;
  const citizenVerifiedFixed = civicPosts.filter((p) => p.civic_status === "citizen_verified_fixed").length;
  const escalated = civicPosts.filter((p) => p.civic_status === "unresolved_escalated").length;

  const recentCivic = [...civicPosts]
    .filter((p) => p.civic_status !== "citizen_verified_fixed")
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 6);

  const TAB_CONFIG = [
    { key: "civic", label: T("Civic Receipts", "குடிமை ரசீதுகள்"), icon: FileText, count: totalCivic },
    { key: "scams", label: T("Scam Alerts", "மோசடி எச்சரிக்கை"), icon: ShieldAlert, count: scams.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/areas" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {T("All Areas", "அனைத்து பகுதிகள்")}
      </Link>

      {/* Area header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white mb-6">
        <div className="flex items-center gap-3 mb-1">
          <MapPin className="w-5 h-5" />
          <h1 className="text-xl font-bold">{T(area.name_en, area.name_ta)}</h1>
        </div>
        <p className="text-blue-100 text-sm">{area.district_name}{area.zone ? ` · ${area.zone}` : ""}</p>
        {area.description && <p className="text-blue-100 text-xs mt-2">{area.description}</p>}
        <Link to={`/create?area=${slug}&district=${area.district_slug}`}
          className="inline-flex items-center gap-1.5 mt-4 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-3.5 h-3.5" />
          {T("Create Civic Receipt in this area", "இந்த பகுதியில் குடிமை ரசீது உருவாக்கு")}
        </Link>
      </div>

      {/* Civic stats grid */}
      {totalCivic > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {[
            { label: T("Total Issues", "மொத்த சிக்கல்கள்"), value: totalCivic, color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-800" },
            { label: T("Community Verified", "சமுதாயம் சரிபார்த்தது"), value: communityVerified, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
            { label: T("Complaint Needed", "புகார் தேவை"), value: complaintNeeded, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
            { label: T("Complaint Filed", "புகார் தாக்கல்"), value: complaintFiled, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: T("Under Follow-up", "பின்தொடர்ச்சி"), value: underFollowup, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: T("Citizen Verified Fixed", "குடிமகன் சரிபார்த்த தீர்வு"), value: citizenVerifiedFixed, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Civic Pulse widget */}
      <div className="mb-6">
        <AreaCivicPulse areaSlug={slug} areaName={T(area.name_en, area.name_ta)} districtSlug={area.district_slug} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TAB_CONFIG.map(({ key, label, icon: TabIcon, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              tab === key ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
            <TabIcon className="w-4 h-4" />
            {label}
            {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>{count}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "civic" && (
        <div>
          {civicLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
            </div>
          ) : recentCivic.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{T("No Civic Receipts found in this area yet.", "இந்த பகுதியில் இன்னும் குடிமை ரசீதுகள் இல்லை.")}</p>
              <p className="text-xs text-slate-400 mb-4">{T("Be the first to document a local issue.", "முதலில் ஒரு உள்ளூர் சிக்கலை ஆவணப்படுத்துங்கள்.")}</p>
              <Link to={`/create?area=${slug}&district=${area.district_slug}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentCivic.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
          {escalated > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {escalated} {T("issue(s) escalated and unresolved.", "சிக்கல்கள் நடவடிக்கை எடுக்கப்பட்டு தீர்க்கப்படவில்லை.")}
            </div>
          )}
        </div>
      )}

      {tab === "scams" && (
        <div className="space-y-3">
          {scams.length === 0
            ? <p className="text-center text-slate-400 py-10 text-sm">{T("No scam alerts for this area.", "இந்த பகுதிக்கு மோசடி எச்சரிக்கைகள் இல்லை.")}</p>
            : scams.map((s) => <ScamCard key={s.id} item={s} />)
          }
        </div>
      )}
    </div>
  );
}