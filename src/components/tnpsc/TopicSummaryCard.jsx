'use client';

import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Clock, 
  ArrowDownCircle, 
  Layers,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function TopicSummaryCard({ topic, questionCount = 0, onStartPractice }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === 'ta' ? ta : en);

  if (!topic) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* 1. Header Badging & Topic Title */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Layers className="w-3.5 h-3.5" />
            <span>{T('Topic Summary', 'முக்கிய தேர்வு குறிப்புகள்')}</span>
          </span>

          {topic.pyq_frequency_count > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{topic.pyq_frequency_count} {T('Times Asked in PYQ', 'முறை கேட்கப்பட்ட பகுதி')}</span>
            </span>
          )}

          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
            {topic.difficulty_level || 'Medium'}
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
          {topic.title_ta}
        </h1>
        {topic.title_en && (
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            {topic.title_en}
          </p>
        )}
      </div>

      {/* 2. Samacheer Textbook Citation Box */}
      {topic.samacheer_book_ref && (
        <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
          <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">
              {T('Verified Samacheer Kalvi Textbook Reference', 'அரசு சமச்சீர் பாடப்புத்தக ஆதாரம்')}
            </span>
            <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
              {topic.samacheer_book_ref}
            </p>
          </div>
        </div>
      )}

      {/* 3. Core Editorial Overview Summary */}
      <div className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
          {T('Conceptual Overview', 'கருத்து விளக்கம்')}
        </h2>
        <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {topic.summary_overview_ta}
        </div>
      </div>

      {/* 4. High-Yield Bullet Points (Key Facts to Memorize) */}
      {topic.key_facts_bullet_points && topic.key_facts_bullet_points.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{T('High-Yield Memory Points for Exam', 'தேர்வுக்கு நினைவில் கொள்ள வேண்டிய முக்கிய குறிப்புகள்')}</span>
          </h2>
          <div className="grid grid-cols-1 gap-2.5">
            {topic.key_facts_bullet_points.map((pt, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 rounded-xl shadow-2xs hover:border-blue-400 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {pt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Start Practice Jump Banner */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs text-slate-500">
          <span>{T('Ready to test your retention?', 'இந்த தலைப்பில் உங்கள் நினைவாற்றலை சோதிக்க தயாரா?')}</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 ml-1">
            {questionCount} {T('MCQ Questions', 'வினாக்கள் உள்ளன')}
          </span>
        </div>

        {onStartPractice && (
          <button
            onClick={onStartPractice}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>{T('Start Topic Practice Test', 'பயிற்சியைத் தொடங்க')}</span>
          </button>
        )}
      </div>
    </div>
  );
}

