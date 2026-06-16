import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Flag, LogIn } from "lucide-react";
import { reportListing } from "@/services/stayListings";
import { getSession } from "@/lib/spamGuard";
import { checkRateLimit } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

const REASONS = [
  { value: "fake_listing", label: "Fake Listing" },
  { value: "spam", label: "Spam / Duplicate" },
  { value: "harassment", label: "Harassment" },
  { value: "incorrect_info", label: "Incorrect Information" },
  { value: "suspicious_activity", label: "Suspicious Activity" },
  { value: "other", label: "Other" },
];

export default function StayReportModal({ listing, onClose }) {
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const session = getSession();
    const allowed = checkRateLimit(`stay_report_${session}`, 3, 10 * 60 * 1000);
    if (!allowed) { setBlocked(true); return; }
    await reportListing({ listing_id: listing.id, session_ref: session, reason, details });
    // Increment report count
    await import("@/services/stayListings").then(m => m.updateListing(listing.id, { report_count: (listing.report_count || 0) + 1 }));
    setSubmitted(true);
  };

  return (
    <Dialog open={!!listing} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Flag className="w-4 h-4 text-red-500" /> Report Listing</DialogTitle></DialogHeader>
        {!isAuthenticated ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">Sign in to Report</p>
            <p className="text-xs text-slate-500">You need to be logged in to report a listing.</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => { onClose(); requireAuth(() => {}, "Sign in to report listings"); }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium"
              >
                Sign In / Sign Up
              </button>
              <button onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        ) : submitted ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-semibold text-sm">✓ Report submitted. Thank you!</p>
            <p className="text-xs text-slate-400 mt-1">Our moderators will review this listing.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm">Close</button>
          </div>
        ) : blocked ? (
          <p className="text-sm text-red-500 py-3">Too many reports. Please wait a few minutes.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Reason</label>
              <select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white dark:bg-slate-700 dark:border-slate-600 focus:outline-none">
                {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Details (optional)</label>
              <textarea value={details} onChange={e => setDetails(e.target.value)} rows={2} maxLength={300}
                placeholder="Describe the issue..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">Submit Report</button>
              <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}