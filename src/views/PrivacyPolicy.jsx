"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Shield, Mail, ExternalLink, ChevronRight, Search,
  Lock, Eye, Database, Trash2, CheckCircle2, AlertTriangle,
  FileText, Sparkles, Scale, Info, Check, Copy, ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery } from "@tanstack/react-query";
import { getSettingsMap } from "@/services/admin/settings";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

const PRIVACY_CHAPTERS = [
  {
    id: "introduction",
    icon: Shield,
    en: "1. Introduction, Scope & Non-Governmental Mission",
    ta: "1. அறிமுகம், நோக்கம் & அரசு சாரா அறிவிப்பு",
    summary_en: "VizhiTN is an independent civic information platform, not an official government entity. We protect citizen rights while enabling transparent community reporting.",
    summary_ta: "VizhiTN என்பது ஒரு சுதந்திரமான குடிமைத் தகவல் தளமாகும். நாங்கள் குடிமக்களின் தனியுரிமையைப் பாதுகாத்து வெளிப்படையான சமூக பதிவுகளை வழங்குகிறோம்.",
    content_en: "VizhiTN (\"we\", \"us\", \"our\", or \"the Platform\"), accessible via vizhitn.in, is an independent, non-governmental civic proof, community reporting, and hyperlocal news initiative covering all 38 districts of Tamil Nadu. This Privacy Policy governs our collection, handling, and safeguarding of personal data when you browse our site, search municipal shutdown timings, submit civic receipts, or participate in community discussions. By accessing or registering on VizhiTN, you agree to the data practices described herein.",
    content_ta: "vizhitn.in என்ற இணைய முகவரியில் இயங்கும் VizhiTN என்பது தமிழ்நாட்டின் 38 மாவட்டங்களையும் உள்ளடக்கிய ஒரு சுதந்திரமான, அரசு சாரா குடிமைப் பதிவு மற்றும் தகவல் தளமாகும். நீங்கள் தளத்தை உலாவும் போது, மின்தடை நேரம் தேடும் போது, குடிமைப் புகார்களைப் பதிவிடும் போது அல்லது விவாதங்களில் ஈடுபடும் போது உங்கள் தரவை நாங்கள் எவ்வாறு பாதுகாக்கிறோம் என்பதை இந்த தனியுரிமைக் கொள்கை விளக்குகிறது.",
  },
  {
    id: "information-collected",
    icon: Database,
    en: "2. Information We Collect (And What We Never Track)",
    ta: "2. நாங்கள் சேகரிக்கும் தகவல்கள் (சேகரிக்கப்படாதவை)",
    summary_en: "We collect basic profile identifiers when you register, plus manual district selections. We NEVER run passive background GPS tracking.",
    summary_ta: "பதிவின் போது பெயர், மின்னஞ்சல் மற்றும் நீங்கள் தேர்வு செய்யும் மாவட்டத்தை மட்டுமே சேகரிக்கிறோம். பின்னணி ஜிபிஎஸ் கண்காணிப்பு ஒருபோதும் செய்யப்படுவதில்லை.",
    items_en: [
      "Account Identity: When registering (via Google OAuth), we receive your display name, email address, and profile photo. We use this to verify authentic accounts, calculate trust scores, and prevent automated spam.",
      "Manual Location Preferences: You select your district (e.g. Chennai, Coimbatore) and neighborhood manually to filter localized power cuts and emergency updates. We do NOT run background device GPS tracking.",
      "Civic Content & Media Uploads: Photos, titles, descriptions, and user-provided GPS pins associated with reported potholes, garbage dumps, or water pipeline leaks.",
      "Technical Server Logs: Standard non-identifying operational logs including IP address (anonymized in analytics), browser user-agent, pages accessed, and request timestamps.",
      "Cookies & Session Tokens: Strictly necessary session tokens to keep you signed in, remember your language preference (English/Tamil), and cache district data."
    ],
    items_ta: [
      "கணக்கு அடையாளம்: கூகுள் உள்நுழைவு மூலம் உங்கள் பெயர், மின்னஞ்சல் மற்றும் சுயவிவரப் படத்தைப் பெறுகிறோம். இது போலி கணக்குகளைத் தடுத்து உண்மைத் தன்மையை உறுதி செய்ய உதவுகிறது.",
      "கைமுறை இருப்பிடத் தேர்வு: உங்கள் மாவட்டம் மற்றும் பகுதியை நீங்களே தேர்வு செய்கிறீர்கள். உங்கள் சாதனத்தின் பின்னணி ஜிபிஎஸ் (GPS) இருப்பிடத்தை நாங்கள் ஒருபோதும் தொடர்ந்து கண்காணிப்பதில்லை.",
      "குடிமைப் பதிவுகள் & படங்கள்: நீங்கள் சமர்ப்பிக்கும் சாலைப் பள்ளங்கள், குப்பை தேக்கம், குடிநீர் குழாய் உடைப்பு தொடர்பான புகைப்படங்கள் மற்றும் இருப்பிடக் குறிப்புகள்.",
      "தொழில்நுட்பப் பதிவுகள்: ஐபி முகவரி (அநாமதேயப்படுத்தப்பட்டது), உலாவி வகை, பார்வையிட்ட பக்கங்கள் மற்றும் நேரப் பதிவுகள்.",
      "குக்கீகள்: நீங்கள் பாதுகாப்பாக உள்நுழைந்திருக்கவும், உங்கள் மொழி விருப்பத்தை (ஆங்கிலம்/தமிழ்) நினைவில் கொள்ளவும் பயன்படும் குக்கீகள்."
    ]
  },
  {
    id: "purpose-limitation",
    icon: Lock,
    en: "3. Purpose Limitation & How We Use Collected Data",
    ta: "3. தரவுப் பயன்பாடு & நோக்க வரம்பு",
    summary_en: "We process your information solely to deliver localized utility alerts, prevent automated spam, and provide civic grievance proof.",
    summary_ta: "மின்தடை மற்றும் குடிமை அறிவிப்புகளை வழங்கவும், போலி பதிவுகளைத் தடுத்து உண்மைத்தன்மையை உறுதி செய்யவும் மட்டுமே தரவு பயன்படுகிறது.",
    items_en: [
      "Hyperlocal Utility Filtering: Delivering tailored power cut timings, local heavy rain advisories, and municipal alerts for your selected district.",
      "Spam & Fraud Prevention: Verifying user authenticity so automated bots and malicious actors cannot flood public ledgers with fake reports.",
      "Civic Evidence Receipts: Attributing citizen-submitted photos of potholes and water leaks to authentic community members to foster government accountability.",
      "Strict No-Sale Guarantee: We never sell, rent, or trade citizen personal data to brokers, telemarketers, or commercial marketing agencies."
    ],
    items_ta: [
      "வட்டார அறிவிப்புகள்: உங்கள் மாவட்டத்திற்கான மின்தடை நேரம், கனமழை எச்சரிக்கைகள் மற்றும் உள்ளூர் நகராட்சி அறிவிப்புகளை வழங்குதல்.",
      "போலி பதிவு தடுப்பு: தானியங்கி போட்கள் மற்றும் விஷமிகள் தவறான அல்லது ஜோடிக்கப்பட்ட புகார்களை வெளியிடுவதைத் தடுத்தல்.",
      "குடிமை ஆதார ரசீதுகள்: பொதுமக்கள் பதிவேற்றும் சாலை, குடிநீர் குறைபாடுகளை உண்மையான குடிமக்களின் நம்பகமான குரலாக அரசுத் துறைகளுக்கு கொண்டு சேர்த்தல்.",
      "தரவு விற்பனை செய்யப்படாது: குடிமக்களின் எந்தவொரு தனிப்பட்ட விவரங்களையும் விளம்பரத் தரகர்களுக்கோ, தொலைபேசி சந்தையாளர்களுக்கோ ஒருபோதும் விற்பனை செய்வதில்லை."
    ]
  },
  {
    id: "emergency-sos-data",
    icon: AlertTriangle,
    en: "4. Community SOS & Emergency Blood Support Privacy",
    ta: "4. அவசர உதவி & ரத்த தான கோரிக்கைகள் தனியுரிமை",
    summary_en: "Contact numbers for blood/ambulance help are displayed ONLY when the citizen explicitly ticks 'Show contact publicly', and can be removed upon resolution.",
    summary_ta: "ரத்த தானம் அல்லது ஆம்புலன்ஸ் உதவி கோரும் போது, பயனர் ஒப்புதல் அளித்தால் மட்டுமே தொலைபேசி எண் பொதுப்பார்வைக்கு காட்டப்படும்.",
    content_en: "On our Community Emergency Help Center (/help), citizens may broadcast urgent requests for blood units (e.g., O+, B-), ambulance navigation, or missing persons. Contact phone numbers provided during SOS submission are displayed publicly ONLY if the user explicitly checks the 'Show contact publicly' checkbox. Once the medical emergency is marked 'Resolved', contact phone numbers are automatically retracted from public view to prevent unsolicited calls.",
    content_ta: "அவசர உதவி மையத்தில் (/help) ரத்த தானம் அல்லது ஆம்புலன்ஸ் உதவி கோரும் போது, பயனர் 'தொடர்பை பகிரங்கமாக காட்டு' என்ற பெட்டியை தேர்வு செய்தால் மட்டுமே தொலைபேசி எண் காட்டப்படும். அந்த அவசர உதவி 'தீர்க்கப்பட்டது' என அறிவிக்கப்பட்டவுடன் தொடர்பு எண்கள் தானாகவே பொதுப்பார்வையில் இருந்து நீக்கப்படும்."
  },
  {
    id: "photo-evidence-privacy",
    icon: Eye,
    en: "5. Photo Evidence & EXIF Location Scrubbing",
    ta: "5. புகைப்பட ஆதாரங்கள் & ஜிபிஎஸ் மெட்டாடேட்டா பாதுகாப்பு",
    summary_en: "We process civic photos to document public road defects while stripping sensitive device identifiers and personal facial markers.",
    summary_ta: "பொது உள்கட்டமைப்பு குறைபாடுகளை பதிவு செய்யும் போது, புகைப்படங்களில் உள்ள தேவையற்ற சாதன விவரங்களை பாதுகாப்பாக கையாள்கிறோம்.",
    content_en: "Photos uploaded to document civic grievances (such as potholes, overflowing storm drains, broken transformers) are stored securely on our content distribution network. We encourage citizens to photograph only public infrastructure and avoid capturing private residential interiors, vehicle number plates, or faces of uninvolved private citizens. If a photo inadvertently captures private property, owners can request an immediate blur or removal under our 6-hour Content Dispute SLA.",
    content_ta: "பொதுப் புகார்களுக்காக பதிவேற்றப்படும் புகைப்படங்கள் எங்கள் பாதுகாப்பான சேவையகங்களில் சேமிக்கப்படுகின்றன. சாலை, தெருவிளக்கு போன்ற பொது இடங்களை மட்டுமே படம்பிடிக்குமாறு அறிவுறுத்துகிறோம். தவறுதலாக தனிநபர் இல்லங்கள் அல்லது வாகன எண்கள் பதிவாகியிருந்தால், எங்களைத் தொடர்பு கொண்டு 6 மணி நேரத்திற்குள் நீக்கக் கோரலாம்."
  },
  {
    id: "google-adsense",
    icon: Sparkles,
    en: "6. Google AdSense, Analytics & Cookie Disclosures",
    ta: "6. Google AdSense, Analytics & குக்கீ அறிவிப்புகள்",
    summary_en: "Third-party ad vendors like Google use cookies to serve non-intrusive ads that sustain our civic infrastructure. You can opt out at any time.",
    summary_ta: "தள செலவுகளை ஈடுகட்ட Google AdSense விளம்பரங்கள் காட்டப்படுகின்றன. நீங்கள் விரும்பினால் தனிப்பயனாக்கப்பட்ட விளம்பரங்களை முடக்கலாம்.",
    content_en: "We display clean, non-intrusive advertisements served by Google AdSense to offset the cost of database servers, map APIs, and newsroom operations. Google uses cookies (such as the DoubleClick cookie) to serve relevant ads based on prior visits to our site or other websites. You may opt out of personalized advertising by visiting Google Ads Settings. We also employ Google Analytics with IP address anonymization enabled so your raw IP address is never stored or processed.",
    content_ta: "சேவையக செலவுகள் மற்றும் வரைபட பயன்பாட்டு கட்டணங்களை ஈடுகட்ட Google AdSense விளம்பரங்கள் காட்டப்படுகின்றன. பயனரின் முந்தைய வருகைகளின் அடிப்படையில் விளம்பரங்களை வழங்க கூகுள் குக்கீகளைப் பயன்படுத்துகிறது. பயனர்கள் Google Ads Settings மூலம் தனிப்பயனாக்கப்பட்ட விளம்பரங்களில் இருந்து விலகலாம்.",
    link: { url: "https://adssettings.google.com", text_en: "Opt out of personalized advertising via Google Ads Settings →", text_ta: "Google Ads Settings மூலம் விளம்பர அமைப்புகளை மாற்ற →" }
  },
  {
    id: "data-storage-supabase",
    icon: Database,
    en: "7. Secure Data Architecture & Encryption (Supabase)",
    ta: "7. பாதுகாப்பான தரவு கட்டமைப்பு & குறியாக்கம் (Supabase)",
    summary_en: "User credentials and civic records are secured with SSL/TLS encryption in transit and AES-256 encryption at rest on enterprise databases.",
    summary_ta: "அனைத்து தரவுகளும் SSL/TLS மற்றும் AES-256 குறியாக்கம் மூலம் மிக பாதுகாப்பாக பராமரிக்கப்படுகின்றன.",
    content_en: "Our databases and authentication mechanisms are hosted on enterprise infrastructure provided by Supabase. All data transmissions are encrypted using Transport Layer Security (TLS 1.3), and stored database records are protected by advanced encryption-at-rest (AES-256). We conduct regular automated vulnerability scans and strict access-control audits.",
    content_ta: "எங்கள் பயனர் தரவுத்தளம் மற்றும் அங்கீகாரச் சேவைகள் Supabase நிறுவனத்தின் பாதுகாப்பான சேவையகங்களில் ஹோஸ்ட் செய்யப்படுகின்றன. அனைத்து தரவுப் பரிமாற்றங்களும் TLS 1.3 குறியாக்கம் மற்றும் AES-256 பாதுகாப்புடன் பராமரிக்கப்படுகின்றன."
  },
  {
    id: "account-deletion",
    icon: Trash2,
    en: "8. Data Retention, Account Deletion & Anonymization",
    ta: "8. தரவு தக்கவைப்பு, கணக்கு நீக்கம் & அநாமதேயமாக்கல்",
    summary_en: "You can permanently delete your account at any time. Personal credentials are completely purged while civic records remain anonymized.",
    summary_ta: "உங்கள் கணக்கை எந்த நேரத்திலும் நீக்கலாம். அடையாள விவரங்கள் நிரந்தரமாக அழிக்கப்படும்; புகார்கள் வரலாற்றுப் பதிவாக அநாமதேயமாக்கப்படும்.",
    content_en: "We retain your personal account identifiers for as long as your profile remains active. If you choose to delete your account, your name, email, and OAuth profile links are permanently expunged from our database. To preserve the historical integrity of municipal civic records, public photos of potholes and community resolution timestamps remain visible, permanently anonymized and credited as 'Deleted Citizen' with zero link to your identity.",
    content_ta: "உங்கள் கணக்கு செயலில் இருக்கும் வரை மட்டுமே உங்கள் விவரங்கள் சேமிக்கப்படும். கணக்கை நீக்கினால் பெயர், மின்னஞ்சல் நிரந்தரமாக அழிக்கப்படும். இருப்பினும் பொது உள்கட்டமைப்பு வரலாற்றைப் பாதுகாக்க, பதிவிடப்பட்ட புகார்கள் 'Deleted Citizen' என அநாமதேயமாக்கப்பட்டு பாதுகாக்கப்படும்."
  },
  {
    id: "dpdpa-rights",
    icon: Scale,
    en: "9. Citizen Statutory Rights under India's DPDPA 2023",
    ta: "9. டிஜிட்டல் தனிநபர் தரவு பாதுகாப்பு சட்டம் 2023 உரிமைகள்",
    summary_en: "Under the Digital Personal Data Protection Act (2023), you hold the right to access, rectify, and erase your personal data.",
    summary_ta: "இந்தியாவின் DPDPA 2023 சட்டத்தின் கீழ் உங்கள் தரவை அணுகவும், திருத்தவும், நீக்கவும் உங்களுக்கு முழு உரிமை உண்டு.",
    items_en: [
      "Right to Access: You may request a machine-readable summary of all personal data associated with your registered email.",
      "Right to Correction: You may rectify outdated names, email addresses, or district tags via your dashboard or by emailing support.",
      "Right to Erasure: You may request the irrevocable deletion of your account and identifying personal records.",
      "Right to Grievance Redressal: You can escalate any data dispute directly to our Resident Grievance Officer, with guaranteed statutory resolution within 30 days."
    ],
    items_ta: [
      "அணுகும் உரிமை: உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சலுடன் தொடர்புடைய தனிப்பட்ட தரவுகளின் நகலைக் கோர உங்களுக்கு உரிமை உண்டு.",
      "திருத்தும் உரிமை: தவறான விவரங்களைத் திருத்துமாறு நீங்கள் உங்கள் கணக்கு அல்லது மின்னஞ்சல் மூலம் கோரலாம்.",
      "நீக்கும் உரிமை: உங்கள் கணக்கு மற்றும் தனிப்பட்ட தரவை நிரந்தரமாக நீக்குமாறு கோரலாம்.",
      "குறைதீர்ப்பு உரிமை: உங்கள் தரவு தொடர்பான எந்தவொரு புகாரையும் எங்கள் குறைதீர்ப்பு அதிகாரியிடம் தெரிவித்து 30 நாட்களுக்குள் தீர்வு பெறலாம்."
    ]
  },
  {
    id: "grievance-contact",
    icon: Mail,
    en: "10. Resident Grievance Officer & Contact Desk",
    ta: "10. குறைதீர்ப்பு அதிகாரி & தொடர்பு விவரங்கள்",
    summary_en: "Contact our Resident Grievance Officer for statutory compliance or privacy disputes. Inquiries are resolved within 24-48 hours. Office: Chennai, Tamil Nadu 600001, India.",
    summary_ta: "தனியுரிமை அல்லது குறைதீர்ப்பு தொடர்பான கேள்விகளுக்கு எங்கள் அதிகாரியை நேரடியாக தொடர்பு கொள்ளலாம். அலுவலகம்: சென்னை, தமிழ்நாடு 600001.",
    content_en: "In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and India's DPDPA 2023, VizhiTN has appointed a dedicated Resident Grievance Officer. For privacy concerns, takedown requests, or data portability requests, write to: vizhitnin@gmail.com. Registered Office Address: VizhiTN Civic Media Desk, Chennai, Tamil Nadu 600001, India. Grievances are acknowledged within 24 hours and resolved within 15 calendar days.",
    content_ta: "தகவல் தொழில்நுட்ப விதிகள் 2021 மற்றும் DPDPA 2023 சட்டத்தின்படி நியமிக்கப்பட்ட எங்கள் குறைதீர்ப்பு அதிகாரியை vizhitnin@gmail.com வழியாக தொடர்பு கொள்ளலாம். பதிவு செய்யப்பட்ட அலுவலக முகவரி: VizhiTN குடிமை செய்தி மையம், சென்னை, தமிழ்நாடு 600001, இந்தியா. மனுக்கள் 24 மணி நேரத்திற்குள் ஏற்கப்பட்டு 15 நாட்களுக்குள் தீர்க்கப்படும்."
  }
];

export default function PrivacyPolicy() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("introduction");

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  const contactEmail = settings.support_email || settings.contact_email || "vizhitnin@gmail.com";
  const grievanceEmail = settings.grievance_email || "vizhitnin@gmail.com";

  usePageMeta({
    title: "Privacy Policy | VizhiTN — Citizen Data Protection & DPDPA Disclosures",
    description: "Read how VizhiTN protects citizen data, enforces zero passive GPS tracking, safeguards whistleblower identity, and complies with India's DPDPA 2023.",
    canonical: "https://www.vizhitn.in/privacy-policy",
  });

  // Filter chapters based on search query
  const filteredChapters = useMemo(() => {
    if (!searchQuery) return PRIVACY_CHAPTERS;
    const q = searchQuery.toLowerCase().trim();
    return PRIVACY_CHAPTERS.filter(c =>
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
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-3">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              {T("CITIZEN DATA PROTECTION CHARTER • DPDPA 2023 COMPLIANT", "குடிமக்கள் தரவுப் பாதுகாப்பு சாசனம் • DPDPA 2023")}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3 text-white">
              {T("VizhiTN Privacy Policy & Data Disclosures", "VizhiTN தனியுரிமைக் கொள்கை & தரவு பாதுகாப்பு")}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed mb-6">
              {T(
                "We believe civic transparency starts with absolute respect for citizen privacy. Discover our zero-passive-tracking guarantee, citizen confidentiality safeguards, and statutory data rights across Tamil Nadu.",
                "குடிமை வெளிப்படைத்தன்மை என்பது மக்களின் தனியுரிமையை மதிப்பதில் தொடங்குகிறது. ஜிபிஎஸ் பின்னணி கண்காணிப்பு இன்மை, பொதுமக்களின் ரகசியத்தன்மை மற்றும் உங்கள் சட்டப்பூர்வ உரிமைகளை அறியுங்கள்."
              )}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-3 border-t border-white/10 flex-wrap">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {T("Zero Passive GPS Tracking", "ஜிபிஎஸ் கண்காணிப்பு இல்லை")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold text-blue-300">
                <Lock className="w-4 h-4" /> {T("DPDPA 2023 Compliant", "DPDPA 2023 பாதுகாப்பு")}
              </span>
              <span>•</span>
              <span className="text-slate-400">
                📅 {T("Effective: October 2026", "நடைமுறை: அக்டோபர் 2026")}
              </span>
            </div>
          </div>
        </div>

        {/* ── SEARCH & TABLE OF CONTENTS TOOLBAR ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={T(
                "Search privacy terms (e.g. GPS, cookies, account, security)...",
                "தேடுங்கள் (குக்கீகள், தனியுரிமை, கணக்கு நீக்குதல், ஜிபிஎஸ்)..."
              )}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 w-full sm:w-auto justify-between sm:justify-end">
            <span>{filteredChapters.length} {T("policy chapters", "பிரிவுகள்")}</span>
            <Link
              href="/terms"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              {T("View Terms of Service →", "சேவை விதிமுறைகள் →")}
            </Link>
          </div>
        </div>

        {/* ── 2-COLUMN MAIN POLICY CONTENT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT 1 COLUMN: STICKY CHAPTER NAVIGATOR (DESKTOP) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-2 mb-2">
                {T("POLICY CHAPTERS", "அத்தியாயங்கள்")}
              </span>
              {PRIVACY_CHAPTERS.map((chap, i) => (
                <a
                  key={chap.id}
                  href={`#${chap.id}`}
                  onClick={() => setActiveSection(chap.id)}
                  className={`block px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors line-clamp-1 ${
                    activeSection === chap.id
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {i + 1}. {T(chap.en.split(". ")[1] || chap.en, chap.ta.split(". ")[1] || chap.ta)}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT 3 COLUMNS: DETAILED POLICY CHAPTERS */}
          <div className="lg:col-span-3 space-y-6">
            {filteredChapters.map((chapter, idx) => {
              const Icon = chapter.icon;
              return (
                <section
                  key={chapter.id}
                  id={chapter.id}
                  className="scroll-mt-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                        {T(chapter.en, chapter.ta)}
                      </h2>
                    </div>
                  </div>

                  {/* "In Plain English" Summary Box */}
                  <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-4 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block mb-0.5">
                        {T("IN PLAIN ENGLISH", "எளிய விளக்கத்தில்")}
                      </span>
                      <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                        {T(chapter.summary_en, chapter.summary_ta)}
                      </p>
                    </div>
                  </div>

                  {/* Body Text */}
                  {chapter.content_en && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {T(chapter.content_en, chapter.content_ta)}
                    </p>
                  )}

                  {/* Bullet Items */}
                  {chapter.items_en && (
                    <ul className="space-y-2.5 pt-2">
                      {(lang === "ta" ? chapter.items_ta : chapter.items_en).map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Link action */}
                  {chapter.link && (
                    <div className="pt-2">
                      <a
                        href={chapter.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {T(chapter.link.text_en, chapter.link.text_ta)}
                      </a>
                    </div>
                  )}
                </section>
              );
            })}

            {/* Statutory Grievance Redressal Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  STATUTORY COMPLIANCE OFFICER
                </span>
                <h3 className="text-lg sm:text-xl font-bold mb-1">
                  {T("Have Questions About Your Personal Data?", "உங்கள் தரவு பற்றிய கேள்விகள் உள்ளதா?")}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  {T(
                    "Contact our dedicated Resident Grievance Officer for data subject requests, photo dispute takedowns, or privacy inquiries.",
                    "புகார் நீக்கம், தரவு நகல் கோரிக்கை அல்லது தனியுரிமை விளக்கங்களுக்கு குறைதீர்ப்பு அதிகாரியை தொடர்பு கொள்ளலாம்."
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={`mailto:${grievanceEmail}`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {grievanceEmail}
                </a>
                <Link
                  href="/contact"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
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
