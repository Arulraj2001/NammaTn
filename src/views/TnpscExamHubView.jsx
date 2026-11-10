'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Download, 
  Sparkles, 
  FileText,
  ChevronRight,
  Target,
  Layers
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import CustomAdBanner from '@/components/ads/CustomAdBanner';

export default function TnpscExamHubView({ exam, subjects = [], pyqPapers = [], topics = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === 'ta' ? ta : en);

  if (!exam) return null;

  return (
    <div className="space-y-6">
      {/* 1. Exam Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {exam.badge || 'Official Syllabus'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            {exam.total_marks} Marks ({exam.duration_hours} Hours)
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {exam.name_ta}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {exam.name_en}
          </p>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          {exam.description_ta}
        </p>

        {/* Target Posts Badge List */}
        {exam.target_posts && exam.target_posts.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {T('Target Official Posts', 'தேர்வின் முக்கிய பணியிடங்கள்')}:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {exam.target_posts.map((post) => (
                <span
                  key={post}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  ✓ {post}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. In-Feed Native Ad */}
      <div className="min-h-[110px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
        <CustomAdBanner slot="in_feed" />
      </div>

      {/* 3. Syllabus Subjects Cluster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>{T('Syllabus Subjects & Practice Sets', 'பாடத்திட்டம் & தலைப்புகள்')}</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {subjects.length} {T('Subjects', 'பாடங்கள்')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => (
            <div
              key={sub.slug}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${sub.color} text-white flex items-center justify-center text-lg shadow-sm`}>
                    {sub.icon}
                  </div>
                  {sub.syllabus_weightage_marks && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {sub.syllabus_weightage_marks} Marks
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {sub.name_ta}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {sub.name_en}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Samacheer Std 6-12</span>
                <Link
                  href={`/tnpsc/topics/vallinam-migum-idangal`}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                >
                  <span>{T('Explore Topics', 'தலைப்புகளைப் படிக்க')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Solved PYQ Papers for this Exam */}
      {pyqPapers.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>{T('Solved Previous Year Papers', 'முந்தைய ஆண்டு வினாத்தாள்கள்')}</span>
            </h2>
            <Link href="/tnpsc/pyq" className="text-xs font-bold text-blue-600 hover:underline">
              {T('View all', 'அனைத்தும்')} 👉
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pyqPapers.map((paper) => (
              <div
                key={paper.slug}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-blue-400 transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-blue-600">{paper.year} Paper</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {paper.title_ta}
                  </h4>
                </div>
                <Link
                  href="/tnpsc/pyq"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  {T('Practice', 'பயிற்சி')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

