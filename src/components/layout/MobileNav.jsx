import React, { useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import {
  PlusCircle, Zap, X, FileText, TrendingUp, MessageCircle, AlertTriangle, Shield,
  LayoutGrid, Map, MapPin,
  HelpCircle, ArrowRight, BarChart2, User, Newspaper, GraduationCap
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "@/components/auth/UserMenu";
import { useQuery } from "@tanstack/react-query";
import { getSettingsMap } from "@/services/admin/settings";

/* ── Inline Social SVG Icons ────────────────────────────── */
function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.167 1.45 4.814 1.453 5.457 0 9.895-4.436 9.898-9.896.002-2.646-1.018-5.132-2.873-6.99C15.823 1.863 13.334.844 10.692.844 5.234.844.798 5.281.795 10.741c-.001 1.702.447 3.366 1.3 4.84l-.995 3.637 3.737-.98c1.477.805 3.125 1.233 4.805 1.235zm11.232-7.653c-.307-.154-1.82-.898-2.102-1.001-.282-.103-.487-.154-.691.154-.205.308-.795 1.001-.974 1.205-.179.205-.359.231-.666.077-.307-.154-1.3-.478-2.476-1.527-.914-.815-1.53-1.822-1.71-2.129-.18-.308-.019-.475.135-.629.138-.138.307-.359.461-.539.154-.179.205-.308.307-.513.103-.205.051-.385-.026-.539-.077-.154-.691-1.667-.948-2.283-.25-.6-.525-.519-.72-.529-.186-.009-.4-.01-.614-.01-.215 0-.564.081-.861.405-.297.324-1.133 1.107-1.133 2.7 0 1.593 1.159 3.13 1.318 3.344.159.214 2.28 3.482 5.522 4.883.771.333 1.373.532 1.84.68.775.246 1.48.212 2.037.129.621-.093 1.82-.744 2.076-1.462.256-.718.256-1.333.179-1.462-.076-.128-.282-.205-.589-.359z"/>
    </svg>
  );
}

function YouTubeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

const BOTTOM_TABS = [
  { path: "/", icon: MapPin, en: "Map", ta: "படம்" },
  { path: "/explore", icon: Zap, en: "Live", ta: "நேரடி" },
  { path: "/create", icon: PlusCircle, en: "Log", ta: "பதிவு", isCreate: true },
  { path: "/me", icon: User, en: "Me", ta: "என் பக்கம்" },
];


const MOBILE_MENU_GROUPS = [
  {
    en_title: "Civic Proof & Alerts",
    ta_title: "குடிமை & எச்சரிக்கைகள்",
    items: [
      { path: "/tnpsc", icon: GraduationCap, en: "TNPSC Practice Lab", ta: "TNPSC மாதிரி வினா", desc_en: "Daily 1-Mark & Samacheer notes", desc_ta: "தினசரி மாதிரி வினாக்கள்" },
      { path: "/track", icon: FileText, en: "Complaint Tracker", ta: "புகார் கண்காணிப்பு", desc_en: "Track GCC & TANGEDCO status", desc_ta: "புகார் தீர்வு நிலை" },
      { path: "/power-cuts-today-tamil-nadu", icon: Zap, en: "Power Cuts Today", ta: "இன்றைய மின்தடை", desc_en: "Live TANGEDCO power shutdowns", desc_ta: "நேரடி மின்தடை விவரங்கள்" },
      { path: "/school-college-holiday-alerts", icon: AlertTriangle, en: "Holiday Alerts", ta: "பள்ளி விடுமுறை", desc_en: "Collector holiday announcements", desc_ta: "மாவட்ட ஆட்சியர் விடுமுறை" },
      { path: "/scams", icon: AlertTriangle, en: "Scams", ta: "மோசடி", desc_en: "Fraud and scam alerts", desc_ta: "மோசடி எச்சரிக்கைகள்" },
      { path: "/helplines", icon: HelpCircle, en: "Helplines", ta: "அவசர எண்கள்", desc_en: "24x7 verified helplines", desc_ta: "அரசு அவசர உதவி எண்கள்" },
      { path: "/dashboard", icon: BarChart2, en: "Dashboard", ta: "டாஷ்போர்டு", desc_en: "Live transparency stats", desc_ta: "நேரடி புள்ளிவிவரங்கள்" },
      { path: "/trending", icon: TrendingUp, en: "Trending", ta: "டிரெண்டிங்", desc_en: "Most discussed issues", desc_ta: "அதிகம் விவாதிக்கப்பட்டவை" },
    ],
  },
  {
    en_title: "News & Places",
    ta_title: "செய்திகள் & இடங்கள்",
    items: [
      { path: "/tn-today", icon: Newspaper, en: "TN Today", ta: "TN Today", desc_en: "Tamil Nadu daily headline", desc_ta: "தினசரி தமிழ்நாடு செய்திகள்" },
      { path: "/districts", icon: Map, en: "Districts", ta: "மாவட்டங்கள்", desc_en: "Explore 38 TN districts", desc_ta: "மாவட்டங்களை ஆராய்க" },
      { path: "/areas", icon: MapPin, en: "Areas", ta: "பகுதிகள்", desc_en: "Browse by area", desc_ta: "பகுதி வாரியாக ஆராய்க" },
    ],
  },
  {
    en_title: "Schemes & Rights",
    ta_title: "திட்டங்கள் & உரிமைகள்",
    items: [
      { path: "/schemes", icon: Shield, en: "Welfare Schemes", ta: "அரசுத் திட்டங்கள்", desc_en: "Welfare & financial aid", desc_ta: "மக்கள் நலத் திட்டங்கள்" },
      { path: "/esevai", icon: HelpCircle, en: "e-Sevai Guide", ta: "இ-சேவை", desc_en: "Online certificates guide", desc_ta: "சான்றிதழ் விண்ணப்பங்கள்" },
      { path: "/rights", icon: Shield, en: "Citizen Rights", ta: "குடிமக்கள் உரிமைகள்", desc_en: "Legal & consumer rights", desc_ta: "சட்டப்பூர்வ உரிமைகள்" },
      { path: "/rti", icon: HelpCircle, en: "RTI Assistant", ta: "ஆர்டிஐ", desc_en: "RTI application drafter", desc_ta: "தகவல் அறியும் உரிமை" },
    ],
  },
  {
    en_title: "Help & About",
    ta_title: "உதவி & விவரங்கள்",
    items: [
      { path: "/help", icon: HelpCircle, en: "Help Centre", ta: "உதவி மையம்", desc_en: "SOS & emergency assistance", desc_ta: "அவசர உதவி மையம்" },
      { path: "/how-to-use", icon: HelpCircle, en: "How to Use", ta: "பயன்படுத்துவது எப்படி", desc_en: "Feature guides & walkthrough", desc_ta: "பயன்பாட்டு வழிகாட்டிகள்" },
      { path: "/about", icon: HelpCircle, en: "About Us", ta: "எங்களைப் பற்றி", desc_en: "Mission & trust standards", desc_ta: "எங்கள் நோக்கம்" },
      { path: "/contact", icon: MessageCircle, en: "Contact", ta: "தொடர்பு", desc_en: "Reach our team", desc_ta: "எங்கள் குழுவை தொடர்பு கொள்ளுங்கள்" },
    ],
  },
];

export default function MobileNav() {
  const location = useLocation();
  const { lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="flex items-center justify-around px-2 py-1.5">
          {BOTTOM_TABS.map(({ path, icon: Icon, en, ta, isCreate }) => {
            const active = location.pathname === path && !isCreate;
            if (isCreate) {
              return (
                <Link key={path} to={path} className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30 -mt-4 border-4 border-white dark:border-slate-900 transition-colors">
                    <PlusCircle className="w-5 h-5 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{T(en, ta)}</span>
                </Link>
              );
            }
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all active:scale-95 min-h-[44px] min-w-[48px] ${
                  active ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400 font-medium"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                <span className="text-[10px] leading-none">{T(en, ta)}</span>
              </Link>
            );
          })}

          {/* Services tab */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open services"
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all active:scale-95 min-h-[44px] min-w-[48px] ${
              menuOpen ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400 font-medium"
            }`}
          >
            <LayoutGrid className="w-5 h-5 stroke-2" />
            <span className="text-[10px] leading-none">{T("Services", "சேவைகள்")}</span>
          </button>

        </div>
      </nav>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl max-h-[90vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>

              <div className="px-4 pb-6">
                {/* Header */}
                <div className="flex items-center justify-between py-3 mb-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {T("Explore VizhiTN", "VizhiTN ஆராய்க")}
                  </h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Create CTA Card */}
                <Link to="/create" onClick={() => setMenuOpen(false)}>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}</p>
                      <p className="text-blue-100 text-xs">{T("Document a local issue now", "உள்ளூர் சிக்கலை இப்போது ஆவணப்படுத்துங்கள்")}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </Link>

                {/* Profile row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                    {T("Menu", "மெனு")}
                  </span>
                  <div className="flex-shrink-0">
                    <UserMenu onAction={() => setMenuOpen(false)} />
                  </div>
                </div>

                {/* Community & Social Channels Grid (WhatsApp, YouTube, Instagram, Facebook) */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {T("Official Channels", "சமூக ஊடகங்கள்")}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {T("Civic Updates & Shorts", "செய்திகள் & வீடியோக்கள்")}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {/* WhatsApp */}
                    <a
                      href={settings.social_whatsapp || "https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-2 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all active:scale-95 group shadow-xs"
                      aria-label="WhatsApp Channel"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform">
                        <WhatsAppIcon className="w-5 h-5 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">WhatsApp</span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{T("Channel", "சேனல்")}</span>
                    </a>

                    {/* YouTube */}
                    <a
                      href={settings.social_youtube || "https://www.youtube.com/@VizhiTN"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-2 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 hover:border-red-400 dark:hover:border-red-700 transition-all active:scale-95 group shadow-xs"
                      aria-label="YouTube Channel"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform">
                        <YouTubeIcon className="w-5 h-5 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">YouTube</span>
                      <span className="text-[9px] text-red-600 dark:text-red-400 font-semibold mt-0.5">{T("Videos", "வீடியோ")}</span>
                    </a>

                    {/* Instagram */}
                    <a
                      href={settings.social_instagram || "https://www.instagram.com/vizhi_tn/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-2 rounded-2xl bg-fuchsia-50/80 dark:bg-fuchsia-950/30 border border-fuchsia-200 dark:border-fuchsia-800/60 hover:border-fuchsia-400 dark:hover:border-fuchsia-700 transition-all active:scale-95 group shadow-xs"
                      aria-label="Instagram Page"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform">
                        <InstagramIcon className="w-5 h-5 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Instagram</span>
                      <span className="text-[9px] text-fuchsia-600 dark:text-fuchsia-400 font-semibold mt-0.5">{T("Reels", "ரீல்ஸ்")}</span>
                    </a>

                    {/* Facebook */}
                    <a
                      href={settings.social_facebook || "https://facebook.com/vizhitn"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-2 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-700 transition-all active:scale-95 group shadow-xs"
                      aria-label="Facebook Page"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform">
                        <FacebookIcon className="w-5 h-5 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Facebook</span>
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{T("Page", "பக்கம்")}</span>
                    </a>
                  </div>
                </div>

                {/* Feature Groups */}
                {MOBILE_MENU_GROUPS.map((group, gi) => (
                  <div key={gi} className="mb-5">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">
                      {T(group.en_title, group.ta_title)}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items
                        .filter((item) => {
                          if (item.path === "/scams" && settings.scam_alerts_enabled === "false") return false;
                          if (item.path === "/help" && settings.emergency_enabled === "false") return false;
                          return true;
                        })
                        .map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl border transition-all active:scale-[0.97] min-h-[56px] ${
                              active
                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              active ? "bg-blue-100 dark:bg-blue-800" : "bg-white dark:bg-slate-700"
                            }`}>
                              <Icon className={`w-4 h-4 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs sm:text-sm font-bold leading-tight ${active ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>
                                {T(item.en, item.ta)}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                                {T(item.desc_en, item.desc_ta)}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}