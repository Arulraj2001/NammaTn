"use client";
import React, { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createTnToday, generateSlug, estimateReadingTime } from "@/services/tnToday";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Upload, FileJson, ClipboardPaste, X, CheckCircle2, AlertCircle,
  ArrowRight, Loader2, FileText, ChevronDown, ChevronUp, Download
} from "lucide-react";
import { cn } from "@/lib/utils";

import { translateTextToTamil, translateHtmlToTamil } from "@/services/translate";

// ─── Field serializers (array of objects → plain text expected by article view) ──
function serialiseKeyFacts(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw; // already plain text
  if (Array.isArray(raw)) {
    return raw.map(item => {
      if (typeof item === "string") return item;
      // { fact: "..." } or { label: "...", value: "..." }
      if (item.fact) return item.fact;
      if (item.label && item.value) return `${item.label}: ${item.value}`;
      if (item.label) return item.label;
      return JSON.stringify(item);
    }).join("\n");
  }
  return String(raw);
}

function serialiseTimeline(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw.map(item => {
      if (typeof item === "string") return item;
      // { date: "...", event: "..." }
      if (item.date && item.event) return `${item.date}: ${item.event}`;
      if (item.date) return item.date;
      return JSON.stringify(item);
    }).join("\n");
  }
  return String(raw);
}

function serialiseLinks(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw.map(item => {
      if (typeof item === "string") return item;
      // { label: "...", url: "..." }
      if (item.label && item.url) return `${item.label}: ${item.url}`;
      if (item.url) return item.url;
      if (item.label) return item.label;
      return JSON.stringify(item);
    }).join("\n");
  }
  return String(raw);
}

// ─── JSON field normaliser ──────────────────────────────────────────────────
const VALID_CATEGORIES = [
  "infrastructure", "education", "healthcare", "environment", "economy",
  "governance", "transport", "agriculture", "technology", "social",
  "india", "world", "general"
];

const CATEGORY_MAP = {
  national: "india",
  politics: "governance",
  policy: "governance",
  global: "world",
  international: "world",
  business: "economy",
  finance: "economy",
  tech: "technology",
  science: "technology",
  welfare: "social",
  schemes: "social",
  infra: "infrastructure",
  road: "infrastructure",
  transit: "transport",
};

function normaliseArticle(raw) {
  const title = (raw.title || "").trim();
  if (!title) throw new Error("Missing required field: title");

  const slug = raw.slug
    ? raw.slug.toLowerCase().replace(/[^\w-]/g, "").trim().slice(0, 80)
    : generateSlug(title);

  const rawCat = (raw.category || "").toLowerCase().trim();
  const category = VALID_CATEGORIES.includes(rawCat)
    ? rawCat
    : (CATEGORY_MAP[rawCat] || "general");

  const content = raw.content || raw.body || raw.article_body || "";

  return {
    title,
    title_ta:            raw.title_ta || "",
    slug,
    subtitle:            raw.subtitle || raw.subheading || raw.deck || "",
    subtitle_ta:         raw.subtitle_ta || "",
    featured_image:      raw.featured_image || raw.image || raw.cover_image || "",
    category,
    author_name:         raw.author_name || raw.author || "VizhiTN Editorial Team",
    publish_date:        raw.publish_date || raw.date || new Date().toISOString(),
    status:              "draft",
    reading_time:        raw.reading_time || estimateReadingTime(content) || 5,
    content,
    content_ta:          raw.content_ta || "",
    summary:             raw.summary || raw.excerpt || raw.description || "",
    summary_ta:          raw.summary_ta || "",
    why_it_matters:      raw.why_it_matters || raw.significance || "",
    why_it_matters_ta:   raw.why_it_matters_ta || "",
    key_facts:           serialiseKeyFacts(raw.key_facts || raw.facts),
    timeline:            serialiseTimeline(raw.timeline),
    official_sources:    serialiseLinks(raw.official_sources || raw.sources),
    related_civic_links: serialiseLinks(raw.related_civic_links || raw.related_links),
    seo_title:           raw.seo_title || raw.meta_title || title,
    seo_description:     raw.seo_description || raw.meta_description || raw.subtitle || "",
    seo_keywords:        Array.isArray(raw.seo_keywords) ? raw.seo_keywords.join(", ") : (raw.seo_keywords || raw.keywords || ""),
    social_image:        raw.social_image || raw.og_image || raw.featured_image || "",
    is_featured:         raw.is_featured === true,
  };
}

function parseInput(input) {
  let parsed;
  try { parsed = JSON.parse(input); } catch { throw new Error("Invalid JSON. Please check your JSON syntax."); }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) throw new Error("JSON array is empty.");
    return parsed.map((item, i) => {
      try { return normaliseArticle(item); }
      catch (e) { throw new Error(`Article #${i + 1}: ${e.message}`); }
    });
  }

  if (typeof parsed === "object" && parsed !== null) {
    if (Array.isArray(parsed.articles)) {
      if (parsed.articles.length === 0) throw new Error("articles array is empty.");
      return parsed.articles.map((item, i) => {
        try { return normaliseArticle(item); }
        catch (e) { throw new Error(`Article #${i + 1}: ${e.message}`); }
      });
    }
    return [normaliseArticle(parsed)];
  }

  throw new Error("JSON must be an object or array of articles.");
}

// ─── Preview card ────────────────────────────────────────────────────────────
function PreviewCard({ article, index, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-extrabold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{article.title}</p>
          <p className="text-xs text-slate-500 truncate">
            /{article.slug} · {article.category} · {article.reading_time}m read
          </p>
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
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-3 space-y-1.5 text-xs border-t border-slate-200 dark:border-slate-700">
          {article.subtitle && <p><span className="font-bold text-slate-500">Subtitle:</span> {article.subtitle}</p>}
          {article.summary && <p><span className="font-bold text-slate-500">Summary:</span> {article.summary}</p>}
          {article.author_name && <p><span className="font-bold text-slate-500">Author:</span> {article.author_name}</p>}
          {article.featured_image && (
            <p><span className="font-bold text-slate-500">Image:</span>
              <a href={article.featured_image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1 truncate block">
                {article.featured_image.slice(0, 60)}...
              </a>
            </p>
          )}
          {article.content && (
            <p><span className="font-bold text-slate-500">Content:</span> {article.content.replace(/<[^>]*>/g,"").slice(0,120)}...</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sample JSON download ────────────────────────────────────────────────────
function downloadSample() {
  const sample = [
    {
      title: "Chennai Metro Phase 2 Expansion Begins in Porur",
      subtitle: "New 15-km stretch to serve 3 lakh daily commuters by 2027",
      category: "transport",
      author_name: "VizhiTN Editorial Team",
      summary: "The Chennai Metro Rail Ltd has commenced work on the Porur extension.",
      content: "<p>Construction crews have begun excavation work along the Porur corridor...</p>",
      why_it_matters: "This expansion will reduce congestion on OMR and GST Road.",
      key_facts: "15 km stretch | 12 new stations | Rs 4,200 crore budget",
      official_sources: "https://chennaimetrorail.org",
      featured_image: "https://example.com/metro.jpg",
      publish_date: new Date().toISOString(),
    },
    {
      title: "TN Govt Launches Free Solar Panels Scheme for Farmers",
      category: "agriculture",
      summary: "Up to 5 HP solar pumps provided to 50,000 farmers across Tamil Nadu.",
      content: "<p>The Tamil Nadu government announced its solar pump scheme today...</p>",
    }
  ];
  const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tn_today_import_sample.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main ImportTnToday component ───────────────────────────────────────────
export default function ImportTnToday({ onDone }) {
  const [tab, setTab]               = useState("upload");
  const [pasteValue, setPasteValue] = useState("");
  const [articles, setArticles]     = useState(null);
  const [error, setError]           = useState("");
  const [importing, setImporting]   = useState(false);
  const [results, setResults]       = useState(null);
  const [dragging, setDragging]     = useState(false);
  const fileInputRef = useRef(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const processText = useCallback((text) => {
    setError("");
    setResults(null);
    try {
      const parsed = parseInput(text);
      setArticles(parsed);
    } catch (e) {
      setError(e.message);
      setArticles(null);
    }
  }, []);

  const handleFile = useCallback((file) => {
    if (!file || !file.name.endsWith(".json")) {
      setError("Please upload a .json file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => processText(e.target.result);
    reader.readAsText(file);
  }, [processText]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const removeArticle = useCallback((idx) => {
    setArticles(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : null;
    });
  }, []);

  const handleImport = async () => {
    if (!articles?.length) return;
    setImporting(true);
    const success = [];
    const failed  = [];

    for (const article of articles) {
      try {
        const payload = { ...article };
        // Auto-translate if Tamil version is missing
        if (!payload.title_ta && payload.title) {
          payload.title_ta = await translateTextToTamil(payload.title);
        }
        if (!payload.subtitle_ta && payload.subtitle) {
          payload.subtitle_ta = await translateTextToTamil(payload.subtitle);
        }
        if (!payload.summary_ta && payload.summary) {
          payload.summary_ta = await translateTextToTamil(payload.summary);
        }
        if (!payload.why_it_matters_ta && payload.why_it_matters) {
          payload.why_it_matters_ta = await translateTextToTamil(payload.why_it_matters);
        }
        if (!payload.content_ta && payload.content) {
          payload.content_ta = await translateHtmlToTamil(payload.content);
        }

        await createTnToday(payload);
        success.push(article.title);
      } catch (e) {
        failed.push({ title: article.title, reason: e.message });
      }
    }

    qc.invalidateQueries({ queryKey: ["admin-tn-today"] });
    qc.invalidateQueries({ queryKey: ["tn-today-featured"] });
    setResults({ success, failed });
    setImporting(false);

    if (failed.length === 0) {
      toast({ description: `${success.length} article(s) imported as drafts!` });
    } else {
      toast({ description: `${success.length} imported, ${failed.length} failed.`, variant: "destructive" });
    }
  };

  const reset = () => {
    setArticles(null);
    setError("");
    setPasteValue("");
    setResults(null);
  };

  // ── Results view ─────────────────────────────────────────────────────────
  if (results) {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-2 pt-2">
          {results.failed.length === 0 ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          ) : (
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          )}
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Import Complete</h3>
          <p className="text-sm text-slate-500">
            {results.success.length} article(s) imported as drafts. Edit and publish from the article list.
          </p>
        </div>

        {results.success.length > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-1">
            <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Successfully Imported
            </p>
            {results.success.map((t, i) => (
              <p key={i} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> {t}
              </p>
            ))}
          </div>
        )}

        {results.failed.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4 space-y-1">
            <p className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2">
              Failed
            </p>
            {results.failed.map((f, i) => (
              <p key={i} className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span><strong>{f.title}</strong> — {f.reason}</span>
              </p>
            ))}
          </div>
        )}

        <div className="flex gap-2 flex-wrap pt-2">
          <Button onClick={reset} variant="outline" size="sm">Import More</Button>
          <Button onClick={onDone} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5">
            View Articles <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Preview view ─────────────────────────────────────────────────────────
  if (articles) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Preview — {articles.length} article{articles.length !== 1 ? "s" : ""}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review before importing. All articles will be saved as <strong>drafts</strong>.
            </p>
          </div>
          <button onClick={reset} className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 transition-colors">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          {articles.map((a, i) => (
            <PreviewCard key={i} article={a} index={i} onRemove={removeArticle} />
          ))}
        </div>

        <div className="flex gap-2 flex-wrap pt-1">
          <Button onClick={reset} variant="outline" size="sm">
            <X className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || articles.length === 0}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            {importing ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...</>
            ) : (
              <><Upload className="w-3.5 h-3.5" /> Import {articles.length} Article{articles.length !== 1 ? "s" : ""} as Drafts</>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ── Input view ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileJson className="w-5 h-5 text-blue-600" />
            Import TN Today
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload JSON or paste JSON — articles saved as <strong>drafts</strong> instantly.
          </p>
        </div>
        <button
          onClick={downloadSample}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline transition-colors flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Sample JSON
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {[
          { id: "upload", icon: Upload,         label: "Upload JSON File" },
          { id: "paste",  icon: ClipboardPaste, label: "Paste JSON" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setError(""); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-px",
              tab === t.id
                ? "border-blue-600 text-blue-700 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
            dragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
        >
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Drop your JSON file here or click to browse
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Single article object or array of articles — all saved as drafts
          </p>
        </div>
      )}

      {/* Paste tab */}
      {tab === "paste" && (
        <div className="space-y-3">
          <textarea
            value={pasteValue}
            onChange={e => setPasteValue(e.target.value)}
            placeholder={`Paste JSON here:\n\nSingle: { "title": "...", "category": "transport", ... }\n\nBulk: [{ "title": "..." }, { "title": "..." }]`}
            className="w-full h-52 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          <Button
            onClick={() => { setError(""); processText(pasteValue); }}
            disabled={!pasteValue.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2"
          >
            <FileJson className="w-4 h-4" /> Parse JSON
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{error}</p>
        </div>
      )}

      {/* JSON field reference */}
      <details className="group">
        <summary className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer select-none flex items-center gap-1 transition-colors list-none">
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
          Supported JSON fields
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-500 pl-4 font-mono">
          {[
            ["title *",           "Article title (required)"],
            ["slug",              "Auto-generated if missing"],
            ["subtitle",          "Short deck/subheading"],
            ["category",          "infrastructure, transport..."],
            ["author_name",       "Defaults to VizhiTN"],
            ["publish_date",      "ISO date string"],
            ["content",           "HTML or plain text"],
            ["summary",           "Short excerpt"],
            ["featured_image",    "Image URL"],
            ["why_it_matters",    "Why this matters"],
            ["key_facts",         "Bullet facts"],
            ["official_sources",  "Source links"],
            ["seo_title",         "SEO title override"],
            ["seo_description",   "Meta description"],
            ["seo_keywords",      "Comma-separated"],
          ].map(([k, v]) => (
            <React.Fragment key={k}>
              <span className="text-blue-600 dark:text-blue-400">{k}</span>
              <span>{v}</span>
            </React.Fragment>
          ))}
        </div>
      </details>
    </div>
  );
}
