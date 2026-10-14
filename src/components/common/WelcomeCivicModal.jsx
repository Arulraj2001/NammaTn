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
  Sparkles
} from "lucide-react";

const STORAGE_KEY = "vizhitn_welcome_tour_v1";
const TOUR_EXPIRY_DAYS = 7;

export default function WelcomeCivicModal() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Helper for bilingual content
  const T = (en, ta) => (lang === "ta" ? ta : en);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const expiry = parseInt(stored, 10);
        // If not expired, do not show
        if (!isNaN(expiry) && Date.now() < expiry) {
          return;
        }
      }

      // Respectful delay: Show 3.5 seconds after landing so visitor isn't ambushed
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500);

      return () => clearTimeout(timer);
    } catch {
      // If localStorage is disabled in private browsing, do not show repeatedly
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      const expiry = Date.now() + TOUR_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, expiry.toString());
    } catch (_) {}
  };

  // Keyboard shortcut to close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div 
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] transition-transform duration-300 animate-in slide-in-from-bottom-6 sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 p-5 sm:p-6 text-white overflow-hidden">
          {/* Subtle Background Glow Accent */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-semibold tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{T("Tamil Nadu Civic Hub", "தமிழ்நாடு மக்கள் களம்")}</span>
              </div>
              <h2 id="welcome-modal-title" className="text-xl sm:text-2xl font-black text-white leading-tight">
                {T("Welcome to VizhiTN!", "வணக்கம்! இது உங்கள் மக்கள் மேடை")}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 leading-relaxed">
                {T(
                  "Hyperlocal civic proof, emergency alerts & official grievance tracking across all 38 districts.",
                  "தமிழ்நாட்டின் 38 மாவட்டங்களுக்கான அதிகாரப்பூர்வ எச்சரிக்கைகள் மற்றும் குடிமக்கள் தீர்வுக் களம்."
                )}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="p-1.5 -mr-1 -mt-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={T("Close welcome tour", "மூடுக")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Highlights Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {T("What can you do on VizhiTN?", "இங்கே நீங்கள் என்னவெல்லாம் செய்யலாம்?")}
          </p>

          <div className="space-y-3">
            {/* 1. Report Civic Issue */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{T("1. Post Your Local Civic Issue", "1. உங்கள் ஏரியா பிரச்சனையை பதிவிடுங்கள்")}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                    60 Sec
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {T(
                    "Potholes, water leaks, power issues, or waste disposal — post with photo and location to generate an official Civic Receipt.",
                    "ரோடு பள்ளம், குடிநீர் தட்டுப்பாடு, மின்தடை, குப்பை — புகைப்படத்துடன் உடனே பதிவு செய்து அதிகாரப்பூர்வ குடிமை ரசீது பெறுங்கள்."
                  )}
                </p>
              </div>
            </div>

            {/* 2. Live Alerts & Helplines */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{T("2. Hyperlocal Alerts & 24x7 Helplines", "2. நேரடி எச்சரிக்கைகள் & உதவி எண்கள்")}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {T(
                    "TANGEDCO power shutdowns, rain holidays, transport advisories, and instant dial buttons for 1912, 1913, 1930.",
                    "மின்வாரிய பராமரிப்பு மின்தடை, மழை விடுமுறை, போக்குவரத்து அறிவிப்புகள் மற்றும் 1912, 1913, 1930 உதவி எண்கள்."
                  )}
                </p>
              </div>
            </div>

            {/* 3. Schemes & Guides */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{T("3. Government Schemes & Citizen Rights", "3. அரசு திட்டங்கள் & உரிமைகள் வழிகாட்டி")}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {T(
                    "Step-by-step guides for Patta transfer, Kalaignar Magalir Urimai, Smart Ration Card, and legal protection against frauds.",
                    "பட்டா மாறுதல், மகளிர் உரிமைத் தொகை, ஸ்மார்ட் ரேஷன் கார்டு மற்றும் சைபர் மோசடிகளில் இருந்து தப்பிக்கும் வழிகாட்டிகள்."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Primary Action: Post Issue */}
          <Link
            to="/create"
            onClick={handleDismiss}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all active:scale-[0.98]"
          >
            <Megaphone className="w-4 h-4" />
            <span>{T("Post a Civic Issue", "என் ஏரியா பிரச்சனையை பதிவிட")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Secondary Action: Explore Feed */}
          <Link
            to="/explore"
            onClick={handleDismiss}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            <span>{T("Explore Alerts", "தகவல்களை பார்க்க")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
