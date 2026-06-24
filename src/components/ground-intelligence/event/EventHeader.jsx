'use client';

import { useState, useCallback } from 'react';
import { MapPin, Clock, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { STATUS_CONFIG, SEVERITY_CONFIG, BORDER_BY_SEVERITY, LIVE_STATUSES } from './statusHelpers';

const CATEGORY_EMOJIS = {
  flooding:       '🌊',
  water_supply:   '💧',
  power_failure:  '⚡',
  road_damage:    '🛣️',
  tree_fallen:    '🌳',
  accident:       '🚨',
  fire:           '🔥',
  traffic:        '🚦',
  hospital_crowd: '🏥',
  office_closure: '🏢',
  public_safety:  '🛡️',
  scam_activity:  '⚠️',
  crowd:          '👥',
  festival:       '🎉',
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '—';
  }
}

export default function EventHeader({ event }) {
  const [copied, setCopied] = useState(false);

  const statusCfg   = STATUS_CONFIG[event?.status]   || STATUS_CONFIG.reported;
  const severityCfg = SEVERITY_CONFIG[event?.severity] || SEVERITY_CONFIG.moderate;
  const borderCls   = BORDER_BY_SEVERITY[event?.severity] || 'border-l-amber-500';
  const isLive      = LIVE_STATUSES.includes(event?.status);
  const categoryEmoji = CATEGORY_EMOJIS[event?.category_slug] || '📍';

  const handleCopyCode = useCallback(() => {
    if (!event?.event_code) return;
    navigator.clipboard.writeText(event.event_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [event?.event_code]);

  if (!event) return null;

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 ${borderCls} p-4 mb-3`}>
      {/* Status + Severity row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusCfg.color}`}>
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusCfg.dot} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusCfg.dot}`} />
            </span>
          )}
          {!isLive && (
            <span className={`inline-block h-2 w-2 rounded-full ${statusCfg.dot}`} />
          )}
          {statusCfg.label}
        </span>

        {/* Severity badge */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${severityCfg.color}`}>
          {severityCfg.label}
        </span>
      </div>

      {/* Event code */}
      <button
        onClick={handleCopyCode}
        className="inline-flex items-center gap-1.5 mb-2 font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95"
        title="Copy event code"
      >
        <span>{event.event_code || 'GI-TN-2026-0000'}</span>
        {copied
          ? <Check size={11} className="text-green-500" />
          : <Copy size={11} />}
      </button>

      {/* Title */}
      <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug mb-2">
        {event.title}
      </h1>

      {/* Category tag */}
      {event.category_slug && (
        <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded mb-3">
          <span>{categoryEmoji}</span>
          <span className="capitalize">{(event.category_slug || '').replace(/_/g, ' ')}</span>
        </div>
      )}

      {/* Location */}
      {(event.area_name || event.district_name) && (
        <div className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
          <span>
            {[event.area_name, event.district_name].filter(Boolean).join(', ')}
          </span>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
          <Clock size={11} />
          <span>Created {timeAgo(event.created_at)}</span>
        </div>
        {event.updated_at && event.updated_at !== event.created_at && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
            <Clock size={11} />
            <span>Updated {timeAgo(event.updated_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
