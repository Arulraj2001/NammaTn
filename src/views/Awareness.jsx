import React from "react";
import { BookOpen, Shield, Phone, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import CitizenInfoCard from "@/components/awareness/CitizenInfoCard";
import AdSlot from "@/components/ads/AdSlot";

const SCHEMES = [
  { en: "Amma Drinking Water Scheme", ta: "அம்மா குடிநீர் திட்டம்", category: "Water & Sanitation", url: "#" },
  { en: "Kalaignar Magalir Urimai Thittam", ta: "கலைஞர் மகளிர் உரிமை திட்டம்", category: "Women Welfare", url: "#" },
  { en: "Tamil Nadu Student Insurance Scheme", ta: "மாணவர் காப்பீட்டுத் திட்டம்", category: "Education", url: "#" },
  { en: "Chief Minister's Comprehensive Health Insurance", ta: "முதலமைச்சர் காப்பீட்டுத் திட்டம்", category: "Health", url: "#" },
  { en: "MGNREGA Employment Guarantee", ta: "வேலை உத்தரவாத திட்டம்", category: "Employment", url: "#" },
  { en: "Pradhan Mantri Awas Yojana", ta: "வீட்டு வசதி திட்டம்", category: "Housing", url: "#" },
];

export default function Awareness() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  usePageMeta({
    title: "Citizen Awareness | TN Voice — Tamil Nadu",
    description: "Citizen rights, government welfare schemes, emergency contacts, and civic resources for Tamil Nadu residents.",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {T("Citizen Awareness", "குடிமக்கள் விழிப்புணர்வு")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
          {T(
            "Know your rights, access government services, and stay informed about civic resources in Tamil Nadu.",
            "உங்கள் உரிமைகளை அறிந்து, அரசு சேவைகளை அணுகி, தமிழ்நாட்டில் குடிமக்கள் வளங்கள் பற்றி தெரிந்துகொள்ளுங்கள்."
          )}
        </p>
      </div>

      {/* Quick Resource Cards */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-500" />
          {T("Quick Resources", "விரைவு வளங்கள்")}
        </h2>
        <CitizenInfoCard lang={lang} />
      </section>

      <AdSlot placement="homepage" className="mb-10 max-w-3xl mx-auto" />

      {/* Government Schemes */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          {T("Key Government Schemes", "முக்கிய அரசு திட்டங்கள்")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCHEMES.map((s) => (
            <div
              key={s.en}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mb-2">
                {s.category}
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2">
                {T(s.en, s.ta)}
              </p>
              <a
                href={s.url}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {T("Learn more", "மேலும் அறிக")} <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">
          {T("Share Local Issues", "உள்ளூர் பிரச்சினைகளைப் பகிரவும்")}
        </h2>
        <p className="text-blue-100 text-sm mb-4">
          {T("Know about a problem in your area? Raise it on TN Voice.", "உங்கள் பகுதியில் ஒரு பிரச்சினை இருக்கிறதா? TN Voice இல் தெரிவியுங்கள்.")}
        </p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
        >
          {T("Post Now", "இப்போது பதிவிடுங்கள்")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}