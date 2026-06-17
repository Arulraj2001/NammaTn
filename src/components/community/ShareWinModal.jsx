import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  X, CheckCircle2, Upload, MapPin, Users,
  ImageIcon, AlertTriangle, ChevronDown,
  Eye, EyeOff, Shield, Trophy, ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/categories";
import { DISTRICTS } from "@/lib/districts";

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

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Win title is required";
    if (!form.category) e.category = "Please select a category";
    if (!form.description.trim()) e.description = "A short description is required";
    if (!form.district) e.district = "Please select a district";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  const missingProof = !form.before_photo && !form.after_photo;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Win Shared!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Your community win has been submitted for review. Thank you for sharing real civic progress!
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/community/wins"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              View Community Wins <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={onClose}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 py-2"
            >
              Close
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
            Only submit real, verifiable wins. Proof photos help the community trust your submission.
          </p>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">

          {/* 1. Win Details */}
          <SectionCard
            title="Win Details"
            icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
          >
            <div className="space-y-4">
              <div>
                <Label required>Win Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Road repaired on 5th Avenue"
                  maxLength={120}
                />
                {errors.title && <HelperText warning>{errors.title}</HelperText>}
                <HelperText>Keep it short and specific. What was fixed?</HelperText>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>Category</Label>
                  <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.icon} {c.name_en}</option>
                    ))}
                  </Select>
                  {errors.category && <HelperText warning>{errors.category}</HelperText>}
                </div>
                <div>
                  <Label>Related Civic Receipt</Label>
                  <Input
                    value={form.civic_receipt_id}
                    onChange={(e) => set("civic_receipt_id", e.target.value)}
                    placeholder="CR-XXXXX (optional)"
                  />
                  <HelperText>Link to an existing civic receipt</HelperText>
                </div>
              </div>
              <div>
                <Label required>Short Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  placeholder="Brief summary of what happened and how it was resolved..."
                  maxLength={300}
                />
                {errors.description && <HelperText warning>{errors.description}</HelperText>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>What was fixed?</Label>
                  <Textarea
                    value={form.what_was_fixed}
                    onChange={(e) => set("what_was_fixed", e.target.value)}
                    rows={2}
                    placeholder="Describe the original problem and what changed..."
                  />
                </div>
                <div>
                  <Label>Why does it matter?</Label>
                  <Textarea
                    value={form.why_matters}
                    onChange={(e) => set("why_matters", e.target.value)}
                    rows={2}
                    placeholder="Impact on the community, safety, health..."
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 2. Proof */}
          <SectionCard
            title="Proof (Before & After)"
            icon={<ImageIcon className="w-4 h-4 text-blue-500" />}
          >
            <div className="grid grid-cols-2 gap-4">
              <PhotoUpload
                label="Before Photo"
                value={form.before_photo}
                onChange={(v) => set("before_photo", v)}
                sublabel="Show the original problem"
              />
              <PhotoUpload
                label="After Photo"
                value={form.after_photo}
                onChange={(v) => set("after_photo", v)}
                sublabel="Show the resolved state"
              />
            </div>
            {missingProof && (
              <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-3">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Proof photos help the community trust this win. You can still submit without them, but adding photos increases credibility.
                </p>
              </div>
            )}
          </SectionCard>

          {/* 3. Location */}
          <SectionCard
            title="Location"
            icon={<MapPin className="w-4 h-4 text-purple-500" />}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>District</Label>
                  <Select value={form.district} onChange={(e) => set("district", e.target.value)}>
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.name_en}</option>
                    ))}
                  </Select>
                  {errors.district && <HelperText warning>{errors.district}</HelperText>}
                </div>
                <div>
                  <Label>Area / Neighbourhood</Label>
                  <Input
                    value={form.area}
                    onChange={(e) => set("area", e.target.value)}
                    placeholder="e.g. Anna Nagar, Velachery"
                  />
                </div>
              </div>
              <div>
                <Label>Exact Location / Landmark</Label>
                <Input
                  value={form.landmark}
                  onChange={(e) => set("landmark", e.target.value)}
                  placeholder="e.g. Near bus stand, 5th cross street..."
                />
                {!form.area && !form.landmark && (
                  <HelperText warning>Including an area or landmark helps others find this win on the map.</HelperText>
                )}
              </div>
            </div>
          </SectionCard>

          {/* 4. Verification */}
          <SectionCard
            title="Verification"
            icon={<Users className="w-4 h-4 text-green-500" />}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Resolution Date</Label>
                <Input
                  type="date"
                  value={form.resolution_date}
                  onChange={(e) => set("resolution_date", e.target.value)}
                />
              </div>
              <div>
                <Label>Verified by how many citizens?</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.verified_count}
                  onChange={(e) => set("verified_count", e.target.value)}
                  placeholder="e.g. 12"
                />
                <HelperText>Approximate number of citizens who confirmed this</HelperText>
              </div>
            </div>
          </SectionCard>

          {/* 5. Visibility */}
          <SectionCard
            title="Visibility"
            icon={<Eye className="w-4 h-4 text-slate-500" />}
          >
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                active={form.visibility === "public"}
                onClick={() => set("visibility", "public")}
                icon={<Eye className="w-3.5 h-3.5" />}
                label="Post publicly"
              />
              <ToggleChip
                active={form.visibility === "anonymous"}
                onClick={() => set("visibility", "anonymous")}
                icon={<EyeOff className="w-3.5 h-3.5" />}
                label="Post anonymously"
              />
              <ToggleChip
                active={form.show_name}
                onClick={() => set("show_name", !form.show_name)}
                icon={<Users className="w-3.5 h-3.5" />}
                label={form.show_name ? "Showing my name" : "Name hidden"}
              />
            </div>
            <HelperText>Public posts are visible to everyone. Anonymous posts hide your identity.</HelperText>
          </SectionCard>

          {/* Preview card */}
          {(form.title || form.category) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-green-200 dark:border-green-800/50 p-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Preview</p>
              <div className="flex items-start gap-3">
                {form.after_photo?.url && (
                  <img src={form.after_photo.url} alt="preview" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {form.category && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mb-1">
                      {CATEGORIES.find((c) => c.slug === form.category)?.icon} {CATEGORIES.find((c) => c.slug === form.category)?.name_en}
                    </span>
                  )}
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                    {form.title || "Win title will appear here"}
                  </p>
                  {(form.area || form.district) && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {[form.area, DISTRICTS.find((d) => d.slug === form.district)?.name_en].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                  Resolved
                </span>
              </div>
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Trophy className="w-4 h-4" />
            Share Win
          </button>
        </div>
      </div>
    </div>
  );
}
