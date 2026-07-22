export function getLatestReportDate(reports = []) {
  let latestTimestamp = 0;

  for (const report of reports) {
    const value = report?.updated_date || report?.created_date;
    const timestamp = value ? Date.parse(value) : NaN;
    if (Number.isFinite(timestamp) && timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
    }
  }

  return latestTimestamp ? new Date(latestTimestamp).toISOString() : null;
}

export function formatReportDate(value) {
  const timestamp = value ? Date.parse(value) : NaN;
  if (!Number.isFinite(timestamp)) return '';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(timestamp));
}
