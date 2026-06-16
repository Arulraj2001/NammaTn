import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building2, Clock, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { OFFICES } from "@/lib/offices";
import { DISTRICTS } from "@/lib/districts";
import { getReportsByDistrict } from "@/services/officeReports";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Offices() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [selectedDistrict, setSelectedDistrict] = useState("");

  usePageMeta({ title: "Office Experience Reports – TN Voice", description: "Community reports on Tamil Nadu government office waiting times and service quality" });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          {T("Office Experience Reports", "அலுவலக அனுபவ அறிக்கைகள்")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {T("Community-reported waiting times and service experiences", "சமுதாயம் பதிவிட்ட காத்திருப்பு நேரங்கள் மற்றும் சேவை அனுபவங்கள்")}
        </p>
      </div>

      <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}
        className="mb-6 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">{T("Filter by District", "மாவட்டம் தேர்வு")}</option>
        {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
      </select>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OFFICES.map((office) => (
          <Link key={office.slug}
            to={`/office/${office.slug}${selectedDistrict ? `?district=${selectedDistrict}` : ""}`}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
          >
            <div className="text-3xl mb-3">{office.icon}</div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
              {T(office.name_en, office.name_ta)}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{T("Waiting times", "காத்திருப்பு நேரம்")}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{T("Reviews", "மதிப்புரைகள்")}</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium group-hover:underline">
              {T("View Reports →", "அறிக்கைகளை பார்க்கவும் →")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}