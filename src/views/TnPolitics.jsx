'use client'
import { useState } from 'react'
import { Link } from '@/lib/router-compat'

const POST_TYPE_LABELS = {
  speech_summary: 'Speech Summary',
  policy_explainer: 'Policy',
  party_update: 'Party Update',
  mla_update: 'MLA Update',
  performance_tracker: 'Tracker',
  controversy: 'Controversy',
  bylection: 'By-Election',
  weekly_digest: 'Weekly Digest'
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

export default function TnPoliticsView({ posts = [], mlaTrackers = [] }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'speech_summary', label: 'Speeches' },
    { key: 'policy_explainer', label: 'Policy' },
    { key: 'party_update', label: 'Parties' },
    { key: 'mla_update', label: 'MLAs' },
    { key: 'performance_tracker', label: 'Tracker' },
    { key: 'bylection', label: 'By-Elections' }
  ]

  const filtered = activeFilter === 'all' 
    ? posts 
    : posts.filter(p => p.post_type === activeFilter)

  return (
    <div className="tn-politics-page max-w-5xl mx-auto px-4 py-8 text-slate-900 dark:text-slate-100">
      <div className="politics-header mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800">
        <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          🗳️ VizhiTN Political Desk
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">TN Politics</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Tamil Nadu political news, speech summaries, policy explainers and MLA trackers. Updated daily.
        </p>
      </div>

      <div className="party-quick-links flex flex-wrap gap-2 mb-6">
        {['tvk','dmk','aiadmk','bjp-tn','ntk','pmk'].map(party => (
          <Link
            key={party}
            href={`/tn-politics/party/${party}`}
            className="party-chip px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700"
            style={{ borderLeftWidth: '4px', borderLeftColor: PARTY_COLORS[party] || '#666' }}
          >
            {party.toUpperCase()}
          </Link>
        ))}
      </div>

      <div className="politics-filters flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {filters.map(f => (
          <button 
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`filter-chip px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === f.key 
                ? 'active bg-blue-600 text-white shadow-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="politics-posts space-y-4 mb-14">
        {filtered.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            <p className="no-posts font-medium">No posts yet. Check back soon.</p>
          </div>
        )}
        {filtered.map(post => (
          <Link
            key={post.id}
            href={`/tn-politics/${post.slug || post.id}`}
            className="politics-post-card block p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow"
          >
            <span className="post-type-badge inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 mb-2">
              {POST_TYPE_LABELS[post.post_type] || post.post_type}
            </span>
            <h2 className="text-lg sm:text-xl font-bold leading-snug">{post.title_en}</h2>
            {post.title_ta && <p className="title-ta text-sm text-slate-600 dark:text-slate-400 mt-1">{post.title_ta}</p>}
            {post.seo_description && (
              <p className="post-description text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {post.seo_description}
              </p>
            )}
            <div className="post-meta flex items-center gap-3 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-600 dark:text-slate-300">{post.author_name || 'VizhiTN Politics Desk'}</span>
              <span>•</span>
              <span>{post.created_date ? new Date(post.created_date).toLocaleDateString('en-IN') : 'Recent'}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mla-section pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">MLA District Tracker</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your district MLA performance since May 2026
          </p>
        </div>
        <div className="mla-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {mlaTrackers.map(mla => (
            <Link
              key={mla.district_slug}
              href={`/tn-politics/mla/${mla.district_slug}`}
              className="mla-card p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all flex items-center gap-3 group"
            >
              <div className="relative shrink-0">
                {mla.photo_url ? (
                  <img
                    src={mla.photo_url}
                    alt={mla.mla_name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover object-top border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-11 h-11 rounded-xl items-center justify-center text-xs font-black border border-slate-200 dark:border-slate-700 ${mla.photo_url ? 'hidden' : 'flex'}`}
                  style={{
                    backgroundColor: (PARTY_COLORS[mla.party_slug] || '#64748b') + '20',
                    color: PARTY_COLORS[mla.party_slug] || '#64748b'
                  }}
                >
                  {mla.mla_name ? mla.mla_name.split(' ').filter(Boolean).slice(-1)[0]?.charAt(0) || 'M' : 'M'}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="district-name block text-[11px] font-bold text-slate-400 uppercase tracking-wide truncate">
                    {mla.district_name}
                  </span>
                  <span
                    className="party-badge px-1.5 py-0.5 rounded text-[9px] font-extrabold text-white shrink-0"
                    style={{ background: PARTY_COLORS[mla.party_slug] || '#666' }}
                  >
                    {mla.party_name}
                  </span>
                </div>
                <span className="mla-name block text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {mla.mla_name}
                </span>
                {mla.mla_name_ta && (
                  <span className="mla-name-ta block text-[10px] text-slate-400 truncate">
                    {mla.mla_name_ta}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
