'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Share2, 
  RotateCcw, 
  BookOpen, 
  ArrowRight, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import TopicSummaryCard from '@/components/tnpsc/TopicSummaryCard';
import CustomAdBanner from '@/components/ads/CustomAdBanner';

export default function TnpscTopicPracticeView({ topic, questions = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === 'ta' ? ta : en);

  const practiceRef = useRef(null);

  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25);
  const [timerActive, setTimerActive] = useState(true);

  const currentQ = questions[currentIndex];

  // Countdown timer for active question
  useEffect(() => {
    if (!timerActive || quizFinished || questions.length === 0 || !currentQ) return;
    if (revealed[currentQ.id]) return;

    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          handleAnswerSelect(currentQ.id, null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, revealed, timerActive, quizFinished, questions, currentQ]);

  const handleAnswerSelect = (qId, optionKey) => {
    if (revealed[qId]) return;

    const q = questions.find((item) => item.id === qId);
    const isCorrect = optionKey === q?.correct_key;

    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionKey }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimerSeconds(25);
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
    setTimerSeconds(25);
    scrollToPractice();
  };

  const scrollToPractice = () => {
    if (practiceRef.current) {
      practiceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🎯 TNPSC ${topic?.title_ta} தலைப்பில் எனது பயிற்சி மதிப்பெண்: ${score}/${questions.length}!\n\nசமச்சீர் கல்வி புத்தகக் குறிப்புகளுடன் நீங்களும் பயிற்சி செய்ய: https://vizhitn.in/tnpsc/topics/${topic?.slug}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 1. Pre-Chapter Authoritative Topic Summary */}
      <TopicSummaryCard 
        topic={topic} 
        questionCount={questions.length} 
        onStartPractice={scrollToPractice} 
      />

      {/* 2. In-Article Native Ad (CLS-safe native container between summary and practice) */}
      <div className="min-h-[120px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-center overflow-hidden">
        <CustomAdBanner slot="in_feed" />
      </div>

      {/* 3. Interactive Practice Section Anchor */}
      <div ref={practiceRef} className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>{T('Interactive Practice Test', 'மாதிரி வினாடி வினா')}</span>
          </h2>

          {!quizFinished && questions.length > 0 && (
            <span className="text-xs font-bold text-slate-500">
              {currentIndex + 1} / {questions.length} {T('Questions', 'வினாக்கள்')}
            </span>
          )}
        </div>

        {/* Question Card / Finished Score View */}
        {quizFinished ? (
          /* Finished Score Card */
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {score >= Math.ceil(questions.length * 0.8)
                  ? T('Outstanding Officer Mindset!', 'அருமையான தயாரிப்பு! வாழ்த்துகள்!')
                  : score >= Math.ceil(questions.length * 0.5)
                  ? T('Good Effort! Revise Samacheer Notes.', 'நல்ல முயற்சி! குறிப்புகளை மீண்டும் படியுங்கள்.')
                  : T('Needs Revision. Re-read the Summary.', 'மீண்டும் சுருக்கக் குறிப்புகளை படித்து பயிற்சி செய்யுங்கள்.')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {topic?.title_ta}
              </p>
            </div>

            {/* Score Pill */}
            <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl">
              <span className="text-4xl font-black text-blue-600">{score}</span>
              <span className="text-2xl font-bold text-slate-400">/</span>
              <span className="text-4xl font-black text-slate-700 dark:text-slate-300">{questions.length}</span>
            </div>

            {/* Actions */}
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
          </div>
        ) : currentQ ? (
          /* Active Question Card */
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header: Number & 25s Timer */}
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

              {/* Countdown Timer */}
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
              <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question_ta}
              </h3>
              {currentQ.question_en && (
                <p className="text-xs sm:text-sm text-slate-500 italic">
                  {currentQ.question_en}
                </p>
              )}
            </div>

            {/* Options */}
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
                      <span className="text-xs sm:text-sm leading-snug">{opt.text}</span>
                    </div>

                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Samacheer Kalvi Box */}
            {revealed[currentQ.id] && (
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                    {T('Explanation & Concept', 'விளக்கம் & விடை ஆதாரம்')}:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {currentQ.explanation_ta}
                  </p>
                </div>

                {currentQ.book_citation && (
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-400">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>{currentQ.book_citation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Next Button */}
            {revealed[currentQ.id] && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>{currentIndex < questions.length - 1 ? T('Next Question 👉', 'அடுத்த வினா 👉') : T('View Final Score 🏆', 'முடிவுகளைப் பார்க்க 🏆')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            {T('No practice questions available for this topic yet.', 'இந்த தலைப்பில் வினாக்கள் விரைவில் சேர்க்கப்படும்.')}
          </div>
        )}
      </div>
    </div>
  );
}

