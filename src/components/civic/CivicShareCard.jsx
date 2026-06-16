import React, { useState } from "react";
import { Share2, Copy, CheckCircle, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { getCivicStatus, getDaysOpen } from "@/lib/civicReceipt";

export default function CivicShareCard({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const status = getCivicStatus(post.civic_status);
  const daysOpen = getDaysOpen(post.created_date);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const shareText = `🔴 NammaTN Civic Receipt: ${post.civic_receipt_id}
📋 ${post.title_en}
📍 ${post.area_name || post.district_name}
📊 Status: ${status.label}
📅 ${daysOpen} days open · ${post.verification_count || 0} verified
🔗 Track: ${url}

"No issue closes without public proof."
— NammaTN is a citizen documentation platform, not a government portal.`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `NammaTN: ${post.civic_receipt_id}`, text: shareText, url });
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

  const thumbPhoto = post.before_photos?.[0] || post.media_urls?.[0];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden">
      {/* Card preview */}
      <div className="p-5 space-y-3">
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
        </div>

        <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-300 font-semibold">Track on NammaTN</p>
            <p className="text-[10px] text-slate-500 italic">"No issue closes without proof."</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">TN</span>
          </div>
        </div>
      </div>

      {/* Share actions */}
      <div className="bg-slate-700/50 px-5 py-3 flex gap-2 flex-wrap border-t border-slate-700">
        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            copied ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Share Receipt", "ரசீதை பகிர்")}
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-600 text-slate-300 hover:bg-slate-600 transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          {T("Copy Link", "இணைப்பை நகலெடு")}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-600 text-slate-300 hover:bg-slate-600 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {T("Open Receipt", "ரசீது திற")}
        </a>
      </div>
    </div>
  );
}