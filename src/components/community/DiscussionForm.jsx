import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { X, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { sanitizeText, checkRateLimit, detectSpam } from "@/lib/security";
import { checkContentSafety, SAFETY_REMINDER_EN } from "@/lib/contentSafety";
import { useToast } from "@/components/ui/use-toast";

const TYPES = [
  { value: "civic", label: "Civic Issue" },
  { value: "awareness", label: "Awareness" },
  { value: "local_concern", label: "Local Concern" },
  { value: "positive", label: "Positive News" },
  { value: "question", label: "Question" },
];

const TOPICS = [
  "water", "traffic", "offices", "jobs", "emergency",
  "transport", "internet", "development", "education", "healthcare", "general",
];

export default function DiscussionForm({ onClose, onSuccess, districtSlug, districtName, areaSlug, areaName, defaultType, isLive }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();
  const { toast } = useToast();
  const submitting = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    discussion_type: defaultType || "civic",
    topic: "general",
    district_slug: districtSlug || "",
    district_name: districtName || "",
    area_slug: areaSlug || "",
    area_name: areaName || "",
    author_label: user?.full_name || "Community Member",
    is_anonymous: true,
    is_live: isLive || false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      requireAuth(() => {}, T("Sign in to start a discussion", "விவாதம் தொடங்க உள்நுழையுங்கள்"));
      return;
    }
    if (submitting.current) return;

    const title = form.title.trim();
    const content = form.content.trim();
    setError(null);

    if (!title) { setError(T("Title is required.", "தலைப்பு தேவை.")); return; }
    if (title.length < 5) { setError(T("Title is too short.", "தலைப்பு மிகவும் குறுகியது.")); return; }
    if (!content) { setError(T("Content is required.", "உள்ளடக்கம் தேவை.")); return; }
    if (content.length < 10) { setError(T("Please add more details.", "மேலும் விவரங்கள் சேர்க்கவும்.")); return; }

    if (detectSpam(title) || detectSpam(content)) {
      setError(T("Content flagged as spam. Please revise.", "உள்ளடக்கம் ஸ்பேம் என கண்டறியப்பட்டது."));
      return;
    }

    const safety = checkContentSafety(title + " " + content);
    if (!safety.safe) {
      setError(T("Content violates community guidelines.", "உள்ளடக்கம் சமுதாய வழிகாட்டுதல்களை மீறுகிறது."));
      return;
    }

    if (!checkRateLimit("discussion_create", 3, 300_000)) {
      setError(T("You're posting too fast. Please wait a few minutes.", "நீங்கள் மிக வேகமாக இடுகிறீர்கள்."));
      return;
    }

    submitting.current = true;
    setLoading(true);
    const session = user?.id || localStorage.getItem("tn_session") || Math.random().toString(36).slice(2);
    localStorage.setItem("tn_session", session);

    await base44.entities.CommunityDiscussion.create({
      ...form,
      title: sanitizeText(title),
      content: sanitizeText(content),
      author_session: session,
      author_label: form.is_anonymous ? "Community Member" : (user?.full_name || "Community Member"),
      is_pending_review: safety.needsReview,
    });

    setLoading(false);
    submitting.current = false;
    toast({ description: T("Discussion posted!", "விவாதம் இடப்பட்டது!") });
    onSuccess?.();
    onClose();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{T("Start a Discussion", "விவாதம் தொடங்கு")}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>
      <p className="text-xs text-slate-500 mb-3">{SAFETY_REMINDER_EN}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={T("Discussion title...", "விவாத தலைப்பு...")}
          maxLength={200}
          className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder={T("Share more details...", "மேலும் விவரங்கள் பகிரவும்...")}
          rows={3}
          maxLength={1000}
          className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex gap-2 flex-wrap">
          <select
            value={form.discussion_type}
            onChange={(e) => setForm({ ...form, discussion_type: e.target.value })}
            className="border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            {TOPICS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {error}</p>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
            <input type="checkbox" checked={form.is_anonymous} onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })} className="rounded" />
            {T("Post anonymously", "அனாமதேயமாக இடுகை")}
          </label>
          <Button type="submit" size="sm" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? T("Posting...", "இடுகிறது...") : T("Post", "இடு")}
          </Button>
        </div>
      </form>
    </div>
  );
}