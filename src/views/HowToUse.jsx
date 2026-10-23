"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText, Camera, MapPin, Zap, CloudRain, Heart, Scale,
  MessageSquare, Store, Phone, ArrowRight, HelpCircle, Sparkles,
  Search, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp,
  AlertTriangle, Trophy, Eye, Clock, Users, ArrowUpRight,
  Shield, ShieldCheck, Share2, Compass, Check
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

// Core Platform Action Pillars
const CORE_PILLARS = [
  {
    id: "civic_complaints",
    icon: Camera,
    color: "bg-red-600",
    text_color: "text-red-600 dark:text-red-400",
    border_color: "border-red-200 dark:border-red-900/50",
    bg_light: "bg-red-50/60 dark:bg-red-950/20",
    title_en: "File Civic Issues with Proof",
    title_ta: "ஆதாரத்துடன் பொதுப் புகார்களைப் பதிவிடுங்கள்",
    desc_en: "Document potholes, water pipe leaks, fallen trees, and garbage with exact geo-coordinates and photo evidence.",
    desc_ta: "சாலைப் பள்ளங்கள், குடிநீர் குழாய் உடைப்பு, குப்பை தேக்கம் ஆகியவற்றை புகைப்படம் மற்றும் இருப்பிடத்துடன் பதிவிடுங்கள்.",
    action_href: "/create",
    action_label_en: "Log an Issue Now",
    action_label_ta: "புகார் பதிவிட",
    steps_en: [
      { num: "01", title: "Capture Photo Evidence", text: "Take a clear daytime photo of the civic defect. Include street signs or landmarks in the frame whenever possible." },
      { num: "02", title: "Select District & Department", text: "Pick your district (e.g. Chennai, Coimbatore) and assigned department (Highways, GCC, TANGEDCO, Metrowater)." },
      { num: "03", title: "Community Verification", text: "Once published, nearby residents upvote and verify your post. High-verification posts are escalated to ward engineers." },
      { num: "04", title: "Track to Victory Wall", text: "When authorities resolve the defect, upload a 'Fixed' photo to celebrate on the community Victory Wall." }
    ],
    steps_ta: [
      { num: "01", title: "புகைப்பட ஆதாரம் எடுக்கவும்", text: "பாதிக்கப்பட்ட இடத்தின் தெளிவான புகைப்படத்தை எடுக்கவும். அடையாள பலகைகள் தெரியுமாறு எடுப்பது நல்லது." },
      { num: "02", title: "மாவட்டம் & துறையைத் தேர்வு செய்க", text: "உங்கள் மாவட்டம் மற்றும் தொடர்புடைய அரசுத் துறையை (மாநகராட்சி, நெடுஞ்சாலை, மின்வாரியம்) தேர்வு செய்யவும்." },
      { num: "03", title: "சமுதாய சரிபார்ப்பு", text: "பதிவிட்டவுடன் அப்பகுதி மக்கள் உறுதி செய்வார்கள். அதிக சரிபார்ப்பு பெற்ற புகார்கள் அதிகாரிகளுக்கு அனுப்பப்படும்." },
      { num: "04", title: "தீர்வு கண்டு வெற்றிச் சுவரில்", text: "சிக்கல் சரிசெய்யப்பட்டதும் 'Fixed' புகைப்படத்தை பதிவேற்றி வெற்றிச் சுவரில் பகிருங்கள்." }
    ],
    pro_tip_en: "Pro Tip: Posts with exact landmark text and at least one high-contrast photo receive 4x faster community verifications.",
    pro_tip_ta: "முக்கிய குறிப்பு: சரியான தெரு பெயர் மற்றும் தெளிவான புகைப்படத்துடன் கூடிய புகார்கள் 4 மடங்கு வேகமாக கவனிக்கப்படுகின்றன."
  },
  {
    id: "power_and_rain",
    icon: Zap,
    color: "bg-amber-600",
    text_color: "text-amber-600 dark:text-amber-400",
    border_color: "border-amber-200 dark:border-amber-900/50",
    bg_light: "bg-amber-50/60 dark:bg-amber-950/20",
    title_en: "Track Daily Power Cuts & Rain Alerts",
    title_ta: "மின்வெட்டு & மழை விடுமுறை அறிவிப்புகள்",
    desc_en: "Look up TANGEDCO scheduled power shutdown timings, affected streets, and District Collector school/college rain holiday circulars.",
    desc_ta: "மின்தடை நேரங்கள், பாதிக்கப்பட்ட பகுதிகள் மற்றும் மாவட்ட ஆட்சியர் அறிவிக்கும் மழை பள்ளி விடுமுறை செய்திகளை அறிக.",
    action_href: "/power-cuts-today-tamil-nadu",
    action_label_en: "Check Power Cuts Today",
    action_label_ta: "இன்றைய மின்தடை காண்க",
    steps_en: [
      { num: "01", title: "Select Your District", text: "Visit Power Cuts Today or Holiday Alerts and choose from all 38 Tamil Nadu districts." },
      { num: "02", title: "Check Substation Timings", text: "Review exact shutdown windows (e.g. 9:00 AM to 2:00 PM) and affected streets before planning battery or water usage." },
      { num: "03", title: "Rain Holiday Verification", text: "During monsoons, read official District Collector announcements verified against Collectorate PRO dispatches." },
      { num: "04", title: "1-Tap Minnalagam Helpline", text: "If power is not restored on time or you spot fallen live wires, tap 1912 to call Minnalagam instantly." }
    ],
    steps_ta: [
      { num: "01", title: "மாவட்டத்தை தேர்வு செய்க", text: "மின்தடை அல்லது பள்ளி விடுமுறை பக்கத்திற்கு சென்று உங்கள் மாவட்டத்தை தேர்வு செய்யவும்." },
      { num: "02", title: "துணை மின்நிலைய நேரங்கள்", text: "திட்டமிட்ட மின்தடை நேரம் (காலை 9:00 முதல் மதியம் 2:00 வரை) மற்றும் பாதிக்கப்பட்ட தெருக்களை முன்கூட்டியே அறியலாம்." },
      { num: "03", title: "மழை விடுமுறை சரிபார்ப்பு", text: "கனமழை நாட்களில் மாவட்ட ஆட்சியர் வெளியிடும் அதிகாரப்பூர்வ பள்ளி/கல்லூரி விடுமுறை அறிவிப்புகளை உடனுக்குடன் பெறலாம்." },
      { num: "04", title: "1912 மின்னகம் நேரடி அழைப்பு", text: "நேரத்திற்கு மின்சாரம் வராவிட்டால் அல்லது கம்பி அறுந்து விழுந்தால் 1912 எண்ணை நேரடியாக அழைக்கலாம்." }
    ],
    pro_tip_en: "Pro Tip: Power cut notices are updated daily at 7:30 AM based on official TANGEDCO circle notifications.",
    pro_tip_ta: "முக்கிய குறிப்பு: மின்வாரியத்தின் அதிகாரப்பூர்வ சுற்றறிக்கையின்படி தினசரி காலை 7:30 மணிக்கு தகவல்கள் புதுப்பிக்கப்படுகின்றன."
  },
  {
    id: "emergency_and_help",
    icon: Phone,
    color: "bg-rose-600",
    text_color: "text-rose-600 dark:text-rose-400",
    border_color: "border-rose-200 dark:border-rose-900/50",
    bg_light: "bg-rose-50/60 dark:bg-rose-950/20",
    title_en: "Emergency Helplines & Blood Support",
    title_ta: "24x7 அவசர எண்கள் & ரத்த தான உதவி",
    desc_en: "Access 1-tap direct dials for 112, 108 Ambulance, Minnalagam 1912, 1070 Disaster Control, or broadcast urgent blood donor requests.",
    desc_ta: "112, 108 ஆம்புலன்ஸ், 1912 மின்வாரியம், 1070 பேரிடர் எண்களை அழைக்கலாம்; அவசர ரத்த தான கோரிக்கைகளை பகிரலாம்.",
    action_href: "/helplines",
    action_label_en: "Open Emergency Command",
    action_label_ta: "அவசர கட்டுப்பாட்டு மையம்",
    steps_en: [
      { num: "01", title: "Instant 1-Tap Calling", text: "On the Emergency page, tap any verified button to initiate immediate cellular calling without typing." },
      { num: "02", title: "38 District Disaster Desks", text: "Switch to the District Desks tab to dial 1077 for your specific District Collectorate crisis room." },
      { num: "03", title: "Golden Hour SOPs", text: "Read life-saving first-aid workflows for snakebites, live wire electrocution, flood evacuation, and heart attacks." },
      { num: "04", title: "Post Community SOS", text: "Visit /help to request urgent blood units (e.g. O+, B-) or ambulance navigation in your hospital ward." }
    ],
    steps_ta: [
      { num: "01", title: "ஒரே தொடுதலில் அழைப்பு", text: "அவசர பக்கத்தில் உள்ள பொத்தானை அழுத்தி தட்டச்சு செய்யாமல் உடனடியாக நேரடியாக அழைக்கலாம்." },
      { num: "02", title: "38 மாவட்ட பேரிடர் எண்கள்", text: "மாவட்ட மையங்கள் பிரிவில் 1077 எண்ணை அழைத்து உங்கள் மாவட்ட ஆட்சியர் அலுவலகத்தை தொடர்பு கொள்ளலாம்." },
      { num: "03", title: "உயிர் காக்கும் முதலுதவி", text: "பாம்பு கடி, மின்கம்பி விபத்து, மழை வெள்ளம் மற்றும் மாரடைப்புக்கான அவசர முதலுதவி வழிகாட்டிகளை அறியலாம்." },
      { num: "04", title: "சமுதாய ரத்த தான கோரிக்கை", text: "/help பக்கத்தில் அவசர ரத்த தேவை (O+, B-) அல்லது மருத்துவமனை உதவியை பதிவிடலாம்." }
    ],
    pro_tip_en: "Pro Tip: Helpline 112 works without SIM card balance and routes emergency GPS dispatch automatically.",
    pro_tip_ta: "முக்கிய குறிப்பு: 112 எண் சிம் கார்டில் பேலன்ஸ் இன்றியும் இயங்கும்; தானியங்கி ஜிபிஎஸ் இருப்பிடத்தை கண்டறியும்."
  },
  {
    id: "scams_radar",
    icon: Shield,
    color: "bg-purple-600",
    text_color: "text-purple-600 dark:text-purple-400",
    border_color: "border-purple-200 dark:border-purple-900/50",
    bg_light: "bg-purple-50/60 dark:bg-purple-950/20",
    title_en: "Cyber Scam Radar & 1930 Helpline",
    title_ta: "சைபர் மோசடி ரேடார் & 1930 உதவி எண்",
    desc_en: "Stay protected against fake EB bill SMS, part-time job Telegram traps, Aadhaar biometric cloning, and learn 1930 Golden Hour freeze steps.",
    desc_ta: "போலி மின் கட்டண SMS, டெலிகிராம் பகுதிநேர வேலை மோசடிகள், ஆதார் பயோமெட்ரிக் பூட்டுதல் மற்றும் 1930 உதவி எண் வழிகாட்டிகள்.",
    action_href: "/scams",
    action_label_en: "Explore Scam Radar",
    action_label_ta: "மோசடி ரேடார் பார்க்க",
    steps_en: [
      { num: "01", title: "Spot Fake SMS & Links", text: "Learn how scammers spoof EB power cut notices, APK downloads, and traffic challan links." },
      { num: "02", title: "1930 Golden Hour Rule", text: "If money is transferred fraudulently, dial 1930 immediately within 120 minutes to freeze the destination account." },
      { num: "03", title: "Lock Aadhaar Biometrics", text: "Use the mAadhaar app to lock your fingerprint biometrics against unauthorized AePS withdrawals." },
      { num: "04", title: "File at cybercrime.gov.in", text: "Lodge formal complaints with bank transaction IDs and chat screenshots for cyber police investigation." }
    ],
    steps_ta: [
      { num: "01", title: "போலி SMS அடையாளம் காணுதல்", text: "மின் இணைப்பு துண்டிப்பு குறுஞ்செய்திகள் மற்றும் போலி APK செயலிகளை பதிவிறக்கம் செய்யாதீர்கள்." },
      { num: "02", title: "1930 அவசர உதவி எண்", text: "பணம் இழந்த 2 மணி நேரத்திற்குள் 1930 என்ற எண்ணை அழைத்தால் வங்கி பரிவர்த்தனையை முடக்க முடியும்." },
      { num: "03", title: "ஆதார் கைரேகை பூட்டு", text: "mAadhaar செயலி மூலம் கைரேகை பயோமெட்ரிக் முறையை பூட்டி AePS திருட்டை தடுக்கவும்." },
      { num: "04", title: "cybercrime.gov.in-ல் புகார்", text: "பரிவர்த்தனை எண்களுடன் தேசிய சைபர் தளத்தில் அதிகாரப்பூர்வ புகார் பதிவு செய்யலாம்." }
    ],
    pro_tip_en: "Pro Tip: If victimized by online financial fraud, dial 1930 within the 'Golden Hour' (under 120 minutes) to freeze the scammer's bank account.",
    pro_tip_ta: "முக்கிய குறிப்பு: ஆன்லைன் வங்கி மோசடி நடந்தால் 120 நிமிடங்களுக்குள் 1930 அழைத்தால் பணத்தை முடக்க முடியும்."
  },
  {
    id: "schemes_and_esevai",
    icon: Scale,
    color: "bg-teal-600",
    text_color: "text-teal-600 dark:text-teal-400",
    border_color: "border-teal-200 dark:border-teal-900/50",
    bg_light: "bg-teal-50/60 dark:bg-teal-950/20",
    title_en: "Government Schemes & e-Sevai Guides",
    title_ta: "அரசு நலத்திட்டங்கள் & இ-சேவை வழிகாட்டிகள்",
    desc_en: "Access step-by-step guides for Kalaignar Magalir Urimai, Smart Ration Card, Patta Chitta transfers, and e-Sevai certificates.",
    desc_ta: "கலைஞர் மகளிர் உரிமைத் தொகை, ஸ்மார்ட் ரேஷன் கார்டு, பட்டா மாறுதல் மற்றும் இ-சேவை சான்றிதழ் வழிகாட்டிகளை அறியலாம்.",
    action_href: "/schemes",
    action_label_en: "Browse Govt Schemes",
    action_label_ta: "அரசுத் திட்டங்கள் காண்க",
    steps_en: [
      { num: "01", title: "Select Scheme or Service", text: "Browse categorized Tamil Nadu welfare schemes, pension plans, or certificate checklists." },
      { num: "02", title: "Check Eligibility & Documents", text: "Review mandatory documents (Aadhaar, income certificate, ration card) before applying." },
      { num: "03", title: "Direct Official Portals", text: "Access authentic Government of Tamil Nadu URLs (tnesevai.tn.gov.in, eservices.tn.gov.in) with zero fraud risk." },
      { num: "04", title: "Track Grievance with CM Cell", text: "If applications are delayed unlawfully, use CM Special Cell 1100 escalation templates." }
    ],
    steps_ta: [
      { num: "01", title: "திட்டம் அல்லது சேவையைத் தேர்வு செய்க", text: "தமிழ்நாடு அரசின் சமூக நலத்திட்டங்கள், உதவித்தொகை அல்லது சான்றிதழ் பட்டியலை தேர்வு செய்யவும்." },
      { num: "02", title: "தகுதி & ஆவணங்களைச் சரிபார்க்கவும்", text: "விண்ணப்பிக்கும் முன் தேவையான ஆவணங்கள் (ஆதார், வருமான சான்று, குடும்ப அட்டை) குறித்து அறியவும்." },
      { num: "03", title: "அதிகாரப்பூர்வ அரசு இணையதளங்கள்", text: "போலி தளங்களைத் தவிர்த்து தமிழ்நாடு அரசின் அதிகாரப்பூர்வ இணையதள முகவரிகளை நேரடியாக அணுகலாம்." },
      { num: "04", title: "முதல்வர் உதவி மையம் 1100", text: "சான்றிதழ் கிடைப்பதில் தேவையற்ற தாமதம் ஏற்பட்டால் 1100 முதல்வர் தனிப்பிரிவு வழிகாட்டிகளைப் பயன்படுத்தலாம்." }
    ],
    pro_tip_en: "Pro Tip: Most e-Sevai certificate applications carry a fixed statutory fee of ₹60. Avoid paying extra charges to unauthorized agents.",
    pro_tip_ta: "முக்கிய குறிப்பு: பெரும்பாலான இ-சேவை சான்றிதழ்களுக்கான அரசு கட்டணம் ₹60 மட்டுமே. இடைத்தரகர்களிடம் கூடுதல் பணம் கொடுக்க வேண்டாம்."
  },
  {
    id: "tn_today_news",
    icon: FileText,
    color: "bg-blue-600",
    text_color: "text-blue-600 dark:text-blue-400",
    border_color: "border-blue-200 dark:border-blue-900/50",
    bg_light: "bg-blue-50/60 dark:bg-blue-950/20",
    title_en: "TN Today — State Development & Governance News",
    title_ta: "TN Today — தமிழக வளர்ச்சி & திட்டங்கள் செய்திகள்",
    desc_en: "In-depth, citizen-first reportage on Metro rail extensions, flyovers, water projects, and district administrative orders.",
    desc_ta: "மெட்ரோ ரயில் விரிவாக்கம், பாலங்கள், கூட்டுக்குடிநீர் திட்டங்கள் மற்றும் மாவட்ட நிர்வாக உத்தரவுகள் குறித்த ஆழமான செய்திகள்.",
    action_href: "/tn-today",
    action_label_en: "Read TN Today",
    action_label_ta: "TN Today செய்திகள்",
    steps_en: [
      { num: "01", title: "Verified Editorial Standards", text: "Articles are compiled exclusively from official Government Orders (GOs), Assembly announcements, and departmental releases." },
      { num: "02", title: "Track Infrastructure Milestones", text: "Follow physical progress percentages of highway bridges, canal restoration, and SIPCOT corridors." },
      { num: "03", title: "District-Wise Breakdown", text: "Filter development stories by your specific district to see what is being built in your neighbourhood." },
      { num: "04", title: "Share for Civic Accountability", text: "Share development timelines with ward councillors and community groups to ensure timely completion." }
    ],
    steps_ta: [
      { num: "01", title: "அரசு அரசாணைகளின்படி உண்மைத் தகவல்", text: "அரசாணைகள் (GO), சட்டமன்ற அறிவிப்புகள் மற்றும் அரசுத் துறை செய்திக் குறிப்புகளின்படி தொகுக்கப்படும் செய்திகள்." },
      { num: "02", title: "கட்டமைப்பு பணிகள் கண்காணிப்பு", text: "நெடுஞ்சாலை மேம்பாலங்கள், கால்வாய் தூர்வாருதல் மற்றும் தொழிற்பேட்டை பணிகளின் முன்னேற்றத்தை அறியலாம்." },
      { num: "03", title: "மாவட்ட வாரியான செய்திகள்", text: "உங்கள் மாவட்டத்தில் அரசு மேற்கொள்ளும் புதிய திட்டங்கள் மற்றும் வளர்ச்சிப் பணிகளை வடிகட்டி படிக்கலாம்." },
      { num: "04", title: "சமூகப் பொறுப்புணர்வுடன் பகிருங்கள்", text: "பணிகள் குறித்த காலக்கெடுவை உள்ளூர் பிரதிநிதிகளுடன் பகிர்ந்து திட்டங்களை விரைவுபடுத்தலாம்." }
    ],
    pro_tip_en: "Pro Tip: All TN Today articles are published in bilingual format with direct departmental reference citations.",
    pro_tip_ta: "முக்கிய குறிப்பு: அனைத்து கட்டுரைகளும் தமிழ் மற்றும் ஆங்கிலத்தில் அதிகாரப்பூர்வ ஆதார மேற்கோள்களுடன் வெளியிடப்படுகின்றன."
  }
];

// Complete Real Feature Catalog of VizhiTN
const PLATFORM_FEATURES_MATRIX = [
  { name_en: "Civic Complaints Feed", name_ta: "பொதுப் புகார்கள் நேரலை", route: "/explore", desc_en: "Browse live citizen issues across all 38 districts with filters", desc_ta: "38 மாவட்ட புகார்களை புகைப்படங்களுடன் நேரலையாக காண", audience: "All Citizens" },
  { name_en: "Log Issue (Create Receipt)", name_ta: "புகார் பதிவு செய்தல்", route: "/create", desc_en: "Submit civic grievances with photo, GPS, and department routing", desc_ta: "ஆதாரத்துடன் பொதுப் புகாரை பதிவு செய்து கண்காணிக்க", audience: "Registered Citizens" },
  { name_en: "38 District Portals", name_ta: "38 மாவட்ட இணைய முகப்புகள்", route: "/chennai", desc_en: "Hyperlocal feeds, ward stats, and grievance tallies for each district", desc_ta: "ஒவ்வொரு மாவட்டத்திற்கான பிரத்யேக செய்தி & புள்ளிவிவரங்கள்", audience: "All Citizens" },
  { name_en: "Power Cuts Today", name_ta: "இன்றைய மின்தடை நேரம்", route: "/power-cuts-today-tamil-nadu", desc_en: "TANGEDCO planned substation shutdown timings & affected streets", desc_ta: "மின்வாரிய பராமரிப்பு பணி காரணமாக மின்தடை ஆகும் பகுதிகள்", audience: "All Citizens" },
  { name_en: "School & College Holiday Alerts", name_ta: "மழை பள்ளி விடுமுறை செய்திகள்", route: "/school-college-holiday-alerts", desc_en: "District Collector official announcements for heavy rains", desc_ta: "மாவட்ட ஆட்சியர் அறிவிக்கும் அதிகாரப்பூர்வ பள்ளி விடுமுறைகள்", audience: "All Citizens" },
  { name_en: "TN Today News", name_ta: "TN Today தமிழக செய்திகள்", route: "/tn-today", desc_en: "State infrastructure, policy, metro rail, and development dispatches", desc_ta: "தமிழக கட்டமைப்பு, கொள்கைகள் மற்றும் வளர்ச்சித் திட்ட செய்திகள்", audience: "All Citizens" },
  { name_en: "Emergency Command Center", name_ta: "24x7 அவசர கட்டுப்பாட்டு மையம்", route: "/helplines", desc_en: "1-tap speed dials (112, 108, 1912, 1930) & District Disaster 1077", desc_ta: "அனைத்து அவசர உதவி எண்கள், பேரிடர் மற்றும் முதலுதவி நெறிமுறைகள்", audience: "24x7 Public" },
  { name_en: "Community SOS Help", name_ta: "சமுதாய அவசர உதவி மையம்", route: "/help", desc_en: "Blood requirement requests, ambulance help, missing persons", desc_ta: "ரத்த தான தேவை மற்றும் அவசர சமுதாய உதவி கோரிக்கைகள்", audience: "Volunteers & Citizens" },
  { name_en: "Scam Radar & Fraud Alerts", name_ta: "சைபர் மோசடி எச்சரிக்கை", route: "/scams", desc_en: "Fake EB bill SMS, part-time job fraud warnings, Cyber helpline 1930", desc_ta: "ஆன்லைன் நிதி மோசடிகள் மற்றும் சைபர் கிரைம் விழிப்புணர்வு", audience: "All Citizens" },
  { name_en: "e-Sevai Certificate Guides", name_ta: "இ-சேவை சான்றிதழ் வழிகாட்டி", route: "/esevai", desc_en: "Checklists & procedures for Patta, Legal Heir, Community & Income certificates", desc_ta: "பட்டா, வாரிசு, சாதி மற்றும் வருமான சான்றிதழ் ஆவண விபரங்கள்", audience: "All Citizens" },
  { name_en: "Government Welfare Schemes", name_ta: "அரசு நலத்திட்டங்கள்", route: "/schemes", desc_en: "Direct benefits, eligibility rules, and official online application links", desc_ta: "அரசு நலத்திட்டங்கள் மற்றும் விண்ணப்பிக்கும் நேரடி இணைப்புகள்", audience: "All Citizens" },
  { name_en: "Civic Awareness & Rights", name_ta: "குடிமக்கள் உரிமைகள் & திட்டங்கள்", route: "/awareness", desc_en: "RTI Act 2005, police check rights, welfare schemes & portal guides", desc_ta: "RTI சட்டம், நுகர்வோர் உரிமை மற்றும் அரசு திட்ட வழிகாட்டிகள்", audience: "All Citizens" }
];

// Frequently Asked Questions
const FAQS = [
  {
    q_en: "Is filing a civic complaint or viewing alerts free on VizhiTN?",
    q_ta: "VizhiTN தளத்தில் புகாரளிப்பதற்கும் தகவல்களைப் பார்ப்பதற்கும் கட்டணம் உண்டா?",
    a_en: "VizhiTN is 100% free and open to all citizens of Tamil Nadu. There are no fees to file complaints, search power cut schedules, or dial emergency helplines.",
    a_ta: "VizhiTN தளம் தமிழ்நாடு பொதுமக்கள் அனைவருக்கும் 100% முற்றிலும் இலவசமானது. புகாரளிப்பது, மின்தடை அறிவது, அவசர எண்களை அழைப்பது என அனைத்திற்கும் எந்த கட்டணமும் இல்லை."
  },
  {
    q_en: "How are scheduled power cuts and rain holiday alerts verified?",
    q_ta: "மின்தடை நேரங்களும் பள்ளி விடுமுறைகளும் எவ்வாறு சரிபார்க்கப்படுகின்றன?",
    a_en: "Power cut schedules are cross-verified daily against official TANGEDCO circle sub-station press releases. School rain holiday announcements are published strictly from official District Collectorate circulars.",
    a_ta: "மின்தடை விவரங்கள் TANGEDCO மின்வாரிய சுற்றறிக்கையின்படியும், பள்ளி விடுமுறை செய்திகள் மாவட்ட ஆட்சியரின் அதிகாரப்பூர்வ அறிவிப்பின்படியும் மட்டுமே வெளியிடப்படுகின்றன."
  },
  {
    q_en: "How does my complaint move to the 'Victory Wall' (Resolved)?",
    q_ta: "என் புகார் எவ்வாறு 'வெற்றிச் சுவருக்கு' (தீர்வு கண்டவை) மாற்றப்படும்?",
    a_en: "Once municipal or departmental workers repair the defect (e.g. asphalt road, replace streetlight, repair water pipe), you or a neighbour uploads an 'After' photo. Community votes verify the fix and it moves to the Victory Wall.",
    a_ta: "அரசுத் துறை அல்லது மாநகராட்சி ஊழியர்கள் அந்தப் பணியை முடித்ததும் (சாலை போடுதல், விளக்கு மாற்றுதல்), சரிசெய்யப்பட்ட புகைப்படத்தை பதிவேற்றினால் மக்கள் சரிபார்த்து வெற்றிச் சுவருக்கு மாற்றப்படும்."
  },
  {
    q_en: "Are government helpline numbers and utility alerts verified on VizhiTN?",
    q_ta: "VizhiTN தளத்தில் உள்ள அரசு உதவி எண்கள் மற்றும் மின்வெட்டு தகவல்கள் சரிபார்க்கப்பட்டவையா?",
    a_en: "Yes. Every power cut advisory, water shortage notice, and emergency helpline is cross-referenced with official departmental gazettes, TANGEDCO circulars, and District Disaster Control numbers.",
    a_ta: "ஆம். மின்வாரிய பராமரிப்பு அறிவிப்புகள், குடிநீர் வாரிய தகவல்கள் மற்றும் அவசர உதவி எண்கள் அனைத்தும் அதிகாரப்பூர்வ அரசு சுற்றறிக்கைகளுடன் ஒப்பிட்டு உறுதி செய்யப்படுகின்றன."
  }
];

export default function HowToUse() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [activePillar, setActivePillar] = useState("civic_complaints");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  usePageMeta({
    title: "How to Use VizhiTN | Complete Citizen User Manual & Walkthrough",
    description: "Learn how to file civic complaints with photos, track TANGEDCO power cuts, access 24x7 emergency hotlines, radar cyber scams, and find neighbourhood services across Tamil Nadu.",
  });

  const selectedPillar = useMemo(() => {
    return CORE_PILLARS.find((p) => p.id === activePillar) || CORE_PILLARS[0];
  }, [activePillar]);

  // Filter catalog by search query
  const filteredCatalog = useMemo(() => {
    if (!searchQuery) return PLATFORM_FEATURES_MATRIX;
    const q = searchQuery.toLowerCase().trim();
    return PLATFORM_FEATURES_MATRIX.filter((item) =>
      item.name_en.toLowerCase().includes(q) ||
      item.name_ta.toLowerCase().includes(q) ||
      item.desc_en.toLowerCase().includes(q) ||
      item.desc_ta.toLowerCase().includes(q) ||
      item.route.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ── HERO BANNER ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-800 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {T("VIZHITN CITIZEN MANUAL • ALL 38 DISTRICTS", "VIZHITN பொதுமக்கள் கையேடு • 38 மாவட்டங்கள்")}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              {T("How to Use VizhiTN — Your Step-by-Step Guide", "VizhiTN பயன்படுத்துவது எப்படி — முழு வழிகாட்டி")}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed mb-6">
              {T(
                "Learn how to photograph and resolve civic grievances, track daily TANGEDCO power cuts, dial 24x7 emergency helplines, radar cyber scams, and participate in your local neighbourhood.",
                "சாலைப் பள்ளங்களை புகைப்படத்துடன் பதிவிடுவது, மின்தடை நேரம் அறிவது, 24x7 அவசர எண்கள் மற்றும் சைபர் மோசடி தடுப்பு வழிகாட்டிகளை இங்கே அறிந்துகொள்ளலாம்."
              )}
            </p>

            {/* In-Hero Search Input */}
            <div className="relative max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={T(
                  "Search a feature (e.g. pothole, power cut, scam, blood, rain holiday, transport)...",
                  "தேடுங்கள் (மின்வெட்டு, மோசடி, ரத்த தானம், மழை விடுமுறை, போக்குவரத்து)..."
                )}
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE 6 ACTION PILLARS SELECTOR ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {T("Choose What You Want to Do", "நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {T("Select a workflow below to view visual steps, citizen pro-tips, and live links.", "கீழே உள்ள பிரிவை தேர்வு செய்து வழிமுறைகள் மற்றும் நேரடி இணைப்புகளை காண்க.")}
              </p>
            </div>
          </div>

          {/* Pillar Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {CORE_PILLARS.map((p) => {
              const Icon = p.icon;
              const active = activePillar === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePillar(p.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    active
                      ? `${p.bg_light} ${p.border_color} ring-2 ring-blue-500 shadow-md`
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl ${p.color} text-white flex items-center justify-center mb-2 shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold leading-snug line-clamp-2 ${active ? p.text_color : "text-slate-900 dark:text-white"}`}>
                      {T(p.title_en, p.title_ta)}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ACTIVE PILLAR DETAILED WALKTHROUGH CARD ── */}
        <div className={`bg-white dark:bg-slate-900 border-2 ${selectedPillar.border_color} rounded-3xl p-5 sm:p-8 shadow-sm transition-all`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl ${selectedPillar.color} text-white flex items-center justify-center font-bold shadow-md flex-shrink-0`}>
                {React.createElement(selectedPillar.icon, { className: "w-6 h-6" })}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  FEATURE WALKTHROUGH
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {T(selectedPillar.title_en, selectedPillar.title_ta)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {T(selectedPillar.desc_en, selectedPillar.desc_ta)}
                </p>
              </div>
            </div>

            <Link
              href={selectedPillar.action_href}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white ${selectedPillar.color} hover:opacity-95 shadow-md transition-all active:scale-95`}
            >
              {T(selectedPillar.action_label_en, selectedPillar.action_label_ta)}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Interactive Visual Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {(lang === "ta" ? selectedPillar.steps_ta : selectedPillar.steps_en).map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black font-mono text-slate-300 dark:text-slate-600 block mb-2">
                    {step.num}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro-Tip Callout Box */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed font-medium">
              {T(selectedPillar.pro_tip_en, selectedPillar.pro_tip_ta)}
            </p>
          </div>
        </div>

        {/* ── CIVIC PROOF RESOLUTION LIFECYCLE ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              {T("HOW IT WORKS", "இயங்கும் முறை")}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {T("The Civic Proof Resolution Lifecycle", "குடிமைப் புகார் தீர்வு காணும் படிநிலைகள்")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {T(
                "How a citizen photo report transforms into official departmental action and reaches the community Victory Wall.",
                "ஒரு குடிமகனின் புகைப்படம் எவ்வாறு அரசு அதிகாரிகளின் கவனத்திற்கு சென்று வெற்றிச் சுவரில் முடிகிறது."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {[
              {
                step: "1",
                badge: "REPORTED",
                badge_color: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
                title_en: "Citizen Logs Issue with Proof",
                title_ta: "குடிமகன் ஆதாரத்துடன் பதிவிடுகிறார்",
                desc_en: "Captured with daytime photo, exact GPS pin, category, and department assigned.",
                desc_ta: "புகைப்படம், ஜிபிஎஸ் இருப்பிடம் மற்றும் அரசுத் துறையுடன் பதிவு செய்யப்படுகிறது."
              },
              {
                step: "2",
                badge: "VERIFIED",
                badge_color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
                title_en: "Community Upvotes & Validates",
                title_ta: "சமுதாயம் சரிபார்த்து வாக்களிக்கிறது",
                desc_en: "Neighbours living in the ward confirm 'I can verify this'. Spam posts are filtered out.",
                desc_ta: "அப்பகுதி மக்கள் 'நான் உறுதி செய்கிறேன்' என வாக்களித்து போலியானவற்றை நீக்குகின்றனர்."
              },
              {
                step: "3",
                badge: "DEPARTMENT ACTION",
                badge_color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
                title_en: "Official Helplines Escalation",
                title_ta: "துறை அதிகாரிகளுக்கு தகவல் அனுப்பப்படுகிறது",
                desc_en: "Complaint tagged to official helplines (GCC 1913, TANGEDCO 1912, Metrowater 044-45674567).",
                desc_ta: "சென்னை மாநகராட்சி 1913, மின்வாரியம் 1912 போன்ற உதவி மையங்களுக்கு அனுப்பப்படுகிறது."
              },
              {
                step: "4",
                badge: "RESOLVED",
                badge_color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
                title_en: "Victory Wall Celebration",
                title_ta: "வெற்றிச் சுவரில் தீர்வு கொண்டாடப்படுகிறது",
                desc_en: "After repair, citizen uploads 'Fixed' photo. Post moves to the Victory Wall.",
                desc_ta: "பணி முடிந்ததும் சரிசெய்யப்பட்ட புகைப்படம் பதிவேற்றப்பட்டு வெற்றிச் சுவரில் இடம்பெறுகிறது."
              }
            ].map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm flex items-center justify-center">
                      {s.step}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${s.badge_color}`}>
                      {s.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                    {T(s.title_en, s.title_ta)}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {T(s.desc_en, s.desc_ta)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ALL 14 ACTIVE PLATFORM FEATURES CATALOG ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                {T("Complete VizhiTN Feature Catalog", "VizhiTN தளத்தின் அனைத்து அம்சங்கள்")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {T("Direct links to all currently available tools, dashboards, and live feeds across Tamil Nadu.", "தமிழ்நாட்டில் தற்போது பயன்பாட்டில் உள்ள அனைத்து நேரடி பக்கங்கள்.")}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
              {filteredCatalog.length} {T("active features", "அம்சங்கள்")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCatalog.map((feat) => (
              <Link
                key={feat.route}
                href={feat.route}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {T(feat.name_en, feat.name_ta)}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {T(feat.desc_en, feat.desc_ta)}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    {feat.route}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {feat.audience}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {T("Common queries answered for new citizens joining the platform.", "புதிய பயனர்களுக்கான தெளிவான விடைகள்.")}
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {T(faq.q_en, faq.q_ta)}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <p className="mt-3">{T(faq.a_en, faq.a_ta)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CALL TO ACTION BANNER ── */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
          <div>
            <span className="bg-white/20 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {T("JOIN THE CITIZEN NETWORK", "குடிமக்கள் இயக்கத்தில் இணையுங்கள்")}
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-2">
              {T("Ready to Report an Issue in Your Street?", "உங்கள் தெருவின் சிக்கலை பதிவிட தயாரா?")}
            </h3>
            <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-xl">
              {T(
                "Document civic defects with photos, track departmental actions, and help create a transparent Tamil Nadu.",
                "புகைப்படங்களுடன் பதிவிட்டு, அரசுத் துறைகளின் தீர்வை கண்காணித்து வெளிப்படையான தமிழ்நாட்டை உருவாக்குவோம்."
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/create"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 hover:bg-red-50 font-black text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              {T("Report an Issue", "புகார் பதிவிட")}
            </Link>
            <Link
              href="/explore"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-800/60 hover:bg-red-800 text-white font-bold text-sm rounded-xl border border-white/20 transition-all"
            >
              {T("Explore Feed", "நேரலை பார்க்க")}
            </Link>
          </div>
        </div>

        {/* Universal SEO Cross-Links */}
        <UniversalCrossLinks pageType="support" />
      </div>
    </div>
  );
}
