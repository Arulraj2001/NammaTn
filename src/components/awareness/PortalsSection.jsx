import React from "react";
import { Globe, Zap, ShieldAlert, FileText, MessageSquare, Heart, ArrowRight, ExternalLink, Building2 } from "lucide-react";
import Link from "next/link";
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

const COLOR_MAP = {
  "Government Services": "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  "Utilities": "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  "Police & Public Safety": "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  "Healthcare": "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  "Rights & Transparency": "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Grievance Redressal": "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Municipal Services": "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
};

export default function PortalsSection({ lang = "en" }) {
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const portals = getAllPortals().slice(0, 8);

  return (
    <section id="portals" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-civic-900 dark:text-white flex items-center gap-1.5">
            <span className="text-civic-500">🔗</span>
            {T("Official Government Portals", "அதிகாரப்பூர்வ அரசு இணையதளங்கள்")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {T("Verified .gov.in e-services for certificates, electricity, police, and grievances", "சான்றிதழ்கள், மின்வாரியம், காவல் மற்றும் குறைதீர்ப்பு இணையதளங்கள்")}
          </p>
        </div>
        <Link
          href="/awareness/portals"
          className="text-xs text-civic-600 dark:text-civic-300 hover:text-civic-800 dark:hover:text-white hover:underline flex items-center gap-1 font-bold flex-shrink-0"
        >
          {T("View all portals", "அனைத்து இணையதளங்கள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {portals.map((portal) => {
          const Icon = PORTAL_ICONS[portal.category_en] || Globe;
          const colorClass = COLOR_MAP[portal.category_en] || "bg-civic-100 text-civic-600";
          const name = T(portal.name_en, portal.name_ta);

          return (
            <div
              key={portal.slug}
              className="bg-white dark:bg-[#0D2B52] border-2 border-civic-200 dark:border-civic-800 hover:border-civic-500 rounded-2xl p-4 hover:shadow-md transition-all flex flex-col items-center text-center group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${colorClass} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-civic-900 dark:text-white group-hover:text-civic-600 dark:group-hover:text-civic-300 mb-1 line-clamp-2 leading-snug">
                <Link href={`/awareness/portal/${portal.slug}`}>
                  {name}
                </Link>
              </h3>
              <div className="flex gap-1.5 mt-auto w-full pt-2">
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1 border border-civic-200 dark:border-civic-700 text-civic-600 dark:text-civic-300 hover:bg-civic-50 dark:hover:bg-civic-900/40 rounded-lg py-1.5 text-xs font-bold transition-colors"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span>{T("Open", "திற")}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
