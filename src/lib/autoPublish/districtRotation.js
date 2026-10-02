/**
 * District rotation schedule for VizhiTN's daily auto-publish engine.
 * Follows the GEMINI.md editorial constitution exactly.
 *
 * Returns the ordered list of district slugs to cover for a given date.
 */

// 0 = Sunday, 1 = Monday, ..., 6 = Saturday
const ROTATION = {
  1: ['chennai', 'coimbatore', 'madurai', 'tiruvallur', 'chengalpattu', 'kancheepuram', 'ranipet'],
  2: ['tiruchirappalli', 'salem', 'vellore', 'namakkal', 'perambalur', 'ariyalur', 'kallakurichi'],
  3: ['erode', 'tirunelveli', 'thoothukudi', 'karur', 'nilgiris', 'coimbatore', 'tiruppur'],
  4: ['thanjavur', 'dindigul', 'kancheepuram', 'nagapattinam', 'mayiladuthurai', 'tiruvarur', 'pudukkottai'],
  5: ['namakkal', 'dharmapuri', 'cuddalore', 'krishnagiri', 'villupuram', 'kallakurichi', 'salem'],
};

// Weekend rotation for the Friday evening railway/water batch
const WEEKEND_ROTATION = ['chennai', 'coimbatore', 'madurai', 'tiruvallur', 'chengalpattu', 'tiruchirappalli'];

/**
 * Get today's district slugs for the daily morning content batch.
 * @param {Date} [date] - Defaults to now (IST-aware).
 * @returns {string[]} Array of district slugs.
 */
export function getTodayDistricts(date) {
  const d = date || new Date();
  // Convert to IST: UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(d.getTime() + istOffset);
  const dayOfWeek = istDate.getUTCDay(); // 0-6

  return ROTATION[dayOfWeek] || ROTATION[1]; // Fallback to Monday if weekend
}

/**
 * Get districts for the weekend / Friday evening batch (railway + SETC).
 * @returns {string[]}
 */
export function getWeekendDistricts() {
  return WEEKEND_ROTATION;
}

/**
 * Returns a human-readable date string for IST today.
 * @param {Date} [date]
 * @returns {string} e.g. "2 Oct 2026"
 */
export function getISTDateLabel(date) {
  const d = date || new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(d.getTime() + istOffset);
  return istDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Returns today's date in YYYY-MM-DD for IST.
 * Used for slug generation and deduplication.
 * @param {Date} [date]
 * @returns {string} e.g. "2026-10-02"
 */
export function getISTDateSlug(date) {
  const d = date || new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(d.getTime() + istOffset);
  const yyyy = istDate.getUTCFullYear();
  const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
