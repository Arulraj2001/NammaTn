/**
 * NammaTN234 Department Routing Module
 * Maps issue categories to responsible government authorities in Tamil Nadu.
 * This is civic guidance only — NammaTN234 is not a government portal.
 */

export const DEPARTMENT_ROUTES = {
  streetlight: {
    category: "Streetlight",
    department: "Tamil Nadu Generation and Distribution Corporation (TANGEDCO)",
    office_type: "Electricity Board",
    reason: "Streetlights are maintained by TANGEDCO or local Urban Local Body (ULB) depending on the area.",
    official_website: "https://www.tangedco.gov.in",
    complaint_portal: "https://www.tangedco.gov.in/engindex.php",
    phone: "1912",
    follow_up_days: 7,
    escalation_days: 21,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am writing to report a non-functioning streetlight at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Streetlight not working"}\n\nThis issue has been publicly documented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly inspect and restore the streetlight at the earliest. Photo proof is available on NammaTN234.\n\nThank you.`,
    instructions: "File a complaint at the TANGEDCO consumer portal or call 1912. Alternatively, contact your local municipal ward councillor.",
    escalation_instructions: "If unresolved after 3 weeks, escalate to the District Collector's office or file at CM Cell Helpline 14400.",
  },
  road_pothole: {
    category: "Road / Pothole",
    department: "Highways Department / Municipal Corporation / Local Body",
    office_type: "PWD / Municipality",
    reason: "Roads fall under Highways Department (NH/SH), Municipal Corporation (city roads), or Panchayat (village roads).",
    official_website: "https://www.highways.tn.gov.in",
    complaint_portal: "https://www.tnega.tn.gov.in",
    phone: "1800-425-1515",
    follow_up_days: 14,
    escalation_days: 45,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI wish to report a road/pothole issue at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Road damage causing inconvenience"}\n\nThis issue is documented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}. Photo evidence is attached on NammaTN234.\n\nKindly depute an inspection team and arrange repair at the earliest.\n\nThank you.`,
    instructions: "For city roads, contact your Municipal Corporation zonal office or ward councillor. For state highways, contact the PWD / Highways Division office.",
    escalation_instructions: "Escalate to District Collector (DC) office or file at CM Helpline 14400 if no action within 45 days.",
  },
  garbage: {
    category: "Garbage / Waste",
    department: "Municipal Corporation / Town Panchayat / GCC",
    office_type: "Urban Local Body (ULB)",
    reason: "Solid waste collection and management is the responsibility of the local Urban Local Body.",
    official_website: "https://www.chennaicorporation.gov.in",
    complaint_portal: "https://www.tnega.tn.gov.in",
    phone: "1913",
    follow_up_days: 3,
    escalation_days: 10,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting an uncollected garbage / waste issue at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Garbage not being collected regularly"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly take immediate action to clear the garbage and ensure regular collection in this area.\n\nThank you.`,
    instructions: "Contact your ward sanitary inspector or zonal office. You can also call the ULB helpline 1913.",
    escalation_instructions: "If no action in 10 days, escalate to the Municipal Commissioner's office or file at CM Helpline 14400.",
  },
  drainage: {
    category: "Drainage / Sewage",
    department: "Tamil Nadu Water Supply and Drainage Board (TWAD) / Municipality",
    office_type: "TWAD / ULB",
    reason: "Sewage and drainage is maintained by TWAD or the local Municipal body depending on the area.",
    official_website: "https://twadboard.gov.in",
    complaint_portal: "https://twadboard.gov.in/twad/consumer_grievances.aspx",
    phone: "044-28592828",
    follow_up_days: 7,
    escalation_days: 21,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting a drainage/sewage issue at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Blocked or overflowing drain"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly send an inspection team and resolve the issue at the earliest.\n\nThank you.`,
    instructions: "Contact TWAD Board local office or the municipal zonal office. Drainage complaints can also be filed at the ULB office.",
    escalation_instructions: "If unresolved, escalate to District Collector's grievance cell or CM Helpline 14400.",
  },
  water_supply: {
    category: "Water Supply",
    department: "Tamil Nadu Water Supply and Drainage Board (TWAD) / Chennai Metropolitan Water Supply",
    office_type: "TWAD / CMWSSB",
    reason: "Piped water supply is managed by TWAD in rural/semi-urban areas and CMWSSB in Chennai.",
    official_website: "https://twadboard.gov.in",
    complaint_portal: "https://twadboard.gov.in/twad/consumer_grievances.aspx",
    phone: "1916",
    follow_up_days: 3,
    escalation_days: 14,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting a water supply issue at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Water supply disruption"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly restore regular water supply to this area at the earliest.\n\nThank you.`,
    instructions: "Call 1916 (Water helpline) or visit your local TWAD/CMWSSB office. If you have a consumer number, mention it.",
    escalation_instructions: "Escalate to TWAD Regional Director or District Collector after 14 days of no resolution.",
  },
  electricity: {
    category: "Electricity",
    department: "Tamil Nadu Generation and Distribution Corporation (TANGEDCO)",
    office_type: "Electricity Board",
    reason: "All electricity supply and infrastructure complaints are handled by TANGEDCO.",
    official_website: "https://www.tangedco.gov.in",
    complaint_portal: "https://www.tangedco.gov.in/engindex.php",
    phone: "1912",
    follow_up_days: 3,
    escalation_days: 14,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting an electricity issue at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Power supply disruption"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly send a lineman team to inspect and restore power.\n\nThank you.`,
    instructions: "Call TANGEDCO helpline 1912. You can also register a complaint at the TANGEDCO Consumer Portal with your service connection number.",
    escalation_instructions: "If unresolved after 14 days, contact the TANGEDCO Superintending Engineer's office or CM Helpline 14400.",
  },
  public_toilet: {
    category: "Public Toilet",
    department: "Municipal Corporation / Town Panchayat",
    office_type: "Urban Local Body (ULB)",
    reason: "Public toilet maintenance is the responsibility of the local municipal body.",
    official_website: "https://www.tn.gov.in",
    complaint_portal: "https://www.tnega.tn.gov.in",
    phone: "1913",
    follow_up_days: 3,
    escalation_days: 10,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting a public toilet/sanitation issue at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Poor sanitation condition"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly take immediate action to clean and maintain this public facility.\n\nThank you.`,
    instructions: "Contact the municipal ward office or sanitary inspector directly. You can also file at the ULB helpline.",
    escalation_instructions: "Escalate to Municipal Commissioner or CM Helpline 14400 if no action in 10 days.",
  },
  street_dog: {
    category: "Street Dog / Stray Cattle",
    department: "Animal Husbandry Department / Municipal Corporation",
    office_type: "ULB / Animal Husbandry",
    reason: "Stray animal management is handled by the municipal corporation's veterinary wing or Animal Husbandry Department.",
    official_website: "https://www.tnanimalhusbandry.tn.gov.in",
    complaint_portal: "https://www.tnega.tn.gov.in",
    phone: "1962",
    follow_up_days: 5,
    escalation_days: 14,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting a stray animal menace at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Aggressive stray animals causing danger to public"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly send the animal welfare team to conduct ABC programme or rescue the animals at the earliest.\n\nThank you.`,
    instructions: "Call the municipal animal welfare helpline or contact the local veterinary officer. For emergencies, call 1962.",
    escalation_instructions: "Escalate to the ULB Commissioner or District Animal Husbandry Officer if not addressed in 14 days.",
  },
  scam_warning: {
    category: "Scam Warning / Fraud",
    department: "Tamil Nadu Police / Cyber Crime Cell",
    office_type: "Police",
    reason: "Financial fraud, scams, and cybercrime are handled by TN Police Cyber Crime Cell.",
    official_website: "https://www.tnpolice.gov.in",
    complaint_portal: "https://cybercrime.gov.in",
    phone: "1930",
    follow_up_days: 7,
    escalation_days: 21,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting a scam/fraud incident affecting citizens at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Scam activity reported"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly investigate this matter and warn the public.\n\nThank you.`,
    instructions: "File a cyber complaint at cybercrime.gov.in or call 1930. For physical scams, visit the nearest police station.",
    escalation_instructions: "Escalate to the SP Cyber Crime or file an RTI if no FIR is registered within 21 days.",
  },
  public_safety: {
    category: "Public Safety",
    department: "Tamil Nadu Police",
    office_type: "Police",
    reason: "Public safety, law enforcement, and crime prevention are handled by the Tamil Nadu Police.",
    official_website: "https://www.tnpolice.gov.in",
    complaint_portal: "https://www.tnpolice.gov.in/contact-us",
    phone: "100",
    follow_up_days: 1,
    escalation_days: 7,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting a public safety concern at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Public safety issue"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly take appropriate action to ensure public safety in this area.\n\nThank you.`,
    instructions: "For emergencies, call 100. For non-emergency public safety issues, file a complaint at the nearest police station or online at tnpolice.gov.in.",
    escalation_instructions: "Escalate to the DSP or SP of the area if no response within 7 days.",
  },
  govt_office_service: {
    category: "Government Office Service Issue",
    department: "Respective Department / District Collectorate",
    office_type: "Government Office",
    reason: "Service delivery complaints against government offices are handled by the respective department head or District Collector.",
    official_website: "https://www.tn.gov.in",
    complaint_portal: "https://cms.tn.gov.in",
    phone: "14400",
    follow_up_days: 7,
    escalation_days: 21,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am registering a complaint about poor service delivery at a government office in ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Service not delivered as expected"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly take corrective action and ensure timely service delivery.\n\nThank you.`,
    instructions: "File a complaint at the Chief Minister's Grievance Cell (cms.tn.gov.in) or call CM Helpline 14400. You can also visit the District Collectorate.",
    escalation_instructions: "File an RTI application if grievance is not addressed within 30 days.",
  },
  rain_flood: {
    category: "Rain / Flood Issue",
    department: "Revenue Department / NDRF / Municipal Corporation",
    office_type: "Revenue / Disaster Management",
    reason: "Flood relief and disaster management fall under the Revenue Department and District Collector.",
    official_website: "https://www.tn.gov.in/disaster_management",
    complaint_portal: "https://www.tnega.tn.gov.in",
    phone: "1077",
    follow_up_days: 1,
    escalation_days: 7,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting a rain/flood emergency at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Flood/waterlogging affecting public"}\n\nDocumented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}.\n\nKindly deploy relief teams and take action to clear waterlogging.\n\nThank you.`,
    instructions: "Call the State Emergency Operations Centre at 1077. Contact the local Revenue Divisional Officer (RDO) or District Collector for relief.",
    escalation_instructions: "Contact the State Disaster Management Authority (SDMA) or Chief Minister's Office for large-scale flooding.",
  },
  other: {
    category: "Other Civic Issue",
    department: "District Collectorate / CM Helpline",
    office_type: "General Grievance",
    reason: "For issues not covered by specific departments, the District Collector's office and CM Helpline can route your complaint to the right authority.",
    official_website: "https://www.tn.gov.in",
    complaint_portal: "https://cms.tn.gov.in",
    phone: "14400",
    follow_up_days: 14,
    escalation_days: 30,
    complaint_template: (post) =>
      `Dear Sir/Madam,\n\nI am reporting a civic issue at ${post.location_text || post.area_name || post.district_name}, ${post.district_name}.\n\nIssue: ${post.title_en}\nDescription: ${post.content_en || "Civic issue affecting residents"}\n\nThis issue has been publicly documented on NammaTN234 Civic Receipt ${post.civic_receipt_id} on ${new Date(post.created_date).toLocaleDateString("en-IN")}. Photo proof is available.\n\nKindly inspect and resolve this issue at the earliest.\n\nThank you.`,
    instructions: "File a complaint at the Chief Minister's Grievance Cell (cms.tn.gov.in) or call 14400. The system will route your complaint to the right department.",
    escalation_instructions: "If unresolved after 30 days, file an RTI application with the relevant department.",
  },
};

// Category slug to department route mapping
// Covers both short slugs and the full slugs used in CATEGORIES lib
export const CATEGORY_TO_ROUTE = {
  // Short slugs
  streetlight: "streetlight",
  road: "road_pothole",
  pothole: "road_pothole",
  garbage: "garbage",
  waste: "garbage",
  drainage: "drainage",
  sewage: "drainage",
  water: "water_supply",
  "water-supply": "water_supply",
  electricity: "electricity",
  power: "electricity",
  toilet: "public_toilet",
  "public-toilet": "public_toilet",
  "street-dog": "street_dog",
  "stray-animal": "street_dog",
  scam: "scam_warning",
  fraud: "scam_warning",
  safety: "public_safety",
  "public-safety": "public_safety",
  "government-office": "govt_office_service",
  "govt-service": "govt_office_service",
  flood: "rain_flood",
  rain: "rain_flood",
  // Full slugs from CATEGORIES lib
  "road-infrastructure": "road_pothole",
  "water-sanitation": "water_supply",
  "public-safety": "public_safety",
  "government-schemes": "govt_office_service",
  "local-development": "road_pothole",
  transport: "road_pothole",
  agriculture: "other",
  education: "other",
  healthcare: "other",
  environment: "garbage",
  general: "other",
};

export const getDepartmentRoute = (categorySlug) => {
  const key = categorySlug ? CATEGORY_TO_ROUTE[categorySlug.toLowerCase()] || "other" : "other";
  return DEPARTMENT_ROUTES[key] || DEPARTMENT_ROUTES.other;
};

export const getEscalationLevel = (post) => {
  const daysOpen = post.created_date
    ? Math.floor((Date.now() - new Date(post.created_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const route = getDepartmentRoute(post.category_slug);
  const status = post.civic_status || "reported";

  if (status === "citizen_verified_fixed" || status === "community_solved") return { level: 0, label: "Resolved", color: "green" };
  if (status === "unresolved_escalated") return { level: 5, label: "Public Unresolved Issue", color: "red" };
  if (status === "complaint_filed" || status === "under_followup") {
    if (daysOpen > route.escalation_days) return { level: 4, label: "Escalation Recommended", color: "red" };
    if (daysOpen > route.follow_up_days) return { level: 3, label: "Follow-up Needed", color: "orange" };
    return { level: 2, label: "Official Complaint Filed", color: "blue" };
  }
  if (status === "community_verified") return { level: 1, label: "Community Verified", color: "indigo" };
  return { level: 0, label: "Reported", color: "slate" };
};

export const generateFollowUpMessage = (post, route) =>
  `Dear Sir/Madam,\n\nThis is a follow-up regarding my earlier complaint about: "${post.title_en}" at ${post.location_text || post.district_name}.\n\nComplaint ID: ${post.official_complaint_id || "N/A"}\nNammaTN234 Civic Receipt: ${post.civic_receipt_id}\n\nThe issue has not been resolved despite ${Math.floor((Date.now() - new Date(post.created_date).getTime()) / (1000 * 60 * 60 * 24))} days. Kindly provide an update on the status and expected resolution date.\n\nThank you.`;

export const generateEscalationMessage = (post, route) =>
  `Dear Sir/Madam,\n\nI am escalating my unresolved complaint regarding: "${post.title_en}" at ${post.location_text || post.district_name}.\n\nOriginal Complaint ID: ${post.official_complaint_id || "N/A"}\nNammaTN234 Civic Receipt: ${post.civic_receipt_id}\nDays Open: ${Math.floor((Date.now() - new Date(post.created_date).getTime()) / (1000 * 60 * 60 * 24))} days\n\nThis issue has been publicly documented on NammaTN234 with ${post.verification_count || 0} community verifications and ${post.still_not_fixed_count || 0} "still not fixed" reports. Despite filing an official complaint, no resolution has been provided.\n\nI am escalating this to your office and requesting immediate action. If unresolved, I may file an RTI application.\n\nThank you.`;