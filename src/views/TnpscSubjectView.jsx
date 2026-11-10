'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Share2, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  ChevronRight,
  ExternalLink,
  BookCheck,
  Check,
  PlayCircle
} from 'lucide-react';
import { TNPSC_SUBJECTS } from '@/lib/tnpscData';
import CustomAdBanner from '@/components/ads/CustomAdBanner';

export default function TnpscSubjectView({ subject, initialQuestions = [] }) {
  const [viewMode, setViewMode] = useState('study'); // 'study' (full list) or 'quiz' (interactive timer)
  const [questions, setQuestions] = useState(initialQuestions);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [timerActive, setTimerActive] = useState(true);

  // Countdown timer for quiz mode
  React.useEffect(() => {
    if (viewMode !== 'quiz' || !timerActive || quizFinished || questions.length === 0) return;
    const currentQ = questions[currentIndex];
    if (revealed[currentQ?.id]) return;

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
  }, [viewMode, currentIndex, revealed, timerActive, quizFinished, questions]);

  const handleAnswerSelect = (qId, optionKey) => {
    if (revealed[qId]) return;
    const currentQ = questions.find((q) => q.id === qId);
    const isCorrect = optionKey === currentQ?.correct_key;

    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionKey }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));
    if (isCorrect) setScore((prev) => prev + 1);
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
    const text = encodeURIComponent(
      `🎯 TNPSC ${subject.name_ta} (${subject.name_en}) மாதிரி வினாடி வினாவில் எனது மதிப்பெண்: ${score}/${questions.length}!\n\nசமச்சீர் கல்வி புத்தகக் குறிப்புகளுடன் நீங்களும் பயிற்சி செய்ய: https://vizhitn.in/tnpsc/${subject.slug}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6">
      {/* 1. Subject Header Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${subject.color || 'bg-blue-600'} text-white flex items-center justify-center text-3xl shadow-md shrink-0`}>
              {subject.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  TNPSC Group 4 & Group 2 Syllabus
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {questions.length} Verified Questions
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {subject.name_ta} ({subject.name_en})
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                சமச்சீர் கல்வி 6 முதல் 12-ஆம் வகுப்பு வரையிலான பாடப்புத்தகங்கள் மற்றும் முந்தைய ஆண்டு வினாத்தாள் (PYQ) குறிப்புகளுடன் கூடிய மாதிரி வினாக்கள்.
              </p>
            </div>
          </div>

          {/* Mode Switch Button */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => { setViewMode('study'); }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'study'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookCheck className="w-4 h-4" />
              <span>Study Notes</span>
            </button>
            <button
              onClick={() => { setViewMode('quiz'); handleRestartQuiz(); }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'quiz'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Timer Quiz</span>
            </button>
          </div>
        </div>

        {/* Other Subjects Quick Switch */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/tnpsc"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            📚 Daily Speed Quiz
          </Link>
          {TNPSC_SUBJECTS.filter((s) => s.slug !== 'all' && s.slug !== subject.slug).map((s) => (
            <Link
              key={s.slug}
              href={`/tnpsc/${s.slug}`}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shrink-0 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              <span>{s.icon}</span>
              <span>{s.name_ta}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. In-Feed Native Ad */}
      <div className="min-h-[110px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
        <CustomAdBanner slot="in_feed" />
      </div>

      {/* 3. Main Content: Study Notes Mode or Interactive Quiz Mode */}
      {viewMode === 'study' ? (
        /* STUDY & READING MODE (Crawler-Friendly Static HTML) */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Showing {questions.length} Study Questions
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Samacheer Kalvi Verified</span>
            </span>
          </div>

          {questions.map((q, idx) => (
            <article
              key={q.id || idx}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4 transition-all hover:border-blue-300"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shrink-0">
                  Q {idx + 1}
                </span>
                {q.pyq_reference && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    🎯 {q.pyq_reference}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {q.question_ta}
              </h2>
              {q.question_en && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                  {q.question_en}
                </p>
              )}

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options?.map((opt) => {
                  const isCorrect = opt.key === q.correct_key;
                  return (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{opt.text}</span>
                      {isCorrect && (
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-600 text-white shrink-0 ml-2">
                          சரியான விடை
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation & Book Citation */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                {q.book_citation && (
                  <p className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 shrink-0 text-blue-600" />
                    <span><strong>சமச்சீர் குறிப்பு:</strong> {q.book_citation}</span>
                  </p>
                )}
                {q.explanation_ta && (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>விளக்கம்:</strong> {q.explanation_ta}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* INTERACTIVE QUIZ MODE */
        <div className="space-y-6">
          {quizFinished ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {subject.name_ta} பயிற்சி நிறைவுற்றது!
                </h2>
                <p className="text-sm text-slate-500">
                  நீங்கள் {questions.length}-க்கு {score} வினாக்களுக்கு சரியான விடையளித்துள்ளீர்கள்.
                </p>
              </div>

              <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl">
                <span className="text-4xl font-black text-blue-600">{score}</span>
                <span className="text-2xl font-bold text-slate-400">/</span>
                <span className="text-4xl font-black text-slate-700 dark:text-slate-300">{questions.length}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>வாட்ஸ்அப்பில் பகிருங்கள்</span>
                </button>
                <button
                  onClick={handleRestartQuiz}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>மீண்டும் பயிற்சி செய்ய</span>
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
              {/* Header & Timer */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Q {currentIndex + 1} of {questions.length}
                  </span>
                  {currentQ.pyq_reference && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      🎯 {currentQ.pyq_reference}
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  timerSeconds <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timerSeconds}s</span>
                </div>
              </div>

              {/* Question */}
              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question_ta}
                </h2>
                {currentQ.question_en && (
                  <p className="text-xs sm:text-sm text-slate-500 italic">
                    {currentQ.question_en}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options?.map((opt) => {
                  const isRevealed = revealed[currentQ.id];
                  const isSelected = selectedAnswers[currentQ.id] === opt.key;
                  const isCorrect = opt.key === currentQ.correct_key;

                  let btnStyle = 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-500';
                  if (isRevealed) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-red-50 dark:bg-red-950 border-red-500 text-red-900 dark:text-red-100';
                    } else {
                      btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={isRevealed}
                      onClick={() => handleAnswerSelect(currentQ.id, opt.key)}
                      className={`w-full p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt.text}</span>
                      {isRevealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                      {isRevealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Revealed Explanation */}
              {revealed[currentQ.id] && (
                <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 space-y-2 text-xs">
                  {currentQ.book_citation && (
                    <p className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>{currentQ.book_citation}</span>
                    </p>
                  )}
                  {currentQ.explanation_ta && (
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{currentQ.explanation_ta}</p>
                  )}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{currentIndex < questions.length - 1 ? 'அடுத்த வினா →' : 'முடிவுகளைப் பார்க்க'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

