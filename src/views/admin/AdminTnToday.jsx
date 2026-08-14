"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminListTnToday, adminGetTnTodayById, createTnToday,
  updateTnToday, deleteTnToday, generateSlug, estimateReadingTime
} from "@/services/tnToday";
import RichEditor from "@/components/tntoday/RichEditor";
import ImportTnToday from "@/components/tntoday/ImportTnToday";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus, Edit, Trash2, Eye, Save, Send, Archive, Star, StarOff,
  Clock, Calendar, Tag, FileText, Globe, Search, X, ArrowLeft,
  CheckCircle2, AlertCircle, BookOpen, ChevronDown, Image, Link2,
  List, RefreshCw, FileJson, Loader2
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

import { translateTextToTamil, translateHtmlToTamil } from "@/services/translate";

const CATEGORIES = [
  { value: "infrastructure", label: "🏗️ Infrastructure", color: "bg-blue-100 text-blue-700" },
  { value: "education",      label: "🎓 Education",      color: "bg-green-100 text-green-700" },
  { value: "healthcare",     label: "🏥 Healthcare",     color: "bg-red-100 text-red-700" },
  { value: "environment",    label: "🌿 Environment",    color: "bg-emerald-100 text-emerald-700" },
  { value: "economy",        label: "💰 Economy",        color: "bg-yellow-100 text-yellow-700" },
  { value: "governance",     label: "🏛️ Governance",    color: "bg-purple-100 text-purple-700" },
  { value: "transport",      label: "🚌 Transport",      color: "bg-orange-100 text-orange-700" },
  { value: "agriculture",    label: "🌾 Agriculture",    color: "bg-lime-100 text-lime-700" },
  { value: "technology",     label: "💻 Technology",     color: "bg-cyan-100 text-cyan-700" },
  { value: "social",         label: "👥 Social",         color: "bg-pink-100 text-pink-700" },
  { value: "india",          label: "🇮🇳 India & Union",  color: "bg-indigo-100 text-indigo-700" },
  { value: "world",          label: "🌐 World & Global",  color: "bg-teal-100 text-teal-700" },
  { value: "general",        label: "📰 General",        color: "bg-slate-100 text-slate-700" },
];

const STATUS_COLORS = {
  draft:     "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  archived:  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const EMPTY_FORM = {
  title: "", title_ta: "", slug: "", subtitle: "", subtitle_ta: "", featured_image: "", category: "general",
  author_name: "VizhiTN Editorial Team", publish_date: "", status: "draft",
  reading_time: 5, content: "", content_ta: "", summary: "", summary_ta: "", why_it_matters: "", why_it_matters_ta: "",
  key_facts: "", timeline: "", official_sources: "", related_civic_links: "",
  seo_title: "", seo_description: "", seo_keywords: "",
  social_image: "", is_featured: false,
};

// ─── Section accordion ────────────────────────────────────────────────────────
function Accordion({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {Icon && <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />}
        <span className="font-semibold text-slate-800 dark:text-white text-sm flex-1">{title}</span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, hint, children, required }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Article list row ─────────────────────────────────────────────────────────
function ArticleRow({ article, onEdit, onDelete, onToggleFeatured }) {
  const cat = CATEGORIES.find(c => c.value === article.category);
  return (
    <div className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0">
      {article.featured_image ? (
        <img src={article.featured_image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-900/60 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-blue-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{article.title}</p>
          {article.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" title="Featured" />}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[article.status])}>
            {article.status}
          </span>
          {cat && <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cat.color)}>{cat.label}</span>}
          <span className="text-xs text-slate-400 flex items-center gap-0.5">
            <Clock className="w-3 h-3" />{article.reading_time || 5}m
          </span>
          {article.publish_date && (
            <span className="text-xs text-slate-400 flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {format(new Date(article.publish_date), "dd MMM yyyy")}
            </span>
          )}
        </div>
        {article.subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{article.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onToggleFeatured(article)}
          className={cn("p-1.5 rounded-lg transition-colors", article.is_featured ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700")}
          title={article.is_featured ? "Unpin from homepage" : "Pin to homepage"}
        >
          {article.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
        </button>
        {article.status === "published" && (
          <a href={`/tn-today/${article.slug}`} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="View live">
            <Eye className="w-4 h-4" />
          </a>
        )}
        <button onClick={() => onEdit(article)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(article.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminTnToday() {
  const [view, setView] = useState("list"); // "list" | "editor"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState("content"); // "content" | "seo" | "structure"
  const [importOpen, setImportOpen] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin-tn-today", filterStatus],
    queryFn: () => adminListTnToday({ status: filterStatus || null }),
    staleTime: 30_000,
  });

  const filtered = articles.filter(a =>
    !searchQ || a.title.toLowerCase().includes(searchQ.toLowerCase())
  );

  const [langSubTab, setLangSubTab] = useState("en");
  const [translating, setTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    if (!form.title && !form.content) {
      toast({ description: "Please enter English title or content first.", variant: "destructive" });
      return;
    }
    setTranslating(true);
    try {
      console.log("[TRANSLATE] Starting translation...");
      console.log("[TRANSLATE] form.title:", JSON.stringify(form.title?.slice(0, 80)));
      console.log("[TRANSLATE] form.subtitle:", JSON.stringify(form.subtitle?.slice(0, 80)));
      console.log("[TRANSLATE] form.content length:", form.content?.length, "chars");

      const title_ta = await translateTextToTamil(form.title);
      console.log("[TRANSLATE] title_ta result:", JSON.stringify(title_ta?.slice(0, 80)));

      const subtitle_ta = await translateTextToTamil(form.subtitle);
      console.log("[TRANSLATE] subtitle_ta result:", JSON.stringify(subtitle_ta?.slice(0, 80)));

      const summary_ta = await translateTextToTamil(form.summary);
      console.log("[TRANSLATE] summary_ta result:", JSON.stringify(summary_ta?.slice(0, 80)));

      const why_it_matters_ta = await translateTextToTamil(form.why_it_matters);
      console.log("[TRANSLATE] why_it_matters_ta result:", JSON.stringify(why_it_matters_ta?.slice(0, 80)));

      const content_ta = await translateHtmlToTamil(form.content);
      console.log("[TRANSLATE] content_ta result length:", content_ta?.length, "chars");
      console.log("[TRANSLATE] content_ta first 200 chars:", JSON.stringify(content_ta?.slice(0, 200)));

      const isSameAsEnglish = title_ta === form.title;
      console.log("[TRANSLATE] title_ta === form.title (UNCHANGED)?", isSameAsEnglish);

      setForm(prev => ({
        ...prev,
        title_ta,
        subtitle_ta,
        summary_ta,
        why_it_matters_ta,
        content_ta,
      }));
      setLangSubTab("ta");
      toast({ description: isSameAsEnglish
        ? "⚠️ Translation API may not be reachable. Check browser console (F12) for details."
        : "⚡ Auto-translated to Tamil! Review or edit in the Tamil tab below."
      });
    } catch (err) {
      console.error("[TRANSLATE] ERROR:", err);
      toast({ description: `Translation failed: ${err.message}`, variant: "destructive" });
    } finally {
      setTranslating(false);
    }
  };

  const setField = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!editingId && form.title && !form.slug) {
      setField("slug", generateSlug(form.title));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  // Auto reading time from content
  useEffect(() => {
    if (form.content) {
      const rt = estimateReadingTime(form.content);
      setField("reading_time", rt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.content]);

  const handleNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, publish_date: new Date().toISOString().slice(0, 16) });
    setLangSubTab("en");
    setView("editor");
    setActiveEditorTab("content");
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    setForm({
      ...EMPTY_FORM,
      ...article,
      publish_date: article.publish_date ? article.publish_date.slice(0, 16) : "",
    });
    setView("editor");
    setActiveEditorTab("content");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return;
    await deleteTnToday(id);
    qc.removeQueries({ queryKey: ["tn-today-articles"], exact: false });
    qc.removeQueries({ queryKey: ["tn-today-featured"], exact: false });
    qc.invalidateQueries({ queryKey: ["admin-tn-today"] });
    toast({ description: "Article deleted." });
  };

  const handleToggleFeatured = async (article) => {
    await updateTnToday(article.id, { is_featured: !article.is_featured });
    qc.removeQueries({ queryKey: ["tn-today-articles"], exact: false });
    qc.removeQueries({ queryKey: ["tn-today-featured"], exact: false });
    qc.invalidateQueries({ queryKey: ["admin-tn-today"] });
    toast({ description: article.is_featured ? "Removed from homepage." : "Pinned to homepage!" });
  };

  const handleSave = async (statusOverride = null) => {
    if (!form.title.trim()) { toast({ description: "Title is required.", variant: "destructive" }); return; }
    if (!form.slug.trim()) { toast({ description: "Slug is required.", variant: "destructive" }); return; }

      const rawCat = (form.category || "general").toLowerCase().trim();
      const validCat = ["infrastructure", "education", "healthcare", "environment", "economy", "governance", "transport", "agriculture", "technology", "social", "general"].includes(rawCat)
        ? rawCat
        : (rawCat === "india" ? "governance" : "general");

      const payload = {
        ...form,
        category: validCat,
        status: statusOverride || form.status,
        publish_date: form.publish_date ? new Date(form.publish_date).toISOString() : null,
        seo_title: form.seo_title || form.title,
        seo_description: form.seo_description || form.subtitle || "",
      };

      if (editingId) {
        await updateTnToday(editingId, payload);
        toast({ description: "Article updated!" });
      } else {
        const created = await createTnToday(payload);
        setEditingId(created.id);
        toast({ description: "Article created!" });
      }

      qc.removeQueries({ queryKey: ["tn-today-articles"], exact: false });
      qc.removeQueries({ queryKey: ["tn-today-featured"], exact: false });
      qc.invalidateQueries({ queryKey: ["admin-tn-today"] });
    } catch (err) {
      toast({ description: `Error: ${err.message}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => handleSave("published");
  const handleDraft = () => handleSave("draft");
  const handleArchive = () => handleSave("archived");
  const handleSchedule = () => handleSave("scheduled");

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────

  if (view === "list") {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">📰</span> TN Today CMS
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage daily Tamil Nadu headlines</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setImportOpen(o => !o)}
              variant="outline"
              className={cn(
                "flex items-center gap-2 border-2 transition-all",
                importOpen
                  ? "border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
                  : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-500"
              )}
            >
              <FileJson className="w-4 h-4" />
              {importOpen ? "Close Import" : "Import JSON"}
            </Button>
            <Button onClick={handleNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" /> New Article
            </Button>
          </div>
        </div>

        {/* Import Panel */}
        {importOpen && (
          <div className="mb-6 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 shadow-sm">
            <ImportTnToday onDone={() => setImportOpen(false)} />
          </div>
        )}


        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {["all", "draft", "published", "archived"].map(s => {
            const count = s === "all" ? articles.length : articles.filter(a => a.status === s).length;
            return (
              <button key={s} onClick={() => setFilterStatus(s === "all" ? "" : s)}
                className={cn("rounded-xl border p-3 text-left transition-all",
                  (filterStatus === s || (s === "all" && !filterStatus))
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300"
                )}>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
                <p className="text-xs text-slate-500 capitalize">{s === "all" ? "Total" : s}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search articles..." className="pl-9 text-sm" />
          {searchQ && <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>

        {/* Articles list */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading articles…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No articles yet</p>
              <p className="text-slate-400 text-sm mt-1">Create your first TN Today headline</p>
              <Button onClick={handleNew} size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Create First Article
              </Button>
            </div>
          ) : (
            filtered.map(a => (
              <ArticleRow key={a.id} article={a} onEdit={handleEdit} onDelete={handleDelete} onToggleFeatured={handleToggleFeatured} />
            ))
          )}
        </div>
      </div>
    );
  }

  // ─── EDITOR VIEW ───────────────────────────────────────────────────────────

  const EDITOR_TABS = [
    { id: "content", label: "✍️ Content" },
    { id: "structure", label: "📋 Sections" },
    { id: "seo", label: "🔍 SEO & Publish" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Articles
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <h1 className="font-bold text-slate-900 dark:text-white text-sm flex-1">
          {editingId ? "Edit Article" : "New Article"}
        </h1>
        {/* Status badge */}
        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", STATUS_COLORS[form.status])}>
          {form.status}
        </span>
        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={handleDraft} disabled={saving}>
            <Save className="w-3.5 h-3.5 mr-1" /> Save Draft
          </Button>
          <Button size="sm" variant="outline" onClick={handleSchedule} disabled={saving}>
            <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
            <Send className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving…" : "Publish"}
          </Button>
          {form.status === "published" && (
            <Button size="sm" variant="outline" onClick={handleArchive} disabled={saving} className="text-rose-600 border-rose-200 hover:bg-rose-50">
              <Archive className="w-3.5 h-3.5 mr-1" /> Archive
            </Button>
          )}
        </div>
      </div>

      {/* Editor tabs */}
      <div className="flex gap-1 mb-5 border-b border-slate-200 dark:border-slate-700 pb-0">
        {EDITOR_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveEditorTab(tab.id)}
            className={cn("px-4 py-2 text-sm font-medium rounded-t-lg transition-all -mb-px border-b-2",
              activeEditorTab === tab.id
                ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: CONTENT ── */}
      {activeEditorTab === "content" && (
        <div className="space-y-5">
          {/* Language Switcher Sub-bar & Auto-Translate Action */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLangSubTab("en")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  langSubTab === "en"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span>🇬🇧</span> English Content
              </button>
              <button
                type="button"
                onClick={() => setLangSubTab("ta")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  langSubTab === "ta"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span>🇮🇳</span> தமிழ் (Tamil Version)
                {form.title_ta && <span className="w-2 h-2 rounded-full bg-green-400 inline-block" title="Tamil content available" />}
              </button>
            </div>

            <Button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5"
            >
              {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>⚡</span>}
              {translating ? "Translating to Tamil…" : "Auto-Translate to Tamil (தானியங்கி தமிழாக்கம்)"}
            </Button>
          </div>

          {/* Core fields */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            {langSubTab === "en" ? (
              <>
                <Field label="Headline / Title (English)" required>
                  <Input value={form.title} onChange={e => setField("title", e.target.value)}
                    placeholder="Chennai Metro Phase 2 Construction Reaches New Milestone"
                    className="text-base font-semibold" />
                </Field>

                <Field label="Subtitle / Summary (English)" hint="Shown under the headline">
                  <Input value={form.subtitle} onChange={e => setField("subtitle", e.target.value)}
                    placeholder="Brief intro that appears under the headline" />
                </Field>
              </>
            ) : (
              <>
                <Field label="Headline / Title (தமிழ் தலைப்பு)" hint="Tamil version of headline">
                  <Input value={form.title_ta || ""} onChange={e => setField("title_ta", e.target.value)}
                    placeholder="சென்னை மெட்ரோ கட்டம் 2 கட்டுமானம் புதிய மைல்கல்லை எட்டியது"
                    className="text-base font-semibold" />
                </Field>

                <Field label="Subtitle / Summary (தமிழ் துணைத் தலைப்பு)" hint="Tamil version of subtitle">
                  <Input value={form.subtitle_ta || ""} onChange={e => setField("subtitle_ta", e.target.value)}
                    placeholder="தலைப்பின் கீழ் தோன்றும் சுருக்கமான அறிமுகம்" />
                </Field>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Slug (URL)" required hint="Auto-generated from title">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 whitespace-nowrap">/tn-today/</span>
                  <Input value={form.slug} onChange={e => setField("slug", generateSlug(e.target.value))}
                    placeholder="article-slug" className="font-mono text-xs flex-1" />
                  <button type="button" onClick={() => setField("slug", generateSlug(form.title))}
                    className="p-1.5 rounded text-slate-400 hover:text-blue-600 flex-shrink-0" title="Regenerate from title">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={e => setField("category", e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Author Name">
                <Input value={form.author_name} onChange={e => setField("author_name", e.target.value)}
                  placeholder="VizhiTN Editorial Team" />
              </Field>
              <Field label="Reading Time (min)">
                <Input type="number" min={1} value={form.reading_time}
                  onChange={e => setField("reading_time", parseInt(e.target.value) || 1)} />
              </Field>
              <Field label="Publish Date">
                <Input type="datetime-local" value={form.publish_date}
                  onChange={e => setField("publish_date", e.target.value)} />
              </Field>
            </div>

            <Field label="Featured Image URL">
              <Input value={form.featured_image} onChange={e => setField("featured_image", e.target.value)}
                placeholder="https://..." />
              {form.featured_image && (
                <img src={form.featured_image} alt="preview" className="mt-2 h-32 w-full object-cover rounded-xl" />
              )}
            </Field>

            {/* Feature toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <input type="checkbox" checked={form.is_featured} onChange={e => setField("is_featured", e.target.checked)} className="accent-amber-500 w-4 h-4" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">📌 Pin to Homepage</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">Show this article as the featured card on the VizhiTN homepage</p>
              </div>
            </label>
          </div>

          {/* Main content editor */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" />
                {langSubTab === "en" ? "Main Article Content (English)" : "Main Article Content (தமிழ் உள்ளடக்கம்)"}
              </span>
              <span className="text-xs font-normal text-slate-500">
                {langSubTab === "en" ? "Editing English Version" : "Editing Tamil Version"}
              </span>
            </h3>
            {langSubTab === "en" ? (
              <RichEditor
                key="editor-en"
                value={form.content}
                onChange={v => setField("content", v)}
                placeholder="Write the full article body here in English..."
                minHeight="min-h-[400px]"
              />
            ) : (
              <RichEditor
                key="editor-ta"
                value={form.content_ta || ""}
                onChange={v => setField("content_ta", v)}
                placeholder="தமிழ் கட்டுரை உள்ளடக்கத்தை இங்கே எழுதவும் அல்லது 'Auto-Translate' பொத்தானை பயன்படுத்தவும்..."
                minHeight="min-h-[400px]"
              />
            )}
          </div>
        </div>
      )}

      {/* ── TAB: SECTIONS ── */}
      {activeEditorTab === "structure" && (
        <div className="space-y-3">
          <Accordion title="Why it Matters to Tamil Nadu" icon={AlertCircle} defaultOpen>
            <Field label="Why This Story Matters" hint="Practical impact on TN citizens (1–2 paragraphs)">
              <textarea value={form.why_it_matters} onChange={e => setField("why_it_matters", e.target.value)}
                rows={4} placeholder="Explain why this story is important for citizens of Tamil Nadu..."
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </Field>
          </Accordion>

          <Accordion title="Short Summary Block" icon={FileText}>
            <Field label="Article Summary" hint="Shown at the top of the article as intro context">
              <textarea value={form.summary} onChange={e => setField("summary", e.target.value)}
                rows={3} placeholder="A short 2–3 sentence summary of the story..."
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </Field>
          </Accordion>

          <Accordion title="Key Facts (Bullet Points)" icon={List}>
            <Field label="Key Facts" hint='One fact per line, e.g.: "Tunneling: 50% complete"'>
              <textarea value={form.key_facts} onChange={e => setField("key_facts", e.target.value)}
                rows={6} placeholder={"Project: Chennai Metro Phase 2\nTotal Corridors: 3\nExpected Completion: 2027\nTunneling: 50% complete"}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-mono bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </Field>
            <p className="text-xs text-slate-400">One fact per line. Format: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">Label: Value</code></p>
          </Accordion>

          <Accordion title="Timeline" icon={Clock}>
            <Field label="Timeline Events" hint='Format: "Date | Event description", one per line'>
              <textarea value={form.timeline} onChange={e => setField("timeline", e.target.value)}
                rows={6} placeholder={"Jan 2023 | Full-scale construction began\nSep 2023 | Tunneling started in Corridor 3\nMar 2025 | 35% tunneling milestone achieved\nJun 2026 | 50% tunneling milestone reached\n2027 (Planned) | Phase-wise operational launch"}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-mono bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </Field>
            <p className="text-xs text-slate-400">Format: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">Date | Event</code>, one per line</p>
          </Accordion>

          <Accordion title="Official Sources" icon={Link2}>
            <Field label="Source Links" hint='Format: "Label | URL", one per line'>
              <textarea value={form.official_sources} onChange={e => setField("official_sources", e.target.value)}
                rows={4} placeholder={"CMRL Official Statement | https://chennaimetrorail.org/press\nGovernment of Tamil Nadu | https://tn.gov.in"}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-mono bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </Field>
            <p className="text-xs text-slate-400">Format: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">Label | URL</code>, one per line</p>
          </Accordion>

          <Accordion title="Related Civic Activity" icon={Globe}>
            <Field label="Related Links on VizhiTN" hint="Link to related discussions, areas, or alerts">
              <textarea value={form.related_civic_links} onChange={e => setField("related_civic_links", e.target.value)}
                rows={4} placeholder={"Metro Construction Issues | /community\nTransport Discussions | /community?topic=transport\nChennai Area Updates | /area/chennai"}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-mono bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </Field>
          </Accordion>
        </div>
      )}

      {/* ── TAB: SEO & PUBLISH ── */}
      {activeEditorTab === "seo" && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-600" /> SEO Settings
            </h3>

            <Field label="SEO Title" hint="Defaults to the article title if left blank">
              <Input value={form.seo_title} onChange={e => setField("seo_title", e.target.value)}
                placeholder={form.title || "SEO title..."} />
              <p className="text-xs text-slate-400 mt-0.5">{(form.seo_title || form.title || "").length}/60 chars</p>
            </Field>

            <Field label="SEO Description">
              <textarea value={form.seo_description} onChange={e => setField("seo_description", e.target.value)}
                rows={2} placeholder="Compelling description for Google search results (150–160 chars)"
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <p className="text-xs text-slate-400 mt-0.5">{(form.seo_description).length}/160 chars</p>
            </Field>

            <Field label="SEO Keywords" hint="Comma-separated keywords">
              <Input value={form.seo_keywords} onChange={e => setField("seo_keywords", e.target.value)}
                placeholder="Chennai Metro, Tamil Nadu, public transport, infrastructure" />
            </Field>

            <Field label="Social Share Image URL" hint="Fallback to featured image if blank">
              <Input value={form.social_image} onChange={e => setField("social_image", e.target.value)}
                placeholder="https://..." />
            </Field>
          </div>

          {/* SEO preview */}
          {(form.title || form.seo_title) && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-semibold text-slate-500 mb-3">GOOGLE SEARCH PREVIEW</p>
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <p className="text-[13px] text-slate-500 truncate">vizhitn.in › tn-today › {form.slug}</p>
                <p className="text-blue-700 text-lg font-medium leading-tight mt-0.5 truncate">
                  {form.seo_title || form.title} | VizhiTN
                </p>
                <p className="text-slate-600 text-sm mt-0.5 line-clamp-2">
                  {form.seo_description || form.subtitle || "Article description will appear here..."}
                </p>
              </div>
            </div>
          )}

          {/* Article status control */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">📤 Publish Controls</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["draft", "scheduled", "published", "archived"].map(s => (
                <button key={s} onClick={() => setField("status", s)}
                  className={cn("rounded-xl border p-3 text-center transition-all text-sm font-medium capitalize",
                    form.status === s
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300"
                  )}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap pt-2">
              <Button onClick={handleDraft} variant="outline" size="sm" disabled={saving}>
                <Save className="w-3.5 h-3.5 mr-1" /> Save Draft
              </Button>
              <Button onClick={handleSchedule} variant="outline" size="sm" disabled={saving}>
                <Calendar className="w-3.5 h-3.5 mr-1" /> Save Scheduled
              </Button>
              <Button onClick={handlePublish} size="sm" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                <Send className="w-3.5 h-3.5 mr-1" /> {saving ? "Publishing…" : "Publish Now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
