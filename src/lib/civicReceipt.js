/**
 * VizhiTN Civic Receipt utilities
 */

export const CIVIC_STATUSES = [
  {
    key: "reported",
    label: "Reported on VizhiTN",
    label_ta: "VizhiTN-ல் புகாரளிக்கப்பட்டது",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    dot: "bg-blue-500",
    step: 1,
    description: "Issue has been documented and is publicly visible.",
    description_ta: "சிக்கல் ஆவணப்படுத்தப்பட்டு பொதுவில் தெரியும்.",
  },
  {
    key: "community_verified",
    label: "Community Verified",
    label_ta: "சமுதாயம் சரிபார்த்தது",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    dot: "bg-indigo-500",
    step: 2,
    description: "Multiple citizens have confirmed this issue exists.",
    description_ta: "பல குடிமக்கள் இந்த சிக்கல் உள்ளதை உறுதிப்படுத்தியுள்ளனர்.",
  },
  {
    key: "complaint_needed",
    label: "Official Complaint Needed",
    label_ta: "அதிகாரப்பூர்வ புகார் தேவை",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    dot: "bg-orange-400",
    step: 3,
    description: "Community verified — file an official complaint to proceed.",
    description_ta: "சமுதாயம் சரிபார்த்தது — தொடர அதிகாரப்பூர்வ புகார் தாக்கல் செய்யவும்.",
  },
  {
    key: "complaint_filed",
    label: "Official Complaint Filed",
    label_ta: "அதிகாரப்பூர்வ புகார் தாக்கல்",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    dot: "bg-amber-500",
    step: 4,
    description: "An official complaint has been filed with the relevant department.",
    description_ta: "சம்பந்தப்பட்ட துறையில் அதிகாரப்பூர்வ புகார் தாக்கல் செய்யப்பட்டுள்ளது.",
  },
  {
    key: "under_followup",
    label: "Under Follow-up",
    label_ta: "தொடர் கண்காணிப்பில்",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    dot: "bg-yellow-500",
    step: 5,
    description: "Complaint filed — actively following up with department.",
    description_ta: "புகார் தாக்கல் — துறையுடன் தீவிரமாக தொடர்பில் உள்ளோம்.",
  },
  {
    key: "claimed_fixed",
    label: "Claimed Fixed",
    label_ta: "சரி செய்யப்பட்டதாக கூறப்படுகிறது",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    dot: "bg-teal-400",
    step: 6,
    description: "Someone claims this issue is fixed — awaiting citizen verification.",
    description_ta: "யாரோ இந்த சிக்கல் சரி செய்யப்பட்டதாக கூறுகிறார்கள் — குடிமக்கள் சரிபார்ப்பு காத்திருக்கிறது.",
  },
  {
    key: "citizen_verified_fixed",
    label: "Citizen Verified Fixed ✓",
    label_ta: "குடிமக்களால் சரிபார்க்கப்பட்டது ✓",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    dot: "bg-green-500",
    step: 7,
    description: "Multiple citizens confirmed this issue is resolved.",
    description_ta: "பல குடிமக்கள் இந்த சிக்கல் தீர்க்கப்பட்டதை உறுதிப்படுத்தியுள்ளனர்.",
  },
  {
    key: "unresolved_escalated",
    label: "Unresolved / Escalated",
    label_ta: "தீர்க்கப்படவில்லை / மேல்முறையீடு",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    dot: "bg-red-500",
    step: 8,
    description: "Issue remains unresolved — escalation to higher authority recommended.",
    description_ta: "சிக்கல் தீர்க்கப்படவில்லை — உயர் அதிகாரிகளுக்கு மேல்முறையீடு பரிந்துரைக்கப்படுகிறது.",
  },
  {
    key: "community_solved",
    label: "Community Solved",
    label_ta: "சமுதாயம் தீர்த்தது",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    dot: "bg-emerald-500",
    step: 9,
    description: "This issue was resolved through community action.",
    description_ta: "இந்த சிக்கல் சமுதாய நடவடிக்கை மூலம் தீர்க்கப்பட்டது.",
  },
  {
    key: "duplicate_invalid",
    label: "Duplicate / Invalid",
    label_ta: "நகல் / செல்லாதது",
    color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
    step: 10,
    description: "Marked as duplicate or invalid by admin review.",
    description_ta: "நிர்வாக மதிப்பாய்வு மூலம் நகல் அல்லது செல்லாதது என குறிக்கப்பட்டது.",
  },
];

export const getCivicStatus = (key) =>
  CIVIC_STATUSES.find((s) => s.key === key) || CIVIC_STATUSES[0];

export const URGENCY_LEVELS = [
  { key: "low", label: "Low", label_ta: "குறைந்த", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800" },
  { key: "medium", label: "Medium", label_ta: "நடுத்தர", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  { key: "high", label: "High", label_ta: "அதிக", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { key: "critical", label: "Critical 🚨", label_ta: "மிக அவசரம் 🚨", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
];

export const getUrgency = (key) =>
  URGENCY_LEVELS.find((u) => u.key === key) || URGENCY_LEVELS[1];

/**
 * Generate a civic receipt ID.
 * Uses current timestamp + random suffix to minimize collisions.
 * Format: TN-XXXXXX
 */
export const generateCivicReceiptId = () => {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `TN-${ts}${rand}`;
};

export const isCivicPost = (post) =>
  post?.post_type === "complaint" || post?.post_type === "alert" || !!post?.civic_receipt_id;

export const getDaysOpen = (createdDate) => {
  if (!createdDate) return 0;
  const diff = Date.now() - new Date(createdDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Create a timeline event object.
 * @param {string} event - Human-readable event description
 * @param {string} by - Actor name/label
 * @param {string} event_type - Machine type for icon selection (optional)
 * @param {string} actor_type - 'user' | 'admin' | 'system'
 */
export const makeTimelineEvent = (event, by = "VizhiTN", event_type = "status_change", actor_type = "user") => ({
  event,
  event_type,
  timestamp: new Date().toISOString(),
  by,
  actor_type,
});

/**
 * Safe status transition: compute the next status given current data.
 * Used by CivicReceiptActions to auto-advance status correctly.
 */
export const computeNextStatus = (post, action) => {
  const current = post.civic_status || "reported";

  switch (action) {
    case "verify": {
      const newCount = (post.verification_count || 0) + 1;
      // Only advance if still at "reported" — do not downgrade or bounce from higher statuses
      if (newCount >= 3 && current === "reported") return "community_verified";
      // If community_verified and no complaint yet, nudge to complaint_needed
      if (newCount >= 5 && current === "community_verified" && !post.official_complaint_id) return "complaint_needed";
      return current;
    }
    case "complaint_filed":
      return "complaint_filed";
    case "follow_up":
      return "under_followup";
    case "claim_fixed":
      return "claimed_fixed";
    case "citizen_verified_fixed": {
      const newCount = (post.citizen_fixed_count || 0) + 1;
      return newCount >= 3 ? "citizen_verified_fixed" : current;
    }
    case "still_not_fixed":
      // If claimed_fixed and disputed, go back to under_followup
      return current === "claimed_fixed" ? "under_followup" : current;
    case "escalate":
      return "unresolved_escalated";
    default:
      return current;
  }
};

/**
 * Generate standard complaint message text for copy-pasting to officials.
 */
export const generateComplaintMessage = (post) => {
  const date = post.created_date
    ? new Date(post.created_date).toLocaleDateString("en-IN")
    : "recent date";
  return `Dear Sir/Madam,

I am reporting a civic issue at ${post.location_text || post.area_name || post.district_name}.

Issue: ${post.title_en}

Description: ${post.content_en || ""}

This issue was documented through VizhiTN Civic Receipt ${post.civic_receipt_id || ""} on ${date}.

Kindly inspect and resolve this issue at the earliest. Photo proof is available on VizhiTN platform.

Thank you.`;
};