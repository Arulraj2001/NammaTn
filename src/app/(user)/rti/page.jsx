import React from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import RtiDraftGenerator from "@/components/tools/RtiDraftGenerator";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";

export const metadata = {
  title: "Tamil Nadu RTI Application Generator (RTI மாதிரி விண்ணப்பம்)",
  description: "Free interactive RTI Application Builder for Tamil Nadu citizens. Generate legally compliant bilingual (Tamil & English) RTI drafts for Road Quality audits, Patta transfer delays, TANGEDCO power cut logs, and Ration card grievances with 1-click A4 print.",
  alternates: { canonical: "/rti" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Tamil Nadu RTI Application Generator (Online Form Builder) | VizhiTN",
    description: "Generate instant RTI applications for road audits, patta delays, and electricity failures. Bilingual Tamil & English formats.",
    url: "/rti",
    type: "website",
    images: [
      {
        url: "https://www.vizhitn.in/images/evergreen/rti-rights.jpg",
        width: 1200,
        height: 630,
        alt: "Tamil Nadu RTI Application Generator",
      },
    ],
  },
};

const RTI_FAQS = [
  {
    q: "How much is the application fee for filing an RTI in Tamil Nadu?",
    a: "The statutory application fee is ₹10. You can pay this by affixing a ₹10 Court Fee Stamp onto the physical application or enclosing an Indian Postal Order (IPO) payable to the Public Information Officer (PIO). Below-Poverty-Line (BPL) card holders are 100% exempt from all fees."
  },
  {
    q: "How many days does the government have to reply to an RTI query?",
    a: "Under Section 7(1) of the RTI Act 2005, the Public Information Officer (PIO) must furnish information within 30 calendar days from the date of receipt. If the query concerns life or personal liberty, reply must be provided within 48 hours."
  },
  {
    q: "What should I do if the PIO does not reply within 30 days or gives false information?",
    a: "You have the statutory right under Section 19(1) to file a First Appeal to the designated First Appellate Authority (FAA) within 30 days. Filing a First Appeal is completely free of charge. If unsatisfied with the FAA, a Second Appeal can be filed before the Tamil Nadu Information Commission (TNIC)."
  },
  {
    q: "Can I file an RTI in Tamil language?",
    a: "Yes. Section 6(1) of the RTI Act explicitly permits filing applications in English, Hindi, or the official state language (Tamil). Our generator provides verified, legally formatted questions in formal Tamil."
  }
];

export default function RtiPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: RTI_FAQS.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Citizen Rights", href: "/rights" },
          { name: "RTI Application Generator", href: "/rti" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Infographic Visual Banner */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 mb-8 bg-slate-900 print:hidden">
          <Image
            src="/images/evergreen/rti-rights.jpg"
            alt="Tamil Nadu Right to Information Act 2005 Citizen Empowerment Guide"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <main className="lg:col-span-8">
            <RtiDraftGenerator />
          </main>

          <aside className="lg:col-span-4 space-y-6 print:hidden">
            <SidebarRelatedLinks type="right" currentSlug="right-to-information-act-2005" />

            {/* Statutory Legal Notice Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Statutory Legal Provisions
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Under Section 20(1) of the RTI Act 2005, if a Public Information Officer fails to supply information within 30 days without reasonable cause, a penalty of <strong>₹250 per day (up to ₹25,000)</strong> shall be levied directly from the official&apos;s personal salary.
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300">
                <span className="font-bold block mb-1">State Information Commission:</span>
                Tamil Nadu Information Commission (TNIC), No. 19, Government Farm Village, Pernpet, Nandanam, Chennai - 600035.
              </div>
            </div>
          </aside>
        </div>

        {/* Cross Link Footer */}
        <div className="print:hidden">
          <AwarenessRelatedLinks currentSection="right-detail" />
        </div>
      </div>
    </div>
  );
}
