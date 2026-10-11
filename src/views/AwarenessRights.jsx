"use client";

import React, { useState, useMemo } from "react";
import {
  Shield, Search, FileText, ChevronRight, ExternalLink, ArrowLeft,
  Building, CheckCircle2, HelpCircle, PhoneCall, AlertTriangle, Scale, Copy,
  Check, MessageCircle, AlertOctagon, Sparkles, BookOpen, Clock, X,
  ChevronDown, ShieldAlert, FileQuestion, ArrowRight, Compass, Lightbulb
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import RtiDraftGenerator from "@/components/tools/RtiDraftGenerator";
import { getAllRights } from "@/lib/awarenessServer";

// 5 Interactive Crisis Scenarios (Instant situational legal first-aid)
const CRISIS_SCENARIOS = [
  {
    id: "police-stop",
    emoji: "🚔",
    category: "police",
    tag_en: "Traffic & Detention",
    tag_ta: "போக்குவரத்து & சோதனை",
    title_en: "Stopped by Police / Vehicle Check",
    title_ta: "காவல்துறை வாகன சோதனை & உரிமைகள்",
    clause_en: "CMV Rules Rule 139 & CrPC Sec 46(4)",
    clause_ta: "மோட்டார் வாகன விதிகள் Rule 139 & CrPC பிரிவு 46(4)",
    script_en: "Sir, as per Central Motor Vehicles Rules Rule 139 and official MoRTH circulars, presenting valid RC, DL, and Insurance on DigiLocker or mParivahan has full statutory legal validity. Taking away vehicle ignition keys is not authorized under the Motor Vehicles Act. I am ready to pay any compounding fine directly to an officer of Sub-Inspector rank or above with a valid digital e-Challan receipt.",
    script_ta: "ஐயா, மத்திய மோட்டார் வாகன விதிகள் Rule 139-ன் படி டிஜிலாக்கர் (DigiLocker) மற்றும் mParivahan செயலியில் உள்ள அசல் ஆவணங்கள் சட்டப்படி 100% செல்லுபடியாகும். வாகனச் சாவியைப் பிடுங்குவது விதிகளுக்கு எதிரானது. சப்-இன்ஸ்பெக்டர் அல்லது அதற்கு மேற்பட்ட அதிகாரிக்கு இ-சலான் ரசீதுடன் அபராதம் செலுத்த நான் தயாராக உள்ளேன்.",
    cannot_do_en: [
      "Officers cannot snatch your vehicle keys or physically assault you",
      "Officers below Sub-Inspector (SI) rank cannot collect fines for major violations",
      "Police cannot seize or search your personal phone without a written warrant",
      "Women cannot be arrested between 6 PM (sunset) and 6 AM (sunrise)"
    ],
    cannot_do_ta: [
      "வாகனச் சாவியைப் பிடுங்கவோ, உடலளவில் தாக்கவோ அதிகாரம் இல்லை",
      "சப்-இன்ஸ்பெக்டருக்கு (SI) கீழ் உள்ள காவலர்கள் அபராதம் வசூலிக்க முடியாது",
      "முறையான உத்தரவின்றி தனிப்பட்ட செல்போனை பறிமுதல் செய்ய முடியாது",
      "மாலை 6 மணி முதல் காலை 6 மணி வரை பெண்களை கைது செய்யத் தடை"
    ],
    helpline: "103",
    helpline_name_en: "Traffic Police Desk",
    helpline_name_ta: "போக்குவரத்து காவல்துறை",
    target_slug: "police-vehicle-check-citizen-rights"
  },
  {
    id: "bribe-delay",
    emoji: "🏛️",
    category: "public_service",
    tag_en: "Govt Offices & SLAs",
    tag_ta: "அரசு அலுவலகம் & காலக்கெடு",
    title_en: "Official Demands Bribe or Delays Certificate",
    title_ta: "சான்றிதழ் தாமதம் அல்லது லஞ்சம் கேட்கும் சூழல்",
    clause_en: "TN Citizen Service Charter & Prevention of Corruption Act (Sec 7)",
    clause_ta: "தமிழ்நாடு குடிமக்கள் சாசனம் & ஊழல் தடுப்புச் சட்டம் (பிரிவு 7)",
    script_en: "Sir, under the Tamil Nadu Citizen Charter, the prescribed statutory timeline for this service is 15 days. I have submitted all verified documents. Please provide me the official written daily file notings explaining the statutory delay. Under state zero-tolerance anti-corruption rules, demanding unofficial speed money is a non-bailable offense. I am registering this matter on DVAC Helpline 1064 and CM Helpline 1100.",
    script_ta: "அரசு குடிமக்கள் சாசனத்தின்படி இந்த சான்றிதழுக்கான காலக்கெடு 15 நாட்கள் ஆகும். தேவையான அனைத்து ஆவணங்களும் சமர்ப்பிக்கப்பட்டுள்ளன. தாமதத்திற்கான காரணத்தை எழுத்துப்பூர்வமாக வழங்குங்கள். லஞ்சம் கேட்பது ஊழல் தடுப்புச் சட்டப்படி குற்றமாகும். இதை லஞ்ச ஒழிப்புத் துறை 1064 மற்றும் முதல்வர் உதவி எண் 1100-ல் பதிவு செய்கிறேன்.",
    cannot_do_en: [
      "Staff cannot hold verified applications beyond SLA without a written deficiency memo",
      "Offices cannot demand unofficial cash charges without government treasury receipts",
      "Cannot refuse to receive written applications or decline acknowledgment receipts"
    ],
    cannot_do_ta: [
      "முறையான காரணமின்றி காலக்கெடுவுக்கு மேல் கோப்பை நிலுவையில் வைக்க முடியாது",
      "அரசு ரசீது இன்றி கூடுதல் கட்டணம் அல்லது லஞ்சம் கோர முடியாது",
      "விண்ணப்பங்களை வாங்க மறுக்கவோ ஒப்புகை சீட்டு தர மறுக்கவோ முடியாது"
    ],
    helpline: "1064",
    helpline_name_en: "DVAC Anti-Corruption 24x7",
    helpline_name_ta: "லஞ்ச ஒழிப்புத் துறை",
    target_slug: "right-to-public-services-timebound"
  },
  {
    id: "consumer-cheat",
    emoji: "🛍️",
    category: "consumer",
    tag_en: "Defective Goods & MRP",
    tag_ta: "நுகர்வோர் & மோசடி",
    title_en: "Defective Product, Refused Refund or Overcharging",
    title_ta: "போலி பொருள், கட்டணம் அதிகம் அல்லது ரீபண்ட் மறுப்பு",
    clause_en: "Consumer Protection Act 2019 & Legal Metrology Act (Sec 18)",
    clause_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 & எடைகள் மற்றும் அளவீடுகள் சட்டம்",
    script_en: "As per the Consumer Protection Act 2019, denying replacement or refund for defective merchandise, or charging above the printed Maximum Retail Price (MRP), constitutes an unfair trade practice and deficiency of service. Please process the statutory resolution within 7 days, failing which an online complaint will be filed at the National Consumer Helpline 1915 and e-Daakhil court claiming damages for mental agony.",
    script_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி, குறைபாடுள்ள பொருளை மாற்ற மறுப்பதோ அல்லது MRP-ஐ விட கூடுதலாக விற்பதோ குற்றமாகும். 7 நாட்களுக்குள் பணத்தை திருப்பித் தராவிடில் தேசிய நுகர்வோர் உதவி எண் 1915 மற்றும் இ-தாகீல் நீதிமன்றத்தில் நஷ்டஈடு கேட்டு வழக்கு பதிவு செய்யப்படும்.",
    cannot_do_en: [
      "Shops cannot charge 'chilling charges' above MRP for water or beverages",
      "Stores cannot disclaim responsibility via 'Goods once sold will not be taken back'",
      "E-commerce platforms cannot refuse statutory return for damaged or counterfeit items"
    ],
    cannot_do_ta: [
      "குளிர்ந்த பானங்கள் அல்லது தண்ணீருக்கு MRP-ஐ விட கூடுதலாக வசூலிக்க முடியாது",
      "'விற்ற பொருட்கள் திரும்ப பெறப்பட மாட்டாது' என்ற அறிவிப்பு செல்லாது",
      "ஆன்லைன் நிறுவனங்கள் சேதமடைந்த பொருட்களுக்கான ரீபண்டை மறுக்க முடியாது"
    ],
    helpline: "1915",
    helpline_name_en: "National Consumer Helpline",
    helpline_name_ta: "தேசிய நுகர்வோர் உதவி எண்",
    target_slug: "consumer-protection-rights-2019"
  },
  {
    id: "elderly-neglect",
    emoji: "👴",
    category: "vulnerable",
    tag_en: "Senior Citizens Welfare",
    tag_ta: "மூத்த குடிமக்கள் நலன்",
    title_en: "Senior Parent Abandoned or Property Grabbed",
    title_ta: "பெற்றோரை புறக்கணித்தல் அல்லது சொத்து அபகரிப்பு",
    clause_en: "Maintenance of Parents & Senior Citizens Act 2007 (Sec 23)",
    clause_ta: "மூத்த குடிமக்கள் பராமரிப்பு & நலச் சட்டம் 2007 (பிரிவு 23)",
    script_en: "Under Section 23 of the Senior Citizens Act 2007, any transfer of property made to children is legally conditional upon maintaining the parent. If neglected, the Revenue Divisional Officer (RDO) Maintenance Tribunal has the statutory power to declare the gift deed void, evict abusive occupants in 90 days, and order monthly maintenance allowance. Elderline 14567 coordinates free state intervention.",
    script_ta: "மூத்த குடிமக்கள் நலச் சட்டம் 2007 பிரிவு 23-ன் படி, பெற்றோரை கவனிக்காத பிள்ளைகளுக்கு வழங்கப்பட்ட சொத்து தானப் பத்திரத்தை ரத்து செய்யவும், 90 நாட்களில் அவர்களை வீட்டை விட்டு வெளியேற்றவும் RDO தீர்ப்பாயத்திற்கு அதிகாரம் உண்டு. மாதம் ₹10,000 வரை ஜீவனாம்சமும் பெறலாம். எல்டர்லைன் 14567 மூலம் உடனடி நிவாரணம் பெறலாம்.",
    cannot_do_en: [
      "Adult children cannot evict elderly parents from parent-owned or shared homes",
      "Legal heirs cannot abandon aging parents without providing food and medicine",
      "Children cannot claim unconditional rights over property gifted under care promises"
    ],
    cannot_do_ta: [
      "பெற்றோரின் சொந்த வீட்டை ஆக்கிரமிக்கவோ அவர்களை விரட்டவோ முடியாது",
      "முதியோர்களை மருத்துவ உதவி மற்றும் உணவின்றி கைவிட முடியாது",
      "பராமரிக்காத பிள்ளைகள் தானமாகப் பெற்ற சொத்தில் உரிமை கொண்டாட முடியாது"
    ],
    helpline: "14567",
    helpline_name_en: "Elderline National Toll-Free",
    helpline_name_ta: "முதியோர் தேசிய உதவி எண்",
    target_slug: "senior-citizens-maintenance-act-2007"
  },
  {
    id: "unpaid-overtime",
    emoji: "💼",
    category: "labor",
    tag_en: "Worker Rights & Wages",
    tag_ta: "தொழிலாளர் உரிமை & கூலி",
    title_en: "Forced Overtime or Withheld Minimum Wages",
    title_ta: "கூடுதல் வேலை நேரச் சுரண்டல் & சம்பளக் குறைப்பு",
    clause_en: "TN Shops & Establishments Act (Sec 7 & 9) & Minimum Wages Act",
    clause_ta: "தமிழ்நாடு கடைகள் & நிறுவனங்கள் சட்டம் (பிரிவு 9) & ஊதியச் சட்டம்",
    script_en: "Under Sections 7 and 9 of the Tamil Nadu Shops and Establishments Act, ordinary working hours are capped at 8 hours per day and 48 hours per week. Any additional hour worked must be paid with double overtime wages. Compelling unpaid overtime and denying mandatory weekly rest day are strict statutory violations enforceable by the Inspector of Labour.",
    script_ta: "தமிழ்நாடு கடைகள் மற்றும் நிறுவனங்கள் சட்டம் பிரிவு 9-ன் படி, நாள் ஒன்றுக்கு 8 மணி நேரத்திற்கு மேல் பணிபுரிந்தால் இரட்டிப்பு கூடுதல் நேர ஊதியம் (Double Overtime Wages) வழங்கப்பட வேண்டும். வாரத்தில் ஒரு நாள் கட்டாய ஊதியத்துடன் விடுமுறை அளிக்க வேண்டும். இதனை மீறுவது தொழிலாளர் நல சட்டப்படி குற்றமாகும்.",
    cannot_do_en: [
      "Employers cannot force employees to work beyond 8 hours without double overtime pay",
      "Commercial establishments cannot cancel the mandatory weekly paid rest day",
      "Companies cannot withhold wages or make unauthorized disciplinary salary cuts"
    ],
    cannot_do_ta: [
      "இரட்டிப்பு கூடுதல் ஊதியம் இன்றி 8 மணி நேரத்திற்கு மேல் வேலை வாங்க முடியாது",
      "வாராந்திர கட்டாய ஊதியத்துடன் கூடிய விடுமுறையை ரத்து செய்ய முடியாது",
      "விசாரணையின்றி சம்பளத்தை பிடித்தம் செய்யவோ நிறுத்தி வைக்கவோ முடியாது"
    ],
    helpline: "155214",
    helpline_name_en: "Labour Department Helpline",
    helpline_name_ta: "தொழிலாளர் துறை உதவி எண்",
    target_slug: "right-to-fair-wages-tn-shops-act"
  }
];

// Visual badge & Icon metadata mapping for the 8 statutory acts
const RIGHT_UI_METAS = {
  "right-rti": {
    icon: FileText,
    badgeCls: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    badge_en: "RTI & Transparency",
    badge_ta: "தகவல் உரிமை & வெளிப்படைத்தன்மை",
    category: "transparency"
  },
  "right-consumer": {
    icon: Shield,
    badgeCls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    badge_en: "Consumer Protection",
    badge_ta: "நுகர்வோர் பாதுகாப்பு",
    category: "consumer"
  },
  "right-police-check": {
    icon: Shield,
    badgeCls: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    badge_en: "Police & Legal Defense",
    badge_ta: "காவல்துறை & சட்டப் பாதுகாப்பு",
    category: "police"
  },
  "right-service": {
    icon: Building,
    badgeCls: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    badge_en: "Citizen Charter & SLAs",
    badge_ta: "அரசுச் சேவை உத்தரவாதம்",
    category: "public_service"
  },
  "right-senior-citizen": {
    icon: Shield,
    badgeCls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    badge_en: "Senior Citizens Welfare",
    badge_ta: "மூத்த குடிமக்கள் நலம்",
    category: "vulnerable"
  },
  "right-pwd": {
    icon: Shield,
    badgeCls: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    badge_en: "Disability Equality",
    badge_ta: "மாற்றுத்திறனாளிகள் உரிமை",
    category: "pwd"
  },
  "right-domestic-violence": {
    icon: Shield,
    badgeCls: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    badge_en: "Women Safety & Law",
    badge_ta: "பெண்கள் பாதுகாப்பு & சட்டம்",
    category: "vulnerable"
  },
  "right-labor-minimum-wage": {
    icon: Building,
    badgeCls: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    badge_en: "Labor & Worker Rights",
    badge_ta: "தொழிலாளர் உரிமைகள்",
    category: "labor"
  }
};

// 5 High Impact Myths vs Facts
const CITIZEN_MYTHS = [
  {
    q_en: "Can traffic police take away your vehicle ignition keys during a routine check?",
    q_ta: "வாகன சோதனையின் போது காவலர்கள் உங்கள் வாகனச் சாவியைப் பிடுங்க முடியுமா?",
    answer_en: "NO. Snatching ignition keys or deflating tyres is strictly unlawful under the Motor Vehicles Act and Supreme Court guidelines. Officers are only authorized to ask you to halt and present documents.",
    answer_ta: "முடியாது. வாகனச் சாவியைப் பிடுங்குவது அல்லது டயர் காற்றை இறக்குவது மோட்டார் வாகனச் சட்டப்படி முற்றிலும் சட்டவிரோதமாகும். வாகனத்தை நிறுத்தி ஆவணங்களை மட்டுமே சரிபார்க்க முடியும்."
  },
  {
    q_en: "Do you need to hire an advocate or lawyer to file a case in the Consumer Forum?",
    q_ta: "நுகர்வோர் நீதிமன்றத்தில் வழக்கு தொடர வழக்கறிஞரை நியமிக்க வேண்டுமா?",
    answer_en: "NO. The Consumer Protection Act 2019 allows any citizen to represent themselves directly or file online through the e-Daakhil portal without paying hefty advocate fees for claims up to ₹50 Lakhs.",
    answer_ta: "தேவையில்லை. நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி வக்கீல் இல்லாமலேயே பொதுமக்கள் நேரடியாகவே வாதிடலாம். இ-தாகீல் தளம் மூலம் எளிய முறையில் வழக்கு பதிவு செய்யலாம்."
  },
  {
    q_en: "Can private shops or movie theatres charge above the printed MRP for cold water or soft drinks?",
    q_ta: "குளிர்ந்த தண்ணீர் பாட்டிலுக்கு அச்சிடப்பட்ட MRP விலையை விட கடைகளில் கூடுதலாக வசூலிக்கலாமா?",
    answer_en: "NO. Charging 'chilling charges' above the printed Maximum Retail Price is an offense under Section 18(2) of the Legal Metrology Act, carrying penalties up to ₹1,00,000 for repeat offenses.",
    answer_ta: "கூடாது. குளிரூட்டப்பட்டது என்ற பெயரில் MRP விலையை விட 1 ரூபாய் கூட கூடுதலாக வசூலிப்பது எடைகள் மற்றும் அளவீடுகள் சட்டப்படி தண்டனைக்குரிய குற்றமாகும். அபராதம் ₹1 லட்சம் வரை விதிக்கப்படலாம்."
  },
  {
    q_en: "Can women be arrested or brought to the police station at 9:00 PM?",
    q_ta: "மாலை 9 மணிக்கு பெண்களை கைது செய்யவோ காவல் நிலையத்திற்கு விசாரணைக்கு அழைக்கவோ முடியுமா?",
    answer_en: "NO. Under CrPC Section 46(4), no woman can be arrested after sunset (6 PM) and before sunrise (6 AM), except in extraordinary cases with prior written permission of a Judicial Magistrate and in the presence of a female police officer.",
    answer_ta: "முடியாது. CrPC பிரிவு 46(4)-ன் படி மாலை 6 மணி முதல் காலை 6 மணி வரை பெண்களை கைது செய்யத் தடை உண்டு. விதிவிலக்கான சூழலில் மட்டுமே பெண் காவலர் முன்னிலையில் மாஜிஸ்திரேட் முன் அனுமதி பெற்று நடவடிக்கை எடுக்கலாம்."
  },
  {
    q_en: "Can a government office refuse an RTI request because the citizen did not specify the reason?",
    q_ta: "காரணம் சொல்லவில்லை என்பதற்காக அரசு அலுவலகம் RTI மனுவை நிராகரிக்க முடியுமா?",
    answer_en: "NO. Section 6(2) of the RTI Act 2005 explicitly states: 'An applicant making request for information shall not be required to give any reason for requesting the information'. Demanding reasons is illegal.",
    answer_ta: "முடியாது. RTI சட்டம் பிரிவு 6(2)-ன் படி தகவல் கோரும் குடிமகன் அதற்கான காரணத்தைத் தெரிவிக்க வேண்டிய அவசியமே இல்லை. காரணம் கேட்பது சட்டவிரோதமாகும்."
  }
];

// Quick Helplines Matrix
const LEGAL_HELPLINES = [
  { number: "1915", name_en: "Consumer Helpline", name_ta: "நுகர்வோர் உதவி", desc: "Defective goods, e-commerce cheats, overpricing" },
  { number: "14567", name_en: "Elderline (Seniors)", name_ta: "முதியோர் உதவி", desc: "Elderly abuse, property disputes, maintenance" },
  { number: "181", name_en: "Women Helpline", name_ta: "பெண்கள் உதவி", desc: "Domestic violence, harassment, emergency shelter" },
  { number: "1064", name_en: "DVAC Anti-Corruption", name_ta: "லஞ்ச ஒழிப்புத் துறை", desc: "Government bribe demands & extortion" },
  { number: "1100", name_en: "CM Helpline", name_ta: "முதல்வர் உதவி எண்", desc: "Government certificate delays & civic complaints" },
  { number: "103", name_en: "Traffic Police Desk", name_ta: "போக்குவரத்து காவல்துறை", desc: "Traffic harassment & check complaints" },
  { number: "1912", name_en: "Minnalagam EB", name_ta: "மின்னகம் மின்தடை", desc: "TANGEDCO power cuts & transformer complaints" },
  { number: "15100", name_en: "Free Legal Aid (TNSLSA)", name_ta: "இலவச சட்ட உதவி", desc: "State legal services authority for free court advocates" }
];

export default function AwarenessRightsPage() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScenarioId, setSelectedScenarioId] = useState("police-stop");
  const [showRtiGenerator, setShowRtiGenerator] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [expandedFaqIdx, setExpandedFaqIdx] = useState(0);

  usePageMeta({
    title: "Citizen Statutory Rights & Protection Laws in Tamil Nadu | VizhiTN",
    description: "Defend your legal rights in Tamil Nadu without a lawyer: RTI Act 2005, Traffic Police Check Rules, Consumer Court, Senior Citizens Act, and Labor Protections.",
  });

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleWhatsAppShare = (right) => {
    const title = lang === "ta" ? right.name_ta : right.name_en;
    const desc = lang === "ta" ? right.desc_ta : right.desc_en;
    const section = lang === "ta" ? right.statutory_section_ta : right.statutory_section_en;
    const url = typeof window !== "undefined" ? `${window.location.origin}/rights/${right.slug}` : `https://www.vizhitn.in/rights/${right.slug}`;
    const text = `⚖️ *${title}*\n📜 *${section}*\n\n🛡️ *${T("Your Legal Rights in Tamil Nadu:", "தமிழ்நாட்டில் உங்கள் சட்டப்பூர்வ உரிமைகள்:")}*\n${desc}\n\n👉 *${T("Read Full Statutory Rules & Script:", "முழு சட்ட விதிகள் & வார்த்தைகள்:")}*\n${url}\n\n_Via VizhiTN Civic Transparency Platform_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Active Scenario object for the top simulator
  const activeScenario = useMemo(() => {
    return CRISIS_SCENARIOS.find((s) => s.id === selectedScenarioId) || CRISIS_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Master rights fetched directly from single source of truth
  const allMasterRights = useMemo(() => {
    return getAllRights().map((r) => {
      const meta = RIGHT_UI_METAS[r.id] || {
        icon: Shield,
        badgeCls: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
        badge_en: "Statutory Law",
        badge_ta: "சட்டப்பூர்வ உரிமை",
        category: "general"
      };
      return { ...r, ...meta };
    });
  }, []);

  // Filtered Rights Directory
  const filteredRights = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allMasterRights.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !q ||
        item.name_en.toLowerCase().includes(q) ||
        item.name_ta.toLowerCase().includes(q) ||
        item.desc_en.toLowerCase().includes(q) ||
        item.desc_ta.toLowerCase().includes(q) ||
        (item.statutory_section_en && item.statutory_section_en.toLowerCase().includes(q)) ||
        (item.statutory_section_ta && item.statutory_section_ta.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, allMasterRights]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <AwarenessSubNav activePath="/awareness/rights" />

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white border-b border-indigo-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md">
                <Scale className="w-3.5 h-3.5 text-blue-400" />
                <span>{T("Tamil Nadu Citizen Legal Self-Defense Constitution", "தமிழ்நாடு குடிமக்கள் சட்டப் பாதுகாப்பு கையேடு")}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                {T("Citizen Statutory Rights & Protection Laws", "குடிமக்கள் சட்டப்பூர்வ உரிமைகள் & பாதுகாப்பு சட்டங்கள்")}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                {T(
                  "You do not need an expensive advocate to protect basic civic dignities. Browse verified statutory protections, official government SLAs, and verbatim scripts to speak when challenged.",
                  "அடிப்படை உரிமைகளைப் பாதுகாக்க வழக்கறிஞர் தேவையில்லை. சரியான சட்டப் பிரிவுகள், அரசு காலக்கெடு, உதவி எண்கள் மற்றும் அதிகாரிகளிடம் பேச வேண்டிய சட்ட வார்த்தைகளை உடனே அறிந்துகொள்ளுங்கள்."
                )}
              </p>

              {/* Quick Feature Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{T("8 Verified Acts & SLAs", "8 முக்கிய சட்டங்கள் & காலக்கெடு")}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-slate-200">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>{T("Quote-Ready Verbal Scripts", "பேச வேண்டிய சட்டப்பூர்வ பதில்கள்")}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-slate-200">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>{T("Whitelisted Helplines", "அரசு அங்கீகரித்த உதவி எண்கள்")}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-slate-200">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>{T("Zero Lawyer Court Options", "வக்கீல் இன்றி ஆன்லைன் வழக்கு")}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Box: RTI Generator Launcher */}
            <div className="w-full lg:w-auto flex-shrink-0">
              <div className="bg-gradient-to-b from-blue-900/60 to-indigo-950/80 p-5 rounded-2xl border border-blue-500/30 backdrop-blur-xl shadow-2xl max-w-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                      {T("Instant Civic Action Tool", "உடனடி குடிமக்கள் கருவி")}
                    </span>
                    <h2 className="text-base font-bold text-white">
                      {T("RTI Application Generator", "RTI மனு உருவாக்கும் கருவி")}
                    </h2>
                  </div>
                </div>
                <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                  {T(
                    "Draft an official RTI application for road tender audits, pending Patta, TANGEDCO power delays or ration issues in 60 seconds.",
                    "சாலை தரம், பட்டா தாமதம், மின் இணைப்பு சிக்கல்களுக்கான சட்டப்பூர்வ RTI மனுவை 60 வினாடிகளில் உருவாக்குங்கள்."
                  )}
                </p>
                <button
                  onClick={() => setShowRtiGenerator(!showRtiGenerator)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{showRtiGenerator ? T("Close RTI Generator", "RTI கருவியை மூடு") : T("Launch RTI Generator", "RTI மனு தயார் செய்க")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-3xl relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={T(
                "Search citizen rights (e.g. DigiLocker, Consumer court, RTI Section 6, 15 days SLA, MRP overcharging)...",
                "உரிமைகளைத் தேடுங்கள் (எ.கா. டிஜிலாக்கர், நுகர்வோர் நீதிமன்றம், RTI பிரிவு 6, 15 நாள் காலக்கெடு, MRP)..."
              )}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base shadow-inner backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded RTI Draft Generator Drawer */}
      {showRtiGenerator && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-blue-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {T("Tamil Nadu Statutory RTI Draft Generator", "தமிழ்நாடு சட்டப்பூர்வ RTI மனு உருவாக்கும் கருவி")}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {T("Fill the form, select your department, and generate a legally compliant RTI draft ready to print or copy.", "துறையைத் தேர்ந்தெடுத்து பிரிண்ட் செய்யக்கூடிய சட்டப்பூர்வ மனுவை உடனடியாகப் பெறுங்கள்.")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRtiGenerator(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <RtiDraftGenerator />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        
        {/* SECTION 1: "SOLVE YOUR SITUATION" CRISIS SIMULATOR */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>{T("Instant Crisis Simulator", "உடனடி தீர்வு நிலைமைகள்")}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {T("Facing an Emergency or Confrontation Right Now?", "நீங்கள் தற்போது சிக்கலில் உள்ளீர்களா? உங்கள் நிலையைத் தேர்ந்தெடுக்கவும்")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {T(
                  "Select your situation to see the exact legal clause, what to say out loud, and what authorities cannot legally do.",
                  "கீழே உள்ள நிலைமைகளில் ஒன்றை அழுத்தினால் நீங்கள் என்ன பேச வேண்டும் மற்றும் அதிகாரிகள் என்ன செய்ய முடியாது என்ற விவரம் உடனே தோன்றும்."
                )}
              </p>
            </div>
          </div>

          {/* Situation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
            {CRISIS_SCENARIOS.map((sc) => {
              const isSelected = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`flex flex-col items-start text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 relative ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-2xl mb-2">{sc.emoji}</span>
                  <span className={`text-[11px] font-bold tracking-wider uppercase mb-1 ${isSelected ? "text-blue-200" : "text-blue-600 dark:text-blue-400"}`}>
                    {T(sc.tag_en, sc.tag_ta)}
                  </span>
                  <span className="text-xs sm:text-sm font-bold leading-snug line-clamp-2">
                    {T(sc.title_en, sc.title_ta)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Situation Spotlight Card */}
          <div className="mt-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-indigo-800/40 shadow-2xl relative">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-indigo-800/50">
              <div className="flex items-start gap-4">
                <span className="text-4xl sm:text-5xl">{activeScenario.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {T(activeScenario.tag_en, activeScenario.tag_ta)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {T(activeScenario.clause_en, activeScenario.clause_ta)}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                    {T(activeScenario.title_en, activeScenario.title_ta)}
                  </h3>
                </div>
              </div>

              {/* Action Ribbon: Call Helpline + Open Full Guide */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${activeScenario.helpline}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition active:scale-95"
                >
                  <PhoneCall className="w-4 h-4 text-slate-950" />
                  <span>{T("Call", "அழைக்க")} {activeScenario.helpline}</span>
                  <span className="text-[10px] font-semibold opacity-75 hidden sm:inline">({T(activeScenario.helpline_name_en, activeScenario.helpline_name_ta)})</span>
                </a>
                <Link
                  href={`/rights/${activeScenario.target_slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition active:scale-95"
                >
                  <span>{T("Open Full Guide Article", "முழு வழிகாட்டியைத் திற")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Split Content: What to say vs What authority cannot do */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              
              {/* Verbal Script */}
              <div className="lg:col-span-7 bg-slate-950/70 p-5 rounded-2xl border border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      {T("What You Should Say Verbatim (சட்டப்பூர்வ பதில்)", "அதிகாரியிடம் நீங்கள் பேச வேண்டிய சட்டப்பூர்வ பதில்")}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(lang === "ta" ? activeScenario.script_ta : activeScenario.script_en, `scenario-${activeScenario.id}`)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition"
                  >
                    {copiedKey === `scenario-${activeScenario.id}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">{T("Copied!", "நகலெடுக்கப்பட்டது!")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{T("Copy Script", "பதிலை நகலெடு")}</span>
                      </>
                    )}
                  </button>
                </div>
                <blockquote className="text-sm sm:text-base text-slate-100 italic leading-relaxed bg-white/5 p-4 rounded-xl border-l-4 border-amber-400">
                  &ldquo;{T(activeScenario.script_en, activeScenario.script_ta)}&rdquo;
                </blockquote>
                <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{T("Tip: Speak calmly and politely. Citing the exact statutory rule signals you know the law.", "குறிப்பு: அமைதியாகவும் பணிவாகவும் பேசுங்கள். சட்டப் பிரிவைக் குறிப்பிடுவது தேவையற்ற அத்துமீறலைத் தடுக்கும்.")}</span>
                </p>
              </div>

              {/* What authorities CANNOT do */}
              <div className="lg:col-span-5 bg-slate-950/70 p-5 rounded-2xl border border-rose-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                    {T("What They CANNOT Legally Do", "அவர்கள் செய்ய முடியாத சட்டவிரோத செயல்கள்")}
                  </span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-200">
                  {(lang === "ta" ? activeScenario.cannot_do_ta : activeScenario.cannot_do_en).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/30">
                      <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: STATUTORY DIRECTORY (CLEAN CARDS LINKING DIRECTLY TO DEDICATED PAGES) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{T("Statutory Directory", "சட்டக் கையேடு")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {T("Master Statutory Citizen Rights Directory", "தமிழ்நாட்டில் குடிமக்களுக்கான 8 முக்கிய சட்டப்பூர்வ உரிமைகள்")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {T("Click on any statutory right to open its comprehensive dedicated guide article.", "முழு சட்ட விளக்கம் மற்றும் வழிகாட்டியைப் படிக்க ஏதேனும் ஒரு உரிமையைத் தேர்ந்தெடுக்கவும்.")}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label_en: "All Rights", label_ta: "அனைத்தும்" },
                { id: "police", label_en: "Police & Legal", label_ta: "காவல்துறை" },
                { id: "transparency", label_en: "RTI & Info", label_ta: "RTI தகவல்" },
                { id: "consumer", label_en: "Consumer", label_ta: "நுகர்வோர்" },
                { id: "public_service", label_en: "Civic SLAs", label_ta: "சான்றிதழ் SLA" },
                { id: "vulnerable", label_en: "Seniors & Women", label_ta: "முதியோர் & மகளிர்" },
                { id: "pwd", label_en: "Disability", label_ta: "மாற்றுத்திறனாளி" },
                { id: "labor", label_en: "Work & Wages", label_ta: "தொழிலாளர்" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {T(cat.label_en, cat.label_ta)}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Cards (Clean, Non-Duplicated, Direct Click to Page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRights.length === 0 ? (
              <div className="md:col-span-2 text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {T("No citizen rights found matching your search", "தேடலுக்குரிய உரிமைகள் கிடைக்கவில்லை")}
                </h3>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  {T("Reset All Filters", "அனைத்தையும் மீட்டமை")}
                </button>
              </div>
            ) : (
              filteredRights.map((right) => {
                const IconComp = right.icon;

                return (
                  <article
                    key={right.id}
                    className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 transition-all duration-200 p-6 sm:p-7 shadow-sm hover:shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Icon, Badges, Title */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex-shrink-0 border border-blue-100 dark:border-blue-800">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {right.helpline && (
                            <a
                              href={`tel:${right.helpline}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                              title={T(`Call official helpline ${right.helpline}`, `அழைக்க ${right.helpline}`)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>{right.helpline}</span>
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsAppShare(right);
                            }}
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg transition"
                            title={T("Share on WhatsApp", "வாட்ஸ்அப்பில் பகிருங்கள்")}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${right.badgeCls}`}>
                          {T(right.badge_en, right.badge_ta)}
                        </span>
                        {right.statutory_section_en && (
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {T(right.statutory_section_en, right.statutory_section_ta)}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <Link href={`/rights/${right.slug}`}>
                          {T(right.name_en, right.name_ta)}
                        </Link>
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                        {T("Governing Authority", "அரசுத் துறை")}: <strong className="text-slate-700 dark:text-slate-300">{T(right.department_en, right.department_ta)}</strong>
                      </p>

                      {/* Fast-Fact Badges: SLA & Penalty */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        {right.timeline_sla_en && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">{T("SLA Deadline", "காலக்கெடு")}</span>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold line-clamp-1">{T(right.timeline_sla_en, right.timeline_sla_ta)}</span>
                          </div>
                        )}

                        {right.penalty_en && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">{T("Officer Penalty", "அபராதம்")}</span>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold line-clamp-1">{T(right.penalty_en, right.penalty_ta)}</span>
                          </div>
                        )}
                      </div>

                      <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {T(right.desc_en, right.desc_ta)}
                      </p>
                    </div>

                    {/* Direct Single Action: Go to Full Guide */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {T("Full legal script & FAQs inside", "சட்டப்பூர்வ பதில் & FAQs உள்ளே")}
                      </span>
                      <Link
                        href={`/rights/${right.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition group-hover:scale-105"
                      >
                        <span>{T("Read Full Guide", "முழு வழிகாட்டியைப் படிக்க")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* SECTION 3: CITIZEN RIGHTS MYTHS VS FACTS ACCORDION */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{T("Legal Myths Debunked", "உண்மைகள் vs கட்டுக்கதைகள்")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {T("5 Common Citizen Rights Myths in Tamil Nadu", "தமிழ்நாட்டில் குடிமக்கள் உரிமைகள் குறித்த 5 பொதுவான தவறான கருத்துக்கள்")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {T(
                "Do not get misled by common rumors. Know the verified statutory reality.",
                "வதந்திகளை நம்பி ஏமாறாதீர்கள். சட்டப்பூர்வ உண்மை நிலையை அறிந்து பாதுகாப்பாக இருங்கள்."
              )}
            </p>
          </div>

          <div className="space-y-3">
            {CITIZEN_MYTHS.map((item, idx) => {
              const isOpen = expandedFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pr-4">
                      {T(item.q_en, item.q_ta)}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 dark:text-white block mb-1">
                            {T("Statutory Reality:", "சட்டப்பூர்வ உண்மை:")}
                          </strong>
                          <span>{T(item.answer_en, item.answer_ta)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: OFFICIAL STATUTORY HELPLINES MATRIX */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/50 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-800/40">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider mb-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{T("Direct Dial Government Helplines", "அரசு நேரடி உதவி எண்கள்")}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {T("Official Statutory Grievance Helplines Whitelist", "அங்கீகரிக்கப்பட்ட அரசு அவசர & குறைதீர் எண்கள்")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {T("Save these numbers in your phone. Every number connects to an authorized government grievance officer.", "இந்த எண்களை உங்கள் மொபைலில் குறித்து வைத்துக்கொள்ளுங்கள்.")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {LEGAL_HELPLINES.map((h, idx) => (
              <a
                key={idx}
                href={`tel:${h.number}`}
                className="group flex flex-col justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-emerald-400 group-hover:scale-105 transition-transform font-mono">
                      {h.number}
                    </span>
                    <PhoneCall className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">
                    {T(h.name_en, h.name_ta)}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {h.desc}
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-bold text-emerald-300 group-hover:underline">
                  {T("Tap to Call Now →", "உடனே அழைக்க →")}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* SECTION 5: CROSS-LINKING RELATED MODULES */}
        <AwarenessRelatedLinks currentSection="rights" />
      </div>
    </div>
  );
}
