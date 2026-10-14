'use client'
import { useState } from 'react'
import { Link } from '@/lib/router-compat'
import { useLanguage } from '@/context/LanguageContext'
import { 
  Calendar, Clock, CheckCircle2, FileText, Phone, ArrowUpRight, 
  Share2, Shield, ArrowLeft, ChevronRight, BarChart3, Building2,
  AlertCircle, Sparkles, Check
} from 'lucide-react'

export default function DailyDigestView({ digest, weekly, monthly }) {
  const { lang, setLang } = useLanguage()
  const [copied, setCopied] = useState(false)
  const isTa = lang === 'ta'

  if (!digest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        No digest data available for this date.
      </div>
    )
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (navigator.share) {
      try {
        await navigator.share({
          title: isTa ? digest.title_ta : digest.title_en,
          url: url
        })
      } catch {
        // User cancelled share
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 sm:py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Top Breadcrumb & Live Update Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/tn-politics" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {isTa ? 'அரசியல் மேடை' : 'TN Politics'}
            </Link>
            <span>/</span>
            <Link href="/tn-politics/cm-vijay" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {isTa ? 'முதல்வர் விஜய் நிர்வாகம்' : 'CM Vijay Tracker'}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">
              {isTa ? 'தினசரி அறிக்கை' : 'Daily Digest'}
            </span>
          </div>

          {/* Controls: Language switcher & Share */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  !isTa ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('ta')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  isTa ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
              title="Share report"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (isTa ? 'நகலெடுக்கப்பட்டது' : 'Copied') : (isTa ? 'பகிர்' : 'Share')}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Desktop Layout: 68% Main Article, 32% Sticky Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ================================================================ */}
          {/* MAIN ARTICLE CANVAS (Left 8 Cols)                                */}
          {/* ================================================================ */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Header Block */}
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isTa ? 'மாலை 7:00 மணி அதிகாரப்பூர்வ சுருக்கம்' : 'Daily 7:00 PM IST Dispatch'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{digest.date}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {isTa ? 'அதிகாரப்பூர்வ ஆதாரங்கள் இணைக்கப்பட்டுள்ளன' : 'Official sources linked'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3.5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {isTa ? digest.title_ta : digest.title_en}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {isTa ? digest.headline_ta : digest.headline_en}
              </p>

              {digest.official_sources?.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold">{isTa ? 'அதிகாரப்பூர்வ ஆதாரங்கள்: ' : 'Official sources: '}</span>
                  {digest.official_sources.map((url, index) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {new URL(url).hostname.replace(/^www\./, '')}{index < digest.official_sources.length - 1 ? ' · ' : ''}
                    </a>
                  ))}
                </div>
              )}
            </header>

            {/* 60-Second Flash Brief (Clean single-box callout, NOT giant cards) */}
            <section className="p-5 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border-l-4 border-amber-500 border-y border-r border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  {isTa ? '60 வினாடி முக்கிய அம்சங்கள்' : '60-Second Executive Takeaways'}
                </h2>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {(isTa ? digest.summary_60s_ta : digest.summary_60s_en).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* SECTION 1: Chronological Governance Timeline */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{isTa ? 'இன்றைய நடவடிக்கைகள் (காலவரிசை)' : "Today's Governance Timeline"}</span>
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  {digest.timeline?.length || 0} {isTa ? 'நிகழ்வுகள்' : 'Milestones'}
                </span>
              </div>

              {/* Clean Vertical Timeline Thread */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {digest.timeline?.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Bullet marker */}
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 bg-blue-600 group-hover:scale-110 transition-transform" />
                    
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                          {item.time}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {isTa ? item.category_ta : item.category}
                        </span>
                        {item.helpline && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            Helpline: {item.helpline}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {isTa ? item.title_ta : item.title_en}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {isTa ? item.description_ta : item.description_en}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.department}
                        </span>
                        {item.link && (
                          <Link 
                            href={item.link}
                            className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <span>{isTa ? 'விவரம் படிக்க →' : 'Read Full Guide →'}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 2: Government Orders (G.O.s) Signed & Gazetted */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{isTa ? 'அரசிதழ் ஆணைகள் (G.O.s)' : 'Government Orders (G.O.s) Issued'}</span>
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  {digest.gos_and_orders?.length || 0} {isTa ? 'அரசாணைகள்' : 'Orders'}
                </span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                {digest.gos_and_orders?.map((go, idx) => (
                  <div key={idx} className="p-4 sm:p-5 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60">
                        {go.go_number}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {go.official_ref}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isTa ? go.title_ta : go.title_en}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                        {isTa ? 'முக்கிய சாரம்சம்: ' : 'Impact: '}
                      </strong>
                      {isTa ? go.key_takeaway_ta : go.key_takeaway_en}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {go.department}
                      </span>
                      {go.link && (
                        <Link
                          href={go.link}
                          className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          <span>{isTa ? 'அரசாணை விளக்கம் →' : 'G.O. Explainer →'}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 3: Democratic Floor & Opposition Watch */}
            {digest.opposition_watch && digest.opposition_watch.length > 0 && (
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isTa ? 'ஜனநாயக விவாதங்கள் & எதிர்த்தரப்பு கோரிக்கைகள்' : 'Opposition Watch & Democratic Feedback'}</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {digest.opposition_watch.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.party} • {item.speaker}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {item.topic}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {isTa ? item.statement_ta : item.statement_en}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Back to Politics Hub Footer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/tn-politics"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isTa ? 'அரசியல் மேடைக்கு திரும்புக' : 'Back to TN Politics Desk'}</span>
              </Link>
              <Link
                href="/tn-politics/cm-vijay"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>{isTa ? 'முதல்வர் விஜய் 5 மாத முழு அறிக்கை அட்டை →' : 'CM Vijay Full 5-Month Tracker →'}</span>
              </Link>
            </div>

          </main>

          {/* ================================================================ */}
          {/* STICKY EDITORIAL DESK (Right 4 Cols)                             */}
          {/* ================================================================ */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            
            {/* Daily Metrics Dashboard Widget */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {isTa ? 'இன்றைய நிர்வாக எண்கள்' : "Today's Ledger Metrics"}
                </span>
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-lg font-black text-slate-900 dark:text-white block">
                    {digest.metrics?.gos_gazetted || 0}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isTa ? 'வெளியான அரசாணைகள்' : 'G.O.s Issued'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
                    {digest.metrics?.petitions_resolved_today?.toLocaleString() || '0'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isTa ? 'மனுக்கள் தீர்வு' : 'Petitions Cleared'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 block">
                    ₹{digest.metrics?.funds_cleared_cr || 0} Cr
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isTa ? 'ஒதுக்கப்பட்ட நிதி' : 'Funds Sanctioned'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-lg font-black text-purple-600 dark:text-purple-400 block">
                    {digest.metrics?.cabinet_reviews || 0}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isTa ? 'தலைமைச் செயலக ஆய்வுகள்' : 'Reviews Held'}
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Emergency & Service Helplines */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isTa ? 'அங்கீகரிக்கப்பட்ட அரசு உதவி எண்கள்' : 'Verified Helplines'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                {isTa ? 'அரசு சேவை குறைதீர்ப்புக்கான நேரடி தொலைபேசி எண்கள்:' : '24x7 official complaint & emergency toll-free numbers:'}
              </p>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {digest.verified_helplines?.map((h, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {h.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {h.service}
                      </span>
                    </div>
                    <a
                      href={`tel:${h.number.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors shrink-0"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{h.number}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Scheme & Policy Hub Deep Links */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {isTa ? 'தொடர்புடைய திட்டங்கள் & உரிமைகள்' : 'Related Civic Trackers'}
              </span>
              <div className="space-y-1.5">
                {digest.related_trackers?.map((rel, idx) => (
                  <Link
                    key={idx}
                    href={rel.href}
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-blue-600 transition-colors group"
                  >
                    <span className="truncate pr-2">
                      {isTa ? rel.title_ta : rel.title_en}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Edition Navigation: Weekly Rollup & Monthly Scorecard */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {isTa ? 'அடுத்தடுத்த தொகுப்புகள்' : 'Periodic Recaps'}
              </span>
              <Link
                href="/tn-politics/weekly/2026-w41"
                className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors"
              >
                <span>{isTa ? 'வாராந்திர சுருக்கம் (வாரம் 41) →' : 'Weekly Recap (Week 41) →'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/tn-politics/monthly/2026-10"
                className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors"
              >
                <span>{isTa ? 'அக்டோபர் 2026 அறிக்கை அட்டை →' : 'October 2026 Scorecard →'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>

          </aside>

        </div>

      </div>
    </article>
  )
}
