'use client'
import React, { useState } from 'react'
import { Link } from '@/lib/router-compat'
import { 
  Share2, Check, Copy, ArrowLeft, Clock, ShieldCheck, 
  FileText, ExternalLink, Scale, AlertTriangle, CheckCircle2,
  Bookmark, ThumbsUp, Lightbulb, Search, MessageSquare, ChevronRight,
  TrendingUp, Users, Building2, MapPin
} from 'lucide-react'
import MlaPhoto from '@/components/MlaPhoto'

const POST_TYPE_LABELS = {
  speech_summary: '🎤 Speech Summary',
  policy_explainer: '📋 Policy Explainer',
  party_update: '🏛️ Party Update',
  mla_update: '👤 MLA Update',
  performance_tracker: '📊 Performance Tracker',
  controversy: '⚠️ Controversy',
  bylection: '🗳️ By-Election',
  weekly_digest: '📰 Weekly Digest'
}

const PARTY_COLORS = {
  tvk: '#FF6B00',
  dmk: '#E31E24',
  aiadmk: '#00A651',
  bjp: '#FF9933',
  'bjp-tn': '#FF9933',
  inc: '#1E40AF',
  vck: '#0284C7',
  pmk: '#CA8A04',
  ntk: '#18181B',
  independent: '#64748B'
}

// Smart parser for structured political report content
function parseArticleContent(text) {
  if (!text) return { lead: '', items: [], pending: [], verdict: '', outro: '', regular: [] }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  let lead = ''
  const items = []
  const pending = []
  let verdict = ''
  const outro = []
  const regular = []

  let currentMode = 'lead' // lead, items, pending, verdict, outro

  for (const line of lines) {
    // Detect mode switches
    if (/^key deliveries|^delivered|^deliveries|^achievements|^முக்கிய சாதனைகள்|^நடவடிக்கைகள்/i.test(line)) {
      currentMode = 'items'
      continue
    }
    if (/^what remains pending|^pending|^promises pending|^நிலுவையில் உள்ளவை|^நிலுவை/i.test(line)) {
      currentMode = 'pending'
      continue
    }
    if (/^vizhitn verdict:|^verdict:|^editorial verdict:|^முடிவு:|^தீர்ப்பு:/i.test(line)) {
      verdict = line.replace(/^(vizhitn verdict:|verdict:|editorial verdict:|முடிவு:|தீர்ப்பு:)\s*/i, '').trim()
      currentMode = 'verdict'
      continue
    }

    // Numbered deliveries: "1. GOVERNMENT FORMATION — ..." or "1) ..."
    const numMatch = line.match(/^(\d+)[\.\)]\s*(.*)/)
    if (numMatch) {
      const fullText = numMatch[2]
      const splitIdx = fullText.indexOf('—') !== -1 ? fullText.indexOf('—') : fullText.indexOf(':')
      let title = ''
      let body = fullText
      if (splitIdx !== -1 && splitIdx < 50) {
        title = fullText.slice(0, splitIdx).trim()
        body = fullText.slice(splitIdx + 1).trim()
      }
      items.push({ num: numMatch[1], title, body })
      continue
    }

    // Pending bullets: "- Free bus travel..." or "• ..."
    if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
      const cleanLine = line.replace(/^[\-\•\*]\s*/, '').trim()
      if (currentMode === 'pending' || currentMode === 'items') {
        pending.push(cleanLine)
      } else {
        regular.push(line)
      }
      continue
    }

    if (currentMode === 'lead' && !lead) {
      lead = line
    } else if (currentMode === 'verdict') {
      outro.push(line)
    } else {
      regular.push(line)
    }
  }

  return { lead, items, pending, verdict, outro, regular }
}

export default function TnPoliticsDetailView({ post, relatedPosts = [], mlaTrackers = [] }) {
  const [copied, setCopied] = useState(false)
  const [langTab, setLangTab] = useState('en') // 'en', 'ta', 'both'
  const [reaction, setReaction] = useState(null)

  if (!post) return null

  const wordCount = (post.content_en || '').split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(wordCount / 180))
  const parsedEn = parseArticleContent(post.content_en)
  const parsedTa = parseArticleContent(post.content_ta)

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://www.vizhitn.in/tn-politics/${post.slug || post.id}`

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`📰 *${post.title_en}*\n\nRead full Tamil Nadu political report on VizhiTN:\n${pageUrl}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${post.title_en} — via @VizhiTN`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(pageUrl)}`, '_blank')
  }

  // Find spotlight MLA (match article's district if relevant, or CM M.K. Stalin for Chennai)
  const matchedDistrictMLA = post.district_slug ? mlaTrackers.find(m => m.district_slug === post.district_slug) : null
  const spotlightMLA = matchedDistrictMLA || mlaTrackers.find(m => m.district_slug === 'chennai') || mlaTrackers[0]

  return (
    <div className="tn-politics-detail-wrapper bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Top Header / Breadcrumb Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:underline shrink-0">Home</Link>
            <span>›</span>
            <Link href="/tn-politics" className="hover:underline shrink-0 font-medium text-blue-600 dark:text-blue-400">
              TN Politics
            </Link>
            <span>›</span>
            <span className="truncate text-slate-700 dark:text-slate-300 font-semibold max-w-[200px] sm:max-w-md">
              {post.title_en}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
              title="Copy page link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ============================================================== */}
          {/* LEFT RAIL (Desktop Sticky Outline & Metadata)                  */}
          {/* ============================================================== */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-20">
            {/* Quick Outline / Jump Navigation */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Report Navigation
              </h3>
              <nav className="space-y-1 text-xs">
                <a 
                  href="#overview" 
                  className="block px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  • Executive Overview
                </a>
                {parsedEn.items.length > 0 && (
                  <a 
                    href="#deliveries" 
                    className="block px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
                  >
                    • Key Deliveries ({parsedEn.items.length})
                  </a>
                )}
                {parsedEn.pending.length > 0 && (
                  <a 
                    href="#pending" 
                    className="block px-2.5 py-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors font-medium"
                  >
                    • Pending Promises ({parsedEn.pending.length})
                  </a>
                )}
                {parsedEn.verdict && (
                  <a 
                    href="#verdict" 
                    className="block px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    • VizhiTN Editorial Verdict
                  </a>
                )}
                {post.content_ta && (
                  <a 
                    href="#tamil-section" 
                    className="block px-2.5 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors font-bold"
                  >
                    • தமிழில் படிக்க (Tamil)
                  </a>
                )}
              </nav>
            </div>

            {/* Verification & Civic ID Badge */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Fact-Checked Ledger
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Compiled from Assembly Hansard records, government gazettes, and official press releases.
              </p>
              {post.civic_receipt_id && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] text-slate-400 uppercase font-mono">Civic Receipt</span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {post.civic_receipt_id}
                  </span>
                </div>
              )}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} min read ({wordCount} words)</span>
              </div>
            </div>

            {/* Quick Share Desk */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Spread Verified Civic Facts</h4>
              <p className="text-[11px] text-slate-500">Combat misinformation in TN politics with verified reports.</p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Forward on WhatsApp
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  Post on X (Twitter)
                </button>
              </div>
            </div>
          </aside>

          {/* ============================================================== */}
          {/* CENTER COLUMN (Main Editorial Reading Experience)              */}
          {/* ============================================================== */}
          <main className="col-span-12 lg:col-span-9 xl:col-span-6 space-y-6">
            <article className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Header Badges & Post Type */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {POST_TYPE_LABELS[post.post_type] || post.post_type}
                </span>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{readTime} min read</span>
                </div>
              </div>

              {/* Main Headline */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {post.title_en}
                </h1>
                {post.title_ta && (
                  <p className="mt-3 text-base sm:text-xl font-bold text-slate-600 dark:text-slate-300 leading-snug font-serif">
                    {post.title_ta}
                  </p>
                )}
              </div>

              {/* Author & Publication Meta Bar */}
              <div className="flex items-center justify-between gap-4 py-3.5 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                    V
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {post.author_name || 'VizhiTN Politics Desk'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Published {post.created_date ? new Date(post.created_date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      }) : 'October 2026'}
                    </span>
                  </div>
                </div>

                {/* Language Switcher Toolbar */}
                {post.content_ta && (
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setLangTab('en')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        langTab === 'en'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLangTab('ta')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        langTab === 'ta'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      தமிழ்
                    </button>
                    <button
                      onClick={() => setLangTab('both')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        langTab === 'both'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Both
                    </button>
                  </div>
                )}
              </div>

              {/* ========================================================== */}
              {/* ENGLISH EDITORIAL CONTENT                                  */}
              {/* ========================================================== */}
              {(langTab === 'en' || langTab === 'both') && (
                <div className="space-y-6 pt-2">
                  {/* Lead / Opening Paragraph */}
                  {parsedEn.lead && (
                    <div id="overview" className="lead-paragraph text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed border-l-4 border-blue-600 pl-4 py-1 bg-blue-50/40 dark:bg-blue-950/20 rounded-r-xl">
                      {parsedEn.lead}
                    </div>
                  )}

                  {/* Regular Paragraphs (if any before list) */}
                  {parsedEn.regular.map((para, i) => (
                    <p key={i} className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                      {para}
                    </p>
                  ))}

                  {/* Key Deliveries List (Cards with Styled Numbers) */}
                  {parsedEn.items.length > 0 && (
                    <div id="deliveries" className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                          Key Deliveries & On-Record Actions
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-3.5">
                        {parsedEn.items.map((item, idx) => (
                          <div 
                            key={idx}
                            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-start gap-4 shadow-2xs"
                          >
                            <span className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-sm shrink-0 border border-blue-500/20">
                              {String(item.num).padStart(2, '0')}
                            </span>
                            <div className="flex-1 min-w-0">
                              {item.title && (
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide mb-1">
                                  {item.title}
                                </h3>
                              )}
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {item.body}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What Remains Pending (Amber Warning Container) */}
                  {parsedEn.pending.length > 0 && (
                    <div id="pending" className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-base">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span>What Remains Pending / Under Follow-up</span>
                      </div>
                      <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
                        Citizen promises tracked by VizhiTN for assembly scrutiny:
                      </p>
                      <div className="space-y-2 pt-1">
                        {parsedEn.pending.map((line, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Editorial Verdict Box */}
                  {parsedEn.verdict && (
                    <div id="verdict" className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-800 shadow-md space-y-3">
                      <div className="flex items-center justify-between gap-2 border-b border-indigo-800/60 pb-3">
                        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                          <Scale className="w-4 h-4 text-amber-400" />
                          VizhiTN Editorial Verdict
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Independent Analysis</span>
                      </div>
                      <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-100">
                        &ldquo;{parsedEn.verdict}&rdquo;
                      </p>
                      {parsedEn.outro.length > 0 && (
                        <div className="text-xs text-slate-300 pt-2 border-t border-indigo-900/60">
                          {parsedEn.outro.map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================== */}
              {/* TAMIL EDITORIAL CONTENT                                    */}
              {/* ========================================================== */}
              {(langTab === 'ta' || langTab === 'both') && post.content_ta && (
                <div id="tamil-section" className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      🇮🇳 தமிழில் படிக்க (Tamil Edition)
                    </span>
                    <span className="text-xs text-slate-500">முழுமையான செய்தி அறிக்கை</span>
                  </div>

                  {parsedTa.lead && (
                    <div className="text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed border-l-4 border-amber-500 pl-4 py-1 bg-amber-50/30 dark:bg-amber-950/20 rounded-r-xl">
                      {parsedTa.lead}
                    </div>
                  )}

                  {parsedTa.regular.map((para, i) => (
                    <p key={i} className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                      {para}
                    </p>
                  ))}

                  {parsedTa.items.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        முக்கிய நடவடிக்கைகள் & சாதனைகள்:
                      </h3>
                      {parsedTa.items.map((item, idx) => (
                        <div 
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                        >
                          <span className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {item.num}
                          </span>
                          <div className="flex-1">
                            {item.title && <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>}
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{item.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {parsedTa.verdict && (
                    <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                        விழிTN தீர்ப்பு:
                      </span>
                      <p className="text-sm sm:text-base leading-relaxed text-slate-200">
                        {parsedTa.verdict}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Reader Sentiment / Poll Widget */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Was this political report clear and objective?
                  </h4>
                  <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                    <button
                      onClick={() => setReaction('helpful')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        reaction === 'helpful'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Accurate (100+)</span>
                    </button>
                    <button
                      onClick={() => setReaction('insightful')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        reaction === 'insightful'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Insightful</span>
                    </button>
                    <button
                      onClick={() => setReaction('review')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        reaction === 'review'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Need More Data</span>
                    </button>
                  </div>
                  {reaction && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
                      Thank you for your civic feedback! Your reaction helps rank trusted political ledger items.
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Navigation Link */}
              <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                <Link 
                  href="/tn-politics" 
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to All TN Politics</span>
                </Link>

                <Link
                  href="/explore"
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Report Local Issue →
                </Link>
              </div>

            </article>
          </main>

          {/* ============================================================== */}
          {/* RIGHT RAIL (District MLA Spotlight, Parties & Related Stories) */}
          {/* ============================================================== */}
          <aside className="col-span-12 xl:col-span-3 space-y-6">
            
            {/* Spotlight District MLA Card */}
            {spotlightMLA && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    District MLA Spotlight
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white" style={{ background: PARTY_COLORS[spotlightMLA.party_slug] || '#666' }}>
                    {spotlightMLA.party_name}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <MlaPhoto 
                    photoUrl={spotlightMLA.photo_url} 
                    name={spotlightMLA.mla_name} 
                    partySlug={spotlightMLA.party_slug} 
                    size="lg" 
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {spotlightMLA.mla_name}
                    </h4>
                    {spotlightMLA.mla_name_ta && (
                      <p className="text-[11px] text-slate-500 truncate">{spotlightMLA.mla_name_ta}</p>
                    )}
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {spotlightMLA.constituency} ({spotlightMLA.district_name})
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Civic Score:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">{spotlightMLA.performance_score || 85} / 100</span>
                </div>

                <Link
                  href={`/tn-politics/mla/${spotlightMLA.district_slug}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Track Full Performance</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Political Party Portals Interlinking */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Party Ledger Portals
              </h3>
              <p className="text-[11px] text-slate-500">Follow official statements, manifestos, and ground updates:</p>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { slug: 'tvk', name: 'TVK (தவெக)' },
                  { slug: 'dmk', name: 'DMK (திமுக)' },
                  { slug: 'aiadmk', name: 'AIADMK (அதிமுக)' },
                  { slug: 'bjp-tn', name: 'BJP (பாஜக)' },
                  { slug: 'inc', name: 'INC (காங்)' },
                  { slug: 'ntk', name: 'NTK (நாதக)' },
                  { slug: 'pmk', name: 'PMK (பாமக)' },
                  { slug: 'vck', name: 'VCK (விசிக)' }
                ].map(p => (
                  <Link
                    key={p.slug}
                    href={`/tn-politics/party/${p.slug}`}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all text-center block text-xs font-bold bg-white dark:bg-slate-900 truncate"
                    style={{ borderLeftColor: PARTY_COLORS[p.slug] || '#666', borderLeftWidth: '3px' }}
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Political Coverage */}
            {relatedPosts.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Related Political Reports
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {relatedPosts.map(rel => (
                    <Link
                      key={rel.id}
                      href={`/tn-politics/${rel.slug || rel.id}`}
                      className="block py-3 first:pt-0 last:pb-0 group"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                        {POST_TYPE_LABELS[rel.post_type] || rel.post_type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {rel.title_en}
                      </h4>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {rel.created_date ? new Date(rel.created_date).toLocaleDateString('en-IN') : 'Recent'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Hyperlocal Civic Callout */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                📢 Citizen Voice
              </span>
              <h4 className="text-xs font-bold text-amber-950 dark:text-amber-100">
                Potholes, power cut or water issue in your ward?
              </h4>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">
                Hold your local representatives accountable. Document grievances with photos on VizhiTN.
              </p>
              <Link
                href="/explore"
                className="mt-2 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Report Grievance</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

          </aside>

        </div>

        {/* ================================================================ */}
        {/* BOTTOM SECTION: 38 Districts MLA Performance Directory Strip    */}
        {/* ================================================================ */}
        <section className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Track All 38 District MLAs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Constituency representatives of the 17th Tamil Nadu Legislative Assembly (2026–2031) across all 38 districts
              </p>
            </div>
            <Link
              href="/tn-politics#mla"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
            >
              View Full 38 District Grid →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {mlaTrackers.slice(0, 12).map(m => (
              <Link
                key={m.district_slug}
                href={`/tn-politics/mla/${m.district_slug}`}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MlaPhoto 
                    photoUrl={m.photo_url} 
                    name={m.mla_name} 
                    partySlug={m.party_slug} 
                    size="xs" 
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">
                    {m.district_name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {m.mla_name}
                </span>
                <span className="mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded text-white self-start" style={{ background: PARTY_COLORS[m.party_slug] || '#666' }}>
                  {m.party_name}
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
