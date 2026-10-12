'use client'
import { Link } from '@/lib/router-compat'
import { useLanguage } from '@/context/LanguageContext'
import { Calendar, ChevronRight, FileText, CheckCircle2, BarChart3, ArrowLeft, ArrowUpRight } from 'lucide-react'

export default function WeeklyMonthlyDigestView({ type = 'weekly', data }) {
  const { lang } = useLanguage()
  const isTa = lang === 'ta'

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        Record not found.
      </div>
    )
  }

  const isWeekly = type === 'weekly'

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 sm:py-12 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/tn-politics" className="hover:text-blue-600 transition-colors">
            {isTa ? 'அரசியல் மேடை' : 'TN Politics'}
          </Link>
          <span>/</span>
          <Link href="/tn-politics/today" className="hover:text-blue-600 transition-colors">
            {isTa ? 'தினசரி அறிக்கை' : 'Daily Digest'}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            {isWeekly ? (isTa ? 'வாராந்திர சுருக்கம்' : 'Weekly Recap') : (isTa ? 'மாதாந்திர அறிக்கை' : 'Monthly Scorecard')}
          </span>
        </div>

        {/* Header Block */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Calendar className="w-3.5 h-3.5" />
              <span>{isWeekly ? (isTa ? data.date_range_ta : data.date_range) : (isTa ? data.month_name_ta : data.month_name)}</span>
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
              {isWeekly ? '7-Day Comprehensive Rollup' : data.rating || 'Monthly Governance Audit'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {isTa ? data.title_ta : data.title_en}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {isTa ? data.headline_ta : data.headline_en}
          </p>
        </header>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="p-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white block">
              {isWeekly ? data.total_gos : data.total_gos_month}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {isTa ? 'வெளியிடப்பட்ட அரசாணைகள்' : 'Gazetted G.O.s'}
            </span>
          </div>
          <div className="p-3">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
              {data.total_petitions_resolved?.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {isTa ? 'தீர்வு கண்ட மனுக்கள்' : 'Petitions Cleared'}
            </span>
          </div>
          <div className="p-3 col-span-2 sm:col-span-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">
              {isWeekly ? `₹${data.total_funds_cr} Cr` : `${data.cabinet_meetings} Meetings`}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {isWeekly ? (isTa ? 'ஒதுக்கப்பட்ட நிதி' : 'Infrastructure Funds') : (isTa ? 'அமைச்சரவைக் கூட்டங்கள்' : 'Cabinet Sessions')}
            </span>
          </div>
        </div>

        {/* Highlights / Bullets (Editorial layout) */}
        {data.summary_bullets_en && (
          <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
              {isTa ? 'முக்கிய வாராந்திர மைல்கற்கள்' : 'Key Milestones & Government Decisions'}
            </h2>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {(isTa ? data.summary_bullets_ta : data.summary_bullets_en).map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cross-linking to Full Hub */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/tn-politics/today"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isTa ? 'இன்றைய தினசரி அறிக்கை (மாலை 7:00)' : "View Today's 7:00 PM Daily Digest"}</span>
          </Link>
          <Link
            href="/tn-politics/cm-vijay"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>{isTa ? 'முதல்வர் விஜய் 5 மாத முழு அறிக்கை அட்டை →' : 'CM Vijay Full Administration Tracker →'}</span>
          </Link>
        </div>

      </div>
    </article>
  )
}
