import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, HelpCircle, ThumbsUp, CheckCircle, Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getQuestionById, getAnswersByQuestion, createAnswer, markAnswerHelpful, updateAnswerCount } from "@/services/questions";
import { formatDistanceToNow } from "date-fns";
import { usePageMeta } from "@/hooks/usePageMeta";
import { sanitizeText, checkRateLimit } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

export default function QuestionDetail() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const qc = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();
  const [answerText, setAnswerText] = useState("");
  const [isAnon, setIsAnon] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (user?.full_name) {
      setAuthorName(user.full_name);
    }
  }, [user]);

  const { data: question } = useQuery({ queryKey: ["question", id], queryFn: () => getQuestionById(id), enabled: !!id });
  const { data: answers = [], isLoading: answersLoading } = useQuery({ queryKey: ["answers", id], queryFn: () => getAnswersByQuestion(id), enabled: !!id });

  usePageMeta({ title: question ? question.title : "Question – TN Voice", description: question?.content });

  const answerMutation = useMutation({
    mutationFn: async (data) => {
      const ans = await createAnswer(data);
      await updateAnswerCount(id, (question?.answer_count || 0) + 1);
      return ans;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["answers", id] });
      qc.invalidateQueries({ queryKey: ["question", id] });
      setAnswerText("");
    },
  });

  const helpfulMutation = useMutation({
    mutationFn: ({ answerId, count }) => markAnswerHelpful(answerId, count),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["answers", id] }),
  });

  const handleAnswer = () => {
    if (!isAuthenticated) {
      requireAuth(() => {}, T("Sign in to post an answer", "பதில் பதிவிட உள்நுழையுங்கள்"));
      return;
    }
    setFormError(null);
    if (!answerText.trim()) return;
    if (!checkRateLimit("post_answer", 5, 5 * 60_000)) { setFormError(T("Answering too fast. Please wait.", "மிக வேகமாக பதில் அளிக்கிறீர்கள்.")); return; }
    answerMutation.mutate({
      question_id: id,
      content: sanitizeText(answerText).substring(0, 2000),
      is_anonymous: isAnon,
      author_name: isAnon ? "" : sanitizeText(authorName),
    });
  };

  if (!question) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
      <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
      <p>{T("Question not found.", "கேள்வி கண்டுபிடிக்கப்படவில்லை.")}</p>
      <Link to="/ask" className="text-purple-600 text-sm hover:underline mt-2 block">← Back to Q&A</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/ask" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {T("Back to Questions", "கேள்விகளுக்கு திரும்பு")}
      </Link>

      {/* Question */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            {question.status === "answered" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <HelpCircle className="w-5 h-5 text-purple-500" />}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{question.title}</h1>
            {question.content && <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{question.content}</p>}
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span>{question.district_name}</span>
              {question.category_name && <span>· {question.category_name}</span>}
              <span>{question.created_date ? formatDistanceToNow(new Date(question.created_date), { addSuffix: true }) : ""}</span>
              <span>{question.is_anonymous ? T("Anonymous", "அநாமதேயர்") : question.author_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <h2 className="font-bold text-slate-900 dark:text-white mb-3">
        {answers.length} {T("Answers", "பதில்கள்")}
      </h2>
      {answersLoading ? (
        <div className="space-y-3">{Array(2).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : answers.map((ans) => (
        <div key={ans.id} className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 mb-3 ${ans.is_accepted ? "border-green-300 dark:border-green-700" : "border-slate-200 dark:border-slate-700"}`}>
          {ans.is_accepted && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold mb-2">
              <CheckCircle className="w-3.5 h-3.5" /> {T("Best Answer", "சிறந்த பதில்")}
            </div>
          )}
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{ans.content}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-slate-400">
              {ans.is_anonymous ? T("Anonymous", "அநாமதேயர்") : ans.author_name} · {ans.created_date ? formatDistanceToNow(new Date(ans.created_date), { addSuffix: true }) : ""}
            </div>
            <button onClick={() => {
                if (!isAuthenticated) {
                  requireAuth(() => {}, T("Sign in to vote", "வாக்களிக்க உள்நுழையுங்கள்"));
                  return;
                }
                helpfulMutation.mutate({ answerId: ans.id, count: ans.helpful_count });
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" /> {T("Helpful", "உதவியாக இருந்தது")} ({ans.helpful_count || 0})
            </button>
          </div>
        </div>
      ))}

      {/* Add Answer */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mt-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm">{T("Write an Answer", "பதில் எழுதவும்")}</h3>
        <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)}
          placeholder={T("Share what you know...", "நீங்கள் தெரிந்தவற்றை பகிரவும்...")}
          rows={4} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
            <input type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)} className="accent-purple-600" />
            {T("Anonymous", "அநாமதேயம்")}
          </label>
          {!isAnon && (
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)}
              placeholder={T("Your name", "உங்கள் பெயர்")}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-slate-50 dark:bg-slate-700 focus:outline-none w-32" />
          )}
          <button onClick={handleAnswer} disabled={!answerText.trim() || answerMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
            {answerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {T("Post Answer", "பதில் பதிவிடு")}
          </button>
        </div>
        {formError && <p className="text-red-500 text-xs mt-2">{formError}</p>}
      </div>
    </div>
  );
}