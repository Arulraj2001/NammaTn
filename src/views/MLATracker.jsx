'use client'
import { Link } from '@/lib/router-compat'

export default function MLATrackerView({ mla, recentPosts = [] }) {
  if (!mla) return null
  const score = mla.performance_score ?? 50

  return (
    <div className="mla-tracker-page max-w-4xl mx-auto px-4 py-8 text-slate-900 dark:text-slate-100">
      <div className="breadcrumb text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:underline">Home</Link> › 
        <Link href="/tn-politics" className="hover:underline">TN Politics</Link> › 
        <Link href="/tn-politics#mla" className="hover:underline">MLA Tracker</Link> › 
        <span className="text-slate-700 dark:text-slate-300 font-semibold">{mla.district_name}</span>
      </div>

      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{mla.district_name} MLA Tracker</h1>
      {mla.district_name_ta && (
        <p className="tamil-subtitle text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-1">
          {mla.district_name_ta} MLA கண்காணிப்பு
        </p>
      )}

      <div className="mla-profile-card mt-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="mla-info space-y-2 flex-1">
          <span className="party-name inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {mla.party_name}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold">{mla.mla_name}</h2>
          {mla.mla_name_ta && <p className="text-sm text-slate-500">{mla.mla_name_ta}</p>}
          <p className="constituency text-sm text-slate-600 dark:text-slate-300">
            <strong>Constituency:</strong> {mla.constituency}
          </p>
          <p className="elected-date text-xs text-slate-500">
            Elected: {mla.elected_date ? new Date(mla.elected_date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            }) : 'May 2026'}
          </p>
          {mla.vote_share && <p className="text-xs text-slate-500">Vote Share: {mla.vote_share}%</p>}
          {mla.winning_margin && (
            <p className="text-xs text-slate-500">
              Winning Margin: {Number(mla.winning_margin).toLocaleString('en-IN')} votes
            </p>
          )}
        </div>

        <div className="performance-score w-full md:w-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center shrink-0">
          <div className="score-circle inline-flex items-baseline justify-center gap-1">
            <span className="score-number text-3xl font-black text-blue-600 dark:text-blue-400">{score}</span>
            <span className="score-label text-xs font-semibold text-slate-400">/ 100</span>
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">Community Performance Score</p>
          <p className="score-note text-[11px] text-slate-400 mt-0.5">Updated monthly based on civic action</p>
        </div>
      </div>

      {mla.key_actions_en && (
        <div className="key-actions mt-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Key Actions This Month</h3>
          <div className="actions-content space-y-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {mla.key_actions_en.split('\n').map((line, i) => (
              line.trim() && <p key={i}>• {line}</p>
            ))}
          </div>
        </div>
      )}

      {mla.key_actions_ta && (
        <div className="key-actions tamil mt-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">இந்த மாதம் முக்கிய நடவடிக்கைகள்</h3>
          <div className="actions-content space-y-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {mla.key_actions_ta.split('\n').map((line, i) => (
              line.trim() && <p key={i}>• {line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="report-civic-issue mt-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
            Report a Civic Issue in {mla.district_name}
          </h3>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
            Is your MLA not performing? Document it on VizhiTN.
          </p>
        </div>
        <Link
          href={`/${mla.district_slug}`}
          className="btn-report px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 text-center transition-colors shadow-sm"
        >
          View {mla.district_name} Civic Reports
        </Link>
      </div>

      <div className="back-link mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link href="/tn-politics" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to TN Politics
        </Link>
      </div>
    </div>
  )
}
