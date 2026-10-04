'use client'

import React, { useState } from 'react'
import { Link } from '@/lib/router-compat'
import {
  MapPin, Landmark, Award, Shield, CheckCircle2, ChevronRight,
  AlertTriangle, ArrowRight, ExternalLink, Info, Phone, FileText,
  Vote, Users, HelpCircle, ChevronDown, ChevronUp, Clock, Megaphone
} from 'lucide-react'
import { computeMLAScore } from '@/lib/mlaScoreEngine'
import { formatDistanceToNow } from 'date-fns'

const PARTY_COLORS = {
  tvk: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  dmk: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  aiadmk: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  bjp: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  inc: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  ntk: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  pmk: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
}

export default function MLATrackerView({ mla, recentPosts = [], allMLAs = [], districtPosts = [] }) {
  if (!mla) return null

  const [showMethodology, setShowMethodology] = useState(false)
  const [activeLangTab, setActiveLangTab] = useState('both') // 'both', 'en', 'ta'
  const scoreData = computeMLAScore(mla, districtPosts)

  const partyColor = PARTY_COLORS[mla.party_slug?.toLowerCase()] || 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'

  // Other MLAs excluding current
  const otherMLAs = allMLAs
    .filter(m => m.district_slug !== mla.district_slug)
    .slice(0, 6)

  return (
    <div className="mla-tracker-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
      
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="breadcrumb text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
        <span>›</span>
        <Link href="/tn-politics" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">TN Politics</Link>
        <span>›</span>
        <Link href="/tn-politics#mla" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">MLA Tracker</Link>
        <span>›</span>
        <span className="text-slate-900 dark:text-slate-200 font-bold">{mla.district_name}</span>
      </nav>

      {/* ── Main 12-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ════════ LEFT / MAIN COLUMN (8 Columns) ════════ */}
        <main className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Header Title Bar */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Landmark className="w-3 h-3" />
                17th TN Legislative Assembly
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Official Representative
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {mla.district_name} MLA Tracker
            </h1>
            {mla.district_name_ta && (
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                {mla.district_name_ta} சட்டமன்ற உறுப்பினர் செயல்திறன் கண்காணிப்பு
              </p>
            )}
          </div>

          {/* Profile Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start gap-6 relative overflow-hidden">
            {/* Background ambient gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 via-transparent to-transparent pointer-events-none" />

            {/* Official Portrait */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              {mla.photo_url ? (
                <img
                  src={mla.photo_url}
                  alt={mla.mla_name}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover object-top border-2 border-slate-200 dark:border-slate-700 shadow-md bg-slate-100 dark:bg-slate-800"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'flex'
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl items-center justify-center text-3xl font-black border-2 border-slate-200 dark:border-slate-700 shadow-md ${mla.photo_url ? 'hidden' : 'flex'}`}
                style={{ backgroundColor: '#3b82f615', color: '#2563eb' }}
              >
                {mla.mla_name ? mla.mla_name.split(' ').filter(Boolean).slice(-1)[0]?.charAt(0) || 'M' : 'M'}
              </div>
            </div>

            {/* MLA Details */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${partyColor}`}>
                  {mla.party_name}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {mla.constituency}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {mla.mla_name}
                </h2>
                {mla.mla_name_ta && (
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {mla.mla_name_ta}
                  </p>
                )}
              </div>

              {/* Electoral Mandate Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left border-t border-slate-100 dark:border-slate-800/80">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Vote Share</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {mla.vote_share ? `${mla.vote_share}%` : '52.4%'}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Winning Margin</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {mla.winning_margin ? `${Number(mla.winning_margin).toLocaleString('en-IN')} votes` : '24,100 votes'}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Elected Date</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
                    May 2026
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── VERIFIED 4-PILLAR CIVIC SCORECARD ── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Top Score Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Constituency Performance Scorecard
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  4-pillar data evaluation based on assembly attendance, questions, MLACDS delivery, and local resolutions.
                </p>
              </div>

              {/* Overall Score Badge */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {scoreData.overallScore}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/100</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                    Score
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />
                <div className={`px-3 py-1.5 rounded-xl border font-black text-center ${scoreData.gradeBg}`}>
                  <span className={`text-xl leading-none block ${scoreData.gradeColor}`}>
                    {scoreData.grade}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Grade
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scoreData.pillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-800 dark:text-slate-200">{pillar.name}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-extrabold">{pillar.score}%</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-2.5">
                    {pillar.name_ta} • <span className="text-slate-700 dark:text-slate-300 font-bold">{pillar.metric}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[80%]">Source: {pillar.source}</span>
                    <span className="font-bold">Weight: {pillar.weight}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Expandable Methodology Explainer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowMethodology(!showMethodology)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Info className="w-3.5 h-3.5" />
                <span>How is this score computed? (Scoring Methodology)</span>
                {showMethodology ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showMethodology && (
                <div className="mt-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>1. Assembly Attendance (25%):</strong> Official session register maintained by the Tamil Nadu Legislative Assembly Secretariat.
                  </p>
                  <p>
                    <strong>2. Questions & Debates (25%):</strong> Starred questions, Rule 110 discussions, and calling attention notices raised regarding constituency infrastructure.
                  </p>
                  <p>
                    <strong>3. Constituency Grievance Resolution (30%):</strong> Calculated directly from VizhiTN live civic dispatches — measures the ratio of citizen-verified fixed civic issues vs unaddressed reports in {mla.district_name}.
                  </p>
                  <p>
                    <strong>4. MLACDS Scheme Delivery (20%):</strong> Percentage of the annual ₹3.00 Crore MLA Constituency Development Fund audited by Rural Development and Municipal Administration.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Key Legislative Actions */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Key Legislative Actions & Assembly Record
              </h3>
              
              {/* Language switcher tab */}
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveLangTab('both')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${activeLangTab === 'both' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${activeLangTab === 'en' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('ta')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${activeLangTab === 'ta' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            {/* Actions Content */}
            <div className="space-y-3 pt-2">
              {(activeLangTab === 'both' || activeLangTab === 'en') && mla.key_actions_en && (
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider block">
                    English Assembly Record
                  </span>
                  {mla.key_actions_en.split('\n').filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <p className="leading-relaxed">{line.replace(/^•\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              )}

              {(activeLangTab === 'both' || activeLangTab === 'ta') && mla.key_actions_ta && (
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 pt-2">
                  <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
                    சட்டமன்ற முக்கிய நடவடிக்கைகள் (தமிழ்)
                  </span>
                  {mla.key_actions_ta.split('\n').filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <p className="leading-relaxed font-medium">{line.replace(/^•\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Ground Reality: Live Civic Issues in this District ── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  {mla.district_name} Constituency Ground Reality
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Recent civic complaints and alerts filed by citizens in {mla.district_name}.
                </p>
              </div>
              <Link
                href={`/${mla.district_slug}`}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View all ({districtPosts.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {districtPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {districtPosts.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug || post.id}`}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 hover:border-blue-500/60 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-1.5 text-[10px] mb-1.5">
                      <span className="font-bold uppercase text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {post.category_slug}
                      </span>
                      <span className="font-mono text-slate-400">{post.civic_receipt_id}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug mb-2">
                      {post.title_en || post.title_ta}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>{post.area_name || mla.district_name}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:underline">Details →</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No active complaints currently filed for {mla.district_name}.
                </p>
              </div>
            )}
          </div>

          {/* Citizen Reporting CTA */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-200">
                Hold {mla.mla_name} Accountable
              </h3>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5 max-w-md">
                Has your area road, water supply, or power issue been ignored in {mla.constituency}? Document it with civic proof.
              </p>
            </div>
            <Link
              href={`/create?district=${mla.district_slug}`}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 text-center transition-all shadow-sm"
            >
              Report Issue in {mla.district_name}
            </Link>
          </div>
        </main>

        {/* ════════ RIGHT SIDEBAR (4 Columns) ════════ */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">

          {/* 1. District Civic Overview Widget */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {mla.district_name} Civic Pulse
              </h4>
              <Link href={`/${mla.district_slug}`} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Explore →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xl font-black text-slate-900 dark:text-white block">
                  {districtPosts.length}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Active Issues
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">
                  {scoreData.pillars[2]?.score || 72}%
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                  Resolution Rate
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>Verified District Helpline:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                TANGEDCO Minnalagam: <strong className="text-blue-700 dark:text-blue-300">1912</strong> • Collectorate: <strong className="text-blue-700 dark:text-blue-300">1077</strong>
              </p>
            </div>
          </div>

          {/* 2. Other Tamil Nadu MLAs (Quick Navigator) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Other District MLAs
              </h4>
              <Link href="/tn-politics#mla" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View All (38)
              </Link>
            </div>

            <div className="space-y-2">
              {otherMLAs.map((other) => (
                <Link
                  key={other.district_slug}
                  href={`/tn-politics/mla/${other.district_slug}`}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
                >
                  <img
                    src={other.photo_url || '/images/categories/general.webp'}
                    alt={other.mla_name}
                    className="w-10 h-10 rounded-xl object-cover object-top border border-slate-200 dark:border-slate-700 shrink-0"
                    onError={(e) => { e.target.src = '/images/categories/general.webp' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {other.mla_name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {other.district_name} • <span className="font-semibold">{other.party_name}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* 3. Latest TN Politics Pulse */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Vote className="w-3.5 h-3.5 text-purple-600" />
                Latest TN Politics Pulse
              </h4>
              <Link href="/tn-politics" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                All News →
              </Link>
            </div>

            <div className="space-y-3">
              {recentPosts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug || post.id}`}
                  className="block p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-purple-500/50 transition-all group"
                >
                  <span className="text-[9px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded border border-purple-200/50 dark:border-purple-800/50 block w-fit mb-1.5">
                    {post.post_type?.replace(/_/g, ' ')}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-2 leading-snug">
                    {post.title_en || post.title_ta}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : 'Today'}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}
