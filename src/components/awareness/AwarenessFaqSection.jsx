import React, { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FAQS = [
  {
    id: "f1",
    col: "left",
    q_en: "How do I file a complaint on NammaTN?",
    q_ta: "NammaTN-ல் எப்படி புகார் செய்வது?",
    a_en: "Visit the Create Post page, select your district and category, describe your issue with photos if possible, and submit. Your complaint will be visible to the community and relevant authorities.",
    a_ta: "Create Post பக்கத்திற்கு சென்று, உங்கள் மாவட்டம் மற்றும் வகையை தேர்வு செய்து, உங்கள் பிரச்சினையை விவரிக்கவும்.",
  },
  {
    id: "f2",
    col: "right",
    q_en: "How do I check my complaint status?",
    q_ta: "என் புகாரின் நிலையை எப்படி சரிபார்ப்பது?",
    a_en: "Go to your Dashboard or My Posts section. Each post shows its current status, number of upvotes, and any official responses received.",
    a_ta: "உங்கள் Dashboard அல்லது My Posts பிரிவிற்கு சென்று நிலையை சரிபார்க்கவும்.",
  },
  {
    id: "f3",
    col: "left",
    q_en: "Which portal should I use for my issue?",
    q_ta: "என் பிரச்சினைக்கு எந்த இணையதளத்தை பயன்படுத்த வேண்டும்?",
    a_en: "Use TN e-Sevai for general government services, TNEB for electricity issues, Police Portal for law & order, and RTI Online for information requests.",
    a_ta: "பொது சேவைகளுக்கு TN e-Sevai, மின்சாரத்திற்கு TNEB, சட்டம் & ஒழுங்குக்கு காவல்துறை இணையதளம் பயன்படுத்துங்கள்.",
  },
  {
    id: "f4",
    col: "right",
    q_en: "How do I report bribery safely?",
    q_ta: "லஞ்சத்தை எவ்வாறு பாதுகாப்பாக புகாரளிப்பது?",
    a_en: "Call the Anti-Corruption Helpline 1064 or file an online complaint through the Vigilance Commission portal. You can remain anonymous.",
    a_ta: "ஊழல் தடுப்பு உதவி எண் 1064ஐ அழைக்கவும் அல்லது விஜிலென்ஸ் கமிஷன் இணையதளம் வழியாக புகாரளிக்கவும்.",
  },
  {
    id: "f5",
    col: "left",
    q_en: "What documents are needed for schemes?",
    q_ta: "திட்டங்களுக்கு என்ன ஆவணங்கள் தேவை?",
    a_en: "Generally: Aadhaar card, Ration card, Bank passbook, Income certificate, and Community certificate. Specific schemes may require additional documents.",
    a_ta: "பொதுவாக: ஆதார் அட்டை, குடும்ப அட்டை, வங்கி பாஸ்புக், வருமான சான்றிதழ், சமூக சான்றிதழ் தேவைப்படும்.",
  },
  {
    id: "f6",
    col: "right",
    q_en: "How do I know if I am eligible for a scheme?",
    q_ta: "ஒரு திட்டத்திற்கு தகுதியானவரா என்று எப்படி தெரிந்துகொள்வது?",
    a_en: "Each scheme has eligibility criteria based on income, caste, age, or region. Use the 'Check Eligibility' button on each scheme card or visit the official scheme portal.",
    a_ta: "ஒவ்வொரு திட்டத்திற்கும் வருமானம், சாதி, வயது அல்லது பகுதி அடிப்படையில் தகுதி அளவுகோல்கள் உள்ளன.",
  },
];

export default function AwarenessFaqSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [open, setOpen] = useState(null);

  const toggle = (id) => setOpen(open === id ? null : id);

  const leftFaqs = FAQS.filter((f) => f.col === "left");
  const rightFaqs = FAQS.filter((f) => f.col === "right");

  const FaqItem = ({ faq }) => (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl mb-3 overflow-hidden bg-white dark:bg-slate-800">
      <button
        onClick={() => toggle(faq.id)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-2"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-white leading-snug">
          {T(faq.q_en, faq.q_ta)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open === faq.id ? "rotate-180" : ""}`}
        />
      </button>
      {open === faq.id && (
        <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {T(faq.a_en, faq.a_ta)}
        </div>
      )}
    </div>
  );

  return (
    <section id="faqs" className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-500" />
          {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
        </h2>
        <Link
          to="/awareness"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all FAQs", "அனைத்து கேள்விகள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div>
          {leftFaqs.map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </div>
        <div>
          {rightFaqs.map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
