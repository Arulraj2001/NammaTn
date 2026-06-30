import React, { useState, useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { Search, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { DISTRICTS } from "@/lib/districts";
import { Input } from "@/components/ui/input";

const REGIONS = ["all", "north", "south", "central", "west"];

export default function Districts() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");

  const filtered = useMemo(() =>
    DISTRICTS.filter((d) => {
      const matchSearch = search === "" ||
        d.name_en.toLowerCase().includes(search.toLowerCase()) ||
        d.name_ta.includes(search);
      const matchRegion = region === "all" || d.region === region;
      return matchSearch && matchRegion;
    }), [search, region]
  );

  const REGION_LABELS = { all: T("All", "அனைத்தும்"), north: T("North", "வடக்கு"), south: T("South", "தெற்கு"), central: T("Central", "மத்திய"), west: T("West", "மேற்கு") };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {T("All Districts", "அனைத்து மாவட்டங்கள்")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {T("Explore community posts from all 38 districts of Tamil Nadu.", "தமிழ்நாட்டின் 38 மாவட்டங்களின் சமுதாய பதிவுகளை ஆராயுங்கள்.")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={T("Search districts...", "மாவட்டங்களை தேடுங்கள்...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                region === r
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {REGION_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {filtered.length} {T("districts found", "மாவட்டங்கள் கண்டுபிடிக்கப்பட்டன")}
      </p>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.03 } }, hidden: {} }}
      >
        {filtered.map((d) => (
          <motion.div key={d.slug} variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
            <Link to={`/district/${d.slug}`}>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 transition-all duration-200 text-center group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {T(d.name_en, d.name_ta)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 capitalize">{d.region}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}