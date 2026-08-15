"use client";

import React from "react";
import { BookOpen, Clock, Calendar, ArrowLeft, Share2, Tag, ExternalLink, CheckCircle2 } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import FormattedArticleContent from "@/components/awareness/FormattedArticleContent";

const FALLBACK_ARTICLES = [
  {
    slug: "tamil-nadu-esevai-online-services-guide",
    title_en: "Complete Guide to Tamil Nadu e-Sevai Online Services & Certificate Applications",
    title_ta: "தமிழ்நாடு இ-சேவை சான்றிதழ்கள் ஆன்லைனில் பெறுவது எப்படி? முழு வழிகாட்டி",
    category_en: "Government Services",
    category_ta: "அரசு சேவைகள்",
    readTime: "5 min read",
    date: "Aug 15, 2026",
    summary_en: "Learn how to apply for Community, Income, Native Residence, and First Graduate certificates online via TNEGA e-Sevai without middleman fees.",
    summary_ta: "இடத்தரகர்கள் இன்றி சாதி, வருமானம், இருப்பிடம் மற்றும் முதல் பட்டதாரி சான்றிதழ்களை ஆன்லைனில் விண்ணப்பிக்கும் முறை.",
    content_en: `Tamil Nadu e-Governance Agency (TNEGA) provides over 150 government-to-citizen (G2C) services online via the official portal tnesevai.tn.gov.in. Citizens no longer need to stand in long queues or pay middleman fees at government offices.

### Essential Certificates Available via e-Sevai:
1. **Community Certificate (சாதிச் சான்றிதழ்)**: Mandatory proof of caste category (BC/MBC/SC/ST) required for school admissions, college entrance exams, and government job reservations.
2. **Income Certificate (வருமானச் சான்றிதழ்)**: Documents annual family income from all sources. Essential for applying to government scholarships, fee concessions, and welfare schemes.
3. **Nativity & Residence Certificate (இருப்பிட சான்றிதழ்)**: Verifies continuous residence in Tamil Nadu. Required for state-quota medical and engineering admissions (TNEA/NEET).
4. **First Graduate Certificate (முதல் பட்டதாரி சான்றிதழ்)**: Provides tuition fee waivers in professional degree courses for students who are the first in their family to attend college.
5. **Patta & Chitta Extracts (பட்டா & சிட்டா)**: Land ownership records issued by the Revenue Department.

### Step-by-Step Application Procedure:
- **Step 1: Citizen Access Number (CAN) Registration**: Visit tnesevai.tn.gov.in and click "Citizen Login". Register your CAN number using your 12-digit Aadhaar Card number, full name, and mobile number.
- **Step 2: Select Service**: Under the Revenue Department tab, select the required certificate (e.g. Income Certificate REV-103).
- **Step 3: Document Upload**: Upload self-attested digital copies (PDF/JPEG) of your Aadhaar Card, Smart Ration Card, applicant photograph, and self-declaration form.
- **Step 4: Online Fee Payment**: Pay the prescribed processing fee of ₹60 using UPI, Netbanking, or Debit Card. Save the generated acknowledgement receipt number (TN-72023X).
- **Step 5: Official Verification**: Your application is routed digitally to the Village Administrative Officer (VAO), Revenue Inspector (RI), and Tahsildar for field verification.
- **Step 6: Digital Certificate Download**: Once approved (typically 7 to 15 working days), download the digitally signed certificate equipped with a secure QR code directly from the e-Sevai portal.`,
    content_ta: `தமிழ்நாடு மின் ஆளுமை முகமை (TNEGA) tnesevai.tn.gov.in தளம் மூலம் 150க்கும் மேற்பட்ட அரசு சேவைகளை இணையவழியில் வழங்குகிறது.

### ஆன்லைனில் பெறக்கூடிய முக்கிய சான்றிதழ்கள்:
1. **சாதிச் சான்றிதழ் (Community Certificate)**: பள்ளி, கல்லூரி சேர்க்கை மற்றும் அரசு வேலைவாய்ப்பு இடஒதுக்கீட்டிற்கு அத்தியாவசியமானது.
2. **வருமானச் சான்றிதழ் (Income Certificate)**: குடும்பத்தின் மொத்த ஆண்டு வருமானத்தைச் சான்றளிக்கும் ஆவணம். கல்வி உதவித்தொகைகளுக்கு கட்டாயம்.
3. **இருப்பிடச் சான்றிதழ் (Nativity Certificate)**: தமிழ்நாட்டில் நிரந்தரமாக வசிப்பதை உறுதிசெய்யும் ஆவணம். TNEA / NEET கல்லூரி சேர்க்கைக்கு தேவை.
4. **முதல் பட்டதாரி சான்றிதழ் (First Graduate Certificate)**: குடும்பத்தில் முதல் தலைமுறை பட்டதாரிக்கு தொழில்முறை கல்லூரிகளில் கல்விக் கட்டண விலக்கு பெற உதவும்.
5. **பட்டா & சிட்டா நகல்கள்**: நில உரிமை குறித்த வருவாய்த் துறை ஆவணங்கள்.

### விண்ணப்பிக்கும் படிநிலைகள்:
- **படி 1: CAN எண் பதிவு**: tnesevai.tn.gov.in தளத்திற்குச் சென்று உங்கள் 12 இலக்க ஆதார் எண் மற்றும் மொபைல் எண்ணை இணைத்து CAN (Citizen Access Number) கணக்கை உருவாக்கவும்.
- **படி 2: சேவையைத் தேர்வு செய்தல்**: வருவாய்த் துறை பட்டியலில் தேவையான சான்றிதழைத் தேர்ந்தெடுக்கவும்.
- **படி 3: ஆவணங்கள் பதிவேற்றம்**: ஆதார், குடும்ப அட்டை, புகைப்படம் மற்றும் சுய பிரகடனப் படிவத்தைப் பதிவேற்றவும்.
- **படி 4: ஆன்லைன் கட்டணம்**: ₹60 விண்ணப்பக் கட்டணத்தை UPI அல்லது Netbanking மூலம் செலுத்தி ஒப்புகை ரசீதைப் பெறவும்.
- **படி 5: அரசு அதிகாரி ஆய்வு**: VAO (கிராம நிர்வாக அதிகாரி), வருவாய் ஆய்வாளர் (RI) மற்றும் தாசில்தார் டிஜிட்டல் சரிபார்ப்பு செய்வார்கள்.
- **படி 6: சான்றிதழ் பதிவிறக்கம்**: 7 முதல் 15 வேலை நாட்களுக்குள் QR குறியீட்டுடன் கூடிய டிஜிட்டல் சான்றிதழைப் பதிவிறக்கலாம்.`
  },
  {
    slug: "how-to-file-rti-application-tamil-nadu-guide",
    title_en: "How to File an Effective RTI Application in Tamil Nadu: Laws, Fees & Appeal Workflow",
    title_ta: "தமிழ்நாட்டில் தகவல் அறியும் உரிமைச் சட்டத்தில் (RTI) விண்ணப்பிப்பது எப்படி?",
    category_en: "Citizen Rights",
    category_ta: "குடிமக்கள் உரிமைகள்",
    readTime: "7 min read",
    date: "Aug 15, 2026",
    summary_en: "Step-by-step instructions on drafting RTI queries, identifying Public Information Officers (PIO), court fee stamps, and 30-day first appeal process.",
    summary_ta: "அரசுத் துறைகளிடம் இருந்து RTI மூலம் தகவல்களைப் பெற கேட்க வேண்டிய கேள்விகள் மற்றும் மேல்முறையீடு நடைமுறைகள்.",
    content_en: `The Right to Information (RTI) Act 2005 is one of the most powerful legal instruments available to Indian citizens to demand transparency, inspect government files, and question administrative inaction.

### What Information Can You Request Under RTI?
- Details of road relaying tender amounts, contractor names, and quality audit reports.
- Status and reasons for delay in issuing certificates, pensions, or utility connections.
- Certified copies of government orders, municipal resolutions, and budget allocations.
- Attendance registers and duty charts of public officials in local offices.

### How to Draft a Powerful RTI Application:
- **Address the Correct Authority**: Address the application to the "Public Information Officer (PIO)" of the specific department (e.g., Greater Chennai Corporation / Highways Department / TANGEDCO).
- **Ask Precise Questions**: Frame clear, specific questions starting with "What", "When", "How much", or "Provide certified copy of...". Avoid asking for opinions or hypothetical situations.
- **Application Fee**: Attach a ₹10 Court Fee Stamp or Postal Order / Demand Draft payable to the PIO. Below-Poverty-Line (BPL) card holders are exempt from fees.
- **Online Option**: Submit applications online directly at rtionline.tn.gov.in.

### Statutory Timelines & First Appeal:
- **30-Day Mandatory Window**: The PIO MUST provide written information within 30 calendar days (48 hours if life or personal liberty is concerned).
- **First Appeal Process**: If information is denied, incomplete, misleading, or delayed beyond 30 days, file a First Appeal to the "First Appellate Authority (FAA)" (Head of Office) within 30 days. No fee is required for the first appeal.`,
    content_ta: `தகவல் அறியும் உரிமைச் சட்டம் 2005 மூலம் அரசுத் துறைகளிடம் கேள்விகள் கேட்டு 30 நாட்களுக்குள் பதில் பெறலாம்.

### RTI விண்ணப்பிக்கும் முறை:
- **தெளிவான கேள்விகள்**: சாலைப் பணிகள், நிதி ஒதுக்கீடு அல்லது சான்றிதழ் தாமதத்திற்கான காரணங்களைக் குறிப்பிட்டுக் கேட்கவும்.
- **கட்டணம்**: ₹10 நீதிமன்ற முத்திரை ஒட்டி பொதுத் தகவல் அதிகாரிக்கு (PIO) அனுப்ப வேண்டும்.
- **ஆன்லைன் விண்ணப்பம்**: rtionline.tn.gov.in தளம் மூலம் ஆன்லைனிலும் விண்ணப்பிக்கலாம்.

### காலக்கெடு & மேல்முறையீடு:
- **பதில் காலக்கெடு**: 30 நாட்கள் கட்டாயம்.
- **முதல் மேல்முறையீடு**: 30 நாளில் பதில் வராவிட்டால் 30 நாட்களுக்குள் துறைத் தலைவரிடம் முதல் மேல்முறையீடு செய்யலாம்.`
  },
  {
    slug: "cmchis-health-insurance-coverage-hospital-guide",
    title_en: "Understanding CMCHIS Health Insurance Coverage, Hospital Network & Cashless Claims",
    title_ta: "முதலமைச்சர் விரிவான காப்பீட்டுத் திட்டத்தில் ₹5 லட்சம் இலவச சிகிச்சை பெறுவது எப்படி?",
    category_en: "Health & Insurance",
    category_ta: "சுகாதாரம் & காப்பீடு",
    readTime: "6 min read",
    date: "Aug 15, 2026",
    summary_en: "Complete overview of medical procedures, cashless hospital admission workflow across 1,150+ hospitals, and 1800-425-3993 helpline.",
    summary_ta: "முதலமைச்சர் காப்பீட்டு அட்டையைப் பயன்படுத்தி 1,150க்கும் மேற்பட்ட அரசு மற்றும் தனியார் மருத்துவமனைகளில் பணமில்லா சிகிச்சை பெறும் முறை.",
    content_en: `The Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS) provides cashless medical and surgical treatment up to ₹5,00,000 per family per year across 1,150+ government and private empanelled hospitals in Tamil Nadu.

### Eligibility Criteria:
- Families listed on a valid Tamil Nadu Smart Ration Card with annual income below ₹1,20,000 per annum.
- Sri Lankan refugee families residing in camps across Tamil Nadu.
- Orphaned children and destitute women identified by social welfare boards.

### Coverage & Medical Procedures:
- Covers 1,500+ specialized medical procedures, open-heart surgeries, organ transplants, cancer chemotherapy/radiation, and neurological care.
- Includes pre-hospitalization diagnostic tests, inpatient stay, medicines, ICU care, and post-discharge follow-up care for 10 days.

### Hospital Admission & Cashless Claim Workflow:
- **Step 1**: Visit any empanelled hospital (list available on cmchis.com).
- **Step 2**: Approach the dedicated "CMCHIS Kiosk" at the hospital entrance and present your CMCHIS Card and Smart Ration Card.
- **Step 3**: The Hospital Insurance Liaison Officer checks your policy status and submits a digital pre-authorization request to United India Insurance Co.
- **Step 4**: Upon digital approval (usually within 2-4 hours), cashless admission is granted. Patients do NOT need to pay cash deposits.
- **Emergency Helpline**: Call 1800-425-3993 (24x7 Toll-Free) if any private hospital refuses admission or demands illegal cash payments.`,
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
    slug: "patta-chitta-fmb-ec-land-records-guide-tamil-nadu",
    title_en: "Patta, Chitta, FMB Sketch & EC Demystified for Property Owners in TN",
    title_ta: "பட்டா, சிட்டா, வரைபடம் (FMB) மற்றும் வில்லங்கச் சான்றிதழ் (EC) — நில ஆவணங்களின் முழு விளக்கம்",
    category_en: "Property & Revenue",
    category_ta: "சொத்து & வருவாய்",
    readTime: "8 min read",
    date: "Aug 15, 2026",
    summary_en: "Essential guide explaining land revenue terminology in Tamil Nadu, online verification steps, and avoiding property registration scams.",
    summary_ta: "தமிழ்நாட்டில் நிலம் வாங்கும் போது சரிபார்க்க வேண்டிய பட்டா, சிட்டா, வில்லங்கச் சான்றிதழ் மற்றும் FMB வரைபடங்களின் முக்கியத்துவம்.",
    content_en: `Buying real estate or verifying land ownership in Tamil Nadu requires a deep understanding of four key revenue and registration documents. Verifying these documents online prevents land encroachment and title fraud.

### 1. Patta (பட்டா):
Patta is the legal land title document issued by the Tahsildar (Revenue Department). It confirms the legal owner's name, survey number, sub-division number, district, taluk, village, and exact land area measurements. You can verify and download digital Patta online at eservices.tn.gov.in/eservicesweb.

### 2. Chitta (சிட்டா):
Chitta is a revenue record maintained by the Village Administrative Officer (VAO) that details land classification (Nanjai wetland / Punjai dryland), soil type, crop cultivated, and revenue tax assessed on the property.

### 3. FMB Sketch (Field Measurement Book - வரைபடம்):
FMB is a survey map maintained by the Survey and Land Records Department showing the exact physical dimensions, boundaries, sub-divisions, and adjoining plots for a given survey number. It is critical for physical site inspection before purchasing land.

### 4. Encumbrance Certificate (EC - வில்லங்கச் சான்றிதழ்):
EC is issued by the Sub-Registrar Office (tnreginet.gov.in). It records all registered transactions (sales, mortgages, gifts, court attachments, bank loans) conducted on a property over a chosen period (e.g. past 30 years). A "Nil Encumbrance Certificate" confirms the land is free from legal disputes and unpaid bank loans.`,
    content_ta: `தமிழ்நாட்டில் நிலம் வாங்கும் போது 4 சட்டப்பூர்வ ஆவணங்களை சரிபார்ப்பது கட்டாயம்:

1. **பட்டா (Patta)**: வட்டாட்சியர் வழங்கும் நில உரிமை ஆவணம். eservices.tn.gov.in தளத்தில் சரிபார்க்கலாம்.
2. **சிட்டா (Chitta)**: நிலத்தின் வகைப்பாடு (நஞ்சை/புஞ்சை) மற்றும் வரி விவரங்கள் கொண்ட ஆவணம்.
3. **FMB வரைபடம்**: நிலத்தின் துல்லியமான எல்லை அளவுகள் மற்றும் சர்வே எண்களைக் காட்டும் வரைபடம்.
4. **வில்லங்கச் சான்றிதழ் (EC)**: நிலத்தில் சொத்துக் கடனோ, வழக்குகளோ இல்லை என்பதை உறுதிசெய்யும் TNREGINET பதிவுச் சான்று.`
  },
  {
    slug: "traffic-police-vehicle-check-citizen-rights-guide",
    title_en: "Legal Protections & Citizen Rights During Traffic Police Vehicle Checks in TN",
    title_ta: "வாகன சோதனையின் போது காவல்துறையிடம் ஓட்டுநர்களுக்கு உள்ள சட்டப்பூர்வ உரிமைகள்",
    category_en: "Traffic & Legal Rights",
    category_ta: "போக்குவரத்து & சட்ட உரிமை",
    readTime: "5 min read",
    date: "Aug 15, 2026",
    summary_en: "Know the legal rules under Motor Vehicles Act regarding officer rank requirements, DigiLocker validity, key seizure prohibition, and fine payment.",
    summary_ta: "வாகன சோதனையின் போது காவலத்துறை பின்பற்ற வேண்டிய விதிகள் மற்றும் ஓட்டுநர்களின் உரிமைகள் பற்றிய விழிப்புணர்வு.",
    content_en: `Citizens driving two-wheelers or four-wheelers in Tamil Nadu are protected under the Motor Vehicles Act 1989 and landmark High Court judgments during routine traffic checks.

### Key Citizen Legal Rights:
1. **Officer Rank Requirements**: Only traffic police officers of Sub-Inspector (SI) rank and above (wearing stars on shoulder badges) are legally authorized to inspect documents or issue fine challans. Constables cannot collect fines.
2. **DigiLocker & mParivahan Validity**: Under Rule 139 of Central Motor Vehicles Rules 1989, digital copies of your Driving License (DL), RC Book, Insurance Policy, and Pollution Certificate shown on official DigiLocker or mParivahan mobile apps are 100% legally valid equivalent to original physical documents.
3. **No Key Snatching or Force**: Police officers CANNOT forcibly snatch ignition keys from moving or parked vehicles, switch off engines, or physically assault drivers. Doing so is illegal and subject to disciplinary action by the Police Complaints Authority.
4. **Electronic Challan Receipts**: All fines MUST be collected via digital e-Challan devices generating instant printed or SMS receipts. Paying un-receipted cash is illegal.
5. **Night Arrest Protection for Women**: Under CrPC Section 46(4), female drivers cannot be arrested after 6:00 PM and before 6:00 AM except in extraordinary circumstances with prior written permission from a Judicial Magistrate and in the presence of a female police officer.`,
    content_ta: `தமிழ்நாட்டில் வாகன ஓட்டுநர்களுக்கான சட்டப்பூர்வ உரிமைகள்:

### உங்கள் சட்ட உரிமைகள்:
1. **அதிகாரி பதவி**: சப்-இன்ஸ்பெக்டர் (SI) அல்லது அதற்கு மேற்பட்ட அதிகாரிகளேSpot Fine வசூலிக்க முடியும்.
2. **டிஜிலாக்கர் செல்லுபடி**: DigiLocker / mParivahan செயலியில் உள்ள ஓட்டுநர் உரிமம், RC 100% செல்லுபடியாகும்.
3. **சாவி பிடுங்கத் தடை**: வாகனச் சாவியை பிடுங்குவது அல்லது உடலளவில் தாக்குவது சட்டவிரோதம்.
4. **இ-சலான் ரசீது**: அபராதத்திற்கு மின்னணு e-Challan ரசீது கட்டாயம் வழங்கப்பட வேண்டும்.`
  }
];

export default function AwarenessArticleDetail({ article }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  // Fallback to match by slug if content is missing
  const activeArticle =
    article && article.content_en
      ? article
      : FALLBACK_ARTICLES.find((a) => a.slug === article?.slug) || article || FALLBACK_ARTICLES[0];

  if (!activeArticle) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {T("Article not found", "கட்டுரை கிடைக்கவில்லை")}
        </h2>
        <Link href="/awareness/articles" className="mt-4 inline-block text-sm text-emerald-600 font-semibold">
          ← {T("Back to Knowledge Articles", "கட்டுரைகள் பக்கத்திற்குத் திரும்பவும்")}
        </Link>
      </div>
    );
  }

  const contentText = T(activeArticle.content_en, activeArticle.content_ta) || "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/awareness/articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{T("Back to Articles", "கட்டுரைகள் பக்கத்திற்கு")}</span>
        </Link>

        <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              {T(activeArticle.category_en, activeArticle.category_ta)}
            </span>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeArticle.readTime || "5 min read"}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {activeArticle.date || "Aug 15, 2026"}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {T(activeArticle.title_en, activeArticle.title_ta)}
          </h1>

          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-emerald-500">
            {T(activeArticle.summary_en, activeArticle.summary_ta)}
          </p>

          <div className="mt-8">
            <FormattedArticleContent content={contentText} />
          </div>
        </article>
      </div>
    </div>
  );
}
