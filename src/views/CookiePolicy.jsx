"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cookie, Shield, Settings, CheckCircle2, XCircle,
  Info, ExternalLink, Mail, AlertTriangle, Eye, BarChart2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { COOKIE_PREFERENCES_EVENT } from "@/lib/cookieConsent";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

const COOKIE_TYPES = [
  {
    id: "strictly-necessary",
    icon: Shield,
    required: true,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "ALWAYS ACTIVE",
    badge_color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
    en: "Strictly Necessary Cookies",
    ta: "அத்தியாவசிய குக்கீகள் (கட்டாயம்)",
    desc_en: "These cookies are essential for the website to function. They include session tokens to keep you signed in, your language preference (English/Tamil), dark mode setting, and district selection cache. These cannot be disabled.",
    desc_ta: "இவை தளம் செயல்படுவதற்கு அவசியமான குக்கீகள். உள்நுழைவு நிலை, மொழி (ஆங்கிலம்/தமிழ்), இருண்ட பயன்முறை மற்றும் மாவட்டத் தேர்வு ஆகியவற்றை சேமிக்கின்றன. இவற்றை முடக்க முடியாது.",
    cookies: [
      { name: "sb-auth-token", purpose_en: "Supabase session authentication", duration_en: "7 days" },
      { name: "tn_theme", purpose_en: "Light/dark mode preference", duration_en: "1 year" },
      { name: "tn_lang", purpose_en: "Language preference (EN/TA)", duration_en: "1 year" },
      { name: "VizhiTN_cookie_consent", purpose_en: "Stores your cookie consent choice", duration_en: "1 year" },
    ]
  },
  {
    id: "analytics",
    icon: BarChart2,
    required: false,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    badge: "OPTIONAL",
    badge_color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    en: "Analytics Cookies",
    ta: "பகுப்பாய்வு குக்கீகள் (விருப்பம்)",
    desc_en: "We use Google Analytics 4 (GA4) and Microsoft Clarity to understand how citizens use the platform — which districts are most active, which civic categories get the most attention, and how navigation flows. This helps us improve the platform. IP addresses are anonymized.",
    desc_ta: "Google Analytics 4 மற்றும் Microsoft Clarity மூலம் எந்த மாவட்டங்கள் அதிகமாக பயன்படுத்துகின்றன, எந்த வகைகளுக்கு அதிக கவனம் கிடைக்கிறது என்று புரிந்துகொள்கிறோம். ஐபி முகவரிகள் அநாமதேயமாக்கப்படுகின்றன.",
    cookies: [
      { name: "_ga", purpose_en: "Google Analytics 4 — distinguishes users", duration_en: "2 years" },
      { name: "_ga_*", purpose_en: "GA4 session state", duration_en: "2 years" },
      { name: "_clck", purpose_en: "Microsoft Clarity — user session", duration_en: "1 year" },
      { name: "_clsk", purpose_en: "Microsoft Clarity — session grouping", duration_en: "Session" },
    ]
  },
  {
    id: "advertising",
    icon: Eye,
    required: false,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200 dark:border-indigo-800",
    badge: "OPTIONAL",
    badge_color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300",
    en: "Advertising Cookies (Google AdSense)",
    ta: "விளம்பர குக்கீகள் — Google AdSense (விருப்பம்)",
    desc_en: "VizhiTN displays non-intrusive ads from Google AdSense to offset server and operational costs. Google uses cookies to serve relevant ads based on prior site visits. These cookies are only set after you click 'Accept All' in the cookie consent banner.",
    desc_ta: "சேவையக செலவுகளை ஈடுகட்ட Google AdSense விளம்பரங்கள் காட்டப்படுகின்றன. நீங்கள் 'அனைத்தையும் ஏற்கவும்' என்று தேர்ந்தெடுத்தால் மட்டுமே இந்த குக்கீகள் அமைக்கப்படும்.",
    cookies: [
      { name: "IDE", purpose_en: "Google DoubleClick — ad personalization", duration_en: "1 year" },
      { name: "test_cookie", purpose_en: "Google — checks cookie support", duration_en: "Session" },
      { name: "__gads", purpose_en: "Google AdSense — ad frequency capping", duration_en: "13 months" },
      { name: "DSID", purpose_en: "Google — ad conversion tracking (logged-in users)", duration_en: "2 weeks" },
    ]
  }
];

export default function CookiePolicy() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [expandedSection, setExpandedSection] = useState(null);

  const openConsentBanner = () => {
    window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT));
  };

  usePageMeta({
    title: "Cookie Policy | VizhiTN — Analytics, AdSense & Consent Controls",
    description: "Read VizhiTN's full cookie policy. Understand which cookies are strictly necessary vs optional analytics and Google AdSense advertising cookies. Manage your preferences anytime.",
    canonical: "https://www.vizhitn.in/cookie-policy",
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── HERO ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-3">
              <Cookie className="w-3.5 h-3.5" />
              {T("COOKIE POLICY & CONSENT MANAGEMENT", "குக்கீ கொள்கை & சம்மத மேலாண்மை")}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              {T("VizhiTN Cookie Policy", "VizhiTN குக்கீ கொள்கை")}
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed mb-5">
              {T(
                "We use a small set of cookies to keep VizhiTN functional, measure how citizens use the platform, and serve non-intrusive ads that fund our civic journalism. Only strictly necessary cookies are active by default. Optional cookies require your explicit consent.",
                "VizhiTN செயல்பட, பயன்பாட்டு முறைகளை அளவிட மற்றும் குடிமை சேவைகளை நிதியுதவி செய்யும் விளம்பரங்களை காட்ட சில குக்கீகளை பயன்படுத்துகிறோம். இயல்பாக அத்தியாவசியமான குக்கீகள் மட்டுமே செயலில் இருக்கும்."
              )}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={openConsentBanner}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Settings className="w-3.5 h-3.5" />
                {T("Manage Cookie Preferences", "குக்கீ விருப்பங்களை மாற்ற")}
              </button>
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {T("Google Ad Settings", "Google விளம்பர அமைப்புகள்")}
              </a>
            </div>
          </div>
        </div>

        {/* ── WHAT IS A COOKIE ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 flex items-start gap-4">
          <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {T("What is a Cookie?", "குக்கீ என்றால் என்ன?")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {T(
                "A cookie is a small text file stored on your device by a website. Cookies help websites remember your preferences, keep you signed in, and understand how pages are used. They do not contain personal information like your name or password unless you specifically provided it.",
                "குக்கீ என்பது வலைத்தளத்தால் உங்கள் சாதனத்தில் சேமிக்கப்படும் ஒரு சிறிய உரைக் கோப்பு. குக்கீகள் உங்கள் விருப்பங்களை நினைவில் வைத்திருக்கவும், உள்நுழைந்திருக்கவும் உதவுகின்றன. நீங்கள் குறிப்பாக வழங்காத வரை அவற்றில் உங்கள் பெயர் அல்லது கடவுச்சொல் போன்ற தனிப்பட்ட தகவல்கள் இருக்காது."
              )}
            </p>
          </div>
        </div>

        {/* ── COOKIE CATEGORIES ── */}
        <div className="space-y-5">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {T("Cookies Used on VizhiTN", "VizhiTN-ல் பயன்படுத்தப்படும் குக்கீகள்")}
          </h2>

          {COOKIE_TYPES.map((type) => {
            const Icon = type.icon;
            const isExpanded = expandedSection === type.id;
            return (
              <div
                key={type.id}
                id={type.id}
                className={`bg-white dark:bg-slate-900 border-2 ${type.border} rounded-3xl overflow-hidden shadow-xs`}
              >
                <div className={`p-5 sm:p-7 ${type.bg}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-900 ${type.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                            {T(type.en, type.ta)}
                          </h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${type.badge_color}`}>
                            {type.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                          {T(type.desc_en, type.desc_ta)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                      {type.required ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <button
                          onClick={() => setExpandedSection(isExpanded ? null : type.id)}
                          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline underline-offset-2"
                        >
                          {isExpanded ? T("Hide details", "மறை") : T("See cookies", "குக்கீகளை பார்க்கவும்")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cookie table — shown if expanded or always for necessary */}
                {(isExpanded || type.required) && (
                  <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60">
                          <th className="text-left px-4 sm:px-6 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {T("Cookie Name", "குக்கீ பெயர்")}
                          </th>
                          <th className="text-left px-4 sm:px-6 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {T("Purpose", "நோக்கம்")}
                          </th>
                          <th className="text-left px-4 sm:px-6 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                            {T("Duration", "கால அளவு")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {type.cookies.map((cookie, i) => (
                          <tr
                            key={i}
                            className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="px-4 sm:px-6 py-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {cookie.name}
                            </td>
                            <td className="px-4 sm:px-6 py-3 text-slate-600 dark:text-slate-400">
                              {cookie.purpose_en}
                            </td>
                            <td className="px-4 sm:px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {cookie.duration_en}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── HOW TO MANAGE / OPT OUT ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {T("How to Manage or Withdraw Consent", "சம்மதத்தை எவ்வாறு நிர்வகிக்கலாம் அல்லது திரும்பப் பெறலாம்")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title_en: "On VizhiTN",
                title_ta: "VizhiTN-ல்",
                desc_en: "Click 'Manage Cookie Preferences' above to re-open our consent banner. Select 'Reject Non-Essential' at any time.",
                desc_ta: "மேலே 'குக்கீ விருப்பங்களை மாற்ற' என்பதை கிளிக் செய்யவும். எந்த நேரத்திலும் 'அத்தியாவசியமற்றவற்றை நிராகரி' என்பதை தேர்ந்தெடுக்கலாம்.",
                href: null,
                action_en: "Manage Preferences",
                action_ta: "விருப்பங்களை மாற்ற",
                onClick: true
              },
              {
                title_en: "Google Ads Settings",
                title_ta: "Google விளம்பர அமைப்புகள்",
                desc_en: "Opt out of personalized advertising across all Google products, including AdSense.",
                desc_ta: "Google AdSense உட்பட அனைத்து Google தயாரிப்புகளிலும் தனிப்பயனாக்கப்பட்ட விளம்பரங்களை நிறுத்தலாம்.",
                href: "https://adssettings.google.com",
                action_en: "Google Ads Settings →",
                action_ta: "Google அமைப்புகள் →"
              },
              {
                title_en: "Browser Settings",
                title_ta: "உலாவி அமைப்புகள்",
                desc_en: "All major browsers let you block, delete, or restrict cookies via Settings > Privacy & Security.",
                desc_ta: "Chrome, Firefox, Safari ஆகிய அனைத்து உலாவிகளும் அமைப்புகள் > தனியுரிமை வழியாக குக்கீகளை தடுக்க அல்லது நீக்க அனுமதிக்கின்றன.",
                href: "https://support.google.com/chrome/answer/95647",
                action_en: "Chrome Help →",
                action_ta: "Chrome உதவி →"
              }
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{T(item.title_en, item.title_ta)}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{T(item.desc_en, item.desc_ta)}</p>
                {item.onClick ? (
                  <button
                    onClick={openConsentBanner}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {T(item.action_en, item.action_ta)}
                  </button>
                ) : (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {T(item.action_en, item.action_ta)}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              {T(
                "Blocking strictly necessary cookies may prevent you from signing in, saving your language preference, or receiving district-specific alerts.",
                "அத்தியாவசியமான குக்கீகளை தடுப்பது உள்நுழைவு, மொழி அமைப்பு சேமிப்பு அல்லது மாவட்ட அறிவிப்புகளை பெறுவதை தடுக்கலாம்."
              )}
            </p>
          </div>
        </div>

        {/* ── CONTACT ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {T("Questions About Our Cookie Usage?", "குக்கீ பயன்பாடு குறித்த கேள்விகள்?")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {T("Email our Privacy Officer — responses within 24 hours.", "எங்கள் தனியுரிமை அதிகாரிக்கு மின்னஞ்சல் அனுப்பவும் — 24 மணி நேரத்திற்குள் பதில்.")}
            </p>
          </div>
          <a
            href="mailto:vizhitnin@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex-shrink-0"
          >
            <Mail className="w-3.5 h-3.5" />
            vizhitnin@gmail.com
          </a>
        </div>

        <UniversalCrossLinks pageType="support" />
      </div>
    </div>
  );
}
