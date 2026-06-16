import React, { useState } from "react";
import { Heart, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SponsorRegisterModal from "./SponsorRegisterModal";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

// Issues eligible for community sponsorship support
const ELIGIBLE_CIVIC_STATUSES = [
  "reported",
  "community_verified",
  "complaint_needed",
  "complaint_filed",
  "under_followup",
  "unresolved_escalated",
];

// Categories eligible for sponsor support (community-solvable or awareness campaigns)
const ELIGIBLE_CATEGORIES = [
  "garbage",
  "streetlight",
  "school_zone",
  "awareness",
  "cleanliness",
  "flood",
  "safety",
  "environment",
  "community",
  "other",
];

// Government-only categories — NOT eligible for sponsor support
const GOVERNMENT_ONLY = [
  "road",
  "roads",
  "drainage",
  "water_supply",
  "sewage",
  "electricity",
  "electrical",
  "infrastructure",
  "bridge",
  "building",
];

function isEligibleForSponsor(post) {
  if (!post) return false;
  // Must be an active complaint (civic receipt)
  if (post.post_type !== "complaint") return false;
  if (post.status === "removed") return false;
  // Status must be eligible (not already fixed)
  if (["citizen_verified_fixed", "duplicate_invalid", "community_solved"].includes(post.civic_status)) return false;
  // Not a government-only category
  const catSlug = (post.category_slug || "").toLowerCase();
  if (GOVERNMENT_ONLY.some(g => catSlug.includes(g))) return false;
  return true;
}

export default function SponsorThisIssue({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();
  const [showModal, setShowModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (!isEligibleForSponsor(post)) return null;

  const handleSponsorClick = () => {
    if (!isAuthenticated) {
      requireAuth(() => setShowModal(true), T("Sign in to support this issue", "இந்த சிக்கலை ஆதரிக்க உள்நுழையுங்கள்"));
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
            {T("Support This Civic Issue", "இந்த குடிமை சிக்கலை ஆதரியுங்கள்")}
          </h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-3 leading-relaxed">
            {T(
              "Organizations can support community awareness and documentation campaigns for this issue. Support does not change the Civic Receipt status or citizen verification.",
              "நிறுவனங்கள் இந்த சிக்கலுக்கு சமூக விழிப்புணர்வு மற்றும் ஆவணப்படுத்தல் பிரச்சாரங்களை ஆதரிக்கலாம். ஆதரவு குடிமை ரசீது நிலையை மாற்றாது."
            )}
          </p>

          <button onClick={() => setShowInfo(v => !v)}
            className="text-xs text-emerald-600 hover:underline mb-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {showInfo ? T("Hide details", "விவரங்களை மறை") : T("What does support mean?", "ஆதரவு என்றால் என்ன?")}
          </button>

          {showInfo && (
            <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-xl p-3 mb-3 text-xs space-y-1.5">
              <p className="font-semibold text-slate-700 dark:text-slate-300">{T("Sponsor Support includes:", "நிதியளிப்பாளர் ஆதரவு:")}</p>
              <ul className="text-slate-600 dark:text-slate-400 space-y-0.5">
                <li>✓ Supporting a community awareness/documentation campaign</li>
                <li>✓ Getting a labeled sponsor badge on public sponsor profile</li>
                <li>✓ Impact report after campaign</li>
              </ul>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mt-2">{T("Support does NOT include:", "ஆதரவில் இல்லாதவை:")}</p>
              <ul className="text-slate-600 dark:text-slate-400 space-y-0.5">
                <li>✗ Changing Civic Receipt status or rankings</li>
                <li>✗ Claiming the sponsor "solved" the issue</li>
                <li>✗ Government infrastructure repairs</li>
                <li>✗ Any unauthorized public work</li>
              </ul>
              <p className="text-emerald-600 font-medium mt-2">
                {T(`We say: "Supported community action for this issue" — not "Sponsor solved this."`, `நாங்கள் சொல்வது: "இந்த சிக்கலுக்கான சமூக செயலை ஆதரித்தது" — "நிதியளிப்பாளர் இதை சரி செய்தார்" என்று சொல்வதில்லை.`)}
              </p>
            </div>
          )}

          <button onClick={handleSponsorClick}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all">
            {T("Express Support Interest", "ஆதரவு ஆர்வத்தை தெரிவிக்கவும்")}
          </button>
        </div>
      </div>

      {showModal && (
        <SponsorRegisterModal
          linkedPostId={post.id}
          linkedPostTitle={post.title_en}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}