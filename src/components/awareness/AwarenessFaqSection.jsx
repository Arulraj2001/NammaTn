import React, { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Real, practical FAQs for Tamil Nadu citizens
const FAQS = [
  {
    id: "f1", col: "left",
    q_en: "How do I file a complaint on NammaTN234?",
    q_ta: "NammaTN234-ல் எப்படி புகார் பதிவு செய்வது?",
    a_en: "Click 'Create Post' in the top menu. Select your district, ward, and issue category. Describe the problem with photos. Your post is public and also notified to relevant officials. You can track responses on your Dashboard.",
    a_ta: "மேல் மெனுவில் 'Create Post' கிளிக் செய்யுங்கள். மாவட்டம், வார்டு மற்றும் பிரச்சினை வகையை தேர்வு செய்யுங்கள். புகைப்படங்களுடன் பிரச்சினையை விவரிக்கவும்.",
  },
  {
    id: "f2", col: "right",
    q_en: "How do I check my complaint status?",
    q_ta: "என் புகாரின் நிலையை எப்படி சரிபார்ப்பது?",
    a_en: "Go to your Dashboard or My Posts. Each post shows upvotes, official responses, and current status. You can also track government complaints at pgportal.gov.in or the CM Grievance portal cms.tn.gov.in using your reference number.",
    a_ta: "Dashboard அல்லது My Posts பக்கம் செல்லுங்கள். cms.tn.gov.in அல்லது pgportal.gov.in இல் உங்கள் Reference Number மூலம் நிலையை சரிபார்க்கலாம்.",
  },
  {
    id: "f3", col: "left",
    q_en: "Which portal should I use for my issue?",
    q_ta: "என் பிரச்சினைக்கு எந்த இணையதளத்தை பயன்படுத்த வேண்டும்?",
    a_en: "Use tnesevai.tn.gov.in for most services (150+ govt services). tnebltd.org for electricity issues. tnpds.gov.in for ration card. eservices.tnpolice.gov.in for police matters. rtionline.gov.in for RTI requests.",
    a_ta: "பொது சேவைகளுக்கு tnesevai.tn.gov.in பயன்படுத்துங்கள். மின்சாரத்திற்கு tnebltd.org. குடும்ப அட்டைக்கு tnpds.gov.in. காவல் சேவைகளுக்கு eservices.tnpolice.gov.in.",
  },
  {
    id: "f4", col: "right",
    q_en: "How do I report bribery safely?",
    q_ta: "லஞ்சத்தை எவ்வாறு பாதுகாப்பாக புகாரளிப்பது?",
    a_en: "Call the Directorate of Vigilance and Anti-Corruption (DVAC) at 1064 or visit vigilance.tn.gov.in. You can also file online at the CM Grievance portal. Anonymity is protected. You can also dial 100 if the bribery involves threats.",
    a_ta: "ஊழல் தடுப்பு பிரிவு (DVAC) 1064 அழைக்கவும் அல்லது vigilance.tn.gov.in ல் புகார் அளிக்கவும். அடையாளம் வெளிப்படுத்தல் தேவையில்லை.",
  },
  {
    id: "f5", col: "left",
    q_en: "What documents are needed to apply for schemes?",
    q_ta: "திட்டங்களுக்கு என்ன ஆவணங்கள் தேவை?",
    a_en: "Generally: Aadhaar card (mandatory), Ration card, Bank passbook, Income certificate, Community certificate, and passport-size photos. For women's schemes, also keep your voter ID. Documents vary by scheme — check myscheme.gov.in for exact requirements.",
    a_ta: "ஆதார் அட்டை, குடும்ப அட்டை, வங்கி பாஸ்புக், வருமான சான்றிதழ், சமூக சான்றிதழ் தேவைப்படும். திட்டத்திற்கு ஏற்ப தேவைகள் மாறும் — myscheme.gov.in ல் சரிபார்க்கவும்.",
  },
  {
    id: "f6", col: "right",
    q_en: "How do I know if I am eligible for a scheme?",
    q_ta: "ஒரு திட்டத்திற்கு தகுதியானவரா என்று எப்படி தெரிந்துகொள்வது?",
    a_en: "Visit myscheme.gov.in and answer a short questionnaire (age, income, caste, state). It will list all central and state schemes you qualify for. You can also visit the nearest e-Sevai centre or Common Service Centre (CSC) for assistance.",
    a_ta: "myscheme.gov.in பக்கத்திற்கு சென்று (வயது, வருமானம், சாதி, மாநிலம்) கேள்விகளுக்கு பதிலளிக்கவும். உங்களுக்கு தகுதியான அனைத்து திட்டங்களும் பட்டியலிடப்படும்.",
  },
  {
    id: "f7", col: "left",
    q_en: "How do I apply for a new ration card?",
    q_ta: "புதிய குடும்ப அட்டை எப்படி பெறுவது?",
    a_en: "Apply online at tnpds.gov.in or visit the nearest e-Sevai centre. Required documents: Aadhaar card of all family members, proof of residence, bank account details. You can also track application status online with the application ID.",
    a_ta: "tnpds.gov.in ல் ஆன்லைனில் விண்ணப்பிக்கவும் அல்லது அருகிலுள்ள e-Sevai மையம் செல்லுங்கள். ஆதார் அட்டை, குடியிருப்பு சான்று, வங்கி கணக்கு விவரங்கள் தேவை.",
  },
  {
    id: "f8", col: "right",
    q_en: "What is the CM Grievance Cell and how does it work?",
    q_ta: "முதலமைச்சர் புகார் மையம் என்ன? எப்படி செயல்படுகிறது?",
    a_en: "The CM Grievance Cell (1100) is a 24×7 helpline for public grievances. You can also register online at cms.tn.gov.in. Your complaint is forwarded to the concerned department and tracked with a reference number. Resolution time is typically 30–60 days.",
    a_ta: "முதலமைச்சர் புகார் மையம் (1100) 24×7 இயங்கும் உதவி எண். cms.tn.gov.in ல் ஆன்லைனிலும் பதிவு செய்யலாம். புகார் Reference Number மூலம் கண்காணிக்கலாம்.",
  },
];

export default function AwarenessFaqSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [openId, setOpenId] = useState(null);
  const toggle = (id) => setOpenId(openId === id ? null : id);

  const leftFaqs = FAQS.filter((f) => f.col === "left");
  const rightFaqs = FAQS.filter((f) => f.col === "right");

  const FaqItem = ({ faq }) => (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl mb-2.5 overflow-hidden bg-white dark:bg-slate-800">
      <button
        onClick={() => toggle(faq.id)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
        aria-expanded={openId === faq.id}
      >
        <span className="text-sm font-medium text-slate-800 dark:text-white leading-snug">
          {T(faq.q_en, faq.q_ta)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${openId === faq.id ? "rotate-180" : ""}`}
        />
      </button>
      {openId === faq.id && (
        <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
          {T(faq.a_en, faq.a_ta)}
        </div>
      )}
    </div>
  );

  return (
    <section id="faqs" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-purple-500" />
          {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
        </h2>
        <Link
          to="/awareness/faqs"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
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

export { FAQS };
