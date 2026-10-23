import React from "react";
import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import {
  FileText, Zap, TrendingUp, HelpCircle, Heart,
  AlertTriangle, MapPin, Map, Shield, ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const GROUPS = [
  {
    en_title: "Civic Proof & Real-Time Utilities",
    ta_title: "குடிமை ஆதாரம் & நேரடிச் சேவைகள்",
    cards: [
      {
        path: "/create",
        icon: FileText,
        en: "Create Civic Receipt",
        ta: "குடிமை ரசீது உருவாக்கு",
        desc_en: "Report a local issue with photo, location, complaint ID, status timeline, and public proof.",
        desc_ta: "புகைப்படம், இடம், புகார் ID மற்றும் நிலை காலவரிசையுடன் உள்ளூர் சிக்கலை புகாரளிக்கவும்.",
        cta_en: "Create Receipt",
        cta_ta: "ரசீது உருவாக்கு",
        primary: true,
        bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
        iconBg: "bg-white/20",
        iconColor: "text-white",
        textColor: "text-white",
        descColor: "text-blue-100",
        ctaClass: "bg-white text-blue-700 hover:bg-blue-50",
      },
      {
        path: "/power-cuts-today-tamil-nadu",
        icon: Zap,
        en: "Power Cuts Today",
        ta: "இன்றைய மின்தடை",
        desc_en: "Live scheduled substation shutdown timings across all 38 districts.",
        desc_ta: "தமிழ்நாட்டின் 38 மாவட்டங்களுக்கான மின்வாரிய பராமரிப்பு மின்தடை நேரங்கள்.",
        cta_en: "Check Shutdowns",
        cta_ta: "மின்தடை அறி",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        iconBg: "bg-amber-100 dark:bg-amber-800",
        iconColor: "text-amber-600 dark:text-amber-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-amber-500 text-white hover:bg-amber-600",
      },
      {
        path: "/school-college-holiday-alerts",
        icon: AlertTriangle,
        en: "Holiday Alerts",
        ta: "பள்ளி விடுமுறை",
        desc_en: "Heavy rain warnings, IMD alerts, and official District Collector school holiday notices.",
        desc_ta: "கனமழை எச்சரிக்கை மற்றும் மாவட்ட ஆட்சியர் அறிவிக்கும் பள்ளி விடுமுறைகள்.",
        cta_en: "View Alerts",
        cta_ta: "எச்சரிக்கை பார்",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        iconBg: "bg-emerald-100 dark:bg-emerald-800",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-emerald-600 text-white hover:bg-emerald-700",
      },
      {
        path: "/trending",
        icon: TrendingUp,
        en: "Trending Issues",
        ta: "டிரெண்டிங் தலைப்புகள்",
        desc_en: "See the most discussed civic issues, citizen alerts, and resolved community cases.",
        desc_ta: "தமிழ்நாடு முழுவதும் அதிகம் விவாதிக்கப்படும் முக்கிய குடிமைப் பிரச்சனைகள்.",
        cta_en: "View Trending",
        cta_ta: "டிரெண்டிங் பார்",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        iconBg: "bg-purple-100 dark:bg-purple-800",
        iconColor: "text-purple-600 dark:text-purple-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-purple-600 text-white hover:bg-purple-700",
      },
    ],
  },
  {
    en_title: "Citizen Welfare, Rights & Scams",
    ta_title: "மக்கள் நலம், உரிமைகள் & பாதுகாப்பு",
    cards: [
      {
        path: "/scams",
        icon: AlertTriangle,
        en: "Scam Radar",
        ta: "மோசடி எச்சரிக்கை",
        desc_en: "Stay protected from fake EB bill SMS, online task fraud, and report via 1930.",
        desc_ta: "போலி மின் கட்டண SMS, பகுதி நேர வேலை மோசடிகளில் இருந்து பாதுகாப்பாக இருங்கள்.",
        cta_en: "View Scam Radar",
        cta_ta: "மோசடி ரேடார்",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        iconBg: "bg-orange-100 dark:bg-orange-800",
        iconColor: "text-orange-600 dark:text-orange-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-orange-500 text-white hover:bg-orange-600",
      },
      {
        path: "/schemes",
        icon: Shield,
        en: "Welfare Schemes",
        ta: "அரசு நலத் திட்டங்கள்",
        desc_en: "Complete guide to Kalaignar Magalir Urimai, student aid, pensions, and online application.",
        desc_ta: "மகளிர் உரிமைத் தொகை, மாணவர் உதவித்தொகை உள்ளிட்ட முக்கிய அரசு திட்டங்கள்.",
        cta_en: "Explore Schemes",
        cta_ta: "திட்டங்கள் அறி",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        iconBg: "bg-indigo-100 dark:bg-indigo-800",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-indigo-600 text-white hover:bg-indigo-700",
      },
      {
        path: "/esevai",
        icon: HelpCircle,
        en: "e-Sevai Guide",
        ta: "இ-சேவை வழிகாட்டி",
        desc_en: "Step-by-step guides for Patta transfer, community certificates, and revenue portals.",
        desc_ta: "பட்டா மாறுதல், சாதிச் சான்றிதழ் உள்ளிட்ட இ-சேவை வழிகாட்டல்கள்.",
        cta_en: "Open Guide",
        cta_ta: "வழிகாட்டி பார்",
        bg: "bg-teal-50 dark:bg-teal-900/20",
        iconBg: "bg-teal-100 dark:bg-teal-800",
        iconColor: "text-teal-600 dark:text-teal-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-teal-600 text-white hover:bg-teal-700",
      },
      {
        path: "/helplines",
        icon: HelpCircle,
        en: "Helplines Desk",
        ta: "அவசர உதவி எண்கள்",
        desc_en: "Verified 24x7 control rooms: 112 Unified, 1912 EB, 1913 GCC, 1930 Cyber Fraud.",
        desc_ta: "112 அவசரம், 1912 மின்னகம், 1913 மாநகராட்சி, 1930 சைபர் கிரைம் உதவி எண்கள்.",
        cta_en: "View Helplines",
        cta_ta: "எண்கள் பார்",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        iconBg: "bg-rose-100 dark:bg-rose-800",
        iconColor: "text-rose-600 dark:text-rose-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-rose-600 text-white hover:bg-rose-700",
      },
    ],
  },
  {
    en_title: "Places & Districts",
    ta_title: "பகுதிகள் & மாவட்டங்கள்",
    cards: [
      {
        path: "/districts",
        icon: Map,
        en: "38 Districts",
        ta: "38 மாவட்டங்கள்",
        desc_en: "Explore localized civic updates across all 38 revenue districts of Tamil Nadu.",
        desc_ta: "தமிழ்நாடு அனைத்து 38 மாவட்டங்களிலும் உள்ள உள்ளூர் குடிமைத் தகவல்கள்.",
        cta_en: "View Districts",
        cta_ta: "மாவட்டங்கள் பார்",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        iconBg: "bg-emerald-100 dark:bg-emerald-800",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-emerald-600 text-white hover:bg-emerald-700",
      },
      {
        path: "/areas",
        icon: MapPin,
        en: "Hyperlocal Areas",
        ta: "வட்டாரப் பகுதிகள்",
        desc_en: "Browse neighborhood updates, civic grievances, and community posts by locality.",
        desc_ta: "பகுதி வாரியாக சாலை, குடிநீர், மின்சார சிக்கல்கள் மற்றும் சமுதாய பதிவுகள்.",
        cta_en: "Browse Areas",
        cta_ta: "பகுதிகள் பார்",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        iconBg: "bg-blue-100 dark:bg-blue-800",
        iconColor: "text-blue-600 dark:text-blue-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-blue-600 text-white hover:bg-blue-700",
      },
      {
        path: "/help",
        icon: HelpCircle,
        en: "Community SOS",
        ta: "அவசர உதவி",
        desc_en: "Broadcast urgent requests for blood units, emergency assistance, and ambulance aid.",
        desc_ta: "அவசர ரத்த தான உதவி, ஆம்புலன்ஸ் வழிகாட்டல் மற்றும் சமுதாய ஆதரவு.",
        cta_en: "Open SOS Desk",
        cta_ta: "உதவி மையம்",
        bg: "bg-red-50 dark:bg-red-900/20",
        iconBg: "bg-red-100 dark:bg-red-800",
        iconColor: "text-red-600 dark:text-red-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-red-600 text-white hover:bg-red-700",
      },
      {
        path: "/how-to-use",
        icon: Heart,
        en: "How to Use",
        ta: "பயன்படுத்துவது எப்படி",
        desc_en: "Learn how to use VizhiTN to document issues, file official complaints, and track fixes.",
        desc_ta: "VizhiTN பயன்படுத்தி ஆதாரங்களை ஆவணப்படுத்துவது மற்றும் குறைதீர்ப்பது எப்படி.",
        cta_en: "Read Guide",
        cta_ta: "வழிகாட்டி வாசி",
        bg: "bg-slate-50 dark:bg-slate-800",
        iconBg: "bg-slate-100 dark:bg-slate-700",
        iconColor: "text-slate-600 dark:text-slate-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-600",
      },
    ],
  },
];

export default function FeatureHub() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          {T("Explore VizhiTN Features", "VizhiTN அம்சங்களை ஆராய்க")}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          {T(
            "From Civic Receipts to power cut schedules, holiday alerts, scam warnings, schemes, and verified helplines — everything is organized for Tamil Nadu communities.",
            "குடிமை ரசீதுகள் முதல் மின்தடை அட்டவணை, பள்ளி விடுமுறை அறிவிப்புகள், மோசடி தடுப்பு மற்றும் அரசு உதவி எண்கள் வரை — தமிழ்நாடு சமுதாயங்களுக்காக அனைத்தும் ஒழுங்கமைக்கப்பட்டுள்ளது."
          )}
        </p>
      </div>

      <div className="space-y-12">
        {GROUPS.map((group, gi) => (
          <div key={gi}>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
              {T(group.en_title, group.ta_title)}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {group.cards.map((card, ci) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={ci}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: ci * 0.05 }}
                    className={`rounded-2xl p-4 flex flex-col gap-3 border border-transparent hover:shadow-md active:scale-[0.98] transition-all cursor-pointer ${card.bg} ${card.primary ? "sm:col-span-2 lg:col-span-1" : ""}`}
                  >
                    <Link to={card.path} className="flex flex-col gap-3 h-full">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                        <Icon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm mb-1 ${card.textColor}`}>
                          {T(card.en, card.ta)}
                        </p>
                        <p className={`text-xs leading-relaxed ${card.descColor}`}>
                          {T(card.desc_en, card.desc_ta)}
                        </p>
                      </div>
                      <button className={`w-full text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1 ${card.ctaClass}`}>
                        {T(card.cta_en, card.cta_ta)}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}