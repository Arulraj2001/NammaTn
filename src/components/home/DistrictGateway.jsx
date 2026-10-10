"use client";

import React, { useState, useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { Search, MapPin, ArrowRight, Building, Compass } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { DISTRICTS } from "@/lib/districts";

const REGIONS = [
  { id: "all", labelEn: "All 38 Districts", labelTa: "அனைத்து 38 மாவட்டங்கள்" },
  { id: "north", labelEn: "North TN", labelTa: "வட தமிழகம்" },
  { id: "west", labelEn: "West TN / Kongu", labelTa: "கொங்கு & மேற்கு" },
  { id: "central", labelEn: "Central TN / Delta", labelTa: "மத்திய & டெல்டா" },
  { id: "south", labelEn: "South TN / Pandiya", labelTa: "தென் தமிழகம்" },
];

export default function DistrictGateway() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" && ta ? ta : en);

  const [activeRegion, setActiveRegion] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDistricts = useMemo(() => {
    return DISTRICTS.filter((d) => {
      const matchesRegion = activeRegion === "all" || d.region === activeRegion;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesRegion;

      const matchesSearch =
        d.name_en.toLowerCase().includes(term) ||
        (d.name_ta && d.name_ta.toLowerCase().includes(term)) ||
        d.slug.toLowerCase().includes(term);

      return matchesRegion && matchesSearch;
    });
  }, [activeRegion, searchTerm]);

  return (
    <section className="py-12 bg-white dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>{T("Hyperlocal Directory", "38 மாவட்ட கள தகவல் மய்யம்")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {T("Explore Tamil Nadu District Hubs", "உங்கள் மாவட்டத்தின் அதிகாரப்பூர்வ அறிவிப்புகள்")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {T("Direct citizen reports, TANGEDCO power schedules, and administrative news for all 38 districts.", "அனைத்து 38 மாவட்டங்களுக்கான நேரடி கள நிலவரங்கள், மின்வெட்டு அட்டவணை மற்றும் உள்ளாட்சி தகவல்கள்.")}
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={T("Search district (e.g. Salem, Trichy)...", "மாவட்டம் தேடு...")}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {REGIONS.map((reg) => {
            const isActive = activeRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setActiveRegion(reg.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(reg.labelEn, reg.labelTa)}
              </button>
            );
          })}
        </div>

        {/* District Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredDistricts.map((district) => {
            const name = T(district.name_en, district.name_ta);
            return (
              <Link
                key={district.slug}
                to={`/district/${district.slug}`}
                className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {name}
                  </span>
                  <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                  <span className="capitalize">{district.region}</span>
                  <span className="font-bold group-hover:translate-x-0.5 transition-transform text-blue-600 dark:text-blue-400">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredDistricts.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            {T("No matching districts found.", "பொருத்தமான மாவட்டம் எதுவும் கிடைக்கவில்லை.")}
          </div>
        )}
      </div>
    </section>
  );
}
