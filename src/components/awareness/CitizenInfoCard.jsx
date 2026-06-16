import React from "react";
import { Phone, Globe, Shield, FileText } from "lucide-react";

const RESOURCES = [
  {
    icon: Phone,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    en_title: "Emergency Numbers",
    ta_title: "அவசர தொலைபேசி எண்கள்",
    en_items: ["Police: 100", "Fire: 101", "Ambulance: 108", "Women Helpline: 1091"],
    ta_items: ["காவல்: 100", "தீயணைப்பு: 101", "ஆம்புலன்ஸ்: 108", "பெண்கள் உதவி: 1091"],
  },
  {
    icon: Shield,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    en_title: "Citizen Rights",
    ta_title: "குடிமக்கள் உரிமைகள்",
    en_items: ["Right to Information (RTI)", "Right to Education", "Consumer Protection", "MGNREGA Benefits"],
    ta_items: ["தகவல் அறியும் உரிமை", "கல்வி உரிமை", "நுகர்வோர் பாதுகாப்பு", "மகாத்மா காந்தி நலத்திட்டம்"],
  },
  {
    icon: Globe,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    en_title: "Government Portals",
    ta_title: "அரசு இணையதளங்கள்",
    en_items: ["TN e-Sevai Portal", "Ration Card Services", "TN Electricity Board", "CMCHIS Health Scheme"],
    ta_items: ["தமிழ்நாடு இ-சேவை", "குடும்ப அட்டை சேவை", "மின்சார வாரியம்", "சுகாதாரத் திட்டம்"],
  },
  {
    icon: FileText,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    en_title: "File a Complaint",
    ta_title: "புகார் அளிக்க",
    en_items: ["TN Police Online", "Consumer Forum Online", "RTI Online Portal", "CM Grievance Cell"],
    ta_items: ["காவல் துறை ஆன்லைன்", "நுகர்வோர் நீதிமன்றம்", "தகவல் உரிமை தளம்", "முதலமைச்சர் புகார் அறை"],
  },
];

export default function CitizenInfoCard({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {RESOURCES.map((r) => {
        const Icon = r.icon;
        const items = lang === "ta" ? r.ta_items : r.en_items;
        const title = lang === "ta" ? r.ta_title : r.en_title;
        return (
          <div key={r.en_title} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${r.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-white">{title}</span>
            </div>
            <ul className="space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}