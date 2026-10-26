import React, { useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import {
  PlusCircle, Zap, X, FileText, TrendingUp, MessageCircle, AlertTriangle, Shield,
  LayoutGrid, Map, MapPin,
  HelpCircle, ArrowRight, BarChart2, User, Newspaper
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "@/components/auth/UserMenu";
import { useQuery } from "@tanstack/react-query";
import { getSettingsMap } from "@/services/admin/settings";

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
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-around px-2 py-2">
          {BOTTOM_TABS.map(({ path, icon: Icon, en, ta, isCreate }) => {
            const active = location.pathname === path && !isCreate;
            if (isCreate) {
              return (
                <Link key={path} to={path} className="flex flex-col items-center gap-0.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg -mt-4 border-4 border-white dark:border-slate-900">
                    <PlusCircle className="w-5 h-5 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{T(en, ta)}</span>
                </Link>
              );
            }
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                  active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                <span className="text-[10px] font-medium">{T(en, ta)}</span>
              </Link>
            );
          })}

          {/* Services tab */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open services"
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
              menuOpen ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <LayoutGrid className="w-5 h-5 stroke-2" />
            <span className="text-[10px] font-medium">{T("Services", "சேவைகள்")}</span>
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
                <div className="flex items-center justify-end mb-5">
                  <div className="flex-shrink-0">
                    <UserMenu onAction={() => setMenuOpen(false)} />
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
                            className={`flex items-start gap-2.5 p-3 rounded-2xl border transition-all active:scale-[0.97] ${
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
                              <p className={`text-sm font-semibold leading-tight ${active ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>
                                {T(item.en, item.ta)}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
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