import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link, useLocation } from "@/lib/router-compat";
import {
  Search, Globe, Sun, Moon, Bookmark, ChevronDown, Zap, TrendingUp, Trophy, Users, MessageCircle,
  HelpCircle, Heart, Briefcase, Home, Building2, AlertTriangle,
  MapPin, Map, Leaf, ShoppingBag, Shield, ArrowRight, Plus, LayoutDashboard, Info, X
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
  { path: "/tn-politics", en: "🗳️ TN Politics", ta: "🗳️ அரசியல்" },
  { path: "/trending", en: "🔥 Trending", ta: "🔥 டிரெண்டிங்" },
  { path: "/bribes", en: "🚨 Bribe Log", ta: "🚨 லஞ்சப் பதிவு" },
];


const MEGA_COLUMNS = [
  {
    en_title: "Alerts & Live",
    ta_title: "எச்சரிக்கைகள் & நேரலை",
    items: [
      { path: "/power-cuts-today-tamil-nadu", icon: Zap, en: "Power Cuts Today", ta: "இன்றைய மின்தடை", desc_en: "Live TANGEDCO power cuts", desc_ta: "நேரடி மின் தடை தகவல்கள்" },
      { path: "/school-college-holiday-alerts", icon: AlertTriangle, en: "Holiday Alerts", ta: "பள்ளி விடுமுறை", desc_en: "Rain & Collector orders", desc_ta: "ஆட்சியர் விடுமுறை அறிவிப்புகள்" },
      { path: "/situations", icon: Zap, en: "Live Situations", ta: "நேரடி நிலைமைகள்", desc_en: "Real-time alerts & updates", desc_ta: "நேரடி பகுதி எச்சரிக்கைகள்" },
      { path: "/scams", icon: Shield, en: "Scam Alerts", ta: "மோசடி எச்சரிக்கை", desc_en: "Local scam & fraud alerts", desc_ta: "உள்ளூர் மோசடி எச்சரிக்கைகள்" },
      { path: "/bribes", icon: AlertTriangle, en: "Bribe Tracker", ta: "லஞ்சப் பதிவு", desc_en: "Citizen corruption reports", desc_ta: "லஞ்சப் புகார்கள் கண்காணிப்பு" },
    ],
  },
  {
    en_title: "Civic & Directory",
    ta_title: "குடிமை & முகவரிகள்",
    items: [
      { path: "/offices", icon: Building2, en: "Public Offices", ta: "அரசு அலுவலகங்கள்", desc_en: "Taluk & municipal offices", desc_ta: "வட்டாட்சியர், மாநகராட்சி அலுவலகம்" },
      { path: "/districts", icon: Map, en: "38 Districts", ta: "38 மாவட்டங்கள்", desc_en: "Explore by TN district", desc_ta: "மாவட்ட வாரியாக ஆராய்க" },
      { path: "/awareness", icon: Shield, en: "Citizen Awareness", ta: "குடிமை விழிப்புணர்வு", desc_en: "Rights, schemes & safety", desc_ta: "உரிமைகள், திட்டங்கள் & விழிப்புணர்வு" },
      { path: "/ask", icon: MessageCircle, en: "Ask Local", ta: "கேளுங்கள்", desc_en: "Questions & local answers", desc_ta: "உள்ளூரினரிடம் கேள்வி கேளுங்கள்" },
      { path: "/dashboard", icon: LayoutDashboard, en: "Civic Dashboard", ta: "டாஷ்போர்டு", desc_en: "State civic resolution stats", desc_ta: "மாநில குடிமை புள்ளிவிவரம்" },
    ],
  },
  {
    en_title: "Local Life & Stay",
    ta_title: "வாழ்க்கை & வாய்ப்புகள்",
    items: [
      { path: "/jobs", icon: Briefcase, en: "Local Jobs", ta: "உள்ளூர் வேலை", desc_en: "Local job alerts & listings", desc_ta: "உள்ளூர் வேலை வாய்ப்புகள்" },
      { path: "/stay", icon: Home, en: "Stay & Rooms", ta: "தங்குமிடம் & PG", desc_en: "PG, hostel & rental rooms", desc_ta: "PG, விடுதி, அறை பட்டியல்" },
      { path: "/listings", icon: ShoppingBag, en: "Local Listings", ta: "உள்ளூர் பட்டியல்", desc_en: "Verified local services", desc_ta: "சரிபார்க்கப்பட்ட சேவைகள்" },
      { path: "/trending", icon: TrendingUp, en: "Trending Topics", ta: "டிரெண்டிங் தலைப்புகள்", desc_en: "Most discussed civic issues", desc_ta: "அதிகம் விவாதிக்கப்பட்ட சிக்கல்கள்" },
      { path: "/leaderboard", icon: Trophy, en: "Civic Leaderboard", ta: "தகுதிப் பட்டியல்", desc_en: "Active citizens & top areas", desc_ta: "செயலில் உள்ள குடிமக்கள்" },
    ],
  },
  {
    en_title: "Community & Help",
    ta_title: "சமூகம் & ஆதரவு",
    items: [
      { path: "/help", icon: HelpCircle, en: "Emergency Help", ta: "அவசர உதவி", desc_en: "Helplines & urgent support", desc_ta: "அவசர உதவி கோரிக்கைகள்" },
      { path: "/rwa", icon: MapPin, en: "RWA Hub", ta: "RWA மையம்", desc_en: "Resident association tracking", desc_ta: "குடியிருப்போர் நலச் சங்கம்" },
      { path: "/csr", icon: Leaf, en: "CSR Hub", ta: "CSR மையம்", desc_en: "Support civic transparency", desc_ta: "நிறுவன சமூகப் பங்களிப்பு" },
      { path: "/how-to-use", icon: Info, en: "How to Use", ta: "பயன்படுத்துவது எப்படி", desc_en: "VizhiTN guide & walkthrough", desc_ta: "VizhiTN எப்படி பயன்படுத்துவது" },
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
        scrolled ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-700"
        : "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
      }`}>
        {/* Ticker Row — Positioned ABOVE the Navbar */}
        {showAnnouncement && (
          <div className={`w-full h-8 relative flex items-center overflow-hidden border-b text-[11px] font-medium leading-none select-none ${bgClass}`}>
            {/* Pinned Label / Icon */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1.5 px-3 z-20 font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
              {announcementIcon}
              <span>{T("Alert", "அறிவிப்பு")}</span>
            </div>

            {/* Marquee Content */}
            <div className="flex-1 h-full overflow-hidden relative flex items-center pl-[115px] pr-[40px]">
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
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none block whitespace-nowrap">
                  {T("Public Civic Proof Platform", "பொது குடிமை ஆதார தளம்")}
                </span>
              </div>
            </Link>

            {/* Desktop Main Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 ml-1 xl:ml-3">
              {MAIN_NAV.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === link.path
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                  className={`flex items-center gap-1 px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    megaOpen ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  aria-expanded={megaOpen}
                  aria-label={T("All Pages & Services", "அனைத்து பக்கங்கள் & சேவைகள்")}
                >
                  <Briefcase className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-500" />
                  {T("Directory", "சேவைகள்")}
                  <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full -right-28 xl:left-1/2 xl:-translate-x-1/2 pt-2 z-50 w-[880px] max-w-[calc(100vw-2rem)]"
                    >
                      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 ring-1 ring-black/5 dark:ring-white/5">
                        <div className="grid grid-cols-4 gap-3.5 items-start">
                          {MEGA_COLUMNS.map((column, ci) => {
                            const filteredItems = column.items.filter((item) => {
                              if (item.path === "/jobs" && settings.jobs_enabled === "false") return false;
                              if (item.path === "/scams" && settings.scam_alerts_enabled === "false") return false;
                              if (item.path === "/help" && settings.emergency_enabled === "false") return false;
                              if (item.path === "/offices" && settings.office_reports_enabled === "false") return false;
                              if (item.path === "/ask" && settings.qa_enabled === "false") return false;
                              if (item.path === "/situations" && settings.situations_enabled === "false") return false;
                              if (item.path === "/rwa" && settings.rwa_enabled === "false") return false;
                              if (item.path === "/csr" && settings.csr_enabled === "false") return false;
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <Link to="/search" aria-label="Search" className="hidden md:flex p-1.5 xl:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Search className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setLang(lang === "en" ? "ta" : "en")}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Switch Language"
                aria-label="Switch Language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "en" ? "தமிழ்" : "English"}</span>
                <span className="sm:hidden uppercase font-bold text-[10px]">{lang === "en" ? "ta" : "en"}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-1.5 xl:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link to="/bookmarks" aria-label="Bookmarks" className="hidden md:flex p-1.5 xl:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bookmark className="w-4 h-4" />
              </Link>

              {/* Create CTA — desktop only */}
              <Link to="/create" className="hidden lg:block ml-1">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 xl:px-4 xl:py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  {T("Log Issue", "பதிவு செய்க")}
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