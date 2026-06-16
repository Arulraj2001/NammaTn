import React, { useState } from "react";
import { ExternalLink, Copy, CheckCircle, Phone, Building2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { getDepartmentRoute } from "@/lib/departmentRouting";

export default function OfficialRouteSection({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  const route = getDepartmentRoute(post.category_slug);
  const complaintText = route.complaint_template ? route.complaint_template(post) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(complaintText);
    setCopied(true);
    toast({ description: T("Complaint text copied!", "புகார் உரை நகலெடுக்கப்பட்டது!") });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-4 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">
              🏛 {T("Official Complaint Route", "அதிகாரப்பூர்வ புகார் வழி")}
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{route.department}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{route.office_type}</p>
          </div>
          {route.phone && (
            <a
              href={`tel:${route.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-medium flex-shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              {route.phone}
            </a>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30">
        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            {T(
              "NammaTN is a public civic documentation platform. This routing is for guidance only — please file your complaint directly with the government portal.",
              "NammaTN ஒரு பொது குடிமை ஆவண தளம். இந்த வழிகாட்டல் உதவிக்காக மட்டுமே — நேரடியாக அரசு போர்ட்டலில் புகார் அளிக்கவும்."
            )}
          </span>
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Why this department */}
        <div className="flex items-start gap-2 text-sm">
          <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-300 text-xs mb-0.5">{T("Why this department?", "ஏன் இந்த துறை?")}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{route.reason}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            {T("How to file a complaint:", "புகார் எப்படி தாக்கல் செய்வது:")}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{route.instructions}</p>
        </div>

        {/* Official links */}
        <div className="flex flex-wrap gap-2">
          {route.complaint_portal && (
            <a
              href={route.complaint_portal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {T("File Complaint Online", "ஆன்லைனில் புகார் அளிக்கவும்")}
            </a>
          )}
          {route.official_website && (
            <a
              href={route.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {T("Official Website", "அதிகாரப்பூர்வ வலைத்தளம்")}
            </a>
          )}
        </div>

        {/* Complaint template toggle */}
        <div>
          <button
            onClick={() => setShowTemplate((p) => !p)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {showTemplate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {T("Copy-ready complaint message", "நகலெடுக்கத் தயாரான புகார் செய்தி")}
          </button>

          {showTemplate && (
            <div className="mt-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                {complaintText}
              </pre>
              <button
                onClick={handleCopy}
                className={`mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  copied
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy Complaint Text", "புகார் உரையை நகலெடு")}
              </button>
            </div>
          )}
        </div>

        {/* Expected timeline */}
        <div className="flex gap-4 text-xs border-t border-slate-100 dark:border-slate-700 pt-3">
          <div>
            <p className="text-slate-400">{T("Expected follow-up", "எதிர்பார்க்கப்படும் தொடர்")}</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{route.follow_up_days} {T("days", "நாட்கள்")}</p>
          </div>
          <div>
            <p className="text-slate-400">{T("Escalate if no action after", "நடவடிக்கை இல்லையென்றால் மேல்முறையீடு")}</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{route.escalation_days} {T("days", "நாட்கள்")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}