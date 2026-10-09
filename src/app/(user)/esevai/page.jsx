import React from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import EsevaiCertificateFinder from "@/components/tools/EsevaiCertificateFinder";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";

export const metadata = {
  title: "Tamil Nadu e-Sevai Online Services & Certificate Documents Guide (இ-சேவை)",
  description: "Complete 2026 checklist for TNeGA e-Sevai certificates in Tamil Nadu. Apply for Patta Chitta transfer, EC, Legal Heir, Income, Community, and First Graduate certificates with verified ₹60 fees and exact document requirements.",
  alternates: { canonical: "/esevai" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Tamil Nadu e-Sevai Services, Documents & Fee Guide | VizhiTN",
    description: "Step-by-step document checklist and online apply links for Patta Chitta, EC, Legal Heir, Income and Community certificates.",
    url: "/esevai",
    type: "website",
    images: [
      {
        url: "https://www.vizhitn.in/images/evergreen/esevai-guide.jpg",
        width: 1200,
        height: 630,
        alt: "Tamil Nadu e-Sevai Services Guide",
      },
    ],
  },
};

const ESEVAI_FAQS = [
  {
    q: "How much does it cost to apply for certificates on Tamil Nadu e-Sevai?",
    a: "The standard statutory fee prescribed by TNeGA is ₹60 per certificate (REV-101, REV-102, REV-103, REV-104, REV-114). Patta transfer with sub-division involves an additional survey fee of ₹400 (total ₹460). Do not pay cash or extra charges beyond the official e-receipt."
  },
  {
    q: "What is a CAN Number and why is it needed on tnesevai.tn.gov.in?",
    a: "CAN (Citizen Access Number) is a 13-digit unique identification number issued by the Revenue Department. It links your Aadhaar and demographic details so you do not need to repeatedly re-enter family details when applying for multiple certificates."
  },
  {
    q: "How many days does it take to get a Patta or Community certificate?",
    a: "As per the Tamil Nadu Citizen Charter, Community and Income certificates are processed within 7 to 15 working days. Patta transfer without sub-division takes 15 days, while Patta transfer requiring field survey takes up to 30 working days."
  },
  {
    q: "Can I download digitally signed certificates from e-Sevai online?",
    a: "Yes. Once approved by the Tahsildar or Zonal Deputy Tahsildar, a digitally signed certificate equipped with a secure cryptographic QR code can be downloaded from the portal. It is 100% legally valid across all universities and government departments without manual seals."
  }
];

export default function EsevaiPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ESEVAI_FAQS.map(faq => ({
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
          { name: "e-Sevai Guide", href: "/esevai" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Infographic Visual Banner */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 mb-8 bg-slate-900">
          <Image
            src="/images/evergreen/esevai-guide.jpg"
            alt="Tamil Nadu e-Sevai Digital Certificates and Patta Chitta Guide"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <main className="lg:col-span-8">
            <EsevaiCertificateFinder />
          </main>

          <aside className="lg:col-span-4 space-y-6">
            <SidebarRelatedLinks type="article" category="Government Services" currentSlug="tamil-nadu-esevai-online-services-guide" />

            {/* Quick Citizen Helplines Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Government e-Sevai Helplines
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">TNeGA e-Sevai Toll-Free Helpdesk:</span>
                  <a href="tel:1100" className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    1100 / 1800-425-1333
                  </a>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">TNPDS Ration Card Helpline:</span>
                  <a href="tel:1967" className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    1967 (Civil Supplies 24x7)
                  </a>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">TNREGINET Land Registration:</span>
                  <a href="tel:18001025174" className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    1800-102-5174
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Cross Link Footer */}
        <AwarenessRelatedLinks currentSection="article-detail" />
      </div>
    </div>
  );
}
