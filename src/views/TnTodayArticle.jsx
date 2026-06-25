"use client";
import React, { useEffect } from "react";
import DOMPurify from "dompurify";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTnTodayBySlug, getPublishedTnToday, incrementTnTodayView } from "@/services/tnToday";
import { format } from "date-fns";
import {
  Clock, Calendar, User, ChevronRight, Share2, ExternalLink,
  MessageSquare, ArrowLeft, CheckCircle2, AlertCircle, BookOpen,
  Clipboard, Copy, Hash, ArrowRight
} from "lucide-react";
import { setPageMeta, injectPostStructuredData } from "@/lib/seo";
import { cn } from "@/lib/utils";

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

// ─── Parse pipe-delimited sections ────────────────────────────────────────────
function parseLines(text) {
  if (!text) return [];
  return text.split("\n").map(l => l.trim()).filter(Boolean);
}
function parsePipeLines(text) {
  return parseLines(text).map(line => {
    const [left, ...rest] = line.split("|");
    return { label: left?.trim(), value: rest.join("|").trim() };
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
export default function TnTodayArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["tn-today-article", slug],
    queryFn: () => getTnTodayBySlug(slug),
    staleTime: 300_000,
    enabled: !!slug,
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ["tn-today-related", article?.category],
    queryFn: () => getPublishedTnToday({ limit: 4, category: article?.category }),
    enabled: !!article?.category,
    staleTime: 300_000,
  });

  const moreArticles = relatedArticles.filter(a => a.slug !== slug).slice(0, 3);

  // SEO & structured data
  useEffect(() => {
    if (!article) return;
    const canonicalUrl = article.canonical_url || `${window.location.origin}/tn-today/${article.slug}`;
    const image = article.social_image || article.featured_image || "";

    setPageMeta({
      title: article.seo_title || article.title,
      description: article.seo_description || article.subtitle || article.summary || "",
      image,
      url: canonicalUrl,
      canonical: canonicalUrl,
      type: "article",
    });

    // Article JSON-LD
    const schema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.seo_title || article.title,
      description: article.seo_description || article.subtitle || "",
      image: image ? [image] : [],
      datePublished: article.publish_date || article.created_date,
      dateModified: article.updated_date || article.publish_date || article.created_date,
      author: { "@type": "Person", name: article.author_name || "VizhiTN Editorial Team" },
      publisher: {
        "@type": "Organization",
        name: "VizhiTN",
        logo: { "@type": "ImageObject", url: `${window.location.origin}/logo.png` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      keywords: article.seo_keywords || "",
      articleSection: article.category || "general",
    };
    const existing = document.getElementById("tn-ld-tn-today");
    if (existing) {
      existing.text = JSON.stringify(schema);
    } else {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "tn-ld-tn-today";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    // Increment view count (fire and forget)
    if (article.id) incrementTnTodayView(article.id).catch(() => {});

    return () => {
      const el = document.getElementById("tn-ld-tn-today");
      if (el) el.text = "";
    };
  }, [article]);

  if (isLoading) return <ArticleSkeleton />;

  if (isError || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-20">
        <BookOpen className="w-14 h-14 text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Story Not Found</h1>
        <p className="text-slate-500 mb-6">This TN Today story isn't available or hasn't been published yet.</p>
        <Link to="/tn-today" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to TN Today
        </Link>
      </div>
    );
  }

  const cat = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG.general;
  const pubDate = article.publish_date ? new Date(article.publish_date) : new Date(article.created_date);
  const pageUrl = `${window.location.origin}/tn-today/${article.slug}`;

  const keyFacts = parseLines(article.key_facts).map(line => {
    const [label, ...rest] = line.split(":");
    return rest.length > 0 ? { label: label.trim(), value: rest.join(":").trim() } : { label: line, value: "" };
  });
  const timelineEvents = parsePipeLines(article.timeline);
  const officialSources = parsePipeLines(article.official_sources);
  const relatedLinks = parsePipeLines(article.related_civic_links);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Top editorial bar ── */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide">📰 TN TODAY</span>
            <span className="opacity-60">·</span>
            <span className="opacity-80">Today's most important story from Tamil Nadu</span>
          </div>
          <div className="flex items-center gap-1 opacity-80">
            <Clock className="w-3 h-3" />
            <span>Published daily at 8:00 AM</span>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <nav className="max-w-6xl mx-auto px-4 py-3" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <li><Link to="/tn-today" className="hover:text-blue-600 transition-colors">TN Today</Link></li>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <li><Link to={`/tn-today/category/${article.category}`} className="hover:text-blue-600 transition-colors capitalize">{article.category}</Link></li>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <li className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{article.title}</li>
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
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subtitle && (
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-4 font-normal">
                {article.subtitle}
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
                navigator.share?.({ title: article.title, url: pageUrl }) ||
                navigator.clipboard.writeText(pageUrl);
              }} className="flex items-center gap-1.5 ml-auto text-blue-600 hover:text-blue-700 font-medium">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* Featured image */}
            {article.featured_image && (
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <img src={article.featured_image} alt={article.title}
                  className="w-full h-[260px] sm:h-[380px] object-cover" />
              </div>
            )}

            {/* Why it matters callout */}
            {article.why_it_matters && (
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Why this matters to Tamil Nadu</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{article.why_it_matters}</p>
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
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
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
                      {a.featured_image ? (
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
