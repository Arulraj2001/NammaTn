/**
 * NammaTN Receipt Credibility Score
 *
 * Computes a weighted credibility score from four independent signals:
 *   - Community verification count
 *   - Evidence quality (photos, GPS, description, location text)
 *   - Author trust score (passed in)
 *   - Official complaint traction (complaint count + screenshot proof)
 *
 * Also exports a Fix Confidence calculator for claimed-fixed disputes.
 */

/**
 * @param {object}  post              - The civic receipt post object
 * @param {number}  authorTrustScore  - Author's platform trust score (0-100)
 * @param {number}  complaintCount    - Number of official complaints filed for this issue
 * @param {boolean} hasScreenshot     - Whether a complaint screenshot has been uploaded
 * @returns {{ total: number, verification: number, evidence: number, author: number, complaint: number, breakdown: object }}
 */
export function computeReceiptCredibility(post, authorTrustScore = 0, complaintCount = 0, hasScreenshot = false) {
  // --- Verification Score (0-100) ---
  const verificationCount = post.verification_count || 0;
  const verification = Math.min((verificationCount / 5) * 100, 100);

  // --- Evidence Score (0-100) ---
  const hasPhotos = Array.isArray(post.photos) && post.photos.length > 0;
  const hasGps = !!(post.latitude && post.longitude);
  const hasDescription = typeof post.content_en === "string" && post.content_en.length >= 50;
  const hasLocationText = !!post.location_text;

  const evidence =
    (hasPhotos ? 25 : 0) +
    (hasGps ? 25 : 0) +
    (hasDescription ? 25 : 0) +
    (hasLocationText ? 25 : 0);

  // --- Author Score (0-100) ---
  const author = Math.max(0, Math.min(Number(authorTrustScore) || 0, 100));

  // --- Complaint Score (0-100) ---
  const complaint = Math.min(
    (complaintCount / 2) * 50 + (hasScreenshot ? 50 : 0),
    100,
  );

  // --- Weighted Total ---
  const total = Math.round(
    0.35 * verification +
    0.25 * evidence +
    0.15 * author +
    0.25 * complaint,
  );

  return {
    total,
    verification: Math.round(verification),
    evidence: Math.round(evidence),
    author: Math.round(author),
    complaint: Math.round(complaint),
    breakdown: {
      verificationCount,
      hasPhotos,
      hasGps,
      hasDescription,
      hasLocationText,
      complaintCount,
      hasScreenshot,
    },
  };
}

/**
 * Compute citizen-driven fix confidence for a claimed-fixed post.
 *
 * @param {object} post
 * @returns {{ percentage: number, confirmed: number, disputed: number }}
 */
export function computeFixConfidence(post) {
  const confirmed = post.citizen_fixed_count || 0;
  const disputed = post.still_not_fixed_count || 0;
  const total = confirmed + disputed;

  const percentage = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return { percentage, confirmed, disputed };
}
