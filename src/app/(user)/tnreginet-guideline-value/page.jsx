import React from "react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";
import { 
  Building2, ExternalLink, CheckCircle2, ShieldCheck, 
  HelpCircle, Search, MapPin, Calculator, PhoneCall, AlertCircle, ArrowRight, FileCheck, Layers
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { DISTRICTS } from "@/lib/districts";

export const revalidate = 3600; // 1 hour cache

export const metadata = {
  title: "TNREGINET Guideline Value 2026: Tamil Nadu Land Market Rates & EC Online Verification",
  description: "Official guide to check TNREGINET Guideline Value and download Encumbrance Certificate (EC / வில்லங்கச் சான்றிதழ்) online in Tamil Nadu (tnreginet.gov.in). Verify street rates, survey number values, and registration charges across all 38 districts.",
  alternates: {
    canonical: "/tnreginet-guideline-value",
    languages: {
      "ta-IN": "https://www.vizhitn.in/tnreginet-guideline-value?lang=ta",
      "en-IN": "https://www.vizhitn.in/tnreginet-guideline-value?lang=en",
      "x-default": "https://www.vizhitn.in/tnreginet-guideline-value",
    },
  },
  keywords: [
    "tnreginet guideline value",
    "tnreginet guideline value 2026",
    "guideline value search by street tamil nadu",
    "tnreginet ec online search",
    "villangam certificate download",
    "stamp duty registration charges tamil nadu",
    "guideline value check survey number",
    "inspector general of registration tamil nadu",
    "sub registrar office slot booking tnreginet"
  ],
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
  },
  openGraph: {
    title: "TNREGINET Guideline Value & EC Online Verification — Tamil Nadu",
    description: "Check official street guideline rates, survey number values, and download Villangam EC across all 38 Tamil Nadu districts.",
    url: "/tnreginet-guideline-value",
    type: "website",
    images: [
      {
        url: "https://www.vizhitn.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TNREGINET Guideline Value Tamil Nadu",
      },
    ],
  },
};

const GUIDELINE_FAQS = [
  {
    q: "What is Guideline Value in Tamil Nadu (வழிகாட்டி மதிப்பு)?",
    a: "Guideline Value is the minimum estimated market rate per square foot or acre fixed by the Government of Tamil Nadu (Registration Department) for property registration and stamp duty calculation in a specific street or revenue village. Property sale deeds cannot be registered below this government value."
  },
  {
    q: "Is checking Guideline Value and downloading EC completely free on TNREGINET?",
    a: "Yes. Searching guideline rates for any street, survey number, or revenue village on the official portal (tnreginet.gov.in) is 100% free. Online viewing and downloading of unsigned Encumbrance Certificates (EC from 1975 onwards) is also completely free of charge."
  },
  {
    q: "How to check property Guideline Value by street name?",
    a: "Visit tnreginet.gov.in -> Navigate to 'Guideline Value' (வழிகாட்டி மதிப்பு) -> Select 'Street' -> Choose your Zone, Sub-Registrar Office (SRO), and Revenue Village -> Type the Street Name -> Click Search to view the guideline rate per square foot or square metre."
  },
  {
    q: "How to check property Guideline Value by Survey Number?",
    a: "On tnreginet.gov.in, select 'Guideline Value' -> Choose 'Survey Number' -> Enter District, Sub-Registrar Office (SRO), Village name, and your specific Survey / Sub-Division Number to see the agricultural or commercial classification and rate per cent / acre."
  },
  {
    q: "What are the current stamp duty and registration fees in Tamil Nadu?",
    a: "For property sale deeds in Tamil Nadu: Stamp Duty is 7%, Registration Fee is 4%, and Surcharge / Transfer Duty is 2% (Total 13% for standard conveyance). Composite properties and family settlements have lower concession rates."
  },
  {
    q: "What is an Encumbrance Certificate (Villangam / EC) and why is it essential?",
    a: "An Encumbrance Certificate (வில்லங்கச் சான்றிதழ்) documents all registered legal transactions (sales, mortgages, court attachments, leases, family settlements) on a property over a chosen period. A 'Nil Encumbrance' certificate proves the property has no pending bank loans or legal disputes."
  }
];

export default function TnreginetGuidelineValuePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GUIDELINE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Check TNREGINET Land Guideline Value and EC Online in Tamil Nadu",
    description: "Step-by-step guide to search street guideline rates, survey number land values, and download digital Encumbrance Certificates from tnreginet.gov.in.",
    step: [
      {
        "@type": "HowToStep",
        name: "Visit Official TNREGINET Portal",
        text: "Open https://tnreginet.gov.in in your browser (Inspector General of Registration, Government of Tamil Nadu).",
      },
      {
        "@type": "HowToStep",
        name: "Select Guideline Value Search",
        text: "From the top menu, click 'Guideline Value' (வழிகாட்டி மதிப்பு) and choose your preferred search criterion: Street Name or Survey Number.",
      },
      {
        "@type": "HowToStep",
        name: "Enter Zone and SRO Details",
        text: "Select your registration Zone (e.g., Chennai, Coimbatore, Madurai, Salem), Sub-Registrar Office (SRO), and Revenue Village.",
      },
      {
        "@type": "HowToStep",
        name: "View Official Value & Download EC",
        text: "View the official rate per square foot or square metre, verify land classification, and optionally click 'E-Services' -> 'Encumbrance Certificate' to view registered deeds from 1975 onwards.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Citizen Services", href: "/esevai" },
              { name: "TNREGINET Guideline Value & EC", href: "/tnreginet-guideline-value" },
            ]}
          />

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Banner */}
              <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Official Department of Registration TN
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  TNREGINET Guideline Value & EC Verification 2026
                </h1>
                <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                  Official guide to check property market guideline values, survey number classifications, stamp duty rates, and download free Encumbrance Certificates (EC / வில்லங்கம்) across all 38 districts of Tamil Nadu.
                </p>

                {/* Direct Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://tnreginet.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-blue-500/25"
                  >
                    <span>Open TNREGINET Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="https://tnreginet.gov.in/portal/webHP?requestType=ApplicationRH&actionVal=viewEC&pageCode=viewEC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-sm transition-all"
                  >
                    <span>Download EC (Villangam)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Quick Fee & Stamp Duty Rate Summary */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-4">
                  <Calculator className="w-4 h-4" />
                  Tamil Nadu Registration & Stamp Duty Rates (2026)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">7%</span>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Stamp Duty</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">4%</span>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Registration Fee</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">2%</span>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Transfer Duty (ULB)</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">13%</span>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 font-bold">Total Conveyance</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
                  * Note: Family settlement deeds, gifts within family, and partition deeds have special discounted caps of 1% to 2% with fixed ceiling charges.
                </p>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-500" />
                  How to Search Guideline Value on tnreginet.gov.in
                </h2>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Visit tnreginet.gov.in</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Open the Inspector General of Registration (IGR) Tamil Nadu portal. Switch language to English or Tamil (தமிழ்) at the top right.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Select Search by Street or Survey Number</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Under the "Guideline Value" tab on the homepage, choose <strong>Street</strong> for urban residential/commercial roads, or <strong>Survey Number</strong> for agricultural/layout plots.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Choose Zone, SRO, and Village</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Select your Registration Zone (e.g., Chennai, Chengalpattu, Coimbatore, Madurai, Tiruchirappalli, Salem), the specific Sub-Registrar Office (SRO), and Revenue Village.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">View Official Rate & Classifications</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Click Search to see the official Guideline Value per square foot / metre, effective date, and commercial or residential classification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Encumbrance Certificate (EC / Villangam) Guide */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-500" />
                  Free Encumbrance Certificate (EC / வில்லங்கம்) Online Search
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Before purchasing any land or flat in Tamil Nadu, checking the Encumbrance Certificate is mandatory to ensure there are no registered bank mortgages, court attachments, or disputes:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Online Period Covered</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Digital records from <strong>1975 to Present Day</strong> are digitized and searchable 24/7 across all Sub-Registrar offices.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Cost & Download</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Viewing and downloading an unsigned copy is <strong>100% Free</strong>. Certified signed copies can also be requested online.
                    </p>
                  </div>
                </div>
              </div>

              {/* All 38 Districts Directory */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  Browse Guideline Rates by Tamil Nadu District
                </h3>
                <div className="flex flex-wrap gap-2">
                  {DISTRICTS.map((district) => (
                    <Link
                      key={district.slug}
                      to={`/${district.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/30 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {district.name_en}
                    </Link>
                  ))}
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                  Frequently Asked Questions (FAQs)
                </h3>
                <div className="space-y-3">
                  {GUIDELINE_FAQS.map((faq, idx) => (
                    <div key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{faq.q}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Helplines Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  Official Registration Helplines
                </h4>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-blue-50 dark:border-slate-700">
                    <span className="text-slate-500 block font-medium">TNREGINET Helpdesk:</span>
                    <a href="tel:04424640160" className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                      044-24640160 / 1800-425-1333
                    </a>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-blue-50 dark:border-slate-700">
                    <span className="text-slate-500 block font-medium">CM Helpline:</span>
                    <a href="tel:1100" className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                      1100 (Toll Free 24x7)
                    </a>
                  </div>
                </div>
              </div>

              {/* Related Citizen Tools */}
              <SidebarRelatedLinks
                currentPath="/tnreginet-guideline-value"
                customLinks={[
                  { title_en: "Patta Chitta Online Status", href: "/patta-chitta-online-status" },
                  { title_en: "TNPDS Smart Ration Card Status", href: "/tnpds-smart-ration-card-status" },
                  { title_en: "TNEB Electricity Bill Calculator", href: "/tneb-bill-calculator" },
                  { title_en: "Today's Power Cut Timings", href: "/power-cuts-today-tamil-nadu" },
                  { title_en: "e-Sevai Citizen Services Guide", href: "/esevai" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
