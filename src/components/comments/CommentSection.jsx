import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, Loader2, User, Trash2, EyeOff, RotateCcw, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { sanitizeText, checkRateLimit, detectSpam, getSessionId } from "@/lib/security";
import { checkContentSafety, SAFETY_REMINDER_EN } from "@/lib/contentSafety";
import {
  getCommentsByPost, createComment, hideComment, restoreComment,
  deleteComment, flagCommentReported,
} from "@/services/comments";
import { updateCommentCount as updatePostCommentCount } from "@/services/posts";
import ReportButton from "@/components/posts/ReportButton";
import { createReport } from "@/services/admin/reports";

const MAX_COMMENT = 1000;
const MIN_COMMENT = 2;

export default function CommentSection({ postId, postCommentCount }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState(user?.full_name || "");
  const [isAnon, setIsAnon] = useState(false);
  const [error, setError] = useState(null);
  const [safetyWarn, setSafetyWarn] = useState(null);
  const submitting = useRef(false);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPost(postId),
    enabled: !!postId,
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const c = await createComment(payload);
      await updatePostCommentCount(postId, (postCommentCount || comments.length) + 1);
      return c;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
      setText("");
      setError(null);
      setSafetyWarn(null);
      toast({ description: T("Comment posted!", "கருத்து இடப்பட்டது!") });
    },
    onSettled: () => { submitting.current = false; },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      requireAuth(() => {}, T("Sign in to comment", "கருத்து தெரிவிக்க உள்நுழையுங்கள்"));
      return;
    }
    if (submitting.current) return; // prevent double-submit

    const trimmed = text.trim();
    setError(null);
    setSafetyWarn(null);

    if (!trimmed) { setError(T("Comment cannot be empty.", "கருத்து காலியாக இருக்கக்கூடாது.")); return; }
    if (trimmed.length < MIN_COMMENT) { setError(T("Comment is too short.", "கருத்து மிகவும் குறுகியது.")); return; }
    if (trimmed.length > MAX_COMMENT) { setError(T(`Max ${MAX_COMMENT} characters.`, `அதிகபட்சம் ${MAX_COMMENT} எழுத்துகள்.`)); return; }

    // Duplicate check
    const isDuplicate = comments.some(
      (c) => c.content?.toLowerCase().trim() === trimmed.toLowerCase() && c.author_id === user?.id
    );
    if (isDuplicate) { setError(T("You already posted this comment.", "நீங்கள் ஏற்கனவே இந்த கருத்தை இட்டீர்கள்.")); return; }

    // Spam
    if (detectSpam(trimmed)) { setError(T("Your comment was flagged as spam. Please revise.", "உங்கள் கருத்து ஸ்பாம் என கண்டறியப்பட்டது.")); return; }

    // Rate limit: 5 comments / 2 min
    if (!checkRateLimit(`comment_${postId}`, 5, 120_000)) {
      setError(T("Please wait before posting again.", "மீண்டும் இடுவதற்கு முன் காத்திருக்கவும்."));
      return;
    }

    // Content safety
    const safety = checkContentSafety(trimmed);
    if (!safety.safe) {
      setError(T("Your message contains content that violates guidelines.", "உங்கள் செய்தி வழிகாட்டுதல்களை மீறும் உள்ளடக்கத்தை கொண்டுள்ளது."));
      return;
    }

    // Soft safety warnings → flag for review
    const needsReview = safety.needsReview;
    if (needsReview) {
      setSafetyWarn(T(
        "Your comment was submitted and may be reviewed for safety.",
        "உங்கள் கருத்து சமர்ப்பிக்கப்பட்டது, பாதுகாப்பு மதிப்பாய்வுக்கு உட்படலாம்."
      ));
    }

    submitting.current = true;
    mutation.mutate({
      post_id: postId,
      content: sanitizeText(trimmed).substring(0, MAX_COMMENT),
      author_name: isAnon ? "" : sanitizeText(authorName || user?.full_name || ""),
      author_id: user?.id || getSessionId(),
      is_anonymous: isAnon,
      // is_pending_review is NOT a column in the comment table — omit to avoid 400
    });
  };

  const isAdmin = user?.role === "admin";

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        {T("Community Discussion", "சமுதாய விவாதம்")}
        <span className="text-sm font-normal text-slate-400">({comments.filter(c => c.status === "active" || c.status === "flagged").length})</span>
      </h2>

      {/* Input area */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4">
        {!isAuthenticated ? (
          <button
            onClick={() => requireAuth(() => {}, T("Sign in to comment", "கருத்து தெரிவிக்க உள்நுழையுங்கள்"))}
            className="w-full py-3 text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 transition-colors"
          >
            {T("Sign in to join the discussion", "விவாதத்தில் சேர உள்நுழையுங்கள்")}
          </button>
        ) : (
          <>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={T("Share your thoughts...", "உங்கள் கருத்தை பகிரவும்...")}
              className="min-h-[90px] bg-transparent border-0 resize-none focus:ring-0 p-0 text-sm"
              maxLength={MAX_COMMENT}
            />
            <p className="text-xs text-slate-400 mt-1">{SAFETY_REMINDER_EN}</p>

            {error && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>
            )}
            {safetyWarn && (
              <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> {safetyWarn}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                  <input type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)} className="accent-blue-600" />
                  {T("Anonymous", "அநாமதேயம்")}
                </label>
                {!isAnon && (
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={T("Your name", "உங்கள் பெயர்")}
                    className="h-8 text-xs w-32 bg-slate-50 dark:bg-slate-700"
                    maxLength={80}
                  />
                )}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!text.trim() || mutation.isPending}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {T("Post", "இடு")}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 animate-pulse">
              <div className="flex gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{T("No comments yet. Start the discussion!", "இன்னும் கருத்துகள் இல்லை.")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              lang={lang}
              onHide={(reason) => hideComment(c.id, user?.id, reason).then(() => qc.invalidateQueries({ queryKey: ["comments", postId] }))}
              onRestore={() => restoreComment(c.id).then(() => qc.invalidateQueries({ queryKey: ["comments", postId] }))}
              onDelete={() => deleteComment(c.id).then(() => qc.invalidateQueries({ queryKey: ["comments", postId] }))}
              onReport={() => {
                createReport({ target_type: "comment", target_id: c.id, reason: "other", reporter_session: getSessionId() });
                flagCommentReported(c.id, c.report_count);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CommentItem({ comment, currentUserId, isAdmin, lang, onHide, onRestore, onDelete, onReport }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [hideReason, setHideReason] = useState("");
  const isHidden = comment.status === "hidden" || comment.status === "removed";

  // Don't render removed or hidden comments publicly at all
  if (!isAdmin && (comment.status === "removed" || comment.status === "hidden")) return null;

  return (
    <div className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 ${
      isHidden ? "border-red-200 dark:border-red-900 opacity-60" :
      comment.status === "flagged" ? "border-amber-200 dark:border-amber-900" :
      "border-slate-200 dark:border-slate-700"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {comment.is_anonymous ? T("Anonymous", "அநாமதேயர்") : comment.author_name || T("Community Member", "சமுதாய உறுப்பினர்")}
        </span>
        {comment.status === "flagged" && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Under review</span>}
        {isHidden && isAdmin && <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Hidden</span>}
        <span className="text-xs text-slate-400 ml-auto">
          {comment.created_date ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true }) : ""}
        </span>
      </div>

      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
        {comment.content}
      </p>

      <div className="flex items-center gap-3 mt-2">
        {/* Report button — anyone logged in */}
        <ReportButton targetType="comment" targetId={comment.id} compact />

        {/* Admin controls */}
        {isAdmin && (
          <div className="ml-auto flex items-center gap-2">
            {comment.status !== "hidden" && comment.status !== "removed" ? (
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <EyeOff className="w-3 h-3" /> Hide
              </button>
            ) : (
              <button
                onClick={() => { onRestore(); setShowAdminMenu(false); }}
                className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Restore
              </button>
            )}
            <button
              onClick={() => { if (window.confirm("Permanently delete?")) onDelete(); }}
              className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Hide reason input */}
      {isAdmin && showAdminMenu && (
        <div className="mt-2 flex gap-2 items-center">
          <input
            value={hideReason}
            onChange={(e) => setHideReason(e.target.value)}
            placeholder="Reason (optional)"
            className="flex-1 text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          />
          <button
            onClick={() => { onHide(hideReason); setShowAdminMenu(false); }}
            className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Confirm Hide
          </button>
        </div>
      )}
    </div>
  );
}