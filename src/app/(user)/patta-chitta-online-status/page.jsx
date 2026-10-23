import React from "react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";
import { 
  FileText, ExternalLink, CheckCircle2, ShieldCheck, 
  HelpCircle, Search, MapPin, Building2, PhoneCall, AlertCircle, ArrowRight
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { DISTRICTS } from "@/lib/districts";

export const revalidate = 3600; // 1 hour cache

export const metadata = {
  title: "Patta Chitta Online Status 2026: Tamil Nadu Land Records & FMB Sketch Verification",
  description: "Official guide to check Patta Chitta online status in Tamil Nadu (eservices.tn.gov.in). Step-by-step process to download digital Patta, FMB sketch, TSLR extract, and TNREGINET EC (Villangam certificate) across all 38 districts.",
  alternates: {
    canonical: "/patta-chitta-online-status",
    languages: {
      "ta-IN": "https://www.vizhitn.in/patta-chitta-online-status?lang=ta",
      "en-IN": "https://www.vizhitn.in/patta-chitta-online-status?lang=en",
      "x-default": "https://www.vizhitn.in/patta-chitta-online-status",
    },
  },
  keywords: [
    "patta chitta online status",
    "eservices tn gov in patta chitta",
    "download patta copy online tamil nadu",
    "fmb sketch download online",
    "tnreginet ec search online",
    "villangam certificate download",
    "tslr extract chennai land records",
    "patta transfer application status",
    "anywhere e-services land administration"
  ],
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
  },
  openGraph: {
    title: "Patta Chitta Online Status — Tamil Nadu Land Records & EC Verification",
    description: "Verify Patta, Chitta, FMB sketch, and EC Encumbrance certificate across all 38 Tamil Nadu districts.",
    url: "/patta-chitta-online-status",
    type: "website",
    images: [
      {
        url: "https://www.vizhitn.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Patta Chitta Online Verification Tamil Nadu",
      },
    ],
  },
};

const PATTA_FAQS = [
  {
    q: "Is it completely free to view and verify Patta Chitta online in Tamil Nadu?",
    a: "Yes. Viewing, verifying, and printing your digital Patta, Chitta extract, and FMB sketch on the official government portal (eservices.tn.gov.in) is 100% free of charge. You do not need to pay any fee or visit the Taluk Office to view existing digital records."
  },
  {
    q: "What is the official government portal to check Patta Chitta online?",
    a: "The only official portal authorized by the Department of Survey and Settlement, Government of Tamil Nadu, is https://eservices.tn.gov.in. Avoid third-party commercial portals that demand payments for viewing public land records."
  },
  {
    q: "What details are required to check Patta Chitta online?",
    a: "You need three essential details: (1) District name, (2) Taluk name, (3) Village name. Additionally, you must provide either your Patta Number OR the Survey Number with Sub-division Number. For urban municipal areas (e.g., Chennai Corporation), you may need Ward and Block numbers to view the TSLR extract."
  },
  {
    q: "How can I check the status of my Patta Transfer application?",
    a: "If you applied for a Patta Name Transfer via an e-Sevai centre or online portal, visit eservices.tn.gov.in and click 'Application Status' (விண்ணப்ப நிலை). Enter your 10-digit Application Number (starts with 'APP-') to view the live status from the Village Administrative Officer (VAO), Revenue Inspector (RI), or Tahsildar."
  },
  {
    q: "How to check if a land has legal encumbrances (Villangam / EC)?",
    a: "To verify whether a property has pending bank mortgages, court attachments, or prior sale deeds, visit the Inspector General of Registration portal at tnreginet.gov.in. Encumbrance Certificate (EC / வில்லங்கம் சான்றிதழ்) searches from 1975 onwards can be viewed and downloaded online with zero stamp charges."
  }
];

export default function PattaChittaPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PATTA_FAQS.map((faq) => ({
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
    name: "How to Check & Download Patta Chitta Online in Tamil Nadu",
    description: "Step-by-step instructions for viewing and downloading digital Patta Chitta land records from the official Tamil Nadu e-Services portal.",
    step: [
      {
        "@type": "HowToStep",
        name: "Step 1: Open the Official Tamil Nadu e-Services Portal",
        text: "Navigate to the official portal at https://eservices.tn.gov.in/eservicesnew/land/chitta.html using any desktop or mobile browser.",
      },
      {
        "@type": "HowToStep",
        name: "Step 2: Select District, Taluk and Village",
        text: "Select your Rural or Urban jurisdiction, then pick your District (e.g., Chengalpattu, Coimbatore, Madurai), Taluk, and revenue Village from the dropdown menus.",
      },
      {
        "@type": "HowToStep",
        name: "Step 3: Enter Patta Number or Survey Number",
        text: "Select whether you wish to search by 'Patta Number' or 'Survey Number'. If searching by survey number, specify the sub-division number.",
      },
      {
        "@type": "HowToStep",
        name: "Step 4: Enter Captcha & View Digital Copy",
        text: "Type the security captcha code and click 'Submit'. Your digitally signed Patta Chitta extract featuring the official QR code will be generated immediately for download or printing.",
      },
    ],
  };

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Government Schemes & Records", href: "/category/government-schemes" },
    { name: "Patta Chitta Online Status", href: "/patta-chitta-online-status" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Main Content Area */}
          <main className="lg:col-span-8 space-y-8">
            {/* Header Hero Banner */}
            <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Revenue Administration Guide (2026)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Patta Chitta Online Status & Land Records Verification
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-2 max-w-2xl leading-relaxed">
                Step-by-step instructions to download your digital Patta, verify Chitta extracts, view FMB Field Measurement Sketches, and check TNREGINET EC (Villangam) across all 38 districts of Tamil Nadu.
              </p>

              {/* Direct Official Links Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-emerald-800/60">
                <a
                  href="https://eservices.tn.gov.in/eservicesnew/land/chitta.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 transition text-xs font-bold text-white group"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>View Patta / Chitta Online (Free)</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition" />
                </a>

                <a
                  href="https://tnreginet.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-400/30 transition text-xs font-bold text-white group"
                >
                  <span className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-teal-400" />
                    <span>Search TNREGINET EC (Villangam)</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-0.5 transition" />
                </a>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                Step-by-Step Process to Check Patta Chitta Online
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    Select Your Area Type
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Choose between <strong>Rural (கிராமப்புறம்)</strong> or <strong>Urban (நகர்ப்புறம்)</strong> on the e-Services landing page depending on whether your property lies within a village panchayat or municipality.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    2
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    Pick District, Taluk & Village
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Select your revenue district (e.g. Chengalpattu, Coimbatore, Tiruchirappalli), then choose your respective Taluk office and revenue village number.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    3
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    Enter Survey or Patta Number
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    If you know your Patta number, select &quot;Patta Number&quot;. Otherwise, select &quot;Survey Number&quot;, enter the main survey number, and select the exact sub-division from the dropdown list.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    4
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    Solve Captcha & Download
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Type the authentication code and submit. The digital Patta extract will open with the land owner&apos;s name, survey area (hectares/ares), wetland/dryland classification, and government QR code.
                  </p>
                </div>
              </div>

              {/* Legal Validity Note */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Government G.O. Validity Rule:</strong> Digitally generated Patta Chitta certificates bearing the cryptographic QR code are legally valid for all official transactions (bank loans, property registrations, civil courts) without requiring manual signatures or round seals from the Tahsildar.
                </div>
              </div>
            </div>

            {/* Quick District Directory */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Check Patta Chitta Across All 38 Tamil Nadu Districts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Direct jurisdiction coverage across all Collectorates and Taluk Revenue Divisional Offices:
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {DISTRICTS.map((d) => (
                  <span
                    key={d.slug}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    {d.name_en} ({d.name_ta})
                  </span>
                ))}
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                Frequently Asked Questions (Patta Chitta FAQs)
              </h3>
              <div className="space-y-3">
                {PATTA_FAQS.map((faq, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm"
                  >
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">
                      {faq.q}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <SidebarRelatedLinks
              type="article"
              category="government-schemes"
              currentSlug="patta-chitta-online-status"
              extraLinks={[
                {
                  title_en: "e-Sevai Certificate Application Fees & Checklist",
                  title_ta: "இ-சேவை சான்றிதழ்கள் கட்டண விவரம்",
                  href: "/esevai"
                },
                {
                  title_en: "Right to Information (RTI) Application Guide",
                  title_ta: "RTI தகவல் அறியும் உரிமை சட்டம்",
                  href: "/rti"
                },
                {
                  title_en: "TNEB Electricity Bill Calculator 2026",
                  title_ta: "TNEB மின் கட்டண கால்குலேட்டர்",
                  href: "/tneb-bill-calculator"
                }
              ]}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
