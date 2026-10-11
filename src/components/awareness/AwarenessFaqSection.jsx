import React, { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAllFaqs } from "@/lib/awarenessServer";

export default function AwarenessFaqSection({ lang = "en" }) {
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [openId, setOpenId] = useState(null);
  const toggle = (id) => setOpenId(openId === id ? null : id);

  const faqs = getAllFaqs().slice(0, 8);
  const leftFaqs = faqs.filter((_, idx) => idx % 2 === 0);
  const rightFaqs = faqs.filter((_, idx) => idx % 2 === 1);

  const FaqItem = ({ faq }) => (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl mb-3 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
      <button
        onClick={() => toggle(faq.id)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
        aria-expanded={openId === faq.id}
      >
        <span className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
          {T(faq.question_en, faq.question_ta)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${openId === faq.id ? "rotate-180" : ""}`}
        />
      </button>
      {openId === faq.id && (
        <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
          <p>{T(faq.answer_en, faq.answer_ta)}</p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
            <Link
              href={`/awareness/faq/${faq.slug}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>{T("Read dedicated guide", "முழு விவரம்")}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section id="faqs" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            {T("Frequently Asked Questions (பொதுக் கேள்விகள்)", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {T("Practical civic and legal answers for Tamil Nadu citizens", "RTI, குடும்ப அட்டை, மருத்துவ காப்பீடு மற்றும் காவல் நிலைய நடைமுறைகள்")}
          </p>
        </div>
        <Link
          href="/awareness/faqs"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold flex-shrink-0"
        >
          {T("View all FAQs", "அனைத்து கேள்விகள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <div>{leftFaqs.map((f) => <FaqItem key={f.id} faq={f} />)}</div>
        <div>{rightFaqs.map((f) => <FaqItem key={f.id} faq={f} />)}</div>
      </div>
    </section>
  );
}
