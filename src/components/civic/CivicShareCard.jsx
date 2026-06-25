import React, { useState } from "react";
import { Share2, Copy, CheckCircle, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { getCivicStatus, getDaysOpen } from "@/lib/civicReceipt";

/**
 * Generate context-aware share text based on current civic receipt status.
 * Each stage produces a different call-to-action message.
 */
function getContextShareText(post, url) {
  const location = post.area_name || post.district_name || "Tamil Nadu";
  const vCount = post.verification_count || 0;
  const daysOpen = getDaysOpen(post.created_date);
  const base = `\n🔗 Track: ${url}\n\n— NammaTN234 is a citizen documentation platform, not a government portal.`;

  switch (post.civic_status) {
    case "reported":
      return `📋 New civic issue documented in ${location}.\n\n"${post.title_en}"\n\nHelp verify — if you've seen this issue, confirm it on NammaTN234.${base}`;
    case "community_verified":
      return `✅ ${vCount} citizens confirmed this issue in ${location}.\n\n"${post.title_en}"\n\nOfficial complaint needed. Know the process? Help file it.${base}`;
    case "complaint_needed":
      return `⚠️ Community verified issue in ${location} waiting for official complaint.\n\n"${post.title_en}" — ${vCount} verified · ${daysOpen} days open\n\nAnyone can file the official complaint. Here's how →${base}`;
    case "complaint_filed":
      return `📄 Official complaint filed for "${post.title_en}" in ${location}.\n\nComplaint: ${post.official_complaint_id || "Filed"}\n${vCount} verified · ${daysOpen} days open\n\nTrack progress and follow up →${base}`;
    case "under_followup":
      return `🔄 Civic issue under follow-up in ${location}.\n\n"${post.title_en}"\n${vCount} verified · ${daysOpen} days open · Complaint filed\n\nHelp keep pressure — share and follow up →${base}`;
    case "claimed_fixed":
      return `🔍 "${post.title_en}" in ${location} claims to be fixed.\n\nHelp verify — is it really resolved? Visit and confirm.\n${vCount} verified · ${daysOpen} days open${base}`;
    case "citizen_verified_fixed":
      return `🎉 Civic win! "${post.title_en}" in ${location} resolved in ${daysOpen} days.\n\n${vCount} citizens helped verify this issue. Community power works.\n\nSee the proof →${base}`;
    case "unresolved_escalated":
      return `🔴 "${post.title_en}" in ${location} — UNRESOLVED after ${daysOpen} days.\n\n${vCount} citizens verified · Complaint filed · No resolution\n\nThis needs attention →${base}`;
    default:
      return `📋 NammaTN234 Civic Receipt: ${post.civic_receipt_id}\n"${post.title_en}"\n📍 ${location}\n📅 ${daysOpen} days open · ${vCount} verified${base}`;
  }
}

/**
 * Get a milestone prompt for the current status — encourages contextual sharing.
 */
function getMilestonePrompt(post, T) {
  switch (post.civic_status) {
    case "reported":
      return T("Share to get community verification", "சமுதாய சரிபார்ப்புக்கு பகிரவும்");
    case "community_verified":
    case "complaint_needed":
      return T("Share to help file an official complaint", "அதிகாரப்பூர்வ புகார் தாக்கல் செய்ய பகிரவும்");
    case "complaint_filed":
    case "under_followup":
      return T("Share to keep public pressure", "பொது அழுத்தத்தை வைக்க பகிரவும்");
    case "claimed_fixed":
      return T("Share to get fix verification", "சரிசெய்தல் சரிபார்ப்புக்கு பகிரவும்");
    case "citizen_verified_fixed":
      return T("🎉 Share this civic win!", "🎉 இந்த குடிமை வெற்றியை பகிரவும்!");
    case "unresolved_escalated":
      return T("Share — this issue needs attention", "பகிரவும் — இந்த சிக்கலுக்கு கவனம் தேவை");
    default:
      return T("Share this receipt", "இந்த ரசீதை பகிரவும்");
  }
}

export default function CivicShareCard({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const status = getCivicStatus(post.civic_status);
  const daysOpen = getDaysOpen(post.created_date);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = getContextShareText(post, url);
  const milestonePrompt = getMilestonePrompt(post, T);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `NammaTN234: ${post.civic_receipt_id}`, text: shareText, url });
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({ description: T("Share card text copied!", "பகிர்வு அட்டை உரை நகலெடுக்கப்பட்டது!") });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ description: T("Link copied!", "இணைப்பு நகலெடுக்கப்பட்டது!") });
  };

  const handleWhatsApp = () => {
    const waText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${waText}`, "_blank");
  };

  const thumbPhoto = post.before_photos?.[0] || post.media_urls?.[0];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden">
      {/* Milestone prompt */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-blue-400 font-semibold">📤 {milestonePrompt}</p>
      </div>

      {/* Card preview */}
      <div className="px-5 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-blue-400">{post.civic_receipt_id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
            </div>
            <h3 className="text-white font-bold text-sm leading-snug">{post.title_en}</h3>
            <p className="text-slate-400 text-xs mt-1">📍 {post.area_name || post.district_name}</p>
          </div>
          {thumbPhoto && (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700">
              <img src={thumbPhoto} alt="proof" className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
        </div>

        <div className="flex gap-4 text-xs">
          <div className="text-center">
            <p className="text-white font-bold text-base">{daysOpen}</p>
            <p className="text-slate-400">{T("days open", "நாட்கள்")}</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-base">{post.verification_count || 0}</p>
            <p className="text-slate-400">{T("verified", "சரிபார்த்தது")}</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-base">{post.still_not_fixed_count || 0}</p>
            <p className="text-slate-400">{T("not fixed", "சரி ஆகவில்லை")}</p>
          </div>
          {post.official_complaint_id && (
            <div className="text-center">
              <p className="text-amber-400 font-bold text-base">📄</p>
              <p className="text-slate-400">{T("complaint", "புகார்")}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-300 font-semibold">{T("Track on NammaTN234", "NammaTN234-ல் கண்காணிக்கவும்")}</p>
            <p className="text-[10px] text-slate-500 italic">{T("\"No issue closes without public proof.\"", "\"பொது ஆதாரம் இல்லாமல் எந்த சிக்கலும் மூடாது.\"")}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">TN</span>
          </div>
        </div>
      </div>

      {/* Share actions */}
      <div className="bg-slate-700/50 px-5 py-3 flex gap-2 flex-wrap border-t border-slate-700">
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </button>
        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            copied ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Share", "பகிர்")}
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-600 text-slate-300 hover:bg-slate-600 transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          {T("Copy Link", "இணைப்பை நகலெடு")}
        </button>
      </div>
    </div>
  );
}