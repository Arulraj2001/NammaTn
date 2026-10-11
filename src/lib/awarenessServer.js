/**
 * Awareness Content Server Utilities
 * Provides access to all awareness content (guides, FAQs, schemes, portals, emergency contacts)
 * Used for list pages, detail pages, and search
 */

// All guides with slugs
export const getAllGuides = () => [
  {
    id: "power-cut",
    slug: "power-cut",
    title_en: "Power Cut in your area",
    title_ta: "உங்கள் பகுதியில் மின் தடை",
    problem_type_en: "Power Cut",
    problem_type_ta: "மின் தடை",
    department_en: "TANGEDCO (Minnalagam)",
    department_ta: "TANGEDCO (மின்னகம்)",
    helpline_numbers: ["1912", "94987 94987"],
    portal_url: "https://www.tnebltd.org",
    steps_en: [
      "Check if it's just your home — verify main switch / MCB has not tripped.",
      "Check TANGEDCO's outage schedule or status at tnebltd.org to see if there is planned substation shutdown.",
      "Call Minnalagam 24x7 Helpline at 1912 (toll-free) or Metro circle 94987 94987.",
      "WhatsApp complaint to 94987 94987 with your Service Connection (SC) consumer number.",
      "Raise it on VizhiTN so neighbours can upvote and escalate to ward engineers together."
    ],
    steps_ta: [
      "முதலில் உங்கள் வீட்டு மின் சர்க்யூட் பிரேக்கர் (MCB) சரிபார்க்கவும்.",
      "திட்டமிட்ட நிறுத்தம் உள்ளதா என tnebltd.org இல் சரிபார்க்கவும்.",
      "மின்னகம் 24x7 புகார் எண் 1912 அல்லது 94987 94987 அழைக்கவும்.",
      "WhatsApp 94987 94987 உங்கள் SC இணைப்பு எண்ணுடன் புகார் அனுப்பவும்.",
      "VizhiTN இல் பதிவிட்டு அண்டை வீட்டினரையும் இணைத்து துறை அதிகாரிகளுக்கு தெரிவிக்கவும்."
    ],
  },
  {
    id: "water-supply",
    slug: "water-supply",
    title_en: "Water Supply not available",
    title_ta: "குடிநீர் வழங்கல் இல்லை",
    problem_type_en: "Water Supply",
    problem_type_ta: "குடிநீர் வழங்கல்",
    department_en: "Metro Water / TWAD Board",
    department_ta: "சென்னை மெட்ரோவாட்டர் / TWAD வாரியம்",
    helpline_numbers: ["1913", "044-45674567"],
    portal_url: "https://chennaimetrowater.tn.gov.in",
    steps_en: [
      "Check with neighbours to verify if the whole street pipeline is affected.",
      "For Chennai Metro Water: call 1913 or 044-45674567 to report pipeline burst or low pressure.",
      "For TWAD / District Corporation: contact local Ward Councillor or Assistant Engineer (AE).",
      "Book paid or subsidized water tanker via chennaimetrowater.tn.gov.in if main supply is delayed.",
      "Post photos on VizhiTN to document community impact and press for official municipal action."
    ],
    steps_ta: [
      "தெரு முழுவதும் பாதிக்கப்பட்டுள்ளதா என அண்டை வீட்டாருடன் சரிபார்க்கவும்.",
      "சென்னை மெட்ரோ வாட்டர்: 1913 அல்லது 044-45674567 அழைக்கவும்.",
      "மாவட்ட மாநகராட்சி / TWAD: உள்ளூர் வார்டு பொறியாளரைத் தொடர்பு கொள்ளவும்.",
      "தேவையெனில் chennaimetrowater.tn.gov.in மூலம் லாரி தண்ணீர் பதிவு செய்யுங்கள்.",
      "VizhiTN இல் புகைப்படங்களுடன் பதிவிட்டு அதிகாரிகளுக்கு தெரிவிக்கவும்."
    ],
  },
  {
    id: "ration-card",
    slug: "ration-card",
    title_en: "Ration Shop (PDS) & Smart Card Issues",
    title_ta: "ரேஷன் கடை (PDS) பிரச்சினைகள் & ஸ்மார்ட் கார்டு",
    problem_type_en: "Ration Card",
    problem_type_ta: "ரேஷன் அட்டை",
    department_en: "Food & Civil Supplies Department (TNPDS)",
    department_ta: "உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை",
    helpline_numbers: ["1967", "1800-425-5901"],
    portal_url: "https://www.tnpds.gov.in",
    steps_en: [
      "For missing monthly commodities: check your TNPDS mobile app for shop stock status.",
      "To report shop closed during working hours or biometric failure: call toll-free 1967 or 1800-425-5901.",
      "File online grievance at tnpds.gov.in with shop number and Smart Card details.",
      "Contact Taluk Supply Officer (TSO) or District Supply Officer (DSO) at Collectorate.",
      "Report overcharging, underweighting, or illegal diversion of PDS items on VizhiTN."
    ],
    steps_ta: [
      "பொருட்கள் இருப்பு விவரங்களை TNPDS செயலியில் சரிபார்க்கவும்.",
      "கடை மூடப்பட்டிருந்தால் அல்லது கைரேகை சிக்கல் எனில்: 1967 அல்லது 1800 425 5901 அழைக்கவும்.",
      "tnpds.gov.in இல் உங்கள் ஸ்மார்ட் கார்டு விவரங்களுடன் புகார் பதிவு செய்யுங்கள்.",
      "வட்ட வழங்கல் அலுவலர் (TSO) அல்லது மாவட்ட வழங்கல் அலுவலரை தொடர்பு கொள்ளவும்.",
      "கூடுதல் விலை அல்லது முறைகேடுகள் பற்றி VizhiTN இல் பதிவிடவும்."
    ],
  },
  {
    id: "bribery",
    slug: "bribery",
    title_en: "Demand for Bribery at Government Office",
    title_ta: "அரசு அலுவலகத்தில் லஞ்சக் கோரிக்கை",
    problem_type_en: "Anti-Corruption",
    problem_type_ta: "ஊழல் தடுப்பு",
    department_en: "Directorate of Vigilance & Anti-Corruption (DVAC)",
    department_ta: "ஊழல் தடுப்பு மற்றும் கண்காணிப்புப் பிரிவு (DVAC)",
    helpline_numbers: ["1064", "044-24615929", "94981 05884"],
    portal_url: "https://www.dvac.tn.gov.in",
    steps_en: [
      "Never pay bribe — it is illegal to both offer and accept bribes under Prevention of Corruption Act.",
      "Record details: date, officer name/designation, office department, amount demanded.",
      "Contact DVAC Toll-Free Helpline: 1064 or headquarters at 044-24615929.",
      "DVAC WhatsApp Helpline: 94981 05884 — message secretly with proof details.",
      "File anonymous Bribe Report on VizhiTN Public Bribe Tracker to bring transparency."
    ],
    steps_ta: [
      "லஞ்சம் கொடுக்காதீர்கள் — லஞ்சம் வாங்குவதும் கொடுப்பதும் சட்டப்படி குற்றம்.",
      "அதிகாரி பெயர், பதவி, அலுவலகம், கோரப்பட்ட தொகை போன்ற விவரங்களை குறிக்கவும்.",
      "DVAC உதவி எண் 1064 அல்லது 044-24615929 தொடர்பு கொள்ளவும்.",
      "DVAC WhatsApp: 94981 05884 — ஆதாரம் இருந்தால் ரகசியமாக அனுப்பவும்.",
      "VizhiTN Bribe Watch இல் பெயர் குறிப்பிடாமல் ரகசியமாக புகார் அளிக்கவும்."
    ],
  },
  {
    id: "medical-emergency",
    slug: "medical-emergency",
    title_en: "Medical Emergency & Free Govt Healthcare",
    title_ta: "மருத்துவ அவசரநிலை & அரசு மருத்துவமனைகள்",
    problem_type_en: "Medical Emergency",
    problem_type_ta: "மருத்துவ அவசரம்",
    department_en: "Health & Family Welfare Dept",
    department_ta: "சுகாதார மற்றும் குடும்ப நலத்துறை",
    helpline_numbers: ["108", "104", "1800-425-3993"],
    portal_url: "https://www.cmchis.com",
    steps_en: [
      "Call 108 immediately for free Government Ambulance service.",
      "For road accident victims: Innuyir Kappon 48 scheme covers first 48 hours up to ₹1 Lakh in 600+ hospitals — cashless.",
      "For CMCHIS insurance queries or hospital admission approval: call 1800-425-3993.",
      "For hospital refusal or poor treatment at Govt Primary Health Centre (PHC): call 104 health helpline.",
      "Share urgent blood/help requests on VizhiTN for rapid verified local volunteer response."
    ],
    steps_ta: [
      "இலவச அரசு ஆம்புலன்ஸுக்கு உடனடியாக 108 அழைக்கவும்.",
      "சாலை விபத்து: இன்னுயிர் காப்போம் 48 திட்டம் மூலம் முதல் 48 மணிநேர சிகிச்சை ₹1 லட்சம் வரை இலவசம்.",
      "முதல்வரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்: 1800 425 3993 அழைக்கவும்.",
      "மருத்துவமனை மறுப்பு அல்லது சிகிச்சை குறைபாடு எனில் 104 நல்வாழ்வு மையத்தை தொடர்பு கொள்ளவும்.",
      "அவசர ரத்த உதவிக்கு VizhiTN Help பகுதியில் பதிவிடுங்கள்."
    ],
  },
  {
    id: "govt-scheme",
    slug: "govt-scheme",
    title_en: "How to Apply for Tamil Nadu Government Schemes",
    title_ta: "அரசு திட்டங்களுக்கு விண்ணப்பிக்கும் முறை",
    problem_type_en: "Government Schemes",
    problem_type_ta: "அரசுத் திட்டங்கள்",
    department_en: "Dept of e-Governance & Social Welfare",
    department_ta: "இ-ஆட்சி & சமூக நலத்துறை",
    helpline_numbers: ["1100"],
    portal_url: "https://www.tnesevai.tn.gov.in",
    steps_en: [
      "Check eligibility and document criteria on VizhiTN Schemes Directory or myscheme.gov.in.",
      "Most TN welfare schemes are applied at tnesevai.tn.gov.in or nearest e-Sevai / CSC centre.",
      "Keep mandatory proofs ready: Aadhaar, Smart Ration Card, Income Certificate, Bank Passbook, Community Certificate.",
      "For Kalaignar Magalir Urimai Thogai: apply during ward camps or track at kmut.tn.gov.in.",
      "Always save application acknowledgment number for tracking status."
    ],
    steps_ta: [
      "VizhiTN அல்லது myscheme.gov.in தளத்தில் தகுதி விவரங்களை சரிபார்க்கவும்.",
      "பெரும்பாலான TN திட்டங்கள் tnesevai.tn.gov.in அல்லது e-Sevai மையத்தில் விண்ணப்பிக்கலாம்.",
      "ஆதார், குடும்ப அட்டை, வருமான சான்று, வங்கி பாஸ்புக் தயார் வைத்திருங்கள்.",
      "கலைஞர் மகளிர் உரிமை தொகை: kmut.tn.gov.in தளத்தில் சரிபார்க்கவும்.",
      "ஒப்புகை எண் மூலம் விண்ணப்ப நிலையை கண்காணிக்கவும்."
    ],
  },
  {
    id: "property-tax",
    slug: "property-tax",
    title_en: "Property Tax Assessment & Payment",
    title_ta: "சொத்து வரி மதிப்பீடு மற்றும் செலுத்துதல்",
    problem_type_en: "Property Tax",
    problem_type_ta: "சொத்து வரி",
    department_en: "Municipal Administration & Water Supply",
    department_ta: "நகராட்சி நிர்வாகம் & குடிநீர் வழங்கல் துறை",
    helpline_numbers: ["1913"],
    portal_url: "https://www.chennaicorporation.gov.in",
    steps_en: [
      "Check current assessment number and tax dues on your municipal portal or tnurbantree.tn.gov.in.",
      "Pay property tax online via debit card, credit card, net banking, or UPI to avoid 1% monthly penalty.",
      "For reassessment or title transfer name change: submit registered sale deed and patta copy online.",
      "Contact Zonal Revenue Officer at Corporation office for calculation discrepancies."
    ],
    steps_ta: [
      "நகராட்சி தளம் அல்லது tnurbantree.tn.gov.in இல் வரி நிலுவையை சரிபார்க்கவும்.",
      "அபராதத்தை தவிர்க்க ஆன்லைனில் வரி செலுத்தவும்.",
      "பெயர் மாற்றத்திற்கு பதிவு செய்யப்பட்ட ஆவணம் மற்றும் பட்டா சமர்ப்பிக்கவும்.",
      "வரி கணக்கீடு முரண்பாடுகளுக்கு மண்டல வருவாய் அலுவலரை அணுகவும்."
    ],
  },
];

// Get guide by slug or id
export const getGuideBySlug = (slug) => {
  return getAllGuides().find(g => g.slug === slug || g.id === slug);
};

// All FAQs with slugs
export const getAllFaqs = () => [
  {
    id: "f1",
    slug: "how-to-file-complaint-vizhitn",
    question_en: "How do I file a complaint on VizhiTN?",
    question_ta: "VizhiTN-ல் எப்படி புகார் பதிவு செய்வது?",
    answer_en: "Click 'Create Post' in the top menu. Select your district, ward, and issue category. Describe the problem with photos or videos. Your post is public and also notified to relevant officials via our automated alert system. You can track all responses on your Dashboard.",
    answer_ta: "மேல் மெனுவில் 'Create Post' கிளிக் செய்யுங்கள். மாவட்டம், வார்டு மற்றும் பிரச்சினை வகையை தேர்வு செய்யுங்கள். புகைப்படங்களுடன் பிரச்சினையை விவரிக்கவும். உங்கள் Dashboard இல் பதில்களை கண்காணிக்கலாம்.",
    category_en: "Complaints",
    category_ta: "புகார்கள்",
  },
  {
    id: "f2",
    slug: "check-government-complaint-status",
    question_en: "How do I check my government complaint status?",
    question_ta: "என் அரசு புகாரின் நிலையை எப்படி சரிபார்ப்பது?",
    answer_en: "For Tamil Nadu CM Grievance Cell complaints (1100), track at cms.tn.gov.in using your reference number. For central government complaints, use pgportal.gov.in. For police complaints, use the TN Police e-Services portal. VizhiTN posts are tracked in your Dashboard.",
    answer_ta: "TN முதலமைச்சர் புகார் (1100) நிலை: cms.tn.gov.in ல் Reference Number கொண்டு சரிபார்க்கவும். மத்திய அரசு: pgportal.gov.in. காவல்துறை: TN Police e-Services.",
    category_en: "Complaints",
    category_ta: "புகார்கள்",
  },
  {
    id: "f3",
    slug: "which-portal-for-my-civic-issue",
    question_en: "Which portal should I use for my issue?",
    question_ta: "என் பிரச்சினைக்கு எந்த இணையதளத்தை பயன்படுத்த வேண்டும்?",
    answer_en: "Use tnesevai.tn.gov.in for certificates and most services. tnebltd.org for electricity issues. tnpds.gov.in for ration card. eservices.tnpolice.gov.in for FIR and police. rtionline.gov.in for RTI applications. cms.tn.gov.in for general government grievances.",
    answer_ta: "சான்றிதழ் & பொது சேவைகளுக்கு tnesevai.tn.gov.in. மின்சாரத்திற்கு tnebltd.org. குடும்ப அட்டைக்கு tnpds.gov.in. காவல் சேவைகளுக்கு eservices.tnpolice.gov.in.",
    category_en: "Portals",
    category_ta: "இணையதளங்கள்",
  },
  {
    id: "f4",
    slug: "how-to-report-bribery-safely",
    question_en: "How do I report bribery safely?",
    question_ta: "லஞ்சத்தை எவ்வாறு பாதுகாப்பாக புகாரளிப்பது?",
    answer_en: "Call the DVAC Anti-Corruption Helpline at 1064 (24×7, anonymous). File online at vigilance.tn.gov.in — your identity is protected. You can also record the conversation on your phone (legally permitted in Tamil Nadu for self-protection). Additionally, file an RTI at rtionline.gov.in asking why your service was delayed.",
    answer_ta: "DVAC ஊழல் தடுப்பு உதவி 1064 (24×7, அடையாளம் வெளிப்படுத்தல் தேவையில்லை). vigilance.tn.gov.in ல் ஆன்லைனில் புகார். TN சட்டம் பதிவு செய்ய அனுமதிக்கிறது.",
    category_en: "Anti-Corruption",
    category_ta: "ஊழல் தடுப்பு",
  },
  {
    id: "f5",
    slug: "documents-needed-for-govt-schemes",
    question_en: "What documents are needed to apply for government schemes?",
    question_ta: "திட்டங்களுக்கு என்ன ஆவணங்கள் தேவை?",
    answer_en: "Most schemes need: Aadhaar card (mandatory for all), ration card, bank passbook showing account number and IFSC, income certificate (from VAO or Taluk office), community/caste certificate, and 2 passport-size photos. Always check myscheme.gov.in for scheme-specific requirements.",
    answer_ta: "ஆதார் அட்டை (அனைத்திற்கும் கட்டாயம்), குடும்ப அட்டை, வங்கி பாஸ்புக், வருமான சான்றிதழ் (VAO மூலம்), சமூக சான்றிதழ், 2 புகைப்படங்கள். திட்டத்திற்கு ஏற்ப மாறும் — myscheme.gov.in ல் சரிபார்க்கவும்.",
    category_en: "Schemes",
    category_ta: "திட்டங்கள்",
  },
  {
    id: "f6",
    slug: "which-schemes-am-i-eligible-for",
    question_en: "How do I know which government schemes I am eligible for?",
    question_ta: "எந்த அரசு திட்டத்திற்கு தகுதியானவர் என்று எப்படி தெரிந்துகொள்வது?",
    answer_en: "Visit myscheme.gov.in and answer questions about your age, income, gender, occupation, and state. The portal will list all central and state government schemes you qualify for. You can also visit your nearest e-Sevai centre (tnesevai.tn.gov.in) for in-person guidance.",
    answer_ta: "myscheme.gov.in செல்லுங்கள் — வயது, வருமானம், பாலினம், தொழில், மாநிலம் கொடுங்கள். தகுதியான திட்டங்கள் தானாகவே பட்டியலிடப்படும். அருகிலுள்ள e-Sevai மையத்திலும் உதவி கிடைக்கும்.",
    category_en: "Schemes",
    category_ta: "திட்டங்கள்",
  },
  {
    id: "f7",
    slug: "apply-new-ration-card-or-add-member",
    question_en: "How do I apply for a new ration card or add a family member?",
    question_ta: "புதிய குடும்ப அட்டை பெறுவது அல்லது உறுப்பினர் சேர்ப்பது எப்படி?",
    answer_en: "For new ration card: visit tnpds.gov.in and apply online, or visit your nearest e-Sevai centre. Bring Aadhaar cards of all family members, proof of residence, and bank account details. For adding a member: go to tnpds.gov.in > Update Family Members. You can also call helpline 1967.",
    answer_ta: "புதிய குடும்ப அட்டை: tnpds.gov.in ல் ஆன்லைனில் விண்ணப்பிக்கவும் அல்லது e-Sevai மையம் செல்லுங்கள். குடும்பத்தினர் சேர்க்க: tnpds.gov.in > Update Family Members. உதவி: 1967.",
    category_en: "Ration Card",
    category_ta: "குடும்ப அட்டை",
  },
  {
    id: "f8",
    slug: "free-treatment-under-cmchis",
    question_en: "How do I get free health treatment under CMCHIS?",
    question_ta: "CMCHIS கீழ் இலவச சுகாதார சிகிச்சை எப்படி பெறுவது?",
    answer_en: "Simply go to any CMCHIS-empanelled hospital with your Tamil Nadu ration card. No prior registration or application is needed. Show your ration card at the hospital's CMCHIS desk. Coverage is up to ₹5 lakh per family per year. Find empanelled hospitals at cmchis.com.",
    answer_ta: "தமிழ்நாடு குடும்ப அட்டையுடன் CMCHIS அங்கீகரிக்கப்பட்ட மருத்துவமனைக்கு செல்லுங்கள். முன் பதிவு தேவையில்லை. CMCHIS மேஜையில் குடும்ப அட்டை காட்டுங்கள். ₹5 லட்சம் வரை கட்டணமில்லாமல் சிகிச்சை.",
    category_en: "Healthcare",
    category_ta: "சுகாதாரம்",
  },
  {
    id: "f9",
    slug: "how-to-file-rti-application",
    question_en: "How do I file an RTI application?",
    question_ta: "RTI விண்ணப்பம் எப்படி அளிப்பது?",
    answer_en: "For central government departments: apply at rtionline.gov.in with a ₹10 fee (online payment). For Tamil Nadu state departments: submit a written application to the Public Information Officer (PIO) of the department with ₹10 postal order or fee. Response must come within 30 days.",
    answer_ta: "மத்திய அரசு: rtionline.gov.in ல் ₹10 கட்டணத்துடன் ஆன்லைனில். TN மாநில அரசு: துறையின் தகவல் அதிகாரியிடம் ₹10 கட்டணத்துடன் எழுத்துப்பூர்வமாக. 30 நாட்களில் பதில் வர வேண்டும்.",
    category_en: "RTI Rights",
    category_ta: "தகவல் உரிமை",
  },
  {
    id: "f10",
    slug: "property-registration-tamil-nadu",
    question_en: "How do I register a property in Tamil Nadu?",
    question_ta: "தமிழ்நாட்டில் சொத்து பதிவு செய்வது எப்படி?",
    answer_en: "Visit tnreginet.gov.in to book a slot at your Sub-Registrar Office. Prepare the sale deed with details of both buyer and seller, two witnesses, and all required documents (Encumbrance Certificate, patta, chitta, etc.). Stamp duty and registration fee vary based on property value.",
    answer_ta: "tnreginet.gov.in ல் Sub-Registrar அலுவலகத்தில் இடம் பதிவு செய்யுங்கள். விற்பவர் & வாங்குபவர் விவரங்கள், இரண்டு சாட்சிகள், Encumbrance Certificate, பட்டா, சிட்டா உட்பட அனைத்து ஆவணங்கள் தேவை.",
    category_en: "Property",
    category_ta: "சொத்து",
  },
  {
    id: "f11",
    slug: "police-refuse-fir-rights",
    question_en: "How do I file an FIR if police refuse to register it?",
    question_ta: "காவல்துறை FIR பதிவு செய்ய மறுத்தால் என்ன செய்வது?",
    answer_en: "You have the statutory right to have your FIR registered for cognizable offences. If refused: (1) File online at eservices.tnpolice.gov.in. (2) Visit or send complaint by registered post to Superintendent of Police (SP). (3) Approach Judicial Magistrate under CrPC Section 156(3).",
    answer_ta: "FIR பதிவு செய்வது உங்கள் சட்டபூர்வ உரிமை. மறுத்தால்: (1) eservices.tnpolice.gov.in ல் ஆன்லைனில். (2) கண்காணிப்பாளர் (SP) அலுவலகம் செல்லுங்கள். (3) மாஜிஸ்திரேட்டிடம் புகார் செய்யுங்கள்.",
    category_en: "Police & Legal",
    category_ta: "காவல் & சட்டம்",
  },
  {
    id: "f12",
    slug: "apply-new-electricity-connection",
    question_en: "How do I apply for a new electricity connection?",
    question_ta: "புதிய மின்சார இணைப்பு எப்படி பெறுவது?",
    answer_en: "Apply online at tnebltd.org > Apply for New Connection. Required documents: proof of ownership/occupation, Aadhaar card, recent photo. Domestic connection processing time is typically 7–15 working days.",
    answer_ta: "tnebltd.org > Apply for New Connection ல் ஆன்லைனில் விண்ணப்பிக்கவும். ஆவணங்கள்: உரிமை சான்று, ஆதார் அட்டை, சமீபத்திய புகைப்படம். 7–15 நாட்களில் இணைப்பு கிடைக்கும்.",
    category_en: "Electricity",
    category_ta: "மின்சாரம்",
  },
];

// Get FAQ by slug or id
export const getFaqBySlug = (slug) => {
  return getAllFaqs().find(f => f.slug === slug || f.id === slug);
};

// All schemes with slugs — Comprehensive 2026 Tamil Nadu Welfare Database
export const getAllSchemes = () => [
  {
    id: "magalir-urimai",
    slug: "kalaignar-magalir-urimai-thogai",
    name_en: "Kalaignar Magalir Urimai Thogai (KMUT)",
    name_ta: "கலைஞர் மகளிர் உரிமைத் தொகை திட்டம்",
    category_en: "Women Welfare",
    category_ta: "பெண்கள் நலன்",
    department_en: "Social Welfare & Women Empowerment Dept",
    department_ta: "சமூக நலன் & மகளிர் உரிமைத் துறை",
    financial_benefit_en: "₹1,000 per month transferred directly to bank account on the 15th of every month.",
    financial_benefit_ta: "ஒவ்வொரு மாதமும் 15-ம் தேதி வங்கி கணக்கில் நேரடியாக ₹1,000 உரிமைத் தொகை வரவு வைக்கப்படும்.",
    benefits_en: "₹1,000 per month Direct Benefit Transfer (DBT) empowering women heads of families with financial independence.",
    benefits_ta: "குடும்பத் தலைவிகளுக்கு மாதம் ₹1,000 நேரடி வங்கி பணப் பரிமாற்றம் மூலம் நிதி சுயாட்சி மற்றும் பாதுகாப்பு.",
    eligibility_en: "• Female head of the family (age 21 years or older)\n• Annual family income must be below ₹2.5 Lakh\n• Family must hold less than 5 acres of wetland or 10 acres of dryland\n• Annual domestic electricity consumption below 3,600 units\n• Family must not own a 4-wheeler (car/jeep/tractor)\n• Not a central/state government employee or income tax payer.",
    eligibility_ta: "• குடும்பத் தலைவியாக உள்ள 21 வயது பூர்த்தியடைந்த பெண்கள்\n• குடும்ப ஆண்டு வருமானம் ₹2.5 லட்சத்திற்குள் இருக்க வேண்டும்\n• 5 ஏக்கருக்குள் நஞ்சை அல்லது 10 ஏக்கருக்குள் புஞ்சை நிலம் இருக்க வேண்டும்\n• ஆண்டு மின் நுகர்வு 3,600 யூனிட்டுகளுக்குள் இருக்க வேண்டும்\n• நான்கு சக்கர வாகனம் (கார், ஜீப், டிராக்டர்) வைத்திருக்கக் கூடாது\n• அரசு ஊழியர் அல்லது வருமான வரி செலுத்துபவராக இருக்கக் கூடாது.",
    documents_required_en: [
      "Aadhaar Card of Applicant",
      "Smart Family Ration Card",
      "Bank Account Passbook (Aadhaar linked)",
      "Electricity Bill (EB Consumer Number)",
      "Self-Declaration Form (supplied at camp/portal)"
    ],
    documents_required_ta: [
      "விண்ணப்பதாரரின் ஆதார் அட்டை",
      "ஸ்மார்ட் குடும்ப அட்டை (ரேஷன் கார்டு)",
      "ஆதார் இணைக்கப்பட்ட வங்கி கணக்கு பாஸ்புக்",
      "மின் கட்டண ரசீது (EB இணைப்பு எண்)",
      "சுய அறிவிப்புப் படிவம் (முகாமில்/தளத்தில் கிடைக்கும்)"
    ],
    how_to_apply_en: "1. Obtain application form and token from nearest Ration Shop or designated Special Camp.\n2. Fill in Aadhaar, Smart Card, and Bank account details.\n3. Attend biometric e-KYC verification at the camp.\n4. Status can be tracked online at kmut.tn.gov.in using Aadhaar number.",
    how_to_apply_ta: "1. நியாயவிலைக் கடை அல்லது சிறப்பு முகாம்களில் விண்ணப்பப் படிவம் மற்றும் டோக்கன் பெறவும்.\n2. ஆதார், ரேஷன் அட்டை, வங்கி கணக்கு விவரங்களைப் பூர்த்தி செய்யவும்.\n3. முகாமில் பயோமெட்ரிக் e-KYC கைரேகை பதிவு செய்யவும்.\n4. விண்ணப்ப நிலையை kmut.tn.gov.in தளத்தில் ஆதார் எண் மூலம் அறியலாம்.",
    where_to_apply_en: "Special Revenue Ward Camps, Taluk Offices, and e-Sevai Centres across Tamil Nadu.",
    where_to_apply_ta: "தமிழ்நாடு முழுவதும் உள்ள வருவாய்த் துறை சிறப்பு முகாம்கள், தாலுகா அலுவலகங்கள் மற்றும் இ-சேவை மையங்கள்.",
    helpline: "044-25619200 / 1100 (CM Helpline)",
    apply_url: "https://www.kmut.tn.gov.in",
    website_url: "https://www.kmut.tn.gov.in",
    image_url: "/images/evergreen/magalir-urimai.jpg",
    is_featured: true,
    faqs: [
      {
        q_en: "Can unmarried or widowed women apply for Magalir Urimai Thogai?",
        q_ta: "திருமணமாகாத அல்லது விதவை பெண்கள் மகளிர் உரிமைத் தொகைக்கு விண்ணப்பிக்கலாமா?",
        a_en: "Yes. Unmarried women aged 21+ living alone or female heads of single-member households, widows, and transgender women are fully eligible if income criteria are met.",
        a_ta: "ஆம். குடும்பத் தலைவியாக இருக்கும் விதவைகள், தனியாக வசிக்கும் 21 வயதுக்கு மேற்பட்ட பெண்கள் மற்றும் திருநங்கைகள் தகுதி நிபந்தனைகளுக்கு உட்பட்டு விண்ணப்பிக்கலாம்."
      },
      {
        q_en: "What should I do if my application was rejected?",
        q_ta: "விண்ணப்பம் நிராகரிக்கப்பட்டால் என்ன செய்ய வேண்டும்?",
        a_en: "Applicants can file an appeal within 30 days via the e-Sevai portal or visit their local Revenue Divisional Officer (RDO) with requisite land, income, and electricity proof.",
        a_ta: "விண்ணப்பம் நிராகரிக்கப்பட்ட 30 நாட்களுக்குள் இ-சேவை மையம் மூலம் அல்லது கோட்டாட்சியர் (RDO) அலுவலகத்தில் மேல்முறையீடு செய்யலாம்."
      }
    ]
  },
  {
    id: "pudhumai-penn",
    slug: "pudhumai-penn-scheme-girl-students",
    name_en: "Pudhumai Penn Scheme (Moovalur Ramamirtham Ammaiyar Higher Education)",
    name_ta: "புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார்)",
    category_en: "Education",
    category_ta: "கல்வி",
    department_en: "Higher Education & Social Welfare Dept",
    department_ta: "உயர்கல்வி மற்றும் சமூக நலத் துறை",
    financial_benefit_en: "₹1,000 per month deposited directly into student's bank account till course completion.",
    financial_benefit_ta: "பட்டப்படிப்பு அல்லது பட்டயப்படிப்பு முடியும் வரை மாணவிகளின் வங்கிக் கணக்கில் மாதம் ₹1,000 வரவு.",
    benefits_en: "Financial assistance of ₹1,000/month for female students pursuing Under Graduate, Diploma, ITI, or professional degrees, preventing college dropouts.",
    benefits_ta: "அரசுப் பள்ளி மாணவிகள் உயர்கல்வி பெறுவதை ஊக்குவிக்க மாதம் ₹1,000 உதவித்தொகை வழங்கி இடைநிற்றலைத் தடுத்தல்.",
    eligibility_en: "• Must be a female student currently enrolled in regular college / polytechnic / ITI\n• Must have studied Classes 6 to 12 in Tamil Nadu Government schools (or Government-aided Tamil medium)\n• Private school / distance education students are not eligible.",
    eligibility_ta: "• கல்லூரியில் பட்டப்படிப்பு, பட்டயப்படிப்பு (Diploma) அல்லது ITI பயிலும் மாணவி\n• 6 முதல் 12-ம் வகுப்பு வரை தமிழ்நாடு அரசுப் பள்ளிகளில் (அல்லது அரசு உதவிபெறும் தமிழ் வழிப் பள்ளிகளில்) படித்திருக்க வேண்டும்\n• தொலைதூரக் கல்வி பயில்பவர்களுக்கு இத்திட்டம் பொருந்தாது.",
    documents_required_en: [
      "Student Aadhaar Card",
      "Classes 6–12 Government School Transfer Certificate (TC) or Study Certificate",
      "College Identity Card & Admission Receipt",
      "Bank Account Passbook in Student's Name (Aadhaar Seeded)",
      "Passport Size Photograph"
    ],
    documents_required_ta: [
      "மாணவியின் ஆதார் அட்டை",
      "6 முதல் 12-ம் வகுப்பு அரசுப் பள்ளி மாற்றுச் சான்றிதழ் (TC) அல்லது பயின்றதற்கான சான்றிதழ்",
      "கல்லூரி அடையாள அட்டை மற்றும் சேர்க்கை ரசீது",
      "மாணவி பெயரில் உள்ள ஆதார் இணைக்கப்பட்ட வங்கி பாஸ்புக்",
      "பாஸ்போர்ட் அளவு புகைப்படம்"
    ],
    how_to_apply_en: "1. Visit your college/polytechnic administration office (Nodal Officer).\n2. Submit school study certificates and Aadhaar-seeded bank account details.\n3. The college uploads details onto the official Pudhumai Penn portal.\n4. Verification is done by Social Welfare Dept and funds released monthly via DBT.",
    how_to_apply_ta: "1. உங்கள் கல்லூரி அல்லது பாலிடெக்னிக் ஒருங்கிணைப்பாளரை (Nodal Officer) அணுகவும்.\n2. அரசுப் பள்ளி பயின்ற சான்றிதழ் மற்றும் வங்கி விவரங்களைச் சமர்ப்பிக்கவும்.\n3. கல்லூரி நிர்வாகம் புதுமைப் பெண் இணையதளத்தில் தகவல்களைப் பதிவேற்றும்.\n4. சரிபார்ப்புக்குப் பின் மாதம் தோறும் DBT வழியாக பணம் வங்கிக்கு வரும்.",
    where_to_apply_en: "College / Polytechnic / Institute Administrative Office & pudhumapenn.tn.gov.in.",
    where_to_apply_ta: "பயிலும் கல்லூரி அலுவலகம் மற்றும் pudhumapenn.tn.gov.in இணையதளம்.",
    helpline: "044-25619200 / 14417 (School/Edu Helpline)",
    apply_url: "https://www.pudhumapenn.tn.gov.in",
    website_url: "https://www.pudhumapenn.tn.gov.in",
    image_url: "/images/evergreen/pudhumai-penn.jpg",
    is_featured: true,
    faqs: [
      {
        q_en: "Can students getting other scholarships apply for Pudhumai Penn?",
        q_ta: "மற்ற கல்வி உதவித்தொகை பெறும் மாணவிகள் புதுமைப் பெண் திட்டத்தில் பயன்பெறலாமா?",
        a_en: "Yes. Pudhumai Penn is an incentive allowance and does not restrict students from receiving merit, BC/MBC, or SC/ST government scholarships.",
        a_ta: "ஆம். இத்திட்டம் மற்ற அரசு கல்வி உதவித்தொகைகளுடன் கூடுதலாகவே வழங்கப்படுகிறது. பிற உதவித்தொகை பெறுபவர்களும் தகுதியுடையவர்களே."
      }
    ]
  },
  {
    id: "tamil-pudhalvan",
    slug: "tamil-pudhalvan-scheme-boy-students",
    name_en: "Tamil Pudhalvan Scheme (Financial Support for Male Students)",
    name_ta: "தமிழ்ப் புதல்வன் திட்டம் (மாணவர்களுக்கான உயர்கல்வி உதவி)",
    category_en: "Education",
    category_ta: "கல்வி",
    department_en: "Higher Education Dept",
    department_ta: "உயர்கல்வித் துறை",
    financial_benefit_en: "₹1,000 per month deposited directly into male student's bank account.",
    financial_benefit_ta: "கல்லூரி படிப்பு முடியும் வரை மாணவர்களின் வங்கிக் கணக்கில் மாதம் ₹1,000 வரவு.",
    benefits_en: "Monthly allowance of ₹1,000 for government school boy students pursuing higher education, covering textbooks, study materials, and bus fare.",
    benefits_ta: "அரசுப் பள்ளி மாணவர்கள் உயர்கல்வியில் சேர்வதை அதிகரிக்கவும், புத்தகங்கள் மற்றும் கல்விச் செலவுகளுக்காகவும் மாதம் ₹1,000 உதவி.",
    eligibility_en: "• Male students enrolled in regular Undergraduate, Diploma, or ITI programs\n• Studied Classes 6 to 12 in Tamil Nadu Government schools (or Government-aided Tamil medium)\n• Aadhaar-seeded bank account in student's name.",
    eligibility_ta: "• அரசு கல்லூரிகள், பாலிடெக்னிக் அல்லது ITI-யில் பயிலும் மாணவர்கள்\n• 6 முதல் 12-ம் வகுப்பு வரை தமிழ்நாடு அரசுப் பள்ளிகளில் படித்திருக்க வேண்டும்\n• மாணவர் பெயரில் ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கு இருக்க வேண்டும்.",
    documents_required_en: [
      "Student Aadhaar Card",
      "Classes 6–12 Government School Study Certificate",
      "College Admission Proof & Fee Receipt",
      "Bank Account Passbook (Aadhaar linked)",
      "Passport Size Photo"
    ],
    documents_required_ta: [
      "மாணவரின் ஆதார் அட்டை",
      "6-12 வகுப்பு வரை அரசுப் பள்ளியில் படித்ததற்கான சான்றிதழ்",
      "கல்லூரி சேர்க்கை சான்று & ரசீது",
      "ஆதார் இணைக்கப்பட்ட வங்கி பாஸ்புக் நகல்",
      "புகைப்படம்"
    ],
    how_to_apply_en: "1. Apply directly through the University Management Information System (UMIS) college desk.\n2. Submit verified EMIS ID from school records.\n3. Verification by Directorate of Collegiate Education.",
    how_to_apply_ta: "1. பயிலும் கல்லூரி அலுவலகத்தில் UMIS இணைய முகப்பு வழியாக விண்ணப்பிக்கவும்.\n2. பள்ளி EMIS எண் மற்றும் சான்றிதழ்களைச் சமர்ப்பிக்கவும்.\n3. கல்லூரி சரிபார்ப்புக்குப் பின் மாதந்தோறும் வங்கிக் கணக்கிற்கு நிதி அனுப்பப்படும்.",
    where_to_apply_en: "Respective College / Institution UMIS Desk.",
    where_to_apply_ta: "கல்லூரி அல்லது கல்வி நிறுவன UMIS முகப்பு.",
    helpline: "1100 / 044-24343105",
    apply_url: "https://umis.tn.gov.in",
    website_url: "https://umis.tn.gov.in",
    image_url: "/images/evergreen/pudhumai-penn.jpg",
    is_featured: true,
    faqs: [
      {
        q_en: "Are polytechnic and ITI students eligible for Tamil Pudhalvan?",
        q_ta: "பாலிடெக்னிக் மற்றும் ITI படிக்கும் மாணவர்களுக்கு இத்திட்டம் கிடைக்குமா?",
        a_en: "Yes, regular full-time polytechnic and ITI diploma students from government schools are 100% eligible.",
        a_ta: "ஆம். அரசுப் பள்ளிகளில் படித்த முழுநேர பாலிடெக்னிக் மற்றும் ITI மாணவர்களுக்கும் இத்திட்டம் முழுமையாகப் பொருந்தும்."
      }
    ]
  },
  {
    id: "cmchis",
    slug: "chief-ministers-comprehensive-health-insurance-scheme-cmchis",
    name_en: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
    name_ta: "முதலமைச்சர் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS)",
    category_en: "Healthcare",
    category_ta: "மருத்துவம் & சுகாதாரம்",
    department_en: "Health & Family Welfare Dept",
    department_ta: "மக்கள் நல்வாழ்வு மற்றும் குடும்ப நலத் துறை",
    financial_benefit_en: "Cashless medical and surgical treatment up to ₹5,00,000 per family per year.",
    financial_benefit_ta: "ஒரு குடும்பத்திற்கு ஆண்டிற்கு ₹5,00,000 வரை அரசு மற்றும் தனியார் மருத்துவமனைகளில் பணமில்லா சிகிச்சை.",
    benefits_en: "Cashless coverage for over 1,090 medical/surgical procedures, 52 specialized diagnostic tests, and critical surgeries across 1,150+ network hospitals.",
    benefits_ta: "இதய அறுவை சிகிச்சை, புற்றுநோய், டயாலிசிஸ் உள்ளிட்ட 1,090க்கும் மேற்பட்ட சிகிச்சைகளுக்கு 1,150+ அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் இலவச சிகிச்சை.",
    eligibility_en: "• Must be a resident of Tamil Nadu holding a valid Smart Family Ration Card\n• Annual family income less than ₹1,20,000 (relaxed for specific categories, orphans, and migrants)\n• Covers all members listed on the family card.",
    eligibility_ta: "• குடும்பத்தில் செல்லுபடியாகும் ஸ்மார்ட் குடும்ப அட்டை (ரேஷன் கார்டு) இருக்க வேண்டும்\n• குடும்ப ஆண்டு வருமானம் ₹1,20,000-க்குள் இருக்க வேண்டும்\n• குடும்ப அட்டையில் உள்ள அனைத்து உறுப்பினர்களுக்கும் காப்பீடு உண்டு.",
    documents_required_en: [
      "Smart Family Ration Card",
      "Aadhaar Cards of all Family Members",
      "Income Certificate from Village Administrative Officer (VAO) / Tahsildar",
      "Passport Size Photos of Family Members"
    ],
    documents_required_ta: [
      "ஸ்மார்ட் குடும்ப அட்டை (ரேஷன் கார்டு)",
      "அனைத்து குடும்ப உறுப்பினர்களின் ஆதார் அட்டை",
      "VAO அல்லது தாசில்தார் வழங்கிய வருமானச் சான்றிதழ்",
      "குடும்ப உறுப்பினர்களின் புகைப்படங்கள்"
    ],
    how_to_apply_en: "1. Visit the CMCHIS Kiosk at your District Collectorate Office or Government Medical College Hospital.\n2. Present Smart Ration card, Aadhaar cards, and Income certificate.\n3. Biometric enrolment and digital photo capture.\n4. Instant issuance of plastic CMCHIS smart card.",
    how_to_apply_ta: "1. மாவட்ட ஆட்சியர் அலுவலகம் அல்லது அரசு மருத்துவக் கல்லூரி மருத்துவமனையில் உள்ள CMCHIS மையத்தை அணுகவும்.\n2. ரேஷன் கார்டு, ஆதார் மற்றும் வருமானச் சான்றிதழைச் சமர்ப்பிக்கவும்.\n3. கைரேகை பதிவு மற்றும் புகைப்படம் எடுக்கப்படும்.\n4. ஸ்மார்ட் காப்பீட்டு அட்டை உடனடியாக வழங்கப்படும்.",
    where_to_apply_en: "District Collectorate CMCHIS Enrolment Centres & Government Medical Colleges.",
    where_to_apply_ta: "மாவட்ட ஆட்சியர் அலுவலக CMCHIS மையம் மற்றும் அரசு மருத்துவமனைகள்.",
    helpline: "1800-425-3993 (Toll-Free 24x7)",
    apply_url: "https://www.cmchis.tn.gov.in",
    website_url: "https://www.cmchis.tn.gov.in",
    image_url: "/images/evergreen/cmchis-health.jpg",
    is_featured: true,
    faqs: [
      {
        q_en: "What should I do if a private hospital refuses CMCHIS card?",
        q_ta: "அங்கீகரிக்கப்பட்ட தனியார் மருத்துவமனை காப்பீட்டை ஏற்க மறுத்தால் என்ன செய்வது?",
        a_en: "Immediately call the 24x7 CMCHIS toll-free grievance cell at 1800-425-3993 or contact the District Kiosk Coordinator.",
        a_ta: "உடனடியாக 1800-425-3993 என்ற 24 மணி நேர இலவச உதவி எண்ணில் அல்லது மாவட்ட CMCHIS ஒருங்கிணைப்பாளரிடம் புகார் தெரிவிக்கலாம்."
      }
    ]
  },
  {
    id: "breakfast-scheme",
    slug: "chief-ministers-breakfast-scheme-primary-schools",
    name_en: "Chief Minister's Breakfast Scheme (CMBS)",
    name_ta: "முதலமைச்சர் காலை உணவுத் திட்டம்",
    category_en: "Education",
    category_ta: "பள்ளிக் கல்வி",
    department_en: "Social Welfare & School Education Dept",
    department_ta: "சமூக நலன் மற்றும் பள்ளிக் கல்வித் துறை",
    financial_benefit_en: "100% Free nutritious hot breakfast on all school days.",
    financial_benefit_ta: "அனைத்துப் பள்ளி வேலை நாட்களிலும் மாணவர்களுக்கு 100% இலவச சத்தான சூடான காலை உணவு.",
    benefits_en: "Provides healthy breakfast (Rava Upma, Kichadi, Pongal, Kesari, Sambar) across all 31,000+ government primary schools, eradicating classroom hunger.",
    benefits_ta: "31,000க்கும் மேற்பட்ட அரசு தொடக்கப் பள்ளிகளில் படிக்கும் குழந்தைகளுக்கு காலை உணவு வழங்கி ஊட்டச்சத்து மற்றும் வருகை விகிதத்தை அதிகரித்தல்.",
    eligibility_en: "All students studying in Classes 1 to 5 in Tamil Nadu Government primary and middle schools.",
    eligibility_ta: "தமிழ்நாடு அரசு தொடக்க மற்றும் நடுநிலைப் பள்ளிகளில் 1 முதல் 5-ம் வகுப்பு வரை பயிலும் அனைத்துக் குழந்தைகள்.",
    documents_required_en: ["No documents required. Automatic enrolment upon school admission."],
    documents_required_ta: ["எந்த ஆவணமும் தேவையில்லை. பள்ளியில் சேர்ந்தவுடன் தானாகவே உணவு வழங்கப்படும்."],
    how_to_apply_en: "Automatic — No application needed. Served directly in schools from 8:15 AM to 8:50 AM.",
    how_to_apply_ta: "தானியங்கி முறை — விண்ணப்பம் தேவையில்லை. காலை 8:15 முதல் 8:50 வரை பள்ளியிலேயே உணவு பரிமாறப்படுகிறது.",
    where_to_apply_en: "Tamil Nadu Government Primary Schools.",
    where_to_apply_ta: "தமிழ்நாடு அரசு தொடக்கப் பள்ளிகள்.",
    helpline: "14417 / 1100",
    apply_url: "https://tnschools.gov.in",
    website_url: "https://tnschools.gov.in",
    image_url: "/images/evergreen/pudhumai-penn.jpg",
    is_featured: false,
    faqs: [
      {
        q_en: "Is the breakfast scheme applicable to aided schools?",
        q_ta: "அரசு உதவிபெறும் பள்ளிகளுக்கு இத்திட்டம் உண்டா?",
        a_en: "The government has extended the scheme to rural government-aided primary schools in phased batches.",
        a_ta: "ஊரகப் பகுதிகளில் உள்ள அரசு உதவிபெறும் தொடக்கப் பள்ளிகளுக்கும் இத்திட்டம் கட்டம் கட்டமாக விரிவுபடுத்தப்பட்டுள்ளது."
      }
    ]
  },
  {
    id: "vidiyal-payanam",
    slug: "vidiyal-payanam-free-bus-travel-scheme-women",
    name_en: "Vidiyal Payanam — Free Bus Travel Scheme for Women",
    name_ta: "விடியல் பயணம் — மகளிருக்கு கட்டணமில்லா பேருந்து பயணம்",
    category_en: "Transport",
    category_ta: "போக்குவரத்து",
    department_en: "Transport Department",
    department_ta: "போக்குவரத்துத் துறை",
    financial_benefit_en: "100% Free travel in ordinary fare state transport buses (saving ₹800–₹1,200 monthly).",
    financial_benefit_ta: "சாதாரண நகரப் பேருந்துகளில் கட்டணமில்லா பயணம் (மாதம் ₹800 முதல் ₹1,200 வரை மிச்சம்).",
    benefits_en: "Zero bus fare for women passengers, transgender persons, and differently-abled individuals in ordinary pink-board city buses across Tamil Nadu.",
    benefits_ta: "நகரப் பேருந்துகளில் பெண்கள், திருநங்கைகள் மற்றும் மாற்றுத்திறனாளிகள் கட்டணமின்றி பயணம் செய்ய அனுமதி.",
    eligibility_en: "All women, transgender persons, and differently abled persons in Tamil Nadu.",
    eligibility_ta: "தமிழ்நாட்டில் உள்ள அனைத்துப் பெண்கள், திருநங்கைகள் மற்றும் மாற்றுத்திறனாளிகள்.",
    documents_required_en: ["No registration required. Zero-rupee ticket issued by conductor."],
    documents_required_ta: ["முன் பதிவு தேவையில்லை. பேருந்தில் ஏறியவுடன் பூஜ்ஜிய கட்டண ரசீது (Zero Ticket) பெறலாம்."],
    how_to_apply_en: "Board any ordinary town bus (marked with pink color board or front display).",
    how_to_apply_ta: "பிங்க் நிற பலகை கொண்ட சாதாரண கட்டண பேருந்துகளில் ஏறினால் போதுமானது.",
    where_to_apply_en: "TNSTC and MTC Ordinary Town Buses across all districts.",
    where_to_apply_ta: "அனைத்து மாவட்ட TNSTC மற்றும் MTC சாதாரண பேருந்துகள்.",
    helpline: "1800-599-1500 (Transport Grievance)",
    apply_url: "https://transport.tn.gov.in",
    website_url: "https://transport.tn.gov.in",
    image_url: "/images/evergreen/magalir-urimai.jpg",
    is_featured: false,
    faqs: [
      {
        q_en: "Is free bus travel valid in Express and Deluxe buses?",
        q_ta: "எக்ஸ்பிரஸ் மற்றும் டீலக்ஸ் பேருந்துகளில் இலவச பயணம் செல்லுபடியாகுமா?",
        a_en: "No. The scheme is strictly valid in white-board / pink-board ordinary fare town buses only.",
        a_ta: "இல்லை. இத்திட்டம் சாதாரண கட்டண நகரப் பேருந்துகளுக்கு மட்டுமே பொருந்தும்."
      }
    ]
  },
  {
    id: "oap-scheme",
    slug: "tamil-nadu-old-age-pension-oap-scheme",
    name_en: "Tamil Nadu Old Age Pension Scheme (OAP)",
    name_ta: "முதியோர் ஓய்வூதியத் திட்டம் (OAP)",
    category_en: "Social Welfare",
    category_ta: "சமூகப் பாதுகாப்பு",
    department_en: "Revenue and Disaster Management Dept",
    department_ta: "வருவாய்த் துறை (சமூகப் பாதுகாப்பு)",
    financial_benefit_en: "₹1,200 per month deposited directly into bank account / postal account.",
    financial_benefit_ta: "மாதந்தோறும் ₹1,200 ஓய்வூதியம் நேரடியாக வங்கி அல்லது அஞ்சலக கணக்கில் வரவு.",
    benefits_en: "Social security monthly pension of ₹1,200 plus 2 free sarees/dhotis annually and free subsidized rice at PDS shops for destitute elderly citizens.",
    benefits_ta: "ஆதரவற்ற முதியோர்களுக்கு மாதம் ₹1,200 ஓய்வூதியம், ஆண்டுக்கு 2 இலவச வேட்டி/சேலை மற்றும் ரேஷனில் இலவச அரிசி.",
    eligibility_en: "• Age 60 years or older\n• Destitute with no source of regular income\n• Annual income below ₹24,000\n• No adult earning children supporting the applicant.",
    eligibility_ta: "• 60 வயது பூர்த்தியடைந்தவராக இருக்க வேண்டும்\n• வாழ்வாதாரத்திற்கு நிலையான வருமானம் இல்லாத ஆதரவற்றவர்\n• ஆண்டு வருமானம் ₹24,000-க்குள் இருக்க வேண்டும்\n• பராமரிக்கும் மகன் அல்லது குடும்பத்தினர் இல்லாதவர்.",
    documents_required_en: [
      "Aadhaar Card",
      "Smart Ration Card",
      "Age Proof (Voter ID / Birth Certificate / School TC / Medical Certificate)",
      "Bank Account Passbook (single holder)",
      "No-income Destitute Certificate from VAO"
    ],
    documents_required_ta: [
      "ஆதார் அட்டை",
      "குடும்ப அட்டை",
      "வயது சான்று (வாக்காளர் அட்டை / மருத்துவ சான்றிதழ்)",
      "வங்கி கணக்கு பாஸ்புக்",
      "VAO வழங்கிய வருமானமின்மை சான்றிதழ்"
    ],
    how_to_apply_en: "1. Visit nearest e-Sevai centre or Taluk Office.\n2. Submit Form with VAO certificate and age proof.\n3. Revenue Inspector (RI) and Tahsildar conduct home verification.\n4. Pension sanction order issued within 30 days.",
    how_to_apply_ta: "1. அருகிலுள்ள இ-சேவை மையம் அல்லது தாலுகா அலுவலகத்திற்குச் செல்லவும்.\n2. VAO சான்றிதழுடன் விண்ணப்பிக்கவும்.\n3. வருவாய் ஆய்வாளர் (RI) கள ஆய்வு செய்து தகுதியை உறுதிசெய்வார்.\n4. 30 நாட்களில் தாலுகா அலுவலகம் மூலம் ஆணை பிறப்பிக்கப்படும்.",
    where_to_apply_en: "Local Taluk Office (Special Tahsildar Social Security Schemes) & e-Sevai Centres.",
    where_to_apply_ta: "வட்டாட்சியர் அலுவலகம் (சமூக பாதுகாப்பு திட்டம்) மற்றும் இ-சேவை மையங்கள்.",
    helpline: "1100 / 14567 (Senior Citizen Helpline)",
    apply_url: "https://www.tnesevai.tn.gov.in",
    website_url: "https://www.tnesevai.tn.gov.in",
    image_url: "/images/evergreen/magalir-urimai.jpg",
    is_featured: false,
    faqs: [
      {
        q_en: "Can senior citizens with sons apply for OAP?",
        q_ta: "மகன் உள்ள முதியவர்கள் ஓய்வூதியம் பெற முடியுமா?",
        a_en: "If the son is below poverty line, missing, incapacitated, or not living together, exemption can be granted upon Tahsildar inquiry.",
        a_ta: "மகன் ஆதரவற்ற வறுமைக் கோட்டிற்கு கீழ் இருந்தாலோ அல்லது கைவிட்டிருந்தாலோ தாசில்தார் ஆய்வுக்குப் பின் ஓய்வூதியம் பெறலாம்."
      }
    ]
  },
  {
    id: "first-graduate",
    slug: "tamil-nadu-first-graduate-certificate-scheme",
    name_en: "First Graduate Tuition Fee Concession Scheme",
    name_ta: "முதல் பட்டதாரி கல்விக் கட்டணச் சலுகை திட்டம்",
    category_en: "Education",
    category_ta: "உயர்கல்வி",
    department_en: "Higher Education Dept & Revenue Dept",
    department_ta: "உயர்கல்வி மற்றும் வருவாய்த் துறை",
    financial_benefit_en: "100% Tuition fee waiver in engineering, medical, and professional colleges via single-window counseling.",
    financial_benefit_ta: "TNEA மற்றும் மருத்துவக் கலந்தாய்வில் சேரும் மாணவர்களுக்கு முழுக் கல்விக் கட்டண விலக்கு.",
    benefits_en: "Saves up to ₹25,000–₹50,000 annually in government and private self-financing engineering/medical seats for students whose family has no prior graduates.",
    benefits_ta: "குடும்பத்தில் முதல் பட்டதாரி மாணவர்களுக்கு பொறியியல் மற்றும் மருத்துவ கல்லூரிகளில் ஆண்டுதோறும் அரசு கட்டண விலக்கு அளிக்கிறது.",
    eligibility_en: "• No other member in the student's family (father, mother, brothers, sisters) must be a graduate\n• Student must obtain admission through Anna University / Directorate of Medical Education counseling (TNEA/NEET single window)\n• Resident of Tamil Nadu with Nativity Certificate.",
    eligibility_ta: "• குடும்பத்தில் பெற்றோர், உடன் பிறந்தவர்கள் யாரும் பட்டப்படிப்பு முடித்திருக்கக் கூடாது\n• அண்ணா பல்கலைக்கழகம் அல்லது மருத்துவ கலந்தாய்வு மூலம் சேர்க்கை பெற்றிருக்க வேண்டும்\n• தமிழ்நாட்டில் வசிப்பவராக இருத்தல் வேண்டும்.",
    documents_required_en: [
      "Applicant Aadhaar Card",
      "Smart Ration Card",
      "Parents' School TC / Transfer Certificate (showing highest educational qualification)",
      "Siblings' Educational Certificates",
      "Self-Declaration Affidavits from parents",
      "Nativity Certificate"
    ],
    documents_required_ta: [
      "மாணவரின் ஆதார் அட்டை",
      "குடும்ப அட்டை",
      "பெற்றோரின் பள்ளி மாற்றுச் சான்றிதழ் (TC)",
      "உடன் பிறந்தவர்களின் கல்விச் சான்றிதழ்",
      "பெற்றோர் உறுதிமொழிப் படிவம்",
      "இருப்பிடச் சான்றிதழ்"
    ],
    how_to_apply_en: "1. Apply online for 'First Graduate Certificate (REV-104)' at tnesevai.tn.gov.in.\n2. Pay ₹60 application fee.\n3. VAO and Tahsildar verify family education history.\n4. Download digitally signed certificate with QR code for counseling submission.",
    how_to_apply_ta: "1. tnesevai.tn.gov.in தளத்தில் 'First Graduate Certificate' விண்ணப்பிக்கவும்.\n2. ₹60 கட்டணம் செலுத்தவும்.\n3. VAO மற்றும் தாசில்தார் ஆவணங்களைச் சரிபார்ப்பார்கள்.\n4. QR குறியீட்டுடன் கூடிய டிஜிட்டல் சான்றிதழைப் பதிவிறக்கி கலந்தாய்வில் சமர்ப்பிக்கவும்.",
    where_to_apply_en: "e-Sevai Portal (tnesevai.tn.gov.in) or nearest e-Sevai Centre.",
    where_to_apply_ta: "இ-சேவை தளம் (tnesevai.tn.gov.in) அல்லது அருகிலுள்ள இ-சேவை மையம்.",
    helpline: "1100 / 044-40344444",
    apply_url: "https://www.tnesevai.tn.gov.in",
    website_url: "https://www.tnesevai.tn.gov.in",
    image_url: "/images/evergreen/pudhumai-penn.jpg",
    is_featured: false,
    faqs: [
      {
        q_en: "Can a younger brother apply if elder brother already got First Graduate benefit?",
        q_ta: "மூத்த சகோதரர் சலுகை பெற்றிருந்தால் தம்பிக்கு முதல் பட்டதாரி சான்றிதழ் கிடைக்குமா?",
        a_en: "No. First Graduate benefit is strictly available for only one person per family.",
        a_ta: "இல்லை. ஒரு குடும்பத்தில் ஒருவருக்கு மட்டுமே முதல் பட்டதாரி சலுகை கிடைக்கும்."
      }
    ]
  },
  {
    id: "mgnrega",
    slug: "mgnrega-100-days-employment-scheme-tamil-nadu",
    name_en: "MGNREGA — 100 Days Rural Employment Guarantee Scheme",
    name_ta: "100 நாள் வேலைத் திட்டம் (MGNREGA)",
    category_en: "Employment",
    category_ta: "வேலை வாய்ப்பு",
    department_en: "Rural Development & Panchayat Raj Dept",
    department_ta: "ஊரக வளர்ச்சி மற்றும் ஊராட்சித் துறை",
    financial_benefit_en: "Guaranteed statutory daily wage (₹319/day in TN) credited directly to bank account.",
    financial_benefit_ta: "தமிழ்நாட்டில் நாளொன்றுக்கு ₹319 சட்டப்பூர்வ கூலி நேரடியாக வங்கிக் கணக்கில் வரவு.",
    benefits_en: "Legal entitlement to 100 days of guaranteed manual wage work per financial year per rural household for pond desilting, canal cleaning, and afforestation.",
    benefits_ta: "கிராமப்புற குடும்பங்களுக்கு ஆண்டுக்கு 100 நாட்கள் சட்டப்பூர்வ வேலை உத்தரவாதம். ஏரி தூர்வாருதல், கால்வாய் சீரமைப்பு பணிகள்.",
    eligibility_en: "• Adult (18+) member of a rural household in Tamil Nadu\n• Willing to do unskilled manual civic work\n• Must hold a valid Job Card issued by Gram Panchayat.",
    eligibility_ta: "• கிராமப்புறத்தில் வசிக்கும் 18 வயது பூர்த்தியடைந்த நபர்கள்\n• உடலுழைப்பு செய்ய விருப்பமுள்ளவர்\n• கிராம பஞ்சாயத்து வழங்கிய வேலை அட்டை (Job Card) வைத்திருக்க வேண்டும்.",
    documents_required_en: [
      "Applicant Aadhaar Card",
      "Smart Ration Card",
      "Bank Account Passbook (Aadhaar linked)",
      "Passport Size Photo",
      "Gram Panchayat Job Card"
    ],
    documents_required_ta: [
      "ஆதார் அட்டை",
      "குடும்ப அட்டை",
      "ஆதார் இணைக்கப்பட்ட வங்கி கணக்கு பாஸ்புக்",
      "புகைப்படம்",
      "கிராம ஊராட்சி வேலை அட்டை"
    ],
    how_to_apply_en: "1. Apply to your Gram Panchayat Secretary for a Job Card (Form 1).\n2. Job card is issued free of cost within 15 days.\n3. Demand work in writing; work must be provided within 15 days, or unemployment allowance is mandatory.",
    how_to_apply_ta: "1. கிராம ஊராட்சி செயலாளரிடம் வேலை அட்டைக்கு விண்ணப்பிக்கவும்.\n2. 15 நாட்களுக்குள் இலவசமாக வேலை அட்டை வழங்கப்படும்.\n3. வேலை கோரி மனு கொடுத்த 15 நாட்களுக்குள் வேலை தர வேண்டும், இல்லையேல் வேலையின்மை கொடுப்பனவு வழங்கப்படும்.",
    where_to_apply_en: "Local Gram Panchayat Office & nrega.nic.in.",
    where_to_apply_ta: "கிராம ஊராட்சி மன்ற அலுவலகம் மற்றும் nrega.nic.in.",
    helpline: "1800-345-2244",
    apply_url: "https://nrega.nic.in",
    website_url: "https://nrega.nic.in",
    image_url: "/images/evergreen/magalir-urimai.jpg",
    is_featured: false,
    faqs: [
      {
        q_en: "How are wages paid under MGNREGA?",
        q_ta: "100 நாள் வேலை திட்டத்திற்கான கூலி எவ்வாறு வழங்கப்படுகிறது?",
        a_en: "Wages are calculated by the Panchayat Overseer based on work measurements and credited weekly via Aadhaar-based Payment Bridge (ABPS).",
        a_ta: "பணிகளை அளவீடு செய்து வாரம் ஒருமுறை ஆதார் பாங்கிங் (ABPS) மூலம் நேரடியாக வங்கிக்கு அனுப்பப்படுகிறது."
      }
    ]
  },
  {
    id: "differently-abled-welfare",
    slug: "tamil-nadu-differently-abled-welfare-schemes",
    name_en: "Welfare Schemes for Persons with Disabilities",
    name_ta: "மாற்றுத்திறனாளிகள் நலத் திட்டங்கள் மற்றும் உதவித்தொகை",
    category_en: "Social Welfare",
    category_ta: "மாற்றுத்திறனாளிகள் நலன்",
    department_en: "Welfare of Differently Abled Persons Dept",
    department_ta: "மாற்றுத்திறனாளிகள் நலத் துறை",
    financial_benefit_en: "₹2,000 per month maintenance allowance + free bus pass + retrofitted scooters.",
    financial_benefit_ta: "மாதம் ₹2,000 பராமரிப்பு உதவித்தொகை + கட்டணமில்லா பேருந்து பாஸ் + இலவச இணைப்பு சக்கரம் பொருத்திய வாகனம்.",
    benefits_en: "Monthly financial aid, free assistive aids and appliances (hearing aids, motorized tricycles, braille kits), and 4% job reservation.",
    benefits_ta: "கடுமையான மாற்றுத்திறனாளிகளுக்கு மாதம் ₹2,000 உதவி, 4% அரசு வேலைவாய்ப்பு இடஒதுக்கீடு, கட்டணமில்லா அரசு பேருந்து பயணம்.",
    eligibility_en: "• Person with 40%+ disability (75%+ for ₹2,000 monthly maintenance allowance)\n• Possesses valid Medical Board Disability Certificate & Unique Disability ID (UDID).",
    eligibility_ta: "• மருத்துவக் குழு வழங்கிய 40% அல்லது அதற்கு மேற்பட்ட மாற்றுத்திறனாளி சான்றிதழ் (உதவித்தொகைக்கு 75%+)\n• UDID ஸ்மார்ட் கார்டு அட்டை பெற்றிருக்க வேண்டும்.",
    documents_required_en: [
      "UDID Card / Disability Certificate from Medical Board",
      "Aadhaar Card",
      "Smart Ration Card",
      "Bank Account Passbook (Aadhaar Seeded)",
      "Passport Size Photos (showing disability)"
    ],
    documents_required_ta: [
      "மருத்துவக் குழு வழங்கிய மாற்றுத்திறனாளி சான்றிதழ் / UDID அட்டை",
      "ஆதார் அட்டை",
      "குடும்ப அட்டை",
      "வங்கி கணக்கு பாஸ்புக் நகல்",
      "புகைப்படம்"
    ],
    how_to_apply_en: "1. Register on swavlambancard.gov.in to get UDID card.\n2. Visit the District Differently Abled Welfare Officer (DDAWO) at District Collectorate.\n3. Submit medical certificate and bank details for monthly pension.",
    how_to_apply_ta: "1. swavlambancard.gov.in தளம் மூலம் UDID கார்டுக்குப் பதிவு செய்யவும்.\n2. மாவட்ட ஆட்சியர் அலுவலகத்தில் உள்ள மாவட்ட மாற்றுத்திறனாளிகள் நல அலுவலரை (DDAWO) அணுகவும்.\n3. மருத்துவ சான்றிதழ் வழங்கி மாதாந்திர உதவித்தொகைக்கு விண்ணப்பிக்கவும்.",
    where_to_apply_en: "District Differently Abled Welfare Office (Collectorate) & scda.tn.gov.in.",
    where_to_apply_ta: "மாவட்ட ஆட்சியர் வளாகத்தில் உள்ள மாற்றுத்திறனாளிகள் நல அலுவலகம்.",
    helpline: "1800-425-0111",
    apply_url: "https://www.scda.tn.gov.in",
    website_url: "https://www.scda.tn.gov.in",
    image_url: "/images/evergreen/cmchis-health.jpg",
    is_featured: false,
    faqs: [
      {
        q_en: "How to get a free motorized retrofitted scooter?",
        q_ta: "இணைப்பு சக்கரம் பொருத்திய இலவச இருசக்கர வாகனம் பெறுவது எப்படி?",
        a_en: "Locomotor disabled individuals with both lower limbs affected, aged 18–45, who are employed or studying can apply annually to the DDAWO office.",
        a_ta: "இரண்டு கால்களும் பாதிக்கப்பட்ட 18 முதல் 45 வயதுடைய பணிபுரியும் அல்லது கல்லூரி பயிலும் மாற்றுத்திறனாளிகள் DDAWO அலுவலகத்தில் விண்ணப்பிக்கலாம்."
      }
    ]
  }
];

// Get scheme by slug or id
export const getSchemeBySlug = (slug) => {
  return getAllSchemes().find(s => s.slug === slug || s.id === slug);
};

export const GOVT_SCHEMES = getAllSchemes();
export const SAFETY_GUIDES = getAllGuides();

// All portals with slugs
export const getAllPortals = () => [
  {
    id: "esevai",
    slug: "tnesevai",
    name_en: "TN e-Sevai Portal",
    name_ta: "TN e-சேவை இணையதளம்",
    description_en: "Access 150+ government services online — birth/death certificate, community certificate, income certificate, land records, licences and more.",
    description_ta: "பிறப்பு/இறப்பு சான்றிதழ், சமூக சான்றிதழ், வருமான சான்றிதழ், நில பதிவேடுகள் உட்பட 150+ அரசு சேவைகள் ஆன்லைனில்.",
    url: "https://www.tnesevai.tn.gov.in",
    category_en: "Government Services",
    category_ta: "அரசு சேவைகள்",
    dept_en: "Dept. of e-Governance (TNEGA)",
    dept_ta: "இ-ஆட்சி துறை (TNEGA)",
  },
  {
    id: "tneb",
    slug: "tnebltd",
    name_en: "TANGEDCO / TNEB Online Portal",
    name_ta: "TANGEDCO / TN மின்சார வாரியம்",
    description_en: "Pay electricity bills, apply for new domestic/commercial connections, track power outages, and file complaints online.",
    description_ta: "மின் கட்டணம் செலுத்துதல், புதிய இணைப்பு விண்ணப்பம், மின் தடை கண்காணிப்பு மற்றும் புகார்கள்.",
    url: "https://www.tnebltd.org",
    category_en: "Utilities",
    category_ta: "பயன்பாட்டு சேவைகள்",
    dept_en: "TANGEDCO",
    dept_ta: "தமிழ்நாடு மின் உற்பத்தி மற்றும் பகிர்மான கழகம்",
  },
  {
    id: "tnpds",
    slug: "tnpds",
    name_en: "TN PDS — Smart Ration Card Portal",
    name_ta: "TN PDS — குடும்ப அட்டை இணையதளம்",
    description_en: "Apply for new smart ration card, update family members, check PDS fair price shop stock, and track application status.",
    description_ta: "புதிய குடும்ப அட்டை விண்ணப்பம், குடும்ப உறுப்பினர்கள் புதுப்பித்தல், ரேஷன் இருப்பு சரிபார்ப்பு.",
    url: "https://www.tnpds.gov.in",
    category_en: "Government Services",
    category_ta: "அரசு சேவைகள்",
    dept_en: "Civil Supplies & Consumer Protection Dept",
    dept_ta: "உணவு மற்றும் நுகர்வோர் பாதுகாப்பு துறை",
  },
  {
    id: "police",
    slug: "tnpolice-eservices",
    name_en: "TN Police e-Services Portal",
    name_ta: "TN காவல்துறை இ-சேவைகள்",
    description_en: "File online police complaint, track FIR status, report lost documents, apply for character verification and event permissions.",
    description_ta: "ஆன்லைன் புகார் பதிவு, FIR நிலை அறிதல், தொலைந்த ஆவணங்கள் அறிக்கை மற்றும் காவல் சேவைகள்.",
    url: "https://eservices.tnpolice.gov.in",
    category_en: "Police & Public Safety",
    category_ta: "காவல்துறை & பாதுகாப்பு",
    dept_en: "Tamil Nadu Police Department",
    dept_ta: "தமிழ்நாடு காவல்துறை",
  },
  {
    id: "cmchis",
    slug: "cmchis-health-insurance",
    name_en: "CMCHIS — Comprehensive Health Insurance Portal",
    name_ta: "முதலமைச்சர் விரிவான மருத்துவக் காப்பீடு",
    description_en: "Verify CMCHIS eligibility, locate 1,150+ empanelled government and private hospitals, and review cashless treatment packages.",
    description_ta: "காப்பீட்டு அட்டை தகுதி, அங்கீகரிக்கப்பட்ட மருத்துவமனைகள் பட்டியல் மற்றும் சிகிச்சை விபரங்கள்.",
    url: "https://www.cmchis.com",
    category_en: "Healthcare",
    category_ta: "சுகாதாரம்",
    dept_en: "Health & Family Welfare Dept",
    dept_ta: "சுகாதார மற்றும் குடும்ப நலத்துறை",
  },
  {
    id: "rti",
    slug: "rtionline",
    name_en: "RTI Online Portal",
    name_ta: "தகவல் அறியும் உரிமை ஆன்லைன் தளம்",
    description_en: "File statutory Right to Information applications online, pay ₹10 fee digitally, and track 30-day departmental response window.",
    description_ta: "ஆன்லைனில் தகவல் அறியும் உரிமை மனு தாக்கல் செய்து 30 நாட்களுக்குள் தகவல் பெறும் தளம்.",
    url: "https://rtionline.tn.gov.in",
    category_en: "Rights & Transparency",
    category_ta: "உரிமைகள் & வெளிப்படைத்தன்மை",
    dept_en: "Personnel and Administrative Reforms Dept",
    dept_ta: "பணியாளர் மற்றும் நிர்வாக சீர்திருத்தத் துறை",
  },
  {
    id: "cms",
    slug: "cm-helpline-cms",
    name_en: "Mudhalvar Mugavari / CM Helpline Portal",
    name_ta: "முதல்வர் முகவரி / முதலமைச்சர் உதவி மையம்",
    description_en: "Register public grievances directly with Chief Minister Special Cell. Monitored time-bound resolution across all 38 districts.",
    description_ta: "முதல்வர் தனிப்பிரிவில் பொதுமக்கள் மனுக்களை பதிவு செய்து விரைவான தீர்வு பெறும் தளம்.",
    url: "https://cmhelpline.tnega.org",
    category_en: "Grievance Redressal",
    category_ta: "குறைதீர்ப்பு",
    dept_en: "Chief Minister's Secretariat",
    dept_ta: "முதலமைச்சர் செயலகம்",
  },
  {
    id: "myscheme",
    slug: "myscheme",
    name_en: "myScheme — National Welfare Scheme Finder",
    name_ta: "myScheme — அரசு திட்டங்கள் தேடல்",
    description_en: "Discover all central and Tamil Nadu state welfare schemes you are eligible for using smart profile screening.",
    description_ta: "உங்கள் தகுதிக்கேற்ப மத்திய மற்றும் மாநில அரசு நலத்திட்டங்களை கண்டறியும் தளம்.",
    url: "https://www.myscheme.gov.in",
    category_en: "Government Services",
    category_ta: "அரசு சேவைகள்",
    dept_en: "Ministry of Electronics & IT (MeitY)",
    dept_ta: "மத்திய மின்னணு & தகவல் தொழில்நுட்ப அமைச்சகம்",
  },
  {
    id: "twad",
    slug: "twad-board",
    name_en: "TWAD Board — Drinking Water Services",
    name_ta: "TWAD வாரியம் — குடிநீர் மற்றும் வடிகால் வாரியம்",
    description_en: "Explore drinking water schemes, rural piped water supply, sewerage connections, and water quality testing.",
    description_ta: "குடிநீர் திட்டங்கள், கிராமப்புற குழாய் நீர் இணைப்பு மற்றும் நீர் பரிசோதனை சேவைகள்.",
    url: "https://twad.tn.gov.in",
    category_en: "Utilities",
    category_ta: "பயன்பாட்டு சேவைகள்",
    dept_en: "Municipal Administration & Water Supply",
    dept_ta: "நகராட்சி நிர்வாகம் & குடிநீர் வழங்கல் துறை",
  },
  {
    id: "chennaicorporation",
    slug: "chennaicorporation",
    name_en: "Greater Chennai Corporation (GCC Portal)",
    name_ta: "பெருநகர சென்னை மாநகராட்சி இணையதளம்",
    description_en: "Official GCC municipal portal for property tax payment, birth/death certificates, trade licences, and civic flood control.",
    description_ta: "சென்னை மாநகராட்சி சொத்து வரி, பிறப்பு/இறப்பு சான்றிதழ் மற்றும் குறைதீர்ப்பு தளம்.",
    url: "https://www.chennaicorporation.gov.in",
    category_en: "Municipal Services",
    category_ta: "நகராட்சி சேவைகள்",
    dept_en: "Greater Chennai Corporation",
    dept_ta: "பெருநகர சென்னை மாநகராட்சி",
  },
];

// Get portal by slug or id
export const getPortalBySlug = (slug) => {
  return getAllPortals().find(p => p.slug === slug || p.id === slug);
};

// All emergency contacts with slugs
export const getAllEmergencyContacts = () => [
  {
    id: "emergency-112",
    slug: "112",
    name_en: "National Emergency Unified Helpline (112)",
    name_ta: "தேசிய ஒருங்கிணைந்த அவசர உதவி எண் (112)",
    number: "112",
    description_en: "Single toll-free 24x7 emergency response connecting Police, Fire & Rescue, Medical Ambulance, and Disaster Relief.",
    description_ta: "காவல்துறை, தீயணைப்பு, ஆம்புலன்ஸ் ஆகியவற்றை ஒருங்கிணைக்கும் தேசிய அவசர எண்.",
    category_en: "Universal Emergency",
    category_ta: "அனைத்து அவசர நிலைகள்",
  },
  {
    id: "emergency-108",
    slug: "108",
    name_en: "Free Medical Emergency Ambulance (108)",
    name_ta: "இலவச அவசர ஆம்புலன்ஸ் சேவை (108)",
    number: "108",
    description_en: "24x7 free state emergency ambulance service for accidents, cardiac events, trauma, and maternal healthcare transport.",
    description_ta: "விபத்துக்கள் மற்றும் அவசர மருத்துவ தேவைகளுக்கான இலவச 24 மணி நேர ஆம்புலன்ஸ் சேவை.",
    category_en: "Medical Emergency",
    category_ta: "மருத்துவ அவசரம்",
  },
  {
    id: "emergency-100",
    slug: "100",
    name_en: "Tamil Nadu Police Control Room (100)",
    name_ta: "தமிழ்நாடு காவல் கட்டுப்பாட்டு அறை (100)",
    number: "100",
    description_en: "Direct police emergency hotline for crime reporting, physical assault, theft, and urgent citizen safety intervention.",
    description_ta: "குற்றத் தடுப்பு மற்றும் உடனடி உதவிக்கான தமிழ்நாடு காவல் கட்டுப்பாட்டு அறை.",
    category_en: "Police & Security",
    category_ta: "காவல்துறை",
  },
  {
    id: "emergency-101",
    slug: "101",
    name_en: "Fire & Rescue Services (101)",
    name_ta: "தீயணைப்பு மற்றும் மீட்புப் பணிகள் (101)",
    number: "101",
    description_en: "Immediate response for building fires, LPG leaks, flood rescues, and hazardous structural collapses.",
    description_ta: "தீ விபத்துக்கள், எரிவாயு கசிவு மற்றும் பேரிடர் மீட்பு பணிகளுக்கான கட்டுப்பாட்டு அறை.",
    category_en: "Fire & Disaster",
    category_ta: "தீயணைப்பு & மீட்பு",
  },
  {
    id: "emergency-1912",
    slug: "1912",
    name_en: "TANGEDCO Minnalagam Power Failure (1912)",
    name_ta: "மின்னகம் — மின்சார வாரிய 24x7 உதவி மையம் (1912)",
    number: "1912",
    description_en: "24x7 electricity emergency hotline for power blackouts, fallen live wires, sparking transformers, and billing grievances.",
    description_ta: "மின்தடை, அறுந்து விழுந்த மின் கம்பிகள் மற்றும் டிரான்ஸ்பார்மர் பழுதுகளுக்கான 24x7 புகார் எண்.",
    category_en: "Electricity & Utilities",
    category_ta: "மின்சாரம்",
  },
  {
    id: "emergency-1930",
    slug: "1930",
    name_en: "National Cyber Crime Helpline (1930)",
    name_ta: "சைபர் கிரைம் உதவி மையம் — நிதி மோசடி (1930)",
    number: "1930",
    description_en: "Golden hour financial scam reporting line to immediately freeze stolen funds in UPI, OTP, loan app, and credit card frauds.",
    description_ta: "UPI, OTP வங்கி நிதி மோசடிகள் நடந்த உடனேயே கணக்குகளை முடக்க உதவும் தேசிய சைபர் கிரைம் எண்.",
    category_en: "Cyber Crime",
    category_ta: "சைபர் கிரைம்",
  },
  {
    id: "emergency-181",
    slug: "181",
    name_en: "Tamil Nadu Women in Distress Helpline (181)",
    name_ta: "பெண்கள் உதவி மையம் — 24 மணி நேர உதவி (181)",
    number: "181",
    description_en: "24x7 support line for women facing domestic violence, harassment, stalking, legal distress, or requiring emergency shelter.",
    description_ta: "குடும்ப வன்முறை, பாலியல் துன்புறுத்தல் மற்றும் அவசர பாதுகாப்பு தேவைப்படும் பெண்களுக்கான 24x7 உதவி எண்.",
    category_en: "Women & Child Protection",
    category_ta: "பெண்கள் பாதுகாப்பு",
  },
  {
    id: "emergency-1100",
    slug: "1100",
    name_en: "Chief Minister Helpline (1100)",
    name_ta: "முதலமைச்சரின் உதவி மையம் (1100)",
    number: "1100",
    description_en: "Direct citizen grievance escalation helpline to report delayed government services, unresolved civic petitions, and district delays.",
    description_ta: "அரசுத் துறை குறைபாடுகள் மற்றும் தாமதங்களுக்கு தீர்வு காணும் முதலமைச்சரின் உதவி மையம்.",
    category_en: "Public Grievance",
    category_ta: "பொது குறைதீர்ப்பு",
  },
  {
    id: "emergency-1913",
    slug: "1913",
    name_en: "Greater Chennai Corporation Control Room (1913)",
    name_ta: "சென்னை மாநகராட்சி கட்டுப்பாட்டு அறை (1913)",
    number: "1913",
    description_en: "Municipal control center for flood waterlogging, fallen trees, garbage pile-ups, subway inundation, and streetlights.",
    description_ta: "மழை வெள்ள நீர் தேக்கம், விழுந்த மரங்கள், குப்பை மற்றும் மாநகராட்சி அவசர புகார்களுக்கான எண்.",
    category_en: "Municipal Disaster",
    category_ta: "மாநகராட்சி பேரிடர்",
  },
  {
    id: "emergency-1070",
    slug: "1070",
    name_en: "State Disaster Management Authority — TNDMA (1070)",
    name_ta: "மாநில பேரிடர் மேலாண்மை ஆணையம் — TNDMA (1070)",
    number: "1070",
    description_en: "Secretariat command desk for major cyclone warnings, heavy flooding, reservoir discharge alerts, and tsunami advisories.",
    description_ta: "புயல், கனமழை, வெள்ளப் பெருக்கு போன்ற மாநில பேரிடர்களின் போது செயல்படும் தலைமைச் செயலக கட்டுப்பாட்டு அறை.",
    category_en: "Disaster Management",
    category_ta: "பேரிடர் மேலாண்மை",
  },
  {
    id: "emergency-1077",
    slug: "1077",
    name_en: "District Collectorate Disaster Control Room (1077)",
    name_ta: "மாவட்ட ஆட்சியர் பேரிடர் கட்டுப்பாட்டு அறை (1077)",
    number: "1077",
    description_en: "Hyperlocal emergency control room at each of Tamil Nadu's 38 District Collector offices during monsoons and crises.",
    description_ta: "தமிழ்நாட்டின் 38 மாவட்ட ஆட்சியர் அலுவலகங்களிலும் செயல்படும் மாவட்ட பேரிடர் அவசர எண்.",
    category_en: "District Administration",
    category_ta: "மாவட்ட நிர்வாகம்",
  },
  {
    id: "emergency-1098",
    slug: "1098",
    name_en: "Childline Emergency Support (1098)",
    name_ta: "குழந்தைகள் உதவி மையம் — சைல்டுலைன் (1098)",
    number: "1098",
    description_en: "24x7 toll-free emergency phone service for children in need of care, protection against child labor, and abuse prevention.",
    description_ta: "குழந்தைத் தொழிலாளர் முறை, பாலியல் வன்கொடுமை மற்றும் குழந்தைகளுக்கான பாதுகாப்பு உதவி எண்.",
    category_en: "Child Protection",
    category_ta: "குழந்தைகள் பாதுகாப்பு",
  },
  {
    id: "emergency-1064",
    slug: "1064",
    name_en: "DVAC Anti-Corruption & Bribery Helpline (1064)",
    name_ta: "லஞ்ச ஒழிப்பு மற்றும் கண்காணிப்புத் துறை (1064)",
    number: "1064",
    description_en: "Direct Directorate of Vigilance and Anti-Corruption line to report government officers demanding bribes or indulging in graft.",
    description_ta: "அரசு அலுவலகங்களில் லஞ்சம் கேட்பவர்கள் மீது ரகசியமாக புகார் அளிக்க உதவும் இலவச எண்.",
    category_en: "Anti-Corruption",
    category_ta: "ஊழல் தடுப்பு",
  },
];

// Get emergency contact by slug, id, or number
export const getEmergencyContactBySlug = (slug) => {
  return getAllEmergencyContacts().find(e => e.slug === slug || e.id === slug || e.number === slug);
};

// All citizen rights with slugs and rich statutory SEO data
export const getAllRights = () => [
  {
    id: "right-rti",
    slug: "right-to-information-act-2005",
    name_en: "Right to Information Act (RTI Act 2005)",
    name_ta: "தகவல் அறியும் உரிமைச் சட்டம் 2005",
    seo_title_en: "RTI Act 2005 Tamil Nadu: How to Apply, Rules, Fees & 30-Day Limit",
    seo_title_ta: "தமிழ்நாடு RTI சட்டம் 2005: விண்ணப்பிக்கும் முறை, கட்டணம் & 30 நாள் காலக்கெடு",
    seo_desc_en: "Complete citizen guide to RTI Act 2005 in Tamil Nadu: ₹10 fee, 30-day statutory response window, ₹25,000 PIO penalty, online filing portal & appeals.",
    seo_desc_ta: "தமிழ்நாட்டில் தகவல் அறியும் உரிமைச் சட்டம் 2005 வழிகாட்டி: ₹10 கட்டணம், 30 நாள் பதில் காலக்கெடு, ₹25,000 அபராதம் மற்றும் ஆன்லைன் விண்ணப்ப முறை.",
    statutory_section_en: "Sections 6(1), 7(1), 7(6) & 20(1) RTI Act 2005",
    statutory_section_ta: "RTI சட்டம் 2005 பிரிவு 6(1), 7(1), 7(6) & 20(1)",
    timeline_sla_en: "30 Calendar Days (48 Hours for Life & Liberty)",
    timeline_sla_ta: "30 நாட்கள் பதில் (உயிர் பாதுகாப்பு எனில் 48 மணி நேரம்)",
    penalty_en: "₹250/day up to ₹25,000 deducted directly from PIO salary + Disciplinary action",
    penalty_ta: "தகவல் தாமதத்திற்கு அதிகாரி சம்பளத்தில் நாள் ஒன்றுக்கு ₹250 வீதம் ₹25,000 வரை அபராதம்",
    fee_en: "₹10 Court Fee Stamp, Postal Order or Online UPI (Free for BPL)",
    fee_ta: "₹10 நீதிமன்ற முத்திரை அல்லது போஸ்டல் ஆர்டர் (வறுமைக் கோட்டிற்கு கீழ் உள்ளவர்களுக்கு இலவசம்)",
    helpline: "1100",
    helpline_name_en: "CM Helpline / TNIC Cell",
    helpline_name_ta: "முதல்வர் உதவி எண் / தகவல் ஆணையம்",
    desc_en: "Empowers Indian citizens to request information, inspect government files, and obtain certified copies of records from any public authority within 30 days.",
    desc_ta: "அரசுத் துறைகளின் செயல்பாடுகள், நிதிகள் மற்றும் கோப்புகளை மக்கள் பார்வையிடவும் நகல் பெறவும் 30 நாட்களுக்குள் தகவல் பெறும் உரிமை.",
    content_en: "Under the RTI Act 2005, every citizen has the statutory right to file an application with a Public Information Officer (PIO) of any state or central department. The PIO must reply within 30 calendar days (or 48 hours if life and liberty are involved). Application fee is ₹10. If information is denied, delayed, or evasive, citizens can file a First Appeal under Section 19(1) to the Head of Department without fee, and a Second Appeal to the Tamil Nadu Information Commission (TNIC).",
    content_ta: "தகவல் அறியும் உரிமைச் சட்டத்தின்படி ஒவ்வொரு குடிமகனும் எந்தவொரு அரசுத் துறையிலும் ₹10 கட்டணத்துடன் விண்ணப்பித்து 30 நாட்களுக்குள் தகவல் பெற உரிமை உண்டு. பதில் கிடைக்காத பட்சத்தில் 30 நாட்களுக்குள் துறைத் தலைவரிடம் முதல் மேல்முறையீடு செய்யலாம். அதிலும் தீர்வு இல்லையெனில் தமிழ்நாடு தகவல் ஆணையத்தில் (TNIC) இரண்டாவது மேல்முறையீடு செய்யலாம்.",
    verbal_script_en: "Sir, I have submitted a statutory application under Section 6(1) of the RTI Act 2005 on [Date]. As per Section 7(1), the PIO must furnish the information within 30 days. Under Section 7(6), delayed information must be supplied free of cost, and Section 20 imposes personal penalties up to ₹25,000 on defaulting officers.",
    verbal_script_ta: "ஐயா, தகவல் அறியும் உரிமைச் சட்டம் பிரிவு 6(1)-ன் கீழ் மனு அளித்துள்ளேன். பிரிவு 7(1)-ன் படி 30 நாட்களுக்குள் தகவல் வழங்க வேண்டும். காலதாமதம் ஏற்பட்டால் பிரிவு 7(6)-ன் படி தகவல்கள் கட்டணமின்றி இலவசமாக வழங்கப்பட வேண்டும் மற்றும் பிரிவு 20-ன் படி அதிகாரி மீது அபராதம் விதிக்கப்படும்.",
    department_en: "Personnel and Administrative Reforms Dept / TN Information Commission",
    department_ta: "பணியாளர் & நிர்வாக சீர்திருத்தத் துறை / தகவல் ஆணையம்",
    portal_url: "https://rtionline.tn.gov.in",
    image_url: "/images/evergreen/rti-rights.jpg",
    key_points_en: [
      "Mandatory 30-day response window for all Tamil Nadu government authorities",
      "₹10 application fee; completely free for below poverty line (BPL) cardholders",
      "Statutory right to physically inspect public works, roads, and government records",
      "Personal penalty up to ₹25,000 deducted from the salary of defaulting officers"
    ],
    key_points_ta: [
      "தமிழ்நாடு அரசுத் துறைகள் அனைத்திற்கும் 30 நாட்கள் கட்டாயப் பதில் காலக்கெடு",
      "₹10 கட்டணம் மட்டுமே; வறுமைக் கோட்டிற்கு கீழ் உள்ளவர்களுக்கு முற்றிலும் இலவசம்",
      "அரசு சாலைகள், கட்டுமானப் பணிகள் மற்றும் கோப்புகளை நேரில் ஆய்வு செய்யும் உரிமை",
      "தகவலை மறைக்கும் அதிகாரிக்கு ₹25,000 வரை தனிப்பட்ட அபராதம்"
    ],
    steps_en: [
      "Draft concise, factual questions (request copies of file notings, orders, and audits)",
      "Affix ₹10 Court Fee Stamp or pay via rtionline.tn.gov.in",
      "Submit to PIO via Registered Post with Acknowledgment Due (RPAD) or online",
      "If no reply within 30 days, file First Appeal to the Appellate Authority within 30 days"
    ],
    steps_ta: [
      "தெளிவான கேள்விகளைத் தயார் செய்யுங்கள் (கோப்புகள், உத்தரவுகளின் நகல்களைக் கோருங்கள்)",
      "₹10 நீதிமன்ற முத்திரை ஒட்டி அல்லது rtionline.tn.gov.in மூலம் ஆன்லைனில் கட்டணம் செலுத்துங்கள்",
      "பொதுத் தகவல் அலுவலருக்கு பதிவுத் தபால் (RPAD) அல்லது இணையதளம் மூலம் அனுப்புங்கள்",
      "30 நாட்களில் பதில் வராவிடில் துறைத் தலைவரிடம் முதல் மேல்முறையீடு செய்யுங்கள்"
    ],
    faqs: [
      {
        q_en: "Can a government department reject an RTI application for not stating the reason?",
        q_ta: "காரணம் சொல்லவில்லை என்பதற்காக அரசுத் துறை RTI மனுவை நிராகரிக்க முடியுமா?",
        a_en: "No. Under Section 6(2) of the RTI Act 2005, an applicant is not required to give any reason for requesting information or any personal details other than contact address.",
        a_ta: "முடியாது. RTI சட்டம் பிரிவு 6(2)-ன் படி தகவல் கோரும் குடிமகன் அதற்கான காரணத்தைத் தெரிவிக்க வேண்டிய அவசியமில்லை."
      },
      {
        q_en: "What if the Public Information Officer does not respond within 30 days?",
        q_ta: "30 நாட்களுக்குள் தகவல் அதிகாரி பதில் அளிக்காவிட்டால் என்ன செய்வது?",
        a_en: "If no reply is given within 30 days, file a First Appeal to the Department Head under Section 19(1). Under Section 7(6), all requested documents must now be supplied 100% free of cost.",
        a_ta: "பதில் வராவிடில் துறைத் தலைவரிடம் முதல் மேல்முறையீடு செய்யலாம். பிரிவு 7(6)-ன் படி அனைத்து ஆவணங்களையும் கட்டணமின்றி இலவசமாக வழங்க வேண்டும்."
      },
      {
        q_en: "Can I inspect local road construction files and government tenders under RTI?",
        q_ta: "உள்ளூர் சாலைப் பணிகள் மற்றும் டெண்டர் கோப்புகளை RTI மூலம் ஆய்வு செய்ய முடியுமா?",
        a_en: "Yes. Section 2(j)(i) explicitly grants citizens the right to physically inspect government works, documents, records, and certified samples of materials used.",
        a_ta: "ஆம். பிரிவு 2(j)(i)-ன் படி அரசுப் பணிகள், பதிவேடுகள் மற்றும் பயன்படுத்தப்பட்ட கட்டுமானப் பொருட்களின் மாதிரிகளை நேரில் ஆய்வு செய்ய முழு உரிமை உண்டு."
      }
    ]
  },
  {
    id: "right-consumer",
    slug: "consumer-protection-rights-2019",
    name_en: "Consumer Protection Rights (Act 2019)",
    name_ta: "நுகர்வோர் பாதுகாப்பு சட்ட உரிமைகள் 2019",
    seo_title_en: "Consumer Court Rights Tamil Nadu: e-Daakhil, No Lawyer Rules & 1915 Helpline",
    seo_title_ta: "தமிழ்நாடு நுகர்வோர் மன்ற உரிமைகள்: வழக்கறிஞர் இன்றி ஆன்லைன் வழக்கு & 1915",
    seo_desc_en: "How to file a consumer complaint in Tamil Nadu without a lawyer: e-Daakhil filing, ₹50 Lakh District Commission limit, product liability & 1915 helpline.",
    seo_desc_ta: "தமிழ்நாட்டில் வழக்கறிஞர் இன்றி நுகர்வோர் நீதிமன்றத்தில் வழக்கு தொடரும் முறை: இ-தாகீல் தளம், ₹50 லட்சம் வரம்பு மற்றும் நுகர்வோர் உதவி எண் 1915.",
    statutory_section_en: "Sections 2(7), 35 & 84-86 Consumer Protection Act 2019",
    statutory_section_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 பிரிவு 2(7), 35 & 84-86",
    timeline_sla_en: "District Commission Claims up to ₹50 Lakhs",
    timeline_sla_ta: "மாவட்ட நுகர்வோர் மன்றம் ₹50 லட்சம் வரை இழப்பீடு வழங்க அதிகாரம்",
    penalty_en: "Full refund, product replacement, monetary damages & business license cancellation",
    penalty_ta: "முழு பணத்தைத் திரும்பப் பெறுதல், மாற்றுப் பொருள், இழப்பீடு மற்றும் வணிக உரிம ரத்து",
    fee_en: "Zero advocate fee; nominal court fee on e-Daakhil",
    fee_ta: "வழக்கறிஞர் கட்டாயம் இல்லை; இ-தாகீல் தளத்தில் மிகக் குறைந்த கட்டணம்",
    helpline: "1915",
    helpline_name_en: "National Consumer Helpline Toll-Free",
    helpline_name_ta: "தேசிய நுகர்வோர் உதவி எண்",
    desc_en: "Guarantees protection against defective goods, deficient services, overcharging, misleading advertisements, and unfair trade practices.",
    desc_ta: "குறைபாடுள்ள பொருட்கள், போலி விளம்பரங்கள் மற்றும் ஏமாற்று வியாபாரத்திற்கு எதிராக ஆன்லைனில் வழக்கு பதிவு செய்து இழப்பீடு பெறும் உரிமை.",
    content_en: "The Consumer Protection Act 2019 gives citizens 6 fundamental consumer rights: Right to Safety, Right to Information, Right to Choose, Right to be Heard, Right to Redressal, and Right to Consumer Education. Consumers can file complaints online through e-Daakhil without hiring a lawyer for claims up to ₹50 lakh at the District Commission.",
    content_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி பொருட்களின் தரம், விலை மற்றும் சேவைகளில் குறைபாடு இருந்தால் வக்கீல் இல்லாமல் இ-தாகீல் (e-Daakhil) தளம் வழியாக ஆன்லைனில் நுகர்வோர் நீதிமன்றத்தில் வழக்கு பதிவு செய்து இழப்பீடு பெறலாம்.",
    verbal_script_en: "Under the Consumer Protection Act 2019, refusing to replace defective goods or charging above the Maximum Retail Price (MRP) constitutes an unfair trade practice. Please process the replacement or refund within 7 days, failing which an online complaint will be filed on e-Daakhil and National Consumer Helpline 1915 claiming punitive compensation for mental harassment.",
    verbal_script_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி, குறைபாடுள்ள பொருளை மாற்ற மறுப்பதோ அல்லது MRP-ஐ விட கூடுதலாக விற்பதோ குற்றமாகும். 7 நாட்களுக்குள் பணத்தை திருப்பித் தராவிடில் தேசிய நுகர்வோர் உதவி எண் 1915 மற்றும் இ-தாகீல் நீதிமன்றத்தில் நஷ்டஈடு கேட்டு வழக்கு பதிவு செய்யப்படும்.",
    department_en: "Civil Supplies and Consumer Protection Dept",
    department_ta: "உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை",
    portal_url: "https://edaakhil.nic.in",
    image_url: "/images/evergreen/rti-rights.jpg",
    key_points_en: [
      "No lawyer required to file consumer court complaints in Tamil Nadu",
      "Online complaint filing via national e-Daakhil portal (edaakhil.nic.in)",
      "Strict Product Liability holds manufacturers directly accountable for defects",
      "National Consumer Helpline toll-free: 1915 (multi-lingual support)"
    ],
    key_points_ta: [
      "நுகர்வோர் நீதிமன்றத்தில் வழக்கு பதிவு செய்ய வழக்கறிஞர் தேவையில்லை",
      "இ-தாகீல் தளம் மூலம் ஆன்லைன் வழக்கு பதிவு (edaakhil.nic.in)",
      "தயாரிப்பு பொறுப்புச் சட்டம் மூலம் உற்பத்தியாளரே நேரடியாகப் பொறுப்பு",
      "தேசிய நுகர்வோர் உதவி எண்: 1915"
    ],
    steps_en: [
      "Preserve proof of purchase (bill, invoice, warranty card, defective item photos)",
      "Send written legal notice to company giving 7 to 15 days to refund/replace",
      "Call 1915 or lodge complaint on consumerhelpline.gov.in",
      "If unresolved, file online complaint on edaakhil.nic.in without hiring an advocate"
    ],
    steps_ta: [
      "வாங்கிய ரசீது, பில், வாரண்டி அட்டை மற்றும் சேதமடைந்த பொருட்களின் படங்களைச் சேகரியுங்கள்",
      "நிறுவனத்திற்கு 7-15 நாட்களில் மாற்றிக் கொடுக்கக் கோரி எழுத்துப்பூர்வ நோட்டீஸ் அனுப்புங்கள்",
      "1915 எண்ணை அழைத்து அல்லது consumerhelpline.gov.in தளத்தில் புகார் பதிவு செய்யுங்கள்",
      "தீர்வு கிடைக்காத பட்சத்தில் edaakhil.nic.in தளத்தில் வக்கீல் இன்றி வழக்கு தொடருங்கள்"
    ],
    faqs: [
      {
        q_en: "Can a shop charge extra 'cooling charges' for water or soft drinks above MRP?",
        q_ta: "குளிர்ந்த பானங்களுக்கு MRP-ஐ விட கூடுதலாக கடைகளில் வசூலிக்கலாமா?",
        a_en: "No. Selling above MRP under the pretext of refrigerator chilling is strictly illegal under Section 18(2) of the Legal Metrology Act and Consumer Protection Act 2019.",
        a_ta: "கூடாது. குளிரூட்டப்பட்டது என்ற பெயரில் MRP விலையை விட கூடுதலாக வசூலிப்பது சட்டப்படி குற்றமாகும்."
      },
      {
        q_en: "Can a shopkeeper refuse returns with a 'Goods once sold cannot be returned' notice?",
        q_ta: "'விற்ற பொருட்கள் திரும்ப பெறப்பட மாட்டாது' என்று போர்டு வைத்தால் பொருள் மாற்றிக் கேட்க முடியாதா?",
        a_en: "No. Such notices are legally void under CPA 2019. If goods are defective, deficient, or expired, the seller is statutorily required to replace or refund.",
        a_ta: "முடியாது. அத்தகைய பலகைகள் சட்டப்படி செல்லாது. பொருளில் குறைபாடு இருந்தால் மாற்றித் தர வேண்டியது விற்பனையாளரின் கடமை."
      }
    ]
  },
  {
    id: "right-police-check",
    slug: "police-vehicle-check-citizen-rights",
    name_en: "Citizen Rights During Police Checks & Detention",
    name_ta: "வாகன சோதனை மற்றும் காவல் விசாரணையில் குடிமக்கள் உரிமைகள்",
    seo_title_en: "Traffic Police Check Rules Tamil Nadu: DigiLocker Laws, Key Seizure & Fines",
    seo_title_ta: "தமிழ்நாடு போலீஸ் வாகன சோதனை விதிகள்: டிஜிலாக்கர் & சாவி பிடுங்கும் சட்டங்கள்",
    seo_desc_en: "Your statutory rights when stopped by Tamil Nadu traffic police: MV Act Rule 139 DigiLocker validity, key seizure ban, Sub-Inspector fine rules & female arrest laws.",
    seo_desc_ta: "தமிழ்நாடு போக்குவரத்து போலீஸ் சோதனையில் உங்கள் உரிமைகள்: டிஜிலாக்கர் செல்லுபடியாகும் விதிகள், சாவி பிடுங்க தடை மற்றும் பெண்கள் கைது பாதுகாப்பு.",
    statutory_section_en: "Central Motor Vehicles Rules Rule 139 & CrPC Sec 46(4), 50, 57",
    statutory_section_ta: "மோட்டார் வாகன விதிகள் Rule 139 & CrPC பிரிவு 46(4), 50, 57",
    timeline_sla_en: "Immediate Document Verification / 24h Magistrate Limit",
    timeline_sla_ta: "உடனடி ஆவண சரிபார்ப்பு / 24 மணி நேரத்திற்குள் நீதிபதி முன் ஆஜர்படுத்துதல்",
    penalty_en: "Physical intimidation or unauthorized key seizure violates Supreme Court guidelines",
    penalty_ta: "வாகனச் சாவியைப் பிடுங்குவது அல்லது தாக்குவது சட்டவிரோத நடவடிக்கை",
    fee_en: "Digital e-Challan only; zero arbitrary cash penalties without receipt",
    fee_ta: "டிஜிட்டல் இ-சலான் ரசீது மட்டுமே; ரசீது இன்றி பணம் கொடுக்கத் தேவையில்லை",
    helpline: "103",
    helpline_name_en: "Traffic Police Control Desk",
    helpline_name_ta: "போக்குவரத்து காவல்துறை உதவி எண்",
    desc_en: "Know your statutory legal rights when stopped by traffic police, during vehicle document inspection, or during police questioning.",
    desc_ta: "வாகன சோதனையின் போதும் காவல் நிலைய விசாரணையின் போதும் குடிமக்களுக்கு உள்ள சட்டப்பூர்வ உரிமைகள் மற்றும் பாதுகாப்பு விதிகள்.",
    content_en: "1. Officers below Sub-Inspector (SI) rank cannot issue fine receipts for major offences. 2. Officers cannot forcefully seize your ignition key or physically assault driver. 3. Electronic copies of Driving License and RC shown on DigiLocker or mParivahan apps are legally valid under MV Act Rule 139. 4. Women cannot be arrested after sunset (6 PM) and before sunrise (6 AM) except in extraordinary circumstances with a female officer present.",
    content_ta: "1. சப்-இன்ஸ்பெக்டர் (SI) நிலைக்குக் கீழ் உள்ள அதிகாரிகள் அபராதம் வசூலிக்க முடியாது. 2. வாகனச் சாவியைப் பிடுங்கவோ உடலளவில் தாக்கவோ அதிகாரம் இல்லை. 3. டிஜிலாக்கர் (DigiLocker) செயலியில் உள்ள உரிமம் மற்றும் ஆர்.சி புத்தகம் சட்டப்பூர்வமாக செல்லுபடியாகும். 4. பெண்களை மாலை 6 மணி முதல் காலை 6 மணி வரை பெண் காவலர் இன்றி கைது செய்ய முடியாது.",
    verbal_script_en: "Sir, under Rule 139 of the Central Motor Vehicles Rules and MoRTH notifications, digital documents displayed on DigiLocker and mParivahan are statutorily recognized as equivalent to original physical papers. Taking away vehicle ignition keys is not authorized under the Motor Vehicles Act. I am ready to pay any valid compounding fine via digital e-Challan to an officer of Sub-Inspector rank or above.",
    verbal_script_ta: "ஐயா, மத்திய மோட்டார் வாகன விதிகள் Rule 139-ன் படி டிஜிலாக்கர் சான்றிதழ்கள் 100% செல்லுபடியாகும். வாகனச் சாவியை பிடுங்குவது விதிகளுக்கு எதிரானது. விதிமீறல் இருப்பின் சப்-இன்ஸ்பெக்டர் அதிகாரி மூலம் டிஜிட்டல் இ-சலான் ரசீது வழங்குங்கள்.",
    department_en: "Home & Tamil Nadu Police Department",
    department_ta: "உள்துறை மற்றும் தமிழ்நாடு காவல்துறை",
    portal_url: "https://eservices.tnpolice.gov.in",
    image_url: "/images/evergreen/rti-rights.jpg",
    key_points_en: [
      "Only Sub-Inspector (SI) rank & above can collect or adjudicate traffic fines",
      "DigiLocker & mParivahan digital DL/RC copies are 100% legally valid",
      "Police key snatching or verbal harassment is unlawful under Supreme Court rulings",
      "Night arrest of women prohibited under CrPC Section 46(4)"
    ],
    key_points_ta: [
      "சப்-இன்ஸ்பெக்டர் (SI) மற்றும் அதற்கு மேற்பட்ட அதிகாரிகளே அபராதம் வசூலிக்க முடியும்",
      "டிஜிலாக்கர் (DigiLocker) டிஜிட்டல் சான்றிதழ்கள் 100% சட்டப்பூர்வமாக செல்லுபடியாகும்",
      "வாகனச் சாவியை பிடுங்குவது சட்டவிரோத நடவடிக்கை",
      "பெண்களை மாலை 6 மணிக்குப் பின் பெண் காவலர் இன்றி கைது செய்யத் தடை"
    ],
    steps_en: [
      "Pull over calmly to the left curb and switch off the engine (keep keys in pocket)",
      "Open verified DigiLocker or mParivahan app on your smartphone",
      "Verify the rank of the officer (look for two stars / SI insignia)",
      "Insist on an official digital e-Challan receipt mentioning the exact offense section"
    ],
    steps_ta: [
      "வாகனத்தை இடதுபுறம் நிறுத்தி என்ஜினை அணையுங்கள் (சாவியை உங்கள் பாக்கெட்டில் வையுங்கள்)",
      "டிஜிலாக்கர் அல்லது mParivahan செயலியில் உள்ள அசல் ஆவணங்களைக் காட்டுங்கள்",
      "அதிகாரியின் பதவியை கவனியுங்கள் (குறைந்தது 2 நட்சத்திரம் உள்ள சப்-இன்ஸ்பெக்டராக இருக்க வேண்டும்)",
      "எப்போதும் விதிமீறல் எண் குறிப்பிடப்பட்ட டிஜிட்டல் இ-சலான் ரசீதை மட்டுமே பெறுங்கள்"
    ],
    faqs: [
      {
        q_en: "Can a traffic constable demand original physical RC or Driving License?",
        q_ta: "காவலர்கள் அசல் ஆர்.சி அல்லது ஓட்டுநர் உரிமத்தைக் கட்டாயம் கேட்க முடியுமா?",
        a_en: "No. Under Central Motor Vehicles Rules Rule 139 and MoRTH notification RT-11036/64/2017, digital documents on DigiLocker and mParivahan have identical legal validity to physical documents.",
        a_ta: "முடியாது. மத்திய மோட்டார் வாகன விதிகள் Rule 139-ன் படி டிஜிலாக்கர் மற்றும் mParivahan டிஜிட்டல் ஆவணங்கள் அசல் ஆவணங்களுக்கு சமமானவை."
      },
      {
        q_en: "Can police confiscate my mobile phone during a traffic stop?",
        q_ta: "வாகன சோதனையின் போது காவலர்கள் உங்கள் செல்போனை பறிமுதல் செய்ய முடியுமா?",
        a_en: "No. Police cannot seize personal mobile phones or demand device passwords during a routine traffic inspection without a formal magistrate order or criminal FIR.",
        a_ta: "முடியாது. சாதாரண வாகன சோதனையின் போது செல்போனை பறிமுதல் செய்யவோ பாஸ்வேர்டு கேட்கவோ அதிகாரம் இல்லை."
      }
    ]
  },
  {
    id: "right-service",
    slug: "right-to-public-services-timebound",
    name_en: "Right to Public Services (Time-Bound Delivery)",
    name_ta: "காலவரையறைக்கு உட்பட்ட அரசுச் சேவை உரிமை",
    seo_title_en: "Tamil Nadu Citizen Charter: Certificate SLAs, Revenue Timelines & CM Cell 1100",
    seo_title_ta: "தமிழ்நாடு குடிமக்கள் சாசனம்: சான்றிதழ் காலக்கெடு & முதல்வர் உதவி எண் 1100",
    seo_desc_en: "Statutory deadlines for government services in Tamil Nadu: 15-day SLA for Income & Community certificates, power connection rules, jamabandi appeals & CM 1100.",
    seo_desc_ta: "தமிழ்நாட்டில் அரசு சேவைகளுக்கான சட்டப்பூர்வ காலக்கெடு: சாதி/வருமான சான்றிதழ் 15 நாள் காலக்கெடு, புதிய மின் இணைப்பு மற்றும் முதல்வர் உதவி எண் 1100.",
    statutory_section_en: "Tamil Nadu Citizen Service Charter Guidelines & Revenue SLAs",
    statutory_section_ta: "தமிழ்நாடு குடிமக்கள் பட்டயம் & வருவாய்த் துறை காலக்கெடு",
    timeline_sla_en: "Income/Community (15 Days), Nativity (7 Days), Power (7-15 Days)",
    timeline_sla_ta: "வருமானம்/சாதி (15 நாட்கள்), இருப்பிடம் (7 நாட்கள்), மின் இணைப்பு (7-15 நாட்கள்)",
    penalty_en: "Collectorate Jamabandi review + Departmental disciplinary record entry",
    penalty_ta: "மாவட்ட ஆட்சியர் குறைதீர் மறுஆய்வு மற்றும் துறை ரீதியான ஒழுங்கு நடவடிக்கை",
    fee_en: "Nominal e-Sevai fee (₹60) only",
    fee_ta: "இ-சேவை மைய நிர்ணயிக்கப்பட்ட அரசு கட்டணம் (₹60) மட்டுமே",
    helpline: "1100",
    helpline_name_en: "Chief Minister's Grievance Cell",
    helpline_name_ta: "முதல்வர் உதவி எண்",
    desc_en: "Guarantees statutory time limits for receiving civic certificates, electricity connections, water taps, and revenue documents.",
    desc_ta: "அரசுச் சான்றிதழ்கள், குடிநீர் மற்றும் மின்சார இணைப்புகளை குறிப்பிட்ட காலக்கெடுவுக்குள் பெறும் உரிமை.",
    content_en: "Under Tamil Nadu Citizen Charter guidelines, government departments must issue certificates within stipulated deadlines: Community/Income Certificate (15 days), Native Certificate (7 days), New Domestic Power Connection (7-15 days), Ration card modification (15 days). If delayed without cause, citizens can file an appeal with the District Collectorate Grievance Officer.",
    content_ta: "அரசு குடிமக்கள் சாசனம் படி: சாதி/வருமான சான்றிதழ் (15 நாட்கள்), இருப்பிட சான்றிதழ் (7 நாட்கள்), புதிய மின் இணைப்பு (7-15 நாட்கள்) மற்றும் ரேஷன் கார்டு மாற்றம் (15 நாட்கள்) காலக்கெடுவுக்குள் வழங்கப்பட வேண்டும். தாமதமானால் ஆட்சியரிடம் மேல்முறையீடு செய்யலாம்.",
    verbal_script_en: "Sir, under the Tamil Nadu Citizen Charter, the statutory timeline for issuing this certificate is 15 working days. My application has been pending for over the statutory limit without any deficiency notice. Please furnish the reason in writing or I will register an appeal with the District Collector and CM Helpline 1100.",
    verbal_script_ta: "அரசு குடிமக்கள் சாசனத்தின்படி இந்த சான்றிதழுக்கான காலக்கெடு 15 நாட்கள் ஆகும். எவ்வித குறைபாடும் சுட்டிக்காட்டப்படாமல் விண்ணப்பம் தாமதப்படுத்தப்பட்டுள்ளது. காரணத்தை எழுத்துப்பூர்வமாகத் தாருங்கள் அல்லது மாவட்ட ஆட்சியர் மற்றும் முதல்வர் உதவி எண் 1100-ல் மேல்முறையீடு செய்வேன்.",
    department_en: "Revenue and Disaster Management Dept",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_url: "https://cmhelpline.tn.gov.in",
    image_url: "/images/evergreen/esevai-guide.jpg",
    key_points_en: [
      "Community & Income Certificate SLA: 15 Working Days",
      "New Domestic Electricity Connection SLA: 7 to 15 Days",
      "Smart Ration Card modification SLA: 15 Working Days",
      "Direct weekly appeal to District Collectorate Grievance Day (every Monday)"
    ],
    key_points_ta: [
      "சாதி மற்றும் வருமான சான்றிதழ் காலக்கெடு: 15 வேலை நாட்கள்",
      "புதிய வீட்டு மின் இணைப்பு காலக்கெடு: 7 முதல் 15 நாட்கள்",
      "ரேஷன் கார்டு திருத்தம் காலக்கெடு: 15 வேலை நாட்கள்",
      "மாவட்ட ஆட்சியரிடம் வாராந்திர மக்கள் குறைதீர் நாளில் நேரடி மேல்முறையீடு"
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
    ],
    faqs: [
      {
        q_en: "What should I do if my VAO or Revenue Inspector keeps my file pending for months?",
        q_ta: "விஏஓ அல்லது வருவாய் ஆய்வாளர் மாதக்கணக்கில் கோப்பை நிலுவையில் வைத்தால் என்ன செய்வது?",
        a_en: "File a petition on CM Helpline 1100 with your application CAN number, or attend the weekly Monday Grievance Day at the District Collectorate where files must be disposed within 30 days.",
        a_ta: "முதல்வர் உதவி எண் 1100-ல் புகார் பதிவு செய்யுங்கள் அல்லது மாவட்ட ஆட்சியர் அலுவலக திங்கட்கிழமை குறைதீர் முகாமில் நேரில் மனு அளியுங்கள்."
      }
    ]
  },
  {
    id: "right-senior-citizen",
    slug: "senior-citizens-maintenance-act-2007",
    name_en: "Maintenance & Rights of Senior Citizens (Act 2007)",
    name_ta: "மூத்த குடிமக்கள் பராமரிப்பு & நல உரிமைகள் 2007",
    seo_title_en: "Senior Citizens Act 2007 Tamil Nadu: RDO Eviction, Property Rights & 14567",
    seo_title_ta: "மூத்த குடிமக்கள் சட்டம் 2007 தமிழ்நாடு: RDO தீர்ப்பாயம் & எல்டர்லைன் 14567",
    seo_desc_en: "Legal protections for elderly parents in Tamil Nadu: Section 23 property gift deed cancellation, 90-day RDO eviction of abusive heirs & Elderline 14567.",
    seo_desc_ta: "தமிழ்நாட்டில் முதியோர்களுக்கான சட்டப் பாதுகாப்பு: தானப் பத்திரத்தை ரத்து செய்யும் பிரிவு 23, 90 நாள் RDO வெளியேற்ற உத்தரவு & உதவி எண் 14567.",
    statutory_section_en: "Sections 4, 9 & 23 Maintenance of Senior Citizens Act 2007",
    statutory_section_ta: "மூத்த குடிமக்கள் பராமரிப்பு சட்டம் பிரிவு 4, 9 & 23",
    timeline_sla_en: "90 Days Summary Disposal by RDO Tribunal",
    timeline_sla_ta: "RDO தீர்ப்பாயம் மூலம் 90 நாட்களில் உடனடி தீர்ப்பு",
    penalty_en: "Cancellation of property gift deeds + Summary eviction of abusive heirs + Jail term",
    penalty_ta: "சொத்து தானப் பத்திரம் ரத்து + ஆக்கிரமித்த பிள்ளைகளை வெளியேற்றுதல் + சிறைத் தண்டனை",
    fee_en: "Zero court fees; free state legal aid available",
    fee_ta: "நீதிமன்ற கட்டணம் இல்லை; இலவச அரசு சட்ட உதவி",
    helpline: "14567",
    helpline_name_en: "Elderline National Toll-Free",
    helpline_name_ta: "முதியோர் தேசிய உதவி எண்",
    desc_en: "Protects elderly citizens from eviction, abandonment, or financial neglect by adult children or legal heirs.",
    desc_ta: "முதியோர்களை பிள்ளைகள் கைவிடுவதில் இருந்தும் சொத்துக்களில் இருந்து வெளியேற்றுவதில் இருந்தும் பாதுகாக்கும் சட்டம்.",
    content_en: "Under the Maintenance and Welfare of Parents and Senior Citizens Act 2007, children or legal heirs are legally obligated to provide a monthly maintenance allowance (up to ₹10,000/month) to elderly parents who cannot maintain themselves. Revenue Divisional Officers (RDO) act as Maintenance Tribunals to order swift eviction of abusive heirs from parent-owned property within 90 days.",
    content_ta: "பெற்றோர்களைப் பராமரிக்காத பிள்ளைகளிடம் இருந்து மாதம் ₹10,000 வரை ஜீவனாம்சம் பெறவும், முதியோரின் சொத்தை ஆக்கிரமிக்கும் பிள்ளைகளை 90 நாட்களில் வெளியேற்றவும் RDO (வருவாய் கோட்டாட்சியர்) மன்றத்திற்கு முழு அதிகாரம் உண்டு.",
    verbal_script_en: "Under Section 23 of the Senior Citizens Act 2007, any transfer of property to children carries the statutory condition of maintaining the parent. If neglected, the Revenue Divisional Officer (RDO) Tribunal has the legal jurisdiction to void the deed and order summary eviction within 90 days. Elderline 14567 coordinates police and revenue relief.",
    verbal_script_ta: "மூத்த குடிமக்கள் நலச் சட்டம் 2007 பிரிவு 23-ன் படி, பெற்றோரை பராமரிக்காத பிள்ளைகளுக்கு வழங்கப்பட்ட சொத்து தானப் பத்திரத்தை ரத்து செய்யவும், 90 நாட்களில் அவர்களை வீட்டை விட்டு வெளியேற்றவும் RDO தீர்ப்பாயத்திற்கு அதிகாரம் உண்டு. எல்டர்லைன் 14567 மூலம் உதவி பெறலாம்.",
    department_en: "Social Welfare and Women Empowerment Dept",
    department_ta: "சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை",
    portal_url: "https://tnsocialwelfare.tn.gov.in",
    image_url: "/images/evergreen/rti-rights.jpg",
    key_points_en: [
      "Elderline National Helpline: 14567 (Free 24x7 Support)",
      "RDO Maintenance Tribunal orders up to ₹10,000/month allowance",
      "Summary eviction of abusive children from senior-owned home in 90 days",
      "Cancellation of property gift deeds under Section 23 if children fail to maintain parents"
    ],
    key_points_ta: [
      "முதியோர் இலவச தேசிய உதவி எண்: 14567 (24x7)",
      "RDO தீர்ப்பாயம் மூலம் மாதம் ₹10,000 வரை ஜீவனாம்ச உத்தரவு",
      "பெற்றோரின் வீட்டை ஆக்கிரமிக்கும் பிள்ளைகளை 90 நாளில் வெளியேற்றும் அதிகாரம்",
      "பராமரிக்காத பிள்ளைகளுக்கு எழுதப்பட்ட சொத்து தானப் பத்திரங்களை பிரிவு 23-ன் கீழ் ரத்து செய்யும் உரிமை"
    ],
    steps_en: [
      "Dial Elderline 14567 for free counseling and field support",
      "File simple petition before the Revenue Divisional Officer (RDO) Maintenance Tribunal",
      "Attach proof of age (Aadhaar/Voter ID) and property ownership deed",
      "Tribunal conducts summary hearing and passes binding eviction/maintenance order within 90 days"
    ],
    steps_ta: [
      "14567 எண்ணை அழைத்து இலவச ஆலோசனையையும் கள உதவிகளையும் பெறுங்கள்",
      "வருவாய் கோட்டாட்சியர் (RDO) தீர்ப்பாயத்தில் எளிய மனு ஒன்றைத் தாக்கல் செய்யுங்கள்",
      "வயது சான்று (ஆதார்/வாக்காளர் அட்டை) மற்றும் சொத்து ஆவணங்களை இணையுங்கள்",
      "RDO தீர்ப்பாயம் இரு தரப்பையும் விசாரித்து 90 நாட்களில் தீர்ப்பு வழங்கும்"
    ],
    faqs: [
      {
        q_en: "Can senior parents cancel a registered gift deed given to their children?",
        q_ta: "பிள்ளைகளுக்கு எழுதி வைத்த சொத்து தானப் பத்திரத்தை பெற்றோர்கள் ரத்து செய்ய முடியுமா?",
        a_en: "Yes. Under Section 23 of the Senior Citizens Act 2007, if children fail to provide basic amenities and physical care, the RDO Tribunal can declare the transfer void as fraud or coercion.",
        a_ta: "ஆம். பிரிவு 23-ன் படி பிள்ளைகள் பராமரிக்கத் தவறினால் தானப் பத்திரத்தை ரத்து செய்து சொத்தை திரும்பப் பெறலாம்."
      }
    ]
  },
  {
    id: "right-pwd",
    slug: "rights-of-persons-with-disabilities-act-2016",
    name_en: "Rights of Persons with Disabilities (RPwD Act 2016)",
    name_ta: "மாற்றுத்திறனாளிகள் உரிமைகள் சட்டம் 2016",
    seo_title_en: "Disability Rights Tamil Nadu: 4% Job Quota, Free Bus Pass & UDID Card Rules",
    seo_title_ta: "தமிழ்நாடு மாற்றுத்திறனாளிகள் உரிமைகள்: 4% இடஒதுக்கீடு & இலவச பேருந்து பாஸ்",
    seo_desc_en: "Comprehensive guide to RPwD Act 2016 in Tamil Nadu: 4% government job reservation, 5% higher education quota, SETC/MTC free bus travel & UDID card.",
    seo_desc_ta: "தமிழ்நாட்டில் மாற்றுத்திறனாளிகள் உரிமைகள் வழிகாட்டி: 4% அரசு வேலை இடஒதுக்கீடு, இலவச பேருந்து பயணம் மற்றும் UDID அடையாள அட்டை.",
    statutory_section_en: "Sections 3, 20 & 34 Rights of Persons with Disabilities Act 2016",
    statutory_section_ta: "மாற்றுத்திறனாளிகள் சட்டம் பிரிவு 3, 20 & 34",
    timeline_sla_en: "UDID Single Window / 4% Public Employment Quota",
    timeline_sla_ta: "சர்வதேச UDID ஒற்றைச் சாளரம் / 4% அரசுப் பணி இடஒதுக்கீடு",
    penalty_en: "Fines up to ₹5 Lakhs and imprisonment for discrimination or atrocities (Sec 89 & 92)",
    penalty_ta: "பாகுபாடு காட்டுபவர்களுக்கு ₹5 லட்சம் வரை அபராதம் மற்றும் சிறை தண்டனை",
    fee_en: "Zero fee for certificates, assistive aids, and transit concessions",
    fee_ta: "சான்றிதழ்கள், உபகரணங்கள் மற்றும் பயண சலுகைகளுக்கு கட்டணம் இல்லை",
    helpline: "1800-425-0111",
    helpline_name_en: "Disability Welfare Toll-Free Helpline",
    helpline_name_ta: "மாற்றுத்திறனாளிகள் நல உதவி எண்",
    desc_en: "Ensures non-discrimination, 4% public employment reservation, accessible public infrastructure, and monthly pension allowances.",
    desc_ta: "மாற்றுத்திறனாளிகளுக்கு 4% அரசு வேலைவாய்ப்பு இடஒதுக்கீடு, கட்டணமில்லா பேருந்து பயணம் மற்றும் சம உரிமைக்கான சட்டம்.",
    content_en: "The RPwD Act 2016 recognizes 21 disabilities and guarantees full equality, barrier-free access in public buildings/transportation, 4% reservation in government jobs, 5% reservation in higher educational institutions, and statutory monthly maintenance allowance under Tamil Nadu Differently Abled Welfare Board.",
    content_ta: "மாற்றுத்திறனாளிகள் நலச் சட்டம் 2016 படி 21 வகையான மாற்றுத்திறன்களுக்கு அரசுப் பணியிடங்களில் 4% இடஒதுக்கீடு, உயர்கல்வியில் 5% இடஒதுக்கீடு, கட்டணமில்லா அரசு பேருந்து பயணம் மற்றும் மாதாந்திர பராமரிப்பு உதவித்தொகை வழங்கப்படுகிறது.",
    verbal_script_en: "Under Section 3 and 20 of the RPwD Act 2016, no government or private establishment can discriminate against a person with disability. State transport corporations are statutorily bound to honor verified disability passes.",
    verbal_script_ta: "RPwD சட்டம் 2016 பிரிவு 3 மற்றும் 20-ன் படி மாற்றுத்திறனாளிகளுக்கு எதிராக எந்த நிறுவனமும் பாகுபாடு காட்ட முடியாது. அரசுப் பேருந்துகளில் கட்டணமில்லா இலவச பயண பாஸ் சட்டப்பூர்வ உரிமையாகும்.",
    department_en: "Welfare of Differently Abled Persons Dept",
    department_ta: "மாற்றுத்திறனாளிகள் நலத் துறை",
    portal_url: "https://www.scda.tn.gov.in",
    image_url: "/images/evergreen/rti-rights.jpg",
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
    ],
    steps_en: [
      "Register on swavlambancard.gov.in or at District Disability Welfare Office",
      "Undergo medical assessment at Government District Headquarters Hospital",
      "Download certified UDID Smart Card with QR code",
      "Apply for free transport concession and assistive devices at District Welfare Office"
    ],
    steps_ta: [
      "swavlambancard.gov.in தளம் வழியாக அல்லது மாவட்ட மாற்றுத்திறனாளிகள் நல அலுவலகத்தில் பதிவு செய்யுங்கள்",
      "அரசு மாவட்ட தலைமை மருத்துவமனையில் மருத்துவக் குழு பரிசோதனையில் பங்கேற்கவும்",
      "டிஜிட்டல் பார்கோடு கொண்ட நிரந்தர UDID ஸ்மார்ட் அட்டையைப் பெறுங்கள்",
      "இலவச பேருந்து பாஸ் மற்றும் உபகரணங்களுக்கு விண்ணப்பியுங்கள்"
    ],
    faqs: [
      {
        q_en: "Is the UDID Card mandatory for free bus travel in Tamil Nadu?",
        q_ta: "தமிழ்நாட்டில் இலவச பேருந்து பயணத்திற்கு UDID அட்டை கட்டாயமா?",
        a_en: "Yes. The UDID card or state disability pass issued by the District Differently Abled Welfare Officer entitles the holder (and an escort where certified) to free travel in ordinary town buses.",
        a_ta: "ஆம். UDID அட்டை அல்லது மாவட்ட நல அலுவலர் வழங்கிய சான்றிதழ் மூலம் இலவச பேருந்து பயண சலுகையைப் பெறலாம்."
      }
    ]
  },
  {
    id: "right-domestic-violence",
    slug: "protection-of-women-from-domestic-violence-act",
    name_en: "Protection of Women from Domestic Violence Act 2005",
    name_ta: "குடும்ப வன்முறை தடுப்புச் சட்ட உரிமைகள் 2005",
    seo_title_en: "Domestic Violence Act 2005 Tamil Nadu: 181 Helpline, Residence Orders & Rights",
    seo_title_ta: "குடும்ப வன்முறை தடுப்புச் சட்டம் தமிழ்நாடு: 181 உதவி எண் & தங்கும் உரிமை",
    seo_desc_en: "Women legal protections in Tamil Nadu under PWDVA 2005: 181 helpline, residence stay orders, zero court fees & free protection officers in all 38 districts.",
    seo_desc_ta: "தமிழ்நாட்டில் பெண்களுக்கு குடும்ப வன்முறை தடுப்புச் சட்ட உரிமைகள்: 181 உதவி எண், தங்கும் உரிமை, இலவச வழக்கறிஞர் மற்றும் பாதுகாப்பு அதிகாரிகள்.",
    statutory_section_en: "Sections 12, 17, 18, 19 & 20 PWDVA 2005",
    statutory_section_ta: "குடும்ப வன்முறை தடுப்புச் சட்டம் பிரிவு 12, 17, 18 & 20",
    timeline_sla_en: "3-Day First Court Hearing / 60-Day Case Disposal",
    timeline_sla_ta: "3 நாட்களில் முதல் நீதிமன்ற விசாரணை / 60 நாட்களில் இறுதித் தீர்ப்பு",
    penalty_en: "Non-bailable arrest and up to 1 year imprisonment for breach of protection order (Sec 31)",
    penalty_ta: "நீதிமன்ற பாதுகாப்பு உத்தரவை மீறினால் பிணையில் வர முடியாத கைது மற்றும் 1 ஆண்டு சிறை",
    fee_en: "Zero court fees; free legal aid advocate assigned by DLSA",
    fee_ta: "நீதிமன்ற கட்டணம் இல்லை; இலவச அரசு சட்ட உதவி வழக்கறிஞர் நியமனம்",
    helpline: "181",
    helpline_name_en: "Women Crisis 24x7 Toll-Free Helpline",
    helpline_name_ta: "பெண்கள் அவசர உதவி எண்",
    desc_en: "Protects women from physical, verbal, emotional, economic, and sexual abuse within shared domestic households.",
    desc_ta: "பெண்களுக்கு எதிராக குடும்பத்தில் நடக்கும் உடலளவிலான, வார்த்தை மற்றும் பொருளாதார வன்முறைகளுக்கு எதிரான சட்டப் பாதுகாப்பு.",
    content_en: "Under PWDVA 2005, any woman suffering abuse from spouse or relatives in a shared household can file for instant Protection Orders, Residence Orders, Compensation Orders, and interim maintenance without paying court fees. Protection Officers and Social Welfare Officers in every district provide free legal representation and emergency shelter.",
    content_ta: "குடும்ப வன்முறை தடுப்புச் சட்டம் 2005 படி பாதிக்கப்பட்ட பெண்கள் பாதுகாப்பு அதிகாரி மூலம் இலவசமாக நீதிமன்ற பாதுகாப்பு உத்தரவு, தங்குமிடம் மற்றும் இடைக்கால பராமரிப்புச் செலவு பெறலாம்.",
    verbal_script_en: "Under Section 17 of PWDVA 2005, every woman has the statutory right to reside in the shared household regardless of property title. Denying maintenance or inflicting verbal and physical abuse triggers non-bailable arrest under Section 31. Calling 181 connects to the District Protection Officer immediately.",
    verbal_script_ta: "குடும்ப வன்முறை தடுப்புச் சட்டம் பிரிவு 17-ன் படி வீட்டின் உரிமை யாரிடம் இருந்தாலும் பெண்ணுக்கு அந்த வீட்டில் தங்கி வாழும் முழு சட்ட உரிமை உண்டு. துன்புறுத்துவது பிணையில் வர முடியாத குற்றமாகும். 181 மூலம் உடனடி பாதுகாப்பு பெறலாம்.",
    department_en: "Social Welfare and Women Empowerment Dept",
    department_ta: "சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை",
    portal_url: "https://tnsocialwelfare.tn.gov.in",
    image_url: "/images/evergreen/rti-rights.jpg",
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
    ],
    steps_en: [
      "Dial 181 or contact the nearest District Social Welfare Office",
      "Protection Officer records Domestic Incident Report (DIR) without fee",
      "Magistrate issues interim ex-parte protection order within 3 days",
      "Police escort and shelter home provided if life is threatened"
    ],
    steps_ta: [
      "181 எண்ணை அழையுங்கள் அல்லது மாவட்ட சமூக நல அலுவலகத்தை அணுகுங்கள்",
      "பாதுகாப்பு அதிகாரி கட்டணமின்றி உள்நாட்டு சம்பவ அறிக்கையை (DIR) பதிவு செய்வார்",
      "நீதிமன்றம் 3 நாட்களுக்குள் இடைக்கால பாதுகாப்பு உத்தரவு பிறப்பிக்கும்",
      "உயிருக்கு அச்சுறுத்தல் இருப்பின் அரசு காப்பகம் மற்றும் காவல் பாதுகாப்பு அளிக்கப்படும்"
    ],
    faqs: [
      {
        q_en: "Can a husband or in-laws evict a woman from the matrimonial home?",
        q_ta: "கணவர் அல்லது மாமியார் மருமகளை வீட்டை விட்டு வெளியேற்ற முடியுமா?",
        a_en: "No. Under Section 17 of PWDVA, a woman has the statutory right to reside in the shared household and cannot be evicted except in accordance with the procedure established by law.",
        a_ta: "முடியாது. பிரிவு 17-ன் படி பெண்ணுக்கு குடும்ப வீட்டில் வசிக்கும் உரிமை உண்டு; அவரை வீட்டை விட்டு வெளியேற்ற முடியாது."
      }
    ]
  },
  {
    id: "right-labor-minimum-wage",
    slug: "right-to-fair-wages-tn-shops-act",
    name_en: "Right to Fair Minimum Wages & Working Conditions",
    name_ta: "குறைந்தபட்ச கூலி & தொழிலாளர் பாதுகாப்பு உரிமைகள்",
    seo_title_en: "Tamil Nadu Labor Rights: 8-Hour Work Limit, Double Overtime & Shops Act",
    seo_title_ta: "தமிழ்நாடு தொழிலாளர் உரிமைகள்: 8 மணி நேர வரம்பு & இரட்டிப்பு கூடுதல் ஊதியம்",
    seo_desc_en: "Private sector worker protections in Tamil Nadu: 8-hour workday cap, double overtime pay under TN Shops & Establishments Act, weekly paid holiday & 155214.",
    seo_desc_ta: "தமிழ்நாட்டில் தொழிலாளர் சட்டப் பாதுகாப்பு: நாளுக்கு 8 மணி நேர வேலை, கூடுதல் நேரத்திற்கு இரட்டிப்பு ஊதியம் மற்றும் தொழிலாளர் உதவி எண் 155214.",
    statutory_section_en: "Sections 7, 9 & 11 Tamil Nadu Shops and Establishments Act 1947",
    statutory_section_ta: "தமிழ்நாடு கடைகள் மற்றும் நிறுவனங்கள் சட்டம் பிரிவு 7, 9 & 11",
    timeline_sla_en: "8 Hours/Day Work Cap / Double Overtime Pay",
    timeline_sla_ta: "நாள் ஒன்றுக்கு 8 மணி நேர வரம்பு / கூடுதல் நேரத்திற்கு இரட்டிப்பு ஊதியம்",
    penalty_en: "Employer prosecution, business closure notice, and recovery of unpaid dues",
    penalty_ta: "தொழிலாளர் துறை மூலம் நிறுவனத்தின் மீது வழக்கு, அபராதம் மற்றும் நிலுவைத் தொகை மீட்பு",
    fee_en: "Zero fee to file grievance before Assistant Commissioner of Labour",
    fee_ta: "தொழிலாளர் உதவி ஆணையரிடம் புகார் அளிக்க கட்டணம் தேவையில்லை",
    helpline: "155214",
    helpline_name_en: "Labour Department Helpline",
    helpline_name_ta: "தொழிலாளர் துறை உதவி எண்",
    desc_en: "Guarantees statutory minimum wages, mandatory weekly rest, double overtime pay, and safe working conditions for all private sector employees.",
    desc_ta: "தனியார் துறை ஊழியர்களுக்கான குறைந்தபட்ச கூலி, வாராந்திர விடுமுறை மற்றும் கூடுதல் வேலை நேரத்திற்கான இரட்டிப்பு ஊதிய உரிமை.",
    content_en: "Under the Tamil Nadu Shops and Establishments Act and Minimum Wages Act, no employer can demand working hours beyond 8 hours/day (48 hours/week) without paying double overtime wages. Employers must grant 1 mandatory weekly paid holiday, 12 casual leaves, 12 sick leaves, and equal remuneration for men and women doing equal work.",
    content_ta: "தமிழ்நாடு கடைகள் மற்றும் நிறுவனங்கள் சட்டத்தின்படி தொழிலாளர்களுக்கு நாள் ஒன்றுக்கு 8 மணி நேர வேலை, கூடுதல் நேரத்திற்கு இரட்டிப்பு ஊதியம், வாரத்தில் ஒரு நாள் கட்டாய ஊதியத்துடன் கூடிய விடுமுறை மற்றும் மகப்பேறு கால விடுப்பு வழங்கப்பட வேண்டும்.",
    verbal_script_en: "Under Section 9 of the Tamil Nadu Shops and Establishments Act, any hour worked beyond 8 hours a day requires overtime wages at double the ordinary wage rate. Depriving weekly paid holidays or withholding minimum wages violates statutory labour laws enforceable by the Inspector of Labour.",
    verbal_script_ta: "தமிழ்நாடு கடைகள் மற்றும் நிறுவனங்கள் சட்டம் பிரிவு 9-ன் படி, நாள் ஒன்றுக்கு 8 மணி நேரத்திற்கு மேல் பணிபுரிந்தால் இரட்டிப்பு கூடுதல் நேர ஊதியம் வழங்கப்பட வேண்டும். இதனை மீறுவது தொழிலாளர் நல சட்டப்படி குற்றமாகும்.",
    department_en: "Labour Welfare and Skill Development Dept",
    department_ta: "தொழிலாளர் நலன் மற்றும் திறன் மேம்பாட்டுத் துறை",
    portal_url: "https://labour.tn.gov.in",
    image_url: "/images/evergreen/rti-rights.jpg",
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
    ],
    steps_en: [
      "Maintain personal attendance and punch-in/out records with payslips",
      "Submit written request to employer calculating unpaid overtime hours",
      "Lodge grievance on labour.tn.gov.in portal or dial 155214",
      "File claim petition before the Assistant Commissioner of Labour (Payment of Wages)"
    ],
    steps_ta: [
      "பணி நேரம், மின்னஞ்சல்கள் மற்றும் சம்பள ரசீதுகளை தனிப்பட்ட முறையில் சேகரித்து வையுங்கள்",
      "கூடுதல் நேர ஊதியத்தைக் கணக்கிட்டு வழங்க நிர்வாகத்திற்கு எழுத்துப்பூர்வமாக மனு அளியுங்கள்",
      "மறுக்கப்பட்டால் labour.tn.gov.in தளத்தில் தொழிலாளர் துறையிடம் புகார் அளியுங்கள்",
      "தொழிலாளர் உதவி ஆணையரிடம் நிலுவைத் தொகையை மீட்க மனு தாக்கல் செய்யுங்கள்"
    ],
    faqs: [
      {
        q_en: "Can a private IT or retail company compel employees to work 12 hours without overtime pay?",
        q_ta: "தனியார் ஐடி அல்லது வணிக நிறுவனங்கள் கூடுதல் ஊதியம் இன்றி 12 மணி நேரம் வேலை வாங்க முடியுமா?",
        a_en: "No. The statutory daily maximum is 8 hours. Any additional hour worked must be paid at double the ordinary rate of wages under Section 9 of the TN Shops Act.",
        a_ta: "முடியாது. சட்டப்பூர்வ வேலை வரம்பு 8 மணி நேரம் மட்டுமே. அதற்கு மேல் பணிபுரிந்தால் இரட்டிப்பு ஊதியம் வழங்கப்பட வேண்டும்."
      }
    ]
  }
];

export const getRightBySlug = (slug) => {
  return getAllRights().find(r => r.slug === slug || r.id === slug);
};

// Search all awareness content
export const searchAwarenessContent = (query) => {
  const guides = getAllGuides().filter(g => 
    g.title_en.toLowerCase().includes(query.toLowerCase()) || 
    g.title_ta.toLowerCase().includes(query.toLowerCase())
  );
  
  const faqs = getAllFaqs().filter(f => 
    f.question_en.toLowerCase().includes(query.toLowerCase()) || 
    f.question_ta.toLowerCase().includes(query.toLowerCase())
  );
  
  const schemes = getAllSchemes().filter(s => 
    s.name_en.toLowerCase().includes(query.toLowerCase()) || 
    s.name_ta.toLowerCase().includes(query.toLowerCase())
  );
  
  const portals = getAllPortals().filter(p => 
    p.name_en.toLowerCase().includes(query.toLowerCase()) || 
    p.name_ta.toLowerCase().includes(query.toLowerCase())
  );
  
  const rights = getAllRights().filter(r =>
    r.name_en.toLowerCase().includes(query.toLowerCase()) ||
    r.name_ta.toLowerCase().includes(query.toLowerCase())
  );
  
  const emergencyContacts = getAllEmergencyContacts().filter(e =>
    e.name_en.toLowerCase().includes(query.toLowerCase()) ||
    e.name_ta.toLowerCase().includes(query.toLowerCase()) ||
    e.number.includes(query)
  );
  
  return { guides, faqs, schemes, portals, emergencyContacts, rights };
};

// All awareness articles with slugs
export const getAllArticles = () => [
  {
    id: "art-esevai-guide",
    slug: "tamil-nadu-esevai-online-services-guide",
    title_en: "Complete Guide to Tamil Nadu e-Sevai Online Services & Certificate Applications",
    title_ta: "தமிழ்நாடு இ-சேவை சான்றிதழ்கள் ஆன்லைனில் பெறுவது எப்படி? முழு வழிகாட்டி",
    category_en: "Government Services",
    category_ta: "அரசு சேவைகள்",
    image_url: "/images/evergreen/esevai-guide.jpg",
    readTime: "5 min read",
    date: "Aug 15, 2026",
    summary_en: "Learn how to apply for Community, Income, Native Residence, and First Graduate certificates online via TNEGA e-Sevai without middleman fees.",
    summary_ta: "இடத்தரகர்கள் இன்றி சாதி, வருமானம், இருப்பிடம் மற்றும் முதல் பட்டதாரி சான்றிதழ்களை ஆன்லைனில் விண்ணப்பிக்கும் முறை.",
    content_en: `Tamil Nadu e-Governance Agency (TNEGA) provides over 150 government-to-citizen (G2C) services online via the official portal tnesevai.tn.gov.in. Citizens no longer need to stand in long queues or pay middleman fees at government offices.

### Essential Certificates Available via e-Sevai:
1. **Community Certificate (சாதிச் சான்றிதழ்)**: Mandatory proof of caste category (BC/MBC/SC/ST) required for school admissions, college entrance exams, and government job reservations.
2. **Income Certificate (வருமானச் சான்றிதழ்)**: Documents annual family income from all sources. Essential for applying to government scholarships, fee concessions, and welfare schemes.
3. **Nativity & Residence Certificate (இருப்பிட சான்றிதழ்)**: Verifies continuous residence in Tamil Nadu. Required for state-quota medical and engineering admissions (TNEA/NEET).
4. **First Graduate Certificate (முதல் பட்டதாரி சான்றிதழ்)**: Provides tuition fee waivers in professional degree courses for students who are the first in their family to attend college.
5. **Patta & Chitta Extracts (பட்டா & சிட்டா)**: Land ownership records issued by the Revenue Department.

### Step-by-Step Application Procedure:
- **Step 1: Citizen Access Number (CAN) Registration**: Visit tnesevai.tn.gov.in and click "Citizen Login". Register your CAN number using your 12-digit Aadhaar Card number, full name, and mobile number.
- **Step 2: Select Service**: Under the Revenue Department tab, select the required certificate (e.g. Income Certificate REV-103).
- **Step 3: Document Upload**: Upload self-attested digital copies (PDF/JPEG) of your Aadhaar Card, Smart Ration Card, applicant photograph, and self-declaration form.
- **Step 4: Online Fee Payment**: Pay the prescribed processing fee of ₹60 using UPI, Netbanking, or Debit Card. Save the generated acknowledgement receipt number (TN-72023X).
- **Step 5: Official Verification**: Your application is routed digitally to the Village Administrative Officer (VAO), Revenue Inspector (RI), and Tahsildar for field verification.
- **Step 6: Digital Certificate Download**: Once approved (typically 7 to 15 working days), download the digitally signed certificate equipped with a secure QR code directly from the e-Sevai portal.`,
    content_ta: `தமிழ்நாடு மின் ஆளுமை முகமை (TNEGA) tnesevai.tn.gov.in தளம் மூலம் 150க்கும் மேற்பட்ட அரசு சேவைகளை இணையவழியில் வழங்குகிறது.

### ஆன்லைனில் பெறக்கூடிய முக்கிய சான்றிதழ்கள்:
1. **சாதிச் சான்றிதழ் (Community Certificate)**: பள்ளி, கல்லூரி சேர்க்கை மற்றும் அரசு வேலைவாய்ப்பு இடஒதுக்கீட்டிற்கு அத்தியாவசியமானது.
2. **வருமானச் சான்றிதழ் (Income Certificate)**: குடும்பத்தின் மொத்த ஆண்டு வருமானத்தைச் சான்றளிக்கும் ஆவணம். கல்வி உதவித்தொகைகளுக்கு கட்டாயம்.
3. **இருப்பிடச் சான்றிதழ் (Nativity Certificate)**: தமிழ்நாட்டில் நிரந்தரமாக வசிப்பதை உறுதிசெய்யும் ஆவணம். TNEA / NEET கல்லூரி சேர்க்கைக்கு தேவை.
4. **முதல் பட்டதாரி சான்றிதழ் (First Graduate Certificate)**: குடும்பத்தில் முதல் தலைமுறை பட்டதாரிக்கு தொழில்முறை கல்லூரிகளில் கல்விக் கட்டண விலக்கு பெற உதவும்.
5. **பட்டா & சிட்டா நகல்கள்**: நில உரிமை குறித்த வருவாய்த் துறை ஆவணங்கள்.

### விண்ணப்பிக்கும் படிநிலைகள்:
- **படி 1: CAN எண் பதிவு**: tnesevai.tn.gov.in தளத்திற்குச் சென்று உங்கள் 12 இலக்க ஆதார் எண் மற்றும் மொபைல் எண்ணை இணைத்து CAN (Citizen Access Number) கணக்கை உருவாக்கவும்.
- **படி 2: சேவையைத் தேர்வு செய்தல்**: வருவாய்த் துறை பட்டியலில் தேவையான சான்றிதழைத் தேர்ந்தெடுக்கவும்.
- **படி 3: ஆவணங்கள் பதிவேற்றம்**: ஆதார், குடும்ப அட்டை, புகைப்படம் மற்றும் சுய பிரகடனப் படிவத்தைப் பதிவேற்றவும்.
- **படி 4: ஆன்லைன் கட்டணம்**: ₹60 விண்ணப்பக் கட்டணத்தை UPI அல்லது Netbanking மூலம் செலுத்தி ஒப்புகை ரசீதைப் பெறவும்.
- **படி 5: அரசு அதிகாரி ஆய்வு**: VAO (கிராம நிர்வாக அதிகாரி), வருவாய் ஆய்வாளர் (RI) மற்றும் தாசில்தார் டிஜிட்டல் சரிபார்ப்பு செய்வார்கள்.
- **படி 6: சான்றிதழ் பதிவிறக்கம்**: 7 முதல் 15 வேலை நாட்களுக்குள் QR குறியீட்டுடன் கூடிய டிஜிட்டல் சான்றிதழைப் பதிவிறக்கலாம்.`
  },
  {
    id: "art-rti-guide",
    slug: "how-to-file-rti-application-tamil-nadu-guide",
    title_en: "How to File an Effective RTI Application in Tamil Nadu: Laws, Fees & Appeal Workflow",
    title_ta: "தமிழ்நாட்டில் தகவல் அறியும் உரிமைச் சட்டத்தில் (RTI) விண்ணப்பிப்பது எப்படி?",
    category_en: "Citizen Rights",
    category_ta: "குடிமக்கள் உரிமைகள்",
    image_url: "/images/evergreen/rti-rights.jpg",
    readTime: "7 min read",
    date: "Aug 15, 2026",
    summary_en: "Step-by-step instructions on drafting RTI queries, identifying Public Information Officers (PIO), court fee stamps, and 30-day first appeal process.",
    summary_ta: "அரசுத் துறைகளிடம் இருந்து RTI மூலம் தகவல்களைப் பெற கேட்க வேண்டிய கேள்விகள் மற்றும் மேல்முறையீடு நடைமுறைகள்.",
    content_en: `The Right to Information (RTI) Act 2005 is one of the most powerful legal instruments available to Indian citizens to demand transparency, inspect government files, and question administrative inaction.

### What Information Can You Request Under RTI?
- Details of road relaying tender amounts, contractor names, and quality audit reports.
- Status and reasons for delay in issuing certificates, pensions, or utility connections.
- Certified copies of government orders, municipal resolutions, and budget allocations.
- Attendance registers and duty charts of public officials in local offices.

### How to Draft a Powerful RTI Application:
- **Address the Correct Authority**: Address the application to the "Public Information Officer (PIO)" of the specific department (e.g., Greater Chennai Corporation / Highways Department / TANGEDCO).
- **Ask Precise Questions**: Frame clear, specific questions starting with "What", "When", "How much", or "Provide certified copy of...". Avoid asking for opinions or hypothetical situations.
- **Application Fee**: Attach a ₹10 Court Fee Stamp or Postal Order / Demand Draft payable to the PIO. Below-Poverty-Line (BPL) card holders are exempt from fees.
- **Online Option**: Submit applications online directly at rtionline.tn.gov.in.

### Statutory Timelines & First Appeal:
- **30-Day Mandatory Window**: The PIO MUST provide written information within 30 calendar days (48 hours if life or personal liberty is concerned).
- **First Appeal Process**: If information is denied, incomplete, misleading, or delayed beyond 30 days, file a First Appeal to the "First Appellate Authority (FAA)" (Head of Office) within 30 days. No fee is required for the first appeal.`,
    content_ta: `தகவல் அறியும் உரிமைச் சட்டம் 2005 மூலம் அரசுத் துறைகளிடம் கேள்விகள் கேட்டு 30 நாட்களுக்குள் பதில் பெறலாம்.

### RTI விண்ணப்பிக்கும் முறை:
- **தெளிவான கேள்விகள்**: சாலைப் பணிகள், நிதி ஒதுக்கீடு அல்லது சான்றிதழ் தாமதத்திற்கான காரணங்களைக் குறிப்பிட்டுக் கேட்கவும்.
- **கட்டணம்**: ₹10 நீதிமன்ற முத்திரை ஒட்டி பொதுத் தகவல் அதிகாரிக்கு (PIO) அனுப்ப வேண்டும்.
- **ஆன்லைன் விண்ணப்பம்**: rtionline.tn.gov.in தளம் மூலம் ஆன்லைனிலும் விண்ணப்பிக்கலாம்.

### காலக்கெடு & மேல்முறையீடு:
- **பதில் காலக்கெடு**: 30 நாட்கள் கட்டாயம்.
- **முதல் மேல்முறையீடு**: 30 நாளில் பதில் வராவிட்டால் 30 நாட்களுக்குள் துறைத் தலைவரிடம் முதல் மேல்முறையீடு செய்யலாம்.`
  },
  {
    id: "art-cmchis-claims",
    slug: "cmchis-health-insurance-coverage-hospital-guide",
    image_url: "/images/evergreen/cmchis-health.jpg",
    title_en: "Understanding CMCHIS Health Insurance Coverage, Hospital Network & Cashless Claims",
    title_ta: "முதலமைச்சர் விரிவான காப்பீட்டுத் திட்டத்தில் ₹5 லட்சம் இலவச சிகிச்சை பெறுவது எப்படி?",
    category_en: "Health & Insurance",
    category_ta: "சுகாதாரம் & காப்பீடு",
    readTime: "6 min read",
    date: "Aug 15, 2026",
    summary_en: "Complete overview of medical procedures, cashless hospital admission workflow across 1,150+ hospitals, and 1800-425-3993 helpline.",
    summary_ta: "முதலமைச்சர் காப்பீட்டு அட்டையைப் பயன்படுத்தி 1,150க்கும் மேற்பட்ட அரசு மற்றும் தனியார் மருத்துவமனைகளில் பணமில்லா சிகிச்சை பெறும் முறை.",
    content_en: `The Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS) provides cashless medical and surgical treatment up to ₹5,00,000 per family per year across 1,150+ government and private empanelled hospitals in Tamil Nadu.

### Eligibility Criteria:
- Families listed on a valid Tamil Nadu Smart Ration Card with annual income below ₹1,20,000 per annum.
- Sri Lankan refugee families residing in camps across Tamil Nadu.
- Orphaned children and destitute women identified by social welfare boards.

### Coverage & Medical Procedures:
- Covers 1,500+ specialized medical procedures, open-heart surgeries, organ transplants, cancer chemotherapy/radiation, and neurological care.
- Includes pre-hospitalization diagnostic tests, inpatient stay, medicines, ICU care, and post-discharge follow-up care for 10 days.

### Hospital Admission & Cashless Claim Workflow:
- **Step 1**: Visit any empanelled hospital (list available on cmchis.com).
- **Step 2**: Approach the dedicated "CMCHIS Kiosk" at the hospital entrance and present your CMCHIS Card and Smart Ration Card.
- **Step 3**: The Hospital Insurance Liaison Officer checks your policy status and submits a digital pre-authorization request to United India Insurance Co.
- **Step 4**: Upon digital approval (usually within 2-4 hours), cashless admission is granted. Patients do NOT need to pay cash deposits.
- **Emergency Helpline**: Call 1800-425-3993 (24x7 Toll-Free) if any private hospital refuses admission or demands illegal cash payments.`,
    content_ta: `முதலமைச்சர் காப்பீட்டுத் திட்டம் மூலம் குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வரை 1,150க்கும் மேற்பட்ட மருத்துவமனைகளில் கட்டணமில்லா சிகிச்சை பெறலாம்.

### தகுதி & அட்டை விவரங்கள்:
- ஆண்டு வருமானம் ₹1.20 லட்சத்திற்குள் உள்ள செல்லுபடியாகும் குடும்ப அட்டை.
- cmchis.com தளத்தில் ரேஷன் கார்டு எண் மூலம் காப்பீட்டு அட்டையைப் பதிவிறக்கலாம்.

### மருத்துவமனை அனுமதி முறை:
- அங்கீகரிக்கப்பட்ட மருத்துவமனையில் உள்ள காப்பீட்டு மையத்தில் ரேஷன் கார்டு மற்றும் காப்பீட்டு அட்டையைக் காட்டவும்.
- காப்பீட்டு அதிகாரி நேரடி முன்-அனுமதி பெற்றுத் தருவார்.
- நோயாளிக்கு முற்றிலும் இலவசமாக பணமில்லா சிகிச்சை வழங்கப்படும்.
- உதவி எண்: 1800-425-3993.`
  },
  {
    id: "art-land-records",
    slug: "patta-chitta-fmb-ec-land-records-guide-tamil-nadu",
    title_en: "Patta, Chitta, FMB Sketch & EC Demystified for Property Owners in TN",
    title_ta: "பட்டா, சிட்டா, வரைபடம் (FMB) மற்றும் வில்லங்கச் சான்றிதழ் (EC) — நில ஆவணங்களின் முழு விளக்கம்",
    category_en: "Property & Revenue",
    category_ta: "சொத்து & வருவாய்",
    image_url: "/images/evergreen/esevai-guide.jpg",
    readTime: "8 min read",
    date: "Aug 15, 2026",
    summary_en: "Essential guide explaining land revenue terminology in Tamil Nadu, online verification steps, and avoiding property registration scams.",
    summary_ta: "தமிழ்நாட்டில் நிலம் வாங்கும் போது சரிபார்க்க வேண்டிய பட்டா, சிட்டா, வில்லங்கச் சான்றிதழ் மற்றும் FMB வரைபடங்களின் முக்கியத்துவம்.",
    content_en: `Buying real estate or verifying land ownership in Tamil Nadu requires a deep understanding of four key revenue and registration documents. Verifying these documents online prevents land encroachment and title fraud.

### 1. Patta (பட்டா):
Patta is the legal land title document issued by the Tahsildar (Revenue Department). It confirms the legal owner's name, survey number, sub-division number, district, taluk, village, and exact land area measurements. You can verify and download digital Patta online at eservices.tn.gov.in/eservicesweb.

### 2. Chitta (சிட்டா):
Chitta is a revenue record maintained by the Village Administrative Officer (VAO) that details land classification (Nanjai wetland / Punjai dryland), soil type, crop cultivated, and revenue tax assessed on the property.

### 3. FMB Sketch (Field Measurement Book - வரைபடம்):
FMB is a survey map maintained by the Survey and Land Records Department showing the exact physical dimensions, boundaries, sub-divisions, and adjoining plots for a given survey number. It is critical for physical site inspection before purchasing land.

### 4. Encumbrance Certificate (EC - வில்லங்கச் சான்றிதழ்):
EC is issued by the Sub-Registrar Office (tnreginet.gov.in). It records all registered transactions (sales, mortgages, gifts, court attachments, bank loans) conducted on a property over a chosen period (e.g. past 30 years). A "Nil Encumbrance Certificate" confirms the land is free from legal disputes and unpaid bank loans.`,
    content_ta: `தமிழ்நாட்டில் நிலம் வாங்கும் போது 4 சட்டப்பூர்வ ஆவணங்களை சரிபார்ப்பது கட்டாயம்:

1. **பட்டா (Patta)**: வட்டாட்சியர் வழங்கும் நில உரிமை ஆவணம். eservices.tn.gov.in தளத்தில் சரிபார்க்கலாம்.
2. **சிட்டா (Chitta)**: நிலத்தின் வகைப்பாடு (நஞ்சை/புஞ்சை) மற்றும் வரி விவரங்கள் கொண்ட ஆவணம்.
3. **FMB வரைபடம்**: நிலத்தின் துல்லியமான எல்லை அளவுகள் மற்றும் சர்வே எண்களைக் காட்டும் வரைபடம்.
4. **வில்லங்கச் சான்றிதழ் (EC)**: நிலத்தில் சொத்துக் கடனோ, வழக்குகளோ இல்லை என்பதை உறுதிசெய்யும் TNREGINET பதிவுச் சான்று.`
  },
  {
    id: "art-traffic-police-rights",
    slug: "traffic-police-vehicle-check-citizen-rights-guide",
    title_en: "Legal Protections & Citizen Rights During Traffic Police Vehicle Checks in TN",
    title_ta: "வாகன சோதனையின் போது காவல்துறையிடம் ஓட்டுநர்களுக்கு உள்ள சட்டப்பூர்வ உரிமைகள்",
    category_en: "Traffic & Legal Rights",
    category_ta: "போக்குவரத்து & சட்ட உரிமை",
    image_url: "/images/evergreen/rti-rights.jpg",
    readTime: "5 min read",
    date: "Aug 15, 2026",
    summary_en: "Know the legal rules under Motor Vehicles Act regarding officer rank requirements, DigiLocker validity, key seizure prohibition, and fine payment.",
    summary_ta: "வாகன சோதனையின் போது காவலத்துறை பின்பற்ற வேண்டிய விதிகள் மற்றும் ஓட்டுநர்களின் உரிமைகள் பற்றிய விழிப்புணர்வு.",
    content_en: `Citizens driving two-wheelers or four-wheelers in Tamil Nadu are protected under the Motor Vehicles Act 1989 and landmark High Court judgments during routine traffic checks.

### Key Citizen Legal Rights:
1. **Officer Rank Requirements**: Only traffic police officers of Sub-Inspector (SI) rank and above (wearing stars on shoulder badges) are legally authorized to inspect documents or issue fine challans. Constables cannot collect fines.
2. **DigiLocker & mParivahan Validity**: Under Rule 139 of Central Motor Vehicles Rules 1989, digital copies of your Driving License (DL), RC Book, Insurance Policy, and Pollution Certificate shown on official DigiLocker or mParivahan mobile apps are 100% legally valid equivalent to original physical documents.
3. **No Key Snatching or Force**: Police officers CANNOT forcibly snatch ignition keys from moving or parked vehicles, switch off engines, or physically assault drivers. Doing so is illegal and subject to disciplinary action by the Police Complaints Authority.
4. **Electronic Challan Receipts**: All fines MUST be collected via digital e-Challan devices generating instant printed or SMS receipts. Paying un-receipted cash is illegal.
5. **Night Arrest Protection for Women**: Under CrPC Section 46(4), female drivers cannot be arrested after 6:00 PM and before 6:00 AM except in extraordinary circumstances with prior written permission from a Judicial Magistrate and in the presence of a female police officer.`,
    content_ta: `தமிழ்நாட்டில் வாகன ஓட்டுநர்களுக்கான சட்டப்பூர்வ உரிமைகள்:

### உங்கள் சட்ட உரிமைகள்:
1. **அதிகாரி பதவி**: சப்-இன்ஸ்பெக்டர் (SI) அல்லது அதற்கு மேற்பட்ட அதிகாரிகளேSpot Fine வசூலிக்க முடியும்.
2. **டிஜிலாக்கர் செல்லுபடி**: DigiLocker / mParivahan செயலியில் உள்ள ஓட்டுநர் உரிமம், RC 100% செல்லுபடியாகும்.
3. **சாவி பிடுங்கத் தடை**: வாகனச் சாவியை பிடுங்குவது அல்லது உடலளவில் தாக்குவது சட்டவிரோதம்.
4. **இ-சலான் ரசீது**: அபராதத்திற்கு மின்னணு e-Challan ரசீது கட்டாயம் வழங்கப்பட வேண்டும்.`
  }
];

export const getArticleBySlug = (slug) => {
  return getAllArticles().find(a => a.slug === slug);
};
