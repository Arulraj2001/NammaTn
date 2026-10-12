'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import {
  CM_PROFILE,
  VITAL_METRICS,
  WHAT_HE_DID_ACTIONS,
  FLAGSHIP_SCHEMES,
  RECENT_GO_ORDERS,
  GRIEVANCE_STEPS,
  CM_FAQS
} from '@/lib/cmVijayData'
import {
  ShieldCheck, Phone, ExternalLink, MapPin, Calendar, Building2,
  CheckCircle2, Layers, Search, ChevronDown, ChevronUp, FileText,
  Clock, ArrowRight, Zap, GraduationCap, Wheat, Bus, Award, Info,
  AlertCircle
} from 'lucide-react'

export default function CmVijayTrackerView({ relatedPosts = [] }) {
  const { lang } = useLanguage()
  const isTa = lang === 'ta'
  const T = (en, ta) => (isTa ? (ta || en) : en)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [selectedSchemeCat, setSelectedSchemeCat] = useState('all')
  const [openFaqId, setOpenFaqId] = useState('faq-1')

  // Sector filtering for "What did he do?"
  const filteredActions = useMemo(() => {
    return WHAT_HE_DID_ACTIONS.filter(item => {
      const matchesSector = selectedSector === 'all' || item.sector === selectedSector
      const matchesSearch = !searchQuery.trim() || 
        item.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title_ta.includes(searchQuery) ||
        item.action_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.impact_en.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSector && matchesSearch
    })
  }, [selectedSector, searchQuery])

  // Scheme category filtering
  const filteredSchemes = useMemo(() => {
    return selectedSchemeCat === 'all'
      ? FLAGSHIP_SCHEMES
      : FLAGSHIP_SCHEMES.filter(s => s.category === selectedSchemeCat)
  }, [selectedSchemeCat])

  const toggleFaq = (id) => {
    setOpenFaqId(prev => (prev === id ? null : id))
  }

  const SECTOR_PILLS = [
    { key: 'all', label_en: 'All Actions (8)', label_ta: 'அனைத்தும் (8)' },
    { key: 'education', label_en: 'Education', label_ta: 'கல்வி' },
    { key: 'agriculture', label_en: 'Agriculture', label_ta: 'விவசாயம்' },
    { key: 'transport', label_en: 'Transport', label_ta: 'போக்குவரத்து' },
    { key: 'electricity', label_en: 'Power & EB', label_ta: 'மின்சாரம்' },
    { key: 'governance', label_en: 'Governance', label_ta: 'நிர்வாகம்' }
  ]

  const SCHEME_PILLS = [
    { key: 'all', label_en: 'All Schemes', label_ta: 'அனைத்து திட்டங்கள்' },
    { key: 'education', label_en: 'Education', label_ta: 'கல்வி' },
    { key: 'agriculture', label_en: 'Farming', label_ta: 'விவசாயம்' },
    { key: 'transport', label_en: 'Transit', label_ta: 'போக்குவரத்து' },
    { key: 'electricity', label_en: 'Electricity', label_ta: 'மின்சாரம்' }
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#071324] text-slate-800 dark:text-slate-100 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── BREADCRUMBS ── */}
        <nav aria-label="Breadcrumb" className="mb-5 text-xs text-slate-500 dark:text-slate-400">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-civic-600 dark:hover:text-civic-300">
                {T('Home', 'முகப்பு')}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/tn-politics" className="hover:text-civic-600 dark:hover:text-civic-300">
                {T('TN Politics', 'தமிழக அரசியல்')}
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-slate-800 dark:text-slate-200" aria-current="page">
              {T('CM Vijay Administration Tracker', 'முதல்வர் விஜய் அரசு செயல்பாடுகள்')}
            </li>
          </ol>
        </nav>

        {/* ── [1] COMPACT EXECUTIVE HEADER (Minimal, Non-Bloated) ── */}
        <header className="relative bg-white dark:bg-[#0c1f38] border border-civic-200/90 dark:border-civic-800/80 rounded-2xl p-4 sm:p-6 mb-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              {/* Photo / Avatar */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-500/30 flex-shrink-0 bg-slate-100 dark:bg-slate-800 shadow-xs">
                <Image
                  src={CM_PROFILE.photo_url}
                  alt={CM_PROFILE.name_en}
                  fill
                  sizes="80px"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Title & Metadata */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    {T('Incumbent Administration (17th Assembly)', '17-வது தமிழ்நாடு சட்டமன்ற அரசு')}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    🟢 {T('Active Term (2026–2031)', 'செயலில் உள்ள பதவிக்காலம்')}
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {T(CM_PROFILE.name_en, CM_PROFILE.name_ta)}
                  <span className="block text-xs sm:text-sm font-semibold text-civic-600 dark:text-civic-300 mt-0.5">
                    {T(CM_PROFILE.title_en, CM_PROFILE.title_ta)} • {CM_PROFILE.party_name}
                  </span>
                </h1>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {T(CM_PROFILE.constituency_en, CM_PROFILE.constituency_ta)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {T('Sworn in:', 'பதவியேற்பு:')} {T(CM_PROFILE.assumed_office, CM_PROFILE.assumed_office_ta)}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {T('Fort St. George', 'புனித ஜார்ஜ் கோட்டை')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Pill Buttons */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <a
                href={`tel:${CM_PROFILE.helpline_main}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-civic-600 hover:bg-civic-700 text-white shadow-2xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{T('Call CM Cell: 1100', '1100 உதவி எண்')}</span>
              </a>
              <a
                href={CM_PROFILE.official_portal}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <span>{T('Grievance Portal', 'மனு பதிவு தளம்')}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>

          </div>
        </header>

        {/* ── [2] 4 MICRO-METRICS (Horizontal Strip) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {VITAL_METRICS.map((metric) => (
            <div
              key={metric.id}
              className="bg-white dark:bg-[#0c1f38] border border-civic-200/80 dark:border-civic-800/80 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span className="font-medium">{T(metric.label_en, metric.label_ta)}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-civic-100/70 dark:bg-civic-900/60 text-civic-700 dark:text-civic-300 font-bold">
                  {T(metric.badge_en, metric.badge_ta)}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── [2.5] TODAY'S 7:00 PM ADMINISTRATION DIGEST CALLOUT ── */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-transparent border border-amber-500/20 dark:border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                {T("Daily 7:00 PM Governance Dispatch", "தினசரி மாலை 7:00 மணி நேரடி அரசு அறிக்கை")}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                {T("What Did the Government Do Today? Full breakdown of orders, reviews & grievance stats", "இன்று அரசு என்ன செய்தது? முழு அரசாணைகள், ஆய்வுகள் மற்றும் குறைதீர்ப்பு விவரங்கள்")}
              </span>
            </div>
          </div>
          <Link
            href="/tn-politics/today"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-2xs"
          >
            <span>{T("Read Today's Digest →", "இன்றைய அறிக்கை படிக்க →")}</span>
          </Link>
        </div>

        {/* ── [3] "WHAT DID HE DO?" (HOT IMPRESSIONS CORNERSTONE) ── */}
        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {T('What Did CM Vijay Do? — Key Actions & Major Decisions', 'விஜய் என்ன செய்தார்? — முக்கிய சாதனைகள் & முடிவுகள்')}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {T(
                  'Verified government orders, enacted policies, and public impact metrics since taking office.',
                  'பதவியேற்றது முதல் பிறப்பிக்கப்பட்ட முக்கிய அரசாணைகள், நலத்திட்டங்கள் மற்றும் மக்கள் பயன் விவரங்கள்.'
                )}
              </p>
            </div>

            {/* Micro Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={T('Search action or scheme...', 'தேடுக (எ.கா: காலை உணவு)...')}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-civic-500"
              />
            </div>
          </div>

          {/* Sector Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
            {SECTOR_PILLS.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setSelectedSector(pill.key)}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors text-xs ${
                  selectedSector === pill.key
                    ? 'bg-civic-600 text-white'
                    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {T(pill.label_en, pill.label_ta)}
              </button>
            ))}
          </div>

          {/* Minimal Action Cards Grid (Height capped, scannable) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredActions.map((action) => (
              <article
                key={action.id}
                className="bg-white dark:bg-[#0c1f38] border border-civic-200/80 dark:border-civic-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-civic-400 dark:hover:border-civic-600 transition-all shadow-2xs"
              >
                <div>
                  {/* Top Bar: Sector + Date/G.O. + Status Badge */}
                  <div className="flex items-center justify-between text-[11px] mb-1.5 gap-2">
                    <span className="font-bold text-civic-600 dark:text-civic-300 bg-civic-50 dark:bg-civic-900/60 px-2 py-0.5 rounded border border-civic-100 dark:border-civic-800">
                      {T(action.sector_en, action.sector_ta)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                        {action.go_ref}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {T(action.status, action.status_ta)}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1">
                    {T(action.title_en, action.title_ta)}
                  </h3>

                  {/* 1-Line Action Summary */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                    {T(action.action_en, action.action_ta)}
                  </p>
                </div>

                {/* Impact Row */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                    ⚡ <strong className="text-slate-700 dark:text-slate-200">{T('Impact:', 'பயன்:')}</strong> {T(action.impact_en, action.impact_ta)}
                  </span>
                  <Link
                    href={action.link_url || "/tn-politics"}
                    className="inline-flex items-center gap-1 font-bold text-civic-600 dark:text-civic-300 hover:underline shrink-0"
                  >
                    <span>{T('Read Guide', 'முழு விவரம்')}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {filteredActions.length === 0 && (
            <div className="text-center py-8 bg-white dark:bg-[#0c1f38] border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
              {T('No actions found matching your search.', 'தேடலுக்குரிய முடிவுகள் இல்லை.')}
            </div>
          )}
        </section>

        {/* ── [4] KEY WELFARE & DEVELOPMENT SCHEMES (Compact Card Directory) ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-civic-500" />
                {T('Flagship Schemes & Citizen Entitlements', 'அரசு நலத்திட்டங்கள் & பயனாளி விவரங்கள்')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {T('Eligibility guidelines, monthly grant allowances, and official department helplines.', 'தகுதி வரம்புகள், உதவித்தொகை மற்றும் அதிகாரப்பூர்வ உதவி எண்கள்.')}
              </p>
            </div>
          </div>

          {/* Scheme Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
            {SCHEME_PILLS.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setSelectedSchemeCat(pill.key)}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors text-xs ${
                  selectedSchemeCat === pill.key
                    ? 'bg-civic-600 text-white'
                    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {T(pill.label_en, pill.label_ta)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white dark:bg-[#0c1f38] border border-civic-200/80 dark:border-civic-800/80 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {T(scheme.category_en, scheme.category_ta)}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      {T(scheme.status, scheme.status_ta)}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug mb-1">
                    {T(scheme.name_en, scheme.name_ta)}
                  </h3>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-2">
                    <div className="flex items-start gap-1">
                      <span className="text-slate-400">👥</span>
                      <span><strong>{T('Target:', 'பயனாளி:')}</strong> {T(scheme.target_en, scheme.target_ta)}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-slate-400">💰</span>
                      <span><strong>{T('Benefit:', 'பயன்:')}</strong> {T(scheme.benefit_en, scheme.benefit_ta)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] gap-2">
                  <Link
                    href={scheme.link_url || `/schemes/${scheme.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-civic-600 dark:text-civic-300 hover:underline"
                  >
                    <span>{T('Eligibility & Apply', 'விண்ணப்பிக்கும் முறை')}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                  <a
                    href={`tel:${scheme.helpline}`}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 hover:underline shrink-0"
                  >
                    <Phone className="w-2.5 h-2.5" />
                    <span>{scheme.helpline}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── [5] TWO-COLUMN BALANCED STREAM: G.O. ORDERS + CITIZEN GRIEVANCE GUIDE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          {/* Left Column (7/12): Recent Government Orders */}
          <div className="lg:col-span-7">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-civic-500" />
              {T('Recent Government Orders & Directives (G.O.)', 'சமீபத்திய அரசாணைகள் & அறிவிப்புகள்')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {T('Gazette gazetted policy decisions directly affecting state infrastructure.', 'மாநில கட்டமைப்பு மற்றும் நிதி தொடர்பான முக்கிய அரசாணைகள்.')}
            </p>

            <div className="space-y-2.5">
              {RECENT_GO_ORDERS.map((go, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#0c1f38] border border-civic-200/80 dark:border-civic-800/80 rounded-xl p-3 flex items-start gap-3 shadow-2xs"
                >
                  <div className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap mt-0.5">
                    {go.go_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>{T(go.dept, go.dept_ta)}</span>
                      <span>{go.date}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {T(go.title_en, go.title_ta)}
                    </p>
                    {go.link_url && (
                      <div className="mt-1">
                        <Link
                          href={go.link_url}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-civic-600 dark:text-civic-300 hover:underline"
                        >
                          <span>{T('Read Gazette Order Analysis', 'அரசாணை முழு விவரம்')}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (5/12): How to Complain to CM Cell */}
          <div className="lg:col-span-5">
            <div className="bg-civic-50/70 dark:bg-civic-950/40 border border-civic-200 dark:border-civic-800/80 rounded-2xl p-4 sm:p-5">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-civic-600 dark:text-civic-400" />
                {T('Citizen Grievance Redressal (CM Cell)', 'முதலமைச்சர் தனிப்பிரிவு புகார் வழிகாட்டி')}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                {T('Direct 3-step citizen complaint pathway for delayed government works.', 'அரசுப் பணிகள் தாமதம் குறித்த உடனடி 3-படி புகார் முறை.')}
              </p>

              <div className="space-y-3">
                {GRIEVANCE_STEPS.map((step) => (
                  <div key={step.step} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-civic-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {T(step.title_en, step.title_ta)}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                        {T(step.desc_en, step.desc_ta)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verified Helpline Callout */}
              <div className="mt-4 pt-3 border-t border-civic-200/80 dark:border-civic-800 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {T('Toll-Free Helpline:', 'கட்டணமில்லா எண்:')} <strong>1100</strong>
                  </span>
                  <a
                    href="https://cmcell.tn.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-civic-600 dark:text-civic-300 hover:underline inline-flex items-center gap-1"
                  >
                    <span>cmcell.tn.gov.in</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <Link
                  href="/rights/cm-cell-petition-redressal-guide"
                  className="inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-civic-600 hover:bg-civic-700 text-white font-bold text-[11px] transition-colors mt-1"
                >
                  <span>{T('Read Statutory 30-Day SLA & Rights Guide →', '30-நாள் தீர்வு சட்ட உரிமைகள் வழிகாட்டி →')}</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* ── [6] GOOGLE PAA FAQS ACCORDION ── */}
        <section className="mb-10">
          <div className="mb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {T('Frequently Asked Questions (பொதுக் கேள்விகள்)', 'அடிக்கடி கேட்கப்படும் கேள்விகள்')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {T('Verified answers to top Google search queries about CM Vijay’s government.', 'முதல்வர் விஜய் நிர்வாகம் குறித்த அதிகாரப்பூர்வ விளக்கங்கள்.')}
            </p>
          </div>

          <div className="space-y-2">
            {CM_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id
              return (
                <div
                  key={faq.id}
                  className="border border-civic-200/90 dark:border-civic-800/80 rounded-xl overflow-hidden bg-white dark:bg-[#0c1f38] shadow-2xs"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left gap-3"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {T(faq.question_en, faq.question_ta)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-civic-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                      <p>{T(faq.answer_en, faq.answer_ta)}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── FOOTER / EDITORIAL CONSTITUTION ── */}
        <footer className="text-center text-[11px] text-slate-400 dark:text-slate-500 py-4 border-t border-slate-200 dark:border-slate-800">
          <p>
            {T(
              'VizhiTN Civic Tracker is an independent, non-partisan public proof ledger. All policy metrics are cross-verified with official Tamil Nadu Gazette notifications and Departmental press releases.',
              'விழிTN அரசு செயல்பாடுகள் கண்காணிப்பகம் ஒரு நடுநிலையான பொது ஆவணம். அனைத்து தகவல்களும் அரசு அதிகாரப்பூர்வ அறிவிப்புகள் மூலம் சரிபார்க்கப்பட்டவை.'
            )}
          </p>
        </footer>

      </div>
    </div>
  )
}
