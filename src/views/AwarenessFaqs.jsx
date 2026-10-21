"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle, Search, ChevronDown, ArrowRight, ArrowLeft,
  X, Sparkles, Filter, CheckCircle2, MessageSquare, PlusCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import { getAllFaqs } from "@/lib/awarenessServer";

const FAQ_CATEGORIES = [
  { id: "all", label_en: "All Topics", label_ta: "அனைத்தும்" },
  { id: "Complaints", label_en: "Grievances & Complaints", label_ta: "புகார்கள்" },
  { id: "Portals", label_en: "Government Portals", label_ta: "இணையதளங்கள்" },
  { id: "Consumer", label_en: "Consumer Grievances", label_ta: "நுகர்வோர் குறைகள்" },
  { id: "Schemes", label_en: "Welfare Schemes", label_ta: "திட்டங்கள்" },
  { id: "Ration Card", label_en: "Ration & Civil Supplies", label_ta: "ரேஷன் அட்டை" },
  { id: "Healthcare", label_en: "Health & CMCHIS", label_ta: "சுகாதாரம்" },
  { id: "RTI", label_en: "Right to Information", label_ta: "RTI சட்டம்" },
  { id: "Police & Legal", label_en: "Police & FIR Rights", label_ta: "காவல் & FIR" },
  { id: "Property", label_en: "Property Registration", label_ta: "சொத்து பதிவு" },
  { id: "Electricity", label_en: "TANGEDCO Electricity", label_ta: "மின்சாரம்" },
];

export default function AwarenessFaqs() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const faqs = useMemo(() => getAllFaqs(), []);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category_en === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        faq.question_en?.toLowerCase().includes(q) ||
        faq.question_ta?.toLowerCase().includes(q) ||
        faq.answer_en?.toLowerCase().includes(q) ||
        faq.answer_ta?.toLowerCase().includes(q) ||
        faq.category_en?.toLowerCase().includes(q)
      );
    });
  }, [faqs, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <AwarenessSubNav activePath="/awareness/faqs" />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {T("Tamil Nadu Citizen Legal & Civic Answers", "தமிழ்நாடு குடிமக்கள் பொதுக் கேள்விகள்")}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள் & பதில்கள்")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {T(
                "Verified answers on RTI filing rules, ration card procedures, CMCHIS hospital claims, police FIR rights, and public grievance resolution in Tamil Nadu.",
                "RTI மனு, ரேஷன் அட்டை உறுப்பினர் சேர்த்தல், இலவச மருத்துவக் காப்பீடு, காவல் நிலைய FIR உரிமைகள் மற்றும் அரசு குறைதீர்ப்பு நடைமுறைகள்."
              )}
            </p>
          </div>

          {/* Quick Search & Stats */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={T(
                  "Search questions (e.g. RTI, ration card, CMCHIS, FIR, EB)...",
                  "கேள்விகளைத் தேடுங்கள் (எ.கா: RTI, ரேஷன், காப்பீடு, FIR, மின்சாரம்)..."
                )}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {T("Clear", "அழி")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{filteredFaqs.length} {T("Verified Answers", "கேள்விகள்")}</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
            {FAQ_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {T(cat.label_en, cat.label_ta)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs List */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              {T("No FAQs found matching your search.", "உங்கள் தேடலுக்கு ஏற்ற கேள்விகள் கிடைக்கவில்லை.")}
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700"
            >
              {T("Reset Filters", "வடிகட்டியை மீட்டமை")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openId === faq.id;
              const question = T(faq.question_en, faq.question_ta);
              const answer = T(faq.answer_en, faq.answer_ta);
              const categoryBadge = T(faq.category_en, faq.category_ta);

              return (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-start gap-4 p-5 sm:p-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-200 dark:border-purple-800">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      {categoryBadge && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                          {categoryBadge}
                        </span>
                      )}
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {question}
                      </h2>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-0 border-t border-slate-100 dark:border-slate-800">
                      <div className="pt-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                        {answer}
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                        <Link
                          href={`/awareness/faq/${faq.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        >
                          <span>{T("Read Full Article & Share", "முழு கட்டுரை & பகிர")}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Ask Question Banner */}
        <section className="mt-14 bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-800/80 text-purple-200 mb-3">
              {T("Citizen Q&A Community", "குடிமக்கள் கேள்வி பதில்")}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {T("Have a Specific Civic Question Not Answered Here?", "இங்கு விடை கிடைக்காத மற்றொரு கேள்வி உள்ளதா?")}
            </h3>
            <p className="mt-3 text-sm text-purple-100 leading-relaxed">
              {T(
                "Post your civic doubt or report an issue on VizhiTN. Local volunteers and verified citizen journalists across Tamil Nadu will assist you.",
                "உங்கள் சந்தேகங்களை VizhiTN தளத்தில் பதிவிடுங்கள். தமிழ்நாடு முழுவதும் உள்ள தன்னார்வலர்கள் உங்களுக்கு உதவ தயாராக உள்ளனர்."
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md hover:bg-purple-50 transition-colors"
              >
                {T("Ask on VizhiTN", "கேள்வி கேளுங்கள்")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/rights"
                className="inline-flex items-center gap-2 px-5 py-3 bg-purple-800/60 hover:bg-purple-800 text-white font-bold text-xs rounded-xl border border-purple-700 transition-colors"
              >
                {T("Citizen Statutory Rights", "குடிமக்கள் உரிமைகள்")}
              </Link>
            </div>
          </div>
        </section>

        {/* Internal Cross Linking */}
        <AwarenessRelatedLinks currentSection="faqs" />
      </main>
    </div>
  );
}
