import React from "react";
import { FileText, MapPin, Clock, Users, Tag, Calendar } from "lucide-react";
import { format } from "date-fns";
import CivicStatusBadge from "./CivicStatusBadge";
import { getUrgency, getDaysOpen, CIVIC_STATUSES } from "@/lib/civicReceipt";
import { useLanguage } from "@/context/LanguageContext";

export default function CivicReceiptHeader({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const urgency = getUrgency(post.urgency_level);
  const days = getDaysOpen(post.created_date);
  const currentStep = CIVIC_STATUSES.find(s => s.key === (post.civic_status || "reported"))?.step || 1;
  const maxStep = 9;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {T("NammaTN Civic Receipt", "NammaTN குடிமை ரசீது")}
            </p>
            {post.civic_receipt_id && (
              <p className="text-base font-bold text-white font-mono tracking-wide">{post.civic_receipt_id}</p>
            )}
          </div>
        </div>
        <CivicStatusBadge status={post.civic_status || "reported"} />
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-3">
        <div className="flex items-center gap-1 mb-1">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(currentStep / maxStep) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 ml-2">{T(`Step ${currentStep}/${maxStep}`, `படி ${currentStep}/${maxStep}`)}</span>
        </div>
      </div>

      {/* Meta info grid */}
      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetaItem
          icon={MapPin}
          label={T("Location", "இடம்")}
          value={[post.district_name, post.area_name].filter(Boolean).join(", ") || "—"}
        />
        <MetaItem
          icon={Tag}
          label={T("Category", "வகை")}
          value={post.category_name || "—"}
        />
        <MetaItem
          icon={Calendar}
          label={T("Reported", "புகாரளிக்கப்பட்டது")}
          value={post.created_date ? format(new Date(post.created_date), "dd MMM yyyy") : "—"}
        />
        <MetaItem
          icon={Clock}
          label={T("Days Open", "திறந்திருக்கும் நாட்கள்")}
          value={`${days} ${T("days", "நாட்கள்")}`}
          valueClass={days > 30 ? "text-orange-600" : days > 7 ? "text-yellow-600" : "text-slate-700 dark:text-slate-200"}
        />
      </div>

      {/* Urgency + verifications */}
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${urgency.bg} ${urgency.color}`}>
          ⚡ {T(urgency.label, urgency.label_ta)}
        </span>
        {(post.verification_count || 0) > 0 && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
            <Users className="w-3 h-3 inline mr-1" />
            {post.verification_count} {T("community verified", "சமுதாயம் சரிபார்த்தது")}
          </span>
        )}
        {(post.official_complaint_id) && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
            📄 {post.official_complaint_id}
          </span>
        )}
        {post.location_text && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            📍 {post.location_text}
          </span>
        )}
      </div>

      {/* NammaTN disclaimer */}
      <div className="px-5 pb-4">
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          {T(
            "NammaTN helps citizens document, verify, route, track, and prove local issues. NammaTN is not a government office.",
            "NammaTN குடிமக்கள் உள்ளூர் சிக்கல்களை ஆவணப்படுத்த, சரிபார்க்க, கண்காணிக்க உதவுகிறது. NammaTN ஒரு அரசு அலுவலகம் அல்ல."
          )}
        </p>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value, valueClass = "text-slate-700 dark:text-slate-200" }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={`text-sm font-semibold truncate ${valueClass}`}>{value}</p>
    </div>
  );
}