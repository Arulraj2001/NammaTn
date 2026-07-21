"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "@/lib/router-compat";
import { Trophy, Clock, Zap, Users, Star, TrendingUp, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow, differenceInDays, startOfMonth } from "date-fns";
import { getDaysOpen } from "@/lib/civicReceipt";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";
import { TRUST_BADGES, LEADERBOARD_CATEGORIES } from "@/lib/civicLeaderboard";

export default function CivicLeaderboard({ initialPosts = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [activeTab, setActiveTab] = useState("most_verified");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["leaderboard-posts"],
    queryFn: () => base44.entities.Post.filter({ post_type: "complaint", status: "active" }, "-verification_count", 200),
    initialData: initialPosts,
    staleTime: 2 * 60_000,
  });

  const monthStart = startOfMonth(new Date());

  const leaderboards = useMemo(() => {
    const active = posts.filter((p) => p.civic_status !== "duplicate_invalid");
    const fixed = active.filter((p) => p.civic_status === "citizen_verified_fixed");
    const thisMonthFixed = fixed.filter((p) => new Date(p.updated_date) >= monthStart);

    // Most verified (unresolved)
    const mostVerified = [...active]
      .filter((p) => p.civic_status !== "citizen_verified_fixed")
      .sort((a, b) => (b.verification_count || 0) - (a.verification_count || 0))
      .slice(0, 10);

    // Fastest fixed (have before photos + fixed status)
    const fastestFixed = [...fixed]
      .map((p) => ({ ...p, days: getDaysOpen(p.created_date) }))
      .sort((a, b) => a.days - b.days)
      .slice(0, 10);

    // Longest pending
    const longestPending = [...active]
      .filter((p) => !["citizen_verified_fixed", "community_solved"].includes(p.civic_status))
      .map((p) => ({ ...p, days: getDaysOpen(p.created_date) }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 10);

    // Community solved
    const communitySolved = [...active]
      .filter((p) => p.civic_status === "community_solved" || p.is_community_solved)
      .sort((a, b) => (b.citizen_fixed_count || 0) - (a.citizen_fixed_count || 0))
      .slice(0, 10);

    // Civic wins this month
    const civicWins = [...thisMonthFixed]
      .sort((a, b) => (b.citizen_fixed_count || 0) - (a.citizen_fixed_count || 0))
      .slice(0, 10);

    // Area rankings by speed
    const areaMap = {};
    fixed.forEach((p) => {
      if (!p.area_name) return;
      if (!areaMap[p.area_slug]) areaMap[p.area_slug] = { name: p.area_name, district: p.district_name, total: 0, days: 0 };
      areaMap[p.area_slug].total++;
      areaMap[p.area_slug].days += getDaysOpen(p.created_date);
    });
    const fastestAreas = Object.values(areaMap)
      .filter((a) => a.total > 0)
      .map((a) => ({ ...a, avg: Math.round(a.days / a.total) }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 10);

    return { mostVerified, fastestFixed, longestPending, communitySolved, civicWins, fastestAreas };
  }, [posts]);

  const tabData = {
    most_verified: leaderboards.mostVerified,
    fastest_fixed: leaderboards.fastestFixed,
    longest_pending: leaderboards.longestPending,
    community_solved: leaderboards.communitySolved,
    civic_wins: leaderboards.civicWins,
    fastest_areas: leaderboards.fastestAreas,
  };

  const tabs = [
    { key: "most_verified", label: T("Most Verified", "அதிகம் சரிபார்க்கப்பட்ட"), icon: "🔍" },
    { key: "civic_wins", label: T("Civic Wins", "குடிமை வெற்றிகள்"), icon: "🏆" },
    { key: "fastest_fixed", label: T("Fastest Fixed", "விரைவில் தீர்த்தவை"), icon: "⚡" },
    { key: "longest_pending", label: T("Longest Pending", "நீண்ட காலம் நிலுவை"), icon: "⏰" },
    { key: "community_solved", label: T("Community Solved", "சமூகம் தீர்த்தவை"), icon: "🤝" },
    { key: "fastest_areas", label: T("Best Areas", "சிறந்த பகுதிகள்"), icon: "📍" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{T("Civic Leaderboard", "குடிமை தகுதிப் பட்டி")}</h1>
          <p className="text-amber-100 text-sm max-w-lg mx-auto leading-relaxed">
            {T("Tracking Tamil Nadu's most verified issues, fastest fixes, and community-powered civic wins.", "தமிழ்நாட்டின் சரிபார்க்கப்பட்ட சிக்கல்கள், விரைவான தீர்வுகள், சமூக வெற்றிகள்.")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Trust Badges Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            {T("Community Trust Badges", "சமூக நம்பிக்கை பதக்கங்கள்")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TRUST_BADGES.map((b) => (
              <div key={b.key} className={`rounded-xl p-3 ${b.color} border border-current/10`}>
                <div className="text-xl mb-1">{b.icon}</div>
                <p className="text-xs font-semibold">{b.label}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${activeTab === t.key ? "bg-amber-500 text-white border-amber-500" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            {activeTab === "fastest_areas" ? (
              <>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{T("Areas with Fastest Issue Resolution", "விரைவான தீர்வுள்ள பகுதிகள்")}</p>
                </div>
                {leaderboards.fastestAreas.length === 0 ? (
                  <p className="text-center py-10 text-sm text-slate-400">{T("No data yet.", "தரவு இல்லை.")}</p>
                ) : leaderboards.fastestAreas.map((a, i) => (
                  <div key={a.name} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-orange-300 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.district} · {a.total} {T("issues fixed", "சிக்கல்கள் தீர்த்தது")}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                      ~{a.avg}d avg
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{tabs.find(t => t.key === activeTab)?.label}</p>
                </div>
                {(tabData[activeTab] || []).length === 0 ? (
                  <p className="text-center py-10 text-sm text-slate-400">{T("No data yet.", "தரவு இல்லை.")}</p>
                ) : (tabData[activeTab] || []).map((p, i) => (
                  <Link to={`/post/${p.id}`} key={p.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-orange-300 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-blue-600 truncate">{p.title_en}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CivicStatusBadge status={p.civic_status || "reported"} size="xs" />
                        <span className="text-[10px] text-slate-400">{p.area_name || p.district_name}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {activeTab === "most_verified" && <span className="text-xs font-bold text-indigo-600">{p.verification_count || 0} ✓</span>}
                      {(activeTab === "fastest_fixed" || activeTab === "longest_pending") && <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">{p.days}d</span>}
                      {activeTab === "community_solved" && <span className="text-xs font-bold text-green-600">{p.citizen_fixed_count || 0} 🤝</span>}
                      {activeTab === "civic_wins" && <span className="text-xs text-green-600 font-bold">Fixed ✓</span>}
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}

        {/* Impact note */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
            {T("Public Civic Accountability", "பொது குடிமை பொறுப்பு")}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 max-w-lg mx-auto">
            {T("All data is anonymized and aggregated from public civic reports. VizhiTN never sells personal data. Leaderboards exist to celebrate community action, not individual identity.", "அனைத்து தரவும் பொது குடிமை அறிக்கைகளிலிருந்து அநாமதேயமாக்கப்பட்டுள்ளது.")}
          </p>
        </div>
      </div>
    </div>
  );
}
