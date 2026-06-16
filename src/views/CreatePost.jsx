import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Star, Megaphone, Shield, MessageCircle, Loader2, AlertCircle, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";
import { base44 } from "@/api/base44Client";
import { createPost } from "@/services/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MediaUploader from "@/components/media/MediaUploader";
import { sanitizePayload, detectSpam, checkRateLimit, getRateLimitResetIn } from "@/lib/security";
import { detectSensitiveData } from "@/services/ai/contentAnalysis";
import SensitiveDataWarning from "@/components/admin/moderation/SensitiveDataWarning";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import LoginPromptBanner from "@/components/auth/LoginPromptBanner";
import CivicReceiptBanner from "@/components/civic/CivicReceiptBanner";
import { generateCivicReceiptId, makeTimelineEvent, URGENCY_LEVELS } from "@/lib/civicReceipt";
import DuplicateSuggestion from "@/components/civic/DuplicateSuggestion";

const schema = z.object({
  title_en: z.string().min(5, "Title must be at least 5 characters").max(200),
  content_en: z.string().min(10, "Content must be at least 10 characters").max(5000),
  district_slug: z.string().min(1, "Please select a district"),
  category_slug: z.string().min(1, "Please select a category"),
  post_type: z.enum(["complaint", "appreciation", "local_update", "alert", "discussion"]),
  is_anonymous: z.boolean().optional(),
  author_name: z.string().optional(),
  location_text: z.string().optional(),
  urgency_level: z.string().optional(),
});

const POST_TYPES = [
  { value: "complaint", icon: AlertTriangle, en: "Complaint", ta: "புகார்", desc_en: "Report an issue", desc_ta: "ஒரு சிக்கலை புகார் செய்யவும்", color: "red", isCivic: true },
  { value: "appreciation", icon: Star, en: "Appreciation", ta: "பாராட்டு", desc_en: "Share good news", desc_ta: "நல்ல செய்தி பகிரவும்", color: "yellow" },
  { value: "local_update", icon: Megaphone, en: "Local Update", ta: "உள்ளூர் புதுப்பிப்பு", desc_en: "Community update", desc_ta: "சமுதாய புதுப்பிப்பு", color: "blue" },
  { value: "alert", icon: Shield, en: "Alert", ta: "எச்சரிக்கை", desc_en: "Urgent public notice", desc_ta: "அவசர பொது அறிவிப்பு", color: "orange" },
  { value: "discussion", icon: MessageCircle, en: "Discussion", ta: "விவாதம்", desc_en: "Open discussion", desc_ta: "திறந்த விவாதம்", color: "purple" },
];

const COLOR_MAP = {
  red: "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600",
  yellow: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600",
  blue: "border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  orange: "border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-600",
  purple: "border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-600",
};

export default function CreatePost() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();
  const [selectedType, setSelectedType] = useState("discussion");
  const [mediaUrls, setMediaUrls] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submittedPost, setSubmittedPost] = useState(null);
  const [spamError, setSpamError] = useState(null);
  const [rateLimitMsg, setRateLimitMsg] = useState(null);
  const [sensitiveWarning, setSensitiveWarning] = useState(null);
  const [selectedUrgency, setSelectedUrgency] = useState("medium");

  const isCivicType = selectedType === "complaint" || selectedType === "alert";
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { post_type: "discussion", is_anonymous: false, urgency_level: "medium" },
  });

  const isAnon = watch("is_anonymous");
  const selectedCategory = watch("category_slug");
  const selectedDistrict = watch("district_slug");
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(true);
  const [areaSlug, setAreaSlug] = useState("");
  const [areaName, setAreaName] = useState("");
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    if (!selectedDistrict) { setAreas([]); setAreaSlug(""); setAreaName(""); return; }
    base44.entities.Area.filter({ district_slug: selectedDistrict, active: true }, "name_en", 100)
      .then(setAreas).catch(() => setAreas([]));
  }, [selectedDistrict]);

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      requireAuth(() => {}, T("Sign in to share an update", "பதிவிட உள்நுழையுங்கள்"));
      return;
    }
    setSpamError(null);
    setRateLimitMsg(null);

    // For civic posts, area is strongly recommended and disclaimer must be acknowledged
    if (isCivicType && !disclaimerAccepted) {
      setSpamError(T("Please acknowledge the disclaimer before creating a Civic Receipt.", "குடிமை ரசீது உருவாக்குவதற்கு முன் மறுப்பை ஒப்புக்கொள்ளவும்."));
      return;
    }

    if (!checkRateLimit("post_create", 3, 10 * 60_000)) {
      const secs = getRateLimitResetIn("post_create", 10 * 60_000);
      setRateLimitMsg(T(`Please wait ${secs}s before posting again.`, `மீண்டும் பதிவிட ${secs} நொடி காத்திருக்கவும்.`));
      return;
    }

    const sensitiveCheck = detectSensitiveData(`${data.title_en} ${data.content_en}`);
    if (sensitiveCheck.hasSensitive && !sensitiveWarning) {
      setSensitiveWarning(sensitiveCheck.findings);
      return;
    }
    setSensitiveWarning(null);

    if (detectSpam(data.title_en) || detectSpam(data.content_en)) {
      setSpamError(T("Your post was flagged as potential spam. Please revise and try again.", "உங்கள் பதிவு ஸ்பாம் என்று கண்டறியப்பட்டது. திருத்தி மீண்டும் முயற்சிக்கவும்."));
      return;
    }

    const clean = sanitizePayload(data);
    const district = DISTRICTS.find((d) => d.slug === clean.district_slug);
    const category = CATEGORIES.find((c) => c.slug === clean.category_slug);
    const selectedArea = areas.find(a => a.slug === areaSlug);

    // Civic receipt fields for complaints/alerts
    const civicFields = isCivicType ? {
      civic_receipt_id: generateCivicReceiptId(),
      civic_status: "reported",
      urgency_level: selectedUrgency,
      location_text: clean.location_text || "",
      before_photos: mediaUrls,
      verification_count: 0,
      duplicate_count: 0,
      citizen_fixed_count: 0,
      still_not_fixed_count: 0,
      escalation_level: 0,
      is_publicly_visible: true,
      moderation_status: "approved",
      timeline_events: [
        makeTimelineEvent(
          T("Civic Receipt created on NammaTN", "NammaTN-ல் குடிமை ரசீது உருவாக்கப்பட்டது"),
          data.is_anonymous ? T("Anonymous citizen", "அநாமதேய குடிமகன்") : (data.author_name || T("Citizen", "குடிமகன்")),
          "created",
          "user"
        ),
      ],
    } : {};

    const post = await createPost({
      ...clean,
      post_type: selectedType,
      district_name: district ? district.name_en : "",
      category_name: category ? category.name_en : "",
      area_slug: areaSlug || "",
      area_name: selectedArea ? (selectedArea.name_en || "") : areaName || "",
      media_urls: mediaUrls,
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      status: "active",
      is_publicly_visible: true,
      moderation_status: "approved",
      created_by_id: user?.id,
      created_by: user?.full_name || user?.email,
      ...civicFields,
    });

    setSubmittedPost(post);
    setSubmitted(true);

    if (isCivicType && post?.id) {
      setTimeout(() => navigate(`/post/${post.id}`), 1800);
    } else {
      setTimeout(() => navigate("/explore"), 2000);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          {isCivicType ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {T("Civic Receipt Created!", "குடிமை ரசீது உருவாக்கப்பட்டது!")}
              </h2>
              {submittedPost?.civic_receipt_id && (
                <p className="text-lg font-mono font-bold text-blue-600 mb-2">{submittedPost.civic_receipt_id}</p>
              )}
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                {T("Your issue is now publicly documented.", "உங்கள் சிக்கல் இப்போது பொதுவில் ஆவணப்படுத்தப்பட்டது.")}
              </p>
              <p className="text-xs text-blue-600 font-medium mb-1">
                {T("Add an official complaint ID when available.", "கிடைக்கும்போது அதிகாரப்பூர்வ புகார் ID சேர்க்கவும்.")}
              </p>
              <p className="text-xs text-slate-400">{T("Redirecting to Civic Receipt...", "குடிமை ரசீதுக்கு திருப்பி விடுகிறது...")}</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {T("Post Shared!", "பதிவு பகிரப்பட்டது!")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {T("Redirecting to explore...", "ஆராய்வுக்கு திருப்பி விடுகிறது...")}
              </p>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {T("Share an Update", "ஒரு புதுப்பிப்பை பகிரவும்")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {T("Your voice matters. Post anonymously if you prefer.", "உங்கள் குரல் முக்கியம். விரும்பினால் அநாமதேயமாக பதிவிடலாம்.")}
        </p>
      </div>

      {!isAuthenticated && (
        <div className="mb-6">
          <LoginPromptBanner action={T("share an update", "புதுப்பிப்பை பகிர")} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Post Type */}
        <div key="post-type-selector">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
            {T("Post Type", "பதிவு வகை")} *
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POST_TYPES.map(({ value, icon: Icon, en, ta, desc_en, desc_ta, color, isCivic }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setSelectedType(value); setValue("post_type", value); }}
                className={`p-3 rounded-2xl border-2 text-left transition-all relative ${
                  selectedType === value
                    ? `${COLOR_MAP[color]} border-2`
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                }`}
              >
                {isCivic && (
                  <span className="absolute top-1.5 right-1.5 text-xs bg-blue-500 text-white px-1 py-0.5 rounded font-bold leading-none">CR</span>
                )}
                <Icon className={`w-5 h-5 mb-1.5 ${selectedType === value ? "" : "text-slate-400"}`} />
                <p className="font-semibold text-xs">{T(en, ta)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{T(desc_en, desc_ta)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Civic Receipt Banner — shown for complaint/alert types */}
        {isCivicType && (
          <div key="civic-banner-disclaimer-container" className="space-y-6">
            <CivicReceiptBanner lang={lang} />
            {/* Disclaimer acknowledgement */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-amber-600"
                />
                <div>
                  <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">
                    {T("I understand this disclaimer", "இந்த மறுப்பை நான் புரிந்துகொள்கிறேன்")} *
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                    {T(
                      "NammaTN is not a government portal. Your post creates a public Civic Receipt. We help citizens document, verify, route, track, and prove local issues. NammaTN cannot guarantee government action.",
                      "NammaTN ஒரு அரசு போர்ட்டல் அல்ல. உங்கள் பதிவு ஒரு பொது குடிமை ரசீதை உருவாக்குகிறது. உள்ளூர் சிக்கல்களை ஆவணப்படுத்தவும், சரிபார்க்கவும், கண்காணிக்கவும் குடிமக்களுக்கு நாங்கள் உதவுகிறோம்."
                    )}
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Duplicate detection */}
        {isCivicType && showDuplicateWarning && selectedDistrict && selectedCategory && (
          <DuplicateSuggestion
            key="duplicate-suggestion"
            districtSlug={selectedDistrict}
            categorySlug={selectedCategory}
            onContinueNew={() => setShowDuplicateWarning(false)}
            onConfirmExisting={() => setShowDuplicateWarning(false)}
          />
        )}

        {/* District + Category */}
        <div key="district-category-selector" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {T("District", "மாவட்டம்")} *
            </Label>
            <select
              {...register("district_slug")}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{T("Select district", "மாவட்டம் தேர்வு")}</option>
              {DISTRICTS.map((d) => (
                <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>
              ))}
            </select>
            {errors.district_slug && <p className="text-red-500 text-xs mt-1">{errors.district_slug.message}</p>}
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {T("Category", "வகை")} *
            </Label>
            <select
              {...register("category_slug")}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{T("Select category", "வகை தேர்வு")}</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.icon} {T(c.name_en, c.name_ta)}</option>
              ))}
            </select>
            {errors.category_slug && <p className="text-red-500 text-xs mt-1">{errors.category_slug.message}</p>}
          </div>
        </div>

        {/* Area selection (shown when district is chosen) */}
        {selectedDistrict && (
          <div key="area-selector-container">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {T("Area / Locality", "பகுதி / ஊர்")}
            </Label>
            {areas.length > 0 ? (
              <select
                value={areaSlug}
                onChange={(e) => {
                  const sel = areas.find(a => a.slug === e.target.value);
                  setAreaSlug(e.target.value);
                  setAreaName(sel ? sel.name_en : "");
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{T("Select area (optional)", "பகுதி தேர்வு (விருப்பம்)")}</option>
                {areas.map(a => (
                  <option key={a.slug} value={a.slug}>{a.name_en}{a.name_ta ? ` / ${a.name_ta}` : ""}</option>
                ))}
              </select>
            ) : (
              <input
                value={areaName}
                onChange={(e) => { setAreaName(e.target.value); setAreaSlug(""); }}
                placeholder={T("Type your area/locality name (optional)", "உங்கள் பகுதி / ஊரின் பெயர் (விருப்பம்)")}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        )}

        {/* Title */}
        <div key="title-container">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {isCivicType ? T("Issue Title", "சிக்கல் தலைப்பு") : T("Title", "தலைப்பு")} *
          </Label>
          <Input
            {...register("title_en")}
            placeholder={isCivicType
              ? T("e.g. Broken road near Poonamallee bus stand", "எ.கா. பூனமல்லி பேருந்து நிறுத்தம் அருகே சேதமடைந்த சாலை")
              : T("Brief, clear title...", "சுருக்கமான, தெளிவான தலைப்பு...")}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
          />
          {errors.title_en && <p className="text-red-500 text-xs mt-1">{errors.title_en.message}</p>}
        </div>

        {/* Location (civic only) */}
        {isCivicType && (
          <div key="location-container">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {T("Exact Location / Landmark", "சரியான இடம் / அடையாளம்")}
            </Label>
            <Input
              {...register("location_text")}
              placeholder={T("e.g. Near Gandhi statue, Anna Nagar", "எ.கா. அண்ணா நகர் காந்தி சிலை அருகில்")}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
            />
          </div>
        )}

        {/* Content */}
        <div key="content-container">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {isCivicType ? T("Issue Description", "சிக்கல் விவரம்") : T("Details", "விவரங்கள்")} *
          </Label>
          <Textarea
            {...register("content_en")}
            placeholder={isCivicType
              ? T("Describe the issue clearly. When did it start? How is it affecting people?", "சிக்கலை தெளிவாக விவரிக்கவும். எப்போது தொடங்கியது? மக்களை எவ்வாறு பாதிக்கிறது?")
              : T("Describe the situation in detail...", "சூழ்நிலையை விரிவாக விவரியுங்கள்...")}
            className="min-h-[140px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
          />
          {errors.content_en && <p className="text-red-500 text-xs mt-1">{errors.content_en.message}</p>}
        </div>

        {/* Urgency (civic only) */}
        {isCivicType && (
          <div key="urgency-container">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              {T("Urgency Level", "அவசர நிலை")}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {URGENCY_LEVELS.map(u => (
                <button
                  key={u.key}
                  type="button"
                  onClick={() => { setSelectedUrgency(u.key); setValue("urgency_level", u.key); }}
                  className={`p-2.5 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                    selectedUrgency === u.key
                      ? `${u.bg} ${u.color} border-current`
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {T(u.label, u.label_ta)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Media Upload */}
        <div key="media-upload-container">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {isCivicType
              ? T("Before Photos (proof)", "முன்பு புகைப்படங்கள் (ஆதாரம்)")
              : T("Add Media (optional)", "மீடியா சேர்க்கவும் (விருப்பத்தேர்வு)")}
          </Label>
          {isCivicType ? (
            <div className="mb-2">
              <p className="text-xs text-slate-500">{T("Upload photos showing the current state of the issue.", "சிக்கலின் தற்போதைய நிலையை காட்டும் புகைப்படங்களை பதிவேற்றவும்.")}</p>
              {mediaUrls.length === 0 && (
                <p className="text-xs text-orange-600 mt-1 font-medium">
                  ⚠ {T("Photo proof is strongly recommended for Civic Receipts — it makes your report more credible.", "குடிமை ரசீதுகளுக்கு புகைப்பட ஆதாரம் கடுமையாக பரிந்துரைக்கப்படுகிறது — இது உங்கள் புகாரை நம்பகமானதாக ஆக்குகிறது.")}
                </p>
              )}
            </div>
          ) : null}
          <MediaUploader key="post-media-uploader" onUrlsChange={setMediaUrls} />
        </div>

        {/* Anonymous */}
        <div key="anonymous-container" className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("is_anonymous")}
              className="mt-0.5 w-4 h-4 rounded accent-blue-600"
            />
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {T("Post Anonymously", "அநாமதேயமாக பதிவிடவும்")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {T("Your identity will not be shown.", "உங்கள் அடையாளம் காண்பிக்கப்படாது.")}
              </p>
            </div>
          </label>
          {!isAnon && (
            <div className="mt-3">
              <Input
                {...register("author_name")}
                placeholder={T("Your name (optional)", "உங்கள் பெயர் (விருப்பத்தேர்வு)")}
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-sm"
              />
            </div>
          )}
        </div>

        {/* Sensitive data warning */}
        {sensitiveWarning && (
          <div key="sensitive-warning" className="space-y-2">
            <SensitiveDataWarning findings={sensitiveWarning} />
            <p className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {T(
                "Your post may contain personal information. Submit anyway? Click Publish again to confirm.",
                "உங்கள் பதிவில் தனிப்பட்ட தகவல் இருக்கலாம். மீண்டும் வெளியிடு என்பதை கிளிக் செய்து உறுதிப்படுத்தவும்."
              )}
            </p>
          </div>
        )}

        {(spamError || rateLimitMsg) && (
          <div key="spam-rate-error-banner" className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{spamError || rateLimitMsg}</span>
          </div>
        )}

        <Button
          key="submit-button"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-xl"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              {T("Publishing...", "வெளியிடுகிறது...")}
            </span>
          ) : isCivicType ? (
            <span className="flex items-center gap-2 justify-center">
              <FileText className="w-4 h-4" />
              {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கவும்")}
            </span>
          ) : (
            T("Publish Post", "பதிவை வெளியிடவும்")
          )}
        </Button>
      </form>
    </div>
  );
}