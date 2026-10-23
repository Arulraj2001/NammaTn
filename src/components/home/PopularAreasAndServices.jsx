"use client";

import React, { useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getAreas } from "@/services/areas";

const AREA_IMAGES = {
  velachery: "/images/areas/velachery.webp",
  "anna-nagar": "/images/areas/anna-nagar.webp",
  adyar: "/images/areas/adyar.webp",
  tambaram: "/images/areas/tambaram.webp",
  "rs-puram": "/images/areas/rs-puram.webp",
  "t-nagar": "/images/areas/t-nagar.webp",
  "kk-nagar": "/images/areas/kk-nagar.webp",
  perambur: "/images/areas/perambur.webp",
  srirangam: "/images/areas/srirangam.webp",
  "saibaba-colony": "/images/areas/saibaba-colony.webp",
  singanallur: "/images/areas/singanallur.webp",
  "thillai-nagar": "/images/areas/thillai-nagar.webp",
};
const getAreaImage = (slug) => AREA_IMAGES[slug] || "/images/areas/default.webp";

const CIVIC_SERVICES = [
  { path: "/power-cuts-today-tamil-nadu", icon: "⚡", label_en: "Power Cuts",      label_ta: "மின் விவரம்",   sub_en: "EB Outage Info",         sub_ta: "மின்தடை நேரம்" },
  { path: "/esevai",                      icon: "📋", label_en: "e-Sevai Guide",   label_ta: "இ-சேவை",       sub_en: "Certificates",           sub_ta: "சான்றிதழ்கள்" },
  { path: "/schemes",                     icon: "🏛️", label_en: "Welfare Schemes", label_ta: "அரசுத் திட்டம்",sub_en: "Direct Benefits",       sub_ta: "மக்கள் நல உதவி" },
  { path: "/helplines",                   icon: "📞", label_en: "Helplines Desk",  label_ta: "அவசர உதவி",    sub_en: "24x7 Hotlines",          sub_ta: "அரசு எண்கள்" },
  { path: "/rti",                         icon: "⚖️", label_en: "RTI Assistant",   label_ta: "ஆர்டிஐ",       sub_en: "Citizen Rights",         sub_ta: "தகவல் உரிமை" },
];

export default function PopularAreasAndServices() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const { data: areas = [] } = useQuery({
    queryKey: ["home-areas"],
    queryFn: () => getAreas(10),
    staleTime: 300_000,
  });

  const topAreas = useMemo(() => {
    return [...areas]
      .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
      .slice(0, 5);
  }, [areas]);

  return (
    <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Popular Areas */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {T("Popular Areas", "பிரபலமான பகுதிகள்")}
              </h2>
              <Link to="/areas" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {T("View all areas", "அனைத்து பகுதிகள்")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {(topAreas.length > 0 ? topAreas : [
                { id: "1", name_en: "Velachery", name_ta: "வேளச்சேரி", post_count: 156, slug: "velachery" },
                { id: "2", name_en: "Anna Nagar", name_ta: "அண்ணா நகர்", post_count: 142, slug: "anna-nagar" },
                { id: "3", name_en: "Adyar", name_ta: "அடையாறு", post_count: 128, slug: "adyar" },
                { id: "4", name_en: "Tambaram", name_ta: "தாம்பரம்", post_count: 114, slug: "tambaram" },
                { id: "5", name_en: "OMR", name_ta: "OMR", post_count: 98, slug: "omr" },
              ]).map((area) => (
                <Link key={area.id || area.slug} to={`/area/${area.slug}`} className="flex-shrink-0 flex flex-col items-center gap-2 group">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md group-hover:scale-105 transition-transform overflow-hidden border-2 border-white dark:border-slate-700 relative">
                    <span className="uppercase">
                      {(lang === "ta" ? area.name_ta || area.name_en : area.name_en)?.slice(0, 3)}
                    </span>
                    <Image
                      src={getAreaImage(area.slug)}
                      alt={area.name_en}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {lang === "ta" ? area.name_ta || area.name_en : area.name_en}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {area.post_count || 0} {T("updates", "தகவல்கள்")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: Government Services */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {T("Government Services", "அரசு சேவைகள்")}
              </h2>
              <Link to="/schemes" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {T("View all", "அனைத்தும்")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {CIVIC_SERVICES.map((service, i) => (
                <Link key={i} to={service.path}>
                  <div className="flex flex-col items-center text-center group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-xl mb-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                      {service.icon}
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-0.5">
                      {T(service.label_en, service.label_ta)}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {T(service.sub_en, service.sub_ta)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
