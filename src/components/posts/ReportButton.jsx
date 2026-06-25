import React, { useState, useEffect } from "react";
import { Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/services/admin/reports";
import { useToast } from "@/components/ui/use-toast";
import { getSessionId } from "@/lib/security";
import { base44 } from "@/api/base44Client";

const REASONS = [
  { value: "spam", label: "Spam / Irrelevant" },
  { value: "fake_issue", label: "Fake / False Issue" },
  { value: "personal_attack", label: "Personal Attack / Harassment" },
  { value: "private_info", label: "Private / Personal Information" },
  { value: "hate_speech", label: "Hate / Caste / Religion Content" },
  { value: "scam_fraud", label: "Scam / Fraud" },
  { value: "wrong_category", label: "Wrong Category / District" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
];

/**
 * Checks if this session/user already reported this target.
 */
async function checkAlreadyReported(targetId, targetType, actorId) {
  try {
    const existing = await base44.entities.Report.filter({
      target_id: targetId,
      target_type: targetType,
      reporter_session: actorId,
    }, "-created_date", 1);
    return existing.length > 0;
  } catch {
    return false;
  }
}

export default function ReportButton({ targetType, targetId, compact = false }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const { toast } = useToast();
  const actorId = getSessionId();

  // Check localStorage first for fast feedback
  useEffect(() => {
    const key = `tn_reported_${actorId}_${targetType}_${targetId}`;
    if (localStorage.getItem(key)) setAlreadyReported(true);
  }, [targetId, targetType, actorId]);

  const handleOpen = async () => {
    if (alreadyReported) {
      toast({ description: "You already reported this content." });
      return;
    }
    // DB check on open
    const existing = await checkAlreadyReported(targetId, targetType, actorId);
    if (existing) {
      setAlreadyReported(true);
      localStorage.setItem(`tn_reported_${actorId}_${targetType}_${targetId}`, "1");
      toast({ description: "You already reported this content." });
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await createReport({
      target_type: targetType,
      target_id: targetId,
      reason,
      details,
      reporter_session: actorId,
    });
    // Mark in localStorage
    localStorage.setItem(`tn_reported_${actorId}_${targetType}_${targetId}`, "1");
    setAlreadyReported(true);
    setLoading(false);
    setDone(true);
    toast({ description: "Report submitted. Our team will review it." });
    setTimeout(() => { setOpen(false); setDone(false); }, 1500);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`flex items-center gap-1 text-xs transition-colors ${
          alreadyReported
            ? "text-red-400 cursor-default"
            : "text-slate-400 hover:text-red-500"
        }`}
        title={alreadyReported ? "Already reported" : "Report this content"}
      >
        <Flag className="w-3 h-3" />
        {compact ? "" : alreadyReported ? "Reported" : "Report"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
          </DialogHeader>
          {done ? (
            <p className="text-center text-green-600 py-4 text-sm">✓ Report submitted. Thank you for keeping VizhiTN safe!</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Select the reason that best describes the problem.</p>
              <div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {REASONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg px-2 py-1">
                      <input
                        type="radio"
                        name="report-reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="text-red-600 flex-shrink-0"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Additional details (optional)</label>
                <Textarea
                  placeholder="Describe the issue..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={500}
                  rows={2}
                />
              </div>
            </div>
          )}
          {!done && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}