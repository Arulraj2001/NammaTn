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
    department_en: "TANGEDCO",
    department_ta: "TANGEDCO",
    helpline_numbers: ["94987 94987", "1912"],
    portal_url: "https://www.tnebltd.org",
  },
  {
    id: "water-supply",
    slug: "water-supply",
    title_en: "Water Supply not available",
    title_ta: "குடிநீர் வழங்கல் இல்லை",
    problem_type_en: "Water Supply",
    problem_type_ta: "குடிநீர் வழங்கல்",
    department_en: "Metro Water / TWAD",
    department_ta: "Metro Water / TWAD",
    helpline_numbers: ["1913", "044-45674567"],
    portal_url: "https://www.chennaimetrowater.tn.gov.in",
  },
  {
    id: "credit-card",
    slug: "credit-card",
    title_en: "Credit Card not received or canceled",
    title_ta: "கிரெடிட் கார்டு வரவில்லை அல்லது ரத்து செய்யப்பட்டது",
    problem_type_en: "Credit Card",
    problem_type_ta: "கிரெடிட் கார்டு",
    department_en: "Reserve Bank of India",
    department_ta: "Reserve Bank of India",
    helpline_numbers: ["1800-425-2800"],
    portal_url: "https://www.rbi.org.in",
  },
  {
    id: "property-tax",
    slug: "property-tax",
    title_en: "Property Tax Assessment & Payment",
    title_ta: "சொத்து வரி மதிப்பீடு மற்றும் பணம் செலுத்துதல்",
    problem_type_en: "Property Tax",
    problem_type_ta: "சொத்து வரி",
    department_en: "Municipal Corporation",
    department_ta: "நகராட்சி",
    helpline_numbers: [],
    portal_url: "https://www.chennaicorporation.gov.in",
  },
  {
    id: "ration-card",
    slug: "ration-card",
    title_en: "Ration Card Issues",
    title_ta: "ரേশன் கார்டு சிக்கல்கள்",
    problem_type_en: "Ration Card",
    problem_type_ta: "ரேசன் கார்ட்",
    department_en: "Food & Civil Supplies",
    department_ta: "உணவு மற்றும் சிவில் சப்ளை",
    helpline_numbers: ["1967"],
    portal_url: "https://pds.tn.gov.in",
  },
];

// Get guide by slug
export const getGuideBySlug = (slug) => {
  return getAllGuides().find(g => g.slug === slug);
};

// All FAQs with slugs
export const getAllFaqs = () => [
  {
    id: "faq-1",
    slug: "file-public-complaint",
    question_en: "How do I file a public complaint?",
    question_ta: "நான் பொதுக் புகாரை எப்படி தாக்கல் செய்வது?",
    answer_en: "You can file complaints with the relevant department directly or through VizhiTN.",
    answer_ta: "நீங்கள் உரிய துறையுடன் நேரடியாக அல்லது VizhiTN மூலம் புகார் தாக்கல் செய்யலாம்.",
    category_en: "Complaints",
    category_ta: "புகார்கள்",
  },
  {
    id: "faq-2",
    slug: "rights-as-citizen",
    question_en: "What are my rights as a citizen?",
    question_ta: "ஒரு குடிமக்கனாக எனக்கு என்ன உரிமைகள் உள்ளன?",
    answer_en: "Citizens have rights to information, public services, grievance redressal, and participation in civic governance.",
    answer_ta: "குடிமக்களுக்கு தகவல்,பொதுச் சேவைகள், புகார் தீர்வு மற்றும் பொதுக் ஆளுமைக்கு பங்கேற்பு உரிமைகள் உள்ளன.",
    category_en: "Rights",
    category_ta: "உரிமைகள்",
  },
];

// Get FAQ by slug
export const getFaqBySlug = (slug) => {
  return getAllFaqs().find(f => f.slug === slug);
};

// All schemes with slugs
export const getAllSchemes = () => [
  {
    id: "scheme-1",
    slug: "mgnarega",
    name_en: "MGNREGA - Mahatma Gandhi National Rural Employment Guarantee Act",
    name_ta: "MGNREGA",
    category_en: "Employment",
    category_ta: "வேலை வாய்ப்பு",
    department_en: "Rural Development",
    department_ta: "கிராமப்புற வளர்ச்சி",
    benefits_en: "Guaranteed rural employment",
    benefits_ta: "கிராமப்புற வேலைக்கான உத்தரவாதம்",
    apply_url: "https://www.mgnrega.tn.gov.in",
    website_url: "https://www.mgnrega.tn.gov.in",
    is_featured: true,
  },
  {
    id: "scheme-2",
    slug: "pmay-tamil-nadu",
    name_en: "Pradhan Mantri Awas Yojana - Tamil Nadu",
    name_ta: "Pradhan Mantri Awas Yojana",
    category_en: "Housing",
    category_ta: "வீடு மைத்திரம்",
    department_en: "Housing",
    department_ta: "வீட்டுவசதி",
    benefits_en: "Affordable housing assistance",
    benefits_ta: "மலிவான வீட்டு உதவி",
    apply_url: "https://pmaytnscsc.tnscsc.in",
    website_url: "https://pmaytnscsc.tnscsc.in",
    is_featured: true,
  },
];

// Get scheme by slug
export const getSchemeBySlug = (slug) => {
  return getAllSchemes().find(s => s.slug === slug);
};

// All portals with slugs
export const getAllPortals = () => [
  {
    id: "portal-1",
    slug: "tnegov",
    name_en: "Tamil Nadu e-Governance Portal",
    name_ta: "Tamil Nadu e-Governance இணையதளம்",
    description_en: "Single window to access all TN government services",
    description_ta: "TN அரசுத் தொண்டைக் கண்ணிக்குளுவதற்கான ஒற்றை சாளரம்",
    url: "https://www.tnegov.tn.gov.in",
    category_en: "E-Governance",
    category_ta: "மின் நிர்வாகம்",
  },
  {
    id: "portal-2",
    slug: "chennaicorporation",
    name_en: "Chennai Corporation",
    name_ta: "சென்னை மாநகர் கর்ப்பொறுதி",
    description_en: "Official portal for Chennai Municipal Corporation",
    description_ta: "சென்னை மாநகர் கর்ப்பொறுதির அதிகாര இணையதளம்",
    url: "https://www.chennaicorporation.gov.in",
    category_en: "Municipal Services",
    category_ta: "நகர சேவைகள்",
  },
];

// Get portal by slug
export const getPortalBySlug = (slug) => {
  return getAllPortals().find(p => p.slug === slug);
};

// All emergency contacts with slugs
export const getAllEmergencyContacts = () => [
  {
    id: "emergency-1",
    slug: "police",
    name_en: "Police Emergency",
    name_ta: "போலீஸ் அவசரம்",
    number: "100",
    description_en: "For police emergencies and safety issues",
    description_ta: "போலீஸ் அவசர சூழ்நிலைகளுக்கு",
  },
  {
    id: "emergency-2",
    slug: "ambulance",
    name_en: "Medical Emergency",
    name_ta: "மருத்துவ அவசரம்",
    number: "102",
    description_en: "For medical emergencies and ambulance services",
    description_ta: "மருத்துவ அவசரத்திற்கு",
  },
  {
    id: "emergency-3",
    slug: "fire",
    name_en: "Fire Emergency",
    name_ta: "தீ அவசரம்",
    number: "101",
    description_en: "For fire emergencies and rescue",
    description_ta: "தீ அவசரத்திற்கு",
  },
];

export const getEmergencyContactBySlug = (slug) => {
  return getAllEmergencyContacts().find(e => e.slug === slug);
};

// All citizen rights with slugs
export const getAllRights = () => [
  {
    id: "right-rti",
    slug: "right-to-information-act-2005",
    name_en: "Right to Information Act (RTI Act 2005)",
    name_ta: "தகவல் அறியும் உரிமைச் சட்டம் 2005",
    desc_en: "Empowers Indian citizens to request information, inspect government files, and obtain certified copies within 30 days.",
    desc_ta: "அரசுத் துறைகளின் செயல்பாடுகள் மற்றும் கோப்புகளை பார்வையிட 30 நாட்களுக்குள் தகவல் பெறும் உரிமை.",
    content_en: "Under the RTI Act 2005, every citizen has the statutory right to file an application with a Public Information Officer (PIO) of any state or central government department. The PIO must reply within 30 calendar days.",
    content_ta: "தகவல் அறியும் உரிமைச் சட்டத்தின்படி ஒவ்வொரு குடிமகனும் எந்தவொரு அரசுத் துறையிலும் ₹10 கட்டணத்துடன் விண்ணப்பித்து 30 நாட்களுக்குள் தகவல் பெற உரிமை உண்டு.",
    department_en: "Personnel and Administrative Reforms Dept",
    department_ta: "பணியாளர் மற்றும் நிர்வாக சீர்திருத்தத் துறை",
    portal_url: "https://rtionline.tn.gov.in",
  },
  {
    id: "right-consumer",
    slug: "consumer-protection-rights-2019",
    name_en: "Consumer Protection Rights (Act 2019)",
    name_ta: "நுகர்வோர் பாதுகாப்பு சட்ட உரிமைகள் 2019",
    desc_en: "Guarantees protection against defective goods, deficient services, overcharging, misleading advertisements, and unfair trade practices.",
    desc_ta: "குறைபாடுள்ள பொருட்கள், போலி விளம்பரங்கள் மற்றும் ஏமாற்று வியாபாரத்திற்கு எதிராக ஆன்லைனில் வழக்கு பதிவு செய்து இழப்பீடு பெறும் உரிமை.",
    content_en: "The Consumer Protection Act 2019 gives citizens 6 fundamental consumer rights. Consumers can file complaints online through e-Daakhil without hiring a lawyer for claims up to ₹50 lakh.",
    content_ta: "நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி பொருட்களின் தரம், விலை மற்றும் சேவைகளில் குறைபாடு இருந்தால் வக்கீல் இல்லாமல் இ-தாகீல் தளம் வழியாக ஆன்லைனில் நுகர்வோர் நீதிமன்றத்தில் வழக்கு பதிவு செய்யலாம்.",
    department_en: "Civil Supplies and Consumer Protection Dept",
    department_ta: "உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை",
    portal_url: "https://edaakhil.nic.in",
  },
  {
    id: "right-police-check",
    slug: "police-vehicle-check-citizen-rights",
    name_en: "Citizen Rights During Police Checks & Detention",
    name_ta: "வாகன சோதனை மற்றும் காவல் விசாரணையில் குடிமக்கள் உரிமைகள்",
    desc_en: "Know your statutory legal rights when stopped by traffic police, during vehicle document inspection, or during police questioning.",
    desc_ta: "வாகன சோதனையின் போதும் காவல் நிலைய விசாரணையின் போதும் குடிமக்களுக்கு உள்ள சட்டப்பூர்வ உரிமைகள்.",
    content_en: "Only Sub-Inspector (SI) rank & above can collect traffic fines. DigiLocker DL/RC copies are 100% legally valid under MV Act Rule 139. Key snatching is illegal.",
    content_ta: "சப்-இன்ஸ்பெக்டர் (SI) மற்றும் அதற்கு மேற்பட்ட அதிகாரிகளே அபராதம் வசூலிக்க முடியும். டிஜிலாக்கர் (DigiLocker) சான்றிதழ்கள் செல்லுபடியாகும். வாகனச் சாவியை பிடுங்குவது சட்டவிரோதம்.",
    department_en: "Home & Police Department",
    department_ta: "உள்துறை மற்றும் காவல்துறை",
    portal_url: "https://eservices.tnpolice.gov.in",
  },
  {
    id: "right-service",
    slug: "right-to-public-services-timebound",
    name_en: "Right to Public Services (Time-Bound Delivery)",
    name_ta: "காலவரையறைக்கு உட்பட்ட அரசுச் சேவை உரிமை",
    desc_en: "Guarantees statutory time limits for receiving civic certificates, electricity connections, water taps, and revenue documents.",
    desc_ta: "அரசுச் சான்றிதழ்கள், குடிநீர் மற்றும் மின்சார இணைப்புகளை குறிப்பிட்ட காலக்கெடுவுக்குள் பெறும் உரிமை.",
    content_en: "Community/Income Certificate (15 days), Native Certificate (7 days), New Domestic Power Connection (7-15 days). District Collector Appeal for delay.",
    content_ta: "சாதி/வருமான சான்றிதழ் (15 நாட்கள்), இருப்பிட சான்றிதழ் (7 நாட்கள்), புதிய மின் இணைப்பு (7-15 நாட்கள்). தாமதமானால் ஆட்சியரிடம் மேல்முறையீடு செய்யலாம்.",
    department_en: "Revenue and Disaster Management Dept",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_url: "https://cmhelpline.tn.gov.in",
  },
  {
    id: "right-senior-citizen",
    slug: "senior-citizens-maintenance-act-2007",
    name_en: "Maintenance & Rights of Senior Citizens (Act 2007)",
    name_ta: "மூத்த குடிமக்கள் பராமரிப்பு & நல உரிமைகள் 2007",
    desc_en: "Protects elderly citizens from eviction, abandonment, or financial neglect by adult children or legal heirs.",
    desc_ta: "முதியோர்களை பிள்ளைகள் கைவிடுவதில் இருந்தும் சொத்துக்களில் இருந்து வெளியேற்றுவதில் இருந்தும் பாதுகாக்கும் சட்டம்.",
    content_en: "Children are legally obligated to provide a monthly maintenance allowance up to ₹10,000/month. RDO Tribunal orders eviction of abusive heirs within 90 days.",
    content_ta: "பெற்றோர்களைப் பராமரிக்காத பிள்ளைகளிடம் இருந்து மாதம் ₹10,000 வரை ஜீவனாம்சம் பெறவும், முதியோரின் சொத்தை ஆக்கிரமிக்கும் பிள்ளைகளை 90 நாளில் வெளியேற்றவும் RDO மன்றத்திற்கு அதிகாரம் உண்டு.",
    department_en: "Social Welfare and Women Empowerment Dept",
    department_ta: "சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை",
    portal_url: "https://tnsocialwelfare.tn.gov.in",
  },
  {
    id: "right-pwd",
    slug: "rights-of-persons-with-disabilities-act-2016",
    name_en: "Rights of Persons with Disabilities (RPwD Act 2016)",
    name_ta: "மாற்றுத்திறனாளிகள் உரிமைகள் சட்டம் 2016",
    desc_en: "Ensures non-discrimination, 4% public employment reservation, accessible public infrastructure, and monthly pension allowances.",
    desc_ta: "மாற்றுத்திறனாளிகளுக்கு 4% அரசு வேலைவாய்ப்பு இடஒதுக்கீடு, கட்டணமில்லா பேருந்து பயணம் மற்றும் சம உரிமைக்கான சட்டம்.",
    content_en: "4% reservation in government jobs, 5% reservation in higher education, free state bus travel, UDID card single window portal.",
    content_ta: "அரசுப் பணியிடங்களில் 4% இடஒதுக்கீடு, உயர்கல்வியில் 5% இடஒதுக்கீடு, கட்டணமில்லா அரசு பேருந்து பயணம் வழங்கப்படுகிறது.",
    department_en: "Welfare of Differently Abled Persons Dept",
    department_ta: "மாற்றுத்திறனாளிகள் நலத் துறை",
    portal_url: "https://www.scda.tn.gov.in",
  },
  {
    id: "right-domestic-violence",
    slug: "protection-of-women-from-domestic-violence-act",
    name_en: "Protection of Women from Domestic Violence Act 2005",
    name_ta: "குடும்ப வன்முறை தடுப்புச் சட்ட உரிமைகள் 2005",
    desc_en: "Protects women from physical, verbal, emotional, economic, and sexual abuse within shared domestic households.",
    desc_ta: "பெண்களுக்கு எதிராக குடும்பத்தில் நடக்கும் வன்முறைகளுக்கு எதிரான சட்டப் பாதுகாப்பு.",
    content_en: "Protection Orders, Residence Orders, Compensation Orders, and interim maintenance without court fees. 181 Women Crisis Helpline.",
    content_ta: "குடும்ப வன்முறை தடுப்புச் சட்டம் 2005 படி பாதிக்கப்பட்ட பெண்கள் இலவசமாக நீதிமன்ற பாதுகாப்பு உத்தரவு, தங்குமிடம் மற்றும் பராமரிப்பு பெறலாம்.",
    department_en: "Social Welfare and Women Empowerment Dept",
    department_ta: "சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை",
    portal_url: "https://tnsocialwelfare.tn.gov.in",
  },
  {
    id: "right-labor-minimum-wage",
    slug: "right-to-fair-wages-tn-shops-act",
    name_en: "Right to Fair Minimum Wages & Working Conditions",
    name_ta: "குறைந்தபட்ச கூலி & தொழிலாளர் பாதுகாப்பு உரிமைகள்",
    desc_en: "Guarantees statutory minimum wages, mandatory weekly rest, double overtime pay, and safe working conditions.",
    desc_ta: "தனியார் துறை ஊழியர்களுக்கான குறைந்தபட்ச கூலி, வாராந்திர விடுமுறை மற்றும் கூடுதல் வேலை நேரத்திற்கான இரட்டிப்பு ஊதிய உரிமை.",
    content_en: "Mandatory 8 hours/day limit, double overtime pay beyond 8 hours, 1 mandatory paid weekly rest day.",
    content_ta: "நாள் ஒன்றுக்கு 8 மணி நேர வேலை, கூடுதல் நேரத்திற்கு இரட்டிப்பு ஊதியம், வாரத்தில் ஒரு நாள் கட்டாய விடுமுறை வழங்கப்பட வேண்டும்.",
    department_en: "Labour Welfare and Skill Development Dept",
    department_ta: "தொழிலாளர் நலன் மற்றும் திறன் மேம்பாட்டுத் துறை",
    portal_url: "https://labour.tn.gov.in",
  }
];

export const getRightBySlug = (slug) => {
  return getAllRights().find(r => r.slug === slug);
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
