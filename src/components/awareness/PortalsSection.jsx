import React, { useState } from "react";
import { Globe, Zap, ShieldAlert, FileText, MessageSquare, CreditCard, Heart, BookOpen, ArrowRight, ExternalLink, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";

// Real TN government portals with verified URLs
const PORTALS = [
  {
    id: "esevai",
    icon: Globe,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    name_en: "TN e-Sevai Portal",
    name_ta: "TN e-சேவை இணையதளம்",
    desc_en: "150+ government e-services online",
    desc_ta: "150+ அரசு இ-சேவைகள் ஆன்லைனில்",
    url: "https://www.tnesevai.tn.gov.in",
  },
  {
    id: "tneb",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    name_en: "TANGEDCO / TNEB",
    name_ta: "TANGEDCO / மின்சார வாரியம்",
    desc_en: "Bill payment, new connections & complaints",
    desc_ta: "கட்டண செலுத்துதல், புதிய இணைப்பு & புகார்கள்",
    url: "https://www.tnebltd.org",
  },
  {
    id: "police",
    icon: ShieldAlert,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    name_en: "TN Police e-Services",
    name_ta: "TN காவல்துறை இ-சேவைகள்",
    desc_en: "FIR filing, character certificate, complaints",
    desc_ta: "FIR பதிவு, நடத்தை சான்றிதழ், புகார்கள்",
    url: "https://eservices.tnpolice.gov.in",
  },
  {
    id: "ration",
    icon: CreditCard,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    name_en: "TN PDS — Ration Card",
    name_ta: "TN PDS — குடும்ப அட்டை",
    desc_en: "Ration card services, PDS status & updates",
    desc_ta: "குடும்ப அட்டை சேவைகள், PDS நிலை",
    url: "https://www.tnpds.gov.in",
  },
  {
    id: "cmchis",
    icon: Heart,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    name_en: "CMCHIS Health Portal",
    name_ta: "CMCHIS சுகாதார இணையதளம்",
    desc_en: "Free health insurance up to ₹5 lakh/year",
    desc_ta: "ஆண்டுக்கு ₹5 லட்சம் வரை இலவச காப்பீடு",
    url: "https://www.cmchis.com",
  },
  {
    id: "rti",
    icon: FileText,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    name_en: "RTI Online Portal",
    name_ta: "RTI ஆன்லைன் இணையதளம்",
    desc_en: "File Right to Information applications online",
    desc_ta: "தகவல் உரிமை விண்ணப்பங்களை ஆன்லைனில்",
    url: "https://rtionline.gov.in",
  },
  {
    id: "grievance",
    icon: MessageSquare,
    color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    name_en: "CM Grievance — CMS",
    name_ta: "முதலமைச்சர் புகார் மையம்",
    desc_en: "Public grievances & online complaint tracking",
    desc_ta: "பொது புகார்கள் & ஆன்லைன் கண்காணிப்பு",
    url: "https://cms.tn.gov.in",
  },
  {
    id: "myscheme",
    icon: BookOpen,
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    name_en: "myScheme — Scheme Finder",
    name_ta: "myScheme — திட்ட தேடல்",
    desc_en: "Discover all govt schemes by eligibility",
    desc_ta: "தகுதியின்படி அரசு திட்டங்களை கண்டறியுங்கள்",
    url: "https://www.myscheme.gov.in",
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="text-blue-500">🔗</span>
          {T("Official Links", "அதிகாரப்பூர்வ இணைப்புகள்")}
        </h2>
        <Link
          to="/awareness/portals"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all portals", "அனைத்து இணையதளங்கள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {PORTALS.map((portal) => {
          const Icon = portal.icon;
          return (
            <div
              key={portal.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${portal.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 dark:text-white mb-1 line-clamp-2 leading-snug">
                {T(portal.name_en, portal.name_ta)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 hidden sm:block">
                {T(portal.desc_en, portal.desc_ta)}
              </p>
              <div className="flex gap-1.5 mt-auto w-full">
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg py-1.5 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline">{T("Open", "திற")}</span>
                </a>
                <button
                  onClick={() => handleCopy(portal.url, portal.id)}
                  className="flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-2 py-1.5 text-xs transition-colors"
                  title="Copy link"
                >
                  {copiedId === portal.id
                    ? <Check className="w-3 h-3 text-green-500" />
                    : <Copy className="w-3 h-3" />
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { PORTALS };
