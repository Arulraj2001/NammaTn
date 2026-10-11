"use client";

import React, { useState, useMemo } from "react";
import {
  Shield, Search, FileText, ChevronRight, ExternalLink, ArrowLeft, Download,
  Building, CheckCircle2, HelpCircle, PhoneCall, AlertTriangle, Scale, Copy,
  Check, MessageCircle, AlertOctagon, Sparkles, BookOpen, Clock, X,
  ChevronDown, UserCheck, ShieldAlert, Award, FileQuestion, ArrowRight,
  ArrowUpRight, Share2, Printer, Compass, Lightbulb, Users, HeartHandshake,
  Briefcase
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import RtiDraftGenerator from "@/components/tools/RtiDraftGenerator";

// 5 Interactive Crisis Scenarios (Psychological engagement: instantly solve citizen distress)
const CRISIS_SCENARIOS = [
  {
    id: "police-stop",
    emoji: "🚔",
    category: "police",
    tag_en: "Traffic & Detention",
    tag_ta: "போக்குவரத்து & சோதனை",
    title_en: "Stopped by Police / Vehicle Check",
    title_ta: "காவல்துறை வாகன சோதனை & உரிமைகள்",
    clause_en: "Central Motor Vehicles Rules Rule 139 & CrPC Sec 46(4)",
    clause_ta: "மத்திய மோட்டார் வாகன விதிகள் Rule 139 & CrPC பிரிவு 46(4)",
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
    helpline_name_en: "Traffic Police Helpline",
    helpline_name_ta: "போக்குவரத்து காவல்துறை உதவி எண்",
    portal_url: "https://eservices.tnpolice.gov.in",
    target_right_id: "right-police-check"
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
    helpline_name_ta: "லஞ்ச ஒழிப்புத் துறை உதவி எண்",
    portal_url: "https://dvac.tn.gov.in",
    target_right_id: "right-service"
  },
  {
    id: "consumer-cheat",
    emoji: "🛍️",
    category: "consumer",
    tag_en: "Defective Goods & MRP",
    tag_ta: "நுகர்வோர் & மோசடி",
    title_en: "Defective Product, Refused Refund or Overcharging",
    title_ta: "போலி பொருள், கட்டணம் அதிகம் அல்லது ரீபண்ட் மறுப்பு",
    clause_en: "Consumer Protection Act 2019 (Sec 84-86) & Legal Metrology Act (Sec 18)",
    clause_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 & எடைகள் மற்றும் அளவீடுகள் சட்டம்",
    script_en: "As per the Consumer Protection Act 2019, denying replacement or refund for defective merchandise, or charging above the printed Maximum Retail Price (MRP), constitutes an unfair trade practice and deficiency of service. Please process the statutory resolution within 7 days, failing which an online complaint will be filed at the National Consumer Helpline 1915 and e-Daakhil court claiming damages for mental agony.",
    script_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி, குறைபாடுள்ள பொருளை மாற்ற மறுப்பதோ அல்லது எம்.ஆர்.பி (MRP) விலையை விட கூடுதலாக விற்பதோ தண்டனைக்குரிய குற்றமாகும். 7 நாட்களுக்குள் பணத்தை திருப்பித் தராவிடில் தேசிய நுகர்வோர் உதவி எண் 1915 மற்றும் இ-தாகீல் (e-Daakhil) நீதிமன்றத்தில் நஷ்டஈடு கேட்டு வழக்கு பதிவு செய்யப்படும்.",
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
    portal_url: "https://edaakhil.nic.in",
    target_right_id: "right-consumer"
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
    portal_url: "https://tnsocialwelfare.tn.gov.in",
    target_right_id: "right-senior-citizen"
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
    helpline_name_en: "Labour Department Grievance",
    helpline_name_ta: "தொழிலாளர் துறை உதவி எண்",
    portal_url: "https://labour.tn.gov.in",
    target_right_id: "right-labor-minimum-wage"
  }
];

// The 8 Master Statutory Acts
const CITIZEN_RIGHTS = [
  {
    id: "right-rti",
    slug: "right-to-information-act-2005",
    icon: FileText,
    category: "transparency",
    badge_en: "RTI & Transparency",
    badge_ta: "தகவல் உரிமை & வெளிப்படைத்தன்மை",
    badgeCls: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    name_en: "Right to Information Act (RTI Act 2005)",
    name_ta: "தகவல் அறியும் உரிமைச் சட்டம் 2005",
    statutory_section_en: "Sections 6(1), 7(1) & 20(1) RTI Act",
    statutory_section_ta: "RTI சட்டம் பிரிவு 6(1), 7(1) & 20(1)",
    timeline_sla_en: "30 Days Response (48h for Life & Liberty)",
    timeline_sla_ta: "30 நாட்கள் பதில் (உயிர் பாதுகாப்பு எனில் 48 மணி நேரம்)",
    penalty_en: "₹250/day up to ₹25,000 fine from PIO salary + Disciplinary inquiry",
    penalty_ta: "தகவல் மறைக்கும் அதிகாரி சம்பளத்தில் நாள் ஒன்றுக்கு ₹250 வீதம் ₹25,000 வரை அபராதம்",
    fee_en: "₹10 Court Fee Stamp or Online Netbanking/UPI",
    fee_ta: "₹10 நீதிமன்ற முத்திரை அல்லது ஆன்லைன் கட்டணம்",
    desc_en: "Empowers Indian citizens to request official records, inspect public works and files, and receive certified documents from any state or local public authority within 30 days.",
    desc_ta: "அரசுத் துறைகளின் செயல்பாடுகள், திட்ட நிதிகள், டெண்டர் கோப்புகள் மற்றும் உத்தரவுகளை மக்கள் பார்வையிடவும் நகல் பெறவும் 30 நாட்களுக்குள் தகவல் பெறும் உரிமை.",
    content_en: "Under the RTI Act 2005, every citizen has the statutory right to file an application with a Public Information Officer (PIO) of any state or central department. The PIO must reply within 30 calendar days (or 48 hours if life and liberty are involved). If information is denied, evasive, or delayed, citizens can file a First Appeal to the Appellate Authority without fee within 30 days, followed by a Second Appeal to the Tamil Nadu Information Commission (TNIC).",
    content_ta: "தகவல் அறியும் உரிமைச் சட்டத்தின்படி ஒவ்வொரு குடிமகனும் எந்தவொரு அரசுத் துறையிலும் ₹10 கட்டணத்துடன் விண்ணப்பித்து 30 நாட்களுக்குள் தகவல் பெற உரிமை உண்டு. பதில் கிடைக்காத பட்சத்தில் 30 நாட்களுக்குள் துறைத் தலைவரிடம் இலவசமாக முதல் மேல்முறையீடு செய்யலாம். அதிலும் தீர்வு இல்லையெனில் தமிழ்நாடு தகவல் ஆணையத்தில் (TNIC) இரண்டாவது மேல்முறையீடு செய்யலாம்.",
    verbal_script_en: "Sir, I have submitted an application under Section 6(1) of the RTI Act 2005. Under Section 7(1), the PIO is statutorily mandated to provide information within 30 calendar days. If information is delayed without valid reason, Section 7(6) directs that it must be supplied completely free of cost, and Section 20 imposes personal penalties on the responsible officer.",
    verbal_script_ta: "ஐயா, தகவல் அறியும் உரிமைச் சட்டம் பிரிவு 6(1)-ன் கீழ் மனு அளித்துள்ளேன். பிரிவு 7(1)-ன் படி 30 நாட்களுக்குள் தகவல் வழங்க வேண்டும். காலதாமதம் ஏற்பட்டால் பிரிவு 7(6)-ன் படி தகவல்கள் கட்டணமின்றி இலவசமாக வழங்கப்பட வேண்டும் மற்றும் பிரிவு 20-ன் படி அதிகாரி மீது அபராதம் விதிக்கப்படும்.",
    department_en: "Personnel and Administrative Reforms Dept / TNIC",
    department_ta: "பணியாளர் & நிர்வாக சீர்திருத்தத் துறை / தகவல் ஆணையம்",
    portal_url: "https://rtionline.tn.gov.in",
    helpline: "1100",
    key_points_en: [
      "Mandatory 30-day response window for all Tamil Nadu government bodies",
      "Nominal ₹10 fee; completely free for citizens below poverty line (BPL)",
      "Right to physically inspect public works, roads, and government records",
      "Personal penalty up to ₹25,000 on officials failing to supply information"
    ],
    key_points_ta: [
      "தமிழ்நாடு அரசுத் துறைகள் அனைத்திற்கும் 30 நாட்கள் கட்டாயப் பதில் காலக்கெடு",
      "₹10 கட்டணம் மட்டுமே; வறுமைக் கோட்டிற்கு கீழ் உள்ளவர்களுக்கு முற்றிலும் இலவசம்",
      "அரசு சாலைகள், கட்டுமானப் பணிகள் மற்றும் கோப்புகளை நேரில் ஆய்வு செய்யும் உரிமை",
      "தகவலை மறைக்கும் அதிகாரிக்கு ₹25,000 வரை தனிப்பட்ட அபராதம்"
    ],
    steps_en: [
      "Draft concise, pointed questions (avoid asking 'why', ask for copies of files & orders)",
      "Affix ₹10 Court Fee Stamp or pay via rtionline.tn.gov.in",
      "Submit to PIO by Registered Post with Acknowledgment Due (RPAD) or online",
      "If no reply in 30 days, file First Appeal to Appellate Authority within 30 days"
    ],
    steps_ta: [
      "தெளிவான கேள்விகளைத் தயார் செய்யுங்கள் ('ஏன்' என்று கேட்காமல் கோப்புகள், உத்தரவுகளின் நகல்களைக் கோருங்கள்)",
      "₹10 நீதிமன்ற முத்திரை ஒட்டி அல்லது rtionline.tn.gov.in மூலம் ஆன்லைனில் கட்டணம் செலுத்துங்கள்",
      "பொதுத் தகவல் அலுவலருக்கு பதிவுத் தபால் (RPAD) அல்லது இணையதளம் மூலம் அனுப்புங்கள்",
      "30 நாட்களில் பதில் வராவிடில் துறைத் தலைவரிடம் முதல் மேல்முறையீடு செய்யுங்கள்"
    ]
  },
  {
    id: "right-consumer",
    slug: "consumer-protection-rights-2019",
    icon: Shield,
    category: "consumer",
    badge_en: "Consumer Protection",
    badge_ta: "நுகர்வோர் பாதுகாப்பு",
    badgeCls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    name_en: "Consumer Protection Rights (Act 2019)",
    name_ta: "நுகர்வோர் பாதுகாப்பு சட்ட உரிமைகள் 2019",
    statutory_section_en: "Sections 2(7), 35 & 84-86 CPA 2019",
    statutory_section_ta: "நுகர்வோர் சட்டம் பிரிவு 2(7), 35 & 84-86",
    timeline_sla_en: "District Commission Claims up to ₹50 Lakhs",
    timeline_sla_ta: "மாவட்ட நுகர்வோர் மன்றம் ₹50 லட்சம் வரை இழப்பீடு வழங்க அதிகாரம்",
    penalty_en: "Full refund, product replacement, monetary damages & business license action",
    penalty_ta: "முழு பணத்தைத் திரும்பப் பெறுதல், மாற்றுப் பொருள், நஷ்டஈடு மற்றும் வணிக உரிம நடவடிக்கை",
    fee_en: "Zero lawyer requirement; nominal court fee on e-Daakhil",
    fee_ta: "வழக்கறிஞர் கட்டாயம் இல்லை; இ-தாகீல் தளத்தில் மிகக் குறைந்த கட்டணம்",
    desc_en: "Protects consumers against defective merchandise, deficient services, overcharging above MRP, misleading advertisements, and unfair e-commerce trade practices.",
    desc_ta: "குறைபாடுள்ள பொருட்கள், தரமற்ற சேவைகள், போலி விளம்பரங்கள் மற்றும் ஏமாற்று ஆன்லைன் வியாபாரத்திற்கு எதிராக வழக்கறிஞர் இன்றி ஆன்லைனில் இழப்பீடு பெறும் உரிமை.",
    content_en: "The Consumer Protection Act 2019 gives citizens 6 fundamental rights: Right to Safety, Right to Information, Right to Choose, Right to be Heard, Right to Redressal, and Right to Consumer Education. Consumers can file complaints online through e-Daakhil without hiring a lawyer for claims up to ₹50 lakh at the District Commission, and up to ₹2 Crore at the State Commission.",
    content_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி பொருட்களின் தரம், விலை மற்றும் சேவைகளில் குறைபாடு இருந்தால் வழக்கறிஞர் இல்லாமலேயே இ-தாகீல் (e-Daakhil) தளம் வழியாக ஆன்லைனில் நுகர்வோர் நீதிமன்றத்தில் வழக்கு பதிவு செய்து இழப்பீடு பெறலாம். மாவட்ட நுகர்வோர் மன்றம் ₹50 லட்சம் வரையிலான வழக்குகளை விசாரிக்கும்.",
    verbal_script_en: "Under the Consumer Protection Act 2019, refusing to redress a defective product or service, or imposing above-MRP rates, is illegal under Section 2(47). I am recording this dispute and submitting a formal complaint to the National Consumer Helpline at 1915 and e-Daakhil portal claiming full refund with interest and punitive compensation.",
    verbal_script_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி, குறைபாடுள்ள பொருளுக்கான தீர்வை மறுப்பதோ அல்லது MRP-ஐ விட அதிகம் வசூலிப்பதோ சட்டவிரோதமாகும். இதனை தேசிய நுகர்வோர் உதவி எண் 1915 மற்றும் இ-தாகீல் தளத்தில் இழப்பீட்டுடன் வழக்காகப் பதிவு செய்கிறேன்.",
    department_en: "Civil Supplies and Consumer Protection Dept",
    department_ta: "உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை",
    portal_url: "https://edaakhil.nic.in",
    helpline: "1915",
    key_points_en: [
      "Zero requirement to hire a legal advocate for District Consumer Forum",
      "Online filing and hearing option through national e-Daakhil system",
      "Strict Product Liability holds manufacturers directly accountable for injuries/defects",
      "National Consumer Helpline toll-free: 1915 (multi-lingual support)"
    ],
    key_points_ta: [
      "நுகர்வோர் நீதிமன்றத்தில் வாதாட வழக்கறிஞர் தேவையில்லை; நீங்களே வாதிடலாம்",
      "இ-தாகீல் தளம் மூலம் வீட்டிலிருந்தே இணைய வழியில் வழக்கு மற்றும் விசாரணை",
      "தயாரிப்பு பொறுப்புச் சட்டம் (Product Liability) மூலம் உற்பத்தியாளரே நேரடியாகப் பொறுப்பு",
      "தேசிய நுகர்வோர் உதவி எண்: 1915 (தமிழ் உள்பட பல மொழிகளில் உதவி)"
    ],
    steps_en: [
      "Preserve proof of purchase (bill, invoice, receipt, warranty card, photos)",
      "Send written notice to seller/company giving 7-15 days to refund/replace",
      "Dial 1915 or register grievance on consumerhelpline.gov.in",
      "If unresolved, file online complaint on edaakhil.nic.in"
    ],
    steps_ta: [
      "வாங்கிய ரசீது, பில், வாரண்டி அட்டை மற்றும் சேதமடைந்த பொருட்களின் புகைப்படங்களைச் சேகரியுங்கள்",
      "நிறுவனத்திற்கு 7-15 நாட்களில் மாற்றிக் கொடுக்கக் கோரி எழுத்துப்பூர்வ எச்சரிக்கை நோட்டீஸ் அனுப்புங்கள்",
      "1915 எண்ணை அழைத்து அல்லது consumerhelpline.gov.in தளத்தில் புகார் பதிவு செய்யுங்கள்",
      "தீர்வு கிடைக்காத பட்சத்தில் edaakhil.nic.in தளத்தில் நுகர்வோர் நீதிமன்றத்தில் வழக்கு தொடருங்கள்"
    ]
  },
  {
    id: "right-police-check",
    slug: "police-vehicle-check-citizen-rights",
    icon: Shield,
    category: "police",
    badge_en: "Police & Legal Defense",
    badge_ta: "காவல்துறை & சட்டப் பாதுகாப்பு",
    badgeCls: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    name_en: "Citizen Rights During Police Checks & Detention",
    name_ta: "வாகன சோதனை & காவல் விசாரணையில் குடிமக்கள் உரிமைகள்",
    statutory_section_en: "CMV Rules Rule 139 & CrPC Sec 46(4), 50, 57",
    statutory_section_ta: "மோட்டார் வாகன விதிகள் Rule 139 & CrPC பிரிவு 46(4), 50, 57",
    timeline_sla_en: "Immediate Document Verification / 24h Magistrate Limit",
    timeline_sla_ta: "உடனடி ஆவண சரிபார்ப்பு / 24 மணி நேரத்திற்குள் நீதிபதி முன் ஆஜர்படுத்துதல்",
    penalty_en: "Illegal key seizure or custodial misconduct violates Supreme Court guidelines",
    penalty_ta: "வாகனச் சாவியைப் பிடுங்குவது உச்ச நீதிமன்ற வழிகாட்டுதல்களுக்கு எதிரான சட்டவிரோத நடவடிக்கை",
    fee_en: "Digital e-Challan only; zero arbitrary cash penalties without receipt",
    fee_ta: "டிஜிட்டல் இ-சலான் ரசீது மட்டுமே; ரசீது இன்றி பணம் கொடுக்கத் தேவையில்லை",
    desc_en: "Know your statutory rights when stopped by traffic police, during vehicle document inspections, or during police station inquiries.",
    desc_ta: "வாகன சோதனையின் போதும் காவல் நிலைய விசாரணையின் போதும் குடிமக்களுக்கு உள்ள சட்டப்பூர்வ உரிமைகள், டிஜிட்டல் ஆவண விதிகள் மற்றும் பாதுகாப்பு சட்டங்கள்.",
    content_en: "1. Officers below Sub-Inspector (SI) rank cannot compound or issue fine receipts for major traffic offences. 2. Officers cannot forcefully snatch vehicle ignition keys or subject motorists to physical intimidation. 3. Electronic copies of Driving License, RC, and Insurance on DigiLocker or mParivahan are 100% legally recognized under Motor Vehicles Amendment Act Rule 139. 4. Women cannot be arrested between sunset and sunrise except under exceptional magistrate clearance with a woman officer present.",
    content_ta: "1. சப்-இன்ஸ்பெக்டர் (SI) நிலைக்குக் கீழ் உள்ள அதிகாரிகள் அபராதம் வசூலிக்க முடியாது. 2. வாகனச் சாவியைப் பிடுங்கவோ உடலளவில் தாக்கவோ அதிகாரம் இல்லை. 3. டிஜிலாக்கர் (DigiLocker) மற்றும் mParivahan செயலியில் உள்ள உரிமம், ஆர்.சி புத்தகம் சட்டப்பூர்வமாக செல்லுபடியாகும். 4. பெண்களை மாலை 6 மணி முதல் காலை 6 மணி வரை பெண் காவலர் இன்றி கைது செய்யத் தடை.",
    verbal_script_en: "Sir, under Rule 139 of the Central Motor Vehicles Rules and MoRTH notification, digital records shown via DigiLocker and mParivahan are valid statutory documents. Seizing my vehicle keys is not permitted under the law. If there is an alleged violation, kindly issue a digital e-Challan through an officer of Sub-Inspector rank or above.",
    verbal_script_ta: "ஐயா, மத்திய மோட்டார் வாகன விதிகள் Rule 139-ன் படி டிஜிலாக்கர் சான்றிதழ்கள் 100% செல்லுபடியாகும். வாகனச் சாவியை எடுப்பது விதிகளுக்கு எதிரானது. விதிமீறல் இருப்பின் சப்-இன்ஸ்பெக்டர் அதிகாரி மூலம் டிஜிட்டல் இ-சலான் ரசீது வழங்குங்கள்.",
    department_en: "Home & Tamil Nadu Police Department",
    department_ta: "உள்துறை மற்றும் தமிழ்நாடு காவல்துறை",
    portal_url: "https://eservices.tnpolice.gov.in",
    helpline: "103",
    key_points_en: [
      "Sub-Inspector (SI) rank & above only can collect or adjudicate traffic fines",
      "DigiLocker & mParivahan digital DL, RC, and Insurance are 100% legally valid",
      "Police key snatching or verbal harassment is unlawful under Supreme Court rulings",
      "Night arrest of female citizens prohibited under CrPC Section 46(4)"
    ],
    key_points_ta: [
      "சப்-இன்ஸ்பெக்டர் (SI) மற்றும் அதற்கு மேற்பட்ட அதிகாரிகளே அபராதம் வசூலிக்க அதிகாரம் உடையவர்கள்",
      "டிஜிலாக்கர் மற்றும் mParivahan டிஜிட்டல் சான்றிதழ்கள் 100% சட்டப்பூர்வமாக செல்லுபடியாகும்",
      "வாகனச் சாவியை பிடுங்குவது அல்லது தகாத வார்த்தை பேசுவது சட்டவிரோதம்",
      "பெண்களை மாலை 6 மணிக்குப் பின் பெண் காவலர் இன்றி கைது செய்யத் தடை"
    ],
    steps_en: [
      "Stay calm, pull over safely, and keep vehicle engine off with keys in your possession",
      "Open DigiLocker or mParivahan to present verified digital credentials",
      "Verify the rank of the officer (look for two stars / SI uniform badge)",
      "Always demand an official digital e-Challan receipt containing the violation code"
    ],
    steps_ta: [
      "வாகனத்தை ஓரமாக நிறுத்தி என்ஜினை அணையுங்கள்; சாவியை உங்கள் கையில் வைத்திருங்கள்",
      "டிஜிலாக்கர் அல்லது mParivahan செயலியில் உள்ள அசல் டிஜிட்டல் ஆவணங்களைக் காட்டுங்கள்",
      "அதிகாரியின் பதவியை கவனியுங்கள் (குறைந்தது 2 நட்சத்திரம் உள்ள சப்-இன்ஸ்பெக்டராக இருக்க வேண்டும்)",
      "எப்போதும் விதிமீறல் எண் குறிப்பிடப்பட்ட டிஜிட்டல் இ-சலான் ரசீதை மட்டுமே பெறுங்கள்"
    ]
  },
  {
    id: "right-service",
    slug: "right-to-public-services-timebound",
    icon: Building,
    category: "public_service",
    badge_en: "Citizen Charter & SLAs",
    badge_ta: "அரசுச் சேவை உத்தரவாதம்",
    badgeCls: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    name_en: "Right to Public Services (Time-Bound Delivery)",
    name_ta: "காலவரையறைக்கு உட்பட்ட அரசுச் சேவை உரிமை",
    statutory_section_en: "Tamil Nadu Citizen Charter Guidelines & GO Ms. No. 1100",
    statutory_section_ta: "தமிழ்நாடு குடிமக்கள் பட்டயம் & அரசு வழிகாட்டுதல்கள்",
    timeline_sla_en: "Community/Income (15 Days), Power Connection (7-15 Days)",
    timeline_sla_ta: "சாதி/வருமான சான்றிதழ் (15 நாட்கள்), மின் இணைப்பு (7-15 நாட்கள்)",
    penalty_en: "Collectorate grievance review + Departmental disciplinary record entry",
    penalty_ta: "மாவட்ட ஆட்சியர் குறைதீர் மறுஆய்வு மற்றும் துறை ரீதியான ஒழுங்கு நடவடிக்கை",
    fee_en: "Standard e-Sevai nominal fee (₹60) only",
    fee_ta: "இ-சேவை மைய நிர்ணயிக்கப்பட்ட அரசு கட்டணம் (₹60) மட்டுமே",
    desc_en: "Guarantees statutory timelines for obtaining revenue certificates, electricity connections, water pipelines, and municipal registrations.",
    desc_ta: "வருவாய்த் துறை சான்றிதழ்கள், புதிய குடிநீர் மற்றும் மின்சார இணைப்புகளை அரசு நிர்ணயித்த காலக்கெடுவுக்குள் பெறும் குடிமக்கள் உரிமை.",
    content_en: "Under Tamil Nadu Citizen Charter guidelines, government departments must issue certificates within stipulated deadlines: Community and Income Certificate (15 working days), Nativity Certificate (7 days), Legal Heir Certificate (15-30 days), New Domestic Power Connection (7-15 days), Ration Card alteration (15 days). If delayed without lawful cause, citizens can escalate to the District Collector and CM Grievance Cell.",
    content_ta: "அரசு குடிமக்கள் சாசனம் படி: சாதி/வருமான சான்றிதழ் (15 நாட்கள்), இருப்பிட சான்றிதழ் (7 நாட்கள்), வாரிசு சான்றிதழ் (15-30 நாட்கள்), புதிய வீட்டு மின் இணைப்பு (7-15 நாட்கள்) மற்றும் ரேஷன் கார்டு மாற்றம் (15 நாட்கள்) காலக்கெடுவுக்குள் வழங்கப்பட வேண்டும். தாமதமானால் மாவட்ட ஆட்சியரிடம் நேரடியாக மேல்முறையீடு செய்யலாம்.",
    verbal_script_en: "Sir, under the Tamil Nadu Citizen Charter, the prescribed timeline for issuing this certificate is 15 working days. My application has been pending for over the statutory limit without any deficiency notice. Please furnish the reason in writing or I will register an appeal with the District Collector and CM Helpline 1100.",
    verbal_script_ta: "அரசு குடிமக்கள் சாசனத்தின்படி இந்த சான்றிதழுக்கான காலக்கெடு 15 நாட்கள் ஆகும். எவ்வித குறைபாடும் சுட்டிக்காட்டப்படாமல் விண்ணப்பம் தாமதப்படுத்தப்பட்டுள்ளது. காரணத்தை எழுத்துப்பூர்வமாகத் தாருங்கள் அல்லது மாவட்ட ஆட்சியர் மற்றும் முதல்வர் உதவி எண் 1100-ல் மேல்முறையீடு செய்வேன்.",
    department_en: "Revenue and Disaster Management Dept",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_url: "https://cmhelpline.tn.gov.in",
    helpline: "1100",
    key_points_en: [
      "Community & Income Certificate statutory SLA: 15 Working Days",
      "New Domestic TANGEDCO Electricity Connection: 7 to 15 Days",
      "Smart Ration Card modification / address change: 15 Working Days",
      "Direct appeal to District Collectorate Grievance Cell (every Monday Jamabandi)"
    ],
    key_points_ta: [
      "சாதி மற்றும் வருமான சான்றிதழ் வழங்கும் காலக்கெடு: 15 வேலை நாட்கள்",
      "புதிய வீட்டு மின் இணைப்பு வழங்கும் காலக்கெடு: 7 முதல் 15 நாட்கள்",
      "ரேஷன் கார்டு முகவரி மாற்றம்/திருத்தம் காலக்கெடு: 15 வேலை நாட்கள்",
      "மாவட்ட ஆட்சியர் அலுவலகத்தில் வாராந்திர மக்கள் குறைதீர் முகாமில் நேரடி மேல்முறையீடு"
    ],
    steps_en: [
      "Apply through official e-Sevai portal (tnesevai.tn.gov.in) and keep Application CAN/Ack number",
      "Track status online daily after 7 days",
      "If application crosses SLA without objection memo, note VAO / RI / Tahsildar pending desk",
      "Call CM Helpline 1100 or submit formal petition to District Collector"
    ],
    steps_ta: [
      "tnesevai.tn.gov.in தளம் மூலம் விண்ணப்பித்து விண்ணப்ப எண் மற்றும் ஒப்புகைச் சீட்டைப் பெறுங்கள்",
      "7 நாட்களுக்குப் பிறகு ஆன்லைனில் கோப்பு நிலையைத் தொடர்ந்து கண்காணிக்கவும்",
      "காலக்கெடு கடந்தும் கோப்பு தேங்கினால் VAO / RI நிலையை குறித்துக் கொள்ளுங்கள்",
      "முதல்வர் உதவி எண் 1100-ஐ அழையுங்கள் அல்லது மாவட்ட ஆட்சியரிடம் திங்கட்கிழமை மனு அளியுங்கள்"
    ]
  },
  {
    id: "right-senior-citizen",
    slug: "senior-citizens-maintenance-act-2007",
    icon: Shield,
    category: "vulnerable",
    badge_en: "Senior Citizens Welfare",
    badge_ta: "மூத்த குடிமக்கள் நலம்",
    badgeCls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    name_en: "Maintenance & Rights of Senior Citizens (Act 2007)",
    name_ta: "மூத்த குடிமக்கள் பராமரிப்பு & நல உரிமைகள் 2007",
    statutory_section_en: "Sections 4, 9 & 23 Senior Citizens Act 2007",
    statutory_section_ta: "மூத்த குடிமக்கள் சட்டம் பிரிவு 4, 9 & 23",
    timeline_sla_en: "90 Days Summary Disposal by RDO Tribunal",
    timeline_sla_ta: "RDO தீர்ப்பாயம் மூலம் 90 நாட்களில் உடனடி தீர்ப்பு",
    penalty_en: "Revocation of property gift deeds + Summary eviction of abusive heirs + Jail term",
    penalty_ta: "சொத்து தானப் பத்திரம் ரத்து + ஆக்கிரமித்த பிள்ளைகளை வெளியேற்றுதல் + சிறைத் தண்டனை",
    fee_en: "Zero court fees; free state legal aid available",
    fee_ta: "நீதிமன்ற கட்டணம் இல்லை; இலவச அரசு சட்ட உதவி",
    desc_en: "Protects elderly parents from eviction, abandonment, and emotional or financial neglect by adult children and legal heirs.",
    desc_ta: "முதியோர்களை பிள்ளைகள் கைவிடுவதில் இருந்தும், சொத்துக்களை அபகரித்து வீட்டை விட்டு வெளியேற்றுவதில் இருந்தும் பாதுகாக்கும் சட்டம்.",
    content_en: "Under the Maintenance and Welfare of Parents and Senior Citizens Act 2007, adult children are legally mandated to maintain parents. Revenue Divisional Officers (RDO) act as Maintenance Tribunals with powers to order monthly allowance (up to ₹10,000/month) and order swift summary eviction of abusive children within 90 days. Critically, Section 23 empowers RDOs to cancel property transfers if children renege on care.",
    content_ta: "பெற்றோர்களைப் பராமரிக்காத பிள்ளைகளிடம் இருந்து மாதம் ₹10,000 வரை ஜீவனாம்சம் பெறவும், முதியோரின் சொத்தை ஆக்கிரமிக்கும் பிள்ளைகளை 90 நாட்களில் வெளியேற்றவும் RDO (வருவாய் கோட்டாட்சியர்) மன்றத்திற்கு முழு அதிகாரம் உண்டு. பராமரிக்கத் தவறினால் தானமாக எழுதிய சொத்துப் பத்திரத்தை பிரிவு 23-ன் கீழ் ரத்து செய்யலாம்.",
    verbal_script_en: "Under Section 23 of the Senior Citizens Act 2007, any transfer of property to adult children is statutorily conditional upon caring for the parent. The RDO Tribunal has the legal jurisdiction to void the deed and order summary eviction within 90 days. Elderline 14567 assists senior citizens directly.",
    verbal_script_ta: "மூத்த குடிமக்கள் நலச் சட்டம் 2007 பிரிவு 23-ன் படி, பெற்றோரை பராமரிக்காத பிள்ளைகளுக்கு வழங்கப்பட்ட சொத்து தானப் பத்திரத்தை ரத்து செய்யவும், 90 நாட்களில் அவர்களை வீட்டை விட்டு வெளியேற்றவும் RDO தீர்ப்பாயத்திற்கு அதிகாரம் உண்டு. எல்டர்லைன் 14567 மூலம் உதவி பெறலாம்.",
    department_en: "Social Welfare and Women Empowerment Dept",
    department_ta: "சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை",
    portal_url: "https://tnsocialwelfare.tn.gov.in",
    helpline: "14567",
    key_points_en: [
      "Elderline National Helpline: 14567 (Free 24x7 toll-free assistance)",
      "RDO Maintenance Tribunal orders up to ₹10,000 monthly maintenance allowance",
      "Summary eviction of abusive children from senior-owned home within 90 days",
      "Total cancellation of property gift deeds under Section 23 if care is denied"
    ],
    key_points_ta: [
      "முதியோர் இலவச தேசிய உதவி எண்: 14567 (24x7 கட்டணமில்லா உதவி)",
      "RDO தீர்ப்பாயம் மூலம் மாதம் ₹10,000 வரை ஜீவனாம்ச உத்தரவு",
      "பெற்றோரின் வீட்டை ஆக்கிரமிக்கும் பிள்ளைகளை 90 நாளில் வெளியேற்றும் அதிகாரம்",
      "பராமரிக்காத பிள்ளைகளுக்கு எழுதப்பட்ட சொத்து தானப் பத்திரங்களை பிரிவு 23-ன் கீழ் ரத்து செய்யும் உரிமை"
    ],
    steps_en: [
      "Dial Elderline 14567 for free field counseling and guidance",
      "File simple written petition to Revenue Divisional Officer (RDO) Maintenance Tribunal",
      "Attach proof of age (Aadhaar/Voter ID) and property documents",
      "Tribunal issues appearance notice and delivers binding order within 90 days"
    ],
    steps_ta: [
      "14567 எண்ணை அழைத்து இலவச ஆலோசனையையும் கள உதவிகளையும் பெறுங்கள்",
      "வருவாய் கோட்டாட்சியர் (RDO) தீர்ப்பாயத்தில் எளிய மனு ஒன்றைத் தாக்கல் செய்யுங்கள்",
      "வயது சான்று (ஆதார்/வாக்காளர் அட்டை) மற்றும் சொத்து ஆவணங்களை இணையுங்கள்",
      "RDO தீர்ப்பாயம் இரு தரப்பையும் விசாரித்து 90 நாட்களில் தீர்ப்பு வழங்கும்"
    ]
  },
  {
    id: "right-pwd",
    slug: "rights-of-persons-with-disabilities-act-2016",
    icon: Shield,
    category: "pwd",
    badge_en: "Disability Rights & Equality",
    badge_ta: "மாற்றுத்திறனாளிகள் சம உரிமை",
    badgeCls: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    name_en: "Rights of Persons with Disabilities (RPwD Act 2016)",
    name_ta: "மாற்றுத்திறனாளிகள் உரிமைகள் சட்டம் 2016",
    statutory_section_en: "Sections 3, 20 & 34 RPwD Act 2016",
    statutory_section_ta: "RPwD சட்டம் பிரிவு 3, 20 & 34",
    timeline_sla_en: "UDID Single Window / 4% Public Employment Quota",
    timeline_sla_ta: "சர்வதேச UDID ஒற்றைச் சாளரம் / 4% அரசுப் பணி இடஒதுக்கீடு",
    penalty_en: "Fines up to ₹5 Lakhs and imprisonment for discrimination or atrocities (Sec 89 & 92)",
    penalty_ta: "பாகுபாடு காட்டுபவர்களுக்கு ₹5 லட்சம் வரை அபராதம் மற்றும் சிறை தண்டனை (பிரிவு 89 & 92)",
    fee_en: "Zero fee for certificates, assistive aids, and transit concessions",
    fee_ta: "சான்றிதழ்கள், உபகரணங்கள் மற்றும் பயண சலுகைகளுக்கு கட்டணம் இல்லை",
    desc_en: "Guarantees full non-discrimination, 4% government job reservation, 5% higher education quota, barrier-free infrastructure, and free state bus passes.",
    desc_ta: "மாற்றுத்திறனாளிகளுக்கு அரசுப் பணிகளில் 4% இடஒதுக்கீடு, உயர்கல்வியில் 5% இடஒதுக்கீடு, கட்டணமில்லா அரசு பேருந்து பயணம் மற்றும் சம உரிமை உத்தரவாதம்.",
    content_en: "The RPwD Act 2016 recognizes 21 categories of disabilities and mandates equal opportunity, barrier-free accessibility in public buildings and transit, 4% reservation in government employment, 5% reservation in colleges, and monthly welfare maintenance allowances under the Tamil Nadu Differently Abled Welfare Board.",
    content_ta: "மாற்றுத்திறனாளிகள் நலச் சட்டம் 2016 படி 21 வகையான மாற்றுத்திறன்களுக்கு அரசுப் பணிகளில் 4% கட்டாய இடஒதுக்கீடு, உயர்கல்வியில் 5% இடஒதுக்கீடு, கட்டணமில்லா அரசு பேருந்து பயணம் மற்றும் மாதாந்திர பராமரிப்பு உதவித்தொகை வழங்கப்படுகிறது.",
    verbal_script_en: "Under Sections 3 and 20 of the RPwD Act 2016, no establishment can discriminate against a person with disability. Tamil Nadu State Transport Undertakings are statutorily bound to recognize verified disability passes and provide barrier-free accessible boarding.",
    verbal_script_ta: "RPwD சட்டம் 2016 பிரிவு 3 மற்றும் 20-ன் படி மாற்றுத்திறனாளிகளுக்கு எதிராக எந்த நிறுவனமும் பாகுபாடு காட்ட முடியாது. அரசுப் பேருந்துகளில் கட்டணமில்லா இலவச பயண பாஸ் சட்டப்பூர்வ உரிமையாகும்.",
    department_en: "Welfare of Differently Abled Persons Dept",
    department_ta: "மாற்றுத்திறனாளிகள் நலத் துறை",
    portal_url: "https://www.scda.tn.gov.in",
    helpline: "1800-425-0111",
    key_points_en: [
      "4% Mandatory Reservation in Tamil Nadu Public Employment",
      "5% Reservation in Higher Educational Institutions",
      "Free transit bus pass across all Tamil Nadu State Transport buses (SETC/MTC)",
      "Single-Window National Unique Disability ID (UDID) Card"
    ],
    key_points_ta: [
      "தமிழ்நாடு அரசுப் பணியிடங்களில் 4% கட்டாய வேலைவாய்ப்பு இடஒதுக்கீடு",
      "உயர்கல்வி கல்வி நிறுவனங்களில் 5% மாணவர் சேர்க்கை இடஒதுக்கீடு",
      "அரசுப் போக்குவரத்துக் கழகப் பேருந்துகளில் கட்டணமில்லா இலவச பயண சலுகை",
      "ஒற்றைச் சாளர தேசிய UDID அடையாள அட்டை மூலம் அனைத்து நலத்திட்டங்கள்"
    ],
    steps_en: [
      "Apply for UDID on swavlambancard.gov.in or at District Disability Rehabilitation Centre (DDRC)",
      "Undergo medical board assessment at Government District Headquarters Hospital",
      "Receive permanent UDID Card with digital barcode",
      "Avail free bus pass, assistive retrofitted scooters, and pension at District Welfare Office"
    ],
    steps_ta: [
      "swavlambancard.gov.in தளம் வழியாக அல்லது மாவட்ட மாற்றுத்திறனாளிகள் நல அலுவலகத்தில் பதிவு செய்யுங்கள்",
      "அரசு மாவட்ட தலைமை மருத்துவமனையில் மருத்துவக் குழு பரிசோதனையில் பங்கேற்கவும்",
      "டிஜிட்டல் பார்கோடு கொண்ட நிரந்தர UDID ஸ்மார்ட் அட்டையைப் பெறுங்கள்",
      "இலவச பேருந்து பாஸ், உதவி உபகரணங்கள் மற்றும் மாதாந்திர ஓய்வூதியத்திற்கு விண்ணப்பியுங்கள்"
    ]
  },
  {
    id: "right-domestic-violence",
    slug: "protection-of-women-from-domestic-violence-act",
    icon: Shield,
    category: "vulnerable",
    badge_en: "Women Protection & Safety",
    badge_ta: "பெண்கள் பாதுகாப்பு & சட்டம்",
    badgeCls: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    name_en: "Protection of Women from Domestic Violence Act 2005",
    name_ta: "குடும்ப வன்முறை தடுப்புச் சட்ட உரிமைகள் 2005",
    statutory_section_en: "Sections 12, 17, 18, 19 & 20 PWDVA 2005",
    statutory_section_ta: "PWDVA சட்டம் பிரிவு 12, 17, 18 & 20",
    timeline_sla_en: "3-Day First Court Hearing / 60-Day Case Disposal",
    timeline_sla_ta: "3 நாட்களில் முதல் நீதிமன்ற விசாரணை / 60 நாட்களில் இறுதித் தீர்ப்பு",
    penalty_en: "Non-bailable arrest and up to 1 year imprisonment for breach of protection order (Sec 31)",
    penalty_ta: "நீதிமன்ற பாதுகாப்பு உத்தரவை மீறினால் பிணையில் வர முடியாத கைது மற்றும் 1 ஆண்டு சிறை",
    fee_en: "Zero court fees; free legal aid advocate assigned by DLSA",
    fee_ta: "நீதிமன்ற கட்டணம் இல்லை; இலவச அரசு சட்ட உதவி வழக்கறிஞர் நியமனம்",
    desc_en: "Protects women from physical, verbal, emotional, economic, and sexual abuse within shared domestic households, granting immediate residence and stay orders.",
    desc_ta: "பெண்களுக்கு எதிராக குடும்பத்தில் நடக்கும் உடலளவிலான, வார்த்தை மற்றும் பொருளாதார வன்முறைகளுக்கு எதிரான சட்டப் பாதுகாப்பு மற்றும் குடியிருப்பு உரிமை.",
    content_en: "Under PWDVA 2005, any woman suffering abuse from spouse or relatives in a shared household can file for immediate Protection Orders, Residence Orders (cannot be thrown out of home), Compensation Orders, and interim maintenance without paying court fees. Protection Officers in all 38 Tamil Nadu districts provide free legal and shelter aid.",
    content_ta: "குடும்ப வன்முறை தடுப்புச் சட்டம் 2005 படி பாதிக்கப்பட்ட பெண்கள் பாதுகாப்பு அதிகாரி மூலம் நீதிமன்ற பாதுகாப்பு உத்தரவு, தங்கும் உரிமை, ஜீவனாம்சம் மற்றும் இலவச சட்ட உதவியைப் பெறலாம். 38 மாவட்டங்களிலும் பாதுகாப்பு அதிகாரிகள் செயல்படுகின்றனர்.",
    verbal_script_en: "Under Section 17 of PWDVA 2005, every woman has the statutory right to reside in the shared household regardless of whether she holds a title deed. Harassment or economic deprivation triggers non-bailable penal action under Section 31. Calling 181 or 1091 provides immediate police protection.",
    verbal_script_ta: "குடும்ப வன்முறை தடுப்புச் சட்டம் பிரிவு 17-ன் படி வீட்டின் உரிமை யாரிடம் இருந்தாலும் பெண்ணுக்கு அந்த வீட்டில் தங்கி வாழும் முழு சட்ட உரிமை உண்டு. துன்புறுத்துவது பிணையில் வர முடியாத குற்றமாகும். 181 அல்லது 1091 மூலம் உடனடி பாதுகாப்பு பெறலாம்.",
    department_en: "Social Welfare and Women Empowerment Dept",
    department_ta: "சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை",
    portal_url: "https://tnsocialwelfare.tn.gov.in",
    helpline: "181",
    key_points_en: [
      "Women 24/7 Toll-Free Crisis Helpline: 181 (instant emergency support)",
      "District Protection Officers in all 38 Tamil Nadu districts provide free legal aid",
      "Statutory Residence Order guarantees woman cannot be evicted from marital home",
      "Breach of Magistrate Protection Order is a non-bailable criminal offense"
    ],
    key_points_ta: [
      "பெண்கள் 24x7 இலவச அவசர உதவி எண்: 181 (உடனடி காவல் & தங்குமிட உதவி)",
      "தமிழ்நாட்டின் 38 மாவட்டங்களிலும் அரசு பாதுகாப்பு அதிகாரிகள் இலவச சட்ட உதவி அளிக்கின்றனர்",
      "கணவன் வீட்டை விட்டு பெண்ணை வெளியேற்ற முடியாது; குடியிருப்பு உத்தரவு பெறலாம்",
      "நீதிமன்ற பாதுகாப்பு உத்தரவை மீறினால் பிணையில் வர முடியாத குற்றமாகும்"
    ],
    steps_en: [
      "Call 181 or visit the nearest District Social Welfare Office / Protection Officer",
      "Protection Officer records Domestic Incident Report (DIR) without fees",
      "Magistrate court conducts hearing within 3 days and grants ex-parte protection order",
      "Free shelter home and police escort provided if facing imminent physical threat"
    ],
    steps_ta: [
      "181 எண்ணை அழையுங்கள் அல்லது மாவட்ட சமூக நல அலுவலக பாதுகாப்பு அதிகாரியை அணுகுங்கள்",
      "பாதுகாப்பு அதிகாரி கட்டணமின்றி உள்நாட்டு சம்பவ அறிக்கையை (DIR) பதிவு செய்வார்",
      "நீதிமன்றம் 3 நாட்களுக்குள் வழக்கை விசாரித்து இடைக்கால பாதுகாப்பு உத்தரவு பிறப்பிக்கும்",
      "உயிருக்கு அச்சுறுத்தல் இருப்பின் இலவச அரசு காப்பகம் மற்றும் காவல் பாதுகாப்பு அளிக்கப்படும்"
    ]
  },
  {
    id: "right-labor-minimum-wage",
    slug: "right-to-fair-wages-tn-shops-act",
    icon: Building,
    category: "labor",
    badge_en: "Labor & Worker Rights",
    badge_ta: "தொழிலாளர் உரிமைகள்",
    badgeCls: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    name_en: "Right to Fair Minimum Wages & Working Conditions",
    name_ta: "குறைந்தபட்ச கூலி & தொழிலாளர் பாதுகாப்பு உரிமைகள்",
    statutory_section_en: "Sections 7, 9 & 11 TN Shops & Establishments Act",
    statutory_section_ta: "தமிழ்நாடு கடைகள் சட்டம் பிரிவு 7, 9 & 11",
    timeline_sla_en: "8 Hours/Day Work Cap / Double Overtime Pay",
    timeline_sla_ta: "நாள் ஒன்றுக்கு 8 மணி நேர வரம்பு / கூடுதல் நேரத்திற்கு இரட்டிப்பு ஊதியம்",
    penalty_en: "Employer prosecution, business closure notice, and recovery of unpaid dues",
    penalty_ta: "தொழிலாளர் துறை மூலம் நிறுவனத்தின் மீது வழக்கு, அபராதம் மற்றும் நிலுவைத் தொகை மீட்பு",
    fee_en: "Zero fee to file grievance before Assistant Commissioner of Labour",
    fee_ta: "தொழிலாளர் உதவி ஆணையரிடம் புகார் அளிக்க கட்டணம் தேவையில்லை",
    desc_en: "Guarantees statutory minimum wages, mandatory weekly rest, double overtime pay for extra hours, and safe working conditions for all private and commercial employees.",
    desc_ta: "தனியார் துறை ஊழியர்களுக்கான குறைந்தபட்ச கூலி, வாராந்திர ஊதியத்துடன் கூடிய விடுமுறை மற்றும் கூடுதல் வேலை நேரத்திற்கான இரட்டிப்பு ஊதிய உரிமை.",
    content_en: "Under the Tamil Nadu Shops and Establishments Act and Minimum Wages Act, no employer can demand working hours beyond 8 hours/day (48 hours/week) without paying double overtime wages. Employers must grant 1 mandatory weekly paid holiday, 12 casual leaves, 12 sick leaves, and equal remuneration for men and women doing equal work.",
    content_ta: "தமிழ்நாடு கடைகள் மற்றும் நிறுவனங்கள் சட்டத்தின்படி தொழிலாளர்களுக்கு நாள் ஒன்றுக்கு 8 மணி நேர வேலை, கூடுதல் நேரத்திற்கு இரட்டிப்பு ஊதியம், வாரத்தில் ஒரு நாள் கட்டாய ஊதியத்துடன் கூடிய விடுமுறை மற்றும் மகப்பேறு கால விடுப்பு வழங்கப்பட வேண்டும்.",
    verbal_script_en: "Under Section 9 of the Tamil Nadu Shops and Establishments Act, any hour worked beyond 8 hours a day requires overtime wages at double the ordinary wage rate. Depriving weekly paid holidays or withholding minimum wages violates statutory labour laws enforceable by the Inspector of Labour.",
    verbal_script_ta: "தமிழ்நாடு கடைகள் மற்றும் நிறுவனங்கள் சட்டம் பிரிவு 9-ன் படி, நாள் ஒன்றுக்கு 8 மணி நேரத்திற்கு மேல் பணிபுரிந்தால் இரட்டிப்பு கூடுதல் நேர ஊதியம் வழங்கப்பட வேண்டும். இதனை மீறுவது தொழிலாளர் நல சட்டப்படி குற்றமாகும்.",
    department_en: "Labour Welfare and Skill Development Dept",
    department_ta: "தொழிலாளர் நலன் மற்றும் திறன் மேம்பாட்டுத் துறை",
    portal_url: "https://labour.tn.gov.in",
    helpline: "155214",
    key_points_en: [
      "Mandatory 8 Hours/Day (48 Hours/Week) statutory work ceiling",
      "Double Overtime Pay for every extra hour worked beyond 8 hours",
      "1 Mandatory Paid Weekly Rest Day for all commercial employees",
      "Equal Remuneration Act guarantees equal wages for men and women"
    ],
    key_points_ta: [
      "நாளுக்கு 8 மணி நேரம் (வாரத்திற்கு 48 மணி நேரம்) சட்டப்பூர்வ வேலை வரம்பு",
      "8 மணி நேரத்திற்கு மேல் பணிபுரிந்தால் இரட்டிப்பு கூடுதல் நேர ஊதியம்",
      "அனைத்து ஊழியர்களுக்கும் வாரத்தில் ஒரு நாள் கட்டாய ஊதியத்துடன் கூடிய விடுமுறை",
      "ஆண் மற்றும் பெண் இருவருக்கும் சம வேலைக்கு சம ஊதியம் உறுதி"
    ],
    steps_en: [
      "Maintain a personal log of daily punch-in/out hours, emails, and salary slips",
      "Request overtime calculations in writing from HR or management",
      "If refused, file online grievance on labour.tn.gov.in portal",
      "Approach the local Assistant Commissioner of Labour (Conciliation) for recovery"
    ],
    steps_ta: [
      "பணி நேரம், மின்னஞ்சல்கள் மற்றும் சம்பள ரசீதுகளை தனிப்பட்ட முறையில் சேகரித்து வையுங்கள்",
      "கூடுதல் நேர ஊதியத்தைக் கணக்கிட்டு வழங்க நிர்வாகத்திற்கு எழுத்துப்பூர்வமாக மனு அளியுங்கள்",
      "மறுக்கப்பட்டால் labour.tn.gov.in தளத்தில் தொழிலாளர் துறையிடம் புகார் அளியுங்கள்",
      "தொழிலாளர் உதவி ஆணையரிடம் நிலுவைத் தொகையை மீட்க மனு தாக்கல் செய்யுங்கள்"
    ]
  }
];

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
    answer_ta: "முடியாது. RTI சட்டம் பிரிவு 6(2)-ன் படி தகவல் கோரும் குடிமகன் அதற்கான காரணத்தை அரசுக்குத் தெரிவிக்க வேண்டிய அவசியமே இல்லை. காரணம் கேட்பது சட்டவிரோதமாகும்."
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
  const [expandedRightId, setExpandedRightId] = useState("right-rti");
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

  // Active Scenario object
  const activeScenario = useMemo(() => {
    return CRISIS_SCENARIOS.find((s) => s.id === selectedScenarioId) || CRISIS_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Filtered Rights
  const filteredRights = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CITIZEN_RIGHTS.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !q ||
        item.name_en.toLowerCase().includes(q) ||
        item.name_ta.toLowerCase().includes(q) ||
        item.desc_en.toLowerCase().includes(q) ||
        item.desc_ta.toLowerCase().includes(q) ||
        item.statutory_section_en.toLowerCase().includes(q) ||
        item.statutory_section_ta.toLowerCase().includes(q) ||
        item.verbal_script_en.toLowerCase().includes(q) ||
        item.verbal_script_ta.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <AwarenessSubNav activePath="/awareness/rights" />

      {/* Hero Header with Legal Defense Authority Aesthetic */}
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
                  "You do not need an expensive advocate to protect basic civic dignities. Know your exact legal sections, government SLAs, official helplines, and verbatim scripts to speak when challenged.",
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

            {/* Quick Action Box: RTI Generator Drawer Launcher */}
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

      {/* Optional Embedded RTI Draft Generator Drawer */}
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

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        
        {/* SECTION 1: "SOLVE YOUR SITUATION" INTERACTIVE CRISIS SIMULATOR */}
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
                  "Select your current situation to see the exact legal clause, what to say out loud, and what the authorities cannot legally do.",
                  "கீழே உள்ள நிலைமைகளில் ஒன்றை அழுத்தினால் நீங்கள் என்ன பேச வேண்டும் மற்றும் அதிகாரிகள் என்ன செய்ய முடியாது என்ற விவரம் உடனே தோன்றும்."
                )}
              </p>
            </div>
          </div>

          {/* Situation Selector Buttons */}
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

              {/* Direct Call Helpline Button */}
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${activeScenario.helpline}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition active:scale-95"
                >
                  <PhoneCall className="w-4 h-4 text-slate-950" />
                  <span>{T("Call", "அழைக்க")} {activeScenario.helpline}</span>
                  <span className="text-[10px] font-semibold opacity-75 hidden sm:inline">({T(activeScenario.helpline_name_en, activeScenario.helpline_name_ta)})</span>
                </a>
                <a
                  href={activeScenario.portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                  title={T("Open Government Portal", "அரசு தளம்")}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Split Content: What to say vs What authority cannot do */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              
              {/* Verbal Script to Speak (Psychological Confidence) */}
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
                  <span>{T("Tip: Speak calmly and politely. Citing the exact statutory rule signals you know the law and prevents harassment.", "குறிப்பு: அமைதியாகவும் பணிவாகவும் பேசுங்கள். சட்டப் பிரிவைக் குறிப்பிடுவது தேவையற்ற அத்துமீறலைத் தடுக்கும்.")}</span>
                </p>
              </div>

              {/* What authorities CANNOT legally do */}
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

            {/* Jump to deep card */}
            <div className="mt-6 pt-4 border-t border-indigo-900/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {T("Need full statutory details and penalty clauses?", "முழு சட்ட விதிகளையும் அபராத விவரங்களையும் அறிய வேண்டுமா?")}
              </span>
              <button
                onClick={() => {
                  setExpandedRightId(activeScenario.target_right_id);
                  const el = document.getElementById(activeScenario.target_right_id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="inline-flex items-center gap-1 text-blue-300 hover:text-white font-bold underline"
              >
                <span>{T("Jump to Full Statutory Act Below", "கீழே உள்ள சட்டத்திற்குச் செல்லவும்")}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: CATEGORY TABS & FILTER MATRIX */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{T("Statutory Directory", "சட்டக் கையேடு")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {T("Master Statutory Citizen Rights in Tamil Nadu", "தமிழ்நாட்டில் குடிமக்களுக்கான 8 முக்கிய சட்டப்பூர்வ உரிமைகள்")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {T("Filter by legal domain or search specific SLAs and government departments.", "துறை வாரியாக வடிகட்டி உங்கள் உரிமைகளைப் படியுங்கள்.")}
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

          {/* SECTION 3: THE 8 STATUTORY CARDS LIST */}
          <div className="grid grid-cols-1 gap-6">
            {filteredRights.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {T("No citizen rights found matching your search", "தேடலுக்குரிய உரிமைகள் கிடைக்கவில்லை")}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {T("Try searching for 'RTI', 'Police', 'Consumer', 'SLA', or clear your search query.", "'RTI', 'போலீஸ்', 'நுகர்வோர்' போன்ற சொற்களைப் பயன்படுத்தித் தேடுங்கள்.")}
                </p>
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
                const isExpanded = expandedRightId === right.id;

                return (
                  <article
                    key={right.id}
                    id={right.id}
                    className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${
                      isExpanded
                        ? "border-blue-500 dark:border-blue-500/80 ring-1 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="p-6 sm:p-8">
                      {/* Card Header */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex-shrink-0 border border-blue-100 dark:border-blue-800">
                            <IconComp className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${right.badgeCls}`}>
                                {T(right.badge_en, right.badge_ta)}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {T(right.statutory_section_en, right.statutory_section_ta)}
                              </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                              {T(right.name_en, right.name_ta)}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              {T("Department", "துறை")}: <span className="font-semibold text-slate-700 dark:text-slate-300">{T(right.department_en, right.department_ta)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 self-start lg:self-center">
                          {right.helpline && (
                            <a
                              href={`tel:${right.helpline}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl border border-emerald-200 dark:border-emerald-800 transition"
                              title={T(`Call official helpline ${right.helpline}`, `அழைக்க ${right.helpline}`)}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{right.helpline}</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleWhatsAppShare(right)}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl transition"
                            title={T("Share on WhatsApp", "வாட்ஸ்அப்பில் பகிருங்கள்")}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExpandedRightId(isExpanded ? null : right.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition"
                          >
                            <span>{isExpanded ? T("Show Less", "சுருக்கவும்") : T("View Full Legal Provisions", "முழு சட்ட விவரங்கள்")}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Summary Banner: SLA & Penalty */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 text-xs">
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">{T("Statutory SLA / Deadline", "சட்டப்பூர்வ காலக்கெடு")}</span>
                            <span className="text-slate-500 dark:text-slate-400">{T(right.timeline_sla_en, right.timeline_sla_ta)}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">{T("Penalty on Defaulting Official", "அதிகாரி மீதான அபராதம்")}</span>
                            <span className="text-slate-500 dark:text-slate-400">{T(right.penalty_en, right.penalty_ta)}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 sm:col-span-2 lg:col-span-1">
                          <Scale className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">{T("Court / Application Fee", "மனு / நீதிமன்றக் கட்டணம்")}</span>
                            <span className="text-slate-500 dark:text-slate-400">{T(right.fee_en, right.fee_ta)}</span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        {T(right.desc_en, right.desc_ta)}
                      </p>

                      {/* EXPANDABLE DEEP-DIVE SECTION */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
                          
                          {/* Statutory Overview */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                              {T("Comprehensive Statutory Overview", "சட்டப்பூர்வ விரிவான விளக்கம்")}
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl leading-relaxed border border-slate-100 dark:border-slate-800">
                              {T(right.content_en, right.content_ta)}
                            </p>
                          </div>

                          {/* Verbal Script Box */}
                          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                  {T("Citizen Verbal Script — What to Say to the Official", "அதிகாரியிடம் நீங்கள் பேச வேண்டிய சட்டப்பூர்வ பதில்")}
                                </span>
                              </div>
                              <button
                                onClick={() => handleCopy(lang === "ta" ? right.verbal_script_ta : right.verbal_script_en, `right-script-${right.id}`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition"
                              >
                                {copiedKey === `right-script-${right.id}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-400">{T("Copied!", "நகலெடுக்கப்பட்டது!")}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{T("Copy Script", "நகலெடு")}</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                              &ldquo;{T(right.verbal_script_en, right.verbal_script_ta)}&rdquo;
                            </p>
                          </div>

                          {/* Key Provisions Grid */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                              {T("Statutory Rules & Citizen Protections", "முக்கிய சட்ட விதிகள் & பாதுகாப்புகள்")}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {(lang === "ta" ? right.key_points_ta : right.key_points_en).map((point, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  <span className="leading-snug">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* How to Invoke This Right (Step by Step) */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                              {T("Step-by-Step Action Plan (உடனடி நடவடிக்கை வழிகாட்டி)", "படிப்படியான நடவடிக்கை வழிகாட்டி")}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {(lang === "ta" ? right.steps_ta : right.steps_en).map((step, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] inline-flex items-center justify-center mb-2">
                                    {idx + 1}
                                  </span>
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Footer Action Links */}
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/rights/${right.slug}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition"
                              >
                                <span>{T("Read Dedicated Guide Article", "முழுமையான கட்டுரையைப் படியுங்கள்")}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>

                            <div className="flex items-center gap-3">
                              <a
                                href={right.portal_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                              >
                                <span>{T("Open Official Government Portal", "அரசு அதிகாரப்பூர்வ தளம்")}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* SECTION 4: CITIZEN RIGHTS MYTHS VS FACTS ACCORDION */}
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

        {/* SECTION 5: OFFICIAL STATUTORY HELPLINES MATRIX */}
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

        {/* SECTION 6: CROSS-LINKING RELATED MODULES */}
        <AwarenessRelatedLinks currentSection="rights" />
      </div>
    </div>
  );
}
