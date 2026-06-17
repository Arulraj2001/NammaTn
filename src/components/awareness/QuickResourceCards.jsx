import React, { useState } from "react";
import { Phone, Shield, Globe, FileText, Copy, ExternalLink } from "lucide-react";

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
    items_en: ["Police: 100", "Fire: 101", "Ambulance: 108", "Women Helpline: 1091"],
    items_ta: ["காவல்: 100", "தீயணைப்பு: 101", "ஆம்புலன்ஸ்: 108", "பெண்கள் உதவி: 1091"],
    btn1: { text_en: "Copy Numbers", text_ta: "எண்களை நகலெடு", url: "#", variant: "secondary" },
    btn2: { text_en: "Emergency Guide", text_ta: "அவசர வழிகாட்டி", url: "#", variant: "primary" },
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
    items_en: ["Right to Information (RTI)", "Right to Education", "Consumer Protection", "MGNREGA Benefits"],
    items_ta: ["தகவல் உரிமை (RTI)", "கல்வி உரிமை", "நுகர்வோர் பாதுகாப்பு", "MGNREGA சலுகைகள்"],
    btn1: { text_en: "Read Rights", text_ta: "உரிமைகள் படிக்க", url: "#", variant: "secondary" },
    btn2: { text_en: "Download PDF", text_ta: "PDF பதிவிறக்க", url: "#", variant: "secondary" },
  },
  {
    id: "portals",
    icon: Globe,
    headerColor: "bg-green-50 dark:bg-green-900/20",
    iconColor: "bg-green-100 text-green-600 dark:bg-green-800/40 dark:text-green-400",
    borderColor: "border-green-100 dark:border-green-900/30",
    title_en: "Government Portals",
    title_ta: "அரசு இணையதளங்கள்",
    subtitle_en: "Access official government services",
    subtitle_ta: "அதிகாரப்பூர்வ அரசு சேவைகள்",
    items_en: ["TN e-Sevai Portal", "Ration Card Services", "TN Electricity Board", "CMCHIS Health Scheme"],
    items_ta: ["TN e-Sevai இணையதளம்", "குடும்ப அட்டை சேவைகள்", "TN மின்சார வாரியம்", "CMCHIS சுகாதார திட்டம்"],
    btn1: { text_en: "Open Portal", text_ta: "இணையதளம் திற", url: "https://www.tn.gov.in", variant: "secondary" },
    btn2: { text_en: "How to Use", text_ta: "எப்படி பயன்படுத்துவது", url: "#", variant: "secondary" },
  },
  {
    id: "complaint",
    icon: FileText,
    headerColor: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "bg-purple-100 text-purple-600 dark:bg-purple-800/40 dark:text-purple-400",
    borderColor: "border-purple-100 dark:border-purple-900/30",
    title_en: "File a Complaint",
    title_ta: "புகார் அளிக்க",
    subtitle_en: "Choose the right channel",
    subtitle_ta: "சரியான வழிகாட்டியை தேர்ந்தெடுங்கள்",
    items_en: ["TN Police Online", "Consumer Forum Online", "RTI Online Portal", "CM Grievance Cell"],
    items_ta: ["TN காவல்துறை ஆன்லைன்", "நுகர்வோர் மன்றம் ஆன்லைன்", "RTI ஆன்லைன் இணையதளம்", "முதலமைச்சர் புகார் அலுவலகம்"],
    btn1: { text_en: "Open Complaint", text_ta: "புகார் செய்", url: "#", variant: "secondary" },
    btn2: { text_en: "Track Status", text_ta: "நிலை கண்காணி", url: "#", variant: "secondary" },
  },
];

export default function QuickResourceCards({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [copied, setCopied] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <section id="resources" className="mb-10">
      <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
        <span className="text-blue-500">🔗</span>
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
              {/* Colored header */}
              <div className={`px-5 py-4 ${r.headerColor} border-b ${r.borderColor}`}>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{title}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
              </div>

              {/* Bullet list */}
              <div className="px-5 py-4 flex-1">
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-500 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="px-5 pb-4 flex gap-2 mt-auto flex-wrap">
                {r.btn1 && (
                  <a
                    href={r.btn1.url}
                    className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {T(r.btn1.text_en, r.btn1.text_ta)}
                  </a>
                )}
                {r.btn2 && (
                  <a
                    href={r.btn2.url}
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
