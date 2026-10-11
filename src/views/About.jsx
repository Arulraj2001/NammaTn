"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Eye, Shield, MapPin, Users, Zap, CheckCircle2,
  AlertTriangle, Phone, Scale, Award, Heart, Camera,
  Building2, ArrowRight, Sparkles, Flame, Clock,
  ExternalLink, Compass, ShieldAlert, MessageSquare,
  FileText, Check, HelpCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery } from "@tanstack/react-query";
import { getSettingsMap } from "@/services/admin/settings";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

export default function About() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [activeTab, setActiveTab] = useState("mission");

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  const contactEmail = settings.contact_email || settings.support_email || "support@vizhitn.in";

  usePageMeta({
    title: "About VizhiTN | Tamil Nadu's Civic Proof & Public Intelligence Network",
    description: "Learn about VizhiTN — our mission to document civic issues with photo evidence, provide daily power cut & rain alerts, audit bribes anonymously, and empower citizens across all 38 districts of Tamil Nadu.",
  });

  const STATS = [
    { num: "38", label_en: "Districts Covered", label_ta: "மாவட்டங்கள் சேர்ப்பு", desc_en: "Hyperlocal from Chennai to Kanyakumari", desc_ta: "சென்னை முதல் குமரி வரை முழுமையான தகவல்" },
    { num: "12", label_en: "Civic Categories", label_ta: "குடிமைப் பிரிவுகள்", desc_en: "Roads, water, power, safety, welfare", desc_ta: "சாலை, குடிநீர், மின்சாரம், பாதுகாப்பு" },
    { num: "24x7", label_en: "Emergency Hotlines", label_ta: "அவசர கட்டுப்பாட்டு எண்கள்", desc_en: "Verified 112, 108, 1912, 1930, 1070", desc_ta: "சரிபார்க்கப்பட்ட அரசு அவசர உதவி எண்கள்" },
    { num: "100%", label_en: "Free & Citizen-Owned", label_ta: "முற்றிலும் இலவசம்", desc_en: "Zero fees, non-governmental & non-partisan", desc_ta: "சுயேச்சையான பொதுமக்கள் இயக்கம்" },
  ];

  const FOUR_PILLARS = [
    {
      icon: Camera,
      color: "bg-red-600 text-white",
      border: "border-red-200 dark:border-red-900/60",
      bg: "bg-red-50/50 dark:bg-red-950/20",
      title_en: "1. The Civic Proof & Victory Ledger",
      title_ta: "1. குடிமை ஆதாரப் பதிவு & வெற்றிச் சுவர்",
      desc_en: "Every reported pothole, broken streetlight, or burst pipe generates a timestamped, GPS-verified Civic Receipt. Public reports stay visible until fixed and verified by the community on the Victory Wall.",
      desc_ta: "ஒவ்வொரு புகாரும் புகைப்பட ஆதாரம் மற்றும் ஜிபிஎஸ் குறியீட்டுடன் குடிமை ரசீதாக மாறுகிறது. சிக்கல் தீர்க்கப்படும் வரை பொதுவெளியில் நிலைத்து நின்று, சீரமைக்கப்பட்டதும் வெற்றிச் சுவரில் ஆவணப்படுத்தப்படுகிறது.",
      href: "/explore",
      link_text_en: "Explore Live Feed →",
      link_text_ta: "நேரலை பார்க்க →"
    },
    {
      icon: Zap,
      color: "bg-amber-600 text-white",
      border: "border-amber-200 dark:border-amber-900/60",
      bg: "bg-amber-50/50 dark:bg-amber-950/20",
      title_en: "2. Daily Utilities & Disaster Alerts",
      title_ta: "2. தினசரி மின்வெட்டு & பேரிடர் அறிவிப்புகள்",
      desc_en: "Official, verified morning dispatches for TANGEDCO scheduled substation maintenance shutdowns, District Collector school/college heavy rain holidays, and metro traffic diversions.",
      desc_ta: "மின்வாரியத்தின் திட்டமிட்ட மின்தடை நேரங்கள் (Power Cuts Today), மாவட்ட ஆட்சியர் அறிவிக்கும் மழை பள்ளி விடுமுறைகள் மற்றும் களப் போக்குவரத்து மாற்றங்களை முன்கூட்டியே அறியலாம்.",
      href: "/power-cuts-today-tamil-nadu",
      link_text_en: "Check Power Cuts →",
      link_text_ta: "மின்தடை அறிய →"
    },
    {
      icon: Phone,
      color: "bg-rose-600 text-white",
      border: "border-rose-200 dark:border-rose-900/60",
      bg: "bg-rose-50/50 dark:bg-rose-950/20",
      title_en: "3. 24x7 Emergency Command & Citizen SOS",
      title_ta: "3. அவசர கட்டுப்பாட்டு மையம் & சமுதாய உதவி",
      desc_en: "Direct 1-tap dial for Minnalagam 1912 (EB live wire hazards), 108 Ambulance, GCC 1913, 1070/1077 Disaster Desks, and a citizen board to broadcast urgent blood donor requirements.",
      desc_ta: "மின்னகம் 1912, 108 ஆம்புலன்ஸ், 1070 பேரிடர் மற்றும் 38 மாவட்ட ஆட்சியர் கட்டுப்பாட்டு எண்களுக்கான (1077) நேரடி அழைப்புகள்; அவசர ரத்த தான உதவி பலகை.",
      href: "/helplines",
      link_text_en: "Open Helplines Desk →",
      link_text_ta: "அவசர மையம் பார்க்க →"
    },
    {
      icon: Scale,
      color: "bg-purple-600 text-white",
      border: "border-purple-200 dark:border-purple-900/60",
      bg: "bg-purple-50/50 dark:bg-purple-950/20",
      title_en: "4. Bribe Audits & Hyperlocal Scam Defense",
      title_ta: "4. லஞ்சக் கண்காணிப்பு & மோசடி தடுப்பு",
      desc_en: "Anonymous bribery demand tracking to build regional integrity indices and direct routing to DVAC 1064, combined with real-time scam radar for fake EB bill SMS and online financial frauds (1930).",
      desc_ta: "அரசு அலுவலக லஞ்சக் கோரிக்கைகளை அநாமதேயமாக பதிவு செய்தல், DVAC 1064 எண் மற்றும் போலி மின் கட்டண SMS, ஆன்லைன் நிதி மோசடிகளில் இருந்து பாதுகாக்கும் எச்சரிக்கை ரேடார் (1930).",
      href: "/bribe-tracker",
      link_text_en: "View Bribe Tracker →",
      link_text_ta: "லஞ்சப் பலகை பார்க்க →"
    }
  ];

  const CORE_VALUES = [
    {
      badge: "NON-GOVERNMENTAL",
      badge_color: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
      title_en: "Independent & Non-Partisan",
      title_ta: "சுயேச்சை & நடுநிலையான இயக்கம்",
      desc_en: "VizhiTN is not funded or managed by any political party or government department. We serve the citizens of Tamil Nadu as an open mirror of public reality.",
      desc_ta: "VizhiTN எந்தவொரு அரசியல் கட்சியாலும் அல்லது அரசுத் துறையாலும் நடத்தப்படுவதில்லை. இது மக்களின் பொதுக் குரலாக செயல்படும் நடுநிலையான தளம்."
    },
    {
      badge: "ZERO HALLUCINATION",
      badge_color: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
      title_en: "Verified Ground Data Only",
      title_ta: "உண்மைத்தன்மை & ஆதாரங்கள் மட்டுமே",
      desc_en: "No AI hallucinations or vague assumptions. All power cuts cite TANGEDCO circle releases, rain holidays cite Collectorate circulars, and complaints require daytime photos.",
      desc_ta: "வதந்திகளுக்கு இடமில்லை. மின்தடை செய்திகள் மின்வாரிய சுற்றறிக்கையின்படியும், பள்ளி விடுமுறைகள் மாவட்ட ஆட்சியர் உத்தரவின்படியும் மட்டுமே வெளியிடப்படுகின்றன."
    },
    {
      badge: "WHISTLEBLOWER SHIELD",
      badge_color: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
      title_en: "Privacy & Anonymity First",
      title_ta: "தனியுரிமை & அநாமதேயப் பாதுகாப்பு",
      desc_en: "We believe citizens should never fear reprisal for reporting public bribery or civic negligence. Bribe tracker records strictly never store names, phone numbers, or IP logs.",
      desc_ta: "பொது நலனுக்காக குரல் கொடுக்கும் மக்கள் அஞ்ச வேண்டியதில்லை. லஞ்சப் பதிவுகளில் பெயர், தொலைபேசி எண், ஐபி முகவரி எதுவும் சேமிக்கப்படுவதில்லை."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* ── HERO BANNER: THE VIZHITN IDENTITY ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 border border-slate-800 text-white p-6 sm:p-10 lg:p-12 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold mb-4">
              <Eye className="w-3.5 h-3.5 text-red-400" />
              {T("VIZHITN • TAMIL NADU CIVIC PROOF & INTELLIGENCE NETWORK", "VIZHITN • தமிழ்நாடு குடிமை ஆதாரம் & தகவல் தளம்")}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              {T("The Eyes of Tamil Nadu: Turning Grievances into Proof", "தமிழ்நாட்டின் விழி: புகார்களை ஆதாரங்களாக மாற்றும் இயக்கம்")}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
              {T(
                "In Tamil Nadu, broken roads, contaminated water, unscheduled power cuts, and bribery demands often get ignored in official delays. VizhiTN (விழிTN) was born to give 7.2 crore citizens persistent public proof, real-time utility transparency, and verified accountability across all 38 districts.",
                "சாலையில் உள்ள ஆபத்தான பள்ளங்கள், குடிநீர் குழாய் உடைப்பு, மின்தடை நேரம் மற்றும் லஞ்சக் கோரிக்கைகள் அதிகாரப்பூர்வ தாமதங்களில் அமுங்கிவிடக்கூடாது. 7.2 கோடி மக்களுக்கும் நிரந்தர குடிமை ஆதாரங்களை வழங்க உருவானதே VizhiTN (விழிTN)."
              )}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 transition-transform active:scale-95"
              >
                {T("Explore Live Ground Feed", "கள நிலவரங்களை பார்க்க")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-xl transition-colors"
              >
                <Camera className="w-4 h-4" />
                {T("Report an Issue in Your Street", "புகார் பதிவு செய்க")}
              </Link>
            </div>
          </div>
        </div>

        {/* ── LIVE PLATFORM METRICS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {STATS.map((s, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                  {s.num}
                </span>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 mb-0.5">
                  {T(s.label_en, s.label_ta)}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {T(s.desc_en, s.desc_ta)}
              </p>
            </div>
          ))}
        </div>

        {/* ── THE STORY BEHIND THE NAME "VIZHI" (விழி) ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              {T("OUR PHILOSOPHY & ETHOS", "எங்கள் கோட்பாடும் பின்னணியும்")}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {T("Why We Are Called 'Vizhi' (விழி)", "எங்களுக்கு 'விழி' என்று ஏன் பெயர் வந்தது?")}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {T(
                "In classical and contemporary Tamil, 'Vizhi' (விழி) means both 'Eye' and 'Vigilance' (விழித்திருத்தல் / விழிப்புணர்வு). A democracy functions only when citizens keep their eyes wide open to public spending, road conditions, hospital hygiene, and civic rights.",
                "செம்மொழி மற்றும் எளிய தமிழில் 'விழி' என்றால் 'கண்' மற்றும் 'விழிப்புணர்வு' (விழித்திருத்தல்) என்று பொருள். மக்கள் தங்கள் கண்கள் மூலம் பொது நிதி பயன்பாடு, சாலை தரம், மருத்துவமனை சுகாதாரம் மற்றும் உரிமைகளை விழிப்புடன் கவனிக்கும் போதே உண்மையான மக்களாட்சி மலரும்."
              )}
            </p>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {T(
                "VizhiTN is the collective vision of 38 districts. Instead of helpless frustration on bad roads, we give citizens a camera, an exact GPS coordinate, and a tamper-evident Civic Receipt that forces departmental accountability.",
                "VizhiTN என்பது 38 மாவட்ட மக்களின் கூட்டுப் பார்வை. மோசமான சாலைகளுக்காக வெறுமனே புலம்பாமல், ஒரு கேமரா, துல்லியமான ஜிபிஎஸ் இருப்பிடம் மற்றும் அதிகாரிகளை நடவடிக்கை எடுக்க வைக்கும் 'குடிமை ரசீது' மூலம் தீர்வை நோக்கி நகர்கிறோம்."
              )}
            </p>
          </div>
        </div>

        {/* ── THE FOUR ARCHITECTURAL PILLARS OF VIZHITN ── */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              {T("CORE CAPABILITIES", "முக்கிய செயல்பாடுகள்")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {T("The 4 Pillars Powering the Platform", "VizhiTN தளத்தை இயக்கும் 4 முக்கிய தூண்கள்")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {T("Comprehensive civic intelligence built for real-world impact across Tamil Nadu.", "தமிழ்நாட்டின் கள எதார்த்தத்திற்கு ஏற்ப வடிவமைக்கப்பட்ட தொழில்நுட்ப அமைப்புகள்.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FOUR_PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white dark:bg-slate-900 border-2 ${p.border} rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-2xl ${p.color} flex items-center justify-center font-bold shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        PILLAR 0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                      {T(p.title_en, p.title_ta)}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                      {T(p.desc_en, p.desc_ta)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={p.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {T(p.link_text_en, p.link_text_ta)}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── OUR CORE TRUST STANDARDS ── */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 space-y-8 border border-slate-800 shadow-xl">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-red-400">
              {T("OUR COMMITMENT TO TRUTH", "உண்மைக்கான எங்கள் அர்ப்பணிப்பு")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {T("Guiding Principles & Trust Standards", "எங்கள் கொள்கைகள் & நம்பிக்கை தரநிலைகள்")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {T(
                "We hold ourselves to strict journalistic and evidence-based standards. VizhiTN is not an angry rant forum; it is a serious civic proof ledger.",
                "VizhiTN என்பது வெறும் வாதப் பிரதிவாதங்களுக்கான களம் அல்ல; இது அரசு அதிகாரிகளை உரிய நடவடிக்கை எடுக்க வைக்கும் ஆதாரக் களம்."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CORE_VALUES.map((val, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-3 ${val.badge_color}`}>
                    {val.badge}
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">
                    {T(val.title_en, val.title_ta)}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {T(val.desc_en, val.desc_ta)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CALL TO ACTION & CONTACT DESK ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {T("Have Ideas, Questions, or Newsroom Tips?", "ஆலோசனைகள் அல்லது செய்திக் குறிப்புகள் உள்ளதா?")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              {T(
                "Connect directly with our civic editorial and moderation desk in Chennai. We welcome journalists, municipal engineers, and resident volunteers.",
                "எங்கள் சென்னை செய்தி மையத்தை நேரடியாக தொடர்பு கொள்ளலாம். பத்திரிகையாளர்கள், பொறியாளர்கள் மற்றும் தன்னார்வலர்களை வரவேற்கிறோம்."
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/contact"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              {T("Contact Us →", "தொடர்பு கொள்க →")}
            </Link>
            <a
              href={`mailto:${contactEmail}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {contactEmail}
            </a>
          </div>
        </div>

        {/* Universal Cross-Links */}
        <UniversalCrossLinks pageType="support" />
      </div>
    </div>
  );
}
