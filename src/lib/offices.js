export const OFFICES = [
  { slug: "rto", name_en: "RTO Office", name_ta: "வாகன பதிவு அலுவலகம்", icon: "🚗", category: "transport" },
  { slug: "taluk", name_en: "Taluk Office", name_ta: "தாலுகா அலுவலகம்", icon: "🏛️", category: "government" },
  { slug: "municipality", name_en: "Municipality / Corporation", name_ta: "நகராட்சி / மாநகராட்சி", icon: "🏢", category: "local_body" },
  { slug: "eb-office", name_en: "EB Office (Electricity Board)", name_ta: "மின்சார வாரியம்", icon: "⚡", category: "utility" },
  { slug: "registrar", name_en: "Registrar Office", name_ta: "பதிவாளர் அலுவலகம்", icon: "📄", category: "legal" },
  { slug: "govt-hospital", name_en: "Government Hospital", name_ta: "அரசு மருத்துவமனை", icon: "🏥", category: "health" },
  { slug: "passport-office", name_en: "Passport Office / Seva Kendra", name_ta: "பாஸ்போர்ட் அலுவலகம்", icon: "🛂", category: "central" },
  { slug: "ration-shop", name_en: "Ration Shop / PDS", name_ta: "ரேஷன் கடை", icon: "🛒", category: "pds" },
  { slug: "revenue-office", name_en: "Revenue / District Office", name_ta: "வருவாய் அலுவலகம்", icon: "🏦", category: "revenue" },
  { slug: "panchayat", name_en: "Panchayat Office", name_ta: "பஞ்சாயத்து அலுவலகம்", icon: "🏡", category: "local_body" },
];

export const getOfficeBySlug = (slug) =>
  OFFICES.find((o) => o.slug === slug) || null;