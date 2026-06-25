import React from "react";
import { Phone, Shield, AlertTriangle, Users, Heart, BookOpen, Zap, Droplets, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const EMERGENCY_DATA = [
  {
    category_en: "Universal Emergency",
    category_ta: "அனைத்து அவசர நிலைகள்",
    icon: Phone,
    color: "bg-red-600",
    entries: [
      { name_en: "Integrated Emergency Response (Police, Fire, Ambulance)", name_ta: "ஒருங்கிணைந்த அவசர உதவி", number: "112", desc_en: "Single number for all emergencies — fastest response", desc_ta: "அனைத்து அவசர நிலைகளுக்கும் ஒரே எண் — விரைவான பதில்" },
    ],
  },
  {
    category_en: "Police & Law",
    category_ta: "காவல் & சட்டம்",
    icon: Shield,
    color: "bg-blue-600",
    entries: [
      { name_en: "Tamil Nadu Police", name_ta: "தமிழ்நாடு காவல் துறை", number: "100", desc_en: "Crime, theft, harassment, missing person", desc_ta: "குற்றம், திருட்டு, துன்புறுத்தல், காணாமல் போனவர்" },
      { name_en: "Women Helpline", name_ta: "பெண்கள் உதவி எண்", number: "181", desc_en: "Violence, harassment, domestic abuse (24×7)", desc_ta: "வன்முறை, துன்புறுத்தல், குடும்ப வன்கொடுமை (24×7)" },
      { name_en: "Cyber Crime Helpline", name_ta: "இணையதள குற்ற உதவி", number: "1930", desc_en: "Online fraud, UPI scam, digital crime", desc_ta: "ஆன்லைன் மோசடி, UPI மோசடி, டிஜிட்டல் குற்றங்கள்" },
    ],
  },
  {
    category_en: "Fire & Rescue",
    category_ta: "தீயணைப்பு & மீட்பு",
    icon: AlertTriangle,
    color: "bg-orange-600",
    entries: [
      { name_en: "Fire & Rescue Services", name_ta: "தீயணைப்பு சேவை", number: "101", desc_en: "Fire accidents, building collapse, rescue", desc_ta: "தீ விபத்து, கட்டிடம் சரிவு, மீட்பு" },
      { name_en: "Disaster Management", name_ta: "பேரிடர் மேலாண்மை", number: "1070", desc_en: "Floods, cyclones, major disasters", desc_ta: "வெள்ளம், புயல், பெரிய பேரிடர்கள்" },
    ],
  },
  {
    category_en: "Medical & Health",
    category_ta: "மருத்துவம் & சுகாதாரம்",
    icon: Heart,
    color: "bg-pink-600",
    entries: [
      { name_en: "Free Ambulance (GVK EMRI)", name_ta: "இலவச ஆம்புலன்ஸ் (GVK EMRI)", number: "108", desc_en: "Emergency medical transport — Free of cost, 24×7", desc_ta: "அவசர மருத்துவ வாகனம் — இலவசம், 24×7" },
      { name_en: "Mobile Health Unit", name_ta: "மொபைல் சுகாதார பிரிவு", number: "104", desc_en: "Mobile health services, medicines, telemedicine", desc_ta: "மொபைல் சுகாதார சேவை, மருந்துகள், டெலிமெடிசின்" },
      { name_en: "Childline India", name_ta: "குழந்தை உதவி எண்", number: "1098", desc_en: "Child abuse, missing child, child labour (24×7)", desc_ta: "குழந்தை துன்புறுத்தல், காணாமல் போனவர், குழந்தை தொழிலாளர் (24×7)" },
    ],
  },
  {
    category_en: "Public Services",
    category_ta: "பொது சேவைகள்",
    icon: BookOpen,
    color: "bg-green-600",
    entries: [
      { name_en: "CM Grievance Cell", name_ta: "முதலமைச்சர் புகார் மையம்", number: "1100", desc_en: "Government service complaints, corruption (24×7)", desc_ta: "அரசு சேவை புகார்கள், ஊழல் (24×7)" },
      { name_en: "Anti-Corruption (DVAC)", name_ta: "ஊழல் தடுப்பு பிரிவு (DVAC)", number: "1064", desc_en: "Bribery, corruption at government offices", desc_ta: "அரசு அலுவலகங்களில் லஞ்சம், ஊழல்" },
      { name_en: "Consumer Helpline", name_ta: "நுகர்வோர் உதவி எண்", number: "1915", desc_en: "Defective products, overpricing, service issues", desc_ta: "குறைபாடுள்ள பொருட்கள், அதிக விலை, சேவை பிரச்சினைகள்" },
      { name_en: "Senior Citizen Helpline", name_ta: "மூத்த குடிமக்கள் உதவி", number: "14567", desc_en: "Elder care, abuse, financial assistance", desc_ta: "முதியோர் பராமரிப்பு, துன்புறுத்தல், நிதி உதவி" },
    ],
  },
  {
    category_en: "Utilities",
    category_ta: "பயன்பாட்டு சேவைகள்",
    icon: Zap,
    color: "bg-yellow-600",
    entries: [
      { name_en: "TANGEDCO Complaint (Metro)", name_ta: "TANGEDCO புகார் (மாநகர்)", number: "94987 94987", desc_en: "Power outage, meter issues in urban areas", desc_ta: "மின்தடை, மீட்டர் பிரச்சினைகள் — நகர்ப்புறம்" },
      { name_en: "TANGEDCO (Rural)", name_ta: "TANGEDCO (கிராமம்)", number: "1912", desc_en: "Power outage, meter issues in rural areas", desc_ta: "மின்தடை, மீட்டர் பிரச்சினைகள் — கிராமம்" },
      { name_en: "CMWSSB Water (Chennai)", name_ta: "CMWSSB நீர் (சென்னை)", number: "044-45674567", desc_en: "Water supply issues in Chennai corporation", desc_ta: "சென்னையில் குடிநீர் வழங்கல் பிரச்சினைகள்" },
    ],
  },
];

export default function AwarenessEmergencyPage() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  usePageMeta({
    title: "Emergency Helpline Numbers Tamil Nadu | NammaTN234",
    description: "Complete list of Tamil Nadu emergency helpline numbers — Police 100, Ambulance 108, Women Helpline 181, Fire 101, CM Grievance 1100 and more.",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link to="/awareness" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> {T("Back to Awareness", "விழிப்புணர்வுக்கு திரும்பு")}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {T("Emergency Helpline Numbers", "அவசர உதவி எண்கள்")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {T("Tamil Nadu — verified official numbers", "தமிழ்நாடு — சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ எண்கள்")}
            </p>
          </div>
        </div>

        {/* Quick 112 banner */}
        <div className="bg-red-600 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 mt-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-red-100">{T("Any emergency? Dial:", "அவசர நிலையில்:")}</p>
            <p className="text-4xl font-bold tracking-wider">112</p>
            <p className="text-sm text-red-200">{T("Integrated Emergency — connects Police, Fire & Ambulance", "ஒருங்கிணைந்த அவசர சேவை — காவல், தீ & ஆம்புலன்ஸ்")}</p>
          </div>
          <a href="tel:112" className="bg-white text-red-600 font-bold px-6 py-3 rounded-xl text-lg hover:bg-red-50 transition-colors flex-shrink-0">
            📞 {T("Call 112", "112 அழைக்க")}
          </a>
        </div>
      </div>

      {/* Categories */}
      {EMERGENCY_DATA.map((cat) => {
        const Icon = cat.icon;
        return (
          <div key={cat.category_en} className="mb-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color}`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              {T(cat.category_en, cat.category_ta)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.entries.map((entry) => (
                <div
                  key={entry.number}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <a
                    href={`tel:${entry.number.replace(/\s/g, "")}`}
                    className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-base transition-colors min-w-[80px] text-center"
                  >
                    {entry.number}
                  </a>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">
                      {T(entry.name_en, entry.name_ta)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {T(entry.desc_en, entry.desc_ta)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
        {T(
          "All numbers verified from official Tamil Nadu & Central Government sources. For life-threatening emergencies always call 112.",
          "அனைத்து எண்களும் அதிகாரப்பூர்வ தமிழ்நாடு & மத்திய அரசு மூலங்களிலிருந்து சரிபார்க்கப்பட்டவை. உயிர் அச்சுறுத்தும் சூழலில் எப்போதும் 112 அழைக்கவும்."
        )}
      </p>
    </div>
  );
}
