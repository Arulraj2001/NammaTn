"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone, Shield, AlertTriangle, Users, Heart, BookOpen, Zap, Droplets,
  ExternalLink, ArrowLeft, Search, Copy, Check, MapPin, Building2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import { DISTRICTS } from "@/lib/seo-data";

const EMERGENCY_CATEGORIES = [
  {
    category_en: "Critical & Universal Emergency (24x7)",
    category_ta: "அனைத்து அவசர நிலைகள் & பேரிடர் (24x7)",
    icon: Phone,
    color: "bg-red-600",
    entries: [
      { name_en: "National Emergency Unified Helpline (Police, Fire, Medical)", name_ta: "தேசிய ஒருங்கிணைந்த அவசர உதவி (காவல், தீ, மருத்துவ)", number: "112", desc_en: "Single number for all emergencies with instant GPS dispatch", desc_ta: "அனைத்து அவசர நிலைகளுக்கும் ஒரே எண் — ஜிபிஎஸ் விரைவு சேவை" },
      { name_en: "State Disaster Management (TNDMA Flood & Cyclone)", name_ta: "மாநில பேரிடர் மேலாண்மை ஆணையம் (வெள்ளம் & புயல்)", number: "1070", desc_en: "Tamil Nadu Disaster Control Room at Secretariat", desc_ta: "தலைமைச் செயலக பேரிடர் கட்டுப்பாட்டு அறை" },
      { name_en: "Free Emergency Ambulance (GVK EMRI)", name_ta: "இலவச அவசர ஆம்புலன்ஸ் (108 சேவை)", number: "108", desc_en: "Medical emergencies, accidents, maternal labor transport", desc_ta: "மருத்துவ அவசரம், விபத்துக்கள், பிரசவ உதவி — கட்டணமில்லை" },
      { name_en: "Fire & Rescue Services", name_ta: "தீயணைப்பு & மீட்புப் பணிகள்", number: "101", desc_en: "Fire accidents, building collapse, water rescue", desc_ta: "தீ விபத்து, கட்டட விபத்துக்கள், மீட்புப் பணிகள்" },
    ],
  },
  {
    category_en: "Police, Cyber & Citizen Protection",
    category_ta: "காவல்துறை, சைபர் கிரைம் & சட்டப் பாதுகாப்பு",
    icon: Shield,
    color: "bg-blue-600",
    entries: [
      { name_en: "Tamil Nadu Police Control Room", name_ta: "தமிழ்நாடு காவல் கட்டுப்பாட்டு அறை", number: "100", desc_en: "Crime, theft, harassment, physical danger", desc_ta: "குற்றம், திருட்டு, ஆபத்து மற்றும் அவசர உதவி" },
      { name_en: "National Cyber Crime Helpline (Golden Hour Portal)", name_ta: "சைபர் கிரைம் உதவி எண் (ஆன்லைன் நிதி மோசடி)", number: "1930", desc_en: "Immediate freeze of stolen funds in OTP, UPI, credit card scams", desc_ta: "UPI, OTP, வங்கி நிதி மோசடி நடந்தால் உடனடி மீட்பு" },
      { name_en: "Traffic Police Control & Road Accidents", name_ta: "போக்குவரத்து காவல் கட்டுப்பாட்டு அறை", number: "103", desc_en: "Traffic gridlocks, hit-and-run, road hazards", desc_ta: "போக்குவரத்து நெரிசல், விபத்துக்கள் தகவல்" },
      { name_en: "Directorate of Vigilance & Anti-Corruption (DVAC)", name_ta: "ஊழல் தடுப்பு மற்றும் கண்காணிப்புப் பிரிவு (DVAC)", number: "1064", desc_en: "Bribery demands, corruption at government offices", desc_ta: "அரசு அலுவலகங்களில் லஞ்சம் மற்றும் ஊழல் புகார்கள்" },
    ],
  },
  {
    category_en: "Public Utilities & Municipal Grievance",
    category_ta: "மின்சாரம், குடிநீர் & நகராட்சி கட்டுப்பாட்டு அறைகள்",
    icon: Zap,
    color: "bg-amber-600",
    entries: [
      { name_en: "TANGEDCO Minnalagam (24x7 Power Cuts & Wire Snaps)", name_ta: "மின்னகம் — மின்வாரிய புகார் மையம் (TANGEDCO)", number: "1912", desc_en: "Statewide power failure, transformer repair, snapped live wire", desc_ta: "மின்தடை, மின் கம்பி அறுந்து விழுதல், டிரான்ஸ்பார்மர் பழுது" },
      { name_en: "TANGEDCO South / Chennai Circle WhatsApp & Direct", name_ta: "மின்வாரிய வாட்ஸ்அப் / நேரடி தொடர்பு", number: "94987 94987", desc_en: "Direct Minnalagam WhatsApp grievance registration", desc_ta: "மின்னகம் வாட்ஸ்அப் நேரடி புகார் எண்" },
      { name_en: "Greater Chennai Corporation (GCC Flood & Municipal Control)", name_ta: "சென்னை மாநகராட்சி கட்டுப்பாட்டு அறை (GCC 1913)", number: "1913", desc_en: "Subway waterlogging, tree falls, garbage, stormwater drains", desc_ta: "சுரங்கப்பாதை தேக்கம், மரம் விழுதல், குப்பை அகற்றல்" },
      { name_en: "Metrowater CMWSSB (Chennai Drinking Water & Sewage)", name_ta: "சென்னை மெட்ரோவாட்டர் (குடிநீர் & கழிவுநீர்)", number: "044-45674567", desc_en: "Contaminated water supply, sewer overflow, water tanker booking", desc_ta: "குடிநீர் விநியோகம், கழிவுநீர் நிரம்பி வழிதல், லாரி நீர்" },
      { name_en: "Coimbatore Municipal Corporation Control Room", name_ta: "கோயம்புத்தூர் மாநகராட்சி கட்டுப்பாட்டு அறை", number: "0422-2302323", desc_en: "Municipal civic issues, streetlights, drainage", desc_ta: "மாநகராட்சி புகார்கள், தெருவிளக்கு, கழிவுநீர்" },
      { name_en: "Tamil Nadu Civil Supplies & Smart Ration Cards", name_ta: "உணவுப் பொருள் வழங்கல் & ரேஷன் அட்டை உதவி", number: "1967", desc_en: "PDS rice shortage, fair price shop complaints, smart card e-KYC", desc_ta: "ரேஷன் கடை குறைபாடுகள், குடும்ப அட்டை சிக்கல்கள்" },
      { name_en: "Southern Railway Passenger Enquiry & Security", name_ta: "தெற்கு ரயில்வே பாதுகாப்பு & குறைதீர்ப்பு", number: "139", desc_en: "Train delays, medical emergency in coach, security support", desc_ta: "ரயில் தாமதம், பெட்டிக்குள் மருத்துவ உதவி, பாதுகாப்பு" },
    ],
  },
  {
    category_en: "Women, Children & Healthcare Support",
    category_ta: "பெண்கள், குழந்தைகள் & நல்வாழ்வு உதவி எண்கள்",
    icon: Heart,
    color: "bg-pink-600",
    entries: [
      { name_en: "Tamil Nadu Women in Distress Helpline", name_ta: "பெண்கள் உதவி மையம் (24x7)", number: "181", desc_en: "Domestic violence, eve-teasing, legal aid, emergency shelter", desc_ta: "குடும்ப வன்முறை, பாலியல் தொல்லை, சட்ட உதவி & தங்குமிடம்" },
      { name_en: "Childline India (Ministry of Women & Child)", name_ta: "குழந்தைகள் உதவி மையம் (சைல்டுலைன்)", number: "1098", desc_en: "Child abuse, missing child, child labour, forced marriage", desc_ta: "குழந்தைத் தொழிலாளர், பாலியல் துன்புறுத்தல், குழந்தை திருமணம்" },
      { name_en: "Tele-MANAS Mental Health Counseling", name_ta: "டெலி-மானஸ் மனநல ஆலோசனை மையம்", number: "14416", desc_en: "24x7 Free psychological support and suicide prevention counseling", desc_ta: "இலவச மனநல ஆலோசனை மற்றும் தற்கொலை தடுப்பு உதவி" },
      { name_en: "Senior Citizens National Helpline (Elderline)", name_ta: "மூத்த குடிமக்கள் தேசிய உதவி எண் (எல்டர்லைன்)", number: "14567", desc_en: "Elder abuse, rescue of abandoned parents, pension legal support", desc_ta: "முதியோர் பராமரிப்பு, கைவிடப்பட்ட பெற்றோர் மீட்பு" },
      { name_en: "Chief Minister Comprehensive Health Insurance (CMCHIS)", name_ta: "முதலமைச்சர் மருத்துவக் காப்பீடு உதவி மையம்", number: "1800-425-3993", desc_en: "Empaneled hospital verification, pre-authorization, cashless claim issues", desc_ta: "காப்பீட்டு அட்டை விபரம், மருத்துவமனை அனுமதி, புகார்கள்" },
      { name_en: "Tamil Nadu Chief Minister Helpline", name_ta: "முதலமைச்சரின் உதவி மையம் (CM Helpline)", number: "1100", desc_en: "Direct public grievance escalation to district collectors and HoDs", desc_ta: "அரசுத் துறை தாமதங்கள் மற்றும் முதல்வர் தனிப்பிரிவு மனுக்கள்" },
    ],
  },
];

export default function AwarenessEmergency() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [query, setQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(null);

  usePageMeta({
    title: "Tamil Nadu 24x7 Emergency Helplines & Crisis Contacts | VizhiTN",
    description: "Verified official 24x7 emergency helpline numbers in Tamil Nadu — Police 100, Ambulance 108, Minnalagam 1912, GCC 1913, Cyber Crime 1930, Women 181, CM 1100.",
  });

  const handleCopy = (number) => {
    navigator.clipboard.writeText(number.replace(/\s/g, ""));
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const filteredCategories = EMERGENCY_CATEGORIES.map((cat) => {
    const matchingEntries = cat.entries.filter((e) => {
      const q = query.toLowerCase();
      return (
        e.name_en.toLowerCase().includes(q) ||
        e.name_ta.toLowerCase().includes(q) ||
        e.number.includes(q) ||
        e.desc_en.toLowerCase().includes(q) ||
        e.desc_ta.toLowerCase().includes(q)
      );
    });
    return { ...cat, entries: matchingEntries };
  }).filter((cat) => cat.entries.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <Link
          href="/awareness"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {T("Back to Civic Awareness Hub", "விழிப்புணர்வு முகப்பிற்கு திரும்பு")}
        </Link>

        {/* Hero Banner Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 mb-8 bg-slate-900">
          <Image
            src="/images/evergreen/tn-helplines.jpg"
            alt={T("Tamil Nadu Emergency Helplines", "தமிழ்நாடு அவசர உதவி எண்கள்")}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-5 sm:p-8">
            <div>
              <span className="px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-md inline-block mb-2">
                24x7 TOLL-FREE
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {T("Tamil Nadu Emergency & Government Helplines", "தமிழ்நாடு 24x7 அவசர & அரசு உதவி எண்கள்")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {T(
                  "Verified direct phone numbers for disaster rescue, TANGEDCO power failure, GCC municipal complaints, cyber fraud, medical emergencies, and police support.",
                  "மின்வாரியம், பேரிடர் மீட்பு, சைபர் கிரைம், சென்னை மாநகராட்சி மற்றும் காவல்துறைக்கான சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ எண்கள்."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Unified 112 Flash Card */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <span className="bg-white/20 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {T("National Emergency Response", "தேசிய அவசர கட்டுப்பாட்டு எண்")}
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl font-black tracking-tight">112</span>
              <span className="text-sm font-semibold text-red-100">
                {T("Connects Police, Fire, Ambulance & Marine Rescue", "காவல்துறை, தீயணைப்பு & ஆம்புலன்ஸ் ஒருங்கிணைந்த சேவை")}
              </span>
            </div>
            <p className="text-xs text-red-200 mt-1">
              {T("Toll-free 24 hours. Works even without SIM balance or active roaming network.", "கட்டணமில்லா 24 மணி நேர சேவை. சிம் பேலன்ஸ் இன்றியும் இயங்கும்.")}
            </p>
          </div>
          <a
            href="tel:112"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-black text-lg px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Phone className="w-5 h-5 fill-current" />
            {T("Dial 112 Now", "112 அழைக்கவும்")}
          </a>
        </div>

        {/* Search & District Disaster Line Filter */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={T(
                "Search service (e.g. power cut, water, cyber, police, 1912)...",
                "தேடுங்கள் (மின்சாரம், தண்ணீர், சைபர் கிரைம், போலீஸ், 1912)..."
              )}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full py-3 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white font-medium"
            >
              <option value="">{T("📍 District Disaster (1077)", "📍 மாவட்ட பேரிடர் எண் (1077)")}</option>
              {DISTRICTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Local District Disaster Unit Callout if selected */}
        {selectedDistrict && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedDistrict.toUpperCase()} {T("District Disaster Control Room", "மாவட்ட பேரிடர் கட்டுப்பாட்டு மையம்")}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {T("District Collector Camp Office Emergency Helpline", "மாவட்ட ஆட்சியர் பேரிடர் அவசர உதவி எண்")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:1077"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" /> {T("Call 1077 (District Cell)", "1077 அழைக்க")}
              </a>
              <Link
                href={`/${selectedDistrict}`}
                className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {T("View District Hub →", "மாவட்ட பக்கம் →")}
              </Link>
            </div>
          </div>
        )}

        {/* Directory Categorized Listings */}
        <div className="space-y-8">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.category_en}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {T(cat.category_en, cat.category_ta)}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.entries.map((entry) => {
                    const cleanPhone = entry.number.replace(/[^0-9]/g, "");
                    const isCopied = copiedNumber === entry.number;

                    return (
                      <div
                        key={entry.number}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div className="mb-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                              {T(entry.name_en, entry.name_ta)}
                            </h3>
                            <button
                              onClick={() => handleCopy(entry.number)}
                              title={T("Copy Number", "எண்ணை நகலெடு")}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                            >
                              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                            {T(entry.desc_en, entry.desc_ta)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-lg font-black text-slate-900 dark:text-white tracking-wide">
                            {entry.number}
                          </span>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {T("Call Now", "அழைக்க")}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Civic Transparency Notice */}
        <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {T(
              "All helpline contacts are verified against official Government of Tamil Nadu and Central Government disaster protocols. If you notice any defunct line or incorrect routing, report it immediately to the VizhiTN Civic Desk.",
              "அனைத்து எண்களும் தமிழ்நாடு அரசின் அதிகாரப்பூர்வ பேரிடர் வழிகாட்டுதலின்படி சரிபார்க்கப்பட்டவை. மாற்றங்கள் ஏதேனும் இருந்தால் VizhiTN செய்திப் பிரிவிற்குத் தெரிவிக்கலாம்."
            )}
          </p>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="emergency" />
      </div>
    </div>
  );
}

