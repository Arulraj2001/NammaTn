import React from "react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";
import MagalirUrimaiEligibilityChecker from "@/components/tools/MagalirUrimaiEligibilityChecker";
import { 
  HeartHandshake, ExternalLink, CheckCircle2, ShieldCheck, 
  HelpCircle, Search, FileText, PhoneCall, AlertCircle, ArrowRight, Sparkles
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { DISTRICTS } from "@/lib/districts";

export const revalidate = 3600; // 1 hour cache

export const metadata = {
  title: "Kalaignar Magalir Urimai Thogai Status 2026: ₹1,000/Month Application Check & Appeal Guide",
  description: "Official guide to track Kalaignar Magalir Urimai Thogai status (kmut.tn.gov.in / e-Sevai). Check eligibility criteria, SMS approval status, bank account credit dates, and step-by-step appeal process across all 38 Tamil Nadu districts.",
  alternates: {
    canonical: "/kalaignar-magalir-urimai-status",
    languages: {
      "ta-IN": "https://www.vizhitn.in/kalaignar-magalir-urimai-status?lang=ta",
      "en-IN": "https://www.vizhitn.in/kalaignar-magalir-urimai-status?lang=en",
      "x-default": "https://www.vizhitn.in/kalaignar-magalir-urimai-status",
    },
  },
  keywords: [
    "kalaignar magalir urimai thogai status",
    "magalir urimai status check online",
    "kmut tn gov in application status",
    "மகளிர் உரிமை தொகை நிலை",
    "magalir urimai appeal process esevai",
    "kalaignar magalir urimai eligibility criteria",
    "women rights grant 1000 tamil nadu status",
    "magalir urimai bank credit date 2026"
  ],
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
  },
  openGraph: {
    title: "Kalaignar Magalir Urimai Thogai Status Check & Eligibility — Tamil Nadu",
    description: "Check your ₹1,000 monthly grant approval status, eligibility quiz, and e-Sevai appeal procedure across all 38 districts.",
    url: "/kalaignar-magalir-urimai-status",
    type: "website",
    images: [
      {
        url: "https://www.vizhitn.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kalaignar Magalir Urimai Thogai Tamil Nadu",
      },
    ],
  },
};

const MAGALIR_FAQS = [
  {
    q: "How to check Kalaignar Magalir Urimai Thogai status online (மகளிர் உரிமை தொகை நிலை)?",
    a: "You can verify your application status by visiting your nearest Government e-Sevai Centre or checking the official KMUT SMS updates sent to your registered mobile number. You will need your Smart Ration Card number (குடும்ப அட்டை எண்) and Aadhaar card."
  },
  {
    q: "On which date is the ₹1,000 monthly amount credited to bank accounts?",
    a: "The Government of Tamil Nadu deposits the ₹1,000 grant directly into beneficiaries' Aadhaar-linked bank accounts via Direct Benefit Transfer (DBT) on the 15th of every month. If the 15th falls on a public holiday or weekend, it is credited on the previous working day."
  },
  {
    q: "What should I do if my application was rejected with an SMS?",
    a: "If your application was rejected, the SMS provides the exact reason (e.g. electricity units exceeded, four-wheeler registered, or tax discrepancy). You can file an appeal (மேல்முறையீடு) within 30 days at any local e-Sevai centre with supporting revenue certificates."
  },
  {
    q: "Who is the head of the family considered for the Magalir Urimai scheme?",
    a: "The woman listed as the family head on the Smart Ration Card is treated as the primary beneficiary. If a male is listed as head, his wife or unmarried daughter can apply as the woman representative."
  },
  {
    q: "Is an Aadhaar-linked active bank account mandatory?",
    a: "Yes. The ₹1,000 monthly assistance is transferred exclusively through NPCI Aadhaar-enabled Payment System (AePS). Ensure your bank account has active Aadhaar seeding (DBT enabled) to receive payments without disruption."
  }
];

export default function KalaignarMagalirUrimaiPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: MAGALIR_FAQS.map((faq) => ({
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
    name: "How to Check Magalir Urimai Status and File an Appeal in Tamil Nadu",
    description: "Step-by-step instructions to verify your ₹1,000 monthly grant approval and submit a grievance appeal at e-Sevai centres.",
    step: [
      {
        "@type": "HowToStep",
        name: "Check Official SMS Notification",
        text: "Check SMS messages from TNGOVT on your registered Aadhaar mobile number containing approval or rejection status with application reference number.",
      },
      {
        "@type": "HowToStep",
        name: "Visit e-Sevai Centre for Online Status",
        text: "If no SMS was received, visit any government e-Sevai centre with your Smart Ration Card and Aadhaar to check the live database status.",
      },
      {
        "@type": "HowToStep",
        name: "Submit Appeal if Ineligible by Mistake",
        text: "Submit an online appeal along with revenue/EB proof within 30 days of rejection notification at e-Sevai or through the Revenue Divisional Officer (RDO).",
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
              { name: "Government Schemes", href: "/schemes" },
              { name: "Kalaignar Magalir Urimai Status", href: "/kalaignar-magalir-urimai-status" },
            ]}
          />

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Banner */}
              <div className="bg-gradient-to-br from-pink-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/20 text-pink-300 border border-pink-400/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                  <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
                  TN Social Welfare Department
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Kalaignar Magalir Urimai Thogai Status 2026
                </h1>
                <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                  Complete guide to check ₹1,000 monthly women's rights assistance status, DBT payment release dates, eligibility guidelines, and the e-Sevai rejection appeal process across all 38 districts of Tamil Nadu.
                </p>

                {/* Direct Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://www.tnesevai.tn.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-pink-600/25"
                  >
                    <span>e-Sevai Portal Status</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="tel:1100"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-sm transition-all"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>CM Helpline: 1100</span>
                  </a>
                </div>
              </div>

              {/* Interactive Eligibility Quiz Component */}
              <MagalirUrimaiEligibilityChecker />

              {/* Step-by-Step Appeal Guide */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-pink-500" />
                  How to File an Appeal if Your Application was Rejected
                </h2>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Note the Rejection Reason from the SMS</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        The government sends an SMS to your registered mobile stating the specific rejection parameter (e.g. EB unit usage, vehicle ownership, or family income tax record).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Visit Your Nearest e-Sevai Centre</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Carry your Smart Ration Card, Aadhaar Card, Electricity Consumer Bill, and bank passbook. An appeal can be logged on the e-Sevai portal within 30 days of receiving the rejection SMS.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Field Re-Verification by Revenue Officials</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        The Revenue Divisional Officer (RDO) and Village Administrative Officer (VAO) conduct spot field checks to verify your genuine economic status and issue approval orders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-pink-500" />
                  Frequently Asked Questions (FAQs)
                </h3>
                <div className="space-y-3">
                  {MAGALIR_FAQS.map((faq, idx) => (
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
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-900 dark:to-slate-800 border border-pink-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-pink-600" />
                  Official Scheme Helplines
                </h4>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-pink-50 dark:border-slate-700">
                    <span className="text-slate-500 block font-medium">Chief Minister Helpline:</span>
                    <a href="tel:1100" className="font-bold text-pink-600 dark:text-pink-400 text-sm">
                      1100 (Toll Free 24x7)
                    </a>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-pink-50 dark:border-slate-700">
                    <span className="text-slate-500 block font-medium">Civil Supplies & Ration Helpdesk:</span>
                    <a href="tel:1967" className="font-bold text-pink-600 dark:text-pink-400 text-sm">
                      1967 (TNSCS Helpline)
                    </a>
                  </div>
                </div>
              </div>

              {/* Related Citizen Tools */}
              <SidebarRelatedLinks
                currentPath="/kalaignar-magalir-urimai-status"
                customLinks={[
                  { title_en: "TNPDS Smart Ration Card Status", href: "/tnpds-smart-ration-card-status" },
                  { title_en: "TNREGINET Guideline Value & EC", href: "/tnreginet-guideline-value" },
                  { title_en: "Patta Chitta Online Status", href: "/patta-chitta-online-status" },
                  { title_en: "TNEB Electricity Bill Calculator", href: "/tneb-bill-calculator" },
                  { title_en: "Today's Power Cut Timings", href: "/power-cuts-today-tamil-nadu" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
