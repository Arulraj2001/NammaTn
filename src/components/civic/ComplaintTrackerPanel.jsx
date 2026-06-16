import React, { useState } from "react";
import { FileText, Camera, MessageSquare, CheckCircle, Loader2, ChevronDown, ChevronUp, AlertTriangle, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { makeTimelineEvent } from "@/lib/civicReceipt";
import { getDepartmentRoute, generateFollowUpMessage, generateEscalationMessage, getEscalationLevel } from "@/lib/departmentRouting";
import MediaUploader from "@/components/media/MediaUploader";

export default function ComplaintTrackerPanel({ post, onRefresh }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { toast } = useToast();
  const qc = useQueryClient();

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);

  const [form, setForm] = useState({
    official_complaint_id: post.official_complaint_id || "",
    complaint_filed_date: "",
    department_name: getDepartmentRoute(post.category_slug).department,
    complaint_link: "",
    notes: "",
  });
  const [screenshots, setScreenshots] = useState([]);
  const [followUpNote, setFollowUpNote] = useState("");
  const [newScreenshots, setNewScreenshots] = useState([]);

  const route = getDepartmentRoute(post.category_slug);
  const escalation = getEscalationLevel(post);
  const daysOpen = post.created_date
    ? Math.floor((Date.now() - new Date(post.created_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const doUpdate = async (data, eventText, event_type = "status_change") => {
    const currentTimeline = Array.isArray(post.timeline_events) ? post.timeline_events : [];
    const newTimeline = [...currentTimeline, makeTimelineEvent(eventText, "Community Member", event_type, "user")];
    await base44.entities.Post.update(post.id, { ...data, timeline_events: newTimeline });
    qc.invalidateQueries({ queryKey: ["post", post.id] });
    onRefresh?.();
    toast({ description: eventText });
  };

  const handleSubmitComplaint = async () => {
    if (!form.official_complaint_id.trim()) {
      toast({ description: T("Please enter a complaint ID.", "புகார் ID உள்ளிடவும்."), variant: "destructive" });
      return;
    }
    setLoading("complaint");
    const screenshotUrls = screenshots.length ? screenshots : [];
    await doUpdate(
      {
        official_complaint_id: form.official_complaint_id.trim(),
        civic_status: "complaint_filed",
        assigned_department: form.department_name,
        ...(screenshotUrls.length && { claimed_fixed_photos: [...(post.claimed_fixed_photos || []), ...screenshotUrls] }),
      },
      T(
        `Official complaint filed with ${form.department_name} on ${form.complaint_filed_date || "today"}. Complaint ID: ${form.official_complaint_id.trim()}.`,
        `${form.department_name}-ல் ${form.complaint_filed_date || "இன்று"} அதிகாரப்பூர்வ புகார் தாக்கல். ID: ${form.official_complaint_id.trim()}.`
      ),
      "complaint_filed"
    );
    // Also save to ComplaintTracker
    await base44.entities.ComplaintTracker.create({
      post_id: post.id,
      civic_receipt_id: post.civic_receipt_id || "",
      ...form,
      screenshot_url: screenshotUrls[0] || "",
    });
    setShowForm(false);
    setLoading(null);
  };

  const handleFollowUp = async () => {
    setLoading("followup");
    const note = followUpNote.trim() || T("Follow-up added by community member", "சமுதாய உறுப்பினரால் தொடர் சேர்க்கப்பட்டது");
    await doUpdate(
      { civic_status: "under_followup" },
      T(`Follow-up: ${note}`, `தொடர்: ${note}`),
      "follow_up"
    );
    setFollowUpNote("");
    setShowFollowUp(false);
    setLoading(null);
  };

  const handleAddScreenshot = async () => {
    if (!newScreenshots.length) return;
    setLoading("screenshot");
    const existing = post.claimed_fixed_photos || [];
    await doUpdate(
      { claimed_fixed_photos: [...existing, ...newScreenshots] },
      T("New screenshot/proof added", "புதிய ஸ்கிரீன்ஷாட்/ஆதாரம் சேர்க்கப்பட்டது")
    );
    setNewScreenshots([]);
    setShowScreenshot(false);
    setLoading(null);
  };

  const handleResponseReceived = async () => {
    setLoading("response");
    await doUpdate(
      { civic_status: "under_followup" },
      T("Response received from department — still monitoring", "துறையிலிருந்து பதில் வந்தது — இன்னும் கண்காணிக்கிறோம்")
    );
    setLoading(null);
  };

  const handleStillUnresolved = async () => {
    setLoading("unresolved");
    await doUpdate(
      { civic_status: "unresolved_escalated", still_not_fixed_count: (post.still_not_fixed_count || 0) + 1 },
      T("Marked as still unresolved — escalation recommended", "இன்னும் தீர்க்கப்படவில்லை — மேல்முறையீடு பரிந்துரைக்கப்படுகிறது")
    );
    setLoading(null);
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({ description: `${label} ${T("copied!", "நகலெடுக்கப்பட்டது!")}` });
  };

  const escalationColors = { green: "text-green-600", indigo: "text-indigo-600", blue: "text-blue-600", orange: "text-orange-500", red: "text-red-600", slate: "text-slate-500" };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {T("Complaint & Follow-up Tracker", "புகார் & தொடர் கண்காணிப்பு")}
            </p>
            <p className={`text-xs font-medium ${escalationColors[escalation.color] || "text-slate-500"}`}>
              {T("Level", "நிலை")} {escalation.level}: {escalation.label} · {daysOpen} {T("days open", "நாட்கள் திறந்தது")}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">

          {/* Escalation Level Indicator */}
          <div className="grid grid-cols-6 gap-1">
            {[0, 1, 2, 3, 4, 5].map((lvl) => (
              <div key={lvl} className="flex flex-col items-center gap-1">
                <div className={`h-2 rounded-full w-full ${lvl <= escalation.level ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-600"}`} />
                <span className="text-[10px] text-slate-400 text-center leading-tight hidden sm:block">L{lvl}</span>
              </div>
            ))}
          </div>

          {/* Follow-up/Escalation alerts */}
          {(escalation.level >= 3) && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
              escalation.level >= 4 ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
              : "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400"
            }`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {escalation.level >= 4
                    ? T("Escalation Recommended", "மேல்முறையீடு பரிந்துரைக்கப்படுகிறது")
                    : T("Follow-up Recommended", "தொடர் பரிந்துரைக்கப்படுகிறது")}
                </p>
                <p className="mt-0.5 opacity-80">{route.escalation_instructions}</p>
              </div>
            </div>
          )}

          {/* Current complaint status */}
          {post.official_complaint_id && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs">
              <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">{T("Complaint on Record", "பதிவில் உள்ள புகார்")}</p>
              <p className="text-slate-600 dark:text-slate-400">{T("ID:", "ID:")} <span className="font-mono font-bold">{post.official_complaint_id}</span></p>
              {post.assigned_department && <p className="text-slate-500">{T("Dept:", "துறை:")} {post.assigned_department}</p>}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Add complaint ID */}
            <button
              onClick={() => setShowForm((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-orange-200 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              {post.official_complaint_id ? T("Update Complaint ID", "புகார் ID புதுப்பி") : T("Add Complaint ID", "புகார் ID சேர்")}
            </button>

            {/* Copy follow-up */}
            <button
              onClick={() => copyText(generateFollowUpMessage(post, route), T("Follow-up message", "தொடர் செய்தி"))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {T("Copy Follow-up", "தொடர் நகலெடு")}
            </button>

            {/* Copy escalation */}
            {escalation.level >= 3 && (
              <button
                onClick={() => copyText(generateEscalationMessage(post, route), T("Escalation message", "மேல்முறையீடு செய்தி"))}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-red-200 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {T("Copy Escalation", "மேல்முறையீடு நகலெடு")}
              </button>
            )}

            {/* Add follow-up note */}
            <button
              onClick={() => setShowFollowUp((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {T("Add Follow-up Note", "தொடர் குறிப்பு சேர்")}
            </button>

            {/* Add screenshot */}
            <button
              onClick={() => setShowScreenshot((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              {T("Add Screenshot", "ஸ்கிரீன்ஷாட் சேர்")}
            </button>
          </div>

          {/* Response/unresolved buttons */}
          {(post.civic_status === "complaint_filed" || post.civic_status === "under_followup") ? (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleResponseReceived}
                disabled={loading === "response"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-green-200 bg-green-50 dark:bg-green-900/20 text-green-700 hover:bg-green-100 transition-all disabled:opacity-50"
              >
                {loading === "response" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {T("Response Received", "பதில் வந்தது")}
              </button>
              <button
                onClick={handleStillUnresolved}
                disabled={loading === "unresolved"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-red-200 bg-red-50 dark:bg-red-900/20 text-red-700 hover:bg-red-100 transition-all disabled:opacity-50"
              >
                {loading === "unresolved" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {T("Still Unresolved", "இன்னும் தீர்க்கப்படவில்லை")}
              </button>
            </div>
          ) : null}

          {/* Add complaint ID form */}
          {showForm && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-slate-600">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{T("Record Official Complaint", "அதிகாரப்பூர்வ புகாரை பதிவு செய்யவும்")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{T("Complaint ID *", "புகார் ID *")}</label>
                  <input value={form.official_complaint_id} onChange={(e) => setForm(f => ({ ...f, official_complaint_id: e.target.value }))}
                    placeholder="e.g. TN/CM/2024/123456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{T("Filed Date", "தாக்கல் தேதி")}</label>
                  <input type="date" value={form.complaint_filed_date} onChange={(e) => setForm(f => ({ ...f, complaint_filed_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-800 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{T("Department", "துறை")}</label>
                  <input value={form.department_name} onChange={(e) => setForm(f => ({ ...f, department_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-800 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{T("Complaint Link (optional)", "புகார் இணைப்பு (விருப்பம்)")}</label>
                  <input value={form.complaint_link} onChange={(e) => setForm(f => ({ ...f, complaint_link: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-800 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{T("Notes (optional)", "குறிப்புகள் (விருப்பம்)")}</label>
                <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder={T("Any additional details about your complaint...", "புகாரைப் பற்றிய கூடுதல் விவரங்கள்...")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-800 focus:outline-none resize-none" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{T("Upload complaint screenshot (optional)", "புகார் ஸ்கிரீன்ஷாட் பதிவேற்று (விருப்பம்)")}</p>
                <MediaUploader onUrlsChange={setScreenshots} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSubmitComplaint} disabled={loading === "complaint"}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-medium disabled:opacity-50 flex items-center gap-1.5">
                  {loading === "complaint" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {T("Save Complaint Record", "புகார் பதிவை சேமி")}
                </button>
                <button onClick={() => setShowForm(false)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500">{T("Cancel", "ரத்து")}</button>
              </div>
            </div>
          )}

          {/* Follow-up note form */}
          {showFollowUp && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-2 border border-slate-200 dark:border-slate-600">
              <textarea value={followUpNote} onChange={(e) => setFollowUpNote(e.target.value)}
                rows={2} placeholder={T("What happened? Any update from the department?", "என்ன நடந்தது? துறையிலிருந்து ஏதும் புதுப்பிப்பு?")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-800 focus:outline-none resize-none" />
              <div className="flex gap-2">
                <button onClick={handleFollowUp} disabled={loading === "followup"}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium disabled:opacity-50 flex items-center gap-1.5">
                  {loading === "followup" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {T("Add Note", "குறிப்பு சேர்")}
                </button>
                <button onClick={() => setShowFollowUp(false)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500">{T("Cancel", "ரத்து")}</button>
              </div>
            </div>
          )}

          {/* Screenshot upload */}
          {showScreenshot && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-2 border border-slate-200 dark:border-slate-600">
              <p className="text-xs text-slate-600 dark:text-slate-300">{T("Upload new evidence screenshot:", "புதிய ஆதார ஸ்கிரீன்ஷாட் பதிவேற்று:")}</p>
              <MediaUploader onUrlsChange={setNewScreenshots} />
              <div className="flex gap-2">
                <button onClick={handleAddScreenshot} disabled={loading === "screenshot" || !newScreenshots.length}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium disabled:opacity-50 flex items-center gap-1.5">
                  {loading === "screenshot" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  {T("Upload", "பதிவேற்று")}
                </button>
                <button onClick={() => setShowScreenshot(false)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500">{T("Cancel", "ரத்து")}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}