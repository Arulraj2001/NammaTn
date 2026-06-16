export const LISTING_CATEGORIES = [
  { slug: "plumber", label: "Plumber", label_ta: "குழாய் பணியாளர்", icon: "🔧" },
  { slug: "electrician", label: "Electrician", label_ta: "மின்சாரக் கலைஞர்", icon: "⚡" },
  { slug: "cleaning", label: "Cleaning Service", label_ta: "சுத்தம் சேவை", icon: "🧹" },
  { slug: "water_can", label: "Water Can Supplier", label_ta: "தண்ணீர் கேன் வழங்குநர்", icon: "💧" },
  { slug: "legal_help", label: "Legal / Document Help", label_ta: "சட்ட உதவி", icon: "📋" },
  { slug: "esevai", label: "E-Sevai Support", label_ta: "இ-சேவை உதவி", icon: "🖥️" },
  { slug: "tuition", label: "Tuition Center", label_ta: "தனிப்பயிற்சி மையம்", icon: "📚" },
  { slug: "clinic", label: "Clinic / Doctor", label_ta: "மருத்துவமனை", icon: "🏥" },
  { slug: "hostel_pg", label: "Hostel / PG", label_ta: "விடுதி / PG", icon: "🏠" },
  { slug: "repair", label: "Local Repair Service", label_ta: "உள்ளூர் பழுது சேவை", icon: "🔨" },
  { slug: "job_provider", label: "Job Provider", label_ta: "வேலை வழங்குநர்", icon: "💼" },
  { slug: "rental_stay", label: "Rental / Stay Provider", label_ta: "வாடகை / தங்கும் இடம்", icon: "🏡" },
  { slug: "other", label: "Other", label_ta: "மற்றவை", icon: "📌" },
];

export const LISTING_PLANS = [
  {
    key: "free",
    label: "Free Listing",
    price: 0,
    billing: "one-time",
    badge: null,
    features: ["Basic listing visible in area", "Phone contact only", "1 photo"],
    highlight: false,
  },
  {
    key: "verified",
    label: "Verified Listing",
    price: 299,
    billing: "per year",
    badge: "Verified",
    badgeColor: "bg-blue-600",
    features: ["Verified badge", "Priority in search", "Up to 5 photos", "WhatsApp contact", "Review & rating display"],
    highlight: false,
  },
  {
    key: "featured",
    label: "Featured Area Listing",
    price: 799,
    billing: "per year",
    badge: "Featured",
    badgeColor: "bg-amber-500",
    features: ["Everything in Verified", "Top placement in area", "Featured badge", "Highlighted card"],
    highlight: true,
  },
  {
    key: "district_sponsor",
    label: "District Sponsor Listing",
    price: 2499,
    billing: "per year",
    badge: "Sponsored",
    badgeColor: "bg-purple-600",
    features: ["Everything in Featured", "District-level visibility", "Sponsored badge", "Banner placement on district page"],
    highlight: false,
  },
];

export const RWA_PLANS = [
  {
    key: "free_community",
    label: "Free Community",
    price: 0,
    billing: "free forever",
    features: ["Public issue board", "Basic complaint tracker", "Up to 5 members"],
    highlight: false,
  },
  {
    key: "basic_rwa",
    label: "Basic RWA",
    price: 499,
    billing: "per year",
    features: ["Private issue board", "Complaint ID tracker", "Up to 50 members", "Monthly issue summary"],
    highlight: false,
  },
  {
    key: "pro_rwa",
    label: "Pro RWA",
    price: 1499,
    billing: "per year",
    features: ["Everything in Basic", "PDF monthly report", "Escalation list", "Follow-up reminders", "Unlimited members"],
    highlight: true,
  },
  {
    key: "federation",
    label: "Federation / Large Community",
    price: 3999,
    billing: "per year",
    features: ["Everything in Pro", "Multi-area dashboard", "Official report export", "Area heatmap", "Admin controls"],
    highlight: false,
  },
];

export function getCategoryMeta(slug) {
  return LISTING_CATEGORIES.find((c) => c.slug === slug) || LISTING_CATEGORIES[LISTING_CATEGORIES.length - 1];
}

export function getPlanMeta(key) {
  return LISTING_PLANS.find((p) => p.key === key) || LISTING_PLANS[0];
}