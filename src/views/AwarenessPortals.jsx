"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe, Zap, CreditCard, ShieldAlert, Heart, FileText,
  MessageSquare, BookOpen, ExternalLink, Copy, Check,
  Search, X, ShieldCheck, Lock, Sparkles, Filter, Building2,
  ArrowRight, ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import { getAllPortals } from "@/lib/awarenessServer";

const PORTAL_ICONS = {
  "Government Services": Globe,
  "Utilities": Zap,
  "Police & Public Safety": ShieldAlert,
  "Healthcare": Heart,
  "Rights & Transparency": FileText,
  "Grievance Redressal": MessageSquare,
  "Municipal Services": Building2,
};

const PORTAL_COLORS = {
  "Government Services": "text-blue-600 bg-blue-500/10 border-blue-500/20",
  "Utilities": "text-amber-600 bg-amber-500/10 border-amber-500/20",
  "Police & Public Safety": "text-purple-600 bg-purple-500/10 border-purple-500/20",
  "Healthcare": "text-red-600 bg-red-500/10 border-red-500/20",
  "Rights & Transparency": "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  "Grievance Redressal": "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
  "Municipal Services": "text-teal-600 bg-teal-500/10 border-teal-500/20",
};

const PORTAL_FILTERS = [
  { id: "all", label_en: "All Portals", label_ta: "அனைத்தும்" },
  { id: "Government Services", label_en: "e-Sevai & Services", label_ta: "அரசு சேவைகள்" },
  { id: "Utilities", label_en: "Electricity & Water", label_ta: "மின்சாரம் & குடிநீர்" },
  { id: "Police & Public Safety", label_en: "Police & Safety", label_ta: "காவல்துறை" },
  { id: "Healthcare", label_en: "Health & CMCHIS", label_ta: "சுகாதாரம்" },
  { id: "Rights & Transparency", label_en: "RTI & Rights", label_ta: "RTI & உரிமைகள்" },
  { id: "Grievance Redressal", label_en: "CM Helpline (CMS)", label_ta: "குறைதீர்ப்பு" },
  { id: "Municipal Services", label_en: "Municipal & GCC", label_ta: "மாநகராட்சி" },
];

export default function AwarenessPortals() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const portals = useMemo(() => getAllPortals(), []);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyUrl = (e, url, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredPortals = useMemo(() => {
    return portals.filter((p) => {
      const matchesCategory =
        activeCategory === "all" || p.category_en === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name_en?.toLowerCase().includes(q) ||
        p.name_ta?.toLowerCase().includes(q) ||
        p.description_en?.toLowerCase().includes(q) ||
        p.description_ta?.toLowerCase().includes(q) ||
        p.dept_en?.toLowerCase().includes(q) ||
        p.url?.toLowerCase().includes(q)
      );
    });
  }, [portals, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <AwarenessSubNav activePath="/awareness/portals" />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {T("100% Genuine .gov.in and .nic.in Portals", "100% சரிபார்க்கப்பட்ட அரசு இணையதளங்கள்")}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {T("Official Tamil Nadu Government Portals", "அதிகாரப்பூர்வ அரசு இணையதளங்கள்")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {T(
                "Access verified state and central government digital portals for citizen certificates, bill payments, police e-FIRs, RTI petitions, and Chief Minister grievances.",
                "சான்றிதழ்கள், மின்கட்டணம், ரேஷன் அட்டை, காவல்துறை புகார்கள் மற்றும் முதல்வர் தனிப்பிரிவு மனுக்களுக்கான அதிகாரப்பூர்வ இணையதளங்களின் நேரடி தொகுப்பு."
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
                  "Search portals (e.g. esevai, tnebltd, tnpds, police, rti, cms)...",
                  "இணையதளங்களைத் தேடுங்கள் (எ.கா: இ-சேவை, மின்வாரியம், ரேஷன், காவல், rti)..."
                )}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{filteredPortals.length} {T("Verified Portals", "இணையதளங்கள்")}</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
            {PORTAL_FILTERS.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-cyan-600 text-white shadow-sm"
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

      {/* Portals Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredPortals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              {T("No portals found matching your search.", "உங்கள் தேடலுக்கு ஏற்ற இணையதளங்கள் கிடைக்கவில்லை.")}
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-lg hover:bg-cyan-700"
            >
              {T("Reset Filters", "வடிகட்டியை மீட்டமை")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortals.map((portal) => {
              const Icon = PORTAL_ICONS[portal.category_en] || Globe;
              const colorClass =
                PORTAL_COLORS[portal.category_en] || "text-blue-600 bg-blue-500/10 border-blue-500/20";
              const name = T(portal.name_en, portal.name_ta);
              const desc = T(portal.description_en, portal.description_ta);
              const dept = T(portal.dept_en, portal.dept_ta);
              const categoryBadge = T(portal.category_en, portal.category_ta);
              const cleanUrl = portal.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

              return (
                <article
                  key={portal.slug}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6">
                    {/* Top Row: Icon, Category & Department */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorClass} transition-transform group-hover:scale-105`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {categoryBadge}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="line-clamp-1 max-w-[180px]">{dept}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Portal Title */}
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                      <Link href={`/awareness/portal/${portal.slug}`}>
                        {name}
                      </Link>
                    </h2>

                    {/* Description */}
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {desc}
                    </p>

                    {/* Verified Domain Pill */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                        {cleanUrl}
                      </span>
                      <button
                        onClick={(e) => handleCopyUrl(e, portal.url, portal.slug)}
                        title="Copy official URL"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex-shrink-0"
                      >
                        {copiedId === portal.slug ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === portal.slug ? T("Copied!", "நகல்!") : T("Copy", "நகல்")}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <Link
                      href={`/awareness/portal/${portal.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    >
                      <span>{T("Services Guide", "சேவை வழிகாட்டல்")}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all group-hover:translate-x-0.5"
                    >
                      <span>{T("Launch Portal", "தளத்திற்குச் செல்")}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Security / Anti-Phishing Advisory */}
        <section className="mt-14 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {T("Anti-Phishing Safety: How to Identify Genuine Government Portals", "இணையதள பாதுகாப்பு: போலி தளங்களை எவ்வாறு கண்டறிவது?")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {T(
                  "Scammers frequently create look-alike domains for electricity bills and ration updates. Genuine Tamil Nadu portals exclusively end with '.tn.gov.in', '.gov.in', or '.nic.in'. Never enter your bank password, debit card CVV, or Aadhaar OTP on any commercial domain (.com/.in) pretending to be a department.",
                  "மின் கட்டணம், ரேஷன் கார்டு போன்ற பெயர்களில் போலியான இணையதளங்கள் உருவாக்கப்படுகின்றன. அதிகாரப்பூர்வ தமிழ்நாடு அரசு தளங்கள் '.tn.gov.in' அல்லது '.gov.in' என்றே முடியும். பிற வணிக தளங்களில் ஆதார் OTP அல்லது வங்கி விவரங்களை பகிர வேண்டாம்."
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/awareness/guide/cyber-fraud"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {T("Read 1930 Cyber Fraud SOP", "1930 சைபர் க்ரைம் வழிகாட்டல்")}
                </Link>
                <Link
                  href="/awareness/guides"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-amber-600/40 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                >
                  {T("All Citizen Guides", "அனைத்து வழிகாட்டிகள்")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Cross Linking */}
        <AwarenessRelatedLinks currentSection="portals" />
      </main>
    </div>
  );
}
