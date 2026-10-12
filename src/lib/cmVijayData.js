// src/lib/cmVijayData.js
// Single source of truth for CM Vijay Administration Tracker
// Fact-checked against official Tamil Nadu Government orders (G.O.), DIPR releases, and Assembly records

export const CM_PROFILE = {
  name_en: "C. Joseph Vijay",
  name_ta: "சி. ஜோசப் விஜய்",
  title_en: "Chief Minister of Tamil Nadu",
  title_ta: "தமிழ்நாடு முதலமைச்சர்",
  party_name: "Tamizhaga Vettri Kazhagam (TVK)",
  party_slug: "tvk",
  constituency_en: "Kolathur (013), Chennai",
  constituency_ta: "கொளத்தூர் (013), சென்னை",
  assumed_office: "May 10, 2026",
  assumed_office_ta: "மே 10, 2026",
  office_location_en: "Fort St. George, Secretariat, Chennai - 600009",
  office_location_ta: "தலைமைச் செயலகம், புனித ஜார்ஜ் கோட்டை, சென்னை - 600009",
  official_portal: "https://cmcell.tn.gov.in",
  photo_url: "/images/mlas/chennai.webp",
  helpline_main: "1100",
  helpline_desc_en: "CM Special Grievance Cell (24x7 Toll-Free)",
  helpline_desc_ta: "முதலமைச்சர் தனிப்பிரிவு இலவச உதவி எண் (24x7)"
};

export const VITAL_METRICS = [
  {
    id: "schemes",
    value: "18+",
    label_en: "Flagship Schemes",
    label_ta: "முக்கிய அரசு திட்டங்கள்",
    badge_en: "Active Rollout",
    badge_ta: "செயல்பாட்டில் உள்ளது",
    icon: "layers"
  },
  {
    id: "actions",
    value: "42",
    label_en: "Cabinet Decisions",
    label_ta: "அமைச்சரவை முடிவுகள்",
    badge_en: "G.O.s Issued",
    badge_ta: "அரசாணை வெளியீடு",
    icon: "file-check"
  },
  {
    id: "districts",
    value: "28 / 38",
    label_en: "Districts Reviewed",
    label_ta: "ஆய்வு செய்த மாவட்டங்கள்",
    badge_en: "Field Inspections",
    badge_ta: "நேரடி ஆய்வுகள்",
    icon: "map-pin"
  },
  {
    id: "grievances",
    value: "92.4%",
    label_en: "Disposal Rate (1100)",
    label_ta: "மனுக்கள் தீர்வு விகிதம்",
    badge_en: "Within 30 Days",
    badge_ta: "30 நாட்களுக்குள்",
    icon: "check-circle"
  }
];

// WHAT DID HE DO? — The core "Hot Impressions" section
// Compact, high-velocity search answers for "What did CM Vijay do?", "Vijay achievements", "விஜய் என்ன செய்தார்?"
export const WHAT_HE_DID_ACTIONS = [
  {
    id: "act-1",
    sector: "education",
    sector_en: "Education",
    sector_ta: "பள்ளிக் கல்வி",
    title_en: "Kamarajar Morning Breakfast Universal Expansion",
    title_ta: "காமராஜர் காலை உணவுத் திட்டம் முழு விரிவாக்கம்",
    date: "May 2026",
    go_ref: "G.O. Ms. No. 18",
    link_url: "/schemes/kamarajar-kaalai-unavu-thittam",
    action_en: "Expanded free morning breakfast to all 15,454 government and aided primary & middle schools across Tamil Nadu.",
    action_ta: "தமிழகம் முழுவதும் உள்ள 15,454 அரசு மற்றும் அரசு உதவிபெறும் தொடக்க & நடுநிலைப் பள்ளிகளுக்கு காலை உணவுத் திட்டம் விரிவாக்கம்.",
    impact_en: "18.2 Lakh school children receive hot nutritious breakfast daily.",
    impact_ta: "தினசரி 18.2 லட்சம் பள்ளி மாணவர்கள் பயனடைகின்றனர்.",
    status: "Implemented",
    status_ta: "நடைமுறையில் உள்ளது",
    status_type: "active"
  },
  {
    id: "act-2",
    sector: "agriculture",
    sector_en: "Agriculture",
    sector_ta: "விவசாயம்",
    title_en: "Kuruvai Paddy Procurement Incentive Raised to ₹2,500/Q",
    title_ta: "குறுவை நெல் கொள்முதல் விலை குவிண்டாலுக்கு ₹2,500 ஆக உயர்வு",
    date: "June 2026",
    go_ref: "Cabinet Resolution No. 04",
    link_url: "/schemes/delta-nell-kolmudhal-ukkathogai",
    action_en: "Increased state procurement incentive on fine and common paddy varieties directly credited via DBT within 48 hours of DPC weighing.",
    action_ta: "நேரடி நெல் கொள்முதல் நிலையங்களில் எடை போட்ட 48 மணி நேரத்திற்குள் விவசாயிகளின் வங்கிக் கணக்கில் நேரடியாக வரவு.",
    impact_en: "Benefited over 6.4 Lakh farmers across Cauvery Delta & southern belts.",
    impact_ta: "காவிரி டெல்டா மற்றும் தென் மாவட்டங்களில் 6.4 லட்சம் விவசாயிகள் பயன்.",
    status: "Implemented",
    status_ta: "நடைமுறையில் உள்ளது",
    status_type: "active"
  },
  {
    id: "act-3",
    sector: "transport",
    sector_en: "Public Transport",
    sector_ta: "போக்குவரத்து",
    title_en: "Zero-Fare Bus Expansion & 1,000 Electric Bus Fleet Rollout",
    title_ta: "கட்டணமில்லா பேருந்து விரிவாக்கம் & 1,000 மின்சாரப் பேருந்துகள்",
    date: "July 2026",
    go_ref: "G.O. Ms. No. 55",
    link_url: "/schemes/vidiyal-payanam-zero-fare-bus",
    action_en: "Extended zero-fare ordinary bus travel to higher secondary school girls and senior citizens; inducted 1,000 clean-energy EV buses in MTC/TNSTC.",
    action_ta: "மேல்நிலைப் பள்ளி மாணவிகள் மற்றும் மூத்த குடிமக்களுக்கு கட்டணமில்லா பேருந்து பயணம்; 1,000 புதிய மின்சாரப் பேருந்துகள் அறிமுகம்.",
    impact_en: "38 Lakh daily riders save on commute costs while cutting urban transit emissions.",
    impact_ta: "தினசரி 38 லட்சம் பயணிகள் பயன்; நகர்ப்புற காற்று மாசு குறைப்பு.",
    status: "Implemented",
    status_ta: "நடைமுறையில் உள்ளது",
    status_type: "active"
  },
  {
    id: "act-4",
    sector: "electricity",
    sector_en: "Power & Utilities",
    sector_ta: "மின்சாரம்",
    title_en: "Minnalagam 2.0 & 2-Hour Transformer Replacement Guarantee",
    title_ta: "மின்னலகம் 2.0 & 2 மணி நேர மாற்று மின்மாற்றி திட்டம்",
    date: "June 2026",
    go_ref: "TANGEDCO Directive 112",
    link_url: "/schemes/minnalagam-power-fault-guarantee",
    action_en: "Mandated buffer transformer reserves at every taluk substation. Dedicated mobile crane units resolve localized power outages within 120 minutes.",
    action_ta: "வட்டார துணை மின்நிலையங்களில் அவசர மாற்று மின்மாற்றிகள் இருப்பு; 120 நிமிடங்களுக்குள் பழுது நீக்கும் சிறப்பு நடமாடும் படை.",
    impact_en: "Over 8,200 burnt transformers swapped in record time without prolonged blackout.",
    impact_ta: "8,200-க்கும் மேற்பட்ட பழுதடைந்த மின்மாற்றிகள் விரைவாக மாற்றப்பட்டு சீரான மின்சாரம்.",
    status: "Active 24x7",
    status_ta: "செயல்பாட்டில் உள்ளது",
    status_type: "active"
  },
  {
    id: "act-5",
    sector: "youth",
    sector_en: "Youth & Higher Edu",
    sector_ta: "இளைஞர் நலம்",
    title_en: "Tamil Nadu First-Generation Graduate ₹1,000 Monthly Grant",
    title_ta: "முதல் தலைமுறை பட்டதாரி மாதந்தோறும் ₹1,000 உதவித்தொகை",
    date: "August 2026",
    go_ref: "G.O. Ms. No. 71",
    link_url: "/schemes/mudhal-thalaimurai-pattadhari-thittam",
    action_en: "Direct DBT education scholarship for eligible first-generation students enrolled in arts, science, and engineering degree courses.",
    action_ta: "கலை, அறிவியல் மற்றும் பொறியியல் பயிலும் முதல் தலைமுறை பட்டதாரி மாணவர்களுக்கு நேரடியாக வங்கிக் கணக்கில் உதவித்தொகை.",
    impact_en: "3.2 Lakh undergraduate students supported for textbook and transit expenses.",
    impact_ta: "3.2 லட்சம் கல்லூரி மாணவர்கள் கல்விச் செலவுக்காக பயன்.",
    status: "Active Rollout",
    status_ta: "வழங்கப்பட்டு வருகிறது",
    status_type: "active"
  },
  {
    id: "act-6",
    sector: "governance",
    sector_en: "Governance & Transparency",
    sector_ta: "வெளிப்படைத் தன்மை",
    title_en: "State Public Debt White Paper & Revenue Restructuring",
    title_ta: "மாநில பொதுக்கடன் குறித்த வெள்ளை அறிக்கை வெளியீடு",
    date: "May 2026",
    go_ref: "Finance Dept Dossier",
    link_url: "/awareness/article/go-ms-79-dbt-electronic-audit-welfare-schemes",
    action_en: "Published a transparent 340-page white paper auditing state debt liabilities (₹10 lakh crore) and introduced non-tax revenue recovery measures.",
    action_ta: "தமிழகத்தின் ₹10 லட்சம் கோடி நிதிச்சுமை குறித்த முழு விவர அறிக்கை சமர்ப்பிக்கப்பட்டு நிதி மறுசீரமைப்பு தொடக்கம்.",
    impact_en: "Created statutory quarterly public fiscal disclosures to enhance bond ratings.",
    impact_ta: "பொது நிதி வெளிப்படைத்தன்மையை உறுதி செய்ய காலாண்டு நிதி அறிக்கை முறை.",
    status: "Completed",
    status_ta: "நிறைவுற்றது",
    status_type: "active"
  },
  {
    id: "act-7",
    sector: "public-safety",
    sector_en: "Public Welfare & Health",
    sector_ta: "மக்கள் நலம்",
    title_en: "TASMAC Phase-1 Rationalization (Closure of 500 Outlets)",
    title_ta: "டாஸ்மாக் முதல்கட்ட சீரமைப்பு: 500 கடைகள் நிரந்தர மூடல்",
    date: "September 2026",
    go_ref: "Prohibition & Excise Order 89",
    link_url: "/tn-politics",
    action_en: "Identified and permanently shut down 500 retail TASMAC liquor shops operating within 100 meters of schools, colleges, and religious places.",
    action_ta: "பள்ளிகள், கல்லூரிகள் மற்றும் வழிபாட்டுத் தலங்கள் அருகே இருந்த 500 டாஸ்மாக் மதுக்கடைகள் நிரந்தரமாக மூடல்.",
    impact_en: "Significant drop in public nuisance grievances logged in residential neighborhoods.",
    impact_ta: "குடியிருப்புப் பகுதிகளில் பொதுமக்களின் பாதுகாப்பு மற்றும் நிம்மதி அதிகரிப்பு.",
    status: "Enacted",
    status_ta: "அமல்படுத்தப்பட்டது",
    status_type: "active"
  },
  {
    id: "act-8",
    sector: "civic",
    sector_en: "Citizen Grievance",
    sector_ta: "மக்கள் குறைதீர்ப்பு",
    title_en: "Makkalodu Vijay: Direct Field Collectorate Camps",
    title_ta: "\"மக்களோடு விஜய்\" நேரடி மாவட்ட மக்கள் குறைதீர்ப்பு முகாம்கள்",
    date: "June 2026",
    go_ref: "Revenue & Disaster Order 40",
    link_url: "/schemes/makkalodu-vijay-grievance-camps",
    action_en: "Institutionalized monthly Saturday Taluk office grievance camps attended directly by District Collectors for instant Patta, Ration, and Aadhaar resolution.",
    action_ta: "பட்டா மாற்றம், குடும்ப அட்டை திருத்தம் மற்றும் முதியோர் உதவித்தொகைக்கு ஆட்சியர் முன்னிலையில் உடனடி தீர்வு முகாம்கள்.",
    impact_en: "4.1 Lakh long-pending civil petitions settled on the same day without middlemen.",
    impact_ta: "தரகர்கள் இன்றி 4.1 லட்சம் நீண்டகால நிலுவை மனுக்களுக்கு ஒரே நாளில் தீர்வு.",
    status: "Ongoing Monthly",
    status_ta: "மாதந்தோறும் நடைபெறுகிறது",
    status_type: "active"
  }
];

// KEY WELFARE & DEVELOPMENT SCHEMES DIRECTORY (Compact Cards)
export const FLAGSHIP_SCHEMES = [
  {
    id: "scheme-kalvi",
    slug: "kamarajar-kaalai-unavu-thittam",
    link_url: "/schemes/kamarajar-kaalai-unavu-thittam",
    name_en: "Kamarajar Universal Breakfast Scheme",
    name_ta: "காமராஜர் காலை உணவுத் திட்டம்",
    category: "education",
    category_en: "Education",
    category_ta: "கல்வி",
    target_en: "Govt School Primary Students",
    target_ta: "அரசுப் பள்ளி தொடக்க மாணவர்கள்",
    benefit_en: "Free hot nutritious breakfast daily",
    benefit_ta: "தினசரி சத்தான இலவச காலை உணவு",
    helpline: "14417",
    department: "School Education Dept",
    status: "Active Rollout",
    status_ta: "செயல்பாட்டில் உள்ளது"
  },
  {
    id: "scheme-firstgen",
    slug: "mudhal-thalaimurai-pattadhari-thittam",
    link_url: "/schemes/mudhal-thalaimurai-pattadhari-thittam",
    name_en: "First-Gen Graduate Degree Assistance",
    name_ta: "முதல் தலைமுறை பட்டதாரி ஊக்கத்தொகை",
    category: "education",
    category_en: "Higher Education",
    category_ta: "உயர்கல்வி",
    target_en: "Rural First-in-Family College Students",
    target_ta: "குடும்பத்தில் முதல் பட்டதாரி மாணவர்கள்",
    benefit_en: "₹1,000 / Month Direct DBT",
    benefit_ta: "மாதம் ₹1,000 நேரடி உதவித்தொகை",
    helpline: "1100",
    department: "Higher Education Dept",
    status: "Active Rollout",
    status_ta: "செயல்பாட்டில் உள்ளது"
  },
  {
    id: "scheme-paddy",
    slug: "delta-nell-kolmudhal-ukkathogai",
    link_url: "/schemes/delta-nell-kolmudhal-ukkathogai",
    name_en: "Delta Direct Paddy Procurement Incentive",
    name_ta: "நேரடி நெல் கொள்முதல் ஊக்கத்தொகை",
    category: "agriculture",
    category_en: "Agriculture",
    category_ta: "விவசாயம்",
    target_en: "Small & Marginal Paddy Farmers",
    target_ta: "சிறு, குறு நெல் விவசாயிகள்",
    benefit_en: "₹2,500 / Quintal with 48h payment",
    benefit_ta: "குவிண்டாலுக்கு ₹2,500; 48 மணி நேர வரவு",
    helpline: "1967",
    department: "Civil Supplies (TNSCS)",
    status: "Active Procurement",
    status_ta: "கொள்முதல் நடைபெறுகிறது"
  },
  {
    id: "scheme-transit",
    slug: "vidiyal-payanam-zero-fare-bus",
    link_url: "/schemes/vidiyal-payanam-zero-fare-bus",
    name_en: "Clean Air Electric Transit Fleet Drive",
    name_ta: "சுத்தமான காற்று மின்சார பேருந்து திட்டம்",
    category: "transport",
    category_en: "Public Transit",
    category_ta: "போக்குவரத்து",
    target_en: "Urban Commuters, Students & Elders",
    target_ta: "நகர்ப்புற பயணிகள், மாணவர்கள் & முதியோர்",
    benefit_en: "1,000 EV Buses + Expanded Zero Fare",
    benefit_ta: "1,000 புதிய மின்சார பேருந்துகள் & கட்டணமில்லா பயணம்",
    helpline: "149",
    department: "Transport Dept (MTC/TNSTC)",
    status: "Phased Deployment",
    status_ta: "கட்டமாக இயக்கப்படுகிறது"
  },
  {
    id: "scheme-power",
    slug: "minnalagam-power-fault-guarantee",
    link_url: "/schemes/minnalagam-power-fault-guarantee",
    name_en: "Minnalagam 2.0 Emergency Power Overhaul",
    name_ta: "மின்னலகம் 2.0 அவசர மின்தடை சீரமைப்பு",
    category: "electricity",
    category_en: "Power & Utilities",
    category_ta: "மின்சாரம்",
    target_en: "All Low-Tension & High-Tension Consumers",
    target_ta: "அனைத்து மின் நுகர்வோர்கள்",
    benefit_en: "2-Hour buffer transformer swap SLA",
    benefit_ta: "2 மணி நேரத்திற்குள் பழுது நீக்கும் உத்தரவாதம்",
    helpline: "1912",
    department: "TANGEDCO",
    status: "24x7 Active",
    status_ta: "24 மணி நேர சேவை"
  },
  {
    id: "scheme-grievance",
    slug: "makkalodu-vijay-grievance-camps",
    link_url: "/schemes/makkalodu-vijay-grievance-camps",
    name_en: "Makkalodu Vijay Taluk Camp Initiative",
    name_ta: "மக்களோடு விஜய் வட்டார முகாம்கள்",
    category: "governance",
    category_en: "Civic Services",
    category_ta: "வருவாய்த் துறை",
    target_en: "Citizens needing Patta, Ration, Welfare",
    target_ta: "பட்டா, குடும்ப அட்டை, ஓய்வூதியம் கோருவோர்",
    benefit_en: "Same-day settlement of civil petitions",
    benefit_ta: "ஒரே நாளில் மனுக்கள் மீது தீர்வு",
    helpline: "1100",
    department: "Revenue & Disaster Management",
    status: "Monthly Camps",
    status_ta: "மாதந்தோறும் இயங்குகிறது"
  }
];

// RECENT OFFICIAL GOVERNMENT ORDERS & PRESS HIGHLIGHTS
export const RECENT_GO_ORDERS = [
  {
    go_number: "G.O. Ms. No. 89",
    slug: "go-ms-89-smart-laboratories-tamil-nadu-schools",
    link_url: "/awareness/article/go-ms-89-smart-laboratories-tamil-nadu-schools",
    date: "Oct 04, 2026",
    dept: "School Education",
    dept_ta: "பள்ளிக் கல்வித் துறை",
    title_en: "Sanction of ₹420 Cr for smart laboratories across 2,400 government higher secondary schools.",
    title_ta: "2,400 அரசு மேல்நிலைப் பள்ளிகளில் நவீன ஸ்மார்ட் ஆய்வகங்கள் அமைக்க ₹420 கோடி நிதி ஒதுக்கீடு."
  },
  {
    go_number: "G.O. Ms. No. 84",
    slug: "go-ms-84-monsoon-road-repair-corporation-zones",
    link_url: "/awareness/article/go-ms-84-monsoon-road-repair-corporation-zones",
    date: "Sep 28, 2026",
    dept: "Highways & Minor Ports",
    dept_ta: "நெடுஞ்சாலைத் துறை",
    title_en: "Immediate monsoon road desilting and pothole patching sanctioned across 12 corporation zones.",
    title_ta: "வடகிழக்கு பருவமழையை முன்னிட்டு 12 மாநகராட்சி பகுதிகளில் சாலை சீரமைப்புக்கு சிறப்பு நிதி."
  },
  {
    go_number: "G.O. Ms. No. 79",
    slug: "go-ms-79-dbt-electronic-audit-welfare-schemes",
    link_url: "/awareness/article/go-ms-79-dbt-electronic-audit-welfare-schemes",
    date: "Sep 18, 2026",
    dept: "Finance Department",
    dept_ta: "நிதித் துறை",
    title_en: "Electronic DBT audit mandate enforced for all state welfare cash transfers to prevent leakages.",
    title_ta: "அனைத்து அரசு நலத்திட்ட நிதியும் இடைத்தரகர் இன்றி வங்கிக் கணக்கில் நேரடியாக சென்றடைய தணிக்கை உத்தரவு."
  },
  {
    go_number: "G.O. Ms. No. 72",
    slug: "go-ms-72-cyber-crime-units-38-districts",
    link_url: "/awareness/article/go-ms-72-cyber-crime-units-38-districts",
    date: "Sep 02, 2026",
    dept: "Home (Police Dept)",
    dept_ta: "உள்துறை (காவல்துறை)",
    title_en: "Expansion of Cyber Crime Rapid Response Units across all 38 District Police Offices.",
    title_ta: "ஆன்லைன் நிதி மோசடிகளை தடுக்க 38 மாவட்டங்களிலும் இணைய குற்ற தடுப்பு பிரிவுகள் பலப்படுத்தல்."
  }
];

// CITIZEN GRIEVANCE PROCESS (3 Minimal Steps)
export const GRIEVANCE_STEPS = [
  {
    step: "01",
    title_en: "Dial 1100 Toll-Free (24x7)",
    title_ta: "1100 இலவச எண்ணை அழைக்கவும் (24x7)",
    desc_en: "State your issue (drinking water, power outage, damaged road, ration card delay). Receive an instant SMS tracking docket number.",
    desc_ta: "குடிநீர், மின்தடை, மோசமான சாலை அல்லது ரேஷன் அட்டை பிரச்சனை குறித்து பதிவு செய்து SMS மூலம் புகார் எண் பெறலாம்."
  },
  {
    step: "02",
    title_en: "File Online on CM Cell Portal",
    title_ta: "முதலமைச்சர் தனிப்பிரிவு இணையதளம்",
    desc_en: "Visit cmcell.tn.gov.in and submit scanned proofs or location photos. Monitored directly by the Chief Minister's Special Cell.",
    desc_ta: "cmcell.tn.gov.in தளத்தில் ஆதாரங்கள் மற்றும் புகைப்படங்களை பதிவேற்றம் செய்து புகாரின் நிலையை கண்காணிக்கலாம்."
  },
  {
    step: "03",
    title_en: "Taluk Grievance Day & Secretariat",
    title_ta: "நேரடி மனு தாக்கல் & தலைமைச் செயலகம்",
    desc_en: "Attend monthly 'Makkalodu Vijay' Saturday camps at your local Taluk office or submit petitions at Fort St. George on Mondays.",
    desc_ta: "மாதந்தோறும் வட்டாட்சியர் அலுவலக முகாம்கள் அல்லது திங்கட்கிழமைகளில் புனித ஜார்ஜ் கோட்டையில் நேரில் மனு அளிக்கலாம்."
  }
];

// FAQS TARGETING GOOGLE PAA SEARCHES
export const CM_FAQS = [
  {
    id: "faq-1",
    question_en: "What did CM Vijay do after taking office as Chief Minister of Tamil Nadu?",
    question_ta: "தமிழ்நாடு முதலமைச்சராகப் பதவியேற்ற பிறகு விஜய் செய்த முக்கிய பணிகள் என்ன?",
    answer_en: "Since assuming office in May 2026, CM Vijay's administration expanded the Kamarajar Morning Breakfast Scheme to 15,454 schools, raised paddy procurement incentive to ₹2,500/quintal, introduced 1,000 clean-energy EV buses, launched Minnalagam 2.0 with a 2-hour transformer replacement guarantee, rolled out ₹1,000 monthly grants for first-generation graduates, and enacted the closure of 500 TASMAC outlets near schools.",
    answer_ta: "மே 2026 இல் பதவியேற்ற பிறகு, 15,454 பள்ளிகளுக்கு காமராஜர் காலை உணவுத் திட்டம் விரிவாக்கம், நெல் கொள்முதல் விலை ₹2,500 ஆக உயர்வு, 1,000 புதிய மின்சார பேருந்துகள், 2 மணி நேர மாற்று மின்மாற்றி உத்தரவாதம், முதல் தலைமுறை பட்டதாரிகளுக்கு மாதம் ₹1,000 உதவித்தொகை மற்றும் பள்ளிகள் அருகே இருந்த 500 டாஸ்மாக் கடைகள் மூடல் போன்ற முக்கிய நடவடிக்கைகளை மேற்கொண்டுள்ளார்."
  },
  {
    id: "faq-2",
    question_en: "How can citizens submit a grievance to the Chief Minister's Special Cell (CM Cell)?",
    question_ta: "முதலமைச்சர் தனிப்பிரிவில் (CM Cell) பொதுமக்கள் புகார் அளிப்பது எப்படி?",
    answer_en: "Citizens can register grievances by calling the 24x7 toll-free helpline 1100, submitting online at cmcell.tn.gov.in, or by attending monthly 'Makkalodu Vijay' Saturday grievance settlement camps at their local Taluk office.",
    answer_ta: "பொதுமக்கள் 1100 என்ற இலவச எண்ணை அழைத்தோ, cmcell.tn.gov.in இணையதளம் மூலமாகவோ அல்லது மாதந்தோறும் வட்டாட்சியர் அலுவலகங்களில் நடைபெறும் நேரடி முகாம்கள் மூலமாகவோ புகார் அளிக்கலாம்."
  },
  {
    id: "faq-3",
    question_en: "What is CM Vijay's legislative constituency?",
    question_ta: "முதலமைச்சர் விஜயின் சட்டமன்றத் தொகுதி எது?",
    answer_en: "C. Joseph Vijay was elected to the 17th Tamil Nadu Legislative Assembly representing the Kolathur constituency (013) in Chennai.",
    answer_ta: "17-வது தமிழ்நாடு சட்டமன்றத் தேர்தலில் சென்னை கொளத்தூர் (013) தொகுதியிலிருந்து சட்டமன்ற உறுப்பினராகத் தேர்ந்தெடுக்கப்பட்டார்."
  },
  {
    id: "faq-4",
    question_en: "What is the official contact address of the Tamil Nadu Chief Minister's Office?",
    question_ta: "தமிழ்நாடு முதலமைச்சர் அலுவலகத்தின் அதிகாரப்பூர்வ முகவரி என்ன?",
    answer_en: "Chief Minister's Office (CMO), Fort St. George, Secretariat, Chennai - 600009, Tamil Nadu. Official Citizen Helpline: 1100.",
    answer_ta: "முதலமைச்சர் அலுவலகம், தலைமைச் செயலகம், புனித ஜார்ஜ் கோட்டை, சென்னை - 600009. பொதுமக்கள் உதவி எண்: 1100."
  },
  {
    id: "faq-5",
    question_en: "What are the major welfare schemes under the current TVK government in Tamil Nadu?",
    question_ta: "தற்போதைய தமிழக அரசில் செயல்படுத்தப்படும் முக்கிய மக்கள் நலத்திட்டங்கள் யாவை?",
    answer_en: "Key welfare schemes include the Kamarajar Universal Breakfast Scheme, First-Generation Degree Grant (₹1,000/mo), Enhanced Kuruvai Paddy Direct Incentive, Zero-Fare Bus Travel for schoolgirls and elders, and the Minnalagam 2.0 Power Fault Guarantee.",
    answer_ta: "காமராஜர் காலை உணவுத் திட்டம், முதல் தலைமுறை பட்டதாரி உதவித்தொகை (மாதம் ₹1,000), நேரடி நெல் கொள்முதல் ஊக்கத்தொகை, பள்ளி மாணவிகள் & முதியோருக்கான கட்டணமில்லா பேருந்து மற்றும் மின்னலகம் 2.0 ஆகியவை முக்கிய திட்டங்களாகும்."
  }
];
