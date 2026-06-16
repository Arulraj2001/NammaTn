import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search, Globe, Sun, Moon, Bookmark, ChevronDown,
  FileText, Zap, TrendingUp, Trophy, Users, MessageCircle,
  HelpCircle, Heart, Briefcase, Home, Building2, AlertTriangle,
  MapPin, Map, Leaf, ShoppingBag, Shield, ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "@/components/auth/UserMenu";

const MAIN_NAV = [
  { path: "/", en: "Home", ta: "முகப்பு" },
  { path: "/explore", en: "Explore", ta: "ஆராய்க" },
  { path: "/areas", en: "Areas", ta: "பகுதிகள்" },
  { path: "/situations", en: "Live", ta: "நேரடி" },
  { path: "/dashboard", en: "Dashboard", ta: "டாஷ்போர்டு" },
];

const MEGA_GROUPS = [
  {
    en_title: "Civic & Community",
    ta_title: "குடிமை & சமுதாயம்",
    items: [
      { path: "/community", icon: Users, en: "Community", ta: "சமுதாயம்", desc_en: "Discuss local issues and connect", desc_ta: "உள்ளூர் சிக்கல்களை விவாதிக்கவும்" },
      { path: "/trending", icon: TrendingUp, en: "Trending", ta: "டிரெண்டிங்", desc_en: "Most discussed civic issues", desc_ta: "அதிகம் விவாதிக்கப்பட்ட சிக்கல்கள்" },
      { path: "/ask", icon: MessageCircle, en: "Ask Local", ta: "கேளுங்கள்", desc_en: "Get answers from locals", desc_ta: "உள்ளூரினரிடம் பதில் பெறுங்கள்" },
      { path: "/situations", icon: Zap, en: "Live Situations", ta: "நேரடி நிலைமைகள்", desc_en: "Real-time alerts and updates", desc_ta: "நேரடி எச்சரிக்கைகள்" },
      { path: "/scams", icon: AlertTriangle, en: "Scams", ta: "மோசடி", desc_en: "Local scam and fraud alerts", desc_ta: "உள்ளூர் மோசடி எச்சரிக்கைகள்" },
      { path: "/awareness", icon: Shield, en: "Awareness", ta: "விழிப்புணர்வு", desc_en: "Safety and public awareness", desc_ta: "பாதுகாப்பு விழிப்புணர்வு" },
    ],
  },
  {
    en_title: "Local Services",
    ta_title: "உள்ளூர் சேவைகள்",
    items: [
      { path: "/jobs", icon: Briefcase, en: "Jobs", ta: "வேலை", desc_en: "Local job alerts and listings", desc_ta: "உள்ளூர் வேலை வாய்ப்புகள்" },
      { path: "/stay", icon: Home, en: "Stay & Rooms", ta: "தங்குமிடம்", desc_en: "PG, hostel, room listings", desc_ta: "PG, விடுதி, அறை பட்டியல்" },
      { path: "/listings", icon: ShoppingBag, en: "Local Listings", ta: "உள்ளூர் பட்டியல்", desc_en: "Verified local businesses", desc_ta: "சரிபார்க்கப்பட்ட வணிகங்கள்" },
      { path: "/offices", icon: Building2, en: "Offices", ta: "அலுவலகங்கள்", desc_en: "Find local public offices", desc_ta: "உள்ளூர் அரசு அலுவலகங்கள்" },
      { path: "/districts", icon: Map, en: "Districts", ta: "மாவட்டங்கள்", desc_en: "Explore by TN district", desc_ta: "மாவட்ட வாரியாக ஆராய்க" },
    ],
  },
  {
    en_title: "Help & Support",
    ta_title: "உதவி & ஆதரவு",
    items: [
      { path: "/help", icon: HelpCircle, en: "Help", ta: "உதவி", desc_en: "How to use NammaTN", desc_ta: "NammaTN எப்படி பயன்படுத்துவது" },
      { path: "/support", icon: Heart, en: "Support", ta: "ஆதரவு", desc_en: "Support and contact us", desc_ta: "எங்களை ஆதரியுங்கள்" },
      { path: "/contact", icon: MessageCircle, en: "Contact", ta: "தொடர்பு", desc_en: "Reach the NammaTN team", desc_ta: "NammaTN குழுவை தொடர்பு கொள்ளுங்கள்" },
    ],
  },
  {
    en_title: "For Organizations",
    ta_title: "நிறுவனங்களுக்கு",
    items: [
      { path: "/rwa", icon: MapPin, en: "RWA Dashboard", ta: "RWA டாஷ்போர்டு", desc_en: "Track area issues as a group", desc_ta: "குழுவாக பகுதி சிக்கல்களை கண்காணிக்கவும்" },
      { path: "/csr", icon: Leaf, en: "CSR Dashboard", ta: "CSR டாஷ்போர்டு", desc_en: "Support civic transparency", desc_ta: "குடிமை வெளிப்படைத்தன்மையை ஆதரிக்கவும்" },
      { path: "/leaderboard", icon: Trophy, en: "Civic Leaderboard", ta: "குடிமை தகுதிப் பட்டி", desc_en: "Active citizens & top areas", desc_ta: "செயலில் உள்ள குடிமக்கள்" },
    ],
  },
];

export default function Navbar({ theme, toggleTheme }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang } = useLanguage();
  const location = useLocation();
  const megaRef = useRef(null);

  const T = (en, ta) => lang === "ta" ? ta : en;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMegaOpen(false); }, [location.pathname, location.search]);

  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-700"
        : "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">TN</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight block">NammaTN</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none block">
                  {T("Public Civic Proof Platform", "பொது குடிமை ஆதார தளம்")}
                </span>
              </div>
            </Link>

            {/* Desktop Main Nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 ml-4">
              {MAIN_NAV.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === link.path
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {T(link.en, link.ta)}
                </Link>
              ))}

              {/* More dropdown */}
              <div ref={megaRef} className="relative">
                <button
                  onClick={() => setMegaOpen(!megaOpen)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    megaOpen ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {T("More", "மேலும்")}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-[680px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 z-50"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        {MEGA_GROUPS.map((group, gi) => (
                          <div key={gi}>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                              {T(group.en_title, group.ta_title)}
                            </p>
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors"
                                  >
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                        {T(item.en, item.ta)}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight truncate">
                                        {T(item.desc_en, item.desc_ta)}
                                      </p>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link to="/search" className="hidden md:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Search className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setLang(lang === "en" ? "ta" : "en")}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "en" ? "தமிழ்" : "English"}</span>
                <span className="sm:hidden uppercase font-bold text-[10px]">{lang === "en" ? "ta" : "en"}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link to="/bookmarks" className="hidden md:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bookmark className="w-4 h-4" />
              </Link>

              {/* Create CTA — desktop only */}
              <Link to="/create" className="hidden lg:block ml-1">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                  <FileText className="w-3.5 h-3.5" />
                  {T("Create Civic Receipt", "குடிமை ரசீது")}
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