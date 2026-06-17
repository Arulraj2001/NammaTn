import React, { useState } from "react";
import {
  Droplets, Users, GraduationCap, Heart, Briefcase, Home,
  UtensilsCrossed, BookOpen, Baby, Tractor, Search,
  ExternalLink, ArrowLeft, ChevronDown, Filter, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

// All TN government schemes — production content verified
const ALL_SCHEMES = [
  {
    id: "magalir-urimai",
    icon: Users,
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
    badge_en: "Women Welfare",
    badge_ta: "பெண்கள் நலன்",
    badgeCls: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    name_en: "Kalaignar Magalir Urimai Thogai",
    name_ta: "கலைஞர் மகளிர் உரிமை தொகை",
    dept_en: "Social Welfare & Women Empowerment Dept.",
    dept_ta: "சமூக நலன் & பெண்கள் மேம்பாடு துறை",
    desc_en: "₹1,000 per month transferred directly to bank accounts of eligible female heads of families to promote financial autonomy.",
    desc_ta: "குடும்பத் தலைவியாக உள்ள தகுதியான பெண்களுக்கு மாதம் ₹1,000 நேரடியாக வங்கி கணக்கில் வரவு.",
    eligibility_en: "Female head of family, age 21+, annual income < ₹2.5 lakh, not a central/state govt employee, not an income tax payer, no 4-wheeler vehicle in family.",
    eligibility_ta: "குடும்பத் தலைவி, வயது 21+, வருடாந்திர வருமானம் ₹2.5 லட்சம் குறைவாக இருக்க வேண்டும், அரசு ஊழியர் அல்ல, வருமான வரி செலுத்துபவர் அல்ல.",
    how_en: "Register at kmut.tn.gov.in, nearest ration shop, or e-Sevai centre. Aadhaar + Bank passbook + Ration card required.",
    how_ta: "kmut.tn.gov.in, அருகிலுள்ள ரேஷன் கடை அல்லது e-Sevai மையத்தில் பதிவு செய்யுங்கள். ஆதார் + வங்கி பாஸ்புக் + குடும்ப அட்டை தேவை.",
    apply_url: "https://www.kmut.tn.gov.in",
    website_url: "https://www.kmut.tn.gov.in",
    status: "Active",
    category: "women",
  },
  {
    id: "pudhumai-penn",
    icon: GraduationCap,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    badge_en: "Education",
    badge_ta: "கல்வி",
    badgeCls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    name_en: "Pudhumai Penn Scheme",
    name_ta: "புதுமை பெண் திட்டம்",
    dept_en: "Higher Education Dept.",
    dept_ta: "உயர்கல்வி துறை",
    desc_en: "₹1,000 per month for girl students who studied from Classes 6–12 in government schools and are now pursuing higher education (college/polytechnic).",
    desc_ta: "அரசுப் பள்ளியில் 6–12 வகுப்புகளில் படித்து தற்போது கல்லூரி / பாலிடெக்னிக்கில் உயர்கல்வி பயிலும் மாணவிகளுக்கு மாதம் ₹1,000.",
    eligibility_en: "Girl student, studied Classes 6–12 in Tamil Nadu government school, currently enrolled in higher education (degree / diploma).",
    eligibility_ta: "தமிழ்நாடு அரசுப் பள்ளியில் 6–12 வரை படித்திருக்க வேண்டும், தற்போது பட்டப்படிப்பு / டிப்ளோமா பயிலும் மாணவி.",
    how_en: "Apply through your college/institution. Bank account must be in student's name. Aadhaar seeding required.",
    how_ta: "கல்லூரி / நிறுவனம் மூலம் விண்ணப்பிக்கவும். வங்கி கணக்கு மாணவி பெயரில் இருக்க வேண்டும். ஆதார் இணைப்பு அவசியம்.",
    apply_url: "https://pudhummapenn.tn.gov.in",
    website_url: "https://pudhummapenn.tn.gov.in",
    status: "Active",
    category: "education",
  },
  {
    id: "cmchis",
    icon: Heart,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    badge_en: "Health",
    badge_ta: "சுகாதாரம்",
    badgeCls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    name_en: "CM's Comprehensive Health Insurance Scheme (CMCHIS)",
    name_ta: "முதலமைச்சர் விரிவான சுகாதார காப்பீட்டுத் திட்டம் (CMCHIS)",
    dept_en: "Health & Family Welfare Dept.",
    dept_ta: "சுகாதார & குடும்ப நலன் துறை",
    desc_en: "Cashless treatment up to ₹5 lakh per year for families with a valid Tamil Nadu ration card at any of 1,150+ empanelled government and private hospitals.",
    desc_ta: "செல்லுபடியான TN குடும்ப அட்டை வைத்திருப்பவர்களுக்கு 1,150+ அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா சிகிச்சை.",
    eligibility_en: "Must hold a valid Tamil Nadu ration card. Covers the entire family listed on the ration card.",
    eligibility_ta: "செல்லுபடியான தமிழ்நாடு குடும்ப அட்டை வேண்டும். குடும்ப அட்டையில் உள்ள அனைத்து உறுப்பினர்களையும் உள்ளடக்கும்.",
    how_en: "No registration needed — show ration card at any empanelled hospital. Insurance card is issued automatically.",
    how_ta: "பதிவு தேவையில்லை — அங்கீகரிக்கப்பட்ட மருத்துவமனையில் குடும்ப அட்டை காட்டுங்கள். காப்பீட்டு அட்டை தானாக வழங்கப்படும்.",
    apply_url: "https://www.cmchis.com",
    website_url: "https://www.cmchis.com",
    status: "Active",
    category: "health",
  },
  {
    id: "breakfast-scheme",
    icon: UtensilsCrossed,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge_en: "Child Welfare",
    badge_ta: "குழந்தை நலன்",
    badgeCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    name_en: "CM's Breakfast Scheme",
    name_ta: "முதலமைச்சர் காலை உணவு திட்டம்",
    dept_en: "School Education Dept.",
    dept_ta: "பள்ளிக் கல்வி துறை",
    desc_en: "Free nutritious breakfast (idli, upma, pongal, etc.) for students of Classes 1–5 in all Tamil Nadu government primary schools, every school day.",
    desc_ta: "தமிழ்நாட்டில் அனைத்து அரசு தொடக்கப் பள்ளிகளிலும் 1–5 வகுப்பு மாணவர்களுக்கு ஒவ்வொரு பள்ளி நாளும் இலவச சத்தான காலை உணவு.",
    eligibility_en: "Students enrolled in Classes 1–5 in any Tamil Nadu government primary school.",
    eligibility_ta: "தமிழ்நாட்டில் எந்தவொரு அரசு தொடக்கப் பள்ளியிலும் 1–5 வகுப்புகளில் பயிலும் மாணவர்கள்.",
    how_en: "Automatic — no application needed. Students in enrolled government schools receive breakfast daily.",
    how_ta: "தானியங்கி — விண்ணப்பம் தேவையில்லை. பதிவு செய்யப்பட்ட அரசுப் பள்ளி மாணவர்களுக்கு தினமும் காலை உணவு கிடைக்கும்.",
    apply_url: "https://www.tn.gov.in",
    website_url: "https://www.tn.gov.in",
    status: "Active",
    category: "education",
  },
  {
    id: "mgnrega",
    icon: Briefcase,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    badge_en: "Employment",
    badge_ta: "வேலைவாய்ப்பு",
    badgeCls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    name_en: "MGNREGA — 100 Days Employment Guarantee",
    name_ta: "MGNREGA — 100 நாட்கள் வேலை உத்தரவாத திட்டம்",
    dept_en: "Rural Development & Panchayati Raj Dept.",
    dept_ta: "கிராமப்புற வளர்ச்சி & பஞ்சாயத்துராஜ் துறை",
    desc_en: "Legal guarantee of at least 100 days of unskilled manual wage employment per financial year for every rural household whose adult members volunteer for work.",
    desc_ta: "ஒவ்வொரு கிராமப்புற குடும்பத்திற்கும் ஒரு நிதியாண்டில் குறைந்தது 100 நாட்கள் திறமையற்ற கூலி வேலை சட்டபூர்வ உத்தரவாதம்.",
    eligibility_en: "Any adult (18+) member of a rural household willing to do unskilled manual work. Must have a job card.",
    eligibility_ta: "கிராமப்புற குடும்பத்தின் எந்தவொரு வயது வந்த உறுப்பினரும் (18+) திறமையற்ற உடலுழைப்பு செய்ய விரும்புபவர். வேலை அட்டை இருக்க வேண்டும்.",
    how_en: "Register at your local Gram Panchayat to get a job card. Employment is provided within 15 days or unemployment allowance is paid.",
    how_ta: "வேலை அட்டை பெற உங்கள் உள்ளாட்சி பஞ்சாயத்தில் பதிவு செய்யுங்கள். 15 நாட்களுக்குள் வேலை வழங்கப்படும் இல்லையேல் வேலையின்மை கொடுப்பனவு வழங்கப்படும்.",
    apply_url: "https://nrega.nic.in",
    website_url: "https://nrega.nic.in",
    status: "Active",
    category: "employment",
  },
  {
    id: "jal-jeevan",
    icon: Droplets,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge_en: "Water & Sanitation",
    badge_ta: "நீர் & சுகாதாரம்",
    badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    name_en: "Jal Jeevan Mission — Har Ghar Jal",
    name_ta: "ஜல் ஜீவன் மிஷன் — எல்லா வீட்டிலும் நீர்",
    dept_en: "Public Works Dept. (TWAD Board)",
    dept_ta: "பொதுப்பணி துறை (TWAD வாரியம்)",
    desc_en: "Household functional tap water connections providing 55 litres per capita per day for every rural household in Tamil Nadu.",
    desc_ta: "தமிழ்நாட்டில் ஒவ்வொரு கிராமப்புற குடும்பத்திற்கும் நாளொன்றுக்கு 55 லிட்டர் வீதம் இயக்கும் குழாய் நீர் இணைப்பு.",
    eligibility_en: "Rural households without a functional tap water connection.",
    eligibility_ta: "செயல்பாட்டில் உள்ள குழாய் நீர் இணைப்பு இல்லாத கிராமப்புற குடும்பங்கள்.",
    how_en: "Contact your local Gram Panchayat or Village Administrative Officer (VAO). Apply through twad.tn.gov.in.",
    how_ta: "உங்கள் கிராம பஞ்சாயத்து அல்லது கிராம நிர்வாக அதிகாரியை (VAO) தொடர்பு கொள்ளுங்கள். twad.tn.gov.in மூலம் விண்ணப்பிக்கவும்.",
    apply_url: "https://jaljeevanmission.gov.in",
    website_url: "https://jaljeevanmission.gov.in",
    status: "Active",
    category: "water",
  },
  {
    id: "vidiyal-payanam",
    icon: Users,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    badge_en: "Women Welfare",
    badge_ta: "பெண்கள் நலன்",
    badgeCls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    name_en: "Vidiyal Payanam — Free Bus Travel for Women",
    name_ta: "விடியல் பயணம் — பெண்களுக்கு இலவச பஸ் பயணம்",
    dept_en: "Transport Dept. (TNSTC / MTC)",
    dept_ta: "போக்குவரத்து துறை (TNSTC / MTC)",
    desc_en: "Free travel for women in all Tamil Nadu State Transport Corporation (TNSTC) and MTC ordinary fare buses across the state.",
    desc_ta: "தமிழ்நாட்டில் அனைத்து TNSTC மற்றும் MTC சாதாரண கட்டண பஸ்களில் பெண்களுக்கு இலவச பயணம்.",
    eligibility_en: "All women passengers in Tamil Nadu. No registration required.",
    eligibility_ta: "தமிழ்நாட்டில் அனைத்து பெண் பயணிகளும். பதிவு தேவையில்லை.",
    how_en: "Board any ordinary TNSTC or MTC bus — free travel with no ticket needed. Smart card for express buses.",
    how_ta: "எந்த சாதாரண TNSTC அல்லது MTC பஸ்ஸிலும் ஏறுங்கள் — டிக்கெட் இல்லாமல் இலவச பயணம்.",
    apply_url: "https://www.tn.gov.in",
    website_url: "https://www.tn.gov.in",
    status: "Active",
    category: "women",
  },
  {
    id: "girl-child-protection",
    icon: Baby,
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    badge_en: "Women & Child",
    badge_ta: "பெண்கள் & குழந்தை",
    badgeCls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    name_en: "CM's Girl Child Protection Scheme",
    name_ta: "முதலமைச்சர் பெண் குழந்தை பாதுகாப்பு திட்டம்",
    dept_en: "Social Welfare & Women Empowerment Dept.",
    dept_ta: "சமூக நலன் & பெண்கள் மேம்பாடு துறை",
    desc_en: "A fixed deposit of ₹50,000 for families with only one girl child, and ₹25,000 for families with two girl children, to promote girl child education and prevent female infanticide.",
    desc_ta: "ஒரே ஒரு பெண் குழந்தை உள்ள குடும்பங்களுக்கு ₹50,000 மற்றும் இரண்டு பெண் குழந்தைகள் உள்ளவர்களுக்கு ₹25,000 நிரந்தர வைப்பு.",
    eligibility_en: "Families with one or two girl children only, family income below ₹72,000/year, registered at birth.",
    eligibility_ta: "ஒரு அல்லது இரண்டு பெண் குழந்தைகள் மட்டும் உள்ள குடும்பங்கள், குடும்ப வருமானம் ₹72,000/ஆண்டு குறைவாக, பிறப்பு பதிவு கட்டாயம்.",
    how_en: "Apply at your nearest government hospital or Taluk office within 60 days of the girl child's birth.",
    how_ta: "பிறப்பிலிருந்து 60 நாட்களுக்குள் அருகிலுள்ள அரசு மருத்துவமனை அல்லது வட்டார அலுவலகத்தில் விண்ணப்பிக்கவும்.",
    apply_url: "https://www.tnsw.in",
    website_url: "https://www.tnsw.in",
    status: "Active",
    category: "women",
  },
  {
    id: "pm-awas",
    icon: Home,
    iconBg: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
    badge_en: "Housing",
    badge_ta: "வீட்டுவசதி",
    badgeCls: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    name_en: "Pradhan Mantri Awas Yojana — Gramin (PMAY-G)",
    name_ta: "பிரதான் மந்திரி ஆவாஸ் யோஜனா — கிராமம்",
    dept_en: "Rural Development Dept.",
    dept_ta: "கிராமப்புற வளர்ச்சி துறை",
    desc_en: "Financial assistance of ₹1.2 lakh for BPL families in rural areas to construct a pucca house. Paid in instalments via Direct Benefit Transfer.",
    desc_ta: "கிராமப்புற BPL குடும்பங்களுக்கு நிரந்தர வீடு கட்ட ₹1.2 லட்சம் நிதி உதவி. நேரடி நலன் பரிமாற்றம் (DBT) மூலம் தவணைகளில் வழங்கப்படும்.",
    eligibility_en: "BPL rural household, no pucca house, not received housing benefit under any other scheme. Priority to SC/ST and minorities.",
    eligibility_ta: "BPL கிராமப்புற குடும்பம், நிரந்தர வீடு இல்லாதவர், வேறு திட்டத்தில் வீட்டுவசதி பெறாதவர். SC/ST மற்றும் சிறுபான்மையினருக்கு முன்னுரிமை.",
    how_en: "Apply through the local Gram Panchayat or Block Development Office. Check eligibility at pmayg.nic.in.",
    how_ta: "உள்ளூர் கிராம பஞ்சாயத்து அல்லது வட்டார வளர்ச்சி அலுவலகம் வழியாக விண்ணப்பிக்கவும். pmayg.nic.in இல் தகுதி சரிபார்க்கவும்.",
    apply_url: "https://pmayg.nic.in",
    website_url: "https://pmayg.nic.in",
    status: "Active",
    category: "housing",
  },
  {
    id: "amma-drinking-water",
    icon: Droplets,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    badge_en: "Water & Sanitation",
    badge_ta: "நீர் & சுகாதாரம்",
    badgeCls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    name_en: "Amma Drinking Water Scheme",
    name_ta: "அம்மா குடிநீர் திட்டம்",
    dept_en: "Public Works Dept. (TWAD Board)",
    dept_ta: "பொதுப்பணி துறை (TWAD வாரியம்)",
    desc_en: "Comprehensive scheme to provide safe drinking water connections to all households in rural Tamil Nadu, improving water quality and reducing waterborne diseases.",
    desc_ta: "கிராமப்புற தமிழ்நாட்டில் அனைத்து குடும்பங்களுக்கும் சுத்தமான குடிநீர் இணைப்பு வழங்கும் விரிவான திட்டம்.",
    eligibility_en: "Rural households in Tamil Nadu without safe drinking water connection.",
    eligibility_ta: "பாதுகாப்பான குடிநீர் இணைப்பு இல்லாத தமிழ்நாட்டு கிராமப்புற குடும்பங்கள்.",
    how_en: "Contact your local Panchayat or TWAD board office. Apply at twad.tn.gov.in.",
    how_ta: "உங்கள் உள்ளூர் பஞ்சாயத்து அல்லது TWAD வாரிய அலுவலகத்தை தொடர்பு கொள்ளுங்கள்.",
    apply_url: "https://twad.tn.gov.in",
    website_url: "https://twad.tn.gov.in",
    status: "Active",
    category: "water",
  },
  {
    id: "tn-student-insurance",
    icon: GraduationCap,
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    badge_en: "Education",
    badge_ta: "கல்வி",
    badgeCls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    name_en: "Tamil Nadu Student Insurance Scheme",
    name_ta: "தமிழ்நாடு மாணவர் காப்பீட்டுத் திட்டம்",
    dept_en: "School Education Dept.",
    dept_ta: "பள்ளிக் கல்வி துறை",
    desc_en: "Accident insurance coverage for students studying in Classes 1–12 in all Tamil Nadu government and government-aided schools.",
    desc_ta: "தமிழ்நாட்டில் அனைத்து அரசு மற்றும் அரசு உதவி பெறும் பள்ளிகளில் 1–12 வகுப்பு மாணவர்களுக்கு விபத்து காப்பீடு.",
    eligibility_en: "Students enrolled in Classes 1–12 in TN government or government-aided schools.",
    eligibility_ta: "TN அரசு அல்லது அரசு உதவி பெறும் பள்ளிகளில் 1–12 வகுப்புகளில் பயிலும் மாணவர்கள்.",
    how_en: "Automatic — no application needed. Insurance is provided through the school.",
    how_ta: "தானியங்கி — விண்ணப்பம் தேவையில்லை. காப்பீடு பள்ளி மூலம் வழங்கப்படும்.",
    apply_url: "https://www.tn.gov.in",
    website_url: "https://www.tn.gov.in",
    status: "Active",
    category: "education",
  },
  {
    id: "pm-kisan",
    icon: Tractor,
    iconBg: "bg-lime-100 dark:bg-lime-900/30",
    iconColor: "text-lime-700 dark:text-lime-400",
    badge_en: "Agriculture",
    badge_ta: "விவசாயம்",
    badgeCls: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
    name_en: "PM-KISAN — Farmer Income Support",
    name_ta: "PM-KISAN — விவசாயி வருமான ஆதரவு",
    dept_en: "Agriculture Dept. / Ministry of Agriculture",
    dept_ta: "வேளாண்மை துறை",
    desc_en: "₹6,000 per year (₹2,000 per 4 months in 3 instalments) direct income support to landholding farmer families across India, including Tamil Nadu.",
    desc_ta: "இந்தியா முழுவதும் நில உடைமை விவசாயக் குடும்பங்களுக்கு ஆண்டுக்கு ₹6,000 (3 தவணைகளில் ₹2,000 வீதம்) நேரடி வருமான ஆதரவு.",
    eligibility_en: "Landholding farmer families with cultivable land. Not applicable to institutional land holders, income tax payers, or govt employees.",
    eligibility_ta: "சாகுபடி நிலம் உள்ள விவசாயக் குடும்பங்கள். நிறுவன நில உடைமையாளர்கள், வருமான வரி செலுத்துபவர்கள் அல்லது அரசு ஊழியர்களுக்கு பொருந்தாது.",
    how_en: "Register at pmkisan.gov.in or nearest CSC. Aadhaar linking to bank account is mandatory.",
    how_ta: "pmkisan.gov.in அல்லது அருகிலுள்ள CSC இல் பதிவு செய்யுங்கள். ஆதார் - வங்கி கணக்கு இணைப்பு கட்டாயம்.",
    apply_url: "https://pmkisan.gov.in",
    website_url: "https://pmkisan.gov.in",
    status: "Active",
    category: "agriculture",
  },
];

const CATEGORIES = [
  { id: "all", label_en: "All Schemes", label_ta: "அனைத்து திட்டங்கள்" },
  { id: "women", label_en: "Women Welfare", label_ta: "பெண்கள் நலன்" },
  { id: "education", label_en: "Education", label_ta: "கல்வி" },
  { id: "health", label_en: "Health", label_ta: "சுகாதாரம்" },
  { id: "employment", label_en: "Employment", label_ta: "வேலைவாய்ப்பு" },
  { id: "water", label_en: "Water & Sanitation", label_ta: "நீர் & சுகாதாரம்" },
  { id: "housing", label_en: "Housing", label_ta: "வீட்டுவசதி" },
  { id: "agriculture", label_en: "Agriculture", label_ta: "விவசாயம்" },
];

export default function AwarenessSchemesPage() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  usePageMeta({
    title: "Government Schemes Tamil Nadu 2024-25 | NammaTN",
    description: "Complete list of Tamil Nadu government welfare schemes 2024-25 — Kalaignar Magalir Urimai, Pudhumai Penn, CMCHIS, MGNREGA, PM-KISAN and more with eligibility and apply links.",
  });

  const filtered = ALL_SCHEMES.filter((s) => {
    const matchCat = category === "all" || s.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.name_en.toLowerCase().includes(q) ||
      s.name_ta.includes(q) ||
      s.badge_en.toLowerCase().includes(q) ||
      s.dept_en.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/awareness" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> {T("Back to Awareness", "விழிப்புணர்வுக்கு திரும்பு")}
      </Link>

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {T("Government Schemes — Tamil Nadu 2024-25", "அரசு திட்டங்கள் — தமிழ்நாடு 2024-25")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {T(`${ALL_SCHEMES.length} active welfare schemes with eligibility and direct apply links.`,
             `${ALL_SCHEMES.length} செயல்பாட்டில் உள்ள திட்டங்கள் — தகுதி மற்றும் விண்ணப்ப இணைப்புகளுடன்.`)}
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={T("Search schemes...", "திட்டங்களை தேடுங்கள்...")}
            className="w-full pl-10 pr-9 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide flex-wrap">
          {CATEGORIES.map((c) => (
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

      {/* Results count */}
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
        {T(`Showing ${filtered.length} schemes`, `${filtered.length} திட்டங்கள் காட்டப்படுகின்றன`)}
      </p>

      {/* Scheme cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{T("No schemes found", "திட்டங்கள் எதுவும் கிடைக்கவில்லை")}</p>
          </div>
        ) : (
          filtered.map((scheme) => {
            const Icon = scheme.icon;
            const isOpen = expandedId === scheme.id;
            return (
              <div key={scheme.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Header row */}
                <button
                  className="w-full flex items-start gap-4 p-5 text-left"
                  onClick={() => setExpandedId(isOpen ? null : scheme.id)}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${scheme.iconBg}`}>
                    <Icon className={`w-5 h-5 ${scheme.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5 ${scheme.badgeCls}`}>
                          {T(scheme.badge_en, scheme.badge_ta)}
                        </span>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
                          {T(scheme.name_en, scheme.name_ta)}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {T(scheme.dept_en, scheme.dept_ta)}
                        </p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {T(scheme.desc_en, scheme.desc_ta)}
                    </p>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700 pt-4 grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {T("✅ Eligibility", "✅ தகுதி நிபந்தனைகள்")}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {T(scheme.eligibility_en, scheme.eligibility_ta)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {T("📝 How to Apply", "📝 எப்படி விண்ணப்பிப்பது")}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {T(scheme.how_en, scheme.how_ta)}
                      </p>
                    </div>
                    <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
                      <a
                        href={scheme.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {T("Check Eligibility", "தகுதி சரிபார்")}
                      </a>
                      <a
                        href={scheme.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        {T("Apply Now →", "விண்ணப்பிக்க →")}
                      </a>
                      <a
                        href="https://www.myscheme.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        {T("All Schemes →", "அனைத்து திட்டங்கள் →")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-6">
        {T(
          "Find more schemes at myscheme.gov.in — national scheme discovery platform.",
          "myscheme.gov.in ல் மேலும் திட்டங்களை தேடுங்கள் — தேசிய திட்ட கண்டறிதல் தளம்."
        )}
        {" "}<a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">myscheme.gov.in →</a>
      </div>
    </div>
  );
}
