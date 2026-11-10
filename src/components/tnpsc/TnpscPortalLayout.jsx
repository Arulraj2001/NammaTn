'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Award, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TNPSC_EXAMS, TNPSC_SUBJECTS } from '@/lib/tnpscData';
import CustomAdBanner from '@/components/ads/CustomAdBanner';

export default function TnpscPortalLayout({ 
  children, 
  activeTab = 'daily', // 'daily' | 'exams' | 'topics' | 'pyq'
  currentExam = null,
  currentSubject = null
}) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === 'ta' ? ta : en);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* 1. Portal Navigation Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
            {/* Logo / Badge */}
            <div className="flex items-center gap-3">
              <Link href="/tnpsc" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">TNPSC Portal</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      2026
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {T('Samacheer Kalvi & PYQ Practice', 'சமச்சீர் கல்வி & முந்தைய ஆண்டு வினாக்கள்')}
                  </p>
                </div>
              </Link>
            </div>

            {/* Portal Tab Switcher */}
            <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs font-bold">
              <Link
                href="/tnpsc"
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'daily'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{T('Daily 5-Mark', 'தினசரி வினாடி வினா')}</span>
              </Link>

              <Link
                href="/tnpsc/exams/group-4"
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'exams'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{T('Exams Hub', 'தேர்வு வாரியாக')}</span>
              </Link>

              <Link
                href="/tnpsc/topics/vallinam-migum-idangal"
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'topics'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{T('Topic Summaries', 'பாடப்பிரிவு குறிப்புகள்')}</span>
              </Link>

              <Link
                href="/tnpsc/pyq"
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pyq'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{T('PYQ Papers', 'முந்தைய ஆண்டு தாள்கள்')}</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* 2. Top Leaderboard Ad Container (728x90 desktop / 320x50 mobile, CLS-safe) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="min-h-[90px] w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-center text-center overflow-hidden">
          <CustomAdBanner slot="leaderboard" />
        </div>
      </div>

      {/* 3. Main 3-Column Portal Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* ──────────────── LEFT STICKY RAIL (260px) ──────────────── */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-4 sticky top-20">
            {/* Left Ad Unit (300x250 or 160x600 responsive box) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Advertisement</span>
              <div className="mt-1.5 min-h-[250px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden">
                <CustomAdBanner slot="sidebar" />
              </div>
            </div>

            {/* Quick Syllabus Subject Directory */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>{T('Syllabus Subjects', 'பாடத்திட்டம்')}</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400">8 Subjects</span>
              </div>
              <ul className="text-xs space-y-1">
                {TNPSC_SUBJECTS.filter(s => s.slug !== 'all').map((sub) => (
                  <li key={sub.slug}>
                    <Link
                      href={`/tnpsc/${sub.slug}`}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                        currentSubject === sub.slug
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <span>{sub.icon}</span>
                        <span>{sub.name_ta}</span>
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Samacheer Standard Books Pill */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Samacheer Kalvi 6-12</span>
              </span>
              <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed">
                {T(
                  '100% of our questions reference standard State Board textbook chapters with verified page citations.',
                  'அனைத்து வினாக்களும் தமிழ்நாடு அரசு சமச்சீர் கல்வி பாடப்புத்தகப் பக்க ஆதாரங்களுடன் தரப்பட்டுள்ளன.'
                )}
              </p>
            </div>
          </aside>

          {/* ──────────────── CENTER MAIN COLUMN (Fluid) ──────────────── */}
          <main className="w-full lg:flex-1 min-w-0">
            {children}
          </main>

          {/* ──────────────── RIGHT STICKY RAIL (280px) ──────────────── */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-20">
            {/* Right Ad Unit (300x250) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Advertisement</span>
              <div className="mt-1.5 min-h-[250px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden">
                <CustomAdBanner slot="sidebar" />
              </div>
            </div>

            {/* Official Downloads & PYQ Quick Links */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>{T('Official PYQ & Keys', 'முந்தைய வினாத்தாள்கள்')}</span>
                </h3>
              </div>
              <ul className="text-xs space-y-2">
                <li>
                  <Link
                    href="/tnpsc/pyq/group-4-2024"
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    <span>Group 4 2024 Official Paper</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Solved
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tnpsc/pyq/group-4-2022"
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    <span>Group 4 2022 Question Paper</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tnpsc/pyq/group-2-2022"
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    <span>Group 2 2022 Prelims Paper</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </Link>
                </li>
              </ul>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/tnpsc/pyq"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>{T('View all PYQ papers', 'அனைத்து வினாத்தாள்களையும் பார்க்க')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Daily High-Yield Strategy Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border border-amber-300 dark:border-amber-900/60 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-400 font-black text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{T('Daily Exam Tip', 'தினசரி தேர்வு உத்தி')}</span>
              </div>
              <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                {T(
                  'General Tamil Part A carries 100 questions. Focusing on 10th Standard chapters 1-5 guarantees 25+ direct one-mark scores.',
                  'பொதுத்தமிழ் பகுதி அ-வில் 100 வினாக்கள் வருகின்றன. 10-ஆம் வகுப்பு இயல்கள் 1-5-ஐ முடித்தால் 25+ நேரடி மதிப்பெண்களை உறுதி செய்யலாம்.'
                )}
              </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

