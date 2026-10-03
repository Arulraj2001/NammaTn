'use client'
import { useState, useMemo } from 'react'
import { Link } from '@/lib/router-compat'
import { useLanguage } from '@/context/LanguageContext'
import MlaPhoto from '@/components/MlaPhoto'
import { Search, MapPin, ChevronRight, Users, Newspaper, Filter } from 'lucide-react'

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

export default function TnPoliticsView({ posts = [], mlaTrackers = [] }) {
  const { lang } = useLanguage()
  const isTa = lang === 'ta'

  const [activeFilter, setActiveFilter] = useState('all')
  const [mlaSearch, setMlaSearch] = useState('')
  const [mlaPartyFilter, setMlaPartyFilter] = useState('all')

  const filters = [
    { key: 'all', label: isTa ? 'அனைத்தும்' : 'All' },
    { key: 'performance_tracker', label: isTa ? 'செயல் அறிக்கை' : 'Report Cards' },
    { key: 'bylection', label: isTa ? 'இடைத்தேர்தல்' : 'By-Elections' },
    { key: 'party_update', label: isTa ? 'கட்சிகள்' : 'Parties' },
    { key: 'speech_summary', label: isTa ? 'பேச்சுகள்' : 'Speeches' },
    { key: 'policy_explainer', label: isTa ? 'கொள்கைகள்' : 'Policies' }
  ]

  const filteredPosts = activeFilter === 'all' 
    ? posts 
    : posts.filter(p => p.post_type === activeFilter)

  // Filter MLAs by search and party on the left panel
  const filteredMlas = useMemo(() => {
    return mlaTrackers.filter(mla => {
      const matchesParty = mlaPartyFilter === 'all' || mla.party_slug === mlaPartyFilter
      if (!matchesParty) return false

      if (!mlaSearch.trim()) return true
      const q = mlaSearch.toLowerCase().trim()
      return (
        (mla.mla_name || '').toLowerCase().includes(q) ||
        (mla.mla_name_ta || '').toLowerCase().includes(q) ||
        (mla.district_name || '').toLowerCase().includes(q) ||
        (mla.district_name_ta || '').toLowerCase().includes(q) ||
        (mla.constituency || '').toLowerCase().includes(q) ||
        (mla.constituency_ta || '').toLowerCase().includes(q)
      )
    })
  }, [mlaTrackers, mlaSearch, mlaPartyFilter])

  return (
    <div className="tn-politics-page max-w-7xl mx-auto px-4 py-8 text-slate-900 dark:text-slate-100 min-h-screen">
      
      {/* 2-Column Desktop Grid: Left is MLA District Tracker, Right is Editorial Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ================================================================ */}
        {/* LEFT COLUMN: MLA District Tracker (Desktop Left Side)             */}
        {/* ================================================================ */}
        <aside className="order-2 lg:order-1 lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <Users className="w-3 h-3" />
                  <span>{isTa ? '17வது சட்டமன்றம்' : '17th TN Assembly'}</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {filteredMlas.length} / {mlaTrackers.length} {isTa ? 'தொகுதிகள்' : 'Districts'}
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{isTa ? 'சட்டமன்ற உறுப்பினர் பட்டியல்' : 'MLA District Tracker'}</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isTa ? '2026–2031 அதிகாரப்பூர்வ பிரதிநிதிகள் மற்றும் தொகுதி செயல்பாடு' : '2026–2031 official constituency representatives and monthly scores'}
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={mlaSearch}
                onChange={(e) => setMlaSearch(e.target.value)}
                placeholder={isTa ? 'மாவட்டம் அல்லது MLA பெயர்...' : 'Search district, MLA or constituency...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
              />
              {mlaSearch && (
                <button
                  onClick={() => setMlaSearch('')}
                  className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Party Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {['all', 'tvk', 'dmk', 'aiadmk', 'bjp', 'inc'].map(party => (
                <button
                  key={party}
                  onClick={() => setMlaPartyFilter(party)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 ${
                    mlaPartyFilter === party
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {party === 'all' ? (isTa ? 'அனைத்து' : 'All') : party.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Scrollable MLA List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[580px] overflow-y-auto pr-1 space-y-1">
              {filteredMlas.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  {isTa ? 'பிரதிநிதிகள் கிடைக்கவில்லை' : 'No MLAs matched your search.'}
                </div>
              )}

              {filteredMlas.map(mla => (
                <Link
                  key={mla.district_slug}
                  href={`/tn-politics/mla/${mla.district_slug}`}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group"
                >
                  <MlaPhoto 
                    photoUrl={mla.photo_url} 
                    name={mla.mla_name} 
                    partySlug={mla.party_slug} 
                    size="sm" 
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 truncate">
                        {isTa ? (mla.district_name_ta || mla.district_name) : mla.district_name}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white shrink-0"
                        style={{ background: PARTY_COLORS[mla.party_slug] || '#666' }}
                      >
                        {mla.party_name}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {isTa ? (mla.mla_name_ta || mla.mla_name) : mla.mla_name}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                      <span className="truncate max-w-[140px]">
                        {isTa ? (mla.constituency_ta || mla.constituency) : mla.constituency}
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                        {mla.performance_score || 85}/100
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>

          </div>
        </aside>

        {/* ================================================================ */}
        {/* RIGHT COLUMN: Political News Feed, Portals & Filter Controls     */}
        {/* ================================================================ */}
        <main className="order-1 lg:order-2 lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Header Banner */}
          <div className="politics-header bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              🗳️ {isTa ? 'விழிTN அரசியல் மேடை' : 'VizhiTN Political Desk'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isTa ? 'தமிழ்நாடு அரசியல் — 17வது சட்டசபை (2026–2031)' : 'TN Politics — 17th Assembly (2026–2031)'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isTa 
                ? 'தமிழ்நாடு அரசியல் செய்திகள், முதலமைச்சர் விஜய் அரசு அறிக்கை அட்டை, சட்டமன்ற விவாதங்கள் மற்றும் 38 மாவட்ட எம்.எல்.ஏ கண்காணிப்பு.'
                : 'Verified Tamil Nadu political reports, TVK government 5-month scorecards, floor debates, and district MLA trackers. Updated daily.'
              }
            </p>
          </div>

          {/* Party Quick Links Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {isTa ? 'கட்சி வாரியான அறிக்கைகள்' : 'Party Ledger Portals'}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { slug: 'tvk', name: 'TVK (தவெக)' },
                { slug: 'dmk', name: 'DMK (திமுக)' },
                { slug: 'aiadmk', name: 'AIADMK (அதிமுக)' },
                { slug: 'bjp-tn', name: 'BJP (பாஜக)' },
                { slug: 'inc', name: 'INC (காங்)' },
                { slug: 'ntk', name: 'NTK (நாதக)' }
              ].map(p => (
                <Link
                  key={p.slug}
                  href={`/tn-politics/party/${p.slug}`}
                  className="px-3 py-2 rounded-xl text-center text-xs font-bold transition-all shadow-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 truncate"
                  style={{ borderLeftWidth: '3px', borderLeftColor: PARTY_COLORS[p.slug] || '#666' }}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="politics-filters flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filters.map(f => (
              <button 
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`filter-chip px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === f.key 
                    ? 'active bg-blue-600 text-white shadow-xs' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Editorial Articles Feed */}
          <div className="politics-posts space-y-4">
            {filteredPosts.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                <p className="no-posts font-medium">
                  {isTa ? 'செய்திகள் எதுவும் கிடைக்கவில்லை.' : 'No posts match this filter.'}
                </p>
              </div>
            )}

            {filteredPosts.map(post => {
              const displayTitle = isTa ? (post.title_ta || post.title_en) : post.title_en
              const subtitle = isTa ? post.title_en : post.title_ta
              const labelMap = isTa ? POST_TYPE_LABELS.ta : POST_TYPE_LABELS.en

              return (
                <Link
                  key={post.id}
                  href={`/tn-politics/${post.slug || post.id}`}
                  className="politics-post-card block p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <span className="post-type-badge inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {labelMap[post.post_type] || post.post_type}
                    </span>

                    {post.civic_receipt_id && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {post.civic_receipt_id}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg sm:text-xl font-extrabold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {displayTitle}
                  </h2>

                  {subtitle && (
                    <p className="title-ta text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-serif line-clamp-1">
                      {subtitle}
                    </p>
                  )}

                  {post.seo_description && (
                    <p className="post-description text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                      {post.seo_description}
                    </p>
                  )}

                  <div className="post-meta flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {post.author_name || 'VizhiTN Politics Desk'}
                      </span>
                      <span>•</span>
                      <span>{post.created_date ? new Date(post.created_date).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN') : 'Recent'}</span>
                    </div>

                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{isTa ? 'முழு அறிக்கை படிக்க' : 'Read Report'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

        </main>

      </div>
    </div>
  )
}
