"use client";
import React, { useEffect } from "react";
import DOMPurify from "dompurify";
import { useParams, Link, useNavigate } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { getTnTodayBySlug, getPublishedTnToday, incrementTnTodayView } from "@/services/tnToday";
import { format } from "date-fns";
import {
  Clock, Calendar, User, ChevronRight, Share2, ExternalLink,
  MessageSquare, ArrowLeft, CheckCircle2, AlertCircle, BookOpen,
  Clipboard, Copy, Hash, ArrowRight, MapPin, ShieldCheck, FileCheck
} from "lucide-react";
import { setPageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { getTnTodayCanonical } from "@/lib/tnTodayUrl";
import { translateTextToTamil, translateHtmlToTamil } from "@/services/translate";
import { resolveArticleInternalLinks } from "@/lib/seo/internalLinker";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";
import { generateTnTodayPoster } from "@/lib/tntodayPosterGenerator";

const CATEGORY_CONFIG = {
  infrastructure: { label: "Infrastructure", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", emoji: "🏗️" },
  education:      { label: "Education",      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", emoji: "🎓" },
  healthcare:     { label: "Healthcare",     color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", emoji: "🏥" },
  environment:    { label: "Environment",    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", emoji: "🌿" },
  economy:        { label: "Economy",        color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", emoji: "💰" },
  governance:     { label: "Governance",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", emoji: "🏛️" },
  transport:      { label: "Transport",      color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", emoji: "🚌" },
  agriculture:    { label: "Agriculture",    color: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400", emoji: "🌾" },
  technology:     { label: "Technology",     color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", emoji: "💻" },
  social:         { label: "Social",         color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400", emoji: "👥" },
  general:        { label: "General",        color: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300", emoji: "📰" },
};

// ─── JSON-aware field parsers ──────────────────────────────────────────────────
// Supports both plain newline-delimited text AND JSON arrays stored as strings
// (from articles imported before the serialiser fix was applied).

function tryParseJSON(text) {
  if (!text || typeof text !== "string") return null;
  const t = text.trim();
  if (!t.startsWith("[") && !t.startsWith("{")) return null;
  try { return JSON.parse(t); } catch { return null; }
}

// Converts a JSON array-of-objects into { label, value } pairs for rendering
function jsonArrayToLabelValue(arr) {
  return arr.map(item => {
    if (typeof item === "string") return { label: item, value: "" };
    // key_facts: { fact: "..." }
    if (item.fact) return { label: item.fact, value: "" };
    // timeline: { date: "...", event: "..." }
    if (item.date && item.event) return { label: item.date, value: item.event };
    if (item.date) return { label: item.date, value: "" };
    // official_sources / links: { label: "...", url: "..." }
    if (item.label && item.url)  return { label: item.label, value: item.url };
    if (item.url)  return { label: item.url, value: item.url };
    if (item.label) return { label: item.label, value: "" };
    return { label: JSON.stringify(item), value: "" };
  }).filter(r => r.label);
}

function parseLines(text) {
  if (!text) return [];
  const json = tryParseJSON(text);
  if (json) {
    const arr = Array.isArray(json) ? json : [json];
    // Return just the label strings (used for key_facts plain text path)
    return arr.map(item => {
      if (typeof item === "string") return item;
      if (item.fact) return item.fact;
      if (item.date && item.event) return `${item.date}: ${item.event}`;
      if (item.label) return item.label;
      return JSON.stringify(item);
    }).filter(Boolean);
  }
  return text.split("\n").map(l => l.trim()).filter(Boolean);
}

function parsePipeLines(text) {
  if (!text) return [];
  const json = tryParseJSON(text);
  if (json) {
    const arr = Array.isArray(json) ? json : [json];
    return jsonArrayToLabelValue(arr);
  }
  // Plain text path (unchanged)
  return parseLines(text).map(line => {
    if (line.includes("|")) {
      const [left, ...rest] = line.split("|");
      return { label: left?.trim(), value: rest.join("|").trim() };
    }
    // Colon followed by a URL/path
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const label = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
        return { label, value };
      }
    }
    // Inline URL
    const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      const url = urlMatch[0];
      const label = line.replace(url, "").trim().replace(/:$/, "").trim();
      return { label: label || url, value: url };
    }
    return { label: line, value: "" };
  }).filter(r => r.label);
}


// ─── Share helpers ────────────────────────────────────────────────────────────
function ShareRow({ url, title }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const waText = encodeURIComponent(`${title}\n${url}`);
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a href={`https://api.whatsapp.com/send?text=${waText}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium hover:bg-green-100 transition-colors border border-green-200 dark:border-green-800">
        📱 WhatsApp
      </a>
      <a href={fbUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800">
        📘 Facebook
      </a>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-medium hover:bg-sky-100 transition-colors border border-sky-200 dark:border-sky-800">
        𝕏 Twitter
      </a>
      <button onClick={copy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-200 dark:border-slate-600">
        {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
      </button>
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ icon, title, accent = "blue", children }) {
  const accents = {
    blue:   "border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10",
    green:  "border-l-green-500 bg-green-50/50 dark:bg-green-900/10",
    amber:  "border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10",
    purple: "border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10",
    slate:  "border-l-slate-400 bg-slate-50/50 dark:bg-slate-800/50",
  };
  return (
    <div className={cn("border-l-4 rounded-r-xl p-4", accents[accent] || accents.blue)}>
      {title && (
        <h2 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function ArticleSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-6" />
      <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-6" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" style={{ width: `${85 - i * 5}%` }} />)}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
// Guard: only treat a value as an image URL if it actually looks like one.
// Text descriptions (stored from JSON import) are safely ignored.
const isImageUrl = (v) => typeof v === "string" && /^https?:\/\/|^blob:|^data:image\//i.test(v.trim());

export default function TnTodayArticle({ initialArticle = null, initialRelatedArticles = [] }) {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [autoTa, setAutoTa] = React.useState(null);
  const [heroImg, setHeroImg] = React.useState("");

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["tn-today-article", slug],
    queryFn: () => getTnTodayBySlug(slug),
    initialData: initialArticle?.slug === slug ? initialArticle : undefined,
    staleTime: 0,
    refetchOnMount: true,
    enabled: !!slug,
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ["tn-today-related", article?.category ?? "", article?.slug ?? ""],
    queryFn: async () => {
      let items = await getPublishedTnToday({ limit: 4, category: article?.category });
      items = (items || []).filter(a => a.slug !== article?.slug);
      if (items.length < 3) {
        const fallback = await getPublishedTnToday({ limit: 4 });
        const filteredFallback = (fallback || []).filter(a => a.slug !== article?.slug && !items.some(i => i.id === a.id));
        items = [...items, ...filteredFallback];
      }
      return items.slice(0, 3);
    },
    initialData: initialRelatedArticles.length ? initialRelatedArticles : undefined,
    enabled: !!article,
    staleTime: 60_000, // cache for 60s — related articles don't change by the second
  });

  const moreArticles = relatedArticles;

  // On-the-fly translation for articles published before Tamil columns existed
  useEffect(() => {
    if (lang === "ta" && article && !article.title_ta && !autoTa) {
      let isMounted = true;
      async function translateOnFly() {
        try {
          const t = await translateTextToTamil(article.title);
          const s = await translateTextToTamil(article.subtitle);
          const w = await translateTextToTamil(article.why_it_matters);
          const c = await translateHtmlToTamil(article.content);
          if (isMounted) {
            setAutoTa({ title_ta: t, subtitle_ta: s, why_it_matters_ta: w, content_ta: c });
          }
        } catch {
          // ignore error
        }
      }
      translateOnFly();
      return () => { isMounted = false; };
    }
  }, [lang, article, autoTa]);

  // Determine bilingual content
  const displayTitle = (lang === "ta") ? (article?.title_ta || autoTa?.title_ta || article?.title) : article?.title;
  const displaySubtitle = (lang === "ta") ? (article?.subtitle_ta || autoTa?.subtitle_ta || article?.subtitle) : article?.subtitle;
  const displayWhyItMatters = (lang === "ta") ? (article?.why_it_matters_ta || autoTa?.why_it_matters_ta || article?.why_it_matters) : article?.why_it_matters;
  const rawHtml = (lang === "ta") ? (article?.content_ta || autoTa?.content_ta || article?.content) : article?.content;
  const safeArticleHtml = typeof window !== "undefined" ? DOMPurify.sanitize(rawHtml || "") : "";

  // SEO & structured data
  useEffect(() => {
    if (!article) return;
    const canonicalUrl = getTnTodayCanonical(article.slug);
    const image = article.social_image || article.featured_image || "";

    setPageMeta({
      title: displayTitle || article.seo_title || article.title,
      description: displaySubtitle || article.seo_description || article.subtitle || article.summary || "",
      image,
      url: canonicalUrl,
      canonical: canonicalUrl,
      type: "article",
    });

    // Increment view count (fire and forget)
    if (article.id) incrementTnTodayView(article.id).catch(() => {});

  }, [article, displayTitle, displaySubtitle]);

  if (isLoading) return <ArticleSkeleton />;

  if (isError || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-20">
        <BookOpen className="w-14 h-14 text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{T("Story Not Found", "செய்தி கிடைக்கவில்லை")}</h1>
        <p className="text-slate-500 mb-6">{T("This TN Today story isn't available or hasn't been published yet.", "இந்த செய்தி தற்சமயம் கிடைக்கவில்லை.")}</p>
        <Link to="/tn-today" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {T("Back to TN Today", "TN Today திரும்பவும்")}
        </Link>
      </div>
    );
  }

  const cat = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG.general;
  const pubDate = article.publish_date ? new Date(article.publish_date) : new Date(article.created_date);
  const pageUrl = getTnTodayCanonical(article.slug);

  const keyFacts = parsePipeLines(article.key_facts);
  const timelineEvents = parsePipeLines(article.timeline);
  const officialSources = parsePipeLines(article.official_sources);
  const relatedLinks = parsePipeLines(article.related_civic_links);

  const seoLinks = resolveArticleInternalLinks(article);

  React.useEffect(() => {
    if (article) {
      const rawImg = (article.featured_image || "").trim();
      if (isImageUrl(rawImg)) {
        setHeroImg(rawImg);
      } else {
        setHeroImg(generateTnTodayPoster({
          title: displayTitle || article.title,
          category: article.category,
          subtitle: displaySubtitle || article.subtitle || ""
        }));
      }
    }
  }, [article, displayTitle, displaySubtitle]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Top editorial bar ── */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide">📰 TN TODAY</span>
            <span className="opacity-60">·</span>
            <span className="opacity-80">{T("Today's most important story from Tamil Nadu", "தமிழ்நாட்டின் இன்றைய முக்கியமான செய்தி")}</span>
          </div>
          <div className="flex items-center gap-1 opacity-80">
            <Clock className="w-3 h-3" />
            <span>{T("Published daily at 8:00 AM", "தினமும் காலை 8:00 மணிக்கு வெளியீடு")}</span>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <nav className="max-w-6xl mx-auto px-4 py-3" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <li><Link to="/" className="hover:text-blue-600 transition-colors">{T("Home", "முகப்பு")}</Link></li>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <li><Link to="/tn-today" className="hover:text-blue-600 transition-colors">TN Today</Link></li>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <li><Link to={`/tn-today/category/${article.category}`} className="hover:text-blue-600 transition-colors capitalize">{article.category}</Link></li>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <li className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{displayTitle}</li>
        </ol>
      </nav>

      {/* ── Main 2-col layout ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ═══ LEFT: Article body ═══ */}
          <main className="flex-1 min-w-0">
            {/* Category badge */}
            <div className="mb-3">
              <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full", cat.color)}>
                {cat.emoji} {cat.label.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-3">
              {displayTitle}
            </h1>

            {/* Subtitle */}
            {displaySubtitle && (
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-4 font-normal">
                {displaySubtitle}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap mb-5 pb-5 border-b border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(pubDate, "d MMMM yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {article.author_name || "VizhiTN Editorial Team"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.reading_time || 5} min read
              </span>
              <button onClick={() => {
                navigator.share?.({ title: displayTitle, url: pageUrl }) ||
                navigator.clipboard.writeText(pageUrl);
              }} className="flex items-center gap-1.5 ml-auto text-blue-600 hover:text-blue-700 font-medium">
                <Share2 className="w-3.5 h-3.5" /> {T("Share", "பகிர்")}
              </button>
            </div>

            {/* Featured image — render photo URL or fallback to auto-generated TNToday Branded Poster */}
            {heroImg ? (
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                <img src={heroImg} alt={displayTitle} className="w-full h-[260px] sm:h-[380px] object-cover" />
              </div>
            ) : null}

            {/* Why it matters callout */}
            {displayWhyItMatters && (
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">
                    {T("Why this matters to Tamil Nadu", "இது ஏன் தமிழ்நாட்டிற்கு முக்கியம்")}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{displayWhyItMatters}</p>
                </div>
              </div>
            )}

            {/* Main article content */}
            {article.content && (
              <div
                className={cn(
                  "prose prose-slate dark:prose-invert max-w-none mb-8",
                  "prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white",
                  "prose-h2:text-xl prose-h2:mt-8 prose-h2:flex prose-h2:items-center prose-h2:gap-2",
                  "prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed",
                  "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-4",
                  "prose-img:rounded-2xl prose-img:shadow-md",
                  "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
                  "prose-strong:text-slate-900 dark:prose-strong:text-white",
                  "prose-li:text-slate-700 dark:prose-li:text-slate-300",
                  "prose-table:border-collapse prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 prose-td:px-3 prose-td:py-2",
                  "prose-th:bg-slate-50 dark:prose-th:bg-slate-800 prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-700 prose-th:px-3 prose-th:py-2"
                )}
                dangerouslySetInnerHTML={{ __html: safeArticleHtml }}
              />
            )}

            {/* Key Facts */}
            {keyFacts.length > 0 && (
              <SectionCard icon="✅" title="Key Highlights" accent="green">
                <div className="space-y-1.5">
                  {keyFacts.map((fact, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {fact.value ? <><strong className="text-slate-800 dark:text-white">{fact.label}:</strong> {fact.value}</> : fact.label}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Timeline */}
            {timelineEvents.length > 0 && (
              <div className="mt-6">
                <SectionCard icon="🕐" title="Timeline" accent="blue">
                  <div className="space-y-2">
                    {timelineEvents.map((ev, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", i === 0 ? "bg-blue-600" : "bg-slate-400")} />
                          {i < timelineEvents.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />}
                        </div>
                        <div className="pb-3">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">{ev.label}</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{ev.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Official Sources */}
            {officialSources.length > 0 && (
              <div className="mt-6">
                <SectionCard icon="📎" title="Official Sources" accent="slate">
                  <div className="space-y-2">
                    {officialSources.map((src, i) => (
                      <a key={i} href={src.value} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        {src.label}
                      </a>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Related civic activity */}
            {relatedLinks.length > 0 && (
              <div className="mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" /> Join the Conversation
                  </h3>
                  <Link to="/community" className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-0.5">
                    View Discussion <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-xs text-slate-500 mb-3">Share your views, ask questions, and stay updated with your community.</p>
                <div className="flex flex-wrap gap-2">
                  {relatedLinks.map((link, i) => (
                    <Link key={i} to={link.value}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors font-medium">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share row */}
            <div className="mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-slate-500" /> Share this story
              </h3>
              <ShareRow url={pageUrl} title={article.title} />
            </div>

            {/* SEO Authority Internal Links Block */}
            {seoLinks.district && (
              <div className="mt-6 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800">
                      📍 {seoLinks.district.name_en} Civic Hub
                    </span>
                    <h4 className="text-base font-bold text-white pt-1">
                      {seoLinks.districtAnchorText}
                    </h4>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      View live citizen reports, track municipal complaints, inspect area pulse statistics, and explore local issues across {seoLinks.district.name_en}.
                    </p>
                  </div>
                  <Link
                    to={seoLinks.districtUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap self-center"
                  >
                    Explore {seoLinks.district.name_en} Hub <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Newsletter CTA */}
            <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-white">Stay updated with TN Today</p>
                <p className="text-sm text-blue-200 mt-0.5">Get the day's top story delivered to your inbox every morning.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input type="email" placeholder="Enter your email"
                  className="flex-1 sm:w-48 px-3 py-2 rounded-xl text-sm text-slate-900 bg-white focus:outline-none" />
                <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold text-sm px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </main>

          {/* ═══ RIGHT: Sidebar ═══ */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-4 lg:sticky lg:top-20">

            {/* About TN Today */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">TN</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">About TN Today</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                TN Today brings you one significant story every day that impacts Tamil Nadu. Curated with verified sources and written for the people.
              </p>
              <Link to="/tn-today" className="mt-3 text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                About this initiative <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Related Awareness & Rights Guides */}
            {seoLinks.awareness.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Civic Rights & Official Guides
                </h3>
                <div className="space-y-2 shadow-none">
                  {seoLinks.awareness.map((guide, idx) => (
                    <Link
                      key={idx}
                      to={guide.url}
                      className="block p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-100 dark:border-slate-700 transition-colors group"
                    >
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded font-mono block w-fit mb-1">
                        {guide.tag}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug">
                        {guide.title}
                      </p>
                    </Link>
                  ))}
                </div>
                <Link to="/awareness" className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
                  All Awareness Guides <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Quick Facts sidebar */}
            {keyFacts.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">⚡ Quick Facts</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-700 space-y-0">
                  {keyFacts.slice(0, 6).map((fact, i) => (
                    <div key={i} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{fact.label}</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-right ml-3">{fact.value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* More from TN Today */}
            {moreArticles.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">📰 More from TN Today</h3>
                <div className="space-y-3">
                  {moreArticles.map(a => (
                    <Link key={a.id} to={`/tn-today/${a.slug}`}
                      className="flex gap-2 group hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl p-1 -mx-1 transition-colors">
                      {isImageUrl(a.featured_image) ? (
                        <img src={a.featured_image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {a.title}
                        </p>
                        {a.publish_date && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {format(new Date(a.publish_date), "d MMM yyyy")}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/tn-today" className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
                  View All Articles <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Sidebar Related Links & Civic Tools */}
            <SidebarRelatedLinks type="tn-today" currentSlug={article.slug} />

            {/* Share sidebar */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">🔗 Share this story</h3>
              <ShareRow url={pageUrl} title={article.title} />
            </div>

            {/* CTA: Make your area better */}
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-4 text-white">
              <div className="flex items-start gap-3">
                <div>
                  <p className="font-bold text-sm">Make your area better</p>
                  <p className="text-xs text-blue-200 mt-0.5 leading-relaxed">Report issues, track progress and see real changes in your community.</p>
                  <Link to="/create" className="mt-3 flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 rounded-lg transition-colors w-fit">
                    <span>+ Log an Issue</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
