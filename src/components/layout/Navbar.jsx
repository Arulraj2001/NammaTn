import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link, useLocation } from "@/lib/router-compat";
import {
  Search, Globe, Sun, Moon, Bookmark, ChevronDown, Zap, TrendingUp, MessageCircle,
  HelpCircle, AlertTriangle, Heart, LayoutGrid, Calculator, FileText, CreditCard,
  MapPin, Map, Shield, ArrowRight, Plus, LayoutDashboard, Info, X
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "@/components/auth/UserMenu";
import { useQuery } from "@tanstack/react-query";
import { getSettingsMap } from "@/services/admin/settings";
import { useTheme } from "@/app/providers";

const MAIN_NAV = [
  { path: "/", en: "📍 Map", ta: "📍 வரைபடம்" },
  { path: "/explore", en: "⚡ Live Feed", ta: "⚡ நேரடி ஊட்டம்" },
  { path: "/tn-today", en: "📰 TN Today", ta: "📰 TN Today" },
  { path: "/power-cuts-today-tamil-nadu", en: "⚡ Power Cuts", ta: "⚡ மின்தடை" },
  { path: "/trending", en: "🔥 Trending", ta: "🔥 டிரெண்டிங்", hideOnLg: true },
];


const MEGA_COLUMNS = [
  {
    en_title: "Alerts & Utilities",
    ta_title: "எச்சரிக்கைகள் & சேவைகள்",
    items: [
      { path: "/power-cuts-today-tamil-nadu", icon: Zap, en: "Power Cuts Today", ta: "இன்றைய மின்தடை", desc_en: "Live TANGEDCO power cuts", desc_ta: "நேரடி மின் தடை தகவல்கள்" },
      { path: "/tneb-bill-calculator", icon: Calculator, en: "TNEB Bill Calculator", ta: "மின் கட்டண கணக்கீடு", desc_en: "2026 tariff & 100 free units", desc_ta: "100 யூனிட் மானியக் கணக்கீடு" },
      { path: "/school-college-holiday-alerts", icon: AlertTriangle, en: "Holiday Alerts", ta: "பள்ளி விடுமுறை", desc_en: "Rain & Collector orders", desc_ta: "ஆட்சியர் விடுமுறை அறிவிப்புகள்" },
      { path: "/scams", icon: Shield, en: "Scam Alerts", ta: "மோசடி எச்சரிக்கை", desc_en: "Local scam & fraud alerts", desc_ta: "உள்ளூர் மோசடி எச்சரிக்கைகள்" },
      { path: "/helplines", icon: HelpCircle, en: "Helplines Desk", ta: "அவசர எண்கள்", desc_en: "24x7 emergency contacts", desc_ta: "அரசு அவசர உதவி எண்கள்" },
    ],
  },
  {
    en_title: "News & Hyperlocal",
    ta_title: "செய்திகள் & வட்டாரம்",
    items: [
      { path: "/tn-today", icon: Info, en: "TN Today Newsroom", ta: "TN Today செய்திப்பிரிவு", desc_en: "Investigative state dispatches", desc_ta: "ஆழமான களப் புலனாய்வு செய்திகள்" },
      { path: "/districts", icon: Map, en: "38 Districts", ta: "38 மாவட்டங்கள்", desc_en: "Explore by TN district", desc_ta: "மாவட்ட வாரியாக ஆராய்க" },
      { path: "/areas", icon: MapPin, en: "Hyperlocal Areas", ta: "வட்டாரப் பகுதிகள்", desc_en: "Local street & town updates", desc_ta: "பகுதி வாரியான குடிமை நிலவரம்" },
      { path: "/trending", icon: TrendingUp, en: "Trending Topics", ta: "டிரெண்டிங் தலைப்புகள்", desc_en: "Most discussed civic issues", desc_ta: "அதிகம் விவாதிக்கப்பட்ட சிக்கல்கள்" },
      { path: "/dashboard", icon: LayoutDashboard, en: "Civic Dashboard", ta: "டாஷ்போர்டு", desc_en: "State civic resolution stats", desc_ta: "மாநில குடிமை புள்ளிவிவரம்" },
    ],
  },
  {
    en_title: "Citizen Schemes & Rights",
    ta_title: "அரசுத் திட்டங்கள் & உரிமைகள்",
    items: [
      { path: "/patta-chitta-online-status", icon: FileText, en: "Patta Chitta Status", ta: "பட்டா சிட்டா நிலவரம்", desc_en: "Land records & FMB sketch", desc_ta: "நில உரிமை ஆவண சரிபார்ப்பு" },
      { path: "/tnreginet-guideline-value", icon: Calculator, en: "TNREGINET Land Value", ta: "வழிகாட்டி மதிப்பு (Guideline)", desc_en: "Street guideline & stamp duty", desc_ta: "தெரு வாரியான நில வழிகாட்டி மதிப்பு" },
      { path: "/kalaignar-magalir-urimai-status", icon: Shield, en: "Magalir Urimai Status", ta: "மகளிர் உரிமைத் தொகை", desc_en: "₹1,000 welfare eligibility & status", desc_ta: "₹1,000 தகுதி சரிபார்ப்பு & நிலை" },
      { path: "/tnpds-smart-ration-card-status", icon: CreditCard, en: "Smart Ration Card", ta: "ஸ்மார்ட் ரேஷன் கார்டு", desc_en: "TNPDS card & OTP status", desc_ta: "குடும்ப அட்டை சேவை நிலை" },
      { path: "/schemes", icon: Shield, en: "Welfare Schemes", ta: "அரசுத் திட்டங்கள்", desc_en: "Kalaignar Magalir Urimai & welfare", desc_ta: "முக்கிய மக்கள் நலத் திட்டங்கள்" },
      { path: "/esevai", icon: Info, en: "e-Sevai Guide", ta: "இ-சேவை வழிகாட்டி", desc_en: "Certificate application guides", desc_ta: "சான்றிதழ் விண்ணப்ப வழிகாட்டல்" },
      { path: "/rights", icon: Shield, en: "Citizen Rights", ta: "குடிமக்கள் உரிமைகள்", desc_en: "Legal protections & consumer laws", desc_ta: "சட்டப்பூர்வ மக்கள் உரிமைகள்" },
      { path: "/rti", icon: Info, en: "RTI Assistant", ta: "ஆர்டிஐ உதவியாளர்", desc_en: "Draft official RTI queries", desc_ta: "தகவல் அறியும் உரிமை மாதிரி" },
    ],
  },
  {
    en_title: "Community & Help",
    ta_title: "சமூகம் & ஆதரவு",
    items: [
      { path: "/help", icon: HelpCircle, en: "Emergency Help", ta: "அவசர உதவி", desc_en: "SOS & blood donation support", desc_ta: "அவசர உதவி கோரிக்கைகள்" },
      { path: "/how-to-use", icon: Info, en: "How to Use", ta: "பயன்படுத்துவது எப்படி", desc_en: "VizhiTN guide & walkthrough", desc_ta: "VizhiTN எப்படி பயன்படுத்துவது" },
      { path: "/about", icon: Info, en: "About Us", ta: "எங்களைப் பற்றி", desc_en: "Mission & trust standards", desc_ta: "எங்கள் நோக்கம் & கொள்கை" },
      { path: "/contact", icon: MessageCircle, en: "Contact Us", ta: "தொடர்பு கொள்க", desc_en: "Reach the VizhiTN team", desc_ta: "குழுவை தொடர்பு கொள்ளுங்கள்" },
      { path: "/support", icon: Heart, en: "Support VizhiTN", ta: "ஆதரவு", desc_en: "Support citizen journalism", desc_ta: "எங்களை ஆதரியுங்கள்" },
    ],
  },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang } = useLanguage();
  const location = useLocation();
  const megaRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setMegaOpen(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setMegaOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    if (settings.site_announcement) {
      const dismissedText = localStorage.getItem("announcement_dismissed_text");
      if (dismissedText === settings.site_announcement) {
        setAnnouncementDismissed(true);
      } else {
        setAnnouncementDismissed(false);
      }
    }
  }, [settings.site_announcement]);

  const handleDismissAnnouncement = () => {
    if (settings.site_announcement) {
      localStorage.setItem("announcement_dismissed_text", settings.site_announcement);
      setAnnouncementDismissed(true);
    }
  };

  const showAnnouncement = settings.site_announcement && settings.site_announcement.trim() !== "" && !announcementDismissed;

  const T = (en, ta) => lang === "ta" ? ta : en;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { 
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setMegaOpen(false); 
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const announcementType = settings.announcement_type || "info";
  let bgClass = "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40";
  let announcementIcon = <Info className="w-3.5 h-3.5" />;

  if (announcementType === "warning") {
    bgClass = "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/40";
    announcementIcon = <AlertTriangle className="w-3.5 h-3.5" />;
  } else if (announcementType === "error") {
    bgClass = "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/40";
    announcementIcon = <AlertTriangle className="w-3.5 h-3.5" />;
  } else if (announcementType === "success") {
    bgClass = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40";
    announcementIcon = <Trophy className="w-3.5 h-3.5" />;
  } else if (announcementType === "royal") {
    bgClass = "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900/40";
    announcementIcon = <Zap className="w-3.5 h-3.5" />;
  }

  return (
    <>
      {showAnnouncement && (
        <style>{`
          @keyframes marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-33.333%, 0, 0); }
          }
          .marquee-content {
            display: flex;
            white-space: nowrap;
            animation: marquee 30s linear infinite;
          }
          .marquee-content:hover {
            animation-play-state: paused;
          }
          #main-content {
            padding-top: 96px !important;
          }
        `}</style>
      )}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 dark:bg-[#071E3D]/95 backdrop-blur shadow-sm border-b border-civic-200 dark:border-civic-900"
        : "bg-white dark:bg-[#071E3D] border-b border-civic-200 dark:border-civic-900"
      }`}>
        {/* Ticker Row — Positioned ABOVE the Navbar */}
        {showAnnouncement && (
          <div className={`w-full h-8 relative flex items-center overflow-hidden border-b text-[11px] font-medium leading-none select-none ${bgClass}`}>
            {/* Pinned Label / Icon */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1.5 px-3 z-30 font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
              {announcementIcon}
              <span>{T("Alert", "அறிவிப்பு")}</span>
            </div>

            {/* Marquee Content */}
            <div className="flex-1 h-full overflow-hidden relative flex items-center pl-[125px] pr-[40px]">
              <div className="marquee-content flex items-center gap-24">
                <span>{settings.site_announcement}</span>
                <span>{settings.site_announcement}</span>
                <span>{settings.site_announcement}</span>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismissAnnouncement}
              className="absolute right-0 top-0 bottom-0 px-3 flex items-center z-20 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]"
              aria-label="Dismiss Announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">

            <Link to="/" className="flex items-center gap-2 flex-shrink-0" aria-label="VizhiTN Home">
              <Image src={settings.site_logo_url || "/apple-touch-icon.png"} alt="" width={32} height={32} priority className="w-8 h-8 rounded-lg object-contain" />
              <div className="hidden sm:block">
                <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight block">VizhiTN</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none hidden 2xl:block whitespace-nowrap">
                  {T("Public Civic Proof Platform", "பொது குடிமை ஆதார தளம்")}
                </span>
              </div>
            </Link>

            {/* Desktop Main Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 min-w-0 ml-1 xl:ml-3">
              {MAIN_NAV.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-1.5 py-1 xl:px-2.5 xl:py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    link.hideOnLg ? "hidden xl:inline-flex" : ""
                  } ${
                    location.pathname === link.path
                      ? "bg-civic-50 dark:bg-civic-900/60 text-civic-900 dark:text-civic-100 font-bold border border-civic-200 dark:border-civic-700"
                      : "text-slate-600 dark:text-slate-300 hover:bg-civic-50/70 dark:hover:bg-civic-900/30"
                  }`}
                >
                  {T(link.en, link.ta)}
                </Link>
              ))}

              {/* Directory dropdown */}
              <div
                ref={megaRef}
                className="relative flex-shrink-0"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setMegaOpen(!megaOpen)}
                  className={`flex items-center gap-1 px-1.5 py-1 xl:px-2.5 xl:py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    megaOpen ? "bg-civic-50 dark:bg-civic-900/60 text-civic-900 dark:text-civic-100" : "text-slate-600 dark:text-slate-300 hover:bg-civic-50/70 dark:hover:bg-civic-900/30"
                  }`}
                  aria-expanded={megaOpen}
                  aria-label={T("All Pages & Services", "அனைத்து பக்கங்கள் & சேவைகள்")}
                >
                  <LayoutGrid className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-civic-500" />
                  {T("Directory", "சேவைகள்")}
                  <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {megaOpen && (
                    <div className="absolute top-full right-[-80px] sm:right-[-120px] lg:right-[-160px] xl:right-[-180px] pt-2 z-50 w-[820px] max-w-[calc(100vw-2rem)]">
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white dark:bg-[#0D2B52] rounded-2xl shadow-2xl border-2 border-civic-200 dark:border-civic-800 p-4 sm:p-5 ring-1 ring-black/5 dark:ring-white/5"
                      >
                        <div className="grid grid-cols-4 gap-3 items-start">
                          {MEGA_COLUMNS.map((column, ci) => {
                            const filteredItems = column.items.filter((item) => {
                              if (item.path === "/scams" && settings.scam_alerts_enabled === "false") return false;
                              if (item.path === "/help" && settings.emergency_enabled === "false") return false;
                              return true;
                            });

                            if (filteredItems.length === 0) return null;

                            return (
                              <div key={ci} className="space-y-2">
                                <p className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-1">
                                  {T(column.en_title, column.ta_title)}
                                </p>
                                <div className="space-y-1">
                                  {filteredItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                      <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMegaOpen(false)}
                                        className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-blue-900/60 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-blue-50/90 dark:hover:bg-blue-950/60 group transition-all duration-150"
                                      >
                                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/90 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors shadow-2xs">
                                          <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight truncate">
                                            {T(item.en, item.ta)}
                                          </p>
                                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate mt-0.5 font-medium">
                                            {T(item.desc_en, item.desc_ta)}
                                          </p>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Bottom Quick Bar */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {T("Tamil Nadu Civic Network", "தமிழ்நாடு பொது குடிமை தளம்")}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{T("Helplines: Minnalagam 1912 | CM Helpline 1100", "உதவி எண்கள்: மின்வாரியம் 1912 | முதல்வர் உதவி 1100")}</span>
                          </div>
                          <Link
                            to="/how-to-use"
                            onClick={() => setMegaOpen(false)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 flex-shrink-0"
                          >
                            {T("How to Use", "வழிகாட்டி")}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <Link to="/search" aria-label="Search" className="hidden md:flex p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Search className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setLang(lang === "en" ? "ta" : "en")}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap"
                title="Switch Language"
                aria-label="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{lang === "en" ? "தமிழ்" : "English"}</span>
                <span className="sm:hidden uppercase font-bold text-[10px]">{lang === "en" ? "ta" : "en"}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link to="/bookmarks" aria-label="Bookmarks" className="hidden xl:flex p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bookmark className="w-4 h-4" />
              </Link>

              {/* Create CTA — desktop only */}
              <Link to="/create" className="hidden lg:block ml-0.5 xl:ml-1 flex-shrink-0">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden xl:inline">{T("Log Issue", "பதிவு செய்க")}</span>
                  <span className="xl:hidden">{T("Post", "பதிவு")}</span>
                </button>
              </Link>

              <UserMenu />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}