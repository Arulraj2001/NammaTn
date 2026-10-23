import React from "react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import TnebBillCalculator from "@/components/tools/TnebBillCalculator";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";
import { Zap, HelpCircle, ShieldAlert, BookOpen } from "lucide-react";

export const revalidate = 3600; // 1 hour cache

export const metadata = {
  title: "TNEB Bill Calculator 2026: Tamil Nadu Electricity Domestic Slab Rates & Subsidy Checker (LT-1A)",
  description: "Official TNERC LT-1A domestic electricity bill calculator for Tamil Nadu. Instant bi-monthly calculation with 100 & 200 free units subsidy breakdown, telescopic slab rates, and energy-saving tips across all 38 districts.",
  alternates: {
    canonical: "/tneb-bill-calculator",
    languages: {
      "ta-IN": "https://www.vizhitn.in/tneb-bill-calculator?lang=ta",
      "en-IN": "https://www.vizhitn.in/tneb-bill-calculator?lang=en",
      "x-default": "https://www.vizhitn.in/tneb-bill-calculator",
    },
  },
  keywords: [
    "tneb bill calculator",
    "tamil nadu eb bill calculator",
    "tneb slab rates 2026",
    "eb bill online calculation",
    "tneb 100 units free calculation",
    "tangedco tariff calculator",
    "tnerc domestic tariff lt 1a",
    "eb bill check online tamil nadu",
    "naalai minthadai",
    "inraiya eb bill calculator"
  ],
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
  },
  openGraph: {
    title: "TNEB Bill Calculator 2026 — Tamil Nadu Electricity Slab & Subsidy Tool",
    description: "Check your bi-monthly electricity bill estimate and free subsidy savings under the latest TNERC domestic tariff.",
    url: "/tneb-bill-calculator",
    type: "website",
    images: [
      {
        url: "https://www.vizhitn.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TNEB Electricity Bill Calculator Tamil Nadu",
      },
    ],
  },
};

const TNEB_FAQS = [
  {
    q: "How many free electricity units do domestic consumers get in Tamil Nadu?",
    a: "Under the Tamil Nadu Government subsidized tariff (LT Tariff 1-A), domestic consumers whose total bi-monthly consumption is 500 units or less receive the first 200 units completely free. If consumption exceeds 500 units, the standard subsidy provides the first 100 units free of cost."
  },
  {
    q: "Why does my EB bill jump dramatically after crossing 500 units in Tamil Nadu?",
    a: "Tamil Nadu uses a telescopic slab system with a sharp threshold at 500 units. When your consumption is 500 units, units 101 to 200 are 100% subsidized (free). When you cross into 501 units, you lose the 100-unit enhanced subsidy and enter higher marginal tariff slabs (₹8.40 and ₹9.45/unit), adding nearly ₹700 to the bill for just 1 extra unit."
  },
  {
    q: "How often is domestic electricity billed by TANGEDCO?",
    a: "Domestic electricity in Tamil Nadu is assessed on a bi-monthly cycle (every 60 days). Meter assessors visit residential premises once every two months, record the difference between previous and current meter readings, and compute the bi-monthly telescopic bill."
  },
  {
    q: "Are there any fixed charges for domestic electricity connections in Tamil Nadu?",
    a: "For standard LT Tariff 1-A domestic connections, the Tamil Nadu State Government absorbs 100% of the fixed/service connection charges. Residential consumers only pay for actual consumed units beyond the free subsidy threshold."
  },
  {
    q: "What is the official TANGEDCO Minnalagam helpline for billing or meter complaints?",
    a: "For meter faults, delayed assessment, or irregular bills, citizens can dial the 24x7 Minnalagam customer care center at 1912 or register grievance updates on WhatsApp at 94987 94987."
  }
];

export default function TnebBillCalculatorPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TNEB_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "TNEB Electricity Bill Calculator Tamil Nadu",
    url: "https://www.vizhitn.in/tneb-bill-calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description: "Instant online calculation of Tamil Nadu TNEB bi-monthly domestic electricity bills with free unit subsidy and telescopic slab rates.",
  };

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Electricity", href: "/category/electricity" },
    { name: "TNEB Bill Calculator", href: "/tneb-bill-calculator" },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Main Content Area */}
          <main className="lg:col-span-8 space-y-10">
            {/* Interactive Calculator */}
            <TnebBillCalculator />

            {/* In-depth Educational Guide */}
            <article className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 text-slate-700 dark:text-slate-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  How Tamil Nadu TNEB Electricity Tariff (LT-1A) is Calculated
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Comprehensive reference for domestic consumers under the latest Tamil Nadu Electricity Regulatory Commission (TNERC) order.
                </p>
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <p>
                  Electricity distribution across all 38 districts of Tamil Nadu is administered by <strong>TANGEDCO (Tamil Nadu Power Distribution Corporation)</strong>. Residential households fall under <strong>Low Tension Tariff 1-A (LT-1A)</strong>, which uses a <em>bi-monthly telescopic billing system</em>. Under this system, electricity is not charged at a single flat rate; instead, consumption is divided into successive blocks (slabs), with each block billed at its designated statutory tariff.
                </p>

                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                  1. The Two-Tier Subsidy Model Explained
                </h3>
                <p>
                  To protect lower and middle-income families, the Government of Tamil Nadu provides direct state subsidies:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>Consumers using up to 500 units:</strong> Enjoy <strong>200 units completely free</strong> (100 units standard subsidy + 100 units enhanced government grant). Units between 201 and 400 are billed at an effective rate of ₹4.70/unit, and units between 401 and 500 at ₹6.30/unit.
                  </li>
                  <li>
                    <strong>Consumers using above 500 units:</strong> Retain the <strong>first 100 units free</strong>. Units between 101 and 400 are billed at ₹4.70/unit, 401–500 at ₹6.30/unit, 501–600 at ₹8.40/unit, 601–800 at ₹9.45/unit, 801–1000 at ₹10.50/unit, and above 1000 units at ₹11.55/unit.
                  </li>
                </ul>

                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                  2. Official Domestic Tariff Table (Bi-Monthly)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold">
                      <tr>
                        <th className="p-3">Slab Range</th>
                        <th className="p-3">Total $\le$ 500 Units</th>
                        <th className="p-3">Total &gt; 500 Units</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="p-3 font-semibold">0 – 100 Units</td>
                        <td className="p-3 text-emerald-600 font-bold">FREE (₹0)</td>
                        <td className="p-3 text-emerald-600 font-bold">FREE (₹0)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">101 – 200 Units</td>
                        <td className="p-3 text-emerald-600 font-bold">FREE (₹0)</td>
                        <td className="p-3">₹4.70 / unit</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">201 – 400 Units</td>
                        <td className="p-3">₹4.70 / unit</td>
                        <td className="p-3">₹4.70 / unit</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">401 – 500 Units</td>
                        <td className="p-3">₹6.30 / unit</td>
                        <td className="p-3">₹6.30 / unit</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">501 – 600 Units</td>
                        <td className="p-3 text-slate-400">N/A</td>
                        <td className="p-3 font-semibold text-amber-600">₹8.40 / unit</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">601 – 800 Units</td>
                        <td className="p-3 text-slate-400">N/A</td>
                        <td className="p-3 font-semibold text-rose-600">₹9.45 / unit</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">&gt; 800 Units</td>
                        <td className="p-3 text-slate-400">N/A</td>
                        <td className="p-3 font-semibold text-rose-700">₹10.50 – ₹11.55</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                  Frequently Asked Questions (TNEB Bill FAQs)
                </h3>
                <div className="space-y-3">
                  {TNEB_FAQS.map((faq, index) => (
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
            </article>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <SidebarRelatedLinks
              type="article"
              category="electricity"
              currentSlug="tneb-bill-calculator"
              extraLinks={[
                {
                  title_en: "Today's Power Cut Timings Across TN",
                  title_ta: "இன்றைய மின்தடை அறிவிப்புகள்",
                  href: "/power-cuts-today-tamil-nadu"
                },
                {
                  title_en: "Power Cut Grievance & Compensation Guide",
                  title_ta: "மின் தடை இழப்பீடு வழிகாட்டி",
                  href: "/awareness/guide/power-cut"
                },
                {
                  title_en: "Minnalagam 1912 Helpline Directory",
                  title_ta: "மின்னகம் 1912 உதவி எண்கள்",
                  href: "/helplines"
                }
              ]}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
