'use client'
import React, { useState } from 'react'
import { Link } from '@/lib/router-compat'
import { useLanguage } from '@/context/LanguageContext'
import { 
  Share2, Check, Copy, ArrowLeft, Clock, ShieldCheck, 
  FileText, ExternalLink, Scale, AlertTriangle, CheckCircle2,
  ThumbsUp, Lightbulb, Search, ChevronRight,
  TrendingUp, Users, Building2, MapPin
} from 'lucide-react'
import MlaPhoto from '@/components/MlaPhoto'

const POST_TYPE_LABELS = {
  en: {
    speech_summary: '🎤 Speech Summary',
    policy_explainer: '📋 Policy Explainer',
    party_update: '🏛️ Party Update',
    mla_update: '👤 MLA Update',
    performance_tracker: '📊 Performance Tracker',
    controversy: '⚠️ Controversy',
    bylection: '🗳️ By-Election',
    weekly_digest: '📰 Weekly Digest'
  },
  ta: {
    speech_summary: '🎤 பேச்சு தொகுப்பு',
    policy_explainer: '📋 கொள்கை விளக்கம்',
    party_update: '🏛️ கட்சி செய்திகள்',
    mla_update: '👤 சட்டமன்ற உறுப்பினர்',
    performance_tracker: '📊 செயல் அறிக்கை',
    controversy: '⚠️ முக்கிய சர்ச்சை',
    bylection: '🗳️ இடைத்தேர்தல்',
    weekly_digest: '📰 வாராந்திர சுருக்கம்'
  }
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

    const numMatch = line.match(/^(\d+)[\.\)]\s*(.*)/)
    if (numMatch) {
      const fullText = numMatch[2]
      const splitIdx = fullText.indexOf('—') !== -1 ? fullText.indexOf('—') : fullText.indexOf(':')
      let title = ''
      let body = fullText
      if (splitIdx !== -1 && splitIdx < 60) {
        title = fullText.slice(0, splitIdx).trim()
        body = fullText.slice(splitIdx + 1).trim()
      }
      items.push({ num: numMatch[1], title, body })
      continue
    }

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
  const { lang } = useLanguage()
  const isTa = lang === 'ta'

  const [copied, setCopied] = useState(false)
  const [reaction, setReaction] = useState(null)

  if (!post) return null

  // Language selection: Driven 100% by global navbar language switcher
  const hasTaContent = Boolean(post.content_ta)
  const activeContentText = isTa && hasTaContent ? post.content_ta : post.content_en
  const parsed = parseArticleContent(activeContentText)

  const activeTitle = isTa ? (post.title_ta || post.title_en) : post.title_en
  const secondaryTitle = isTa ? post.title_en : post.title_ta
  const labelMap = isTa ? POST_TYPE_LABELS.ta : POST_TYPE_LABELS.en

  const wordCount = (activeContentText || '').split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(wordCount / 180))

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://www.vizhitn.in/tn-politics/${post.slug || post.id}`

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`📰 *${activeTitle}*\n\n${isTa ? 'விழிTN தமிழ்நாடு அரசியல் கள அறிக்கை படிக்க:' : 'Read full Tamil Nadu political report on VizhiTN:'}\n${pageUrl}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${activeTitle} — via @VizhiTN`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(pageUrl)}`, '_blank')
  }

  // Find spotlight MLA (match article's district if relevant, or CM C. Joseph Vijay for Chennai)
  const matchedDistrictMLA = post.district_slug ? mlaTrackers.find(m => m.district_slug === post.district_slug) : null
  const spotlightMLA = matchedDistrictMLA || mlaTrackers.find(m => m.district_slug === 'chennai') || mlaTrackers[0]

  return (
    <div className="tn-politics-detail-wrapper bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      
      {/* Top Header / Breadcrumb Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:underline shrink-0">
              {isTa ? 'முகப்பு' : 'Home'}
            </Link>
            <span>›</span>
            <Link href="/tn-politics" className="hover:underline shrink-0 font-medium text-blue-600 dark:text-blue-400">
              {isTa ? 'தமிழக அரசியல்' : 'TN Politics'}
            </Link>
            <span>›</span>
            <span className="truncate text-slate-700 dark:text-slate-300 font-semibold max-w-[200px] sm:max-w-md">
              {activeTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
              title={isTa ? 'இணைப்பை நகலெடு' : 'Copy page link'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copied ? (isTa ? 'நகலெடுக்கப்பட்டது' : 'Copied') : (isTa ? 'பகிர்' : 'Share')}</span>
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
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>{isTa ? 'அறிக்கை உள்ளடக்கம்' : 'Report Navigation'}</span>
              </h3>
              <nav className="space-y-1 text-xs">
                <a 
                  href="#overview" 
                  className="block px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  • {isTa ? 'முக்கிய கண்ணோட்டம்' : 'Executive Overview'}
                </a>
                {parsed.items.length > 0 && (
                  <a 
                    href="#deliveries" 
                    className="block px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
                  >
                    • {isTa ? `முக்கிய நடவடிக்கைகள் (${parsed.items.length})` : `Key Deliveries (${parsed.items.length})`}
                  </a>
                )}
                {parsed.pending.length > 0 && (
                  <a 
                    href="#pending" 
                    className="block px-2.5 py-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors font-medium"
                  >
                    • {isTa ? `நிலுவையில் உள்ளவை (${parsed.pending.length})` : `Pending Promises (${parsed.pending.length})`}
                  </a>
                )}
                {parsed.verdict && (
                  <a 
                    href="#verdict" 
                    className="block px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    • {isTa ? 'விழிTN தீர்ப்பு' : 'VizhiTN Editorial Verdict'}
                  </a>
                )}
              </nav>
            </div>

            {/* Verification & Civic ID Badge */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {isTa ? 'உறுதிசெய்யப்பட்ட ஆவணம்' : 'Fact-Checked Ledger'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isTa 
                  ? 'சட்டமன்ற கூட்டத்தொடர் பதிவுகள், அரசாணைகள் மற்றும் நேரடி கள ஆய்வுகளின் அடிப்படையில் தொகுக்கப்பட்டது.'
                  : 'Compiled from 17th Assembly Hansard records, government gazettes, and official press releases.'
                }
              </p>
              {post.civic_receipt_id && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] text-slate-400 uppercase font-mono">
                    {isTa ? 'ஆவண எண்' : 'Civic Receipt'}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {post.civic_receipt_id}
                  </span>
                </div>
              )}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} {isTa ? 'நிமிட வாசிப்பு' : 'min read'} ({wordCount} {isTa ? 'சொற்கள்' : 'words'})</span>
              </div>
            </div>

            {/* Quick Share Desk */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isTa ? 'நம்பகமான தகவலை பகிருங்கள்' : 'Spread Verified Civic Facts'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isTa ? 'வதந்திகளை தவிர்த்து உண்மைத் தகவல்களை உடனுக்குடன் பகிருங்கள்.' : 'Combat misinformation in TN politics with verified reports.'}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <span>X (Twitter)</span>
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
                  {labelMap[post.post_type] || post.post_type}
                </span>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{readTime} {isTa ? 'நிமிட வாசிப்பு' : 'min read'}</span>
                </div>
              </div>

              {/* Main Headline (Auto-adapts to global language) */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {activeTitle}
                </h1>
                {secondaryTitle && (
                  <p className="mt-3 text-base sm:text-xl font-bold text-slate-600 dark:text-slate-300 leading-snug font-serif">
                    {secondaryTitle}
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
                      {post.author_name || (isTa ? 'விழிTN அரசியல் மேடை' : 'VizhiTN Politics Desk')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isTa ? 'பதிவு தேதி: ' : 'Published '}
                      {post.created_date ? new Date(post.created_date).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      }) : 'October 2026'}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-600 dark:text-slate-300">
                  {isTa ? '🇮🇳 தமிழ் பதிப்பு' : '🌐 English Edition'}
                </span>
              </div>

              {/* Lead / Opening Paragraph */}
              {parsed.lead && (
                <div id="overview" className="lead-paragraph text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed border-l-4 border-blue-600 pl-4 py-1 bg-blue-50/40 dark:bg-blue-950/20 rounded-r-xl">
                  {parsed.lead}
                </div>
              )}

              {/* Regular Paragraphs */}
              {parsed.regular.map((para, i) => (
                <p key={i} className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                  {para}
                </p>
              ))}

              {/* Key Deliveries List (Cards with Styled Numbers) */}
              {parsed.items.length > 0 && (
                <div id="deliveries" className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                      {isTa ? 'முக்கிய நடவடிக்கைகள் & சாதனைகள்' : 'Key Deliveries & On-Record Actions'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {parsed.items.map((item, idx) => (
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
              {parsed.pending.length > 0 && (
                <div id="pending" className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-base">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span>{isTa ? 'நிலுவையில் உள்ளவை & தொடர் கண்காணிப்பு' : 'What Remains Pending / Under Follow-up'}</span>
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
                    {isTa ? 'சட்டமன்ற ஆய்வுக்கு விழிTN தொடர்ந்து கண்காணிக்கும் வாக்குறுதிகள்:' : 'Citizen promises tracked by VizhiTN for assembly scrutiny:'}
                  </p>
                  <div className="space-y-2 pt-1">
                    {parsed.pending.map((line, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Editorial Verdict Box */}
              {parsed.verdict && (
                <div id="verdict" className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-800 shadow-md space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-indigo-800/60 pb-3">
                    <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                      <Scale className="w-4 h-4 text-amber-400" />
                      {isTa ? 'விழிTN தலையங்கத் தீர்ப்பு' : 'VizhiTN Editorial Verdict'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {isTa ? 'சுயாதீன பகுப்பாய்வு' : 'Independent Analysis'}
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-100">
                    &ldquo;{parsed.verdict}&rdquo;
                  </p>
                  {parsed.outro.length > 0 && (
                    <div className="text-xs text-slate-300 pt-2 border-t border-indigo-900/60">
                      {parsed.outro.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reader Sentiment / Poll Widget */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {isTa ? 'இந்த அரசியல் அறிக்கை தெளிவாகவும் நடுநிலையாகவும் உள்ளதா?' : 'Was this political report clear and objective?'}
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
                      <span>{isTa ? 'துல்லியமானது 👍' : 'Accurate (100+)'}</span>
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
                      <span>{isTa ? 'பயனுள்ளது 💡' : 'Insightful'}</span>
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
                      <span>{isTa ? 'கூடுதல் தரவு தேவை 🔍' : 'Need More Data'}</span>
                    </button>
                  </div>
                  {reaction && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
                      {isTa 
                        ? 'உங்கள் கருத்துக்கு நன்றி! இது மக்கள் நல அறிக்கைகளை வரிசைப்படுத்த உதவுகிறது.'
                        : 'Thank you for your civic feedback! Your reaction helps rank trusted political ledger items.'
                      }
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
                  <span>{isTa ? '← அனைத்து அரசியல் செய்திகள்' : '← Back to All TN Politics'}</span>
                </Link>

                <Link
                  href="/explore"
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {isTa ? 'தொகுதி பிரச்சனை பதிவு செய் →' : 'Report Local Issue →'}
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
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isTa ? 'தொகுதி பிரதிநிதி' : 'District MLA Spotlight'}</span>
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
                      {isTa ? (spotlightMLA.mla_name_ta || spotlightMLA.mla_name) : spotlightMLA.mla_name}
                    </h4>
                    {isTa && spotlightMLA.mla_name && (
                      <p className="text-[11px] text-slate-500 truncate">{spotlightMLA.mla_name}</p>
                    )}
                    {!isTa && spotlightMLA.mla_name_ta && (
                      <p className="text-[11px] text-slate-500 truncate">{spotlightMLA.mla_name_ta}</p>
                    )}
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {isTa 
                        ? `${spotlightMLA.constituency_ta || spotlightMLA.constituency} (${spotlightMLA.district_name_ta || spotlightMLA.district_name})`
                        : `${spotlightMLA.constituency} (${spotlightMLA.district_name})`
                      }
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">{isTa ? 'செயல்திறன் புள்ளி:' : 'Civic Score:'}</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">{spotlightMLA.performance_score || 85} / 100</span>
                </div>

                <Link
                  href={`/tn-politics/mla/${spotlightMLA.district_slug}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{isTa ? 'முழு செயல்பாடு பார்க்க' : 'Track Full Performance'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Political Party Portals Interlinking */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{isTa ? 'கட்சி வாரியான அறிக்கைகள்' : 'Party Ledger Portals'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {isTa ? 'கட்சி அறிக்கைகள், நிலைப்பாடுகள் மற்றும் அதிகாரப்பூர்வ பதிவுகள்:' : 'Follow official statements, manifestos, and ground updates:'}
              </p>
              
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
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isTa ? 'தொடர்புடைய அரசியல் செய்திகள்' : 'Related Political Reports'}</span>
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {relatedPosts.map(rel => {
                    const relTitle = isTa ? (rel.title_ta || rel.title_en) : rel.title_en
                    const relType = isTa ? (labelMap[rel.post_type] || rel.post_type) : (POST_TYPE_LABELS.en[rel.post_type] || rel.post_type)

                    return (
                      <Link
                        key={rel.id}
                        href={`/tn-politics/${rel.slug || rel.id}`}
                        className="block py-3 first:pt-0 last:pb-0 group"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                          {relType}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {relTitle}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {rel.created_date ? new Date(rel.created_date).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN') : 'Recent'}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Hyperlocal Civic Callout */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                📢 {isTa ? 'மக்கள் குரல்' : 'Citizen Voice'}
              </span>
              <h4 className="text-xs font-bold text-amber-950 dark:text-amber-100">
                {isTa ? 'உங்கள் வார்டில் குடிநீர், சாலை, மின்தடை பிரச்சனையா?' : 'Potholes, power cut or water issue in your ward?'}
              </h4>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">
                {isTa ? 'உங்கள் பிரதிநிதியிடம் கோரிக்கை வையுங்கள். புகைப்படத்துடன் விழிTN தளத்தில் பதிவு செய்யுங்கள்.' : 'Hold your local representatives accountable. Document grievances with photos on VizhiTN.'}
              </p>
              <Link
                href="/explore"
                className="mt-2 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{isTa ? 'பிரச்சனையை பதிவு செய்' : 'Report Grievance'}</span>
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
                <span>{isTa ? '38 மாவட்ட சட்டமன்ற உறுப்பினர்கள்' : 'Track All 38 District MLAs'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTa 
                  ? '17வது தமிழ்நாடு சட்டமன்றம் (2026–2031) அதிகாரப்பூர்வ உறுப்பினர்கள் மற்றும் செயல் அறிக்கைகள்'
                  : 'Constituency representatives of the 17th Tamil Nadu Legislative Assembly (2026–2031) across all 38 districts'
                }
              </p>
            </div>
            <Link
              href="/tn-politics#mla"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
            >
              {isTa ? 'முழு 38 மாவட்ட பட்டியல் →' : 'View Full 38 District Grid →'}
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
                    {isTa ? (m.district_name_ta || m.district_name) : m.district_name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {isTa ? (m.mla_name_ta || m.mla_name) : m.mla_name}
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
