import React, { useState, useEffect } from "react";
import {
  CheckCircle, Copy, AlertTriangle, FileText, Camera,
  Share2, Loader2, LogIn, MessageSquareText
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { makeTimelineEvent, getCivicStatus, computeNextStatus } from "@/lib/civicReceipt";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import MediaUploader from "@/components/media/MediaUploader";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { getSessionId } from "@/lib/security";
import { useUserActions } from "@/hooks/useUserActions";

/**
 * Checks if the current actor already has a CivicAction record for this post+action.
 * Falls back to local dedup if network unavailable.
 */
async function checkExistingAction(postId, actionType, actorId) {
  try {
    const existing = await base44.entities.CivicAction.filter({
      post_id: postId,
      action_type: actionType,
      actor_id: actorId,
    }, "-created_date", 1);
    return existing.length > 0;
  } catch {
    return false;
  }
}

async function recordAction(postId, actionType, actorId, isAuthenticated, metadata = {}) {
  await base44.entities.CivicAction.create({
    post_id: postId,
    action_type: actionType,
    actor_id: actorId,
    is_authenticated: isAuthenticated,
    metadata,
  });
}

export default function CivicReceiptActions({ post, onRefresh }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();
  const actions = useUserActions();
  const target = actions.forTarget(post.id);

  const actorId = user?.id || getSessionId();

  const [showComplaintInput, setShowComplaintInput] = useState(false);
  const [complaintId, setComplaintId] = useState(post.official_complaint_id || "");
  const [showFixedUpload, setShowFixedUpload] = useState(false);
  const [fixedPhotos, setFixedPhotos] = useState([]);
  const [showFollowUpInput, setShowFollowUpInput] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");
  const [loading, setLoading] = useState(null);

  // Track which actions this actor has already done
  const [done, setDone] = useState({
    verify: target.hasDone("verify"),
    duplicate: target.hasDone("duplicate"),
    still_not_fixed: target.hasDone("still_not_fixed"),
    citizen_verified_fixed: target.hasDone("citizen_verified_fixed"),
    claim_fixed: target.hasDone("claim_fixed"),
    follow_up: target.hasDone("follow_up"),
  });

  // Hydrate from DB on mount (in case localStorage was cleared)
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const actionTypes = ["verify", "duplicate", "still_not_fixed", "citizen_verified_fixed", "claim_fixed", "follow_up"];
      const results = await Promise.all(
        actionTypes.map((a) => checkExistingAction(post.id, a, actorId))
      );
      if (cancelled) return;
      const newDone = {};
      actionTypes.forEach((a, i) => {
        newDone[a] = results[i];
        if (results[i]) target.markDone(a);
      });
      setDone(newDone);
    };
    hydrate();
    return () => { cancelled = true; };
  }, [post.id, actorId]);

  const doUpdate = async (data, eventText, event_type = "status_change") => {
    const currentTimeline = Array.isArray(post.timeline_events) ? post.timeline_events : [];
    // Avoid duplicate timeline events: skip if same event text in last 60 seconds
    const lastEvent = currentTimeline[currentTimeline.length - 1];
    const recentDupe = lastEvent && lastEvent.event === eventText &&
      Math.abs(Date.now() - new Date(lastEvent.timestamp).getTime()) < 60_000;
    const newTimeline = recentDupe ? currentTimeline : [
      ...currentTimeline,
      makeTimelineEvent(eventText, actorId === user?.id ? (user?.full_name || "Citizen") : "Community Member", event_type, "user"),
    ];
    await base44.entities.Post.update(post.id, { ...data, timeline_events: newTimeline });
    qc.invalidateQueries({ queryKey: ["post", post.id] });
    onRefresh?.();
    toast({ description: eventText });
  };

  const withAuthGuard = (fn, reason) => {
    if (!isAuthenticated) {
      requireAuth(fn, reason);
      return;
    }
    fn();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  const handleVerify = () => withAuthGuard(async () => {
    if (done.verify) {
      toast({ description: T("You already confirmed this issue.", "நீங்கள் ஏற்கனவே இந்த சிக்கலை உறுதிப்படுத்தினீர்கள்.") });
      return;
    }
    
    const proceedVerification = async () => {
      // Double-check against DB
      const already = await checkExistingAction(post.id, "verify", actorId);
      if (already) {
        target.markDone("verify");
        setDone((d) => ({ ...d, verify: true }));
        toast({ description: T("You already confirmed this issue.", "நீங்கள் ஏற்கனவே இந்த சிக்கலை உறுதிப்படுத்தினீர்கள்.") });
        return;
      }
      await recordAction(post.id, "verify", actorId, isAuthenticated);
      target.markDone("verify");
      setDone((d) => ({ ...d, verify: true }));
      const count = (post.verification_count || 0) + 1;
      const postWithNewCount = { ...post, verification_count: count };
      const newStatus = computeNextStatus(postWithNewCount, "verify");
      const eventText = count >= 3
        ? T("Issue community verified!", "சமுதாயம் சரிபார்த்தது!")
        : T("Citizen confirmed this issue", "குடிமகன் இந்த சிக்கலை உறுதிப்படுத்தினார்");
      await doUpdate(
        { verification_count: count, civic_status: newStatus },
        eventText,
        "verify"
      );
    };

    if (post.latitude && post.longitude) {
      setLoading("verify");
      if (!navigator.geolocation) {
        setLoading(null);
        toast({
          title: T("GPS Unavailable", "GPS கிடைக்கவில்லை"),
          description: T("Browser does not support geolocation.", "உலாவி இருப்பிடத்தை ஆதரிக்கவில்லை."),
          variant: "destructive"
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const dist = calculateDistance(
            post.latitude, post.longitude,
            position.coords.latitude, position.coords.longitude
          );

          if (dist > 300) {
            setLoading(null);
            toast({
              title: T("Verification Out of Range", "வரம்பிற்கு வெளியே சரிபார்ப்பு"),
              description: T(
                `You must be within 300m of the issue to verify. Current distance: ${Math.round(dist)}m`,
                `சரிபார்க்க நீங்கள் 300மீ தூரத்திற்குள் இருக்க வேண்டும். தற்போதைய தூரம்: ${Math.round(dist)}மீ`
              ),
              variant: "destructive"
            });
            return;
          }

          await proceedVerification();
          setLoading(null);
        },
        () => {
          setLoading(null);
          toast({
            title: T("Location Access Denied", "இருப்பிட அனுமதி மறுக்கப்பட்டது"),
            description: T(
              "Please enable location access to verify this receipt.",
              "இந்த ரசீதை உறுதிப்படுத்த இருப்பிட அனுமதியை வழங்கவும்."
            ),
            variant: "destructive"
          });
        }
      );
    } else {
      setLoading("verify");
      await proceedVerification();
      setLoading(null);
    }
  }, T("Sign in to confirm this issue", "இந்த சிக்கலை உறுதிப்படுத்த உள்நுழையுங்கள்"));


  const handleDuplicate = () => withAuthGuard(async () => {
    if (done.duplicate) {
      toast({ description: T("You already marked this as a duplicate.", "நீங்கள் ஏற்கனவே இதை நகல் என குறித்தீர்கள்.") });
      return;
    }
    const already = await checkExistingAction(post.id, "duplicate", actorId);
    if (already) {
      target.markDone("duplicate");
      setDone((d) => ({ ...d, duplicate: true }));
      toast({ description: T("You already marked this as a duplicate.", "நீங்கள் ஏற்கனவே இதை நகல் என குறித்தீர்கள்.") });
      return;
    }
    setLoading("dup");
    await recordAction(post.id, "duplicate", actorId, isAuthenticated);
    target.markDone("duplicate");
    setDone((d) => ({ ...d, duplicate: true }));
    const count = (post.duplicate_count || 0) + 1;
    await doUpdate(
      { duplicate_count: count },
      T("Marked as possible duplicate", "நகல் என குறிக்கப்பட்டது")
    );
    setLoading(null);
  }, T("Sign in to report duplicate", "நகல் புகாரளிக்க உள்நுழையுங்கள்"));

  const handleStillNotFixed = () => withAuthGuard(async () => {
    if (done.still_not_fixed) {
      toast({ description: T("You already reported this as still not fixed.", "நீங்கள் ஏற்கனவே இதை சரி செய்யப்படவில்லை என புகாரளித்தீர்கள்.") });
      return;
    }
    const already = await checkExistingAction(post.id, "still_not_fixed", actorId);
    if (already) {
      target.markDone("still_not_fixed");
      setDone((d) => ({ ...d, still_not_fixed: true }));
      toast({ description: T("You already reported this.", "நீங்கள் ஏற்கனவே புகாரளித்தீர்கள்.") });
      return;
    }
    setLoading("notfixed");
    await recordAction(post.id, "still_not_fixed", actorId, isAuthenticated);
    target.markDone("still_not_fixed");
    setDone((d) => ({ ...d, still_not_fixed: true }));
    const count = (post.still_not_fixed_count || 0) + 1;
    const newStatus = computeNextStatus({ ...post, still_not_fixed_count: count }, "still_not_fixed");
    await doUpdate(
      { still_not_fixed_count: count, civic_status: newStatus },
      T("Reported as still not fixed", "இன்னும் சரி செய்யப்படவில்லை என புகாரளிக்கப்பட்டது"),
      "still_not_fixed"
    );
    setLoading(null);
  }, T("Sign in to report status", "நிலையை புகாரளிக்க உள்நுழையுங்கள்"));

  const handleAddComplaint = () => withAuthGuard(async () => {
    if (!complaintId.trim()) return;
    setLoading("complaint");
    // Only advance to complaint_filed if not already at a higher status
    const currentStatus = post.civic_status || "reported";
    const advancedStatuses = ["complaint_filed", "under_followup", "claimed_fixed", "citizen_verified_fixed", "unresolved_escalated", "community_solved"];
    const newStatus = advancedStatuses.includes(currentStatus) ? currentStatus : "complaint_filed";
    await doUpdate(
      { official_complaint_id: complaintId.trim(), civic_status: newStatus },
      T(`Official complaint filed: ${complaintId.trim()}`, `அதிகாரப்பூர்வ புகார் தாக்கல்: ${complaintId.trim()}`)
    );
    setShowComplaintInput(false);
    setLoading(null);
  }, T("Sign in to add complaint ID", "புகார் ID சேர்க்க உள்நுழையுங்கள்"));

  const handleClaimFixed = () => withAuthGuard(async () => {
    if (!fixedPhotos.length) {
      toast({ description: T("Please upload at least one proof photo.", "குறைந்தது ஒரு ஆதார புகைப்படத்தை பதிவேற்றவும்.") });
      return;
    }
    if (done.claim_fixed) {
      toast({ description: T("You already claimed this fixed.", "நீங்கள் ஏற்கனவே சரி செய்யப்பட்டதாக கூறியுள்ளீர்கள்.") });
      return;
    }
    const already = await checkExistingAction(post.id, "claim_fixed", actorId);
    if (already) {
      target.markDone("claim_fixed");
      setDone((d) => ({ ...d, claim_fixed: true }));
      toast({ description: T("You already submitted a claim.", "நீங்கள் ஏற்கனவே கோரிக்கை சமர்ப்பித்தீர்கள்.") });
      return;
    }
    setLoading("fixed");
    await recordAction(post.id, "claim_fixed", actorId, isAuthenticated, { photos: fixedPhotos });
    target.markDone("claim_fixed");
    setDone((d) => ({ ...d, claim_fixed: true }));
    await doUpdate(
      { claimed_fixed_photos: fixedPhotos, civic_status: "claimed_fixed" },
      T("Claimed fixed with photo proof — awaiting community verification", "புகைப்பட ஆதாரத்துடன் சரி செய்யப்பட்டதாக கூறப்படுகிறது — சமுதாய சரிபார்ப்பு காத்திருக்கிறது"),
      "claim_fixed"
    );
    setShowFixedUpload(false);
    setLoading(null);
  }, T("Sign in to claim fixed", "சரி செய்யப்பட்டதாக கூற உள்நுழையுங்கள்"));

  const handleCitizenVerifiedFixed = () => withAuthGuard(async () => {
    if (done.citizen_verified_fixed) {
      toast({ description: T("You already verified this as fixed.", "நீங்கள் ஏற்கனவே இதை சரி செய்யப்பட்டதாக சரிபார்த்தீர்கள்.") });
      return;
    }
    const already = await checkExistingAction(post.id, "citizen_verified_fixed", actorId);
    if (already) {
      target.markDone("citizen_verified_fixed");
      setDone((d) => ({ ...d, citizen_verified_fixed: true }));
      toast({ description: T("You already verified this.", "நீங்கள் ஏற்கனவே சரிபார்த்தீர்கள்.") });
      return;
    }
    setLoading("cvfixed");
    await recordAction(post.id, "citizen_verified_fixed", actorId, isAuthenticated);
    target.markDone("citizen_verified_fixed");
    setDone((d) => ({ ...d, citizen_verified_fixed: true }));
    const count = (post.citizen_fixed_count || 0) + 1;
    const postWithNewCount = { ...post, citizen_fixed_count: count };
    const newStatus = computeNextStatus(postWithNewCount, "citizen_verified_fixed");
    await doUpdate(
      { citizen_fixed_count: count, civic_status: newStatus },
      T("Citizen verified this issue as fixed", "குடிமகன் இந்த சிக்கல் சரி செய்யப்பட்டதை சரிபார்த்தார்"),
      "citizen_verified_fixed"
    );
    setLoading(null);
  }, T("Sign in to verify fixed", "சரி செய்யப்பட்டதை சரிபார்க்க உள்நுழையுங்கள்"));

  const handleFollowUp = () => withAuthGuard(async () => {
    if (!followUpNote.trim()) return;
    setLoading("followup");
    await recordAction(post.id, "follow_up", actorId, isAuthenticated, { note: followUpNote.trim() });
    target.markDone("follow_up");
    setDone((d) => ({ ...d, follow_up: true }));
    const truncated = followUpNote.trim().length > 80
      ? followUpNote.trim().slice(0, 80) + "…"
      : followUpNote.trim();
    const newStatus = post.civic_status === "under_followup" ? post.civic_status : "under_followup";
    const newCount = (post.follow_up_count || 0) + 1;
    await doUpdate(
      { civic_status: newStatus, follow_up_count: newCount },
      T(`Follow-up note added: ${truncated}`, `பின்தொடர் குறிப்பு சேர்க்கப்பட்டது: ${truncated}`),
      "follow_up"
    );
    setFollowUpNote("");
    setShowFollowUpInput(false);
    setLoading(null);
  }, T("Sign in to add follow-up note", "பின்தொடர் குறிப்பு சேர்க்க உள்நுழையுங்கள்"));

  const handleShare = () => {
    const url = window.location.href;
    const text = `🔴 NammaTN Civic Receipt\n${post.civic_receipt_id || ""}: ${post.title_en}\nStatus: ${getCivicStatus(post.civic_status)?.label}\n${url}`;
    if (navigator.share) {
      navigator.share({ title: post.title_en, text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({ description: T("Link copied!", "இணைப்பு நகலெடுக்கப்பட்டது!") });
    }
  };

  const isLocker = (action) => loading === action;

  const ActionBtn = ({ onClick, icon: Icon, label, doneLabel, isDone, loadKey, color = "slate" }) => {
    const colorMap = {
      blue: "border-blue-200 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100",
      green: "border-green-200 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100",
      red: "border-red-200 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100",
      orange: "border-orange-200 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100",
      slate: "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50",
      done: "border-slate-300 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-default opacity-75",
    };
    const cls = isDone ? colorMap.done : (colorMap[color] || colorMap.slate);
    return (
      <button
        onClick={isDone ? undefined : onClick}
        disabled={isLocker(loadKey)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 ${cls}`}
      >
        {isLocker(loadKey) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        <span>{isDone ? doneLabel : label}</span>
        {isDone && <span className="text-xs">✓</span>}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {T("Community Actions", "சமுதாய நடவடிக்கைகள்")}
      </p>

      {!isAuthenticated && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2">
          <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
          {T("Sign in to take community actions on this receipt.", "இந்த ரசீதில் சமுதாய நடவடிக்கைகள் எடுக்க உள்நுழையுங்கள்.")}
        </div>
      )}

      {/* Verification Progress Bar */}
      {["reported", "community_verified", "complaint_needed"].includes(post.civic_status) && (() => {
        const count = post.verification_count || 0;
        const pct = Math.min((count / 5) * 100, 100);
        const barColor = count >= 5 ? "bg-green-500" : count >= 3 ? "bg-blue-500" : "bg-amber-500";
        const label = count >= 5
          ? T("✓ Verified", "✓ சரிபார்க்கப்பட்டது")
          : count >= 3
            ? T(`${count}/5 — ${5 - count} needed for Official Complaint`, `${count}/5 — அதிகாரப்பூர்வ புகாருக்கு ${5 - count} தேவை`)
            : T(`${count}/5 — ${3 - count} needed for Community Verified`, `${count}/5 — சமுதாய சரிபார்ப்புக்கு ${3 - count} தேவை`);
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium">{T("Community Verification", "சமுதாய சரிபார்ப்பு")}</span>
              <span>{label}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })()}

      {/* Fix Verification Progress Bar */}
      {post.civic_status === "claimed_fixed" && (() => {
        const count = post.citizen_fixed_count || 0;
        const pct = Math.min((count / 3) * 100, 100);
        const barColor = count >= 3 ? "bg-green-500" : "bg-teal-500";
        const label = count >= 3
          ? T("✓ Verified Fixed", "✓ சரி செய்யப்பட்டது சரிபார்க்கப்பட்டது")
          : T(`${count}/3 — ${3 - count} more confirmation${3 - count !== 1 ? "s" : ""} needed to close case`, `${count}/3 — வழக்கை முடிக்க ${3 - count} உறுதிப்படுத்தல் தேவை`);
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium">{T("Fix Verification", "சரிசெய்தல் சரிபார்ப்பு")}</span>
              <span>{label}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })()}

      <div className="flex flex-wrap gap-2">
        {/* Confirm / Verify */}
        <ActionBtn
          onClick={handleVerify}
          icon={CheckCircle}
          label={T(`I confirm this issue (${post.verification_count || 0})`, `இதை உறுதிப்படுத்துகிறேன் (${post.verification_count || 0})`)}
          doneLabel={T(`Confirmed (${post.verification_count || 0})`, `உறுதிப்படுத்தப்பட்டது (${post.verification_count || 0})`)}
          isDone={done.verify}
          loadKey="verify"
          color="blue"
        />

        {/* Mark duplicate */}
        <ActionBtn
          onClick={handleDuplicate}
          icon={Copy}
          label={T("Mark as duplicate", "நகல் என குறிக்கவும்")}
          doneLabel={T("Duplicate reported", "நகல் புகாரளிக்கப்பட்டது")}
          isDone={done.duplicate}
          loadKey="dup"
          color="slate"
        />

        {/* If claimed_fixed: confirm fixed / still not fixed */}
        {post.civic_status === "claimed_fixed" && (
          <>
            <ActionBtn
              onClick={handleCitizenVerifiedFixed}
              icon={CheckCircle}
              label={T("Yes, it is fixed!", "ஆம், சரி செய்யப்பட்டது!")}
              doneLabel={T("Fixed confirmed", "சரி செய்யப்பட்டது உறுதிப்படுத்தப்பட்டது")}
              isDone={done.citizen_verified_fixed}
              loadKey="cvfixed"
              color="green"
            />
            <ActionBtn
              onClick={handleStillNotFixed}
              icon={AlertTriangle}
              label={T("Still not fixed", "இன்னும் சரி செய்யப்படவில்லை")}
              doneLabel={T("Reported not fixed", "சரி செய்யப்படவில்லை புகாரளிக்கப்பட்டது")}
              isDone={done.still_not_fixed}
              loadKey="notfixed"
              color="red"
            />
          </>
        )}

        {/* Still not fixed (when not in claimed_fixed status) */}
        {post.civic_status !== "claimed_fixed" && post.civic_status !== "citizen_verified_fixed" && (
          <ActionBtn
            onClick={handleStillNotFixed}
            icon={AlertTriangle}
            label={T(`Still not fixed (${post.still_not_fixed_count || 0})`, `இன்னும் சரி செய்யப்படவில்லை (${post.still_not_fixed_count || 0})`)}
            doneLabel={T("You reported this", "நீங்கள் புகாரளித்தீர்கள்")}
            isDone={done.still_not_fixed}
            loadKey="notfixed"
            color="red"
          />
        )}

        {/* Add Follow-up Note */}
        {["complaint_filed", "under_followup", "unresolved_escalated"].includes(post.civic_status) && (
          <ActionBtn
            onClick={() => setShowFollowUpInput((v) => !v)}
            icon={MessageSquareText}
            label={T("Add Follow-up Note", "பின்தொடர் குறிப்பு சேர்")}
            doneLabel={T("Follow-up submitted", "பின்தொடர் சமர்ப்பிக்கப்பட்டது")}
            isDone={done.follow_up}
            loadKey="followup"
            color="orange"
          />
        )}
      </div>

      {/* Follow-up Note Textarea */}
      {showFollowUpInput && !done.follow_up && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {T("Add a follow-up note:", "பின்தொடர் குறிப்பை சேர்க்கவும்:")}
          </p>
          <textarea
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value.slice(0, 280))}
            maxLength={280}
            rows={3}
            placeholder={T("Describe any updates, status changes, or observations…", "புதுப்பிப்புகள், நிலை மாற்றங்கள் அல்லது கவனிப்புகளை விவரிக்கவும்…")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${followUpNote.length >= 260 ? "text-red-500" : "text-slate-400"}`}>
              {followUpNote.length}/280
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowFollowUpInput(false); setFollowUpNote(""); }}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500"
              >
                {T("Cancel", "ரத்து")}
              </button>
              <button
                onClick={handleFollowUp}
                disabled={isLocker("followup") || !followUpNote.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {isLocker("followup") ? <Loader2 className="w-4 h-4 animate-spin" /> : T("Submit Note", "குறிப்பை சமர்ப்பி")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Complaint ID */}
      <div>
        {!showComplaintInput ? (
          <button
            onClick={() => setShowComplaintInput(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-orange-200 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition-all"
          >
            <FileText className="w-4 h-4" />
            {post.official_complaint_id
              ? T(`Complaint Filed: ${post.official_complaint_id}`, `புகார் தாக்கல்: ${post.official_complaint_id}`)
              : T("Add Official Complaint ID", "அதிகாரப்பூர்வ புகார் ID சேர்க்கவும்")}
          </button>
        ) : (
          <div className="flex gap-2 items-center flex-wrap">
            <input
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder={T("e.g. TN/CM/2024/000123", "எ.கா. TN/CM/2024/000123")}
              className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button onClick={() => handleAddComplaint()} disabled={isLocker("complaint")} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium disabled:opacity-50">
              {isLocker("complaint") ? <Loader2 className="w-4 h-4 animate-spin" /> : T("Save", "சேமி")}
            </button>
            <button onClick={() => setShowComplaintInput(false)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500">
              {T("Cancel", "ரத்து")}
            </button>
          </div>
        )}
      </div>

      {/* Claim fixed with photo */}
      {post.civic_status !== "citizen_verified_fixed" && (
        <div>
          {!showFixedUpload ? (
            <button
              onClick={() => done.claim_fixed
                ? toast({ description: T("You already submitted a fixed claim.", "நீங்கள் ஏற்கனவே கோரிக்கை சமர்ப்பித்தீர்கள்.") })
                : setShowFixedUpload(true)
              }
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                done.claim_fixed
                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-default"
                  : "border-teal-200 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 hover:bg-teal-100"
              }`}
            >
              <Camera className="w-4 h-4" />
              {done.claim_fixed
                ? T("Fixed claim submitted ✓", "சரி செய்யப்பட்டது கோரிக்கை சமர்ப்பிக்கப்பட்டது ✓")
                : T("Claim Fixed with Photo", "புகைப்படத்துடன் சரி செய்யப்பட்டதாக கூறவும்")}
            </button>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{T("Upload proof photos:", "ஆதார புகைப்படங்கள் பதிவேற்றவும்:")}</p>
              <MediaUploader onUrlsChange={setFixedPhotos} />
              <div className="flex gap-2 mt-3">
                <button onClick={handleClaimFixed} disabled={isLocker("fixed") || !fixedPhotos.length} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                  {isLocker("fixed") ? <Loader2 className="w-4 h-4 animate-spin" /> : T("Submit Proof", "ஆதாரம் சமர்ப்பி")}
                </button>
                <button onClick={() => setShowFixedUpload(false)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500">
                  {T("Cancel", "ரத்து")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
      >
        <Share2 className="w-4 h-4" />
        {T("Share Civic Receipt", "குடிமை ரசீதை பகிர்")}
      </button>
    </div>
  );
}