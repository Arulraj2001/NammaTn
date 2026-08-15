"use client";

import React, { useState } from "react";
import { Shield, Search, FileText, ChevronRight, ExternalLink, ArrowLeft, Download, Building, CheckCircle2, HelpCircle } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const CITIZEN_RIGHTS = [
  {
    id: "right-rti",
    slug: "right-to-information-act-2005",
    icon: FileText,
    badge_en: "RTI & Transparency",
    badge_ta: "தகவல் உரிமை & வெளிப்படைத்தன்மை",
    badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    name_en: "Right to Information Act (RTI Act 2005)",
    name_ta: "தகவல் அறியும் உரிமைச் சட்டம் 2005",
    desc_en: "Empowers Indian citizens to request information, inspect government files, and obtain certified copies of records from any public authority within 30 days.",
    desc_ta: "அரசுத் துறைகளின் செயல்பாடுகள், நிதிகள் மற்றும் கோப்புகளை மக்கள் பார்வையிடவும் நகல் பெறவும் 30 நாட்களுக்குள் தகவல் பெறும் உரிமை.",
    content_en: "Under the RTI Act 2005, every citizen has the statutory right to file an application with a Public Information Officer (PIO) of any state or central government department. The PIO must reply within 30 calendar days (or 48 hours if life and liberty are involved). Application fee is ₹10. If information is denied or delayed, citizens can file a First Appeal to the Appellate Authority.",
    content_ta: "தகவல் அறியும் உரிமைச் சட்டத்தின்படி ஒவ்வொரு குடிமகனும் எந்தவொரு அரசுத் துறையிலும் ₹10 கட்டணத்துடன் விண்ணப்பித்து 30 நாட்களுக்குள் தகவல் பெற உரிமை உண்டு. பதில் கிடைக்காத பட்சத்தில் 30 நாட்களுக்குள் முதல் மேல்முறையீடு செய்யலாம்.",
    department_en: "Personnel and Administrative Reforms Dept",
    department_ta: "பணியாளர் மற்றும் நிர்வாக சீர்திருத்தத் துறை",
    portal_url: "https://rtionline.tn.gov.in",
    pdf_url: "https://rtionline.tn.gov.in",
    key_points_en: [
      "Mandatory 30-day response window for all government departments",
      "₹10 Court Fee Stamp or Demand Draft application fee",
      "First Appeal to Head of Department if reply is evasive or delayed",
      "Penalty up to ₹25,000 on corrupt officers withholding information"
    ],
    key_points_ta: [
      "அரசுத் துறைகளுக்கு 30 நாட்கள் கட்டாயப் பதில் காலக்கெடு",
      "₹10 நீதிமன்ற முத்திரை அல்லது போஸ்டல் ஆர்டர் கட்டணம்",
      "பதில் வராத பட்சத்தில் துறைத் தலைவரிடம் முதல் மேல்முறையீடு",
      "தகவலை மறைக்கும் அதிகாரிக்கு ₹25,000 வரை அபராதம்"
    ]
  },
  {
    id: "right-consumer",
    slug: "consumer-protection-rights-2019",
    icon: Shield,
    badge_en: "Consumer Rights",
    badge_ta: "நுகர்வோர் உரிமைகள்",
    badgeCls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    name_en: "Consumer Protection Rights (Act 2019)",
    name_ta: "நுகர்வோர் பாதுகாப்பு சட்ட உரிமைகள் 2019",
    desc_en: "Guarantees protection against defective goods, deficient services, overcharging, misleading advertisements, and unfair trade practices.",
    desc_ta: "குறைபாடுள்ள பொருட்கள், போலி விளம்பரங்கள் மற்றும் ஏமாற்று வியாபாரத்திற்கு எதிராக ஆன்லைனில் வழக்கு பதிவு செய்து இழப்பீடு பெறும் உரிமை.",
    content_en: "The Consumer Protection Act 2019 gives citizens 6 fundamental consumer rights: Right to Safety, Right to Information, Right to Choose, Right to be Heard, Right to Redressal, and Right to Consumer Education. Consumers can file complaints online through e-Daakhil without hiring a lawyer for claims up to ₹50 lakh at the District Commission.",
    content_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி பொருட்களின் தரம், விலை மற்றும் சேவைகளில் குறைபாடு இருந்தால் வக்கீல் இல்லாமல் இ-தாகீல் (e-Daakhil) தளம் வழியாக ஆன்லைனில் நுகர்வோர் நீதிமன்றத்தில் வழக்கு பதிவு செய்து இழப்பீடு பெறலாம்.",
    department_en: "Civil Supplies and Consumer Protection Dept",
    department_ta: "உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை",
    portal_url: "https://edaakhil.nic.in",
    pdf_url: "https://edaakhil.nic.in",
    key_points_en: [
      "No lawyer required to file consumer court complaints",
      "Online complaint filing via e-Daakhil portal (edaakhil.nic.in)",
      "District Commission handles financial claims up to ₹50 Lakhs",
      "National Consumer Helpline Toll-Free: 1915"
    ],
    key_points_ta: [
      "நுகர்வோர் நீதிமன்றத்தில் வழக்கு பதிவு செய்ய வழக்கறிஞர் தேவையில்லை",
      "இ-தாகீல் தளம் மூலம் ஆன்லைன் வழக்கு பதிவு (edaakhil.nic.in)",
      "மாவட்ட நுகர்வோர் மன்றம் ₹50 லட்சம் வரையிலான வழக்குகளை விசாரணை செய்யும்",
      "தேசிய நுகர்வோர் உதவி எண்: 1915"
    ]
  },
  {
    id: "right-police-check",
    slug: "police-vehicle-check-citizen-rights",
    icon: Shield,
    badge_en: "Police & Legal Rights",
    badge_ta: "காவல்துறை & சட்ட உரிமைகள்",
    badgeCls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    name_en: "Citizen Rights During Police Checks & Detention",
    name_ta: "வாகன சோதனை மற்றும் காவல் விசாரணையில் குடிமக்கள் உரிமைகள்",
    desc_en: "Know your statutory legal rights when stopped by traffic police, during vehicle document inspection, or during police questioning.",
    desc_ta: "வாகன சோதனையின் போதும் காவல் நிலைய விசாரணையின் போதும் குடிமக்களுக்கு உள்ள சட்டப்பூர்வ உரிமைகள் மற்றும் பாதுகாப்பு விதிகள்.",
    content_en: "1. Officers below Sub-Inspector (SI) rank cannot issue fine receipts for major offences. 2. Officers cannot forcefully seize your ignition key or physically assault driver. 3. Electronic copies of Driving License and RC shown on DigiLocker or mParivahan apps are legally valid under MV Act Rule 139. 4. Women cannot be arrested after sunset (6 PM) and before sunrise (6 AM) except in extraordinary circumstances with a female officer present.",
    content_ta: "1. சப்-இன்ஸ்பெக்டர் (SI) நிலைக்குக் கீழ் உள்ள அதிகாரிகள் அபராதம் விதிக்க முடியாது. 2. வாகனச் சாவியைப் பிடுங்கவோ உடலளவில் தாக்கவோ அதிகாரம் இல்லை. 3. டிஜிலாக்கர் (DigiLocker) செயலியில் உள்ள உரிமம் மற்றும் ஆர்.சி புத்தகம் சட்டப்பூர்வமாக செல்லுபடியாகும். 4. பெண்களை மாலை 6 மணி முதல் காலை 6 மணி வரை பெண் காவலர் இன்றி கைது செய்ய முடியாது.",
    department_en: "Home & Police Department",
    department_ta: "உள்துறை மற்றும் காவல்துறை",
    portal_url: "https://eservices.tnpolice.gov.in",
    pdf_url: "https://eservices.tnpolice.gov.in",
    key_points_en: [
      "Only Sub-Inspector (SI) rank & above can collect traffic fines",
      "DigiLocker & mParivahan digital DL/RC copies are 100% legally valid",
      "Police key snatching or physical intimidation is illegal under MV Act",
      "Night arrest of women prohibited under CrPC Section 46(4)"
    ],
    key_points_ta: [
      "சப்-இன்ஸ்பெக்டர் (SI) மற்றும் அதற்கு மேற்பட்ட அதிகாரிகளே அபராதம் வசூலிக்க முடியும்",
      "டிஜிலாக்கர் (DigiLocker) டிஜிட்டல் சான்றிதழ்கள் 100% சட்டப்பூர்வமாக செல்லுபடியாகும்",
      "வாகனச் சாவியை பிடுங்குவது சட்டவிரோத நடவடிக்கை",
      "பெண்களை மாலை 6 மணிக்குப் பின் பெண் காவலர் இன்றி கைது செய்யத் தடை"
    ]
  },
  {
    id: "right-service",
    slug: "right-to-public-services-timebound",
    icon: Building,
    badge_en: "Public Service Guarantee",
    badge_ta: "அரசுச் சேவை உத்தரவாதம்",
    badgeCls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    name_en: "Right to Public Services (Time-Bound Delivery)",
    name_ta: "காலவரையறைக்கு உட்பட்ட அரசுச் சேவை உரிமை",
    desc_en: "Guarantees statutory time limits for receiving civic certificates, electricity connections, water taps, and revenue documents.",
    desc_ta: "அரசுச் சான்றிதழ்கள், குடிநீர் மற்றும் மின்சார இணைப்புகளை குறிப்பிட்ட காலக்கெடுவுக்குள் பெறும் உரிமை.",
    content_en: "Under Tamil Nadu Citizen Charter guidelines, government departments must issue certificates within stipulated deadlines: Community/Income Certificate (15 days), Native Certificate (7 days), New Domestic Power Connection (7-15 days), Ration card modification (15 days). If delayed without cause, citizens can file an appeal with the District Collectorate Grievance Officer.",
    content_ta: "அரசு குடிமக்கள் சாசனம் படி: சாதி/வருமான சான்றிதழ் (15 நாட்கள்), இருப்பிட சான்றிதழ் (7 நாட்கள்), புதிய மின் இணைப்பு (7-15 நாட்கள்) மற்றும் ரேஷன் கார்டு மாற்றம் (15 நாட்கள்) காலக்கெடுவுக்குள் வழங்கப்பட வேண்டும். தாமதமானால் ஆட்சியரிடம் மேல்முறையீடு செய்யலாம்.",
    department_en: "Revenue and Disaster Management Dept",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_url: "https://cmhelpline.tn.gov.in",
    pdf_url: "https://cmhelpline.tn.gov.in",
    key_points_en: [
      "Community & Income Certificate SLA: 15 Working Days",
      "New Domestic Electricity Connection SLA: 7 to 15 Days",
      "Smart Ration Card modification SLA: 15 Days",
      "District Collector Appeal for unexplained departmental delay"
    ],
    key_points_ta: [
      "சாதி மற்றும் வருமான சான்றிதழ் காலக்கெடு: 15 வேலை நாட்கள்",
      "புதிய வீட்டு மின் இணைப்பு காலக்கெடு: 7 முதல் 15 நாட்கள்",
      "ரேஷன் கார்டு திருத்தம் காலக்கெடு: 15 நாட்கள்",
      "அரசுத் துறை தாமதத்திற்கு மாவட்ட ஆட்சியரிடம் மேல்முறையீடு"
    ]
  },
  {
    id: "right-senior-citizen",
    slug: "senior-citizens-maintenance-act-2007",
    icon: Shield,
    badge_en: "Senior Citizens Welfare",
    badge_ta: "மூத்த குடிமக்கள் நலம்",
    badgeCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    name_en: "Maintenance & Rights of Senior Citizens (Act 2007)",
    name_ta: "மூத்த குடிமக்கள் பராமரிப்பு & நல உரிமைகள் 2007",
    desc_en: "Protects elderly citizens from eviction, abandonment, or financial neglect by adult children or legal heirs.",
    desc_ta: "முதியோர்களை பிள்ளைகள் கைவிடுவதில் இருந்தும் சொத்துக்களில் இருந்து வெளியேற்றுவதில் இருந்தும் பாதுகாக்கும் சட்டம்.",
    content_en: "Under the Maintenance and Welfare of Parents and Senior Citizens Act 2007, children or legal heirs are legally obligated to provide a monthly maintenance allowance (up to ₹10,000/month) to elderly parents who cannot maintain themselves. Revenue Divisional Officers (RDO) act as Maintenance Tribunals to order swift eviction of abusive heirs from parent-owned property within 90 days.",
    content_ta: "பெற்றோர்களைப் பராமரிக்காத பிள்ளைகளிடம் இருந்து மாதம் ₹10,000 வரை ஜீவனாம்சம் பெறவும், முதியோரின் சொத்தை ஆக்கிரமிக்கும் பிள்ளைகளை 90 நாட்களில் வெளியேற்றவும் RDO (வருவாய் கோட்டாட்சியர்) மன்றத்திற்கு முழு அதிகாரம் உண்டு.",
    department_en: "Social Welfare and Women Empowerment Dept",
    department_ta: "சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை",
    portal_url: "https://tnsocialwelfare.tn.gov.in",
    pdf_url: "https://tnsocialwelfare.tn.gov.in",
    key_points_en: [
      "Elderline National Helpline: 14567 (Free 24x7 Support)",
      "RDO Maintenance Tribunal orders up to ₹10,000/month allowance",
      "Summary eviction of abusive children from senior-owned home in 90 days",
      "Cancellation of property gift deeds if children fail to maintain parents"
    ],
    key_points_ta: [
      "முதியோர் இலவச தேசிய உதவி எண்: 14567 (24x7)",
      "RDO தீர்ப்பாயம் மூலம் மாதம் ₹10,000 வரை ஜீவனாம்ச உத்தரவு",
      "பெற்றோரின் வீட்டை ஆக்கிரமிக்கும் பிள்ளைகளை 90 நாளில் வெளியேற்றும் அதிகாரம்",
      "பராமரிக்காத பிள்ளைகளுக்கு எழுதப்பட்ட சொத்து தானப் பத்திரங்களை ரத்து செய்யும் உரிமை"
    ]
  },
  {
    id: "right-pwd",
    slug: "rights-of-persons-with-disabilities-act-2016",
    icon: Shield,
    badge_en: "Disability Rights",
    badge_ta: "மாற்றுத்திறனாளிகள் உரிமைகள்",
    badgeCls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    name_en: "Rights of Persons with Disabilities (RPwD Act 2016)",
    name_ta: "மாற்றுத்திறனாளிகள் உரிமைகள் சட்டம் 2016",
    desc_en: "Ensures non-discrimination, 4% public employment reservation, accessible public infrastructure, and monthly pension allowances.",
    desc_ta: "மாற்றுத்திறனாளிகளுக்கு 4% அரசு வேலைவாய்ப்பு இடஒதுக்கீடு, கட்டணமில்லா பேருந்து பயணம் மற்றும் சம உரிமைக்கான சட்டம்.",
    content_en: "The RPwD Act 2016 recognizes 21 disabilities and guarantees full equality, barrier-free access in public buildings/transportation, 4% reservation in government jobs, 5% reservation in higher educational institutions, and statutory monthly maintenance allowance under Tamil Nadu Differently Abled Welfare Board.",
    content_ta: "மாற்றுத்திறனாளிகள் நலச் சட்டம் 2016 படி 21 வகையான மாற்றுத்திறன்களுக்கு அரசுப் பணியிடங்களில் 4% இடஒதுக்கீடு, உயர்கல்வியில் 5% இடஒதுக்கீடு, கட்டணமில்லா அரசு பேருந்து பயணம் மற்றும் மாதாந்திர பராமரிப்பு உதவித்தொகை வழங்கப்படுகிறது.",
    department_en: "Welfare of Differently Abled Persons Dept",
    department_ta: "மாற்றுத்திறனாளிகள் நலத் துறை",
    portal_url: "https://www.scda.tn.gov.in",
    pdf_url: "https://www.scda.tn.gov.in",
    key_points_en: [
      "4% Mandatory Reservation in Tamil Nadu Public Employment",
      "5% Reservation in Higher Educational Institutions",
      "Free State Transport Corporation (SETC/MTC) Bus Pass",
      "National UDID Card Single Window Portal Registration"
    ],
    key_points_ta: [
      "தமிழ்நாடு அரசுப் பணியிடங்களில் 4% கட்டாய இடஒதுக்கீடு",
      "உயர்கல்வி நிறுவனங்களில் 5% சேர்க்கை இடஒதுக்கீடு",
      "அரசுப் பேருந்துகளில் கட்டணமில்லா இலவச பயண பாஸ்",
      "சர்வதேச UDID அடையாள அட்டை பெற ஒற்றைச் சாளரப் பதிவு"
    ]
  },
  {
    id: "right-domestic-violence",
    slug: "protection-of-women-from-domestic-violence-act",
    icon: Shield,
    badge_en: "Women Safety & Law",
    badge_ta: "பெண்கள் பாதுகாப்பு & சட்டம்",
    badgeCls: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    name_en: "Protection of Women from Domestic Violence Act 2005",
    name_ta: "குடும்ப வன்முறை தடுப்புச் சட்ட உரிமைகள் 2005",
    desc_en: "Protects women from physical, verbal, emotional, economic, and sexual abuse within shared domestic households.",
    desc_ta: "பெண்களுக்கு எதிராக குடும்பத்தில் நடக்கும் உடலளவிலான, வார்த்தை மற்றும் பொருளாதார வன்முறைகளுக்கு எதிரான சட்டப் பாதுகாப்பு.",
    content_en: "Under PWDVA 2005, any woman suffering abuse from spouse or relatives in a shared household can file for instant Protection Orders, Residence Orders, Compensation Orders, and interim maintenance without paying court fees. Protection Officers and Social Welfare Officers in every district provide free legal representation and emergency shelter.",
    content_ta: "குடும்ப வன்முறை தடுப்புச் சட்டம் 2005 படி பாதிக்கப்பட்ட பெண்கள் பாதுகாப்பு அதிகாரி மூலம் இலவசமாக நீதிமன்ற பாதுகாப்பு உத்தரவு, தங்குமிடம் மற்றும் இடைக்கால பராமரிப்புச் செலவு பெறலாம்.",
    department_en: "Social Welfare and Women Empowerment Dept",
    department_ta: "சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை",
    portal_url: "https://tnsocialwelfare.tn.gov.in",
    pdf_url: "https://tnsocialwelfare.tn.gov.in",
    key_points_en: [
      "Women 24/7 Toll-Free Crisis Helpline: 181",
      "District Protection Officers in all 38 Tamil Nadu Districts",
      "Free Legal Aid Representation & Court Fee Exemption",
      "Emergency Protection & Residence Stay Orders"
    ],
    key_points_ta: [
      "பெண்கள் 24x7 இலவச அவசர உதவி எண்: 181",
      "தமிழ்நாட்டின் 38 மாவட்டங்களிலும் அரசு பாதுகாப்பு அதிகாரிகள்",
      "இலவச அரசு சட்ட உதவி வழக்கறிஞர் ஆதரவு",
      "உடனடி நீதிமன்ற பாதுகாப்பு மற்றும் தங்கும் உரிமை உத்தரவு"
    ]
  },
  {
    id: "right-labor-minimum-wage",
    slug: "right-to-fair-wages-tn-shops-act",
    icon: Building,
    badge_en: "Labor & Worker Rights",
    badge_ta: "தொழிலாளர் உரிமைகள்",
    badgeCls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    name_en: "Right to Fair Minimum Wages & Working Conditions",
    name_ta: "குறைந்தபட்ச கூலி & தொழிலாளர் பாதுகாப்பு உரிமைகள்",
    desc_en: "Guarantees statutory minimum wages, mandatory weekly rest, double overtime pay, and safe working conditions for all private sector employees.",
    desc_ta: "தனியார் துறை ஊழியர்களுக்கான குறைந்தபட்ச கூலி, வாராந்திர விடுமுறை மற்றும் கூடுதல் வேலை நேரத்திற்கான இரட்டிப்பு ஊதிய உரிமை.",
    content_en: "Under the Tamil Nadu Shops and Establishments Act and Minimum Wages Act, no employer can demand working hours beyond 8 hours/day (48 hours/week) without paying double overtime wages. Employers must grant 1 mandatory weekly paid holiday, 12 casual leaves, 12 sick leaves, and equal remuneration for men and women doing equal work.",
    content_ta: "தமிழ்நாடு கடைகள் மற்றும் நிறுவனங்கள் சட்டத்தின்படி தொழிலாளர்களுக்கு நாள் ஒன்றுக்கு 8 மணி நேர வேலை, கூடுதல் நேரத்திற்கு இரட்டிப்பு ஊதியம், வாரத்தில் ஒரு நாள் கட்டாய ஊதியத்துடன் கூடிய விடுமுறை மற்றும் மகப்பேறு கால விடுப்பு வழங்கப்பட வேண்டும்.",
    department_en: "Labour Welfare and Skill Development Dept",
    department_ta: "தொழிலாளர் நலன் மற்றும் திறன் மேம்பாட்டுத் துறை",
    portal_url: "https://labour.tn.gov.in",
    pdf_url: "https://labour.tn.gov.in",
    key_points_en: [
      "Mandatory 8 Hours/Day (48 Hours/Week) Statutory Work Limit",
      "Double Overtime Pay for extra hours worked beyond 8 hours",
      "1 Mandatory Paid Weekly Rest Day for all commercial employees",
      "Labour Department Grievance Cell & Inspection Portal"
    ],
    key_points_ta: [
      "நாளுக்கு 8 மணி நேரம் (வாரத்திற்கு 48 மணி நேரம்) சட்டப்பூர்வ வேலை வரம்பு",
      "8 மணி நேரத்திற்கு மேல் பணிபுரிந்தால் இரட்டிப்பு கூடுதல் நேர ஊதியம்",
      "அனைத்து ஊழியர்களுக்கும் வாரத்தில் ஒரு நாள் கட்டாய ஊதியத்துடன் கூடிய விடுமுறை",
      "தொழிலாளர் துறை குறைதீர் மையம் மற்றும் ஆய்வுக் கண்காணிப்பு தளம்"
    ]
  }
];

export default function AwarenessRightsPage() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  usePageMeta({
    title: "Citizen Statutory Rights & Protection Laws in Tamil Nadu | VizhiTN",
    description: "Know your statutory citizen rights in Tamil Nadu: RTI Act 2005, Consumer Rights, Traffic Police Check rules, Senior Citizens Act, and Labor Protections.",
  });

  const filteredRights = CITIZEN_RIGHTS.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name_en.toLowerCase().includes(q) ||
      item.name_ta.toLowerCase().includes(q) ||
      item.desc_en.toLowerCase().includes(q) ||
      item.desc_ta.toLowerCase().includes(q);

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {T("Citizen Statutory Rights & Laws in Tamil Nadu", "தமிழ்நாட்டில் குடிமக்களுக்கான சட்டப்பூர்வ உரிமைகள்")}
              </h1>
              <p className="text-blue-200 text-sm sm:text-base mt-1">
                {T(
                  "Empowering every Tamil Nadu resident with verified statutory protections, legal remedies, and government SLAs.",
                  "ஒவ்வொரு குடிமகனுக்கும் தேவையான சட்டப் பாதுகாப்புகள், தீர்வுகளுக்கான உரிமைகள் மற்றும் அரசுத் துறை சட்டங்கள்."
                )}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={T("Search rights (e.g. RTI, Consumer Court, Police check, Senior Citizen)...", "உரிமைகளைத் தேடுங்கள் (எ.கா. RTI, நுகர்வோர் மன்றம், போலீஸ் விதி)...")}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 gap-6">
          {filteredRights.map((right) => {
            const IconComp = right.icon;
            const isExpanded = expandedId === right.id;

            return (
              <div
                key={right.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex-shrink-0">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${right.badgeCls}`}>
                          {T(right.badge_en, right.badge_ta)}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {T(right.name_en, right.name_ta)}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {T(right.department_en, right.department_ta)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : right.id)}
                        className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition"
                      >
                        {isExpanded ? T("Show Less", "சுருக்கவும்") : T("View Full Details", "முழு விவரங்கள்")}
                      </button>
                      <a
                        href={right.portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg"
                        title={T("Open Official Portal", "இணையதளம் திற")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {T(right.desc_en, right.desc_ta)}
                  </p>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                          {T("Detailed Statutory Overview", "சட்டப்பூர்வ விரிவான விளக்கம்")}
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl leading-relaxed">
                          {T(right.content_en, right.content_ta)}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                          {T("Key Provisions & Rules", "முக்கிய சட்ட விதிகள்")}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(lang === "ta" ? right.key_points_ta : right.key_points_en).map((point, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-slate-500">
                          {T("Department", "துறை")}: <span className="font-semibold text-slate-700 dark:text-slate-300">{T(right.department_en, right.department_ta)}</span>
                        </div>
                        <a
                          href={right.portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                        >
                          <span>{T("Official Government Portal", "அரசு இணையதளம்")}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
