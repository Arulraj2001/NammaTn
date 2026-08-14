"use client";
import React, { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/services/posts";
import { translateTextToTamil } from "@/services/translate";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";
import {
  Upload, FileJson, ClipboardPaste, X, CheckCircle2, AlertCircle,
  Loader2, ChevronDown, ChevronUp, Download, Sparkles, Copy
} from "lucide-react";
import { cn } from "@/lib/utils";

const VALID_TYPES = ["complaint", "civic", "appreciation", "local_update", "alert", "discussion", "bribe"];

const SAMPLE_POSTS = [
  {
    title_en: "Pothole Hazard on OMR Service Road near Perungudi Junction",
    title_ta: "பெருங்குடி சந்திப்பு அருகே ஓ.எம்.ஆர் சேவை சாலையில் பள்ளம் ஆபத்து",
    content_en: "Deep potholes on the northbound service road near Perungudi MRTS station have caused multiple two-wheeler skids. Urgent resurfacing needed before monsoon rains.",
    content_ta: "பெருங்குடி எம்.ஆர்.டி.எஸ் நிலையம் அருகே வடக்கு நோக்கி செல்லும் சேவை சாலையில் உள்ள ஆழமான பள்ளங்களால் இருசக்கர வாகனங்கள் சறுக்கி விழுகின்றன. மழைக்காலத்திற்கு முன் உடனடியாக புதிய சாலை தேவை.",
    post_type: "complaint",
    district_slug: "chennai",
    category_slug: "road-infrastructure",
    area_name: "Perungudi",
    author_name: "Karthik R.",
    official_complaint_id: "GCC-2026-88412",
    department_routing: "Greater Chennai Corporation (GCC)",
    upvotes: 24,
    verification_count: 8,
    civic_status: "community_verified"
  },
  {
    title_en: "Water Pipeline Leakage at RS Puram DB Road Intersection",
    title_ta: "ஆர்.எஸ்.புரம் டி.பி. சாலை சந்திப்பில் குடிநீர் குழாய் கசிவு",
    content_en: "Clean drinking water is leaking from the main supply pipe onto the main road for the past 3 days. Thousands of liters of water being wasted daily.",
    content_ta: "கடந்த 3 நாட்களாக பிரதான டி.பி. சாலையில் முக்கிய குடிநீர் குழாயிலிருந்து நல்ல நீர் வீணாக கசிகிறது. தினமும் ஆயிரக்கணக்கான லிட்டர் நீர் வீணாகிறது.",
    post_type: "complaint",
    district_slug: "coimbatore",
    category_slug: "water-sanitation",
    area_name: "RS Puram",
    author_name: "Senthil Kumar",
    official_complaint_id: "CCMC-W-4012",
    department_routing: "Coimbatore City Municipal Corporation & TWAD",
    upvotes: 18,
    verification_count: 5,
    civic_status: "complaint_filed"
  },
  {
    title_en: "New Underground Cable Work Started in KK Nagar East",
    title_ta: "கே.கே.நகர் கிழக்கில் புதிய பூமிக்கடி மின்சார கேபிள் பணி துவங்கியது",
    content_en: "TANGEDCO team has initiated underground cable replacement in West Street, KK Nagar to prevent storm power cuts. Work expected to complete by end of this week.",
    content_ta: "புயல் மின் வெட்டைத் தவிர்க்க கே.கே.நகர் மேற்குத் தெருவில் பூமிக்கடி கேபிள் மாற்றும் பணியை டான்ஜெட்கோ தொடங்கியுள்ளது. இந்த வார இறுதிக்குள் பணி நிறைவடையும்.",
    post_type: "local_update",
    district_slug: "madurai",
    category_slug: "electricity",
    area_name: "KK Nagar",
    author_name: "Madurai Civic Watch",
    upvotes: 31,
    verification_count: 12,
    civic_status: "under_followup"
  },
  {
    title_en: "Swift Drainage Clearance Post Heavy Rains in Thillai Nagar",
    title_ta: "தில்லை நகரில் கனமழைக்குப் பின் துரித வடிகால் தூய்மைப் பணி",
    content_en: "Appreciation to Trichy Corporation conservancy team for clearing storm water drain blockage within 2 hours of citizen report near 10th Cross Thillai Nagar.",
    content_ta: "தில்லை நகர் 10வது குறுக்கு தெரு அருகே குடிமக்கள் அறிவித்த 2 மணி நேரத்திற்குள் மழைநீர் வடிகால் அடைப்பை நீக்கிய திருச்சி மாநகராட்சி பணியாளர்களுக்கு பாராட்டுக்கள்.",
    post_type: "appreciation",
    district_slug: "tiruchirappalli",
    category_slug: "environment",
    area_name: "Thillai Nagar",
    author_name: "Meenakshi S.",
    upvotes: 45,
    verification_count: 15,
    civic_status: "citizen_verified_fixed"
  },
  {
    title_en: "Street Light Replacement Drive Completed across Meyyanur Main Road",
    title_ta: "மெய்யனூர் பிரதான சாலையில் தெருவிளக்குகள் மாற்றும் பணி நிறைவு",
    content_en: "Salem Corporation replaced 14 non-functional sodium lamps with bright 60W LED fixtures along Meyyanur main road, improving night safety for pedestrians.",
    content_ta: "மெய்யனூர் பிரதான சாலையில் வேலை செய்யாத 14 சோடியம் விளக்குகளை அகற்றி 60W எல்.இ.டி விளக்குகளை சேலம் மாநகராட்சி பொருத்தியுள்ளது. இரவில் நடமாட்டம் பாதுகாப்பாக உள்ளது.",
    post_type: "local_update",
    district_slug: "salem",
    category_slug: "public-safety",
    area_name: "Meyyanur",
    author_name: "Salem Active Citizens",
    upvotes: 29,
    verification_count: 9,
    civic_status: "resolved"
  }
];

function normalisePost(raw, idx) {
  const title_en = (raw.title_en || raw.title || raw.heading || "").trim();
  if (!title_en) throw new Error(`Item #${idx + 1}: Missing required title`);

  const content_en = (raw.content_en || raw.content || raw.description || raw.details || raw.body || "").trim();
  if (!content_en) throw new Error(`Item #${idx + 1}: Missing required content`);

  const rawType = (raw.post_type || raw.type || "complaint").toLowerCase().trim();
  const post_type = VALID_TYPES.includes(rawType) ? rawType : "complaint";

  const district_slug = (raw.district_slug || raw.district || "chennai").toLowerCase().trim();
  const distObj = DISTRICTS.find(d => d.slug === district_slug);
  const district_name = distObj ? distObj.name_en : (raw.district_name || "Chennai");

  const category_slug = (raw.category_slug || raw.category || "road-infrastructure").toLowerCase().trim();
  const catObj = CATEGORIES.find(c => c.slug === category_slug);
  const category_name = catObj ? catObj.name_en : (raw.category_name || "Road & Infrastructure");

  const area_name = raw.area_name || raw.area || "";
  const area_slug = raw.area_slug || (area_name ? area_name.toLowerCase().replace(/[^\w-]/g, "") : "");

  const media_urls = Array.isArray(raw.media_urls)
    ? raw.media_urls
    : (raw.image_url ? [raw.image_url] : (raw.photo_url ? [raw.photo_url] : []));

  const civic_receipt_id = raw.civic_receipt_id || (
    ["complaint", "civic", "alert"].includes(post_type)
      ? "TN-" + Math.floor(100000 + Math.random() * 900000)
      : null
  );

  return {
    title_en,
    title_ta: raw.title_ta || "",
    content_en,
    content_ta: raw.content_ta || "",
    post_type,
    district_slug,
    district_name,
    category_slug,
    category_name,
    area_slug,
    area_name,
    author_name: raw.author_name || raw.author || raw.created_by || "Citizen",
    is_anonymous: Boolean(raw.is_anonymous),
    status: raw.status || "active",
    moderation_status: "approved",
    is_publicly_visible: true,
    upvotes: Number(raw.upvotes || 0),
    downvotes: Number(raw.downvotes || 0),
    comment_count: Number(raw.comment_count || 0),
    verification_count: Number(raw.verification_count || 0),
    duplicate_count: Number(raw.duplicate_count || 0),
    media_urls,
    civic_receipt_id,
    official_complaint_id: raw.official_complaint_id || "",
    department_routing: raw.department_routing || raw.department || "",
    civic_status: raw.civic_status || "community_verified",
    created_date: raw.created_date || new Date().toISOString(),
  };
}

function parseJsonInput(input) {
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error("Invalid JSON syntax. Please verify quotes and commas.");
  }

  const items = Array.isArray(parsed) ? parsed : (parsed.posts || [parsed]);
  if (!items.length) throw new Error("JSON dataset is empty.");

  return items.map((item, i) => normalisePost(item, i));
}

function parseCsvInput(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV file must contain a header row and at least 1 data row.");

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    if (row.title || row.title_en) {
      items.push(normalisePost(row, i - 1));
    }
  }

  if (!items.length) throw new Error("No valid rows found in CSV.");
  return items;
}

function PreviewCard({ post, index, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-extrabold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{post.title_en}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
            <span className="capitalize bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-medium">
              {post.post_type.replace("_", " ")}
            </span>
            <span>📍 {post.district_name}</span>
            {post.civic_receipt_id && <span className="font-mono text-slate-600 dark:text-slate-300">{post.civic_receipt_id}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onRemove(index)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            title="Remove item"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-3 space-y-2 text-xs border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <p><strong className="text-slate-600 dark:text-slate-400">Description:</strong> {post.content_en}</p>
          {post.title_ta && <p><strong className="text-slate-600 dark:text-slate-400">Tamil Title:</strong> {post.title_ta}</p>}
          {post.category_name && <p><strong className="text-slate-600 dark:text-slate-400">Category:</strong> {post.category_name}</p>}
          {post.department_routing && <p><strong className="text-slate-600 dark:text-slate-400">Department:</strong> {post.department_routing}</p>}
          {post.official_complaint_id && <p><strong className="text-slate-600 dark:text-slate-400">Portal Ref ID:</strong> {post.official_complaint_id}</p>}
        </div>
      )}
    </div>
  );
}

export default function ImportPosts({ onDone }) {
  const [tab, setTab] = useState("upload");
  const [pasteValue, setPasteValue] = useState("");
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [importStatus, setImportStatus] = useState("active");
  const [results, setResults] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const processText = useCallback((text, filename = "") => {
    setError("");
    setResults(null);
    try {
      let parsed;
      if (filename.endsWith(".csv") || (!text.trim().startsWith("[") && !text.trim().startsWith("{"))) {
        parsed = parseCsvInput(text);
      } else {
        parsed = parseJsonInput(text);
      }
      setPosts(parsed);
    } catch (e) {
      setError(e.message);
      setPosts(null);
    }
  }, []);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => processText(e.target.result, file.name.toLowerCase());
    reader.readAsText(file);
  }, [processText]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const loadSampleData = useCallback(() => {
    setError("");
    setResults(null);
    try {
      const sampleParsed = SAMPLE_POSTS.map((item, idx) => normalisePost(item, idx));
      setPosts(sampleParsed);
      toast({ description: "Loaded 5 realistic sample posts for Tamil Nadu." });
    } catch (e) {
      setError(e.message);
    }
  }, [toast]);

  const removePost = useCallback((idx) => {
    setPosts(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : null;
    });
  }, []);

  const downloadSampleTemplate = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_POSTS, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vizhitn_posts_import_template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyTemplateJson = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_POSTS, null, 2));
    toast({ description: "JSON format template copied to clipboard!" });
  };

  const handleImport = async () => {
    if (!posts?.length) return;
    setImporting(true);
    setProgress(0);
    const success = [];
    const failed = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      try {
        const payload = { ...post, status: importStatus };
        if (autoTranslate) {
          if (!payload.title_ta && payload.title_en) {
            payload.title_ta = await translateTextToTamil(payload.title_en);
          }
          if (!payload.content_ta && payload.content_en) {
            payload.content_ta = await translateTextToTamil(payload.content_en);
          }
        }
        await createPost(payload);
        success.push(post.title_en);
      } catch (e) {
        failed.push({ title: post.title_en, error: e.message });
      }
      setProgress(i + 1);
    }

    setImporting(false);
    setResults({ success, failed });

    // Invalidate queries so admin and public feeds update instantly
    qc.invalidateQueries({ queryKey: ["admin-posts-all"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    qc.invalidateQueries({ queryKey: ["posts"] });
    qc.invalidateQueries({ queryKey: ["area-pulse-posts"] });
    qc.invalidateQueries({ queryKey: ["category-posts"] });

    toast({ description: `Successfully imported ${success.length} post(s).` });
  };

  const reset = () => {
    setPosts(null);
    setPasteValue("");
    setError("");
    setResults(null);
    setProgress(0);
  };

  if (results) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Import Complete</h3>
            <p className="text-sm text-slate-500">
              Processed {posts?.length || 0} item(s) into database.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-2xl font-black text-green-700 dark:text-green-400">{results.success.length}</p>
            <p className="text-xs text-green-600 dark:text-green-500 font-medium">Successfully Imported</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-2xl font-black text-red-700 dark:text-red-400">{results.failed.length}</p>
            <p className="text-xs text-red-600 dark:text-red-500 font-medium">Failed</p>
          </div>
        </div>

        {results.failed.length > 0 && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs space-y-1">
            <p className="font-bold text-red-700 dark:text-red-400">Failures:</p>
            {results.failed.map((f, i) => (
              <p key={i} className="text-red-600 dark:text-red-300">
                • {f.title}: {f.error}
              </p>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={reset} variant="outline" size="sm">
            Import More Posts
          </Button>
          {onDone && (
            <Button onClick={onDone} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
              Done & Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bulk Import Posts & Civic Receipts</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Prefill verified community issues, local updates, and complaints from JSON/CSV files
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadSampleData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Load 5 Sample Posts
          </button>
          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Sample JSON
          </button>
          <button
            onClick={copyTemplateJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Format
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setTab("upload")}
          className={cn(
            "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
            tab === "upload"
              ? "bg-blue-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
        >
          <Upload className="w-3.5 h-3.5" /> Upload File (.json / .csv)
        </button>
        <button
          onClick={() => setTab("paste")}
          className={cn(
            "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
            tab === "paste"
              ? "bg-blue-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
        >
          <ClipboardPaste className="w-3.5 h-3.5" /> Paste JSON / Text
        </button>
      </div>

      {/* Upload Zone */}
      {tab === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all mb-4",
            dragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/40"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,.csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Click to upload or drag & drop .JSON or .CSV file
          </p>
          <p className="text-xs text-slate-400 mt-1">Supports post titles, descriptions, categories, districts, and civic receipt IDs</p>
        </div>
      )}

      {/* Paste Zone */}
      {tab === "paste" && (
        <div className="space-y-3 mb-4">
          <textarea
            value={pasteValue}
            onChange={(e) => {
              setPasteValue(e.target.value);
              if (e.target.value.trim()) processText(e.target.value);
            }}
            placeholder='[ { "title_en": "Damaged road in Perungudi", "content_en": "Potholes on service road", "district_slug": "chennai", "category_slug": "road-infrastructure", "post_type": "complaint" } ]'
            className="w-full h-40 p-3 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Section */}
      {posts && posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ready to Import ({posts.length} item{posts.length !== 1 ? "s" : ""})
            </span>
            <button
              onClick={() => setPosts(null)}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              Clear Preview
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {posts.map((post, i) => (
              <PreviewCard key={i} post={post} index={i} onRemove={removePost} />
            ))}
          </div>

          {/* Import Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="rounded border-slate-300 accent-blue-600"
                />
                Auto-translate missing Tamil titles/content
              </label>

              <select
                value={importStatus}
                onChange={(e) => setImportStatus(e.target.value)}
                className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-xs"
              >
                <option value="active">Import as Active & Published</option>
                <option value="pending">Import as Pending Review</option>
              </select>
            </div>

            <Button
              onClick={handleImport}
              disabled={importing}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              size="sm"
            >
              {importing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Importing {progress} of {posts.length}…
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Import {posts.length} Post{posts.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
