export const CATEGORIES = [
  { slug: "road-infrastructure", name_en: "Road & Infrastructure", name_ta: "சாலை & உள்கட்டமைப்பு", icon: "🛣️", color: "blue" },
  { slug: "water-sanitation", name_en: "Water & Sanitation", name_ta: "தண்ணீர் & சுகாதாரம்", icon: "💧", color: "cyan" },
  { slug: "electricity", name_en: "Electricity", name_ta: "மின்சாரம்", icon: "⚡", color: "yellow" },
  { slug: "education", name_en: "Education", name_ta: "கல்வி", icon: "📚", color: "purple" },
  { slug: "healthcare", name_en: "Healthcare", name_ta: "சுகாதாரம்", icon: "🏥", color: "green" },
  { slug: "environment", name_en: "Environment", name_ta: "சுற்றுச்சூழல்", icon: "🌿", color: "emerald" },
  { slug: "public-safety", name_en: "Public Safety", name_ta: "பொது பாதுகாப்பு", icon: "🛡️", color: "red" },
  { slug: "government-schemes", name_en: "Government Schemes", name_ta: "அரசு திட்டங்கள்", icon: "🏛️", color: "indigo" },
  { slug: "local-development", name_en: "Local Development", name_ta: "உள்ளூர் வளர்ச்சி", icon: "🏗️", color: "orange" },
  { slug: "transport", name_en: "Transport", name_ta: "போக்குவரத்து", icon: "🚌", color: "sky" },
  { slug: "agriculture", name_en: "Agriculture", name_ta: "விவசாயம்", icon: "🌾", color: "lime" },
  { slug: "general", name_en: "General", name_ta: "பொது", icon: "💬", color: "gray" }
];

export const getCategoryBySlug = (slug) =>
  CATEGORIES.find((c) => c.slug === slug) || null;