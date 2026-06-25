import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, Zap, TrendingUp, Trophy,
  Users, MessageCircle, HelpCircle, Heart,
  Briefcase, Home, Building2, AlertTriangle,
  MapPin, Map, Leaf, ShoppingBag, ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const GROUPS = [
  {
    en_title: "Civic Proof & Public Issues",
    ta_title: "குடிமை ஆதாரம் & பொது சிக்கல்கள்",
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
        path: "/situations",
        icon: Zap,
        en: "Live Situations",
        ta: "நேரடி நிலைமைகள்",
        desc_en: "Track active local situations, urgent alerts, emergency updates, and real-time public reports.",
        desc_ta: "செயலில் உள்ள உள்ளூர் நிலைமைகள், அவசர எச்சரிக்கைகள் மற்றும் நேரடி அறிக்கைகளை கண்காணிக்கவும்.",
        cta_en: "View Live",
        cta_ta: "நேரடியில் பார்",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        iconBg: "bg-amber-100 dark:bg-amber-800",
        iconColor: "text-amber-600 dark:text-amber-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-amber-500 text-white hover:bg-amber-600",
      },
      {
        path: "/trending",
        icon: TrendingUp,
        en: "Trending",
        ta: "டிரெண்டிங்",
        desc_en: "See the most discussed civic issues, alerts, complaints, and community updates across Tamil Nadu.",
        desc_ta: "தமிழ்நாடு முழுவதும் அதிகம் விவாதிக்கப்பட்ட சிக்கல்களை பார்க்கவும்.",
        cta_en: "View Trending",
        cta_ta: "டிரெண்டிங் பார்",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        iconBg: "bg-rose-100 dark:bg-rose-800",
        iconColor: "text-rose-600 dark:text-rose-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-rose-500 text-white hover:bg-rose-600",
      },
      {
        path: "/leaderboard",
        icon: Trophy,
        en: "Civic Leaderboard",
        ta: "குடிமை தகுதிப் பட்டி",
        desc_en: "Recognize active citizens, verified issues, community helpers, and areas with strong civic participation.",
        desc_ta: "செயலில் உள்ள குடிமக்கள், சமுதாய உதவியாளர்கள் மற்றும் பகுதிகளை அங்கீகரிக்கவும்.",
        cta_en: "See Leaderboard",
        cta_ta: "தகுதிப் பட்டி பார்",
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        iconBg: "bg-yellow-100 dark:bg-yellow-800",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-yellow-500 text-white hover:bg-yellow-600",
      },
    ],
  },
  {
    en_title: "Community & Local Help",
    ta_title: "சமுதாயம் & உள்ளூர் உதவி",
    cards: [
      {
        path: "/community",
        icon: Users,
        en: "Community",
        ta: "சமுதாயம்",
        desc_en: "Discuss local issues, share updates, appreciate progress, and connect with people from your area.",
        desc_ta: "உள்ளூர் சிக்கல்களை விவாதித்து, புதுப்பிப்புகளை பகிர்ந்து உங்கள் பகுதி மக்களுடன் இணைக்கவும்.",
        cta_en: "Join Community",
        cta_ta: "சமுதாயத்தில் சேர்",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        iconBg: "bg-purple-100 dark:bg-purple-800",
        iconColor: "text-purple-600 dark:text-purple-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-purple-600 text-white hover:bg-purple-700",
      },
      {
        path: "/ask",
        icon: MessageCircle,
        en: "Ask Local",
        ta: "கேளுங்கள்",
        desc_en: "Ask area-based questions and get help from people who know the place better.",
        desc_ta: "பகுதி அடிப்படையிலான கேள்விகளை கேட்டு உள்ளூர் மக்களிடம் உதவி பெறுங்கள்.",
        cta_en: "Ask Now",
        cta_ta: "இப்போது கேளுங்கள்",
        bg: "bg-cyan-50 dark:bg-cyan-900/20",
        iconBg: "bg-cyan-100 dark:bg-cyan-800",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-cyan-600 text-white hover:bg-cyan-700",
      },
      {
        path: "/help",
        icon: HelpCircle,
        en: "Help",
        ta: "உதவி",
        desc_en: "Learn how to use VizhiTN, create Civic Receipts, verify issues, and track complaint progress.",
        desc_ta: "VizhiTN பயன்படுத்துவது, குடிமை ரசீதுகள் உருவாக்குவது எப்படி என்று அறிந்துகொள்ளுங்கள்.",
        cta_en: "Get Help",
        cta_ta: "உதவி பெறுங்கள்",
        bg: "bg-teal-50 dark:bg-teal-900/20",
        iconBg: "bg-teal-100 dark:bg-teal-800",
        iconColor: "text-teal-600 dark:text-teal-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-teal-600 text-white hover:bg-teal-700",
      },
      {
        path: "/support",
        icon: Heart,
        en: "Support",
        ta: "ஆதரவு",
        desc_en: "Contact VizhiTN support for account help, safety concerns, feature issues, or reporting problems.",
        desc_ta: "கணக்கு உதவி, பாதுகாப்பு கவலைகள், அல்லது சிக்கல் புகாரளிக்க VizhiTN ஆதரவை தொடர்பு கொள்ளுங்கள்.",
        cta_en: "Contact Support",
        cta_ta: "ஆதரவை தொடர்பு கொள்",
        bg: "bg-pink-50 dark:bg-pink-900/20",
        iconBg: "bg-pink-100 dark:bg-pink-800",
        iconColor: "text-pink-600 dark:text-pink-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-pink-600 text-white hover:bg-pink-700",
      },
    ],
  },
  {
    en_title: "Local Life & Useful Services",
    ta_title: "உள்ளூர் வாழ்க்கை & சேவைகள்",
    cards: [
      {
        path: "/jobs",
        icon: Briefcase,
        en: "Jobs",
        ta: "வேலை",
        desc_en: "Find local job updates, work opportunities, and trusted employment-related posts from Tamil Nadu areas.",
        desc_ta: "உள்ளூர் வேலை வாய்ப்புகள் மற்றும் தமிழ்நாடு பகுதிகளில் இருந்து வேலைத் தகவல்களை காணுங்கள்.",
        cta_en: "Explore Jobs",
        cta_ta: "வேலை ஆராய்க",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        iconBg: "bg-blue-100 dark:bg-blue-800",
        iconColor: "text-blue-600 dark:text-blue-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-blue-600 text-white hover:bg-blue-700",
      },
      {
        path: "/stay",
        icon: Home,
        en: "Stay & Rooms",
        ta: "தங்குமிடம்",
        desc_en: "Find or share stay, rooms, PG, hostel, and local accommodation-related updates safely.",
        desc_ta: "தங்குமிடம், அறைகள், PG, விடுதி தகவல்களை பாதுகாப்பாக கண்டுபிடிக்கவும் அல்லது பகிரவும்.",
        cta_en: "Find Stay",
        cta_ta: "தங்குமிடம் கண்டுபிடி",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        iconBg: "bg-indigo-100 dark:bg-indigo-800",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-indigo-600 text-white hover:bg-indigo-700",
      },
      {
        path: "/offices",
        icon: Building2,
        en: "Offices",
        ta: "அலுவலகங்கள்",
        desc_en: "Discover important local offices and possible authorities related to civic issues and public services.",
        desc_ta: "குடிமை சிக்கல்கள் மற்றும் பொது சேவைகளுடன் தொடர்புடைய உள்ளூர் அலுவலகங்களை கண்டுபிடிக்கவும்.",
        cta_en: "Find Offices",
        cta_ta: "அலுவலகங்கள் கண்டுபிடி",
        bg: "bg-slate-50 dark:bg-slate-800",
        iconBg: "bg-slate-100 dark:bg-slate-700",
        iconColor: "text-slate-600 dark:text-slate-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-600",
      },
      {
        path: "/scams",
        icon: AlertTriangle,
        en: "Scam Alerts",
        ta: "மோசடி எச்சரிக்கை",
        desc_en: "Stay aware of local scams, fraud alerts, fake jobs, fake rentals, and unsafe public warnings.",
        desc_ta: "உள்ளூர் மோசடி, போலி வேலை, போலி வாடகை மற்றும் பாதுகாப்பற்ற எச்சரிக்கைகளை அறிந்திருங்கள்.",
        cta_en: "View Scam Alerts",
        cta_ta: "மோசடி எச்சரிக்கை பார்",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        iconBg: "bg-orange-100 dark:bg-orange-800",
        iconColor: "text-orange-600 dark:text-orange-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-orange-500 text-white hover:bg-orange-600",
      },
    ],
  },
  {
    en_title: "Area, RWA, CSR & Partners",
    ta_title: "பகுதி, RWA, CSR & பங்காளர்கள்",
    cards: [
      {
        path: "/areas",
        icon: MapPin,
        en: "Areas",
        ta: "பகுதிகள்",
        desc_en: "Browse issues, updates, Civic Receipts, and community activity by area.",
        desc_ta: "பகுதி வாரியாக சிக்கல்கள், புதுப்பிப்புகள் மற்றும் சமுதாய நடவடிக்கைகளை காணுங்கள்.",
        cta_en: "Browse Areas",
        cta_ta: "பகுதிகளை ஆராய்க",
        bg: "bg-green-50 dark:bg-green-900/20",
        iconBg: "bg-green-100 dark:bg-green-800",
        iconColor: "text-green-600 dark:text-green-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-green-600 text-white hover:bg-green-700",
      },
      {
        path: "/districts",
        icon: Map,
        en: "Districts",
        ta: "மாவட்டங்கள்",
        desc_en: "Explore VizhiTN activity across all Tamil Nadu districts.",
        desc_ta: "தமிழ்நாடு அனைத்து மாவட்டங்களிலும் VizhiTN செயல்பாட்டை ஆராய்க.",
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
        path: "/rwa",
        icon: MapPin,
        en: "RWA Dashboard",
        ta: "RWA டாஷ்போர்டு",
        desc_en: "For resident welfare associations and local groups to track area issues, complaint IDs, and monthly reports.",
        desc_ta: "குடியிருப்பு நலன் சங்கங்களுக்கு பகுதி சிக்கல்கள் மற்றும் புகார் IDகளை கண்காணிக்கவும்.",
        cta_en: "For RWAs",
        cta_ta: "RWAக்களுக்கு",
        bg: "bg-violet-50 dark:bg-violet-900/20",
        iconBg: "bg-violet-100 dark:bg-violet-800",
        iconColor: "text-violet-600 dark:text-violet-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-violet-600 text-white hover:bg-violet-700",
      },
      {
        path: "/csr",
        icon: Leaf,
        en: "CSR Dashboard",
        ta: "CSR டாஷ்போர்டு",
        desc_en: "For companies and sponsors to support measurable civic transparency with before/after proof and public impact reports.",
        desc_ta: "நிறுவனங்கள் மற்றும் நிதியாளர்களுக்கு முன்பு/பின்பு ஆதாரத்துடன் குடிமை வெளிப்படைத்தன்மையை ஆதரிக்கவும்.",
        cta_en: "For CSR Sponsors",
        cta_ta: "CSR நிதியாளர்களுக்கு",
        bg: "bg-lime-50 dark:bg-lime-900/20",
        iconBg: "bg-lime-100 dark:bg-lime-800",
        iconColor: "text-lime-600 dark:text-lime-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-lime-600 text-white hover:bg-lime-700",
      },
      {
        path: "/listings",
        icon: ShoppingBag,
        en: "Local Listings",
        ta: "உள்ளூர் பட்டியல்",
        desc_en: "Discover verified local businesses, services, helpers, and community-recommended providers.",
        desc_ta: "சரிபார்க்கப்பட்ட உள்ளூர் வணிகங்கள், சேவைகள் மற்றும் சமுதாயம் பரிந்துரைத்த வழங்குநர்களை கண்டுபிடிக்கவும்.",
        cta_en: "View Listings",
        cta_ta: "பட்டியல் பார்",
        bg: "bg-sky-50 dark:bg-sky-900/20",
        iconBg: "bg-sky-100 dark:bg-sky-800",
        iconColor: "text-sky-600 dark:text-sky-400",
        textColor: "text-slate-900 dark:text-white",
        descColor: "text-slate-500 dark:text-slate-400",
        ctaClass: "bg-sky-600 text-white hover:bg-sky-700",
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
            "From Civic Receipts to local help, jobs, stays, offices, scams, RWAs, and CSR dashboards — everything is organized for Tamil Nadu communities.",
            "குடிமை ரசீதுகள் முதல் உள்ளூர் உதவி, வேலை, தங்குமிடம், அலுவலகங்கள், மோசடி, RWA மற்றும் CSR வரை — தமிழ்நாடு சமுதாயங்களுக்காக அனைத்தும் ஒழுங்கமைக்கப்பட்டுள்ளது."
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