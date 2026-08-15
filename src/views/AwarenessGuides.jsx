"use client";

import React, { useState } from "react";
import { Zap, Droplets, CreditCard, AlertTriangle, Ambulance, FileText, ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { injectFAQStructuredData } from "@/lib/seo";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

const ALL_GUIDES = [
  {
    id: "power-cut",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    title_en: "Power Cut in your area",
    title_ta: "உங்கள் பகுதியில் மின் தடை",
    steps_en: [
      "Check if it's just your home — verify the main switch/MCB hasn't tripped.",
      "Check TANGEDCO's outage map at tnebltd.org to see if there's a planned shutdown.",
      "Call TANGEDCO complaint number: 94987 94987 (metro areas) or 1912 (rural).",
      "WhatsApp complaint: 98403 98403 with your Service Connection (SC) number.",
      "Raise it on VizhiTN so your neighbours can upvote and escalate together.",
    ],
    steps_ta: [
      "முதலில் உங்கள் வீட்டு மின் சர்க்யூட் பிரேக்கர் (MCB) சரிபார்க்கவும்.",
      "திட்டமிட்ட நிறுத்தம் உள்ளதா என tnebltd.org இல் சரிபார்க்கவும்.",
      "TANGEDCO புகார் எண்: 94987 94987 (நகரம்) அல்லது 1912 (கிராமம்) அழைக்கவும்.",
      "WhatsApp: 98403 98403 உங்கள் SC எண்ணுடன் புகார் அனுப்பவும்.",
      "VizhiTN இல் பதிவிட்டு அண்டை வீட்டினரையும் இணைக்கவும்.",
    ],
    contacts: [{ label: "TANGEDCO Helpline", number: "1912" }, { label: "Metro Complaint", number: "94987 94987" }],
    portal: "https://www.tnebltd.org",
    portal_label_en: "TNEB Portal",
    portal_label_ta: "TNEB இணையதளம்",
  },
  {
    id: "water-supply",
    icon: Droplets,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    title_en: "Water Supply not available",
    title_ta: "குடிநீர் வழங்கல் இல்லை",
    steps_en: [
      "Check with neighbours to see if the whole street is affected.",
      "For Metro Water (Chennai): call 1913 or 044-45674567 to report pipeline issues.",
      "For TWAD / District Corporation: contact local Ward Councillor or Assistant Engineer (AE).",
      "Book paid water tanker via chennaimetrowater.tn.gov.in if main supply is delayed.",
      "Post photos on VizhiTN to document community impact and press for official action.",
    ],
    steps_ta: [
      "தெரு முழுவதும் பாதிக்கப்பட்டுள்ளதா என அண்டை வீட்டாருடன் சரிபார்க்கவும்.",
      "சென்னை மெட்ரோ வாட்டர்: 1913 அல்லது 044-45674567 அழைக்கவும்.",
      "மாவட்ட மாநகராட்சி / TWAD: உள்ளூர் வார்டு பொறியாளரைத் தொடர்பு கொள்ளவும்.",
      "தேவையெனில் chennaimetrowater.tn.gov.in மூலம் லாரி தண்ணீர் பதிவு செய்யுங்கள்.",
      "VizhiTN இல் புகைப்படங்களுடன் பதிவிட்டு அதிகாரிகளுக்கு தெரிவிக்கவும்.",
    ],
    contacts: [{ label: "Metro Water Helpline", number: "1913" }],
    portal: "https://chennaimetrowater.tn.gov.in",
    portal_label_en: "Metro Water Booking",
    portal_label_ta: "மெட்ரோ வாட்டர் பதிவு",
  },
  {
    id: "ration-card",
    icon: CreditCard,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    title_en: "Ration Shop (PDS) Issues",
    title_ta: "ரேஷன் கடை (PDS) பிரச்சினைகள்",
    steps_en: [
      "For missing monthly commodities: check your TNPDS mobile app for shop stock status.",
      "To report shop closed during working hours or biometric failure: call 1967 or 1800 425 5901.",
      "File online complaint at tnpds.gov.in with shop number and Smart Card details.",
      "Contact Taluk Supply Officer (TSO) or District Supply Officer (DSO) at Collectorate.",
      "Report overcharging or illegal sale of PDS items on VizhiTN.",
    ],
    steps_ta: [
      "பொருட்கள் இருப்பு விவரங்களை TNPDS செயலியில் பார்க்கவும்.",
      "கடை மூடப்பட்டிருந்தால் அல்லது கைரேகை சிக்கல் எனில்: 1967 அல்லது 1800 425 5901 அழைக்கவும்.",
      "tnpds.gov.in இல் உங்கள் ஸ்மார்ட் கார்டு விவரங்களுடன் புகார் பதிவு செய்யுங்கள்.",
      "வட்ட வழங்கல் அலுவலர் (TSO) அல்லது மாவட்ட வழங்கல் அலுவலரை தொடர்பு கொள்ளவும்.",
      "கூடுதல் விலை அல்லது சட்டவிரோத விற்பனை பற்றி VizhiTN இல் பதிவிடவும்.",
    ],
    contacts: [{ label: "PDS Toll Free", number: "1967" }, { label: "Consumer Helpline", number: "1800 425 5901" }],
    portal: "https://www.tnpds.gov.in",
    portal_label_en: "TNPDS Portal",
    portal_label_ta: "TNPDS இணையதளம்",
  },
  {
    id: "bribery",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    title_en: "Demand for Bribery at Govt Office",
    title_ta: "அரசு அலுவலகத்தில் லஞ்சக் கோரிக்கை",
    steps_en: [
      "Never pay bribe — it is illegal to both offer and accept bribes under Prevention of Corruption Act.",
      "Record details: date, officer name/designation, office department, amount demanded.",
      "Contact Directorate of Vigilance and Anti-Corruption (DVAC) TN: 044-24615929 / 24615949 / 24615989.",
      "DVAC WhatsApp Helpline: 94981 05884 — message secretly with proof details.",
      "File anonymous Bribe Report on VizhiTN Bribe Watch dashboard to protect your identity.",
    ],
    steps_ta: [
      "லஞ்சம் கொடுக்காதீர்கள் — லஞ்சம் வாங்குவதும் கொடுப்பதும் சட்டப்படி குற்றம்.",
      "அதிகாரி பெயர், பதவி, அலுவலகம், கோரப்பட்ட தொகை போன்ற விவரங்களை குறிக்கவும்.",
      "DVAC (லஞ்ச ஒழிப்புத் துறை) தொடர்பு கொள்ளவும்: 044-24615929 / 24615949.",
      "DVAC WhatsApp: 94981 05884 — ஆதாரம் இருந்தால் ரகசியமாக அனுப்பவும்.",
      "VizhiTN Bribe Watch இல் பெயர் குறிப்பிடாமல் ரகசியமாக புகார் அளிக்கவும்.",
    ],
    contacts: [{ label: "DVAC TN", number: "044-24615929" }, { label: "DVAC WhatsApp", number: "94981 05884" }],
    portal: "https://www.dvac.tn.gov.in",
    portal_label_en: "DVAC Portal",
    portal_label_ta: "DVAC இணையதளம்",
  },
  {
    id: "medical-emergency",
    icon: Ambulance,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    title_en: "Medical Emergency & Govt Hospitals",
    title_ta: "மருத்துவ அவசரநிலை & அரசு மருத்துவமனைகள்",
    steps_en: [
      "Call 108 immediately for free Government Ambulance service.",
      "For road accident victims: Chief Minister's Innuyir Kappon 48 scheme covers first 48 hours up to ₹1 Lakh in 600+ empaneled hospitals — no cash needed.",
      "For Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS): call 1800 425 3993.",
      "For hospital refusal or poor treatment at Govt Primary Health Centre (PHC): call 104 health helpline.",
      "Share urgent blood/help requests on VizhiTN Help section for local volunteer response.",
    ],
    steps_ta: [
      "இலவச அரசு ஆம்புலன்ஸுக்கு உடனடியாக 108 அழைக்கவும்.",
      "சாலை விபத்து: இன்னுயிர் காப்போம் 48 திட்டம் மூலம் முதல் 48 மணிநேர சிகிச்சை ₹1 லட்சம் வரை இலவசம்.",
      "முதல்வரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்: 1800 425 3993 அழைக்கவும்.",
      "மருத்துவமனை மறுப்பு அல்லது சிகிச்சை குறைபாடு எனில் 104 நல்வாழ்வு மையத்தை தொடர்பு கொள்ளவும்.",
      "அவசர ரத்த உதவிக்கு VizhiTN Help பகுதியில் பதிவிடுங்கள்.",
    ],
    contacts: [{ label: "Ambulance", number: "108" }, { label: "Health Helpline", number: "104" }, { label: "CMCHIS Insurance", number: "1800 425 3993" }],
    portal: "https://www.cmchistn.com",
    portal_label_en: "CMCHIS Insurance Portal",
    portal_label_ta: "CMCHIS காப்பீட்டு இணையதளம்",
  },
  {
    id: "govt-scheme",
    icon: FileText,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    title_en: "Apply for a Govt Scheme",
    title_ta: "அரசு திட்டத்திற்கு விண்ணப்பிக்க",
    steps_en: [
      "Visit myscheme.gov.in — enter your details to see all schemes you qualify for.",
      "Most TN schemes are applied at tnesevai.tn.gov.in or nearest e-Sevai / CSC centre.",
      "Keep ready: Aadhaar, ration card, income certificate, bank passbook, community certificate.",
      "For Kalaignar Magalir Urimai Thogai: register at kmut.tn.gov.in or nearest ration shop.",
      "Track application status online with your acknowledgement number.",
    ],
    steps_ta: [
      "myscheme.gov.in செல்லுங்கள் — உங்கள் விவரங்கள் உள்ளிட்டு தகுதியான திட்டங்களை காணுங்கள்.",
      "பெரும்பாலான TN திட்டங்கள் tnesevai.tn.gov.in அல்லது e-Sevai / CSC மையத்தில் விண்ணப்பிக்கலாம்.",
      "ஆதார், குடும்ப அட்டை, வருமான சான்று, வங்கி பாஸ்புக், சமூக சான்று தயார் வைத்திருங்கள்.",
      "கலைஞர் மகளிர் உரிமை தொகை: kmut.tn.gov.in அல்லது ரேஷன் கடையில் பதிவு செய்யுங்கள்.",
      "உங்கள் ஒப்புகை எண் மூலம் விண்ணப்ப நிலையை கண்காணிக்கவும்.",
    ],
    contacts: [{ label: "myScheme", number: "— Online only" }],
    portal: "https://www.myscheme.gov.in",
    portal_label_en: "myScheme Portal",
    portal_label_ta: "myScheme இணையதளம்",
  },
];

export default function AwarenessGuidesPage() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [openId, setOpenId] = useState(null);

  usePageMeta({
    title: "Tamil Nadu Citizen Rights & Helpline Guides | VizhiTN",
    description: "Step-by-step guides for Tamil Nadu citizens: TANGEDCO power cut, water supply, ration card, bribery reporting, medical emergency, and CM Cell complaints.",
  });

  React.useEffect(() => {
    const guideFaqs = ALL_GUIDES.map((g) => ({
      question: g.title_en,
      answer: g.steps_en.join(" "),
    }));
    injectFAQStructuredData(guideFaqs, "awareness-guides");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <AwarenessSubNav activePath="/awareness/guides" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/awareness" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> {T("Back to Awareness", "விழிப்புணர்வுக்கு திரும்பு")}
      </Link>

      <div className="mb-7">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {T("What To Do If... — Citizen Guides", "என்ன செய்ய வேண்டும்... — குடிமக்கள் வழிகாட்டிகள்")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {T("Step-by-step action guides for common civic problems in Tamil Nadu.", "தமிழ்நாட்டில் பொதுவான குடிமக்கள் பிரச்சினைகளுக்கான படிப்படியான வழிகாட்டுதல்.")}
        </p>
      </div>

      <div className="space-y-4">
        {ALL_GUIDES.map((guide) => {
          const Icon = guide.icon;
          const isOpen = openId === guide.id;
          const steps = T(guide.steps_en, guide.steps_ta);
          return (
            <div key={guide.id} id={guide.id} className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => setOpenId(isOpen ? null : guide.id)}
                className="w-full flex items-center justify-between p-5 text-left gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${guide.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                    {T(guide.title_en, guide.title_ta)}
                  </h2>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <ol className="space-y-2.5 mb-5">
                    {steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {guide.contacts && (
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {guide.contacts.map((c, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg text-xs">
                          <span className="text-slate-500 dark:text-slate-400">{c.label}: </span>
                          <span className="font-bold text-slate-800 dark:text-white">{c.number}</span>
                        </div>
                      ))}
                      {guide.portal && (
                        <a
                          href={guide.portal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-center ml-auto"
                        >
                          {T(guide.portal_label_en, guide.portal_label_ta)} ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cross-Linking Modules for SEO & User Discovery */}
      <AwarenessRelatedLinks currentSection="guides" />
    </div>
  </div>
);
}
