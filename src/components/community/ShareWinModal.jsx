import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  X, CheckCircle2, Upload, MapPin, Users,
  ImageIcon, AlertTriangle, ChevronDown,
  Eye, EyeOff, Shield, Trophy, ArrowRight, Loader2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/categories";
import { DISTRICTS } from "@/lib/districts";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { generateCivicReceiptId, makeTimelineEvent } from "@/lib/civicReceipt";

/* ─── Reusable field components ────────────────────────────── */
function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function HelperText({ children, warning }) {
  return (
    <p className={`text-[11px] mt-1 ${warning ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"}`}>
      {children}
    </p>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${className}`}
      {...props}
    />
  );
}

function Select({ children, className = "", ...props }) {
  return (
    <div className="relative">
      <select
        className={`w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      {title && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          {icon}
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

/* ─── Photo upload zone ─────────────────────────────────────── */
function PhotoUpload({ label, value, onChange, sublabel }) {
  const inputRef = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ file, url });
  };

  return (
    <div>
      <Label>{label}</Label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors overflow-hidden"
        style={{ minHeight: "108px" }}
      >
        {value?.url ? (
          <div className="relative">
            <img src={value.url} alt={label} className="w-full h-28 object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-500">
            <Upload className="w-6 h-6" />
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Click to upload</p>
              {sublabel && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sublabel}</p>}
            </div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

/* ─── Toggle chip ───────────────────────────────────────────── */
function ToggleChip({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function ShareWinModal({ onClose }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    what_was_fixed: "",
    why_matters: "",
    area: "",
    district: "",
    landmark: "",
    civic_receipt_id: "",
    resolution_date: "",
    verified_count: "",
    visibility: "public",
    show_name: true,
    before_photo: null,
    after_photo: null,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = T("Win title is required", "வெற்றியின் தலைப்பு தேவை");
    if (!form.category) e.category = T("Please select a category", "தயவுசெய்து ஒரு வகையைத் தேர்ந்தெடுக்கவும்");
    if (!form.description.trim()) e.description = T("A short description is required", "ஒரு சுருக்கமான விளக்கம் தேவை");
    if (!form.district) e.district = T("Please select a district", "தயவுசெய்து ஒரு மாவட்டத்தைத் தேர்ந்தெடுக்கவும்");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const uploadPhoto = async (photoObj) => {
    if (!photoObj || !photoObj.file) return null;
    const file = photoObj.file;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    let file_url = publicUrl;
    if (file_url && !file_url.includes('/storage/v1/object/public/')) {
      file_url = file_url.replace('/storage/v1/object/media/', '/storage/v1/object/public/media/');
    }
    return file_url;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      requireAuth(() => {}, T("Sign in to share a win", "வெற்றியைப் பகிர உள்நுழையுங்கள்"));
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setSubmitError("");

    try {
      // 1. Upload photos if they exist
      const beforeUrl = await uploadPhoto(form.before_photo);
      const afterUrl = await uploadPhoto(form.after_photo);

      const beforePhotosArray = beforeUrl ? [beforeUrl] : [];
      const afterPhotosArray = afterUrl ? [afterUrl] : [];

      // Format description by concatenating what was fixed and why it matters
      let fullDescription = form.description.trim();
      if (form.what_was_fixed.trim()) {
        fullDescription += `\n\n**What was fixed:**\n${form.what_was_fixed.trim()}`;
      }
      if (form.why_matters.trim()) {
        fullDescription += `\n\n**Why it matters:**\n${form.why_matters.trim()}`;
      }

      if (form.civic_receipt_id.trim()) {
        // Case A: Link to an existing civic receipt
        const receiptId = form.civic_receipt_id.trim();
        const { data: existingPost, error: findError } = await supabase
          .from("post")
          .select("*")
          .eq("civic_receipt_id", receiptId)
          .maybeSingle();

        if (findError) throw findError;
        if (!existingPost) {
          setErrors((errs) => ({ ...errs, civic_receipt_id: T("No civic receipt found with this ID", "இந்த ஐடியுடன் கூடிய குடிமை ரசீது எதுவும் இல்லை") }));
          setLoading(false);
          return;
        }

        // Merge photos and update status
        const existingBefore = Array.isArray(existingPost.before_photos) ? existingPost.before_photos : [];
        const updatedBefore = beforeUrl ? [...existingBefore, beforeUrl] : existingBefore;

        const existingAfter = Array.isArray(existingPost.claimed_fixed_photos) ? existingPost.claimed_fixed_photos : [];
        const updatedAfter = afterUrl ? [...existingAfter, afterUrl] : existingAfter;

        const existingTimeline = Array.isArray(existingPost.timeline_events) ? existingPost.timeline_events : [];
        const newEvent = makeTimelineEvent(
          T("Citizen shared resolution proof", "குடிமகன் தீர்வுக்கான ஆதாரத்தைப் பகிர்ந்துள்ளார்"),
          form.show_name ? user?.full_name : T("Citizen", "குடிமகன்"),
          "resolution_claimed",
          "user"
        );

        const { error: updateError } = await supabase
          .from("post")
          .update({
            before_photos: updatedBefore,
            claimed_fixed_photos: updatedAfter,
            civic_status: "claimed_fixed",
            timeline_events: [...existingTimeline, newEvent],
            updated_date: new Date().toISOString(),
          })
          .eq("id", existingPost.id);

        if (updateError) throw updateError;
      } else {
        // Case B: Create new civic win from scratch
        const newReceiptId = generateCivicReceiptId();
        const districtObj = DISTRICTS.find(d => d.slug === form.district);
        const catObj = CATEGORIES.find(c => c.slug === form.category);

        const timeline = [
          makeTimelineEvent(
            T("Civic Win shared by citizen", "குடிமகனால் குடிமை வெற்றி பகிரப்பட்டது"),
            form.show_name ? user?.full_name : T("Citizen", "குடிமகன்"),
            "created",
            "user"
          ),
        ];

        const { error: insertError } = await supabase
          .from("post")
          .insert({
            post_type: "complaint",
            civic_receipt_id: newReceiptId,
            civic_status: "claimed_fixed",
            moderation_status: "pending",
            status: "active",
            title_en: form.title.trim(),
            content_en: fullDescription,
            category_slug: form.category,
            category_name: catObj?.name_en || "",
            district_slug: form.district,
            district_name: districtObj?.name_en || "",
            area_name: form.area.trim() || "",
            location_text: form.landmark.trim() || "",
            before_photos: beforePhotosArray,
            claimed_fixed_photos: afterPhotosArray,
            verification_count: parseInt(form.verified_count) || 1,
            is_anonymous: form.visibility === "anonymous",
            author_name: form.show_name ? user?.full_name : "Citizen",
            created_by_id: user?.id,
            created_by: user?.full_name || user?.email,
            timeline_events: timeline,
          });

        if (insertError) throw insertError;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit community win:", err);
      setSubmitError(T("Something went wrong. Please try again.", "ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்."));
    } finally {
      setLoading(false);
    }
  };

  const missingProof = !form.before_photo && !form.after_photo;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
            {T("Win Shared!", "வெற்றி பகிரப்பட்டது!")}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {T("Your community win has been submitted for review. Thank you for sharing real civic progress!", "உங்கள் சமூக வெற்றி மதிப்பாய்விற்காக சமர்ப்பிக்கப்பட்டுள்ளது. உண்மையான குடிமை முன்னேற்றத்தை பகிர்ந்ததற்கு நன்றி!")}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/community/wins"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              {T("View Community Wins", "சமூக வெற்றிகளைப் பார்")} <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={onClose}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 py-2"
            >
              {T("Close", "மூடு")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-slate-50 dark:bg-slate-950 w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal header */}
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {T("Share a Win", "வெற்றி பகிர்")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {T("Tell the community about a real improvement in your area.", "உங்கள் பகுதியில் நிஜமான முன்னேற்றத்தை சமூகத்திடம் தெரிவிக்கவும்.")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trust banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30 px-5 py-2.5 flex items-center gap-2 flex-shrink-0">
          <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[11px] text-blue-700 dark:text-blue-300">
            {T("Only submit real, verifiable wins. Proof photos help the community trust your submission.", "உண்மையான, சரிபார்க்கக்கூடிய வெற்றிகளை மட்டுமே சமர்ப்பிக்கவும். ஆதார புகைப்படங்கள் சமூகத்தினர் உங்கள் சமர்ப்பிப்பை நம்ப உதவும்.")}
          </p>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">

          {/* 1. Win Details */}
          <SectionCard
            title={T("Win Details", "வெற்றி விவரங்கள்")}
            icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
          >
            <div className="space-y-4">
              <div>
                <Label required>{T("Win Title", "வெற்றி தலைப்பு")}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder={T("e.g. Road repaired on 5th Avenue", "எ.கா. 5வது அவென்யூவில் சாலை சீரமைக்கப்பட்டது")}
                  maxLength={120}
                />
                {errors.title && <HelperText warning>{errors.title}</HelperText>}
                <HelperText>{T("Keep it short and specific. What was fixed?", "சுருக்கமாகவும் குறிப்பாகவும் இருக்கட்டும். என்ன சரி செய்யப்பட்டது?")}</HelperText>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>{T("Category", "வகை")}</Label>
                  <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                    <option value="">{T("Select category", "வகையைத் தேர்ந்தெடு")}</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.icon} {T(c.name_en, c.name_ta)}</option>
                    ))}
                  </Select>
                  {errors.category && <HelperText warning>{errors.category}</HelperText>}
                </div>
                <div>
                  <Label>{T("Related Civic Receipt", "தொடர்புடைய குடிமை ரசீது")}</Label>
                  <Input
                    value={form.civic_receipt_id}
                    onChange={(e) => set("civic_receipt_id", e.target.value)}
                    placeholder={T("CR-XXXXX (optional)", "CR-XXXXX (விருப்பத்திற்குரியது)")}
                  />
                  <HelperText>{T("Link to an existing civic receipt", "ஏற்கனவே உள்ள குடிமை ரசீதுடன் இணைக்கவும்")}</HelperText>
                </div>
              </div>
              <div>
                <Label required>{T("Short Description", "சுருக்கமான விளக்கம்")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  placeholder={T("Brief summary of what happened and how it was resolved...", "என்ன நடந்தது மற்றும் அது எவ்வாறு தீர்க்கப்பட்டது என்பதன் சுருக்கம்...")}
                  maxLength={300}
                />
                {errors.description && <HelperText warning>{errors.description}</HelperText>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{T("What was fixed?", "என்ன சரி செய்யப்பட்டது?")}</Label>
                  <Textarea
                    value={form.what_was_fixed}
                    onChange={(e) => set("what_was_fixed", e.target.value)}
                    rows={2}
                    placeholder={T("Describe the original problem and what changed...", "அசல் பிரச்சனை மற்றும் என்ன மாறியது என்பதை விவரிக்கவும்...")}
                  />
                </div>
                <div>
                  <Label>{T("Why does it matter?", "இது ஏன் முக்கியம்?")}</Label>
                  <Textarea
                    value={form.why_matters}
                    onChange={(e) => set("why_matters", e.target.value)}
                    rows={2}
                    placeholder={T("Impact on the community, safety, health...", "சமூகத்தில் தாக்கம், பாதுகாப்பு, சுகாதாரம்...")}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 2. Proof */}
          <SectionCard
            title={T("Proof (Before & After)", "ஆதாரம் (முன்பு & பின்பு)")}
            icon={<ImageIcon className="w-4 h-4 text-blue-500" />}
          >
            <div className="grid grid-cols-2 gap-4">
              <PhotoUpload
                label={T("Before Photo", "முன்பு புகைப்படம்")}
                value={form.before_photo}
                onChange={(v) => set("before_photo", v)}
                sublabel={T("Show the original problem", "அசல் சிக்கலைக் காட்டு")}
              />
              <PhotoUpload
                label={T("After Photo", "பின்பு புகைப்படம்")}
                value={form.after_photo}
                onChange={(v) => set("after_photo", v)}
                sublabel={T("Show the resolved state", "தீர்க்கப்பட்ட நிலையைக் காட்டு")}
              />
            </div>
            {missingProof && (
              <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-3">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  {T("Proof photos help the community trust this win. You can still submit without them, but adding photos increases credibility.", "ஆதாரப் புகைப்படங்கள் சமூகத்தினர் இந்த வெற்றியை நம்ப உதவும். அவை இல்லாமலும் நீங்கள் சமர்ப்பிக்கலாம், ஆனால் புகைப்படங்களைச் சேர்ப்பது நம்பகத்தன்மையை அதிகரிக்கும்.")}
                </p>
              </div>
            )}
          </SectionCard>

          {/* 3. Location */}
          <SectionCard
            title={T("Location", "இருப்பிடம்")}
            icon={<MapPin className="w-4 h-4 text-purple-500" />}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>{T("District", "மாவட்டம்")}</Label>
                  <Select value={form.district} onChange={(e) => set("district", e.target.value)}>
                    <option value="">{T("Select district", "மாவட்டத்தைத் தேர்ந்தெடு")}</option>
                    {DISTRICTS.map((d) => (
                      <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>
                    ))}
                  </Select>
                  {errors.district && <HelperText warning>{errors.district}</HelperText>}
                </div>
                <div>
                  <Label>{T("Area / Neighbourhood", "பகுதி / அக்கம் பக்கம்")}</Label>
                  <Input
                    value={form.area}
                    onChange={(e) => set("area", e.target.value)}
                    placeholder={T("e.g. Anna Nagar, Velachery", "எ.கா. அண்ணா நகர், வேளச்சேரி")}
                  />
                </div>
              </div>
              <div>
                <Label>{T("Exact Location / Landmark", "துல்லியமான இருப்பிடம் / அடையாளக் குறி")}</Label>
                <Input
                  value={form.landmark}
                  onChange={(e) => set("landmark", e.target.value)}
                  placeholder={T("e.g. Near bus stand, 5th cross street...", "எ.கா. பேருந்து நிலையம் அருகில், 5வது குறுக்குத் தெரு...")}
                />
                {!form.area && !form.landmark && (
                  <HelperText warning>{T("Including an area or landmark helps others find this win on the map.", "பகுதி அல்லது அடையாளக் குறியைச் சேர்ப்பது மற்றவர்கள் இந்த வெற்றியை வரைபடத்தில் கண்டறிய உதவும்.")}</HelperText>
                )}
              </div>
            </div>
          </SectionCard>

          {/* 4. Verification */}
          <SectionCard
            title={T("Verification", "சரிபார்ப்பு")}
            icon={<Users className="w-4 h-4 text-green-500" />}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{T("Resolution Date", "தீர்க்கப்பட்ட தேதி")}</Label>
                <Input
                  type="date"
                  value={form.resolution_date}
                  onChange={(e) => set("resolution_date", e.target.value)}
                />
              </div>
              <div>
                <Label>{T("Verified by how many citizens?", "எத்தனை குடிமக்களால் சரிபார்க்கப்பட்டது?")}</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.verified_count}
                  onChange={(e) => set("verified_count", e.target.value)}
                  placeholder={T("e.g. 12", "எ.கா. 12")}
                />
                <HelperText>{T("Approximate number of citizens who confirmed this", "இதை உறுதிப்படுத்திய குடிமக்களின் தோராயமான எண்ணிக்கை")}</HelperText>
              </div>
            </div>
          </SectionCard>

          {/* 5. Visibility */}
          <SectionCard
            title={T("Visibility", "காணக்கூடிய தன்மை")}
            icon={<Eye className="w-4 h-4 text-slate-500" />}
          >
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                active={form.visibility === "public"}
                onClick={() => set("visibility", "public")}
                icon={<Eye className="w-3.5 h-3.5" />}
                label={T("Post publicly", "பொதுவாகப் பதிவிடு")}
              />
              <ToggleChip
                active={form.visibility === "anonymous"}
                onClick={() => set("visibility", "anonymous")}
                icon={<EyeOff className="w-3.5 h-3.5" />}
                label={T("Post anonymously", "பெயரிடாமல் பதிவிடு")}
              />
              <ToggleChip
                active={form.show_name}
                onClick={() => set("show_name", !form.show_name)}
                icon={<Users className="w-3.5 h-3.5" />}
                label={form.show_name ? T("Showing my name", "என் பெயரைக்காட்டு") : T("Name hidden", "பெயர் மறைக்கப்பட்டுள்ளது")}
              />
            </div>
            <HelperText>{T("Public posts are visible to everyone. Anonymous posts hide your identity.", "பொதுப் பதிவுகள் அனைவருக்கும் தெரியும். அநாமதேயப் பதிவுகள் உங்கள் அடையாளத்தை மறைக்கும்.")}</HelperText>
          </SectionCard>

          {/* Preview card */}
          {(form.title || form.category) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-green-200 dark:border-green-800/50 p-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">{T("Preview", "முன்னோட்டம்")}</p>
              <div className="flex items-start gap-3">
                {form.after_photo?.url && (
                  <img src={form.after_photo.url} alt="preview" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {form.category && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mb-1">
                      {CATEGORIES.find((c) => c.slug === form.category)?.icon} {T(CATEGORIES.find((c) => c.slug === form.category)?.name_en, CATEGORIES.find((c) => c.slug === form.category)?.name_ta)}
                    </span>
                  )}
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                    {form.title || T("Win title will appear here", "வெற்றி தலைப்பு இங்கே தோன்றும்")}
                  </p>
                  {(form.area || form.district) && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {[form.area, T(DISTRICTS.find((d) => d.slug === form.district)?.name_en, DISTRICTS.find((d) => d.slug === form.district)?.name_ta)].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                  {T("Resolved", "தீர்க்கப்பட்டது")}
                </span>
              </div>
            </div>
          )}
        </form>

        {submitError && (
          <div className="mx-5 mb-2 flex items-start gap-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-xl p-3 text-xs text-red-600">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p>{submitError}</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            {T("Cancel", "ரத்து செய்")}
          </button>
          <button
            type="button"
            disabled={loading}
            className="border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
          >
            {T("Save Draft", "வரைவைச் சேமி")}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {T("Submitting...", "சமர்ப்பிக்கிறது...")}
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                {T("Share Win", "வெற்றியைப் பகிர்")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
