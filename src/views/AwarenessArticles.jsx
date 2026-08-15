"use client";

import React, { useState } from "react";
import { BookOpen, Search, Clock, Calendar, ChevronRight, ExternalLink, ArrowLeft, Tag, Share2 } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const KNOWLEDGE_ARTICLES = [
  {
    id: "art-esevai-guide",
    slug: "tamil-nadu-esevai-online-services-guide",
    title_en: "Complete Guide to Tamil Nadu e-Sevai Online Services & Certificate Applications",
    title_ta: "தமிழ்நாடு இ-சேவை சான்றிதழ்கள் ஆன்லைனில் பெறுவது எப்படி? முழு வழிகாட்டி",
    category_en: "Government Services",
    category_ta: "அரசு சேவைகள்",
    readTime: "5 min read",
    date: "Aug 15, 2026",
    summary_en: "Learn how to apply for Community, Income, Native Residence, and First Graduate certificates online through TNEGA e-Sevai without middleman fees.",
    summary_ta: "இடத்தரகர்கள் இன்றி சாதி, வருமானம், இருப்பிடம் மற்றும் முதல் பட்டதாரி சான்றிதழ்களை ஆன்லைனில் விண்ணப்பிக்கும் முறை.",
    content_en: `Tamil Nadu e-Governance Agency (TNEGA) provides over 150 government-to-citizen (G2C) services online via tnesevai.tn.gov.in. 

### Key Certificates Available Online:
1. **Community Certificate**: Proof of caste category for education and government job reservations.
2. **Income Certificate**: Required for college scholarship applications and welfare schemes.
3. **Nativity / Native Residence Certificate**: Required for state quota admission in professional colleges.
4. **First Graduate Certificate**: Tuition fee waiver in engineering and medical colleges.

### Step-by-Step Application Process:
- **Step 1**: Register a Citizen Access Number (CAN number) using your Aadhaar and mobile number on tnesevai.tn.gov.in.
- **Step 2**: Select Revenue Department > Choose desired certificate.
- **Step 3**: Upload mandatory documents (Aadhaar, Ration Card, VAO inspection form).
- **Step 4**: Pay nominal fee ₹60 online via debit card/UPI.
- **Step 5**: Village Administrative Officer (VAO) and Revenue Inspector (RI) verify field details digitally.
- **Step 6**: Download official certificate with QR code within 7 to 15 working days.`,
    content_ta: `தமிழ்நாடு மின் ஆளுமை முகமை (TNEGA) tnesevai.tn.gov.in தளம் மூலம் 150க்கும் மேற்பட்ட அரசு சேவைகளை வழங்குகிறது.

### ஆன்லைனில் பெறக்கூடிய முக்கிய சான்றிதழ்கள்:
1. **சாதி சான்றிதழ் (Community Certificate)**: கல்வி மற்றும் வேலைவாய்ப்பு இடஒதுக்கீட்டிற்கு.
2. **வருமான சான்றிதழ் (Income Certificate)**: கல்வி உதவித்தொகை மற்றும் அரசு நலத்திட்டங்களுக்கு.
3. **இருப்பிட சான்றிதழ் (Nativity Certificate)**: தமிழகக் கல்லூரி சேர்க்கைக்கு.
4. **முதல் பட்டதாரி சான்றிதழ் (First Graduate Certificate)**: பொறியியல் கல்லூரிகளில் கட்டணக் கழிவு பெற.

### விண்ணப்பிக்கும் வழிமுறைகள்:
- **படி 1**: tnesevai.tn.gov.in தளத்தில் ஆதாரை இணைத்து CAN எண் உருவாக்கவும்.
- **படி 2**: வருவாய்த் துறை > தேவையான சான்றிதழைத் தேர்ந்தெடுக்கவும்.
- **படி 3**: ஆதார், ரேஷன் கார்டு நகல்களை பதிவேற்றவும்.
- **படி 4**: விண்ணப்பக் கட்டணம் ₹60 செலுத்தவும்.
- **படி 5**: VAO மற்றும் வருவாய் ஆய்வாளர் டிஜிட்டல் சரிபார்ப்பு செய்வார்கள்.
- **படி 6**: 7-15 நாட்களில் QR குறியீட்டுடன் சான்றிதழைப் பதிவிறக்கலாம்.`
  },
  {
    id: "art-rti-guide",
    slug: "how-to-file-rti-application-tamil-nadu-guide",
    title_en: "How to File an Effective RTI Application in Tamil Nadu: Laws, Fees & Appeal Workflow",
    title_ta: "தமிழ்நாட்டில் தகவல் அறியும் உரிமைச் சட்டத்தில் (RTI) விண்ணப்பிப்பது எப்படி?",
    category_en: "Citizen Rights",
    category_ta: "குடிமக்கள் உரிமைகள்",
    readTime: "7 min read",
    date: "Aug 15, 2026",
    summary_en: "Step-by-step instructions on drafting RTI queries, identifying Public Information Officers (PIO), court fee stamps, and 30-day first appeal process.",
    summary_ta: "அரசுத் துறைகளிடம் இருந்து RTI மூலம் தகவல்களைப் பெற கேட்க வேண்டிய கேள்விகள் மற்றும் மேல்முறையீடு நடைமுறைகள்.",
    content_en: `Under the Right to Information Act 2005, citizens can request official records from any Tamil Nadu government department.

### How to Draft & File an RTI:
- **Formulate Clear Questions**: Ask specific questions regarding road tender costs, fund allocations, or application delay reasons. Avoid asking opinions.
- **Fee Payment**: Attach a ₹10 Court Fee Stamp or Demand Draft / Postal Order payable to the Public Information Officer (PIO).
- **Online Filing**: Citizens can also file online at rtionline.tn.gov.in.

### Timelines & Appeals:
- **PIO SLA**: 30 calendar days mandatory reply window.
- **First Appeal**: If reply is denied, incomplete, or delayed beyond 30 days, file a First Appeal to the Appellate Authority (Department Head) within 30 days.`,
    content_ta: `தகவல் அறியும் உரிமைச் சட்டம் 2005 மூலம் அரசுத் துறைகளிடம் கேள்விகள் கேட்டு 30 நாட்களில் பதில் பெறலாம்.

### RTI விண்ணப்பிக்கும் முறை:
- **தெளிவான கேள்விகள்**: சாலைப் பணிகள், நிதி ஒதுக்கீடு அல்லது சான்றிதழ் தாமதத்திற்கான காரணங்களைக் குறிப்பிட்டுக் கேட்கவும்.
- **கட்டணம்**: ₹10 நீதிமன்ற முத்திரை ஒட்டி பொதுத் தகவல் அதிகாரிக்கு (PIO) அனுப்ப வேண்டும்.
- **ஆன்லைன் விண்ணப்பம்**: rtionline.tn.gov.in தளம் மூலம் ஆன்லைனிலும் விண்ணப்பிக்கலாம்.

### காலக்கெடு & மேல்முறையீடு:
- **பதில் காலக்கெடு**: 30 நாட்கள் கட்டாயம்.
- **முதல் மேல்முறையீடு**: 30 நாளில் பதில் வராவிட்டால் 30 நாட்களுக்குள் துறைத் தலைவரிடம் முதல் மேல்முறையீடு செய்யலாம்.`
  },
  {
    id: "art-cmchis-claims",
    slug: "cmchis-health-insurance-coverage-hospital-guide",
    title_en: "Understanding CMCHIS Health Insurance Coverage, Hospital Network & Cashless Claims",
    title_ta: "முதலமைச்சர் விரிவான காப்பீட்டுத் திட்டத்தில் ₹5 லட்சம் இலவச சிகிச்சை பெறுவது எப்படி?",
    category_en: "Health & Insurance",
    category_ta: "சுகாதாரம் & காப்பீடு",
    readTime: "6 min read",
    date: "Aug 15, 2026",
    summary_en: "Complete overview of medical procedures, cashless hospital admission workflow, empanelled government/private hospitals, and 1800-425-3993 helpline.",
    summary_ta: "முதலமைச்சர் காப்பீட்டு அட்டையைப் பயன்படுத்தி 1,150க்கும் மேற்பட்ட அரசு மற்றும் தனியார் மருத்துவமனைகளில் பணமில்லா சிகிச்சை பெறும் முறை.",
    content_en: `Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS) offers cashless hospitalization coverage up to ₹5,00,000 per family per year across 1,150+ empanelled hospitals in Tamil Nadu.

### Eligibility & Card Requirements:
- Valid Tamil Nadu Smart Ration Card with family annual income below ₹1.20 lakh per annum.
- E-card can be downloaded from cmchis.com using Ration Card number.

### Hospital Admission Process:
- Show CMCHIS card & Ration card at the Chief Minister Insurance Kiosk in any empanelled hospital.
- Hospital Insurance Liaison Officer initiates pre-authorization directly with United India Insurance.
- Patient receives 100% cashless treatment with zero out-of-pocket payment for covered procedures.
- Grievance Helpline: 1800-425-3993.`,
    content_ta: `முதலமைச்சர் காப்பீட்டுத் திட்டம் மூலம் குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வரை 1,150க்கும் மேற்பட்ட மருத்துவமனைகளில் கட்டணமில்லா சிகிச்சை பெறலாம்.

### தகுதி & அட்டை விவரங்கள்:
- ஆண்டு வருமானம் ₹1.20 லட்சத்திற்குள் உள்ள செல்லுபடியாகும் குடும்ப அட்டை.
- cmchis.com தளத்தில் ரேஷன் கார்டு எண் மூலம் காப்பீட்டு அட்டையைப் பதிவிறக்கலாம்.

### மருத்துவமனை அனுமதி முறை:
- அங்கீகரிக்கப்பட்ட மருத்துவமனையில் உள்ள காப்பீட்டு மையத்தில் ரேஷன் கார்டு மற்றும் காப்பீட்டு அட்டையைக் காட்டவும்.
- காப்பீட்டு அதிகாரி நேரடி முன்-அனுமதி பெற்றுத் தருவார்.
- நோயாளிக்கு முற்றிலும் இலவசமாக பணமில்லா சிகிச்சை வழங்கப்படும்.
- உதவி எண்: 1800-425-3993.`
  },
  {
    id: "art-land-records",
    slug: "patta-chitta-fmb-ec-land-records-guide-tamil-nadu",
    title_en: "Patta, Chitta, FMB Sketch & EC Demystified for Property Buyers & Owners in TN",
    title_ta: "பட்டா, சிட்டா, வரைபடம் (FMB) மற்றும் வில்லங்கச் சான்றிதழ் (EC) — நில ஆவணங்களின் முழு விளக்கம்",
    category_en: "Property & Revenue",
    category_ta: "சொத்து & வருவாய்",
    readTime: "8 min read",
    date: "Aug 15, 2026",
    summary_en: "Essential guide explaining land revenue terminology in Tamil Nadu, online verification steps, and avoiding property registration scams.",
    summary_ta: "தமிழ்நாட்டில் நிலம் வாங்கும் போது சரிபார்க்க வேண்டிய பட்டா, சிட்டா, வில்லங்கச் சான்றிதழ் மற்றும் FMB வரைபடங்களின் முக்கியத்துவம்.",
    content_en: `When buying or verifying land in Tamil Nadu, four legal revenue documents are mandatory:

1. **Patta**: Revenue ownership record issued by Tahsildar containing owner name, survey number, and area extent. Verified at eservices.tn.gov.in.
2. **Chitta**: Revenue extract detailing land classification (Nanjai wetland / Punjai dryland) and land tax assessment.
3. **FMB Sketch (Field Measurement Book)**: Survey map showing exact boundary dimensions, sub-divisions, and surrounding plots.
4. **Encumbrance Certificate (EC)**: Certificate from Sub-Registrar Office (tnreginet.gov.in) confirming no pre-existing mortgages, legal disputes, or unpaid bank loans.`,
    content_ta: `தமிழ்நாட்டில் நிலம் வாங்கும் போது 4 சட்டப்பூர்வ ஆவணங்களை சரிபார்ப்பது கட்டாயம்:

1. **பட்டா (Patta)**: வட்டாட்சியர் வழங்கும் நில உரிமை ஆவணம். eservices.tn.gov.in தளத்தில் சரிபார்க்கலாம்.
2. **சிட்டா (Chitta)**: நிலத்தின் வகைப்பாடு (நஞ்சை/புஞ்சை) மற்றும் வரி விவரங்கள் கொண்ட ஆவணம்.
3. **FMB வரைபடம்**: நிலத்தின் துல்லியமான எல்லை அளவுகள் மற்றும் சர்வே எண்களைக் காட்டும் வரைபடம்.
4. **வில்லங்கச் சான்றிதழ் (EC)**: நிலத்தில் சொத்துக் கடனோ, வழக்குகளோ இல்லை என்பதை உறுதிசெய்யும் TNREGINET பதிவுச் சான்று.`
  },
  {
    id: "art-traffic-police-rights",
    slug: "traffic-police-vehicle-check-citizen-rights-guide",
    title_en: "Legal Protections & Citizen Rights During Traffic Police Vehicle Checks in TN",
    title_ta: "வாகன சோதனையின் போது காவல்துறையிடம் ஓட்டுநர்களுக்கு உள்ள சட்டப்பூர்வ உரிமைகள்",
    category_en: "Traffic & Legal Rights",
    category_ta: "போக்குவரத்து & சட்ட உரிமை",
    readTime: "5 min read",
    date: "Aug 15, 2026",
    summary_en: "Know the legal rules under Motor Vehicles Act regarding officer rank requirements, DigiLocker validity, key seizure prohibition, and fine payment.",
    summary_ta: "வாகன சோதனையின் போது காவல்துறை பின்பற்ற வேண்டிய விதிகள் மற்றும் ஓட்டுநர்களின் உரிமைகள் பற்றிய விழிப்புணர்வு.",
    content_en: `Citizens driving in Tamil Nadu are protected under the Motor Vehicles Act 1989 and High Court rulings:

### Your Statutory Rights:
1. **Officer Rank**: Only officers of Sub-Inspector (SI) rank and above are legally authorized to demand spot fine payments.
2. **DigiLocker Validity**: Digital copies of DL, RC, Insurance shown on DigiLocker or mParivahan apps are 100% legally valid under MV Act Rule 139.
3. **No Key Snatching**: Police officers CANNOT forcibly snatch ignition keys or physically assault drivers.
4. **Electronic Receipts**: Fines must be issued via digital e-Challan machines with official SMS confirmation.`,
    content_ta: `தமிழ்நாட்டில் வாகன ஓட்டுநர்களுக்கான சட்டப்பூர்வ உரிமைகள்:

### உங்கள் சட்ட உரிமைகள்:
1. **அதிகாரி பதவி**: சப்-இன்ஸ்பெக்டர் (SI) அல்லது அதற்கு மேற்பட்ட அதிகாரிகளேSpot Fine வசூலிக்க முடியும்.
2. **டிஜிலாக்கர் செல்லுபடி**: DigiLocker / mParivahan செயலியில் உள்ள ஓட்டுநர் உரிமம், RC 100% செல்லுபடியாகும்.
3. **சாவி பிடுங்கத் தடை**: வாகனச் சாவியை பிடுங்குவது அல்லது உடலளவில் தாக்குவது சட்டவிரோதம்.
4. **இ-சலான் ரசீது**: அபராதத்திற்கு மின்னணு e-Challan ரசீது கட்டாயம் வழங்கப்பட வேண்டும்.`
  }
];

export default function AwarenessArticlesPage() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [searchQuery, setSearchQuery] = useState("");

  usePageMeta({
    title: "Tamil Nadu Civic Knowledge Base & Citizen Articles | VizhiTN",
    description: "In-depth guides on TN e-Sevai online services, RTI filing, CMCHIS health claims, Patta land record verification, and traffic police rights.",
  });

  const filteredArticles = KNOWLEDGE_ARTICLES.filter((art) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      art.title_en.toLowerCase().includes(q) ||
      art.title_ta.toLowerCase().includes(q) ||
      art.summary_en.toLowerCase().includes(q) ||
      art.summary_ta.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {T("Citizen Knowledge Base & In-Depth Guides", "குடிமக்கள் அறிவுத் தளம் & விரிவான வழிகாட்டிகள்")}
              </h1>
              <p className="text-emerald-200 text-sm sm:text-base mt-1">
                {T(
                  "Comprehensive, verified guides on government e-services, RTI procedures, health insurance claims, and land records.",
                  "அரசு இ-சேவைகள், RTI முறை, சுகாதாரக் காப்பீடு மற்றும் நிலப் பதிவேடுகள் பற்றிய விரிவான கட்டுரைகள்."
                )}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={T("Search knowledge articles (e.g. e-Sevai, RTI, Patta, CMCHIS)...", "கட்டுரைகளைத் தேடுங்கள் (எ.கா. e-Sevai, RTI, பட்டா, காப்பீடு)...")}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {T(art.category_en, art.category_ta)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition leading-snug">
                  <Link href={`/awareness/article/${art.slug}`}>
                    {T(art.title_en, art.title_ta)}
                  </Link>
                </h3>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {T(art.summary_en, art.summary_ta)}
                </p>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {art.date}
                </span>
                <Link
                  href={`/awareness/article/${art.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition"
                >
                  <span>{T("Read Full Article", "முழு கட்டுரையை படிக்க")}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
