import React, { useState } from "react";
import {
  Globe, Zap, ShieldAlert, FileText, MessageSquare,
  CreditCard, Heart, BookOpen, ExternalLink, Copy,
  Check, ArrowLeft, Search, X
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

// All verified TN government portals
const ALL_PORTALS = [
  {
    id: "esevai",
    icon: Globe,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    category: "services",
    name_en: "TN e-Sevai Portal",
    name_ta: "TN e-சேவை இணையதளம்",
    desc_en: "Access 150+ government services online — birth/death certificate, community certificate, income certificate, land records, licences and more.",
    desc_ta: "பிறப்பு/இறப்பு சான்றிதழ், சமூக சான்றிதழ், வருமான சான்றிதழ், நில பதிவேடுகள் உட்பட 150+ அரசு சேவைகள் ஆன்லைனில்.",
    url: "https://www.tnesevai.tn.gov.in",
    dept_en: "Dept. of e-Governance (TNEGA)",
    dept_ta: "இ-ஆட்சி துறை (TNEGA)",
  },
  {
    id: "tneb",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    category: "utilities",
    name_en: "TANGEDCO / TNEB",
    name_ta: "TANGEDCO / TN மின்சார வாரியம்",
    desc_en: "Pay electricity bills, apply for new connections, track power outages, file complaints, and manage your account online.",
    desc_ta: "மின் கட்டணம் செலுத்துதல், புதிய இணைப்பு விண்ணப்பம், மின் தடை கண்காணிப்பு மற்றும் புகார்கள்.",
    url: "https://www.tnebltd.org",
    dept_en: "TANGEDCO (Tamil Nadu Generation & Distribution Corp.)",
    dept_ta: "TANGEDCO (TN மின்சாரம் உற்பத்தி & விநியோகம்)",
  },
  {
    id: "tnpds",
    icon: CreditCard,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    category: "services",
    name_en: "TN PDS — Ration Card Portal",
    name_ta: "TN PDS — குடும்ப அட்டை இணையதளம்",
    desc_en: "Apply for new ration card, update family members, check PDS allocation, link Aadhaar, and track application status online.",
    desc_ta: "புதிய குடும்ப அட்டை விண்ணப்பம், குடும்ப உறுப்பினர்கள் புதுப்பித்தல், PDS ஒதுக்கீடு சரிபார்க்கவும்.",
    url: "https://www.tnpds.gov.in",
    dept_en: "Civil Supplies & Consumer Protection Dept.",
    dept_ta: "குடிமக்கள் வழங்கல் & நுகர்வோர் பாதுகாப்பு துறை",
  },
  {
    id: "police",
    icon: ShieldAlert,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    category: "police",
    name_en: "TN Police e-Services",
    name_ta: "TN காவல்துறை இ-சேவைகள்",
    desc_en: "File FIR, report cybercrime, apply for character certificate, procession permission, and other police services online.",
    desc_ta: "FIR பதிவு, இணையக் குற்ற புகார், நடத்தை சான்றிதழ் விண்ணப்பம் மற்றும் பிற காவல் சேவைகள்.",
    url: "https://eservices.tnpolice.gov.in",
    dept_en: "Tamil Nadu Police Department",
    dept_ta: "தமிழ்நாடு காவல்துறை",
  },
  {
    id: "cmchis",
    icon: Heart,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    category: "health",
    name_en: "CMCHIS — Health Insurance",
    name_ta: "CMCHIS — சுகாதார காப்பீடு",
    desc_en: "Check CMCHIS eligibility, find empanelled hospitals near you, know covered treatments, and get insurance card details.",
    desc_ta: "CMCHIS தகுதி சரிபார்க்கவும், அருகிலுள்ள அங்கீகரிக்கப்பட்ட மருத்துவமனைகள் கண்டறியுங்கள்.",
    url: "https://www.cmchis.com",
    dept_en: "Health & Family Welfare Dept.",
    dept_ta: "சுகாதார & குடும்ப நலன் துறை",
  },
  {
    id: "rti",
    icon: FileText,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    category: "rights",
    name_en: "RTI Online Portal",
    name_ta: "RTI ஆன்லைன் இணையதளம்",
    desc_en: "File Right to Information (RTI) applications online to any central government department. Track status and receive responses digitally.",
    desc_ta: "எந்தவொரு மத்திய அரசு துறைக்கும் ஆன்லைனில் தகவல் உரிமை (RTI) விண்ணப்பம். நிலை கண்காணிப்பு.",
    url: "https://rtionline.gov.in",
    dept_en: "Department of Personnel & Training (Central Govt.)",
    dept_ta: "ஊழியர் பயிற்சி துறை (மத்திய அரசு)",
  },
  {
    id: "cms",
    icon: MessageSquare,
    color: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    category: "grievance",
    name_en: "CM Grievance Cell (CMS)",
    name_ta: "முதலமைச்சர் புகார் மையம் (CMS)",
    desc_en: "Register public grievances about government services online. Track complaint status using your reference number. Handled within 30-60 days.",
    desc_ta: "அரசு சேவைகள் குறித்த பொது புகார்களை ஆன்லைனில் பதிவு செய்யுங்கள். Reference Number மூலம் நிலை கண்காணிக்கவும்.",
    url: "https://cms.tn.gov.in",
    dept_en: "Chief Minister's Secretariat, Tamil Nadu",
    dept_ta: "முதலமைச்சர் செயலகம், தமிழ்நாடு",
  },
  {
    id: "myscheme",
    icon: BookOpen,
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    category: "services",
    name_en: "myScheme — Scheme Finder",
    name_ta: "myScheme — திட்ட தேடல்",
    desc_en: "Discover all central and state government schemes you are eligible for. Answer a few questions about your profile to get personalised scheme recommendations.",
    desc_ta: "உங்களுக்கு தகுதியான அனைத்து மத்திய மற்றும் மாநில அரசு திட்டங்களை கண்டறியுங்கள்.",
    url: "https://www.myscheme.gov.in",
    dept_en: "Ministry of Electronics & IT (MeitY)",
    dept_ta: "மின்னணு & தகவல் தொழில்நுட்ப அமைச்சகம்",
  },
  {
    id: "pgportal",
    icon: FileText,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    category: "grievance",
    name_en: "PG Portal — Central Grievances",
    name_ta: "PG போர்டல் — மத்திய புகார்கள்",
    desc_en: "Register and track grievances against any central government department or ministry. Monitored by the Prime Minister's Office.",
    desc_ta: "எந்தவொரு மத்திய அரசு துறை அல்லது அமைச்சகத்திற்கு எதிரான புகார்களை பதிவு செய்து கண்காணிக்கவும்.",
    url: "https://pgportal.gov.in",
    dept_en: "Department of Administrative Reforms (DARPG)",
    dept_ta: "நிர்வார சீர்திருத்த துறை (DARPG)",
  },
  {
    id: "tnpsc",
    icon: BookOpen,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    category: "services",
    name_en: "TNPSC — Govt Job Applications",
    name_ta: "TNPSC — அரசு வேலை விண்ணப்பங்கள்",
    desc_en: "Apply for Tamil Nadu Public Service Commission (TNPSC) exams, check notifications, download hall tickets and view results.",
    desc_ta: "TNPSC தேர்வுகளுக்கு விண்ணப்பிக்கவும், அறிவிப்புகள் பார்க்கவும், ஹால் டிக்கெட் பதிவிறக்கவும்.",
    url: "https://www.tnpsc.gov.in",
    dept_en: "Tamil Nadu Public Service Commission",
    dept_ta: "தமிழ்நாடு அரசுப் பணி அமர்வு",
  },
  {
    id: "consumer",
    icon: ShieldAlert,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    category: "rights",
    name_en: "Consumer Grievance — TN",
    name_ta: "நுகர்வோர் புகார் — TN",
    desc_en: "File consumer complaints against businesses, shops, service providers, and manufacturers in Tamil Nadu. Consumer Protection Act 2019.",
    desc_ta: "Tamil Nadu இல் வணிகங்கள், கடைகள், சேவை வழங்குநர்கள் மீது நுகர்வோர் புகார்களை பதிவு செய்யுங்கள்.",
    url: "https://consumer.tn.gov.in",
    dept_en: "Civil Supplies & Consumer Protection Dept.",
    dept_ta: "குடிமக்கள் வழங்கல் & நுகர்வோர் பாதுகாப்பு துறை",
  },
  {
    id: "twad",
    icon: Globe,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
    category: "utilities",
    name_en: "TWAD Board — Water Services",
    name_ta: "TWAD வாரியம் — நீர் சேவைகள்",
    desc_en: "Apply for new water connections, file water supply complaints, track water projects, and manage water-related services.",
    desc_ta: "புதிய நீர் இணைப்பு விண்ணப்பம், குடிநீர் வழங்கல் புகார்கள், நீர் திட்ட கண்காணிப்பு.",
    url: "https://twad.tn.gov.in",
    dept_en: "Tamil Nadu Water Supply & Drainage Board (TWAD)",
    dept_ta: "தமிழ்நாடு நீர்வழங்கல் & வடிகால் வாரியம்",
  },
];

const CATEGORY_FILTERS = [
  { id: "all", label_en: "All Portals", label_ta: "அனைத்து இணையதளங்கள்" },
  { id: "services", label_en: "Government Services", label_ta: "அரசு சேவைகள்" },
  { id: "utilities", label_en: "Utilities", label_ta: "பயன்பாட்டு சேவைகள்" },
  { id: "grievance", label_en: "Grievance / Complaint", label_ta: "புகார் மையங்கள்" },
  { id: "police", label_en: "Police", label_ta: "காவல் துறை" },
  { id: "health", label_en: "Health", label_ta: "சுகாதாரம்" },
  { id: "rights", label_en: "Rights & RTI", label_ta: "உரிமைகள் & RTI" },
];

export default function AwarenessPortalsPage() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  usePageMeta({
    title: "Official Government Portals Tamil Nadu | VizhiTN",
    description: "Complete list of official Tamil Nadu government portals — TN e-Sevai, TNEB, TNPDS, RTI Online, CMS Grievance, CMCHIS, myScheme and more with direct links.",
  });

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filtered = ALL_PORTALS.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name_en.toLowerCase().includes(q) ||
      p.name_ta.includes(q) ||
      p.desc_en.toLowerCase().includes(q) ||
      p.url.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/awareness" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> {T("Back to Awareness", "விழிப்புணர்வுக்கு திரும்பு")}
      </Link>

      <div className="mb-7">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {T("Official Government Portals", "அதிகாரப்பூர்வ அரசு இணையதளங்கள்")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {T(`${ALL_PORTALS.length} verified Tamil Nadu & Central Government portals with direct links.`,
             `${ALL_PORTALS.length} சரிபார்க்கப்பட்ட TN & மத்திய அரசு இணையதளங்கள் — நேரடி இணைப்புகளுடன்.`)}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={T("Search portals...", "இணையதளங்களை தேடுங்கள்...")}
            className="w-full pl-10 pr-9 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 flex-wrap">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                category === c.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-blue-300"
              }`}
            >
              {T(c.label_en, c.label_ta)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        {T(`Showing ${filtered.length} portals`, `${filtered.length} இணையதளங்கள் காட்டப்படுகின்றன`)}
      </p>

      {/* Portal cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{T("No portals found", "இணையதளங்கள் எதுவும் கிடைக்கவில்லை")}</p>
          </div>
        ) : (
          filtered.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${portal.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-1">
                      {T(portal.name_en, portal.name_ta)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {T(portal.dept_en, portal.dept_ta)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                  {T(portal.desc_en, portal.desc_ta)}
                </p>

                {/* URL pill */}
                <p className="text-xs text-blue-500 font-mono mb-3 truncate">
                  {portal.url.replace("https://", "")}
                </p>

                <div className="flex gap-2 mt-auto">
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {T("Open Portal", "இணையதளம் திற")}
                  </a>
                  <button
                    onClick={() => handleCopy(portal.url, portal.id)}
                    title="Copy link"
                    className="flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 rounded-xl text-xs transition-colors"
                  >
                    {copiedId === portal.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === portal.id ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy", "நகல்")}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
