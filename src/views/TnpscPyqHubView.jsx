'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Calendar, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Filter,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import CustomAdBanner from '@/components/ads/CustomAdBanner';

export default function TnpscPyqHubView({ papers = [], exams = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === 'ta' ? ta : en);

  const [selectedExam, setSelectedExam] = useState('all');

  const filteredPapers = selectedExam === 'all' 
    ? papers 
    : papers.filter(p => p.exam_slug === selectedExam);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <FileText className="w-3.5 h-3.5" />
            <span>TNPSC PYQ Archive</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            Official Answer Keys
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {T('TNPSC Previous Year Question Papers (Solved)', 'டிஎன்பிஎஸ்சி முந்தைய ஆண்டு வினாத்தாள்கள் (விடை விளக்கங்களுடன்)')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {T(
              'Practice authentic TNPSC Group 4, Group 2, and Police SI past exam papers with verified Samacheer Kalvi textbook citations.',
              'அரசு அதிகாரப்பூர்வ வினாத்தாள்கள், சமச்சீர் கல்வி புத்தக ஆதாரங்கள் மற்றும் நேரடி மாதிரித் தேர்வு வசதியுடன்.'
            )}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedExam('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedExam === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {T('All Papers', 'அனைத்து தாள்கள்')} ({papers.length})
          </button>
          {exams.map((ex) => (
            <button
              key={ex.slug}
              onClick={() => setSelectedExam(ex.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedExam === ex.slug
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {ex.name_ta}
            </button>
          ))}
        </div>
      </div>

      {/* 2. In-Feed Native Ad */}
      <div className="min-h-[110px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
        <CustomAdBanner slot="in_feed" />
      </div>

      {/* 3. Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPapers.map((paper) => (
          <div
            key={paper.slug}
            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {paper.year} Exam Paper
                </span>
                {paper.is_hot && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                    🔥 High Cut-off
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-snug">
                  {paper.title_ta}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {paper.title_en}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                {paper.exam_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{paper.exam_date}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{paper.total_questions} Questions</span>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <a
                href={paper.official_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Key</span>
              </a>

              <Link
                href={`/tnpsc/pyq/${paper.slug}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>{T('Start Practice', 'பயிற்சி செய்ய')}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
