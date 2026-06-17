import React, { useState } from "react";
import { Globe, Zap, ShieldAlert, FileText, MessageSquare, ArrowRight, ExternalLink, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";

const PORTALS = [
  {
    id: "esevai",
    icon: Globe,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    name_en: "TN e-Sevai Portal",
    name_ta: "TN e-சேவை இணையதளம்",
    desc_en: "Government e-services online",
    desc_ta: "அரசு இ-சேவைகள் ஆன்லைன்",
    url: "https://www.tnesevai.tn.gov.in",
  },
  {
    id: "electricity",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    name_en: "TN Electricity Board",
    name_ta: "TN மின்சார வாரியம்",
    desc_en: "Bill payment, complaints and services",
    desc_ta: "பில் கட்டணம், புகார்கள் மற்றும் சேவைகள்",
    url: "https://www.tneb.in",
  },
  {
    id: "police",
    icon: ShieldAlert,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    name_en: "Police Complaint Portal",
    name_ta: "காவல்துறை புகார் இணையதளம்",
    desc_en: "Lodge online complaints and FIR",
    desc_ta: "ஆன்லைன் புகார் மற்றும் FIR பதிவு",
    url: "https://www.eservices.tnpolice.gov.in",
  },
  {
    id: "rti",
    icon: FileText,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    name_en: "RTI Online Portal",
    name_ta: "RTI ஆன்லைன் இணையதளம்",
    desc_en: "File RTI applications online",
    desc_ta: "RTI விண்ணப்பங்களை ஆன்லைனில் செய்யுங்கள்",
    url: "https://rtionline.gov.in",
  },
  {
    id: "cmhelpline",
    icon: MessageSquare,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    name_en: "CM Helpline",
    name_ta: "முதலமைச்சர் உதவி எண்",
    desc_en: "Public grievances and complaints",
    desc_ta: "பொது புகார்கள் மற்றும் முறையீடுகள்",
    url: "https://www.cms.tn.gov.in",
  },
];

export default function PortalsSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <section id="portals" className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="text-blue-500">🔗</span>
          {T("Official Links", "அதிகாரப்பூர்வ இணைப்புகள்")}
        </h2>
        <Link
          to="/awareness"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all portals", "அனைத்து இணையதளங்கள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5-column grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {PORTALS.map((portal) => {
          const Icon = portal.icon;
          const name = T(portal.name_en, portal.name_ta);
          const desc = T(portal.desc_en, portal.desc_ta);

          return (
            <div
              key={portal.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${portal.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1 line-clamp-2 leading-snug">
                {name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{desc}</p>

              <div className="flex gap-2 mt-auto w-full">
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
                >
                  {T("Open Site", "திற")}
                </a>
                <button
                  onClick={() => handleCopy(portal.url, portal.id)}
                  className="flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
                >
                  {copiedId === portal.id ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span className="ml-0.5">{T("Copy Link", "நகலெடு")}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
