"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone, Shield, AlertTriangle, Users, Heart, BookOpen, Zap, Droplets,
  ExternalLink, ArrowLeft, Search, Copy, Check, MapPin, Building2,
  Share2, MessageCircle, Siren, Compass, Flame, Activity, Info, CheckCircle2,
  ChevronDown, ChevronUp, FileText, ArrowRight, ShieldAlert
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import { DISTRICTS } from "@/lib/districts";

// Speed dial core matrix
const SPEED_DIAL_HOTLINES = [
  { num: "112", label_en: "Unified Emergency (Police, Fire, Medical)", label_ta: "தேசிய ஒருங்கிணைந்த அவசர உதவி", cat: "critical", bg: "bg-red-500", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/50", desc_en: "Works without SIM balance or roaming across India", desc_ta: "சிம் பேலன்ஸ் இன்றியும் இயங்கும் தேசிய உதவி எண்" },
  { num: "108", label_en: "Free Ambulance (GVK EMRI)", label_ta: "இலவச அவசர ஆம்புலன்ஸ்", cat: "medical", bg: "bg-rose-500", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-900/50", desc_en: "Accidents, cardiac arrest, maternity & trauma care", desc_ta: "விபத்துக்கள், மாரடைப்பு, பிரசவ மருத்துவ உதவி" },
  { num: "1912", label_en: "Minnalagam TANGEDCO (EB)", label_ta: "மின்னகம் மின்தடை & கம்பி அறுதல்", cat: "utility", bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/50", desc_en: "24x7 Power cuts, snapped live wire, transformer sparking", desc_ta: "மின்தடை, மின்கம்பி அறுந்து விழுதல், டிரான்ஸ்பார்மர் பழுது" },
  { num: "1930", label_en: "National Cyber Crime (Golden Hour)", label_ta: "சைபர் கிரைம் வங்கி மோசடி", cat: "police", bg: "bg-purple-500", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-900/50", desc_en: "Instant freeze of stolen funds in OTP & UPI scams (<2h)", desc_ta: "வங்கி நிதி மோசடி நடந்தால் உடனடி மீட்பு (<2 மணி நேரம்)" },
  { num: "1070", label_en: "State Disaster Management (TNDMA)", label_ta: "மாநில பேரிடர் ஆணையம் (TNDMA)", cat: "disaster", bg: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-900/50", desc_en: "Secretariat control desk for cyclones, reservoir floods", desc_ta: "புயல், மழை வெள்ளம் மற்றும் பேரிடர் கட்டுப்பாட்டு அறை" },
  { num: "101", label_en: "Fire & Rescue Services", label_ta: "தீயணைப்பு & மீட்புப் பணிகள்", cat: "critical", bg: "bg-orange-500", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-900/50", desc_en: "Fire outbreaks, structural collapse, flood boat rescue", desc_ta: "தீ விபத்து, கட்டட விபத்துக்கள், நீர் மீட்பு பணிகள்" },
  { num: "100", label_en: "Tamil Nadu Police Control Room", label_ta: "தமிழ்நாடு காவல் கட்டுப்பாட்டு அறை", cat: "police", bg: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-900/50", desc_en: "Law & order, assault, robbery, night distress", desc_ta: "குற்றத் தடுப்பு, சட்ட ஒழுங்கு, திருட்டு, அவசர உதவி" },
  { num: "1913", label_en: "Greater Chennai Corporation (GCC)", label_ta: "சென்னை மாநகராட்சி கட்டுப்பாட்டு மையம்", cat: "utility", bg: "bg-cyan-500", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-900/50", desc_en: "Subway waterlogging, tree falls, stormwater drains", desc_ta: "சுரங்கப்பாதை நீர் தேக்கம், மரம் விழுதல், மழைநீர் வடிகால்" },
  { num: "181", label_en: "Women in Distress Helpline", label_ta: "பெண்கள் உதவி மையம் (24x7)", cat: "protection", bg: "bg-pink-500", text: "text-pink-700 dark:text-pink-400", border: "border-pink-200 dark:border-pink-900/50", desc_en: "Domestic violence, harassment, emergency shelter", desc_ta: "குடும்ப வன்முறை, பாலியல் தொல்லை, சட்ட உதவி" },
  { num: "1098", label_en: "Childline Emergency Support", label_ta: "குழந்தைகள் உதவி மையம் (1098)", cat: "protection", bg: "bg-teal-500", text: "text-teal-700 dark:text-teal-400", border: "border-teal-200 dark:border-teal-900/50", desc_en: "Child labor, missing children, cruelty & abuse", desc_ta: "குழந்தைத் தொழிலாளர், காணாமல் போன குழந்தைகள் மீட்பு" },
  { num: "104", label_en: "TN Health Information & Advice", label_ta: "மருத்துவ ஆலோசனை & முதலுதவி", cat: "medical", bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/50", desc_en: "Blood bank availability, poison info, doctor guidance", desc_ta: "ரத்த வங்கி விவரங்கள், விஷ முறிவு தகவல், மருத்துவர் ஆலோசனை" },
  { num: "1064", label_en: "DVAC Anti-Corruption Line", label_ta: "லஞ்ச ஒழிப்பு & ஊழல் தடுப்பு (DVAC)", cat: "police", bg: "bg-slate-600", text: "text-slate-700 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", desc_en: "Report government officers demanding bribes", desc_ta: "அரசு அலுவலகங்களில் லஞ்சம் கேட்பவர்கள் மீது ரகசிய புகார்" },
];

// Life-saving Golden Hour SOP Guides
const GOLDEN_HOUR_SOPS = [
  {
    id: "snakebite",
    icon: "🐍",
    title_en: "Snake Bite Emergency Protocol",
    title_ta: "பாம்பு கடி முதலுதவி & மருத்துவ நெறிமுறைகள்",
    urgency: "CRITICAL (Golden Hour: 60 mins)",
    urgency_ta: "அவசரம் (முதல் 60 நிமிடங்கள்)",
    phone: "108",
    summary_en: "Immobilize the bitten limb immediately like a fracture. Rush to the nearest Taluk/District Government Hospital equipped with Anti-Snake Venom (ASV).",
    summary_ta: "பாதிக்கப்பட்ட கைகால்களை அசைக்காமல் வைக்கவும். உடனடியாக Anti-Snake Venom (ASV) மருந்து உள்ள அரசு மருத்துவமனைக்கு கொண்டு செல்லவும்.",
    dos_en: [
      "Keep the victim calm; elevated heart rate speeds venom circulation.",
      "Immobilize the bitten limb using a splint or sling (keep below heart level).",
      "Remove tight rings, bangles, shoes before tissue swelling begins.",
      "Dial 108 ambulance immediately and state 'Snakebite emergency'.",
      "Take a safe photo of the snake if possible for species identification (never attempt to catch it)."
    ],
    dos_ta: [
      "பாதிக்கப்பட்டவரை அமைதிப்படுத்தவும்; பதற்றம் விஷத்தை விரைவாக பரப்பும்.",
      "கடிபட்ட கையை அல்லது காலை அசைக்காமல் கட்டு அல்லது குச்சி வைத்து தாங்கவும்.",
      "வீக்கம் ஏற்படுவதற்குள் மோதிரம், வளையல், காலணிகளை அகற்றவும்.",
      "108 ஆம்புலன்ஸை அழைத்து 'பாம்பு கடி அவசரம்' என தெளிவாக கூறவும்.",
      "பாம்பை பிடிக்க முயற்சிக்காமல், முடிந்தால் தூரத்திலிருந்து புகைப்படம் எடுக்கவும்."
    ],
    donts_en: [
      "DO NOT tie tight rope/tourniquet — this traps venom causing tissue necrosis and gangrene.",
      "DO NOT make incisions, blade cuts, or suck the venom with your mouth.",
      "DO NOT apply ice, herbal pastes, potassium permanganate, or electric shocks.",
      "DO NOT waste time visiting native quacks; only Anti-Snake Venom (ASV) saves lives."
    ],
    donts_ta: [
      "கயிறு அல்லது துணியால் மிக இறுக்கமாக கட்ட வேண்டாம் — இது ரத்த ஓட்டத்தை தடுத்து அழுகலை ஏற்படுத்தும்.",
      "காயத்தை பிளேடால் கீறவோ அல்லது வாயால் விஷத்தை உறிஞ்சவோ கூடாது.",
      "ஐஸ் கட்டிகள், பச்சிலை, எலக்ட்ரிக் ஷாக் போன்றவற்றை வைக்க வேண்டாம்.",
      "நாட்டு வைத்தியத்திற்கு சென்று பொன்னான நேரத்தை வீணடிக்காதீர்கள்; ASV மட்டுமே உயிரைக் காக்கும்."
    ]
  },
  {
    id: "livewire",
    icon: "⚡",
    title_en: "Snapped Live Wire & Waterlogging Hazard",
    title_ta: "மின்கம்பி அறுந்து விழுதல் & வெள்ள மின் விபத்து",
    urgency: "IMMEDIATE DANGER",
    urgency_ta: "உடனடி ஆபத்து",
    phone: "1912",
    summary_en: "Maintain a strict 10-meter perimeter. Water conducts lethal voltage. Call TANGEDCO Minnalagam 1912 or WhatsApp 94987 94987 immediately.",
    summary_ta: "குறைந்தது 10 மீட்டர் (33 அடி) தூரம் விலகி நிற்கவும். தேங்கிய நீரில் மின்சாரம் பாயும். மின்வாரியத்திற்கு 1912 எண்ணில் உடனடியாக தெரிவிக்கவும்.",
    dos_en: [
      "Keep a minimum distance of 10 meters (33 feet) from any fallen wire or wet surface.",
      "If caught near a downed wire, shuffle away keeping both feet close together on the ground.",
      "Call Minnalagam Helpline at 1912 or WhatsApp 94987 94987 with exact pole/street location.",
      "Alert pedestrians and motorcyclists to avoid entering the flooded street.",
      "To rescue a victim, shut off the mains MCB first. If impossible, use only dry wood or PVC pipe."
    ],
    dos_ta: [
      "அறுந்து கிடக்கும் கம்பி அல்லது ஈரப்பரப்பில் இருந்து குறைந்தது 10 மீட்டர் தூரம் விலகி நிற்கவும்.",
      "அருகில் மாட்டிக்கொண்டால், இரு கால்களையும் தரையில் ஒட்டியபடி உரசியவாறு (shuffle) நகரவும்.",
      "1912 மின்னகம் அல்லது 94987 94987 வாட்ஸ்அப் எண்ணிற்கு தெரு விவரங்களுடன் தகவல் தெரிவிக்கவும்.",
      "அந்த வழியாக பாதசாரிகள் அல்லது வாகனங்கள் செல்லாதவாறு எச்சரிக்கவும்.",
      "பாதிக்கப்பட்டவரை காப்பாற்ற முதலில் மெயின் சுவிட்சை அணைக்கவும்; உலர்ந்த மரக்கட்டையை மட்டுமே பயன்படுத்தவும்."
    ],
    donts_en: [
      "DO NOT touch the wire, pole, stay-wire, or water touching the conductor.",
      "DO NOT approach a victim with bare hands while they remain in contact with the live source.",
      "DO NOT drive vehicles over fallen wires."
    ],
    donts_ta: [
      "மின் கம்பி, மின்கம்பம் அல்லது நீரில் கை வைக்கவோ மிதிக்கவோ கூடாது.",
      "மின்சாரம் பாயும் நபரை வெறும் கையால் தொடக்கூடாது.",
      "கம்பி விழுந்து கிடக்கும் சாலையின் மீது இருசக்கர அல்லது நான்கு சக்கர வாகனங்களை ஓட்டக்கூடாது."
    ]
  },
  {
    id: "cyberfraud",
    icon: "💳",
    title_en: "Online Bank / UPI Scam (120-Min Golden Hour)",
    title_ta: "சைபர் வங்கி / UPI பண மோசடி (முதல் 2 மணி நேரம்)",
    urgency: "GOLDEN HOUR: Act within 2 hours",
    urgency_ta: "கோல்டன் ஹவர்: 2 மணி நேரத்திற்குள்",
    phone: "1930",
    summary_en: "Call 1930 immediately to trigger Citizen Financial Cyber Fraud Reporting System (CFCFRMS). This freezes the money in the scammer's bank account before ATM withdrawal.",
    summary_ta: "1930 எண்ணை உடனடியாக அழைத்து உங்கள் பணத்தை ஏமாற்றியவரின் வங்கி கணக்கிலேயே முடக்க (freeze) வைக்கவும்.",
    dos_en: [
      "Dial 1930 immediately or log in to cybercrime.gov.in within 120 minutes of fraud.",
      "Keep transaction details ready: Bank Account Number, UPI Reference/UTR Number, Debited Amount, Scam Timestamp.",
      "Immediately freeze your debit/credit card and net banking access via your bank's mobile app or hotline.",
      "Take screenshots of phishing SMS, fake APK files, fake payment receipts, and WhatsApp chats."
    ],
    dos_ta: [
      "பணம் பறிபோன 120 நிமிடங்களுக்குள் 1930 அழைக்கவும் அல்லது cybercrime.gov.in இல் புகார் செய்யவும்.",
      "பரிவர்த்தனை UTR எண், உங்கள் வங்கி கணக்கு எண், பணம் சென்ற UPI முகவரி ஆகியவற்றை தயாராக வைத்திருக்கவும்.",
      "உடனடியாக உங்கள் வங்கி செயலி மூலம் டெபிட் கார்டு மற்றும் நெட் பேங்கிங்கை பிளாக் செய்யவும்.",
      "மோசடி குறுஞ்செய்தி, போலி APK லிங்க் மற்றும் வாட்ஸ்அப் உரையாடல்களை ஸ்கிரீன்ஷாட் எடுக்கவும்."
    ],
    donts_en: [
      "DO NOT delete WhatsApp chats, call logs, or SMS containing fake payment links.",
      "DO NOT share OTP or PIN numbers with anyone claiming to be a bank cyber investigator.",
      "DO NOT install remote screen-sharing apps like AnyDesk, TeamViewer, or RustDesk on advice of callers."
    ],
    donts_ta: [
      "மோசடி நபரின் வாட்ஸ்அப் மெசேஜ்கள் அல்லது அழைப்பு பதிவுகளை அழிக்க வேண்டாம்.",
      "வங்கி அதிகாரி என்று கூறி யாராவது OTP கேட்டால் ஒருபோதும் பகிர வேண்டாம்.",
      "AnyDesk, TeamViewer போன்ற ஸ்கிரீன் ஷேரிங் செயலிகளை மற்றவர்கள் கூறினால் பதிவிறக்க வேண்டாம்."
    ]
  },
  {
    id: "floodcyclone",
    icon: "🌊",
    title_en: "Cyclone & Flash Flood Evacuation Drill",
    title_ta: "புயல் & மழை வெள்ள கால பாதுகாப்பு நெறிமுறைகள்",
    urgency: "DISASTER ALERT",
    urgency_ta: "பேரிடர் எச்சரிக்கை",
    phone: "1070",
    summary_en: "Turn off mains electricity and gas valves. Move to first floor or relief shelter. Call 1070 (State) or 1077 (District Collectorate) for rescue boat assistance.",
    summary_ta: "மெயின் மின் சுவிட்ச் மற்றும் கேஸ் சிலிண்டரை அணைக்கவும். முதல் தளம் அல்லது நிவாரண முகாமிற்கு செல்லவும். படகு மீட்புக்கு 1070 / 1077 அழைக்கவும்.",
    dos_en: [
      "Turn off the main electrical circuit breaker (MCB) and invertor before water enters home.",
      "Store 48 hours of clean drinking water in sealed containers; boil all tap water before drinking.",
      "Keep mobile phones, power banks, essential chronic medicines, and identity documents in ziplock waterproof bags.",
      "Call District Disaster Management at 1077 or Chennai GCC at 1913 for boat evacuation.",
      "Listen strictly to All India Radio / IMD weather advisories; ignore viral social media rumors."
    ],
    dos_ta: [
      "வீட்டுக்குள் தண்ணீர் நுழைவதற்கு முன் மெயின் சுவிட்ச் (MCB) மற்றும் இன்வெர்ட்டரை அணைக்கவும்.",
      "48 மணி நேரத்திற்கு தேவையான குடிநீரை சேமித்து வைக்கவும்; குடிநீரை நன்கு காய்ச்சி குடிக்கவும்.",
      "போன், பவர் பேங்க், அத்தியாவசிய மருந்துகள், ஆதார் போன்ற ஆவணங்களை வாட்டர்ப்ரூஃப் கவரில் பாதுகாக்கவும்.",
      "படகு மற்றும் உணவு தேவைக்கு மாவட்ட கட்டுப்பாட்டு அறை 1077 அல்லது சென்னை GCC 1913 அழைக்கவும்.",
      "வதந்திகளை நம்பாமல் வானிலை ஆய்வு மையம் (IMD) தரும் அதிகாரப்பூர்வ எச்சரிக்கைகளை மட்டும் கவனிக்கவும்."
    ],
    donts_en: [
      "DO NOT walk, swim, or drive through flowing water in flooded subways.",
      "DO NOT touch street light posts, traffic signal poles, or cable transformers in knee-deep water.",
      "DO NOT leave pets tied down without escape options in ground floor compounds."
    ],
    donts_ta: [
      "சுரங்கப்பாதைகளில் தேங்கியுள்ள மழை நீரில் வாகனங்களை ஓட்டவோ அல்லது நடக்கவோ கூடாது.",
      "முழங்கால் அளவு நீரில் தெருவிளக்கு கம்பங்கள், மின்சார பெட்டிகளை தொடக்கூடாது.",
      "செல்லப்பிராணிகளை தரைத்தளத்தில் கட்டி வைக்காமல் பாதுகாப்பான உயரத்திற்கு மாற்றவும்."
    ]
  },
  {
    id: "cardiac",
    icon: "🫀",
    title_en: "Heart Attack & Stroke (FAST Test)",
    title_ta: "மாரடைப்பு & பக்கவாதம் அவசர சிகிச்சை",
    urgency: "CRITICAL (Golden Hour: 30 mins)",
    urgency_ta: "அவசரம் (முதல் 30 நிமிடங்கள்)",
    phone: "108",
    summary_en: "Call 108 immediately. Check FAST symptoms for stroke. If unresponsive and not breathing normally, begin Hands-Only CPR at 100-120 chest compressions per minute.",
    summary_ta: "108 ஆம்புலன்ஸை உடனே அழைக்கவும். சுயநினைவு இழந்தால் நெஞ்சின் நடுவில் நிமிடத்திற்கு 100-120 முறை அழுத்தம் கொடுத்து CPR செய்யவும்.",
    dos_en: [
      "Call 108 ambulance immediately and report 'Suspected heart attack / stroke'.",
      "Keep the patient seated in a comfortable 'W' position with head and shoulders supported.",
      "Loosen tight clothing around neck, chest, and waist.",
      "Check FAST for Stroke: Facial drooping, Arm weakness, Slurred Speech, Time to call 108.",
      "If unconscious and not breathing, begin chest compressions in center of chest at 100–120 bpm (to the beat of 'Stayin Alive')."
    ],
    dos_ta: [
      "108 ஆம்புலன்ஸை அழைத்து 'மாரடைப்பு அவசரம்' என்று நிலைமையை விவரிக்கவும்.",
      "நோயாளியை படுக்க வைக்காமல், சாய்ந்த நிலையில் (W பொசிஷன்) அமர வைக்கவும்.",
      "கழுத்து, மார்பு மற்றும் இடுப்பு பகுதியில் உள்ள ஆடைகளை தளர்த்தவும்.",
      "பக்கவாதத்திற்கான FAST சோதனை: முகம் கோணல், கை பலவீனம், பேச்சு குழப்பம் — தாமதிக்காமல் மருத்துவமனைக்கு செல்லவும்.",
      "சுயநினைவு இழந்தால் மார்பின் மையத்தில் கைகளை வைத்து விநாடிக்கு 2 முறை வீதம் உறுதியாக அழுத்தி CPR செய்யவும்."
    ],
    donts_en: [
      "DO NOT let the patient walk, climb stairs, or drive themselves to the hospital.",
      "DO NOT give food, water, or caffeinated drinks to an unconscious or nauseous patient.",
      "DO NOT wait for symptoms to 'go away on their own'."
    ],
    donts_ta: [
      "நோயாளியை நடக்கவோ, மாடி ஏறவோ அல்லது தானாக வாகனம் ஓட்டவோ அனுமதிக்காதீர்கள்.",
      "சுயநினைவு மங்கும் நிலையில் உள்ளவருக்கு தண்ணீர் அல்லது உணவு கொடுக்க வேண்டாம்.",
      "வலி தானாக சரியாகிவிடும் என்று நினைத்து நேரத்தை கடத்த வேண்டாம்."
    ]
  }
];

// Departmental Master Helplines Directory
const EMERGENCY_CATEGORIES = [
  {
    category_id: "critical",
    category_en: "Critical & Universal Emergency (24x7)",
    category_ta: "அனைத்து அவசர நிலைகள் & பேரிடர் (24x7)",
    icon: Phone,
    color: "bg-red-600",
    entries: [
      { name_en: "National Emergency Unified Helpline (Police, Fire, Medical)", name_ta: "தேசிய ஒருங்கிணைந்த அவசர உதவி (காவல், தீ, மருத்துவ)", number: "112", desc_en: "Single number for all emergencies with instant GPS dispatch", desc_ta: "அனைத்து அவசர நிலைகளுக்கும் ஒரே எண் — ஜிபிஎஸ் விரைவு சேவை" },
      { name_en: "Free Emergency Ambulance (GVK EMRI 108)", name_ta: "இலவச அவசர ஆம்புலன்ஸ் (108 சேவை)", number: "108", desc_en: "Medical emergencies, road accidents, maternal labor transport", desc_ta: "மருத்துவ அவசரம், விபத்துக்கள், பிரசவ உதவி — கட்டணமில்லை" },
      { name_en: "Fire & Rescue Services", name_ta: "தீயணைப்பு & மீட்புப் பணிகள்", number: "101", desc_en: "Fire accidents, building collapse, flood rescue boats", desc_ta: "தீ விபத்து, கட்டட விபத்துக்கள், மீட்புப் பணிகள்" },
      { name_en: "State Disaster Management (TNDMA Flood & Cyclone)", name_ta: "மாநில பேரிடர் மேலாண்மை ஆணையம் (வெள்ளம் & புயல்)", number: "1070", desc_en: "Tamil Nadu Disaster Control Room at Secretariat", desc_ta: "தலைமைச் செயலக பேரிடர் கட்டுப்பாட்டு அறை" },
    ],
  },
  {
    category_id: "police",
    category_en: "Police, Cyber Crime & Law Enforcement",
    category_ta: "காவல்துறை, சைபர் கிரைம் & சட்டப் பாதுகாப்பு",
    icon: Shield,
    color: "bg-blue-600",
    entries: [
      { name_en: "Tamil Nadu Police Control Room", name_ta: "தமிழ்நாடு காவல் கட்டுப்பாட்டு அறை", number: "100", desc_en: "Crime, theft, harassment, physical danger, assault", desc_ta: "குற்றம், திருட்டு, ஆபத்து மற்றும் அவசர உதவி" },
      { name_en: "National Cyber Crime Helpline (Golden Hour Portal)", name_ta: "சைபர் கிரைம் உதவி எண் (ஆன்லைன் நிதி மோசடி)", number: "1930", desc_en: "Immediate freeze of stolen funds in OTP, UPI, credit card scams", desc_ta: "UPI, OTP, வங்கி நிதி மோசடி நடந்தால் உடனடி மீட்பு" },
      { name_en: "Traffic Police Control & Road Accidents", name_ta: "போக்குவரத்து காவல் கட்டுப்பாட்டு அறை", number: "103", desc_en: "Traffic gridlocks, hit-and-run, highway accidents", desc_ta: "போக்குவரத்து நெரிசல், விபத்துக்கள் தகவல்" },
      { name_en: "Directorate of Vigilance & Anti-Corruption (DVAC)", name_ta: "ஊழல் தடுப்பு மற்றும் கண்காணிப்புப் பிரிவு (DVAC)", number: "1064", desc_en: "Bribery demands, corruption at government offices", desc_ta: "அரசு அலுவலகங்களில் லஞ்சம் மற்றும் ஊழல் புகார்கள்" },
      { name_en: "Railway Police & Passenger Security", name_ta: "ரயில்வே காவல் & பாதுகாப்பு உதவி", number: "139", desc_en: "Emergency security inside trains and platforms", desc_ta: "ரயில் பெட்டிகள் மற்றும் நிலையங்களில் அவசர உதவி" },
    ],
  },
  {
    category_id: "utilities",
    category_en: "Public Utilities, Electricity & Municipal",
    category_ta: "மின்சாரம், குடிநீர் & நகராட்சி கட்டுப்பாட்டு அறைகள்",
    icon: Zap,
    color: "bg-amber-600",
    entries: [
      { name_en: "TANGEDCO Minnalagam (24x7 Power Cuts & Wire Snaps)", name_ta: "மின்னகம் — மின்வாரிய புகார் மையம் (TANGEDCO)", number: "1912", desc_en: "Statewide power failure, transformer repair, snapped live wire", desc_ta: "மின்தடை, மின் கம்பி அறுந்து விழுதல், டிரான்ஸ்பார்மர் பழுது" },
      { name_en: "TANGEDCO WhatsApp Grievance Cell", name_ta: "மின்வாரிய வாட்ஸ்அப் நேரடி புகார்", number: "94987 94987", desc_en: "Direct Minnalagam WhatsApp consumer service", desc_ta: "மின்னகம் வாட்ஸ்அப் நேரடி புகார் எண்" },
      { name_en: "Greater Chennai Corporation (GCC Flood & Municipal Control)", name_ta: "சென்னை மாநகராட்சி கட்டுப்பாட்டு அறை (GCC 1913)", number: "1913", desc_en: "Subway waterlogging, tree falls, garbage, stormwater drains", desc_ta: "சுரங்கப்பாதை தேக்கம், மரம் விழுதல், குப்பை அகற்றல்" },
      { name_en: "Metrowater CMWSSB (Drinking Water & Sewage)", name_ta: "சென்னை மெட்ரோவாட்டர் (குடிநீர் & கழிவுநீர்)", number: "044-45674567", desc_en: "Contaminated water supply, sewer overflow, tanker booking", desc_ta: "குடிநீர் விநியோகம், கழிவுநீர் நிரம்பி வழிதல், லாரி நீர்" },
      { name_en: "Coimbatore Municipal Corporation Control Room", name_ta: "கோயம்புத்தூர் மாநகராட்சி கட்டுப்பாட்டு அறை", number: "0422-2302323", desc_en: "Municipal civic issues, streetlights, drainage", desc_ta: "மாநகராட்சி புகார்கள், தெருவிளக்கு, கழிவுநீர்" },
      { name_en: "Civil Supplies & Smart Ration Cards", name_ta: "உணவுப் பொருள் வழங்கல் & ரேஷன் அட்டை உதவி", number: "1967", desc_en: "PDS shortage, fair price shop grievances, e-KYC", desc_ta: "ரேஷன் கடை குறைபாடுகள், குடும்ப அட்டை சிக்கல்கள்" },
    ],
  },
  {
    category_id: "health",
    category_en: "Health, Blood Banks, Women & Children",
    category_ta: "மருத்துவம், ரத்த வங்கி, பெண்கள் & குழந்தைகள்",
    icon: Heart,
    color: "bg-pink-600",
    entries: [
      { name_en: "Tamil Nadu Women in Distress Helpline", name_ta: "பெண்கள் உதவி மையம் (24x7)", number: "181", desc_en: "Domestic violence, eve-teasing, legal aid, emergency shelter", desc_ta: "குடும்ப வன்முறை, பாலியல் தொல்லை, சட்ட உதவி & தங்குமிடம்" },
      { name_en: "Childline India (Protection & Rescue)", name_ta: "குழந்தைகள் உதவி மையம் (சைல்டுலைன்)", number: "1098", desc_en: "Child abuse, missing child, child labour, forced marriage", desc_ta: "குழந்தைத் தொழிலாளர், பாலியல் துன்புறுத்தல், குழந்தை திருமணம்" },
      { name_en: "Tamil Nadu Health Advisory & Blood Banks", name_ta: "தமிழ்நாடு மருத்துவ தகவல் & ரத்த வங்கி உதவி", number: "104", desc_en: "Blood group availability, poison anti-venom directory, medical query", desc_ta: "ரத்த வங்கி இருப்பு, விஷமுறிவு மருத்துவமனை வழிகாட்டுதல்" },
      { name_en: "Tele-MANAS Mental Health Counseling", name_ta: "டெலி-மானஸ் மனநல ஆலோசனை மையம்", number: "14416", desc_en: "24x7 Free psychological support and suicide prevention counseling", desc_ta: "இலவச மனநல ஆலோசனை மற்றும் தற்கொலை தடுப்பு உதவி" },
      { name_en: "Senior Citizens National Helpline (Elderline)", name_ta: "மூத்த குடிமக்கள் தேசிய உதவி எண் (எல்டர்லைன்)", number: "14567", desc_en: "Elder abuse, rescue of abandoned parents, pension legal aid", desc_ta: "முதியோர் பராமரிப்பு, கைவிடப்பட்ட பெற்றோர் மீட்பு" },
      { name_en: "Chief Minister Comprehensive Health Insurance (CMCHIS)", name_ta: "முதலமைச்சர் மருத்துவக் காப்பீடு உதவி மையம்", number: "1800-425-3993", desc_en: "Cashless hospital admission, claim verification", desc_ta: "காப்பீட்டு அட்டை விபரம், மருத்துவமனை அனுமதி, புகார்கள்" },
      { name_en: "Tamil Nadu Chief Minister Helpline", name_ta: "முதலமைச்சரின் உதவி மையம் (CM Helpline)", number: "1100", desc_en: "Public grievance escalation to district collectors and HoDs", desc_ta: "அரசுத் துறை தாமதங்கள் மற்றும் முதல்வர் தனிப்பிரிவு மனுக்கள்" },
    ],
  },
];

export default function AwarenessEmergency() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  // Tab mode: "speed_dial" | "district_desks" | "sop_guides" | "directory"
  const [activeTab, setActiveTab] = useState("speed_dial");
  const [query, setQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedNumber, setCopiedNumber] = useState(null);
  const [expandedSop, setExpandedSop] = useState("snakebite");

  usePageMeta({
    title: "Tamil Nadu 24x7 Emergency Command Center & Crisis Helplines | VizhiTN",
    description: "Verified 24x7 emergency contacts across Tamil Nadu — Police 100/112, Ambulance 108, Minnalagam 1912, GCC 1913, Cyber Crime 1930, Women 181, CM 1100, and District Disaster 1077.",
  });

  const handleCopy = (number) => {
    navigator.clipboard.writeText(number.replace(/\s/g, ""));
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleWhatsAppShare = (name, number, desc) => {
    const text = `🚨 *VizhiTN Verified Emergency Contact*\n\n📌 *${name}*\n📞 *Helpline Number:* ${number}\nℹ️ ${desc}\n\n🌐 View statewide disaster desks & SOP guides: https://vizhitn.in/helplines`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Filtered categories for directory
  const filteredCategories = useMemo(() => {
    return EMERGENCY_CATEGORIES.map((cat) => {
      if (selectedCategory !== "all" && cat.category_id !== selectedCategory) {
        return { ...cat, entries: [] };
      }
      const matchingEntries = cat.entries.filter((e) => {
        const q = query.toLowerCase().trim();
        if (!q) return true;
        return (
          e.name_en.toLowerCase().includes(q) ||
          e.name_ta.toLowerCase().includes(q) ||
          e.number.includes(q) ||
          e.desc_en.toLowerCase().includes(q) ||
          e.desc_ta.toLowerCase().includes(q)
        );
      });
      return { ...cat, entries: matchingEntries };
    }).filter((cat) => cat.entries.length > 0);
  }, [query, selectedCategory]);

  // Filtered districts for district desks
  const filteredDistricts = useMemo(() => {
    if (!query) return DISTRICTS;
    const q = query.toLowerCase().trim();
    return DISTRICTS.filter(d =>
      d.name_en.toLowerCase().includes(q) ||
      d.name_ta.toLowerCase().includes(q) ||
      d.slug.toLowerCase().includes(q)
    );
  }, [query]);

  // Selected district info
  const currentDistrictObj = useMemo(() => {
    if (!selectedDistrict) return null;
    return DISTRICTS.find(d => d.slug === selectedDistrict) || null;
  }, [selectedDistrict]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-5 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link
            href="/awareness"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> {T("Back to Civic Awareness Hub", "விழிப்புணர்வு முகப்பிற்கு திரும்பு")}
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
              {T("24x7 DISPATCH DESK", "24x7 அவசர கட்டுப்பாட்டு மையம்")}
            </span>
          </div>
        </div>

        {/* ── COMMAND CENTER HERO BANNER ── */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 border border-slate-800 shadow-xl mb-6 p-5 sm:p-7 text-white">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                TN STATE CRISIS SYSTEM
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {T("All 38 Districts Covered • Zero Cost Toll-Free Helplines", "அனைத்து 38 மாவட்டங்களுக்கும் கட்டணமில்லா உதவி எண்கள்")}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2">
              {T("Tamil Nadu 24x7 Emergency Command Center", "தமிழ்நாடு 24x7 அவசர கட்டுப்பாட்டு மையம்")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mb-5">
              {T(
                "Direct 1-tap dial for live-wire electrocution, flood rescue, ambulance dispatch, cyber fraud Golden Hour freeze, and district collectorate crisis control rooms.",
                "மின்கம்பி அறுந்து விழுதல், மழை வெள்ள மீட்பு, அவசர ஆம்புலன்ஸ், வங்கி சைபர் மோசடி மற்றும் மாவட்ட ஆட்சியர் கட்டுப்பாட்டு அறைகளுக்கான நேரடி அழைப்புகள்."
              )}
            </p>

            {/* Quick Unified 112 Flash Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0">
                  <Phone className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">112</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-300 bg-red-950/80 px-2 py-0.5 rounded">
                      {T("Unified Emergency", "ஒருங்கிணைந்த உதவி")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {T("Police (100) + Fire (101) + Ambulance (108). Toll-free, works without SIM balance.", "காவல்துறை + தீயணைப்பு + ஆம்புலன்ஸ். சிம் பேலன்ஸ் இன்றியும் இயங்கும்.")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href="tel:112"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-sm px-6 py-2.5 rounded-xl shadow-md transition-transform active:scale-95"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  {T("Call 112 Now", "112 அழைக்கவும்")}
                </a>
                <button
                  onClick={() => handleCopy("112")}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 transition-colors"
                  title={T("Copy number", "நகலெடு")}
                >
                  {copiedNumber === "112" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── COMMAND TABS (Try Differently) ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {[
            { id: "speed_dial", icon: Zap, label_en: "⚡ Speed Dials", label_ta: "⚡ விரைவு அழைப்புகள்" },
            { id: "district_desks", icon: MapPin, label_en: "📍 38 District Desks (1077)", label_ta: "📍 38 மாவட்ட மையங்கள் (1077)" },
            { id: "sop_guides", icon: ShieldAlert, label_en: "🛡️ Golden Hour SOPs", label_ta: "🛡️ உயிர் காக்கும் நெறிமுறைகள்" },
            { id: "directory", icon: BookOpen, label_en: "📂 All Departments", label_ta: "📂 துறைசார் எண்கள்" },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex-shrink-0 transition-all ${
                  active
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-red-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {T(tab.label_en, tab.label_ta)}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: SPEED DIAL GRID ── */}
        {activeTab === "speed_dial" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {T("High-Urgency 1-Tap Speed Dial Hotlines", "உடனடி அவசர அழைப்பு பொத்தான்கள்")}
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {T("Toll-free 24 Hours", "கட்டணமில்லா 24 மணி நேர சேவை")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {SPEED_DIAL_HOTLINES.map((item) => {
                  const isCopied = copiedNumber === item.num;
                  return (
                    <div
                      key={item.num}
                      className={`bg-white dark:bg-slate-900 border ${item.border} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className={`text-2xl font-black font-mono tracking-tight ${item.text}`}>
                            {item.num}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopy(item.num)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title={T("Copy number", "எண்ணை நகலெடு")}
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleWhatsAppShare(T(item.label_en, item.label_ta), item.num, T(item.desc_en, item.desc_ta))}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              title={T("Share contact", "பகிர்")}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1">
                          {T(item.label_en, item.label_ta)}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {T(item.desc_en, item.desc_ta)}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                        <a
                          href={`tel:${item.num.replace(/[^0-9]/g, "")}`}
                          className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" />
                          {T(`Call ${item.num}`, `${item.num} அழைக்க`)}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bridge to Community Help */}
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {T("Looking for Blood Donors or Ambulance Assistance?", "ரத்த தானம் அல்லது ஆம்புலன்ஸ் உதவி தேவையா?")}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {T("Browse active community help requests or broadcast verified SOS help in your district.", "உங்கள் பகுதியில் உள்ள சமுதாய அவசர உதவி கோரிக்கைகளை பார்க்கவும்.")}
                  </p>
                </div>
              </div>
              <Link
                href="/help"
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                {T("Visit Citizen Help Center →", "உதவி மையத்திற்கு செல்ல →")}
              </Link>
            </div>
          </div>
        )}

        {/* ── TAB 2: 38 DISTRICT DISASTER CONTROL ROOMS (1077) ── */}
        {activeTab === "district_desks" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    {T("38 District Collectorate Disaster Control Desks", "38 மாவட்ட ஆட்சியர் பேரிடர் கட்டுப்பாட்டு மையங்கள்")}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {T("District disaster helpline 1077 routes to each respective District Collectorate during monsoons & emergencies.", "மழை வெள்ளம் மற்றும் பேரிடர் காலங்களில் மாவட்ட ஆட்சியர் அலுவலகத்தை நேரடியாக தொடர்பு கொள்ள 1077 அழைக்கலாம்.")}
                  </p>
                </div>
                <div className="w-full sm:w-64">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={T("Filter district...", "மாவட்டத்தை தேடு...")}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* District Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDistricts.map((d) => (
                  <div
                    key={d.slug}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-600 rounded-xl p-3.5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {T(d.name_en, d.name_ta)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          {d.region} TN
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                        {T("Collectorate Disaster Helpline", "மாவட்ட ஆட்சியர் பேரிடர் மையம்")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <a
                        href="tel:1077"
                        className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg inline-flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <Phone className="w-3 h-3 fill-current" />
                        {T("Call 1077", "1077 அழைக்க")}
                      </a>
                      <Link
                        href={`/${d.slug}`}
                        className="py-1.5 px-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg inline-flex items-center justify-center gap-1 transition-colors"
                      >
                        {T("Hub →", "பக்கம் →")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: GOLDEN HOUR SOPS & FIRST AID ── */}
        {activeTab === "sop_guides" && (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {T(
                  "Golden Hour SOPs are verified protocols reviewed against Tamil Nadu Public Health & Disaster Management standards. In any life-threatening situation, dial 108 or 112 immediately before reading instructions.",
                  "உயிருக்கு ஆபத்தான அவசர நிலையில் உடனடியாக 108 அல்லது 112 அழைக்கவும். பின்வரும் முதலுதவி நெறிமுறைகள் தமிழ்நாடு சுகாதாரத் துறை வழிகாட்டுதலின்படி தொகுக்கப்பட்டவை."
                )}
              </p>
            </div>

            <div className="space-y-3">
              {GOLDEN_HOUR_SOPS.map((sop) => {
                const isOpen = expandedSop === sop.id;
                return (
                  <div
                    key={sop.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-all"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => setExpandedSop(isOpen ? null : sop.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">{sop.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                              {T(sop.urgency, sop.urgency_ta)}
                            </span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              Direct Hotline: <strong className="text-red-600">{sop.phone}</strong>
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg mt-1">
                            {T(sop.title_en, sop.title_ta)}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {T(sop.summary_en, sop.summary_ta)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${sop.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          <Phone className="w-3 h-3 fill-current" />
                          {T(`Call ${sop.phone}`, `${sop.phone} அழைக்க`)}
                        </a>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </button>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                          {/* DO IMMEDIATELY */}
                          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4">
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              {T("DO IMMEDIATELY", "உடனடியாக செய்ய வேண்டியவை")}
                            </h4>
                            <ul className="space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
                              {(lang === "ta" ? sop.dos_ta : sop.dos_en).map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="font-bold text-emerald-600 flex-shrink-0">•</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* STRICTLY AVOID */}
                          <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4">
                            <h4 className="font-bold text-rose-800 dark:text-rose-300 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              {T("STRICTLY DO NOT DO", "ஒருபோதும் செய்யக்கூடாதவை")}
                            </h4>
                            <ul className="space-y-2 text-xs text-rose-950 dark:text-rose-200">
                              {(lang === "ta" ? sop.donts_ta : sop.donts_en).map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="font-bold text-rose-600 flex-shrink-0">✕</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Action footer */}
                        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500">
                            {T(`Emergency Hotline: ${sop.phone}`, `அவசர அழைப்பு எண்: ${sop.phone}`)}
                          </span>
                          <a
                            href={`tel:${sop.phone}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 fill-current" />
                            {T(`Dial ${sop.phone} Now`, `${sop.phone} உடனடியாக அழைக்க`)}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 4: COMPREHENSIVE DIRECTORY ── */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            {/* Search & Category Filter */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={T(
                    "Search helpline (e.g. power cut, cyber, police, metrowater, 1912)...",
                    "தேடுங்கள் (மின்சாரம், தண்ணீர், சைபர் கிரைம், போலீஸ், 1912)..."
                  )}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label_en: "All Categories", label_ta: "அனைத்தும்" },
                  { id: "critical", label_en: "Critical & Medical", label_ta: "அவசரம் & மருத்துவம்" },
                  { id: "police", label_en: "Police & Cyber", label_ta: "காவல்துறை & சைபர்" },
                  { id: "utilities", label_en: "Utilities (EB / Water)", label_ta: "மின்சாரம் / குடிநீர்" },
                  { id: "health", label_en: "Women & Healthcare", label_ta: "பெண்கள் & நல்வாழ்வு" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {T(cat.label_en, cat.label_ta)}
                  </button>
                ))}
              </div>
            </div>

            {/* Directory Listings */}
            <div className="space-y-8">
              {filteredCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.category_id}>
                    <div className="flex items-center gap-2.5 mb-3.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${cat.color} shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {T(cat.category_en, cat.category_ta)}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {cat.entries.map((entry) => {
                        const cleanPhone = entry.number.replace(/[^0-9]/g, "");
                        const isCopied = copiedNumber === entry.number;

                        return (
                          <div
                            key={entry.number}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-600 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between"
                          >
                            <div className="mb-3">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                                  {T(entry.name_en, entry.name_ta)}
                                </h3>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => handleCopy(entry.number)}
                                    title={T("Copy number", "எண்ணை நகலெடு")}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => handleWhatsAppShare(T(entry.name_en, entry.name_ta), entry.number, T(entry.desc_en, entry.desc_ta))}
                                    title={T("Share contact", "பகிர்")}
                                    className="p-1 text-slate-400 hover:text-emerald-600"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {T(entry.desc_en, entry.desc_ta)}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white tracking-wide">
                                {entry.number}
                              </span>
                              <a
                                href={`tel:${cleanPhone}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 fill-current" />
                                {T("Call Now", "அழைக்க")}
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CIVIC TRANSPARENCY & VERIFICATION FOOTER ── */}
        <div className="mt-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            {T("GOVERNMENT OF TAMIL NADU VERIFIED PROTOCOL", "தமிழ்நாடு அரசு சரிபார்க்கப்பட்ட நெறிமுறை")}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {T(
              "All helplines are verified against official Government of Tamil Nadu, TNDMA, and Central disaster directives. Report defunct lines or routing anomalies directly to the VizhiTN Civic Desk.",
              "அனைத்து எண்களும் தமிழ்நாடு அரசு, TNDMA மற்றும் மத்திய பேரிடர் வழிகாட்டுதலின்படி சரிபார்க்கப்பட்டவை. மாற்றங்கள் ஏதேனும் இருந்தால் VizhiTN செய்திப் பிரிவிற்கு தெரிவிக்கவும்."
            )}
          </p>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="emergency" />
      </div>
    </div>
  );
}
