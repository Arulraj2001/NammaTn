import React, { useState } from "react";
import { HelpCircle, Search, ChevronDown, ArrowLeft, X } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

// All real FAQs for Tamil Nadu citizens
const ALL_FAQS = [
  {
    id: "f1", category: "complaints",
    q_en: "How do I file a complaint on VizhiTN?",
    q_ta: "VizhiTN-ல் எப்படி புகார் பதிவு செய்வது?",
    a_en: "Click 'Create Post' in the top menu. Select your district, ward, and issue category. Describe the problem with photos or videos. Your post is public and also notified to relevant officials via our automated alert system. You can track all responses on your Dashboard.",
    a_ta: "மேல் மெனுவில் 'Create Post' கிளிக் செய்யுங்கள். மாவட்டம், வார்டு மற்றும் பிரச்சினை வகையை தேர்வு செய்யுங்கள். புகைப்படங்களுடன் பிரச்சினையை விவரிக்கவும். உங்கள் Dashboard இல் பதில்களை கண்காணிக்கலாம்.",
  },
  {
    id: "f2", category: "complaints",
    q_en: "How do I check my government complaint status?",
    q_ta: "என் அரசு புகாரின் நிலையை எப்படி சரிபார்ப்பது?",
    a_en: "For Tamil Nadu CM Grievance Cell complaints (1100), track at cms.tn.gov.in using your reference number. For central government complaints, use pgportal.gov.in. For police complaints, use the TN Police e-Services portal. VizhiTN posts are tracked in your Dashboard.",
    a_ta: "TN முதலமைச்சர் புகார் (1100) நிலை: cms.tn.gov.in ல் Reference Number கொண்டு சரிபார்க்கவும். மத்திய அரசு: pgportal.gov.in. காவல்துறை: TN Police e-Services.",
  },
  {
    id: "f3", category: "portals",
    q_en: "Which portal should I use for my issue?",
    q_ta: "என் பிரச்சினைக்கு எந்த இணையதளத்தை பயன்படுத்த வேண்டும்?",
    a_en: "Use tnesevai.tn.gov.in for certificates and most services. tnebltd.org for electricity issues. tnpds.gov.in for ration card. eservices.tnpolice.gov.in for FIR and police. rtionline.gov.in for RTI applications. cms.tn.gov.in for general government grievances.",
    a_ta: "சான்றிதழ் & பொது சேவைகளுக்கு tnesevai.tn.gov.in. மின்சாரத்திற்கு tnebltd.org. குடும்ப அட்டைக்கு tnpds.gov.in. காவல் சேவைகளுக்கு eservices.tnpolice.gov.in.",
  },
  {
    id: "f4", category: "corruption",
    q_en: "How do I report bribery safely?",
    q_ta: "லஞ்சத்தை எவ்வாறு பாதுகாப்பாக புகாரளிப்பது?",
    a_en: "Call the DVAC Anti-Corruption Helpline at 1064 (24×7, anonymous). File online at vigilance.tn.gov.in — your identity is protected. You can also record the conversation on your phone (legally permitted in Tamil Nadu for self-protection). Additionally, file an RTI at rtionline.gov.in asking why your service was delayed.",
    a_ta: "DVAC ஊழல் தடுப்பு உதவி 1064 (24×7, அடையாளம் வெளிப்படுத்தல் தேவையில்லை). vigilance.tn.gov.in ல் ஆன்லைனில் புகார். TN சட்டம் பதிவு செய்ய அனுமதிக்கிறது.",
  },
  {
    id: "f5", category: "schemes",
    q_en: "What documents are needed to apply for government schemes?",
    q_ta: "திட்டங்களுக்கு என்ன ஆவணங்கள் தேவை?",
    a_en: "Most schemes need: Aadhaar card (mandatory for all), ration card, bank passbook showing account number and IFSC, income certificate (from VAO or Taluk office), community/caste certificate, and 2 passport-size photos. Some schemes also require voter ID, birth certificate, or education certificates. Always check myscheme.gov.in for scheme-specific requirements.",
    a_ta: "ஆதார் அட்டை (அனைத்திற்கும் கட்டாயம்), குடும்ப அட்டை, வங்கி பாஸ்புக், வருமான சான்றிதழ் (VAO மூலம்), சமூக சான்றிதழ், 2 புகைப்படங்கள். திட்டத்திற்கு ஏற்ப மாறும் — myscheme.gov.in ல் சரிபார்க்கவும்.",
  },
  {
    id: "f6", category: "schemes",
    q_en: "How do I know which government schemes I am eligible for?",
    q_ta: "எந்த அரசு திட்டத்திற்கு தகுதியானவர் என்று எப்படி தெரிந்துகொள்வது?",
    a_en: "Visit myscheme.gov.in and answer questions about your age, income, gender, occupation, and state. The portal will list all central and state government schemes you qualify for. You can also visit your nearest e-Sevai centre (tnesevai.tn.gov.in) for in-person guidance.",
    a_ta: "myscheme.gov.in செல்லுங்கள் — வயது, வருமானம், பாலினம், தொழில், மாநிலம் கொடுங்கள். தகுதியான திட்டங்கள் தானாகவே பட்டியலிடப்படும். அருகிலுள்ள e-Sevai மையத்திலும் உதவி கிடைக்கும்.",
  },
  {
    id: "f7", category: "ration",
    q_en: "How do I apply for a new ration card or add a family member?",
    q_ta: "புதிய குடும்ப அட்டை பெறுவது அல்லது உறுப்பினர் சேர்ப்பது எப்படி?",
    a_en: "For new ration card: visit tnpds.gov.in and apply online, or visit your nearest e-Sevai centre. Bring Aadhaar cards of all family members, proof of residence, and bank account details. For adding a member: go to tnpds.gov.in > Update Family Members. You can also call helpline 1967.",
    a_ta: "புதிய குடும்ப அட்டை: tnpds.gov.in ல் ஆன்லைனில் விண்ணப்பிக்கவும் அல்லது e-Sevai மையம் செல்லுங்கள். குடும்பத்தினர் சேர்க்க: tnpds.gov.in > Update Family Members. உதவி: 1967.",
  },
  {
    id: "f8", category: "health",
    q_en: "How do I get free health treatment under CMCHIS?",
    q_ta: "CMCHIS கீழ் இலவச சுகாதார சிகிச்சை எப்படி பெறுவது?",
    a_en: "Simply go to any CMCHIS-empanelled hospital with your Tamil Nadu ration card. No prior registration or application is needed. Show your ration card at the hospital's CMCHIS desk. Coverage is up to ₹5 lakh per family per year. Find empanelled hospitals at cmchis.com.",
    a_ta: "தமிழ்நாடு குடும்ப அட்டையுடன் CMCHIS அங்கீகரிக்கப்பட்ட மருத்துவமனைக்கு செல்லுங்கள். முன் பதிவு தேவையில்லை. CMCHIS மேஜையில் குடும்ப அட்டை காட்டுங்கள். ₹5 லட்சம் வரை கட்டணமில்லாமல் சிகிச்சை.",
  },
  {
    id: "f9", category: "rti",
    q_en: "How do I file an RTI application?",
    q_ta: "RTI விண்ணப்பம் எப்படி அளிப்பது?",
    a_en: "For central government departments: apply at rtionline.gov.in with a ₹10 fee (online payment). For Tamil Nadu state departments: submit a written application to the Public Information Officer (PIO) of the department with ₹10 postal order or fee. Response must come within 30 days. If denied or delayed, file a first appeal, then go to the Tamil Nadu State Information Commission (tnsic.gov.in).",
    a_ta: "மத்திய அரசு: rtionline.gov.in ல் ₹10 கட்டணத்துடன் ஆன்லைனில். TN மாநில அரசு: துறையின் தகவல் அதிகாரியிடம் ₹10 கட்டணத்துடன் எழுத்துப்பூர்வமாக. 30 நாட்களில் பதில் வர வேண்டும். இல்லையேல் முதல் மேல்முறையீடு, பிறகு tnsic.gov.in.",
  },
  {
    id: "f10", category: "property",
    q_en: "How do I register a property in Tamil Nadu?",
    q_ta: "தமிழ்நாட்டில் சொத்து பதிவு செய்வது எப்படி?",
    a_en: "Visit tnreginet.gov.in to book a slot at your Sub-Registrar Office. Prepare the sale deed with details of both buyer and seller, two witnesses, and all required documents (Encumbrance Certificate, patta, chitta, etc.). Stamp duty and registration fee vary based on property value. Consult a registered document writer for assistance.",
    a_ta: "tnreginet.gov.in ல் Sub-Registrar அலுவலகத்தில் இடம் பதிவு செய்யுங்கள். விற்பவர் & வாங்குபவர் விவரங்கள், இரண்டு சாட்சிகள், Encumbrance Certificate, பட்டா, சிட்டா உட்பட அனைத்து ஆவணங்கள் தேவை.",
  },
  {
    id: "f11", category: "police",
    q_en: "How do I file an FIR if police refuse to register it?",
    q_ta: "காவல்துறை FIR பதிவு செய்ய மறுத்தால் என்ன செய்வது?",
    a_en: "You have the legal right to have your FIR registered. If the local police station refuses: (1) File online at eservices.tnpolice.gov.in. (2) Visit the Superintendent of Police (SP) office. (3) Send a complaint by registered post to the SP. (4) File a complaint with the Tamil Nadu Police Complaints Authority. The police cannot legally refuse to register an FIR for a cognizable offence.",
    a_ta: "FIR பதிவு செய்வது உங்கள் சட்டபூர்வ உரிமை. மறுத்தால்: (1) eservices.tnpolice.gov.in ல் ஆன்லைனில். (2) கண்காணிப்பாளர் (SP) அலுவலகம் செல்லுங்கள். (3) SP க்கு பதிவுத் தபாலில் புகார். (4) TN Police புகார் ஆணையம்.",
  },
  {
    id: "f12", category: "electricity",
    q_en: "How do I apply for a new electricity connection?",
    q_ta: "புதிய மின்சார இணைப்பு எப்படி பெறுவது?",
    a_en: "Apply online at tnebltd.org > Apply for New Connection. Required documents: proof of ownership/occupation, Aadhaar card, recent photo. Domestic connection: single phase, 5 amps. You can also apply at your nearest Electricity Board office. Processing time is typically 7–15 working days.",
    a_ta: "tnebltd.org > Apply for New Connection ல் ஆன்லைனில் விண்ணப்பிக்கவும். ஆவணங்கள்: உரிமை சான்று, ஆதார் அட்டை, சமீபத்திய புகைப்படம். நேரில் விண்ணப்பிக்க: அருகிலுள்ள மின்சார வாரிய அலுவலகம். 7–15 நாட்களில் இணைப்பு கிடைக்கும்.",
  },
];

const CATEGORIES = [
  { id: "all", label_en: "All Topics", label_ta: "அனைத்து தலைப்புகள்" },
  { id: "complaints", label_en: "Complaints", label_ta: "புகார்கள்" },
  { id: "schemes", label_en: "Schemes", label_ta: "திட்டங்கள்" },
  { id: "portals", label_en: "Portals", label_ta: "இணையதளங்கள்" },
  { id: "health", label_en: "Health", label_ta: "சுகாதாரம்" },
  { id: "ration", label_en: "Ration Card", label_ta: "குடும்ப அட்டை" },
  { id: "rti", label_en: "RTI", label_ta: "தகவல் உரிமை" },
  { id: "corruption", label_en: "Anti-Corruption", label_ta: "ஊழல் தடுப்பு" },
  { id: "police", label_en: "Police & FIR", label_ta: "காவல் & FIR" },
  { id: "property", label_en: "Property", label_ta: "சொத்து" },
  { id: "electricity", label_en: "Electricity", label_ta: "மின்சாரம்" },
];

export default function AwarenessFaqsPage() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState(null);

  usePageMeta({
    title: "Citizen FAQs Tamil Nadu | VizhiTN",
    description: "Answers to the most common questions Tamil Nadu citizens ask about government services — RTI, ration card, CMCHIS, FIR, electricity connection, property registration and more.",
  });

  const filtered = ALL_FAQS.filter((f) => {
    const matchCat = category === "all" || f.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      f.q_en.toLowerCase().includes(q) ||
      f.q_ta.includes(q) ||
      f.a_en.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/awareness" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> {T("Back to Awareness", "விழிப்புணர்வுக்கு திரும்பு")}
      </Link>

      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {T(`${ALL_FAQS.length} practical answers for Tamil Nadu citizens.`,
                 `${ALL_FAQS.length} நடைமுறை பதில்கள் — தமிழ்நாடு குடிமக்களுக்காக.`)}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={T("Search questions...", "கேள்விகளை தேடுங்கள்...")}
          className="w-full pl-10 pr-9 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category tabs — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              category === c.id
                ? "bg-purple-600 text-white border-purple-600"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-purple-300"
            }`}
          >
            {T(c.label_en, c.label_ta)}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-4">
        {T(`${filtered.length} questions`, `${filtered.length} கேள்விகள்`)}
      </p>

      {/* FAQ list */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{T("No questions found", "கேள்விகள் எதுவும் கிடைக்கவில்லை")}</p>
          </div>
        ) : (
          filtered.map((faq, i) => (
            <div key={faq.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left"
                aria-expanded={openId === faq.id}
              >
                <span className="flex-shrink-0 text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5 w-5 text-right">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm font-medium text-slate-800 dark:text-white leading-snug">
                  {T(faq.q_en, faq.q_ta)}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${openId === faq.id ? "rotate-180" : ""}`} />
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-700">
                  <div className="pl-8 pt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {T(faq.a_en, faq.a_ta)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
        {T(
          "Have a question not listed here? Post it on VizhiTN and get answers from the community.",
          "இங்கு இல்லாத கேள்வி இருக்கிறதா? VizhiTN இல் பதிவிட்டு சமூகத்திடம் பதில் பெறுங்கள்."
        )}
        {" "}<Link to="/ask" className="text-blue-500 hover:underline">{T("Ask now →", "இப்போது கேளுங்கள் →")}</Link>
      </p>
    </div>
  );
}
