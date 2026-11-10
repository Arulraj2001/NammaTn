'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@/lib/router-compat';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Share2, 
  RotateCcw, 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Check, 
  ExternalLink,
  ChevronRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TNPSC_SUBJECTS, fetchTnpscQuestions, fetchDailyChallengeQuestions } from '@/services/tnpscService';
import AdSlot from '@/components/ads/AdSlot';
import CustomAdBanner from '@/components/ads/CustomAdBanner';

export default function TnpscPractice() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === 'ta' ? ta : en);

  const [activeSubject, setActiveSubject] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qId]: 'A' }
  const [revealed, setRevealed] = useState({}); // { [qId]: true }
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [timerActive, setTimerActive] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load questions
  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = activeSubject === 'all' 
        ? await fetchDailyChallengeQuestions() 
        : await fetchTnpscQuestions(activeSubject);
      setQuestions(data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setRevealed({});
      setScore(0);
      setQuizFinished(false);
      setTimerSeconds(20);
      setLoading(false);
    }
    load();
  }, [activeSubject]);

  // Countdown timer for active question
  useEffect(() => {
    if (!timerActive || quizFinished || loading || questions.length === 0) return;
    const currentQ = questions[currentIndex];
    if (revealed[currentQ?.id]) return; // Stop timer if already answered

    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          // Time expired — auto reveal correct answer without score
          handleAnswerSelect(currentQ.id, null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, revealed, timerActive, quizFinished, loading, questions]);

  const handleAnswerSelect = (qId, optionKey) => {
    if (revealed[qId]) return; // Already revealed

    const currentQ = questions.find((q) => q.id === qId);
    const isCorrect = optionKey === currentQ?.correct_key;

    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionKey }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimerSeconds(20);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealed({});
    setScore(0);
    setQuizFinished(false);
    setTimerSeconds(20);
  };

  const handleWhatsAppShare = () => {
    const total = questions.length;
    const text = `🎯 VizhiTN TNPSC Daily 1-Mark Challenge-ல் எனது மதிப்பெண்: ${score}/${total}! 🏆\n\nசமச்சீர் புத்தகக் குறிப்புகள் மற்றும் மாதிரி வினாக்களுடன் இப்போதே பயிற்சி செய்யுங்கள்:\n🔗 https://vizhitn.in/tnpsc`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6">
      {/* 1. Daily Challenge Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <GraduationCap className="w-4 h-4" />
            <span>TNPSC Group 4, Group 2 & Police SI 2026</span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Daily 5-Mark Speed Challenge
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {T('TNPSC Daily One-Mark & PYQ Practice Engine', 'TNPSC தினசரி மாதிரி வினாடி-வினா & முந்தைய தேர்வு வினாக்கள்')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {T(
              '100% verified Samacheer Kalvi textbook citations, PYQ references, and instant timer challenges directly matching our Shorts & Reels.',
              'சமச்சீர் பாடப்புத்தக ஆதாரங்கள் மற்றும் முந்தைய ஆண்டு தேர்வு வினாக்களுடன் கூடிய தினசரி நேரடி பயிற்சிப் தளம்.'
            )}
          </p>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800">
          {TNPSC_SUBJECTS.map((sub) => (
            <button
              key={sub.slug}
              onClick={() => setActiveSubject(sub.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeSubject === sub.slug
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <span>{sub.icon}</span>
              <span>{T(sub.name_en, sub.name_ta)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. In-Feed Native Ad */}
      <div className="min-h-[110px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
        <CustomAdBanner slot="in_feed" />
      </div>

      {/* 3. Interactive Quiz Engine */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {T('Loading Samacheer Kalvi Questions...', 'சமச்சீர் மாதிரி வினாக்கள் தயாராகின்றன...')}
          </p>
        </div>
      ) : quizFinished ? (
        /* Quiz Completion Card */
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-600 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {T('Challenge Completed!', 'பயிற்சி நிறைவுற்றது!')}
            </h2>
            <p className="text-sm text-slate-500">
              {score === questions.length 
                ? T('Outstanding! 100% Accuracy in Samacheer Notes.', 'அற்புதம்! 100% சரியான விடைகள்.')
                : T(`You scored ${score} out of ${questions.length} questions correctly.`, `நீங்கள் ${questions.length}-க்கு ${score} வினாக்களுக்கு சரியான விடையளித்துள்ளீர்கள்.`)}
            </p>
          </div>

          {/* Big Score Display */}
          <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl">
            <span className="text-4xl font-black text-blue-600">{score}</span>
            <span className="text-2xl font-bold text-slate-400">/</span>
            <span className="text-4xl font-black text-slate-700 dark:text-slate-300">{questions.length}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{T('Share Score on WhatsApp', 'வாட்ஸ்அப்பில் பகிருங்கள்')}</span>
            </button>
            <button
              onClick={handleRestartQuiz}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{T('Practice Again', 'மீண்டும் பயிற்சி செய்ய')}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <p>💡 {T('New One-Mark questions added daily at 7:00 AM and 5:30 PM.', 'தினசரி காலை 7:00 மணி மற்றும் மாலை 5:30 மணிக்கு புதிய வினாக்கள் பதிவேற்றப்படும்.')}</p>
          </div>
        </div>
      ) : currentQ ? (
        /* Active Question Card */
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          {/* Question Header & Timer */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Q {currentIndex + 1} of {questions.length}
              </span>
              {currentQ.pyq_reference && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  🎯 {currentQ.pyq_reference}
                </span>
              )}
            </div>

            {/* 20s Countdown Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              timerSeconds <= 5 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{timerSeconds}s</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question_ta}
            </h2>
            {currentQ.question_en && (
              <p className="text-xs sm:text-sm text-slate-500 italic">
                {currentQ.question_en}
              </p>
            )}
          </div>

          {/* 4 Interactive Options */}
          <div className="grid grid-cols-1 gap-2.5 pt-2">
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.key;
              const isCorrect = opt.key === currentQ.correct_key;
              const isAnswered = revealed[currentQ.id];

              let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400 hover:bg-blue-50/40';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-400 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-200 line-through opacity-80';
                } else {
                  btnStyle = 'opacity-40 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
                }
              }

              return (
                <button
                  key={opt.key}
                  onClick={() => handleAnswerSelect(currentQ.id, opt.key)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAnswered && isCorrect 
                        ? 'bg-emerald-600 text-white' 
                        : isAnswered && isSelected && !isCorrect
                        ? 'bg-red-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                    }`}>
                      {opt.key}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold">{opt.text}</span>
                  </div>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Samacheer Kalvi Textbook Citation Box (Appears when Answered) */}
          {revealed[currentQ.id] && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/50 border-2 border-blue-200 dark:border-blue-900/60 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-extrabold text-xs">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>{T('Samacheer Kalvi Textbook Citation & Notes', 'சமச்சீர் பாடப்புத்தக ஆதாரம் & விரிவான விளக்கம்')}</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  ✓ {T('Correct Answer:', 'சரியான விடை:')} {currentQ.correct_key} - {currentQ.options.find((o) => o.key === currentQ.correct_key)?.text}
                </p>
                <p>
                  <strong>{T('Textbook Reference:', 'பாடப்புத்தக ஆதாரம்:')}</strong> {currentQ.book_citation}
                </p>
                <p>
                  <strong>{T('Explanation:', 'விளக்கம்:')}</strong> {currentQ.explanation_ta}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentIndex < questions.length - 1 ? T('Next Question →', 'அடுத்த வினா →') : T('View Final Score →', 'முடிவுகளைப் பார்க்க →')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* 4. Social Proof: YouTube & Instagram Connection Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-extrabold text-sm sm:text-base">
            {T('Watch 5-Second Video Explanations on Shorts & Reels', '5-வினாடி வீடியோ விளக்கங்களை காணுங்கள்')}
          </p>
          <p className="text-xs text-rose-100">
            {T('Daily Tamil One-Mark questions with memory tricks on YouTube and Instagram.', 'தினமும் முக்கியமான 1-மதிப்பெண் வினாக்கள் யூடியூப் மற்றும் இன்ஸ்டாகிராமில்.')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://youtube.com/@VizhiTn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white text-red-600 hover:bg-slate-100 font-extrabold text-xs rounded-lg transition-colors flex items-center gap-1"
          >
            <span>YouTube 🔔</span>
          </a>
          <a
            href="https://instagram.com/vizhi_tn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-rose-950 text-white hover:bg-rose-900 font-extrabold text-xs rounded-lg transition-colors flex items-center gap-1"
          >
            <span>Instagram 👉</span>
          </a>
        </div>
      </div>
    </div>
  );
}

