"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText, Shield, AlertTriangle, Scale, Lock,
  ChevronDown, ChevronUp, CheckCircle2, Search,
  ExternalLink, Mail, Phone, Sparkles, Building2,
  Camera, Info, Users
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery } from "@tanstack/react-query";
import { getSettingsMap } from "@/services/admin/settings";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

const TERMS_CHAPTERS = [
  {
    num: "1",
    id: "acceptance-of-terms",
    icon: Scale,
    en: "Acceptance of Terms & Legal Binding",
    ta: "விதிமுறைகளை ஏற்றுக்கொள்ளல்",
    summary_en: "By browsing or registering on VizhiTN, you enter into a legally binding agreement to follow these platform terms.",
    summary_ta: "VizhiTN தளத்தை அணுகுவதன் அல்லது பதிவு செய்வதன் மூலம் இந்த சேவை விதிமுறைகளை நீங்கள் சட்டப்பூர்வமாக ஒப்புக்கொள்கிறீர்கள்.",
    content_en: "By accessing, browsing, registering, or contributing content to VizhiTN at vizhitn.in, you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable laws of India. If you do not agree to every provision of these terms, you must immediately terminate access to the platform. These terms apply equally to all visitors, registered citizens, community moderators, and municipal representatives.",
    content_ta: "vizhitn.in முகவரியில் இயங்கும் VizhiTN ஐ அணுகுவதன், உலாவும்போது, பதிவு செய்யும் போது அல்லது உள்ளடக்கத்தை சமர்ப்பிக்கும் போது, இந்த சேவை விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை நீங்கள் முழுமையாக ஏற்றுக்கொள்கிறீர்கள். இந்த விதிகளுடன் உடன்படவில்லை எனில், தளத்தை பயன்படுத்துவதை உடனடியாக நிறுத்த வேண்டும்."
  },
  {
    num: "2",
    id: "non-governmental-status",
    icon: Building2,
    en: "Independent Platform — Non-Governmental Disclaimer",
    ta: "சுதந்திரமான தளம் — அரசு சாரா அறிவிப்பு",
    summary_en: "VizhiTN is an independent citizen proof platform. We are NOT an official agency of the Government of Tamil Nadu or Government of India.",
    summary_ta: "VizhiTN என்பது ஒரு சுதந்திரமான குடிமைப் பதிவுத் தளமாகும்; தமிழ்நாடு அரசு அல்லது இந்திய அரசின் அதிகாரப்பூர்வ பிரதிநிதி அல்ல.",
    content_en: "VizhiTN is an independent, community-driven civic technology and citizen reporting platform. VIZHITN IS NOT AFFILIATED WITH, ENDORSED BY, OR AN OFFICIAL ORGAN OF THE GOVERNMENT OF TAMIL NADU, THE GOVERNMENT OF INDIA, OR ANY LOCAL MUNICIPAL CORPORATION, PANCHAYAT, OR HIGHWAY AUTHORITY. Civic Receipts and incident posts published on VizhiTN represent persistent citizen evidence for community transparency and civic audit; they do NOT constitute formal statutory filings, RTI petitions, or legal police complaints unless formally forwarded to official portals (such as CM Helpline 1100, GCC 1913, or e-District).",
    content_ta: "VizhiTN என்பது ஒரு சுதந்திரமான, பொதுமக்கள் இயக்கத்தால் முன்னெடுக்கப்படும் தொழில்நுட்பத் தளமாகும். VizhiTN தமிழ்நாடு அரசு, இந்திய அரசு அல்லது எந்தவொரு உள்ளூர் மாநகராட்சி அல்லது பஞ்சாயத்தின் அதிகாரப்பூர்வ அமைப்போ அல்லது பிரதிநிதியோ அல்ல. இங்கு வெளியிடப்படும் பதிவுகள் பொது வெளிப்படைத்தன்மைக்கான ஆதாரங்கள் ஆகும்; அவை அதிகாரப்பூர்வ அரசு மனுக்கள் அல்ல."
  },
  {
    num: "3",
    id: "content-integrity-anti-deepfake",
    icon: Camera,
    en: "Content Integrity & Prohibition of Fake Evidence / Deepfakes",
    ta: "உள்ளடக்க உண்மைத் தன்மை & போலி ஆதாரங்கள் தடை",
    summary_en: "Uploading AI-generated fake potholes, manipulated images, or fabricated civic incidents is strictly illegal and will lead to an immediate ban.",
    summary_ta: "செயற்கை நுண்ணறிவு (AI) மூலம் உருவாக்கப்பட்ட போலி படங்கள் அல்லது சித்தரிக்கப்பட்ட புகார்களை பதிவிடுவது முற்றிலும் தடைசெய்யப்பட்டுள்ளது.",
    content_en: "To maintain unquestioned credibility for municipal resolution, all published civic reports must reflect real-world physical ground realities. You strictly agree NOT to post:",
    content_ta: "அரசுத் துறைகள் நடவடிக்கை எடுக்கும் வகையில் நம்பகத்தன்மையைப் பராமரிக்க, அனைத்து புகார்களும் உண்மை நிலவரத்தை பிரதிபலிக்க வேண்டும். பின்வருவனவற்றை பதிவிடக்கூடாது:",
    items_en: [
      "AI-generated, digitally altered, or manipulated images simulating road defects, drainage leaks, or infrastructure failures.",
      "Recycled or historical photos from other years or other states/countries falsely presented as current Tamil Nadu incidents.",
      "Fabricated emergency alerts, fake weather forecasts, or false school holiday notices not backed by District Collector circulars.",
      "Malicious submissions intended to damage community trust or artificially influence local municipal elections."
    ],
    items_ta: [
      "AI மூலம் உருவாக்கப்பட்ட அல்லது டிஜிட்டல் முறையில் மாற்றப்பட்ட போலி சாலைப் பள்ளங்கள் மற்றும் சேத படங்கள்.",
      "பிற மாநிலங்கள் அல்லது பழைய ஆண்டுகளின் படங்களை தற்போதைய தமிழ்நாடு சம்பவங்கள் என தவறாக சித்தரித்தல்.",
      "மாவட்ட ஆட்சியரால் அறிவிக்கப்படாத போலி பள்ளி விடுமுறை அல்லது போலி புயல் எச்சரிக்கைகள்.",
      "சமூக அமைதியைக் குலைக்கும் அல்லது தேர்தல்களை தவறாக திசைதிருப்பும் நோக்கிலான பதிவுகள்."
    ]
  },
  {
    num: "4",
    id: "defamation-and-doxxing",
    icon: Shield,
    en: "Defamation, Harassment & Anti-DOXXing Standards",
    ta: "அவதூறு, தனிநபர் தாக்குதல் & தனியுரிமை வரம்பு",
    summary_en: "Reports must focus strictly on physical public infrastructure defects. Personal attacks against individual staff or private homes are prohibited.",
    summary_ta: "புகார்கள் பொது உள்கட்டமைப்பு குறைபாடுகள் மீது மட்டுமே இருக்க வேண்டும்; தனிநபர் ஊழியர்கள் அல்லது இல்லங்கள் மீதான தாக்குதல் தடை செய்யப்பட்டுள்ளது.",
    content_en: "VizhiTN is built to fix roads, water pipes, streetlights, and power transformers — NOT to run personal vendettas. You agree NOT to publish personal identifying data (DOXXing) such as personal mobile numbers, home addresses, or private family details of lower-level government workers, private contractors, or neighbors. Reports targeting private property disputes or marital/family discord will be removed immediately under our Content Moderation SLA.",
    content_ta: "VizhiTN பொது வசதிகளை சரிசெய்வதற்காக உருவாக்கப்பட்டது; தனிநபர் பகைமைக்கு அல்ல. கீழ்நிலை அரசு ஊழியர்கள், ஒப்பந்ததாரர்கள் அல்லது அண்டை வீட்டார்களின் தனிப்பட்ட தொலைபேசி எண்கள் அல்லது வீட்டு முகவரிகளை வெளியிட்டு அச்சுறுத்தக்கூடாது. தனிநபர் சொத்து தகராறுகள் தொடர்பான புகார்கள் உடனடியாக நீக்கப்படும்."
  },
  {
    num: "5",
    id: "civic-receipts-licensing",
    icon: FileText,
    en: "Civic Receipts & Public Interest Licensing",
    ta: "குடிமை ரசீதுகள் & பொது நல உரிமம்",
    summary_en: "You retain authorship of your photos, while granting VizhiTN a perpetual public license to display and index them for civic transparency.",
    summary_ta: "உங்கள் புகைப்படங்களின் பதிப்புரிமை உங்களுக்கே சொந்தம்; பொது நலனுக்காக அவற்றை வெளியிட VizhiTN க்கு உலகளாவிய உரிமத்தை வழங்குகிறீர்கள்.",
    content_en: "You retain ownership of the original text, photos, and video clips you submit to VizhiTN. However, by uploading content to our public feed or district portals, you grant VizhiTN a worldwide, royalty-free, perpetual, and non-exclusive license to format, display, distribute, archive, and syndicate the content to civic authorities, research bodies, search engines, and news media in the public interest of community infrastructure resolution.",
    content_ta: "நீங்கள் சமர்ப்பிக்கும் புகைப்படங்கள் மற்றும் உரையின் உரிமை உங்களுக்கே சொந்தமானது. இருப்பினும், அவற்றை பொதுவெளியில் வெளியிடுவதன் மூலம், நகராட்சி அதிகாரிகள், ஊடகங்கள் மற்றும் தேடுபொறிகள் காணும் வகையில் ஆவணப்படுத்த VizhiTN க்கு உலகளாவிய, இலவச உரிமத்தை வழங்குகிறீர்கள்."
  },
  {
    num: "6",
    id: "emergency-helplines-disclaimer",
    icon: AlertTriangle,
    en: "Emergency Desks & Helplines Non-Liability Disclaimer",
    ta: "அவசர எண்கள் & பொறுப்பு மறுப்பு",
    summary_en: "VizhiTN is an informational directory, NOT an emergency dispatch service. For life-threatening emergencies, dial 112, 108, or 1912 immediately.",
    summary_ta: "VizhiTN என்பது ஒரு தகவல் தளமாகும்; அவசர கால கட்டுப்பாட்டு அறை அல்ல. உயிருக்கு ஆபத்தான நிலையில் 112, 108, 1912 ஐ நேரடியாக அழைக்கவும்.",
    content_en: "The emergency phone numbers (112, 108, 1912, 1930, 1070, 1077) and first-aid SOP guides hosted on VizhiTN are compiled from verified official Government of Tamil Nadu and Central directives. VIZHITN DOES NOT OPERATE EMERGENCY DISPATCH VANS, AMBULANCES, OR POLICE VEHICLES. In any active life-or-death crisis, road accident, fire, or live-wire electrocution, you must dial emergency cellular lines directly. VizhiTN disclaims all liability for telecom network outages, delayed departmental responses, or hospital bed unavailability.",
    content_ta: "தளத்தில் உள்ள அவசர எண்கள் (112, 108, 1912, 1930, 1070) மற்றும் முதலுதவி வழிகாட்டிகள் அரசு வழிகாட்டுதலின்படி தொகுக்கப்பட்டவை. VizhiTN ஆம்புலன்ஸ் அல்லது மீட்பு வாகனங்களை நேரடியாக இயக்குவதில்லை. விபத்து, தீ அல்லது மின்கம்பி ஆபத்தின் போது அரசு எண்களை நேரடியாக அழைக்கவும். தொலைத்தொடர்பு தாமதங்களுக்கு தளம் பொறுப்பாகாது."
  },
  {
    num: "7",
    id: "bribe-tracker-terms",
    icon: Lock,
    en: "Anonymous Bribe Tracker Terms of Use",
    ta: "லஞ்சக் கண்காணிப்பு பயன்பாட்டு விதிமுறைகள்",
    summary_en: "Bribe reports must reflect genuine departmental extortion demands. Fabricating bribe claims against named individuals is prohibited.",
    summary_ta: "லஞ்சப் பதிவுகள் உண்மை அனுபவத்தின் அடிப்படையில் இருக்க வேண்டும்; தனிநபர்களை குறிவைத்து பழிவாங்கும் நோக்கில் புனையப்படக்கூடாது.",
    content_en: "The Bribe Tracker (/bribe-tracker) enables citizens to record regional bribery demands anonymously. Reports must describe the department, public office location, and amount demanded. Users agree NOT to submit defamatory accusations against named individual officers, personal vendetta entries, or fabricated corruption claims. While anonymous to the public, abusive spam attempts violating Indian law may be blocked at network boundary firewalls.",
    content_ta: "லஞ்சக் கண்காணிப்பு தளம் பொதுமக்கள் தங்களுக்கு ஏற்பட்ட லஞ்சக் கோரிக்கைகளை அநாமதேயமாக பதிவு செய்ய உதவுகிறது. துறை, அலுவலக இருப்பிடம் மற்றும் தொகையை மட்டுமே குறிப்பிட வேண்டும். தனிநபர் அதிகாரிகளின் பெயர்களை வெளியிட்டு அவதூறு பரப்பக்கூடாது. சட்டத்தை மீறும் ஸ்பேம் பதிவுகள் தடுக்கப்படும்."
  },
  {
    num: "8",
    id: "local-listings-terms",
    icon: Users,
    en: "Local Listings & Service Directory Terms",
    ta: "உள்ளூர் வணிகங்கள் & சேவைகள் பயன்பாட்டு விதிகள்",
    summary_en: "VizhiTN connects citizens directly with neighbourhood technicians with zero commission. We do not warranty third-party commercial workmanship.",
    summary_ta: "உள்ளூர் சேவை நபர்களை நேரடியாக இணைக்கிறோம்; எந்த கமிஷனும் வசூலிப்பதில்லை. அவர்களின் பணித் தரத்திற்கு தளம் பொறுப்பேற்காது.",
    content_en: "The Local Listings directory (/local-listings) connects citizens directly with neighbourhood service professionals (electricians, plumbers, water suppliers). VizhiTN charges zero commission and acts solely as an open directory. We do not employ or guarantee the workmanship, punctuality, pricing, or licenses of listed independent technicians. Citizens are advised to exercise standard commercial prudence before hiring.",
    content_ta: "உள்ளூர் சேவைப் பட்டியல் எலக்ட்ரீசியன், பிளம்பர் போன்ற நபர்களை நேரடியாக பொதுமக்களுடன் இணைக்கிறது. இதில் எந்தவித இடைத்தரகர் கமிஷனும் இல்லை. இருப்பினும், அந்த நபர்களின் பணித் தரம், கட்டணம் அல்லது சான்றிதழ்களுக்கு VizhiTN பொறுப்பேற்காது; பொதுமக்கள் உரிய விழிப்புணர்வுடன் செயல்பட வேண்டும்."
  },
  {
    num: "9",
    id: "moderation-and-suspension",
    icon: Shield,
    en: "Content Moderation, Trust Scores & Account Termination",
    ta: "தணிக்கை நடவடிக்கைகள் & கணக்கு முடக்கம்",
    summary_en: "We reserve the right to remove false posts, downgrade community trust scores, or permanently ban malicious accounts.",
    summary_ta: "போலி பதிவுகளை நீக்கவும், தவறான நடத்தை கொண்ட பயனர் கணக்குகளை நிரந்தரமாக முடக்கவும் தளத்திற்கு முழு உரிமை உண்டு.",
    content_en: "VizhiTN employs community verification algorithms, automated spam filters, and human editorial oversight. Every registered user maintains a community Trust Score. Users who submit verified, helpful civic reports earn trust badges. Accounts that repeatedly post unverified rumors, abusive messages, or commercial spam will see their Trust Score drop and face immediate suspension or permanent device termination.",
    content_ta: "தளத்தின் நம்பகத்தன்மையை பாதுகாக்க சமுதாய சரிபார்ப்பு மற்றும் ஆசிரியர் குழு மேற்பார்வை செயல்படுகிறது. உண்மைப் புகார்களை இடுவோரின் நம்பிக்கை மதிப்பு (Trust Score) உயரும். போலி வதந்திகள் அல்லது ஸ்பேம் இடும் கணக்குகள் எச்சரிக்கையின்றி நிரந்தரமாக முடக்கப்படும்."
  },
  {
    num: "10",
    id: "limitation-of-liability",
    icon: AlertTriangle,
    en: "Limitation of Liability & Warranty Disclaimers",
    ta: "பொறுப்பு வரம்பு & உத்தரவாத மறுப்பு",
    summary_en: "The platform is provided 'as-is'. We are not liable for municipal inaction, technical outages, or user content accuracy.",
    summary_ta: "தளம் 'உள்ளவாறே' வழங்கப்படுகிறது. அரசுத் துறைகளின் தாமதம் அல்லது தொழில்நுட்ப பிழைகளுக்கு தளம் பொறுப்பல்ல.",
    content_en: "To the maximum extent permitted by applicable Indian laws, VizhiTN, its operators, contributors, and technical hosts shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your access to or inability to use the platform. We provide no express or implied warranty regarding the timeliness of municipal road repairs or the accuracy of community-submitted claims.",
    content_ta: "இந்தியச் சட்டங்களின்படி, தளத்தைப் பயன்படுத்துவதால் அல்லது பயன்படுத்த முடியாமல் போவதால் ஏற்படும் எந்தவொரு இழப்புகளுக்கும் VizhiTN நிர்வாகம் பொறுப்பாகாது. அரசுத் துறைகள் நடவடிக்கை எடுக்கும் கால அவகாசத்திற்கு நாங்கள் உத்தரவாதம் அளிக்க முடியாது."
  },
  {
    num: "11",
    id: "it-rules-compliance",
    icon: Scale,
    en: "IT Rules 2021 Compliance & Grievance Redressal",
    ta: "தகவல் தொழில்நுட்ப விதிகள் 2021 & குறைதீர்ப்பு முறை",
    summary_en: "We comply with India's Intermediary Guidelines. Statutory content grievances are acknowledged within 24 hours.",
    summary_ta: "இந்தியாவின் தகவல் தொழில்நுட்ப விதிகளின்படி புகார்கள் 24 மணி நேரத்திற்குள் ஏற்கப்பட்டு உரிய தீர்வு காணப்படும்.",
    content_en: "In compliance with Rule 3 of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, any citizen, property owner, or authority aggrieved by content on VizhiTN may submit a statutory grievance to our Resident Grievance Officer at grievance@vizhitn.in. Grievances are acknowledged within 24 hours and disposed of within 15 calendar days in accordance with the law.",
    content_ta: "தகவல் தொழில்நுட்ப விதிகள் 2021 இன் கீழ், தளத்தில் உள்ள ஏதேனும் ஒரு பதிவினால் பாதிக்கப்பட்ட எவரும் grievance@vizhitn.in வழியாக மனு அளிக்கலாம். மனுக்கள் 24 மணி நேரத்திற்குள் ஏற்கப்பட்டு 15 நாட்களுக்குள் சட்டப்படி தீர்வு காணப்படும்."
  },
  {
    num: "12",
    id: "governing-law-jurisdiction",
    icon: Building2,
    en: "Governing Law & Exclusive Tamil Nadu Jurisdiction",
    ta: "நிர்வகிக்கும் சட்டம் & தமிழக நீதிமன்ற அதிகார வரம்பு",
    summary_en: "These terms are governed exclusively by Indian law, with jurisdiction vested in the courts of Tamil Nadu.",
    summary_ta: "இந்த விதிமுறைகள் இந்தியச் சட்டங்களின்படி நிர்வகிக்கப்படுகின்றன; தமிழக நீதிமன்றங்களின் அதிகார வரம்பிற்கு உட்பட்டவை.",
    content_en: "These Terms of Service are governed by, construed, and enforced in accordance with the substantive laws of the Republic of India. Any legal dispute, arbitration, or statutory claim arising out of or in connection with VizhiTN shall be subject to the exclusive jurisdiction of the competent civil courts located in Tamil Nadu, India.",
    content_ta: "இந்த சேவை விதிமுறைகள் இந்தியக் குடியரசின் சட்டங்களின்படி நிர்வகிக்கப்படுகின்றன. தளம் தொடர்பான ஏதேனும் சட்ட தகராறுகள் ஏற்பட்டால், அவை தமிழ்நாட்டில் உள்ள தகுதிவாய்ந்த நீதிமன்றங்களின் பிரத்யேக அதிகார வரம்பிற்கு உட்பட்டவை."
  }
];

export default function TermsOfService() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState({ "1": true, "2": true, "3": true });

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  const contactEmail = settings.support_email || settings.contact_email || "support@vizhitn.in";
  const grievanceEmail = settings.grievance_email || "grievance@vizhitn.in";

  usePageMeta({
    title: "Terms of Service | VizhiTN — Citizen Charter & Platform Governance",
    description: "Read the official terms governing civic proof reporting, anti-deepfake standards, emergency disclaimers, and IT Rules 2021 compliance across Tamil Nadu.",
    canonical: "https://www.vizhitn.in/terms",
  });

  const toggleSection = (num) => {
    setOpenSections(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const expandAll = () => {
    const all = {};
    TERMS_CHAPTERS.forEach(c => { all[c.num] = true; });
    setOpenSections(all);
  };

  const collapseAll = () => {
    setOpenSections({});
  };

  const filteredChapters = useMemo(() => {
    if (!searchQuery) return TERMS_CHAPTERS;
    const q = searchQuery.toLowerCase().trim();
    return TERMS_CHAPTERS.filter(c =>
      c.en.toLowerCase().includes(q) ||
      c.ta.toLowerCase().includes(q) ||
      c.summary_en.toLowerCase().includes(q) ||
      c.summary_ta.toLowerCase().includes(q) ||
      (c.content_en && c.content_en.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── HERO BANNER ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold mb-3">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              {T("PUBLIC CIVIC PROOF STANDARD • IT RULES 2021 COMPLIANT", "குடிமக்கள் சாசனம் • IT விதிகள் 2021")}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              {T("Terms of Service & Citizen Charter", "VizhiTN சேவை விதிமுறைகள் & சாசனம்")}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed mb-6">
              {T(
                "These terms govern how citizen grievances are recorded, verified, and archived across Tamil Nadu. Review our non-governmental scope, strict anti-deepfake integrity rules, and grievance redressal commitments.",
                "குடிமைப் புகார்கள் எவ்வாறு பதிவு செய்யப்படுகின்றன, போலி ஆதாரங்கள் மீதான தடைகள் மற்றும் தளம் எவ்வாறு நிர்வகிக்கப்படுகிறது என்பதை இந்த விதிமுறைகள் வரையறுக்கின்றன."
              )}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-3 border-t border-white/10 flex-wrap">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {T("Non-Governmental Civic Proof", "அரசு சாரா குடிமை ஆவணம்")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold text-rose-400">
                <AlertTriangle className="w-4 h-4" /> {T("Zero Tolerance for Deepfakes", "போலி புகைப்படங்கள் தடை")}
              </span>
              <span>•</span>
              <span className="text-slate-400">
                📅 {T("Effective: October 2026", "நடைமுறை: அக்டோபர் 2026")}
              </span>
            </div>
          </div>
        </div>

        {/* ── SEARCH & CONTROLS TOOLBAR ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={T(
                "Search terms (e.g. defamation, deepfakes, emergency, liability)...",
                "தேடுங்கள் (அவதூறு, போலி படங்கள், அவசர எண்கள், பொறுப்பு)..."
              )}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={expandAll}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
            >
              {T("Expand All", "அனைத்தையும் திற")}
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={collapseAll}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
            >
              {T("Collapse All", "அனைத்தையும் மூடு")}
            </button>
            <span className="text-slate-300">|</span>
            <Link
              href="/privacy-policy"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {T("Privacy Policy →", "தனியுரிமைக் கொள்கை →")}
            </Link>
          </div>
        </div>

        {/* ── 2-COLUMN MAIN CHAPTERS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT 1 COLUMN: STICKY CHAPTER JUMP LIST (DESKTOP) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-2 mb-2">
                {T("LEGAL CLAUSES", "சட்டப் பிரிவுகள்")}
              </span>
              {TERMS_CHAPTERS.map((chap) => (
                <a
                  key={chap.num}
                  href={`#clause-${chap.num}`}
                  className="block px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors line-clamp-1"
                >
                  §{chap.num}. {T(chap.en, chap.ta)}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT 3 COLUMNS: DETAILED CHAPTER CARDS */}
          <div className="lg:col-span-3 space-y-4">
            {filteredChapters.map((chapter) => {
              const Icon = chapter.icon;
              const isOpen = openSections[chapter.num] ?? true;

              return (
                <div
                  key={chapter.num}
                  id={`clause-${chapter.num}`}
                  className="scroll-mt-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs transition-all"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleSection(chapter.num)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                        §{chapter.num}
                      </span>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                          {T(chapter.en, chapter.ta)}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {T(chapter.summary_en, chapter.summary_ta)}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      {/* Plain English summary */}
                      <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl p-4 flex items-start gap-3 mt-4">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                            {T("KEY LEGAL TAKEAWAY", "முக்கிய சாரம்சம்")}
                          </span>
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            {T(chapter.summary_en, chapter.summary_ta)}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      {chapter.content_en && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {T(chapter.content_en, chapter.content_ta)}
                        </p>
                      )}

                      {/* Bullet Items */}
                      {chapter.items_en && (
                        <ul className="space-y-2 pt-1">
                          {(lang === "ta" ? chapter.items_ta : chapter.items_en).map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                              <span className="text-rose-600 dark:text-rose-400 font-bold flex-shrink-0">✕</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Official Intermediary Redressal Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  IT RULES 2021 STATUTORY DESK
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {T("Legal Notice or Grievance Appeal?", "சட்டப்பூர்வ அறிவிப்பு அல்லது குறைதீர்ப்பு மனுவா?")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                  {T(
                    "Serve formal statutory notices or dispute resolution petitions to our Resident Grievance Officer in Chennai, Tamil Nadu.",
                    "சட்டப்பூர்வ அறிவிப்புகள் மற்றும் குறைதீர்ப்பு மனுக்களை எங்கள் தலைமை குறைதீர்ப்பு அதிகாரிக்கு அனுப்பலாம்."
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={`mailto:${grievanceEmail}`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {grievanceEmail}
                </a>
                <Link
                  href="/contact"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {T("Contact Desk →", "தொடர்பு மையம் →")}
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Universal Cross-Links */}
        <UniversalCrossLinks pageType="support" />
      </div>
    </div>
  );
}
