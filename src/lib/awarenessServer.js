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

// Get emergency contact by slug
export const getEmergencyContactBySlug = (slug) => {
  return getAllEmergencyContacts().find(e => e.slug === slug);
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
  
  const emergencyContacts = getAllEmergencyContacts().filter(e => 
    e.name_en.toLowerCase().includes(query.toLowerCase()) || 
    e.name_ta.toLowerCase().includes(query.toLowerCase())
  );
  
  return { guides, faqs, schemes, portals, emergencyContacts };
};
