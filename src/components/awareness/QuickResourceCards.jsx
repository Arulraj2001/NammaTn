import React from "react";
import { Phone, Shield, Globe, FileText } from "lucide-react";
import { Link } from "react-router-dom";

// Real Tamil Nadu emergency numbers and resources
const RESOURCES = [
  {
    id: "emergency",
    icon: Phone,
    headerColor: "bg-red-50 dark:bg-red-900/20",
    iconColor: "bg-red-100 text-red-600 dark:bg-red-800/40 dark:text-red-400",
    borderColor: "border-red-100 dark:border-red-900/30",
    title_en: "Emergency Numbers",
    title_ta: "அவசர எண்கள்",
    subtitle_en: "For urgent help in Tamil Nadu",
    subtitle_ta: "தமிழ்நாட்டில் அவசர உதவிக்கு",
    items_en: [
      "112 — Integrated Emergency (Police / Fire / Ambulance)",
      "100 — Police",
      "101 — Fire & Rescue Services",
      "108 — Free Ambulance (GVK EMRI)",
      "181 — Women Helpline",
      "1098 — Childline India",
    ],
    items_ta: [
      "112 — ஒருங்கிணைந்த அவசர உதவி (காவல்/தீ/ஆம்புலன்ஸ்)",
      "100 — காவல் துறை",
      "101 — தீயணைப்பு சேவை",
      "108 — இலவச ஆம்புலன்ஸ் (GVK EMRI)",
      "181 — பெண்கள் உதவி எண்",
      "1098 — குழந்தை உதவி எண்",
    ],
    btn1: { text_en: "View All Numbers", text_ta: "அனைத்து எண்கள்", url: "/awareness/emergency", variant: "secondary" },
    btn2: { text_en: "Emergency Guide", text_ta: "அவசர வழிகாட்டி", url: "/awareness/guides", variant: "primary" },
  },
  {
    id: "rights",
    icon: Shield,
    headerColor: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "bg-blue-100 text-blue-600 dark:bg-blue-800/40 dark:text-blue-400",
    borderColor: "border-blue-100 dark:border-blue-900/30",
    title_en: "Citizen Rights",
    title_ta: "குடிமக்கள் உரிமைகள்",
    subtitle_en: "Know what you are entitled to",
    subtitle_ta: "உங்கள் உரிமைகளை அறிந்துகொள்ளுங்கள்",
    items_en: [
      "Right to Information (RTI Act, 2005)",
      "Right to Education (6–14 years, free & compulsory)",
      "Consumer Rights — 6 fundamental rights",
      "MGNREGA — 100 days guaranteed employment",
      "Right to Food — subsidised ration via PDS",
    ],
    items_ta: [
      "தகவல் உரிமை (RTI சட்டம், 2005)",
      "கல்வி உரிமை (6–14 வயது, இலவசம் & கட்டாயம்)",
      "நுகர்வோர் உரிமைகள் — 6 அடிப்படை உரிமைகள்",
      "MGNREGA — 100 நாட்கள் வேலை உத்தரவாதம்",
      "உணவு உரிமை — மானிய விலையில் ரேஷன்",
    ],
    btn1: { text_en: "Read Rights", text_ta: "உரிமைகள் படிக்க", url: "/awareness/rights", variant: "secondary" },
    btn2: { text_en: "File RTI Online", text_ta: "RTI ஆன்லைனில்", url: "https://rtionline.gov.in", variant: "primary" },
  },
  {
    id: "portals",
    icon: Globe,
    headerColor: "bg-green-50 dark:bg-green-900/20",
    iconColor: "bg-green-100 text-green-600 dark:bg-green-800/40 dark:text-green-400",
    borderColor: "border-green-100 dark:border-green-900/30",
    title_en: "Government Portals",
    title_ta: "அரசு இணையதளங்கள்",
    subtitle_en: "Access official government e-services",
    subtitle_ta: "அதிகாரப்பூர்வ அரசு இ-சேவைகள்",
    items_en: [
      "tnesevai.tn.gov.in — 150+ e-services",
      "tnpds.gov.in — Ration card & PDS",
      "tnebltd.org — Electricity bills & complaints",
      "eservices.tnpolice.gov.in — Police services",
      "cmchis.com — Free health insurance",
    ],
    items_ta: [
      "tnesevai.tn.gov.in — 150+ இ-சேவைகள்",
      "tnpds.gov.in — குடும்ப அட்டை & PDS",
      "tnebltd.org — மின் கட்டணம் & புகார்கள்",
      "eservices.tnpolice.gov.in — காவல் சேவைகள்",
      "cmchis.com — இலவச சுகாதார காப்பீடு",
    ],
    btn1: { text_en: "Open e-Sevai", text_ta: "e-சேவை திற", url: "https://www.tnesevai.tn.gov.in", variant: "secondary" },
    btn2: { text_en: "All Portals", text_ta: "அனைத்து இணையதளங்கள்", url: "/awareness/portals", variant: "secondary" },
  },
  {
    id: "complaint",
    icon: FileText,
    headerColor: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "bg-purple-100 text-purple-600 dark:bg-purple-800/40 dark:text-purple-400",
    borderColor: "border-purple-100 dark:border-purple-900/30",
    title_en: "File a Complaint",
    title_ta: "புகார் அளிக்க",
    subtitle_en: "Grievance channels that work",
    subtitle_ta: "பயனுள்ள புகார் தொடர்பு வழிகள்",
    items_en: [
      "1100 — CM Grievance Cell (24×7)",
      "1930 — Cybercrime Helpline",
      "1064 — Anti-Corruption Helpline",
      "consumer.tn.gov.in — Consumer Forum",
      "pgportal.gov.in — Central Grievances",
    ],
    items_ta: [
      "1100 — முதலமைச்சர் புகார் கலந்தாய்வு (24×7)",
      "1930 — இணையதள குற்றங்கள்",
      "1064 — ஊழல் தடுப்பு உதவி எண்",
      "consumer.tn.gov.in — நுகர்வோர் மன்றம்",
      "pgportal.gov.in — மத்திய புகார்கள்",
    ],
    btn1: { text_en: "CM Grievance Cell", text_ta: "முதலமைச்சர் புகார்", url: "https://cms.tn.gov.in", variant: "secondary" },
    btn2: { text_en: "Track Status", text_ta: "நிலை கண்காணி", url: "https://pgportal.gov.in", variant: "secondary" },
  },
];

export default function QuickResourceCards({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section id="resources" className="mb-10">
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-4">
        <span>🔗</span>
        {T("Quick Resources", "விரைவு வளங்கள்")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {RESOURCES.map((r) => {
          const Icon = r.icon;
          const title = T(r.title_en, r.title_ta);
          const subtitle = T(r.subtitle_en, r.subtitle_ta);
          const items = T(r.items_en, r.items_ta);

          return (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Coloured header */}
              <div className={`px-4 py-3.5 ${r.headerColor} border-b ${r.borderColor}`}>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{title}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>

              {/* Bullet list */}
              <div className="px-4 py-3.5 flex-1">
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-500 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buttons */}
              <div className="px-4 pb-4 flex gap-2 mt-auto flex-wrap">
                {r.btn1 && (
                  <a
                    href={r.btn1.url}
                    target={r.btn1.url.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {T(r.btn1.text_en, r.btn1.text_ta)}
                  </a>
                )}
                {r.btn2 && (
                  <a
                    href={r.btn2.url}
                    target={r.btn2.url.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {T(r.btn2.text_en, r.btn2.text_ta)}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
