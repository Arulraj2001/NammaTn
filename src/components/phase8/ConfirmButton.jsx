import React, { useState, useEffect } from "react";
import { Users, Loader2 } from "lucide-react";
import { confirmItem } from "@/services/communityConfirm";
import { supabase } from "@/api/supabaseClient";
import { useLanguage } from "@/context/LanguageContext";

/**
 * ConfirmButton — community factual validation (Confirm vs Not True)
 * 
 * Props:
 *  - targetType: "situation_update" | "emergency_post" | "scam_alert" | "office_report"
 *  - targetId: string
 *  - confirmCount: number (initial count from DB record)
 *  - districtSlug: string
 *  - onConfirmed: async () => void — called AFTER session recorded; should persist count to DB
 */
export default function ConfirmButton({ targetType, targetId, confirmCount = 0, districtSlug, onConfirmed }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const [confirmed, setConfirmed] = useState(false);
  const [isDispute, setIsDispute] = useState(false);
  const [count, setCount] = useState(confirmCount);
  const [disputeCount, setDisputeCount] = useState(0);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReasons, setShowReasons] = useState(false);

  const loadVotes = async () => {
    try {
      const { data, error } = await supabase
        .from("community_confirmation")
        .select("is_dispute, reason, session_id")
        .eq("target_type", targetType)
        .eq("target_id", targetId);
      if (error) throw error;

      let sid = localStorage.getItem("tn_session_id");
      if (!sid) {
        sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("tn_session_id", sid);
      }

      let confs = 0;
      let disps = 0;
      let userVote = null;
      const rList = [];

      data.forEach(row => {
        if (row.is_dispute) {
          disps++;
          if (row.reason && row.reason.trim()) {
            rList.push(row.reason.trim());
          }
        } else {
          confs++;
        }
        if (row.session_id === sid) {
          userVote = row;
        }
      });

      setCount(confs);
      setDisputeCount(disps);
      setReasons(rList);
      if (userVote) {
        setConfirmed(true);
        setIsDispute(userVote.is_dispute);
      } else {
        setConfirmed(false);
        setIsDispute(false);
      }
    } catch (err) {
      console.error("Failed to load confirmations:", err);
    }
  };

  useEffect(() => {
    loadVotes();
  }, [targetType, targetId]);

  const handleConfirm = async () => {
    if (confirmed || loading) return;
    setLoading(true);
    const success = await confirmItem(targetType, targetId, districtSlug);
    if (success) {
      if (onConfirmed) await onConfirmed(count + 1);
      await loadVotes();
    }
    setLoading(false);
  };

  const handleDispute = async () => {
    if (confirmed || loading) return;

    const reasonText = window.prompt(
      T("Why do you think this update is not true? Please explain:", "இந்த தகவல் ஏன் உண்மை இல்லை என்று நினைக்கிறீர்கள்? தயவுசெய்து விளக்குங்கள்:")
    );
    if (reasonText === null) return; // cancelled
    if (!reasonText.trim()) {
      alert(T("Please provide a reason to dispute this update.", "தயவுசெய்து இந்த தகவலை மறுப்பதற்கான காரணத்தை வழங்கவும்."));
      return;
    }

    setLoading(true);
    try {
      let sid = localStorage.getItem("tn_session_id");
      if (!sid) {
        sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("tn_session_id", sid);
      }

      const { error } = await supabase
        .from("community_confirmation")
        .insert({
          target_type: targetType,
          target_id: targetId,
          session_id: sid,
          district_slug: districtSlug,
          is_dispute: true,
          reason: reasonText.trim()
        });

      if (error) throw error;
      await loadVotes();
    } catch (err) {
      alert(`Failed to submit dispute: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full mt-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Confirm Factual Button */}
        <button
          onClick={handleConfirm}
          disabled={confirmed || loading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            confirmed && !isDispute
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 cursor-default"
              : confirmed && isDispute
              ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-300"
          }`}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3" />}
          {confirmed && !isDispute
            ? `✓ ${count} ${T("people confirmed this", "பேர் உறுதிப்படுத்தியுள்ளனர்")}`
            : `${count > 0 ? `${count} ${T("confirmed", "உறுதிப்படுத்தப்பட்டது")} · ` : ""}${T("Confirm this is true", "உண்மை என உறுதிசெய்")}`}
        </button>

        {/* Dispute "Not true" Button */}
        <button
          onClick={handleDispute}
          disabled={confirmed || loading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            confirmed && isDispute
              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 cursor-default"
              : confirmed && !isDispute
              ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-300"
          }`}
        >
          <span>❌</span>
          {confirmed && isDispute
            ? T("You marked as not true", "உண்மை இல்லை என குறித்துள்ளீர்கள்")
            : disputeCount > 0
            ? `${disputeCount} ${T("marked not true", "பேர் உண்மை இல்லை என்றனர்")}`
            : T("Not true", "உண்மை இல்லை")}
        </button>

        {/* Toggle reasons link if reasons list has items */}
        {reasons.length > 0 && (
          <button
            onClick={() => setShowReasons(!showReasons)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium ml-1"
          >
            {showReasons
              ? T("Hide reasons", "காரணங்களை மறை")
              : `${T("Show reasons why", "ஏன் என்ற காரணங்கள்")} (${reasons.length})`}
          </button>
        )}
      </div>

      {/* Disputes reasons checklist display */}
      {showReasons && reasons.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-1.5 mt-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {T("Why citizens say this is not true:", "இது உண்மை இல்லை என மக்கள் கூறும் காரணங்கள்:")}
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
            {reasons.map((r, idx) => (
              <li key={idx} className="leading-relaxed">{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}