"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users, GraduationCap, Heart, Briefcase, Home,
  Award, Search, ExternalLink, ArrowRight, CheckCircle2,
  Filter, Sparkles, Building2, Coins, ArrowLeft, ShieldCheck
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import { getAllSchemes } from "@/lib/awarenessServer";

const CATEGORY_MAP = {
  "Women Welfare": {
    icon: Users,
    color: "text-pink-600 bg-pink-500/10 border-pink-500/20",
    badge: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  },
  "Education": {
    icon: GraduationCap,
    color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  "Health": {
    icon: Heart,
    color: "text-red-600 bg-red-500/10 border-red-500/20",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800",
  },
  "Social Welfare": {
    icon: Award,
    color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  "Employment": {
    icon: Briefcase,
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  "Differently Abled Welfare": {
    icon: ShieldCheck,
    color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
};

const SCHEME_FILTERS = [
  { id: "all", label_en: "All Schemes", label_ta: "அனைத்து திட்டங்கள்" },
  { id: "Women Welfare", label_en: "Women Welfare", label_ta: "பெண்கள் நலன்" },
  { id: "Education", label_en: "Education & Youth", label_ta: "கல்வி & இளைஞர்கள்" },
  { id: "Health", label_en: "Health & Medical", label_ta: "சுகாதாரம்" },
  { id: "Social Welfare", label_en: "Pensions & Welfare", label_ta: "ஓய்வூதியம் & சமூகம்" },
  { id: "Employment", label_en: "Employment", label_ta: "வேலைவாய்ப்பு" },
  { id: "Differently Abled Welfare", label_en: "Differently Abled", label_ta: "மாற்றுத்திறனாளிகள்" },
];

export default function AwarenessSchemes() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const schemes = useMemo(() => getAllSchemes(), []);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      const matchesCategory =
        activeCategory === "all" || scheme.category_en === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        scheme.name_en?.toLowerCase().includes(q) ||
        scheme.name_ta?.toLowerCase().includes(q) ||
        scheme.benefits_en?.toLowerCase().includes(q) ||
        scheme.benefits_ta?.toLowerCase().includes(q) ||
        scheme.financial_benefit_en?.toLowerCase().includes(q) ||
        scheme.financial_benefit_ta?.toLowerCase().includes(q) ||
        scheme.department_en?.toLowerCase().includes(q)
      );
    });
  }, [schemes, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <AwarenessSubNav activePath="/awareness/schemes" />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-pink-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {T("Tamil Nadu Government Welfare Schemes 2026", "தமிழ்நாடு அரசு நலத்திட்டங்கள் தகவல் களஞ்சியம்")}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {T("Citizen Entitlements & Welfare Directory", "அரசு நிதி உதவி & மக்கள் நலத்திட்டங்கள்")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {T(
                "Verified eligibility criteria, monthly payout amounts, required documents, and official application procedures for Tamil Nadu citizens.",
                "கலைஞர் மகளிர் உரிமைத் தொகை, புதுமைப் பெண், முதலமைச்சர் காப்பீடு உள்ளிட்ட திட்டங்களின் தகுதி விதிகள், தேவையான ஆவணங்கள் மற்றும் விண்ணப்பிக்கும் முறை."
              )}
            </p>
          </div>

          {/* Quick Search & Stats */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={T(
                  "Search schemes (e.g. Magalir, 1000, Pudhumai Penn, Pension, CMCHIS)...",
                  "திட்டங்களைத் தேடுங்கள் (எ.கா: மகளிர் உரிமை, 1000, புதுமைப் பெண், காப்பீடு)..."
                )}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {T("Clear", "அழி")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{filteredSchemes.length} {T("Active Schemes", "திட்டங்கள்")}</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
            {SCHEME_FILTERS.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {T(cat.label_en, cat.label_ta)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Schemes Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredSchemes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              {T("No schemes found matching your search.", "உங்கள் தேடலுக்கு ஏற்ற திட்டங்கள் கிடைக்கவில்லை.")}
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
            >
              {T("Reset Filters", "வடிகட்டியை மீட்டமை")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => {
              const catConfig = CATEGORY_MAP[scheme.category_en] || {
                icon: Award,
                color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
                badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
              };
              const Icon = catConfig.icon;
              const name = T(scheme.name_en, scheme.name_ta);
              const dept = T(scheme.department_en, scheme.department_ta);
              const benefit = T(
                scheme.financial_benefit_en || scheme.benefits_en,
                scheme.financial_benefit_ta || scheme.benefits_ta
              );
              const categoryBadge = T(scheme.category_en, scheme.category_ta);

              return (
                <article
                  key={scheme.slug}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 sm:p-7">
                    {/* Top Row: Icon, Category & Department */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${catConfig.color} transition-transform group-hover:scale-105`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span
                            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${catConfig.badge}`}
                          >
                            {categoryBadge}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="line-clamp-1 max-w-[220px]">{dept}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scheme Title */}
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      <Link href={`/schemes/${scheme.slug}`}>
                        {name}
                      </Link>
                    </h2>

                    {/* Benefit Highlight Banner */}
                    <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                      <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 leading-snug">
                        {benefit}
                      </p>
                    </div>

                    {/* Documents Needed Pill */}
                    {scheme.documents_required_en && (
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        📋 <span className="font-semibold text-slate-700 dark:text-slate-300">{scheme.documents_required_en.length} {T("Key Documents Required", "ஆவணங்கள் தேவை")}</span> (Aadhaar, Ration Card, Bank Passbook)
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 sm:px-7 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    {scheme.apply_url ? (
                      <a
                        href={scheme.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <span>{T("Official Portal", "அரசு தளம்")}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {T("Apply via e-Sevai / CSC", "e-Sevai மையம் மூலம்")}
                      </span>
                    )}

                    <Link
                      href={`/schemes/${scheme.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all group-hover:translate-x-0.5"
                    >
                      <span>{T("Check Eligibility & Apply", "முழு விவரம் & விண்ணப்பிக்க")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Escalation CTA Banner */}
        <section className="mt-14 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-800/80 text-indigo-200 mb-3">
              {T("Citizen Entitlement Protection", "உரிமை பாதுகாப்பு")}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {T("Was Your Scheme Application Rejected or Delayed?", "உங்கள் மனு நிராகரிக்கப்பட்டதா அல்லது தாமதமாகிறதா?")}
            </h3>
            <p className="mt-3 text-sm text-indigo-100 leading-relaxed">
              {T(
                "If an officer demands a bribe or your legitimate application has been stalled beyond the statutory timeframe, file an anonymous report on VizhiTN to trigger administrative review.",
                "அரசு திட்டத்திற்கு தகுதி இருந்தும் மறுக்கப்பட்டாலோ அல்லது லஞ்சம் கோரப்பட்டாலோ, VizhiTN தளத்தில் பதிவிட்டு மாவட்ட ஆட்சியர் மற்றும் துறை கவனத்திற்கு கொண்டு செல்லுங்கள்."
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md hover:bg-indigo-50 transition-colors"
              >
                {T("Report Grievance on VizhiTN", "VizhiTN-ல் புகார் பதிவு செய்")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/rights"
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-800/60 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl border border-indigo-700 transition-colors"
              >
                {T("Read Citizen Statutory Rights", "குடிமக்கள் உரிமைகள்")}
              </Link>
            </div>
          </div>
        </section>

        {/* Internal Cross Linking */}
        <AwarenessRelatedLinks currentSection="schemes" />
      </main>
    </div>
  );
}
