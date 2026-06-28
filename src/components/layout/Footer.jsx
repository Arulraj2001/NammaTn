import React from "react";
import Image from "next/image";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSettingsMap } from "@/services/admin/settings";

/* ── Link columns: content from 2nd image ─────────────────── */
const FOOTER_COLUMNS = [
  {
    en_title: "Civic Proof",
    ta_title: "குடிமை ஆதாரம்",
    links: [
      { path: "/create",      en: "Create Civic Receipt", ta: "குடிமை ரசீது உருவாக்கு" },
      { path: "/bribes",      en: "Bribe Tracker",        ta: "லஞ்சக் கண்காணிப்பு" },
      { path: "/explore",     en: "Explore",              ta: "ஆராய்க" },
      { path: "/trending",    en: "Trending",             ta: "டிரெண்டிங்" },
      { path: "/situations",  en: "Live",                 ta: "நேரடி" },
      { path: "/leaderboard", en: "Leaderboard",          ta: "தகுதிப் பட்டி" },
    ],
  },
  {
    en_title: "Community",
    ta_title: "சமுதாயம்",
    links: [
      { path: "/community",  en: "Community",  ta: "சமுதாயம்" },
      { path: "/community/wins", en: "Community Wins", ta: "சமூக வெற்றிகள்" },
      { path: "/ask",        en: "Ask Local",  ta: "கேளுங்கள்" },
      { path: "/scams",      en: "Scams",      ta: "மோசடி" },
      { path: "/awareness",  en: "Awareness",  ta: "விழிப்புணர்வு" },
    ],
  },
  {
    en_title: "Local Life",
    ta_title: "உள்ளூர் வாழ்க்கை",
    links: [
      { path: "/jobs",      en: "Jobs",           ta: "வேலை" },
      { path: "/stay",      en: "Stay & Rooms",   ta: "தங்குமிடம்" },
      { path: "/offices",   en: "Offices",        ta: "அலுவலகங்கள்" },
      { path: "/listings",  en: "Local Listings", ta: "உள்ளூர் பட்டியல்" },
    ],
  },
  {
    en_title: "Organizations",
    ta_title: "நிறுவனங்கள்",
    links: [
      { path: "/rwa",       en: "RWA Dashboard", ta: "RWA டாஷ்போர்டு" },
      { path: "/csr",       en: "CSR Dashboard", ta: "CSR டாஷ்போர்டு" },
      { path: "/areas",     en: "Areas",         ta: "பகுதிகள்" },
      { path: "/districts", en: "Districts",     ta: "மாவட்டங்கள்" },
    ],
  },
  {
    en_title: "Help",
    ta_title: "உதவி",
    links: [
      { path: "/about",          en: "About VizhiTN",  ta: "VizhiTN பற்றி" },
      { path: "/help",           en: "Help",           ta: "உதவி" },
      { path: "/how-to-use",     en: "How to Use",     ta: "பயன்படுத்துவது எப்படி" },
      { path: "/support",        en: "Support",        ta: "ஆதரவு" },
      { path: "/contact",        en: "Contact",        ta: "தொடர்பு" },
      { path: "/privacy-policy", en: "Privacy Policy", ta: "தனியுரிமை கொள்கை" },
      { path: "/terms",          en: "Terms of Service",ta: "ழெவிடுகள்" },
    ],
  },
];

/* ── Inline social SVGs ────────────────────────────────────── */
function FacebookIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}
function TelegramIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.89 1.2-5.33 3.52-.5.35-.96.52-1.37.51-.45-.01-1.32-.26-1.97-.47-.8-.26-1.43-.4-1.38-.85.03-.23.35-.47.96-.71 3.76-1.63 6.27-2.7 7.54-3.21 3.59-1.44 4.34-1.69 4.83-1.7.11 0 .35.03.5.15.12.1.16.24.18.34.02.09.03.27.01.38z"/>
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.167 1.45 4.814 1.453 5.457 0 9.895-4.436 9.898-9.896.002-2.646-1.018-5.132-2.873-6.99C15.823 1.863 13.334.844 10.692.844 5.234.844.798 5.281.795 10.741c-.001 1.702.447 3.366 1.3 4.84l-.995 3.637 3.737-.98c1.477.805 3.125 1.233 4.805 1.235zm11.232-7.653c-.307-.154-1.82-.898-2.102-1.001-.282-.103-.487-.154-.691.154-.205.308-.795 1.001-.974 1.205-.179.205-.359.231-.666.077-.307-.154-1.3-.478-2.476-1.527-.914-.815-1.53-1.822-1.71-2.129-.18-.308-.019-.475.135-.629.138-.138.307-.359.461-.539.154-.179.205-.308.307-.513.103-.205.051-.385-.026-.539-.077-.154-.691-1.667-.948-2.283-.25-.6-.525-.519-.72-.529-.186-.009-.4-.01-.614-.01-.215 0-.564.081-.861.405-.297.324-1.133 1.107-1.133 2.7 0 1.593 1.159 3.13 1.318 3.344.159.214 2.28 3.482 5.522 4.883.771.333 1.373.532 1.84.68.775.246 1.48.212 2.037.129.621-.093 1.82-.744 2.076-1.462.256-.718.256-1.333.179-1.462-.076-.128-.282-.205-.589-.359z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────── */
export default function Footer() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  // Visual column order on mobile: Row 1 (1, 3, 5), Row 2 (2, 4)
  const ORDER_CLASSES = [
    "order-1 sm:order-none", // Civic Proof (1)
    "order-4 sm:order-none", // Community (2)
    "order-2 sm:order-none", // Local Life (3)
    "order-5 sm:order-none", // Organizations (4)
    "order-3 sm:order-none", // Help (5)
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:py-10">

        {/* ── Main row: brand + link columns ── */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-16">

          {/* Brand */}
          <div className="flex-shrink-0 w-full lg:w-64 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <Image
                src={settings.site_logo_url || "/apple-touch-icon.png"}
                alt="VizhiTN"
                width={28}
                height={28}
                className="rounded-lg object-contain flex-shrink-0"
                quality={90}
              />
              <span className="font-extrabold text-blue-600 text-base leading-none">VizhiTN</span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
              {T("Community Verified.", "சமூகத்தால் சரிபார்க்கப்பட்டது.")}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug mb-4">
              {T("People Powered.", "மக்களால் இயக்கப்படுகிறது.")}
            </p>
            {/* Social icons row */}
            <div className="flex items-center gap-2">
              {[
                { icon: <FacebookIcon />,  label: "Facebook", key: "social_facebook", defaultUrl: "https://facebook.com/vizhitn" },
                { icon: <TwitterIcon />,   label: "Twitter", key: "social_twitter", defaultUrl: "https://twitter.com/vizhitn" },
                { icon: <InstagramIcon />, label: "Instagram", key: "social_instagram", defaultUrl: "https://instagram.com/vizhitn" },
                { icon: <TelegramIcon />,  label: "Telegram", key: "social_telegram", defaultUrl: "https://t.me/vizhitn" },
                { icon: <WhatsAppIcon />,  label: "WhatsApp", key: "social_whatsapp", defaultUrl: "" },
              ].map(({ icon, label, key, defaultUrl }) => {
                const url = settings[key] || defaultUrl;
                if (!url || url.trim() === "") return null;
                return (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {icon}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          <div className="flex-1 w-full grid grid-cols-3 sm:grid-cols-5 gap-6 lg:gap-8 text-center sm:text-left">
            {FOOTER_COLUMNS.map((col, idx) => (
              <div key={col.en_title} className={ORDER_CLASSES[idx]}>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  {T(col.en_title, col.ta_title)}
                </h4>
                <ul className="space-y-2">
                  {col.links
                    .filter((link) => {
                      if (link.path === "/jobs" && settings.jobs_enabled === "false") return false;
                      if (link.path === "/scams" && settings.scam_alerts_enabled === "false") return false;
                      if (link.path === "/help" && settings.emergency_enabled === "false") return false;
                      if (link.path === "/offices" && settings.office_reports_enabled === "false") return false;
                      if (link.path === "/ask" && settings.qa_enabled === "false") return false;
                      if (link.path === "/situations" && settings.situations_enabled === "false") return false;
                      if (link.path === "/rwa" && settings.rwa_enabled === "false") return false;
                      if (link.path === "/csr" && settings.csr_enabled === "false") return false;
                      if ((link.path === "/community" || link.path === "/community/wins") && settings.discussions_enabled === "false") return false;
                      return true;
                    })
                    .map((link) => (
                      <li key={link.path + link.en}>
                        <Link
                          to={link.path}
                          className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {T(link.en, link.ta)}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom copyright + legal bar ── */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2026 VizhiTN. {T("All rights reserved.", "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.")}
          </p>
          {/* Legal links — required to be visible for AdSense approval */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link to="/privacy-policy" className="text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {T("Privacy Policy", "தனியுரிமை")}
            </Link>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <Link to="/terms" className="text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {T("Terms", "ழெவிடுகள்")}
            </Link>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <Link to="/about" className="text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {T("About", "பற்றி")}
            </Link>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <a href="mailto:advertise@vizhitn.in" className="text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {T("Advertise", "விளம்பரம்")}
            </a>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
            {T("Made with", "அன்போடு செய்யப்பட்டது")}
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            {T("for Tamil Nadu", "தமிழ்நாட்டிற்காக")}
          </p>
        </div>

      </div>
    </footer>
  );
}