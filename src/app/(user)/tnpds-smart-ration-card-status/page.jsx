import React from "react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";
import { 
  CreditCard, ExternalLink, ShieldCheck, HelpCircle, 
  Search, Users, PhoneCall, AlertCircle, Sparkles, CheckCircle2 
} from "lucide-react";

export const revalidate = 3600; // 1 hour cache

export const metadata = {
  title: "TNPDS Smart Ration Card Status 2026: Online Verification & Kalaignar Magalir Urimai Guide",
  description: "Official guide to track TNPDS Smart Ration Card online status in Tamil Nadu (tnpds.gov.in). Check new card application, add family members, change mobile numbers, and verify Kalaignar Magalir Urimai Thogai eligibility with verified helplines.",
  alternates: {
    canonical: "/tnpds-smart-ration-card-status",
    languages: {
      "ta-IN": "https://www.vizhitn.in/tnpds-smart-ration-card-status?lang=ta",
      "en-IN": "https://www.vizhitn.in/tnpds-smart-ration-card-status?lang=en",
      "x-default": "https://www.vizhitn.in/tnpds-smart-ration-card-status",
    },
  },
  keywords: [
    "tnpds smart card status",
    "ration card status check tamil nadu",
    "kalaignar magalir urimai status check",
    "tnpds add family member online",
    "tnpds mobile number change online",
    "smart card application status tnpds gov in",
    "ration shop complaint helpline 1967",
    "tnsccs civil supplies complaint"
  ],
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
  },
  openGraph: {
    title: "TNPDS Smart Ration Card Status 2026 — Online Verification Guide",
    description: "Check Smart Card status, member addition, and Kalaignar Magalir Urimai scheme verification across Tamil Nadu.",
    url: "/tnpds-smart-ration-card-status",
    type: "website",
    images: [
      {
        url: "https://www.vizhitn.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TNPDS Smart Ration Card Verification",
      },
    ],
  },
};

const TNPDS_FAQS = [
  {
    q: "How can I check my TNPDS Smart Card application status online?",
    a: "Visit the official portal at https://www.tnpds.gov.in and click 'Card Related Service Status' (அட்டை தொடர்பான சேவை நிலை). Enter your 7-digit Reference Number (குறிப்பு எண்) received via SMS during application submission, then click 'Submit' to track live approval from the Assistant Supply Officer (ASO)."
  },
  {
    q: "How long does it take to get a new Smart Ration Card approved in Tamil Nadu?",
    a: "Under the Tamil Nadu Civil Supplies citizen charter, new smart card applications are processed within 15 to 30 working days. The process includes document verification by the Revenue Inspector (RI) and biometric approval by the Taluk Supply Officer (TSO)."
  },
  {
    q: "How to add a newborn child or spouse to an existing Smart Card?",
    a: "Log in to tnpds.gov.in using the cardholder's registered mobile number and OTP. Select 'Add Member' (உறுப்பினரைச் சேர்க்க), enter the member's Aadhaar number and relationship, upload the Birth Certificate (for children under 5) or Aadhaar copy with marriage certificate (for spouse), and submit. Processing takes approximately 7 to 15 days."
  },
  {
    q: "How to check if my family is eligible for Kalaignar Magalir Urimai Thogai (₹1,000/month)?",
    a: "The woman head of the family listed on the Smart Ration Card is eligible if the family annual income is below ₹2.5 Lakhs, annual domestic electricity consumption is below 3,600 units (300 units/month average), and land holding is under 5 acres (wetland) or 10 acres (dryland). Status can be enquired at taluk offices or the CM Helpline at 1100."
  },
  {
    q: "What is the official helpline number for ration shop (PDS) complaints in Tamil Nadu?",
    a: "For biometric fingerprint issues, short-weight complaints, or non-supply of essential commodities (rice, sugar, oil, dal), contact the Civil Supplies Consumer Protection Department toll-free helpline at 1967 or 1800-425-5901."
  }
];

export default function TnpdsSmartCardPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TNPDS_FAQS.map((faq) => ({
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
    name: "How to Check Smart Ration Card Application Status on TNPDS",
    description: "Step-by-step guide to verify live smart ration card progress and card services online.",
    step: [
      {
        "@type": "HowToStep",
        name: "Step 1: Open the Official TNPDS Portal",
        text: "Visit the Tamil Nadu Public Distribution System official website at https://www.tnpds.gov.in.",
      },
      {
        "@type": "HowToStep",
        name: "Step 2: Navigate to Card Related Service Status",
        text: "On the right sidebar of the homepage, locate the Citizen Services (மின்னணு அட்டை தொடர்பான சேவைகள்) menu and select 'Card Related Service Status'.",
      },
      {
        "@type": "HowToStep",
        name: "Step 3: Enter Reference Number",
        text: "Type the 7-digit Reference Number that was sent to your registered mobile number upon submitting your application.",
      },
      {
        "@type": "HowToStep",
        name: "Step 4: View Live Verification Status",
        text: "Click 'Submit'. The screen will display the real-time stage of your application: Document Verification, Inspection, ASO Approval, or Card Printed for Dispatch.",
      },
    ],
  };

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Government Schemes & Welfare", href: "/category/government-schemes" },
    { name: "TNPDS Smart Ration Card Status", href: "/tnpds-smart-ration-card-status" },
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
            <div className="bg-gradient-to-br from-indigo-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Civil Supplies & Consumer Protection (2026)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                TNPDS Smart Ration Card Status & Services Guide
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/80 mt-2 max-w-2xl leading-relaxed">
                Step-by-step verification guide for smart card applications, family member additions, mobile number linkages, and Kalaignar Magalir Urimai Thogai status across Tamil Nadu.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-indigo-800/60">
                <a
                  href="https://www.tnpds.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/30 transition text-xs font-bold text-white group"
                >
                  <span className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span>Open TNPDS Official Portal</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition" />
                </a>

                <a
                  href="tel:1967"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 transition text-xs font-bold text-white group"
                >
                  <span className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-blue-400" />
                    <span>PDS Toll-Free Helpline: 1967</span>
                  </span>
                  <span className="text-[10px] bg-blue-500/30 px-2 py-0.5 rounded text-blue-200">24x7</span>
                </a>
              </div>
            </div>

            {/* Core Services Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                Essential Smart Card Services & How to Apply
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    Add Family Member (உறுப்பினர் சேர்க்க)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Log in with registered mobile OTP on tnpds.gov.in. Upload Birth Certificate for children or Aadhaar copy for adults. Card will update within 15 working days.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    Change Mobile Number & Address
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Update your linked mobile number or modify residence address online. An SMS confirmation will be sent upon approval by the Assistant Supply Officer.
                  </p>
                </div>
              </div>

              {/* Kalaignar Magalir Urimai Section */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Kalaignar Magalir Urimai Thogai (KMUT ₹1,000/Month) Guide</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  The ₹1,000 monthly financial grant is deposited directly into bank accounts linked to the female family head on the Smart Card. If your payment was rejected or stopped, visit the nearest e-Sevai centre or Revenue Taluk Office with Aadhaar, Smart Card, and Electricity Consumer Number to file an appeal before the Revenue Divisional Officer (RDO).
                </p>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                Frequently Asked Questions (TNPDS FAQs)
              </h3>
              <div className="space-y-3">
                {TNPDS_FAQS.map((faq, index) => (
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
              currentSlug="tnpds-smart-ration-card-status"
              extraLinks={[
                {
                  title_en: "Patta Chitta & Land Records Online Status",
                  title_ta: "பட்டா சிட்டா ஆன்லைன் சரிபார்ப்பு",
                  href: "/patta-chitta-online-status"
                },
                {
                  title_en: "e-Sevai Certificates Checklist & Fees",
                  title_ta: "இ-சேவை சான்றிதழ்கள் கட்டண விவரம்",
                  href: "/esevai"
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
