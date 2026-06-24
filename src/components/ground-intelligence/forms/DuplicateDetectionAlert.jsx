'use client';

import { Users, Camera, Clock } from 'lucide-react';

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function DuplicateCard({ event, onJoinExisting }) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-start justify-between gap-2">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          {/* Event code */}
          <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400 tracking-wide uppercase">
            {event.event_code || `GI-TN-EVENT`}
          </span>
          {/* Title */}
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 leading-snug line-clamp-2">
            {event.title}
          </p>
          {/* Stats row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Users className="w-3 h-3" />
              {event.witness_count ?? 0} witness{(event.witness_count ?? 0) !== 1 ? 'es' : ''}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Camera className="w-3 h-3" />
              {event.evidence_count ?? 0} evidence
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              {event.created_at ? timeAgo(event.created_at) : '—'}
            </span>
            {event.area_name && (
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {event.area_name}
                {event.district_name ? `, ${event.district_name}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Right: Join button */}
        <button
          type="button"
          onClick={() => onJoinExisting(event.id)}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 whitespace-nowrap"
        >
          Join This Event
        </button>
      </div>
    </div>
  );
}

export default function DuplicateDetectionAlert({
  duplicates = [],
  onJoinExisting,
  onContinueAnyway,
}) {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-xl border-2 border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 overflow-hidden"
    >
      {/* Alert header */}
      <div className="px-4 py-3 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-300 dark:border-amber-700">
        <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
          ⚠️ Similar Events Nearby
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 leading-snug">
          We found{' '}
          <span className="font-semibold">
            {duplicates.length} similar event{duplicates.length !== 1 ? 's' : ''}
          </span>{' '}
          in this area in the last 6 hours. Consider joining an existing event instead of creating a duplicate.
        </p>
      </div>

      {/* Duplicate cards */}
      <div className="px-4 py-3 space-y-2">
        {duplicates.map((event) => (
          <DuplicateCard
            key={event.id}
            event={event}
            onJoinExisting={onJoinExisting}
          />
        ))}
      </div>

      {/* Continue anyway */}
      <div className="px-4 pb-4 pt-1 flex justify-center">
        <button
          type="button"
          onClick={onContinueAnyway}
          className="text-xs text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 rounded px-1"
        >
          Continue Creating New Event Anyway →
        </button>
      </div>
    </div>
  );
}
