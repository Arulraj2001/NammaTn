import React, { useState } from "react";
import { Zap, Droplets, CreditCard, AlertTriangle, Ambulance, FileText, ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const ALL_GUIDES = [
  {
    id: "power-cut",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    title_en: "Power Cut in your area",
    title_ta: "உங்கள் பகுதியில் மின் தடை",
    steps_en: [
      "Check if it's just your home — verify the main switch/MCB hasn't tripped.",
      "Check TANGEDCO's outage map at tnebltd.org to see if there's a planned shutdown.",
      "Call TANGEDCO complaint number: 94987 94987 (metro areas) or 1912 (rural).",
      "WhatsApp complaint: 98403 98403 with your Service Connection (SC) number.",
      "Raise it on VizhiTN so your neighbours can upvote and escalate together.",
    ],
    steps_ta: [
      "முதலில் உங்கள் வீட்டு மின் சர்க்யூட் பிரேக்கர் (MCB) சரிபார்க்கவும்.",
      "திட்டமிட்ட நிறுத்தம் உள்ளதா என tnebltd.org இல் சரிபார்க்கவும்.",
      "TANGEDCO புகார் எண்: 94987 94987 (நகரம்) அல்லது 1912 (கிராமம்) அழைக்கவும்.",
      "WhatsApp: 98403 98403 உங்கள் SC எண்ணுடன் புகார் அனுப்பவும்.",
      "VizhiTN இல் பதிவிட்டு அண்டை வீட்டினரையும் இணைக்கவும்.",
    ],
    contacts: [{ label: "TANGEDCO Helpline", number: "1912" }, { label: "Metro Complaint", number: "94987 94987" }],
    portal: "https://www.tnebltd.org",
    portal_label_en: "TNEB Portal",
    portal_label_ta: "TNEB இணையதளம்",
  },
  {
    id: "water-supply",
    icon: Droplets,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    title_en: "Water Supply not available",
    title_ta: "குடிநீர் வழங்கல் இல்லை",
    steps_en: [
      "Check if your overhead tank is empty — sometimes supply comes at odd hours.",
      "Contact CMWSSB (Chennai) or TWAD Board (rest of TN) for your area's schedule.",
      "CMWSSB helpline: 044-45674567 (Chennai residents).",
      "TWAD helpline: 044-28592828 or visit twad.tn.gov.in.",
      "For emergency water tanker (Chennai): request via CMWSSB portal.",
    ],
    steps_ta: [
      "முதலில் உங்கள் மேற்கூரை தொட்டி காலியாக உள்ளதா சரிபார்க்கவும்.",
      "உங்கள் பகுதியின் நீர் அட்டவணைக்கு CMWSSB அல்லது TWAD தொடர்பு கொள்ளுங்கள்.",
      "CMWSSB உதவி: 044-45674567 (சென்னை குடியிருப்பாளர்கள்).",
      "TWAD உதவி: 044-28592828 அல்லது twad.tn.gov.in செல்லுங்கள்.",
      "அவசர நீர் டேங்கருக்கு CMWSSB இணையதளம் மூலம் கோரிக்கை அனுப்புங்கள்.",
    ],
    contacts: [{ label: "CMWSSB (Chennai)", number: "044-45674567" }, { label: "TWAD Board", number: "044-28592828" }],
    portal: "https://www.chennaimetrowater.tn.gov.in",
    portal_label_en: "CMWSSB Portal",
    portal_label_ta: "CMWSSB இணையதளம்",
  },
  {
    id: "ration-card",
    icon: CreditCard,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    title_en: "Ration Card issue",
    title_ta: "குடும்ப அட்டை சிக்கல்",
    steps_en: [
      "Visit tnpds.gov.in to check your ration card status and update mobile number.",
      "For a new ration card: apply at tnesevai.tn.gov.in or your nearest e-Sevai centre.",
      "For Aadhaar seeding: visit tnpds.gov.in > Update Aadhaar.",
      "For allocation issues: contact your local Taluk Supply Office.",
      "Helpline: 1967 (PDS Consumer Care).",
    ],
    steps_ta: [
      "tnpds.gov.in ல் உங்கள் குடும்ப அட்டை நிலை மற்றும் மொபைல் எண் புதுப்பிக்கவும்.",
      "புதிய குடும்ப அட்டை: tnesevai.tn.gov.in அல்லது அருகிலுள்ள e-Sevai மையம் செல்லுங்கள்.",
      "ஆதார் இணைப்பு: tnpds.gov.in > Update Aadhaar.",
      "ஒதுக்கீடு பிரச்சினைகள்: உங்கள் வட்டார வழங்கல் அலுவலகத்தை தொடர்பு கொள்ளுங்கள்.",
      "உதவி எண்: 1967 (PDS நுகர்வோர் பராமரிப்பு).",
    ],
    contacts: [{ label: "PDS Helpline", number: "1967" }],
    portal: "https://www.tnpds.gov.in",
    portal_label_en: "TN PDS Portal",
    portal_label_ta: "TN PDS இணையதளம்",
  },
  {
    id: "bribery",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    title_en: "Bribery at a Govt Office",
    title_ta: "அரசு அலுவலகத்தில் லஞ்சம்",
    steps_en: [
      "Do NOT pay. Ask for the officer's name, designation, and department in writing.",
      "Record the conversation on your phone if safe to do so (legal in TN for self-protection).",
      "Call Anti-Corruption Helpline 1064 (DVAC, available 24×7).",
      "File online at vigilance.tn.gov.in — your identity is protected.",
      "File an RTI at rtionline.gov.in asking why your service is being delayed.",
      "Also report on VizhiTN — community exposure helps.",
    ],
    steps_ta: [
      "லஞ்சம் கொடுக்காதீர்கள். அதிகாரியின் பெயர், பதவி, துறை கேளுங்கள்.",
      "பாதுகாப்பாக இருந்தால் உரையாடலை உங்கள் மொபைலில் பதிவு செய்யுங்கள் (TN சட்டம் அனுமதிக்கிறது).",
      "ஊழல் தடுப்பு உதவி 1064 (DVAC, 24×7) அழைக்கவும்.",
      "vigilance.tn.gov.in ல் ஆன்லைனில் புகார் அளிக்கவும் — அடையாளம் பாதுகாக்கப்படும்.",
      "ஏன் சேவை தாமதமாகிறது என்று rtionline.gov.in ல் RTI கோரிக்கை அனுப்புங்கள்.",
      "VizhiTN இலும் பதிவிடுங்கள் — சமூக அழுத்தம் பயனுள்ளது.",
    ],
    contacts: [{ label: "DVAC Helpline", number: "1064" }, { label: "CM Grievance", number: "1100" }],
    portal: "https://vigilance.tn.gov.in",
    portal_label_en: "DVAC Portal",
    portal_label_ta: "DVAC இணையதளம்",
  },
  {
    id: "ambulance",
    icon: Ambulance,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    title_en: "Medical Emergency",
    title_ta: "மருத்துவ அவசர நிலை",
    steps_en: [
      "Call 108 immediately — free GVK EMRI ambulance, available 24×7 across Tamil Nadu.",
      "If cardiac/stroke: call 112 (integrated emergency) for the fastest response.",
      "CMCHIS card holders get free treatment up to ₹5 lakh at empanelled hospitals.",
      "For mental health crisis: iCall helpline 9152987821.",
      "Know your nearest govt hospital: use the CMCHIS hospital finder at cmchis.com.",
    ],
    steps_ta: [
      "108 அழையுங்கள் — இலவச GVK EMRI ஆம்புலன்ஸ், தமிழ்நாடு முழுவதும் 24×7.",
      "இதய நோய்/பக்கவாதம்: விரைவான உதவிக்கு 112 அழைக்கவும்.",
      "CMCHIS அட்டை வைத்திருப்பவர்கள் அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் ₹5 லட்சம் வரை இலவச சிகிச்சை.",
      "மனநல நெருக்கடி: iCall 9152987821.",
      "அருகிலுள்ள அரசு மருத்துவமனை: cmchis.com ல் மருத்துவமனை தேடுங்கள்.",
    ],
    contacts: [{ label: "Free Ambulance", number: "108" }, { label: "Emergency", number: "112" }],
    portal: "https://www.cmchis.com",
    portal_label_en: "CMCHIS Portal",
    portal_label_ta: "CMCHIS இணையதளம்",
  },
  {
    id: "scheme",
    icon: FileText,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    title_en: "Apply for a Govt Scheme",
    title_ta: "அரசு திட்டத்திற்கு விண்ணப்பிக்க",
    steps_en: [
      "Visit myscheme.gov.in — enter your details to see all schemes you qualify for.",
      "Most TN schemes are applied at tnesevai.tn.gov.in or nearest e-Sevai / CSC centre.",
      "Keep ready: Aadhaar, ration card, income certificate, bank passbook, community certificate.",
      "For Kalaignar Magalir Urimai Thogai: register at kmut.tn.gov.in or nearest ration shop.",
      "Track application status online with your acknowledgement number.",
    ],
    steps_ta: [
      "myscheme.gov.in செல்லுங்கள் — உங்கள் விவரங்கள் உள்ளிட்டு தகுதியான திட்டங்களை காணுங்கள்.",
      "பெரும்பாலான TN திட்டங்கள் tnesevai.tn.gov.in அல்லது e-Sevai / CSC மையத்தில் விண்ணப்பிக்கலாம்.",
      "ஆதார், குடும்ப அட்டை, வருமான சான்று, வங்கி பாஸ்புக், சமூக சான்று தயார் வைத்திருங்கள்.",
      "கலைஞர் மகளிர் உரிமை தொகை: kmut.tn.gov.in அல்லது ரேஷன் கடையில் பதிவு செய்யுங்கள்.",
      "உங்கள் ஒப்புகை எண் மூலம் விண்ணப்ப நிலையை கண்காணிக்கவும்.",
    ],
    contacts: [{ label: "myScheme", number: "— Online only" }],
    portal: "https://www.myscheme.gov.in",
    portal_label_en: "myScheme Portal",
    portal_label_ta: "myScheme இணையதளம்",
  },
];

export default function AwarenessGuidesPage() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [openId, setOpenId] = useState(null);

  usePageMeta({
    title: "Citizen Guides — What To Do | VizhiTN",
    description: "Step-by-step guides for Tamil Nadu citizens: power cut, water supply, ration card, bribery reporting, medical emergency, government scheme application.",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/awareness" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> {T("Back to Awareness", "விழிப்புணர்வுக்கு திரும்பு")}
      </Link>

      <div className="mb-7">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {T("What To Do If... — Citizen Guides", "என்ன செய்ய வேண்டும்... — குடிமக்கள் வழிகாட்டிகள்")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {T("Step-by-step action guides for common civic problems in Tamil Nadu.", "தமிழ்நாட்டில் பொதுவான குடிமக்கள் பிரச்சினைகளுக்கான படிப்படியான வழிகாட்டுதல்.")}
        </p>
      </div>

      <div className="space-y-4">
        {ALL_GUIDES.map((guide) => {
          const Icon = guide.icon;
          const isOpen = openId === guide.id;
          const steps = T(guide.steps_en, guide.steps_ta);
          return (
            <div key={guide.id} id={guide.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : guide.id)}
                className="w-full flex items-center justify-between p-5 text-left gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${guide.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                    {T(guide.title_en, guide.title_ta)}
                  </h2>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <ol className="space-y-2.5 mb-5">
                    {steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>

                  <div className="flex flex-wrap gap-2">
                    {guide.contacts.map((c) => (
                      <a
                        key={c.number}
                        href={c.number.includes("Online") ? "#" : `tel:${c.number.replace(/[\s-]/g, "")}`}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        📞 {c.label}: {c.number}
                      </a>
                    ))}
                    <a
                      href={guide.portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      🌐 {T(guide.portal_label_en, guide.portal_label_ta)}
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
