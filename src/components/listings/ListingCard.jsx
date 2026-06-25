import React, { useState } from "react";
import { Phone, MessageCircle, Star, MapPin, BadgeCheck, Sparkles, Crown, Shield, Flag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryMeta } from "@/lib/listingCategories";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/spamGuard";

const REPORT_REASONS = [
  { value: "fake_listing", label: "Fake listing" },
  { value: "scam_fraud", label: "Scam / Fraud" },
  { value: "wrong_contact", label: "Wrong contact info" },
  { value: "misleading", label: "Misleading info" },
  { value: "spam", label: "Spam / Duplicate" },
  { value: "other", label: "Other" },
];

export default function ListingCard({ listing, featured }) {
  const { lang } = useLanguage();
  const cat = getCategoryMeta(listing.category);
  const avgRating = listing.rating_count > 0 ? (listing.rating_sum / listing.rating_count).toFixed(1) : null;

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("fake_listing");
  const [reported, setReported] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReport = async () => {
    if (submitting || reported) return;
    setSubmitting(true);
    const session = getSession();
    const key = `listing_reported_${listing.id}_${session}`;
    if (localStorage.getItem(key)) { setReported(true); setShowReport(false); setSubmitting(false); return; }
    await base44.entities.Report.create({
      target_type: "local_listing",
      target_id: listing.id,
      reason: reportReason,
      reporter_session: session,
    }).catch(() => {});
    await base44.entities.LocalListing.update(listing.id, { report_count: (listing.report_count || 0) + 1 }).catch(() => {});
    localStorage.setItem(key, "1");
    setReported(true);
    setShowReport(false);
    setSubmitting(false);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 border rounded-2xl overflow-hidden transition-all hover:shadow-md ${featured ? "border-amber-300 dark:border-amber-700 shadow-sm" : "border-slate-200 dark:border-slate-700"}`}>
      {/* Photos */}
      {listing.photo_urls?.length > 0 ? (
        <img src={listing.photo_urls[0]} alt={listing.business_name} className="w-full h-36 object-cover" />
      ) : (
        <div className="w-full h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl">
          {cat.icon}
        </div>
      )}

      <div className="p-4">
        {/* Badges row — clear separation of Verified vs Sponsored vs Featured */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {listing.is_verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white" title="VizhiTN reviewed basic listing details">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          )}
          {listing.is_featured && !listing.is_sponsored && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white" title="Highlighted placement">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
          {listing.is_sponsored && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white" title="Paid/promoted placement">
              <Crown className="w-3 h-3" /> Sponsored
            </span>
          )}
          {listing.is_community_recommended && !listing.is_verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
              <Shield className="w-3 h-3" /> Community Rec.
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 truncate">{listing.business_name}</h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <span className="text-base">{cat.icon}</span>
          <span>{lang === "ta" ? cat.label_ta : cat.label}</span>
          {listing.area_name && (
            <>
              <span>·</span>
              <MapPin className="w-3 h-3" />
              <span>{listing.area_name}</span>
            </>
          )}
        </div>

        {avgRating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{avgRating}</span>
            <span className="text-xs text-slate-400">({listing.rating_count})</span>
          </div>
        )}

        {listing.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{listing.description}</p>
        )}

        {/* Contact */}
        <div className="flex gap-2 mt-3">
          {listing.contact_phone && (
            <a href={`tel:${listing.contact_phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          )}
          {listing.contact_whatsapp && (
            <a href={`https://wa.me/${listing.contact_whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
        </div>

        {/* Report */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          {reported ? (
            <span className="text-xs text-slate-400">Reported. Thank you.</span>
          ) : showReport ? (
            <div className="flex items-center gap-2 flex-wrap">
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none flex-1 min-w-0">
                {REPORT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <button onClick={handleReport} disabled={submitting}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 flex-shrink-0">
                {submitting ? "..." : "Submit"}
              </button>
              <button onClick={() => setShowReport(false)} className="text-xs text-slate-400 hover:text-slate-600 flex-shrink-0">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowReport(true)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
              <Flag className="w-3 h-3" /> Report listing
            </button>
          )}
        </div>

        {/* Badge disclaimer */}
        {(listing.is_verified || listing.is_sponsored || listing.is_featured) && (
          <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
            {listing.is_verified && "Verified = VizhiTN reviewed basic details. "}
            {listing.is_sponsored && "Sponsored = Paid placement. "}
            {listing.is_featured && !listing.is_sponsored && "Featured = Highlighted placement. "}
            Always use your own judgment.
          </p>
        )}
      </div>
    </div>
  );
}