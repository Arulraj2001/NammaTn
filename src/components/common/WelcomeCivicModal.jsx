"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { 
  X, 
  Megaphone, 
  Zap, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  ChevronUp,
  ChevronDown
} from "lucide-react";

const STORAGE_KEY = "vizhitn_welcome_tour_v2";
const TOUR_EXPIRY_DAYS = 14;

export default function WelcomeCivicModal() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Helper for bilingual content
  const T = (en, ta) => (lang === "ta" ? ta : en);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const expiry = parseInt(stored, 10);
        if (!isNaN(expiry) && Date.now() < expiry) {
          return;
        }
      }

      // Respectful delay: Show floating toast 4 seconds after landing
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 4000);

      return () => clearTimeout(timer);
    } catch {
      // In private browsing mode, gracefully ignore
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      const expiry = Date.now() + TOUR_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, expiry.toString());
    } catch (_) {}
  };

  if (!mounted || !isOpen) return null;

  return (
    <aside 
      aria-label={T("Civic Quick Guide", "குடிமை வழிகாட்டி")}
      className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] sm:max-w-sm w-full bg-white dark:bg-slate-900 border-2 border-blue-500/40 dark:border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5 text-slate-900 dark:text-white"
    >
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            {T("Welcome to VizhiTN", "வணக்கம்! இது உங்கள் VizhiTN")}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label={isExpanded ? T("Collapse", "சுருக்குக") : T("Expand", "விரிவாக்கு")}
            title={isExpanded ? T("Collapse", "சுருக்குக") : T("Expand details", "முழு விவரங்கள்")}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label={T("Dismiss", "மூடுக")}
            title={T("Dismiss", "மூடுக")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Toast Body */}
      <div className="p-3.5 sm:p-4 text-xs space-y-3">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          {T(
            "Notice potholes, water leakage, or power cut issues in your area? Report with photo in 60s or check verified alerts across all 38 districts.",
            "உங்கள் பகுதியில் ரோடு பள்ளம், குடிநீர் கசிவு அல்லது மின்தடை உள்ளதா? உடனே புகைப்படத்துடன் பதிவிட்டு குடிமை ரசீது பெறுங்கள்."
          )}
        </p>

        {/* Collapsible Extended Tour */}
        {isExpanded && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <Megaphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  {T("1. 60-Sec Citizen Grievance", "1. ஏரியா பிரச்சனையை பதிவிட")}
                </strong>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {T("Instant Civic Receipt & department tracking", "அதிகாரப்பூர்வ குடிமை ரசீது & துறை கண்காணிப்பு")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  {T("2. Power Cuts & Rain Alerts", "2. மின்தடை & மழை விடுமுறை எச்சரிக்கை")}
                </strong>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {T("TANGEDCO 1912 & GCC 1913 24x7 emergency contacts", "1912, 1913 உதவி எண்கள் உடனே அழைப்பு")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  {T("3. Government Schemes & Rights", "3. அரசு நலத்திட்டங்கள் & உரிமைகள்")}
                </strong>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {T("Patta transfer, Ration cards & citizen statutory rights", "பட்டா மாறுதல், ஸ்மார்ட் கார்டு வழிகாட்டிகள்")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            to="/create"
            onClick={handleDismiss}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>{T("Report Issue", "புகார் பதிவிட")}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <Link
            to="/explore"
            onClick={handleDismiss}
            className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            <span>{T("Explore", "பார்க்க")}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

