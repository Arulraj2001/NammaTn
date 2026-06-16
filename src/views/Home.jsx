import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FileText, CheckCircle, Users, ClipboardList, ShieldCheck,
  ArrowRight, AlertCircle, Camera, MapPin, Tag, Clock,
  Zap, Home as HomeIcon, Building2, Leaf, Map, Shield
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getActiveCivicPosts } from "@/services/posts";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";
import FeatureHub from "@/components/home/FeatureHub";
import { DISTRICTS } from "@/lib/districts";

const STEPS = [
  { icon: Camera, en_title: "Post Issue", ta_title: "சிக்கலை பதிவிடு", en_desc: "Upload photo, location, category, and description.", ta_desc: "புகைப்படம், இடம், வகை மற்றும் விவரம் பதிவிடுங்கள்.", color: "bg-blue-100 text-blue-600" },
  { icon: FileText, en_title: "Get Civic Receipt", ta_title: "குடிமை ரசீது பெறுக", en_desc: "Every issue gets a public receipt ID and status timeline.", ta_desc: "ஒவ்வொரு சிக்கலுக்கும் பொது ரசீது ID மற்றும் நிலை காலவரிசை.", color: "bg-green-100 text-green-600" },
  { icon: Users, en_title: "Community Verifies", ta_title: "சமுதாயம் உறுதிப்படுத்தும்", en_desc: "Nearby citizens can confirm whether the issue is real.", ta_desc: "அருகிலுள்ள குடிமக்கள் சிக்கல் உண்மையானதா என்று உறுதிப்படுத்தலாம்.", color: "bg-purple-100 text-purple-600" },
  { icon: ClipboardList, en_title: "Add Official Complaint ID", ta_title: "அதிகாரப்பூர்வ புகார் ID சேர்", en_desc: "File through the correct official channel and add the complaint ID.", ta_desc: "சரியான அலுவலக வழியில் புகார் அளித்து புகார் ID சேர்க்கவும்.", color: "bg-orange-100 text-orange-600" },
  { icon: ShieldCheck, en_title: "Track Until Proof", ta_title: "ஆதாரம் வரும் வரை கண்காணி", en_desc: "Issue closes only after citizen verification or resolution proof.", ta_desc: "குடிமகன் உறுதிப்படுத்தல் அல்லது தீர்வு ஆதாரம் வரும் வரை மூடப்படாது.", color: "bg-red-100 text-red-600" },
];

const REPORT_CATEGORIES = [
  { emoji: "🛣️", en: "Road / Infrastructure", ta: "சாலை / உள்கட்டமைப்பு", slug: "road-infrastructure" },
  { emoji: "💧", en: "Water & Sanitation", ta: "தண்ணீர் & சுகாதாரம்", slug: "water-sanitation" },
  { emoji: "⚡", en: "Electricity", ta: "மின்சாரம்", slug: "electricity" },
  { emoji: "🌿", en: "Environment", ta: "சுற்றுச்சூழல்", slug: "environment" },
  { emoji: "🛡️", en: "Public Safety", ta: "பொது பாதுகாப்பு", slug: "public-safety" },
  { emoji: "🏥", en: "Healthcare", ta: "சுகாதாரம்", slug: "healthcare" },
  { emoji: "📚", en: "Education", ta: "கல்வி", slug: "education" },
  { emoji: "🏛️", en: "Government Schemes", ta: "அரசு திட்டங்கள்", slug: "government-schemes" },
  { emoji: "🚌", en: "Transport", ta: "போக்குவரத்து", slug: "transport" },
  { emoji: "🏗️", en: "Local Development", ta: "உள்ளூர் வளர்ச்சி", slug: "local-development" },
  { emoji: "🌾", en: "Agriculture", ta: "விவசாயம்", slug: "agriculture" },
  { emoji: "💬", en: "General", ta: "பொது", slug: "general" },
];

const SAFETY_RULES = [
  { en: "NammaTN is not a government portal", ta: "NammaTN ஒரு அரசு போர்டல் அல்ல" },
  { en: "Do not post private phone numbers", ta: "தனிப்பட்ட தொலைபேசி எண்களை பதிவிடாதீர்கள்" },
  { en: "Do not post exact home addresses unnecessarily", ta: "தேவையின்றி வீட்டு முகவரிகளை பதிவிடாதீர்கள்" },
  { en: "Avoid personal attacks in posts", ta: "பதிவுகளில் தனிப்பட்ட தாக்குதல்களை தவிர்க்கவும்" },
  { en: "Use photo and location as proof", ta: "ஆதாரமாக புகைப்படம் மற்றும் இடத்தை பயன்படுத்துங்கள்" },
  { en: "Add official complaint ID where possible", ta: "முடிந்தவரை அதிகாரப்பூர்வ புகார் ID சேர்க்கவும்" },
];

const POPULAR_DISTRICTS = DISTRICTS.slice(0, 8);

export default function Home() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  usePageMeta({
    title: "NammaTN - Tamil Nadu Public Civic Proof Platform",
    description: "Create Civic Receipts for local civic issues in Tamil Nadu. Document issues, verify with community, track complaint IDs, and prove real resolution.",
  });

  const { data: civicPosts = [], isLoading } = useQuery({
    queryKey: ["home-civic-posts"],
    queryFn: () => getActiveCivicPosts(9),
    staleTime: 60_000,
  });

  return (
    <div className="pb-20 md:pb-0">

      {/* ── 1. HERO ─────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {T("People-Powered · Tamil Nadu", "மக்களால் இயக்கப்படுகிறது · தமிழ்நாடு")}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            {T("Tamil Nadu's Public", "தமிழ்நாட்டின் பொது")}
            <br />
            <span className="text-yellow-300">{T("Civic Proof Platform", "குடிமை ஆதார தளம்")}</span>
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            {T(
              "Post local issues, create a Civic Receipt, track complaint ID, and verify real resolution with public proof.",
              "உள்ளூர் சிக்கல்களை பதிவிட்டு, குடிமை ரசீது உருவாக்கி, புகார் ID கண்காணித்து, பொது ஆதாரத்துடன் உண்மையான தீர்வை உறுதிப்படுத்துங்கள்."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link to="/create">
              <button className="w-full sm:w-auto bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all text-sm sm:text-base shadow-lg">
                📋 {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="w-full sm:w-auto border-2 border-white/60 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all text-sm sm:text-base">
                {T("How It Works", "எப்படி செயல்படுகிறது")} ↓
              </button>
            </a>
          </div>
          <p className="text-blue-200 text-xs max-w-lg mx-auto leading-relaxed">
            🔒 {T(
              "NammaTN is not a government portal. We help citizens document, verify, route, track, and prove civic issues.",
              "NammaTN ஒரு அரசு போர்டல் அல்ல. குடிமக்கள் சிக்கல்களை ஆவணப்படுத்த, சரிபார்க்க, வழிநடத்த, கண்காணிக்க மற்றும் நிரூபிக்க உதவுகிறோம்."
            )}
          </p>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {T("How NammaTN Works", "NammaTN எப்படி செயல்படுகிறது")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {T("5 simple steps from problem to proof.", "சிக்கலிருந்து ஆதாரம் வரை 5 எளிய படிகள்.")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-left sm:text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {T("Step", "படி")} {i + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{T(step.en_title, step.ta_title)}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{T(step.en_desc, step.ta_desc)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── 3. EXPLORE FEATURES HUB ─────────────────────── */}
      <div className="bg-slate-50 dark:bg-slate-900/50">
        <FeatureHub />
      </div>

      {/* ── 4. RECENT CIVIC RECEIPTS ────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {T("Recent Civic Receipts", "சமீபத்திய குடிமை ரசீதுகள்")}
          </h2>
          <Link to="/explore" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
            {T("View all", "அனைத்தும்")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : civicPosts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              {T("No Civic Receipts yet. Be the first to document a local issue.", "இன்னும் குடிமை ரசீதுகள் இல்லை. ஒரு உள்ளூர் சிக்கலை முதலில் ஆவணப்படுத்துங்கள்.")}
            </p>
            <Link to="/create">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
                {T("Create your first Civic Receipt", "உங்கள் முதல் குடிமை ரசீது உருவாக்குங்கள்")}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {civicPosts.map(post => (
              <Link key={post.id} to={`/post/${post.id}`}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md transition-all h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-blue-600">{post.civic_receipt_id}</span>
                    <CivicStatusBadge status={post.civic_status} size="xs" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 mb-2">
                    {lang === "ta" ? post.title_ta || post.title_en : post.title_en}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {post.area_name && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {post.area_name}</span>
                    )}
                    {!post.area_name && post.district_name && (
                      <span className="flex items-center gap-1"><Map className="w-3 h-3" /> {post.district_name}</span>
                    )}
                    {post.verification_count > 0 && (
                      <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> {post.verification_count} {T("verified", "உறுதிப்படுத்தல்")}</span>
                    )}
                    {post.category_name && (
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {post.category_name}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. BROWSE BY CATEGORY ────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {T("Browse by Category", "வகை வாரியாக ஆராய்க")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {T("Every civic issue has a category for faster routing.", "ஒவ்வொரு குடிமை சிக்கலும் வேகமான வழிப்பாட்டிற்கு ஒரு வகையை கொண்டுள்ளது.")}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {REPORT_CATEGORIES.map((cat, i) => (
              <Link key={i} to={`/category/${cat.slug}`}>
                <div className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer text-center active:scale-[0.97]">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">{T(cat.en, cat.ta)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. AREA & DISTRICT DISCOVERY ────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Districts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-500" />
                {T("Popular Districts", "பிரபலமான மாவட்டங்கள்")}
              </h3>
              <Link to="/districts" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
                {T("View all", "அனைத்தும்")} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_DISTRICTS.map((d) => (
                <Link key={d.slug} to={`/district/${d.slug}`}>
                  <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-300 hover:shadow-sm transition-all">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {T(d.name_en, d.name_ta)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Areas quick access */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-500" />
                {T("Browse by Area", "பகுதி வாரியாக ஆராய்க")}
              </h3>
              <Link to="/areas" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
                {T("View all areas", "அனைத்து பகுதிகளும்")} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800 h-full flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                  {T("Find your area on NammaTN", "NammaTN-ல் உங்கள் பகுதியை கண்டுபிடிக்கவும்")}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                  {T(
                    "Browse Civic Receipts, local issues, and community activity for your specific area or locality.",
                    "உங்கள் குறிப்பிட்ட பகுதி அல்லது ஊரில் குடிமை ரசீதுகள், உள்ளூர் சிக்கல்கள் மற்றும் சமுதாய நடவடிக்கைகளை ஆராய்க."
                  )}
                </p>
              </div>
              <Link to="/areas" className="mt-4 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
                <MapPin className="w-3.5 h-3.5" />
                {T("Browse All Areas", "அனைத்து பகுதிகளையும் ஆராய்க")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FOR COMMUNITIES / RWAs / SPONSORS ────────── */}
      <section className="bg-slate-50 dark:bg-slate-900 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {T("For Citizens, RWAs & Sponsors", "குடிமக்கள், RWA & நிதியாளர்களுக்கு")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Users, color: "bg-blue-600", en_t: "For Citizens", ta_t: "குடிமக்களுக்கு", en_d: "Document issues, verify with community, track complaint IDs, and prove real resolution.", ta_d: "சிக்கல்களை ஆவணப்படுத்தி, சமுதாயத்துடன் சரிபார்த்து, புகார் IDகளை கண்காணிக்கவும்.", path: "/create", en_cta: "Create Receipt", ta_cta: "ரசீது உருவாக்கு" },
              { icon: HomeIcon, color: "bg-violet-600", en_t: "For RWAs", ta_t: "RWAக்களுக்கு", en_d: "Track area issues, coordinate community action, and publish monthly proof reports.", ta_d: "பகுதி சிக்கல்களை கண்காணித்து, சமுதாய நடவடிக்கையை ஒருங்கிணைக்கவும்.", path: "/rwa", en_cta: "RWA Dashboard", ta_cta: "RWA டாஷ்போர்டு" },
              { icon: Leaf, color: "bg-emerald-600", en_t: "For CSR Sponsors", ta_t: "CSR நிதியாளர்களுக்கு", en_d: "Support civic transparency, showcase community impact with before/after photo proof.", ta_d: "குடிமை வெளிப்படைத்தன்மையை ஆதரித்து முன்பு/பின்பு ஆதாரத்துடன் தாக்கத்தை காட்டுங்கள்.", path: "/csr", en_cta: "CSR Dashboard", ta_cta: "CSR டாஷ்போர்டு" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{T(item.en_t, item.ta_t)}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{T(item.en_d, item.ta_d)}</p>
                  </div>
                  <Link to={item.path} className="mt-auto">
                    <button className="w-full text-xs font-semibold py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1">
                      {T(item.en_cta, item.ta_cta)} <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. SAFETY & TRUST ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {T("Safety & Community Rules", "பாதுகாப்பு & சமுதாய விதிகள்")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {T("NammaTN is built on trust, transparency, and civic accountability.", "NammaTN நம்பகத்தன்மை, வெளிப்படைத்தன்மை மற்றும் குடிமை பொறுப்புணர்வின் அடிப்படையில் கட்டமைக்கப்பட்டுள்ளது.")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAFETY_RULES.map((rule, i) => (
            <div key={i} className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{T(rule.en, rule.ta)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. FINAL CTA ─────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {T("See a problem? Document it.", "ஒரு சிக்கலை கண்டீர்களா? ஆவணப்படுத்துங்கள்.")}
          </h2>
          <p className="text-blue-100 mb-7 text-sm sm:text-base">
            {T("Create a Civic Receipt in under 2 minutes. No account needed.", "2 நிமிடத்திற்குள் ஒரு குடிமை ரசீது உருவாக்குங்கள். கணக்கு தேவையில்லை.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/create">
              <button className="bg-white text-blue-700 font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition-all text-base shadow-lg">
                📋 {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")} →
              </button>
            </Link>
            <Link to="/explore">
              <button className="border-2 border-white/60 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-base">
                {T("Explore NammaTN Features", "NammaTN அம்சங்களை ஆராய்க")}
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}