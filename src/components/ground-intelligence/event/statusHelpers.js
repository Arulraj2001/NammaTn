export const STATUS_CONFIG = {
  reported:            { label: 'LIVE',       color: 'bg-red-500 text-white',          dot: 'bg-red-400', border: 'border-red-400' },
  evidence_added:      { label: 'LIVE',       color: 'bg-red-500 text-white',          dot: 'bg-red-400', border: 'border-red-400' },
  witnesses_joined:    { label: 'LIVE',       color: 'bg-orange-500 text-white',       dot: 'bg-orange-400', border: 'border-orange-400' },
  community_verified:  { label: 'VERIFIED',   color: 'bg-blue-600 text-white',         dot: 'bg-blue-400', border: 'border-blue-400' },
  situation_updated:   { label: 'UPDATED',    color: 'bg-purple-600 text-white',       dot: 'bg-purple-400', border: 'border-purple-400' },
  resolved:            { label: 'RESOLVED',   color: 'bg-green-600 text-white',        dot: 'bg-green-400', border: 'border-green-400' },
  archived:            { label: 'ARCHIVED',   color: 'bg-slate-500 text-white',        dot: 'bg-slate-400', border: 'border-slate-400' },
};

export const SEVERITY_CONFIG = {
  minor:    { label: 'Minor',    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', bar: 'bg-slate-400' },
  moderate: { label: 'Moderate', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', bar: 'bg-amber-500' },
  major:    { label: 'Major',    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', bar: 'bg-orange-500' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', bar: 'bg-red-600' },
};

export const BORDER_BY_SEVERITY = {
  minor:    'border-l-slate-400',
  moderate: 'border-l-amber-500',
  major:    'border-l-orange-500',
  critical: 'border-l-red-600',
};

// Status groups for quick checks
export const LIVE_STATUSES = ['reported', 'evidence_added', 'witnesses_joined', 'situation_updated'];
export const CLOSED_STATUSES = ['resolved', 'archived'];
