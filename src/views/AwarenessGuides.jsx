"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Zap, Droplets, CreditCard, AlertTriangle, Ambulance,
  ShieldAlert, ShieldCheck, Home, FileText, ArrowRight,
  Search, Phone, Clock, ExternalLink, Sparkles, Filter,
  Building2, CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import { getAllGuides } from "@/lib/awarenessServer";

const CATEGORY_ICONS = {
  utilities: Zap,
  water: Droplets,
  civil_supplies: CreditCard,
  anti_corruption: AlertTriangle,
  healthcare: Ambulance,
  cyber_crime: ShieldAlert,
  property: Home,
  revenue: FileText,
};

const CATEGORY_COLORS = {
  utilities: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  water: "text-sky-600 bg-sky-500/10 border-sky-500/20",
  civil_supplies: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  anti_corruption: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  healthcare: "text-red-600 bg-red-500/10 border-red-500/20",
  cyber_crime: "text-purple-600 bg-purple-500/10 border-purple-500/20",
  property: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
  revenue: "text-teal-600 bg-teal-500/10 border-teal-500/20",
};

const FILTER_CATEGORIES = [
  { id: "all", label_en: "All Problems", label_ta: "அனைத்தும்" },
  { id: "utilities", label_en: "Electricity & Power", label_ta: "மின்சாரம்" },
  { id: "water", label_en: "Water & Sewage", label_ta: "குடிநீர்" },
  { id: "civil_supplies", label_en: "Ration & Civil Supplies", label_ta: "ரேஷன் கடை" },
  { id: "consumer", label_en: "Consumer & RTI", label_ta: "நுகர்வோர் & RTI" },
  { id: "healthcare", label_en: "Emergency & Health", label_ta: "மருத்துவ அவசரம்" },
  { id: "cyber_crime", label_en: "Cyber Crime", label_ta: "சைபர் கிரைம்" },
  { id: "property", label_en: "Property & Municipal", label_ta: "சொத்து வரி" },
  { id: "revenue", label_en: "Land & Patta", label_ta: "பட்டா & நிலம்" },
];

export default function AwarenessGuides() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const guides = useMemo(() => getAllGuides(), []);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesCategory =
        activeCategory === "all" || guide.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        guide.title_en?.toLowerCase().includes(q) ||
        guide.title_ta?.toLowerCase().includes(q) ||
        guide.summary_en?.toLowerCase().includes(q) ||
        guide.summary_ta?.toLowerCase().includes(q) ||
        guide.department_en?.toLowerCase().includes(q) ||
        guide.helpline_numbers?.some((num) => num.includes(q))
      );
    });
  }, [guides, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <AwarenessSubNav activePath="/awareness/guides" />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {T("Tamil Nadu Civic Action Protocols", "தமிழ்நாடு குடிமக்கள் தீர்வு வழிகாட்டிகள்")}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {T("What To Do When Government Services Fail You", "அரசு சேவைகள் தடைபடும் போது என்ன செய்ய வேண்டும்?")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {T(
                "Verified step-by-step Standard Operating Procedures (SOPs), copyable phone call scripts, official 24x7 helplines, and escalation paths for Tamil Nadu citizens.",
                "மின் தடை, குடிநீர் தட்டுப்பாடு, ரேஷன் முறைகேடு போன்ற அன்றாட பிரச்சினைகளுக்கு அதிகாரப்பூர்வ தீர்வு முறைகள் மற்றும் உதவி எண்கள்."
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
                  "Search problems (e.g. 1912, power cut, ration, water, patta)...",
                  "பிரச்சினைகளைத் தேடுங்கள் (எ.கா: மின் தடை, ரேஷன், பட்டா)..."
                )}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <span>{filteredGuides.length} {T("Verified Guides", "வழிகாட்டிகள்")}</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
            {FILTER_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
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

      {/* Guides Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredGuides.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              {T("No guides found matching your search.", "உங்கள் தேடலுக்கு ஏற்ற வழிகாட்டிகள் கிடைக்கவில்லை.")}
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
            >
              {T("Reset Filters", "வடிகட்டியை மீட்டமை")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredGuides.map((guide) => {
              const Icon = CATEGORY_ICONS[guide.category] || FileText;
              const colorClass =
                CATEGORY_COLORS[guide.category] || "text-blue-600 bg-blue-500/10 border-blue-500/20";
              const title = T(guide.title_en, guide.title_ta);
              const summary = T(guide.summary_en, guide.summary_ta);
              const dept = T(guide.department_en, guide.department_ta);
              const sla = T(guide.sla_time_en, guide.sla_time_ta);
              const primaryHelpline = guide.helpline_numbers?.[0];

              return (
                <article
                  key={guide.slug}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 sm:p-7">
                    {/* Top Row: Icon, Category & SLA */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass} transition-transform group-hover:scale-105`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {guide.problem_type_en || guide.category}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="line-clamp-1 max-w-[220px]">{dept}</span>
                          </div>
                        </div>
                      </div>

                      {sla && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="hidden sm:inline">{sla}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      <Link href={`/awareness/guide/${guide.slug}`}>
                        {title}
                      </Link>
                    </h2>

                    {/* Summary */}
                    <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {summary}
                    </p>

                    {/* Helplines Pill */}
                    {guide.helpline_numbers && guide.helpline_numbers.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          {T("Official Helpline:", "அரசு உதவி எண்:")}
                        </span>
                        {guide.helpline_numbers.map((num, i) => (
                          <a
                            key={i}
                            href={`tel:${num.replace(/[^0-9]/g, "")}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                          >
                            {num}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 sm:px-7 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {guide.steps_en?.length || 5} {T("Action Steps", "நடவடிக்கை படிகள்")}
                    </span>

                    <Link
                      href={`/awareness/guide/${guide.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all group-hover:translate-x-0.5"
                    >
                      <span>{T("Read Full SOP", "முழு வழிகாட்டல்")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Escalation CTA Banner */}
        <section className="mt-14 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-800/80 text-blue-200 mb-3">
              {T("Citizen Escalation Flywheel", "மக்கள் கண்காணிப்பு")}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {T("Did Government Officials Ignore Your Grievance?", "உங்கள் மனுவை அதிகாரிகள் அலட்சியப்படுத்துகிறார்களா?")}
            </h3>
            <p className="mt-3 text-sm text-blue-100 leading-relaxed">
              {T(
                "If statutory response timeframes have passed or an official delays without reason, report it on VizhiTN. Public evidence creates collective accountability.",
                "அரசு குறித்த காலக்கெடுவுக்குள் நடவடிக்கை எடுக்காவிட்டால், VizhiTN தளத்தில் ஆதாரங்களுடன் புகார் பதிவிட்டு துறைசார் மேலதிகாரிகளுக்கு தெரியப்படுத்துங்கள்."
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md hover:bg-blue-50 transition-colors"
              >
                {T("File Public Complaint", "பொது புகார் பதிவு செய்")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/rights"
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-800/60 hover:bg-blue-800 text-white font-bold text-xs rounded-xl border border-blue-700 transition-colors"
              >
                {T("Check Statutory Rights", "குடிமக்கள் உரிமைகள்")}
              </Link>
            </div>
          </div>
        </section>

        {/* Internal Cross Linking */}
        <AwarenessRelatedLinks currentSection="guides" />
      </main>
    </div>
  );
}
