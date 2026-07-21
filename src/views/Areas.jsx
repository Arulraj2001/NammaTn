"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { MapPin, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getAreas } from "@/services/areas";
import { DISTRICTS } from "@/lib/districts";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Areas({ initialAreas = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  usePageMeta({ title: "Hyperlocal Areas – VizhiTN", description: "Browse local areas in Tamil Nadu" });

  const { data: areas = [], isLoading } = useQuery({
    queryKey: ["areas"],
    queryFn: () => getAreas(100),
    initialData: initialAreas,
    staleTime: 3_600_000,
  });

  const filtered = areas.filter((a) => {
    const matchSearch = !search || a.name_en.toLowerCase().includes(search.toLowerCase()) || a.name_ta?.includes(search);
    const matchDistrict = !selectedDistrict || a.district_slug === selectedDistrict;
    return matchSearch && matchDistrict;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{T("Hyperlocal Areas", "உள்ளூர் பகுதிகள்")}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{T("Find updates, alerts & discussions for your area", "உங்கள் பகுதியின் புதுப்பிப்புகள், எச்சரிக்கைகள் & விவாதங்கள்")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={T("Search areas...", "பகுதிகளை தேடுங்கள்...")}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{T("All Districts", "அனைத்து மாவட்டங்கள்")}</option>
          {DISTRICTS.map((d) => (
            <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{T("No areas found.", "பகுதிகள் கண்டுபிடிக்கப்படவில்லை.")}</p>
          <p className="text-xs mt-1">{T("Areas will appear as they are added by admin.", "நிர்வாகியால் சேர்க்கப்பட்டதும் பகுதிகள் தோன்றும்.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((area) => (
            <Link
              key={area.id}
              to={`/area/${area.slug}`}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {T(area.name_en, area.name_ta)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{area.district_name}</p>
              {area.zone && <p className="text-xs text-slate-400">{area.zone}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
